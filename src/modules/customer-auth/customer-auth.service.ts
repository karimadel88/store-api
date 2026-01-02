import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Customer } from '../customers/schemas/customer.schema';
import { RegisterCustomerDto, LoginCustomerDto, ForgotPasswordDto, ResetPasswordDto } from './dto/customer-auth.dto';

export interface CustomerJwtPayload {
  sub: string;
  email: string;
  type: 'customer';
}

export interface CustomerTokenResponse {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterCustomerDto): Promise<CustomerTokenResponse> {
    const existing = await this.customerModel.findOne({ email: registerDto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const customer = new this.customerModel({
      ...registerDto,
      password: hashedPassword,
    });
    await customer.save();

    return this.generateTokens(customer);
  }

  async login(loginDto: LoginCustomerDto): Promise<CustomerTokenResponse> {
    const customer = await this.customerModel.findOne({ email: loginDto.email }).exec();
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!customer.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    customer.lastLoginAt = new Date();
    await customer.save();

    return this.generateTokens(customer);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string; token?: string }> {
    const customer = await this.customerModel.findOne({ email: forgotPasswordDto.email }).exec();
    if (!customer) {
      // Don't reveal if email exists
      return { message: 'If email exists, password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    customer.passwordResetToken = hashedToken;
    customer.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await customer.save();

    // TODO: Send email with reset token
    // For now, return token in response (dev/testing only - remove in production)
    return {
      message: 'Password reset token generated',
      token: resetToken, // Remove this in production!
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(resetPasswordDto.token).digest('hex');

    const customer = await this.customerModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).exec();

    if (!customer) {
      throw new BadRequestException('Invalid or expired token');
    }

    customer.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    customer.passwordResetToken = undefined;
    customer.passwordResetExpires = undefined;
    await customer.save();

    return { message: 'Password reset successful' };
  }

  async refreshToken(refreshToken: string): Promise<CustomerTokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'customer') {
        throw new UnauthorizedException('Invalid token type');
      }

      const customer = await this.customerModel.findById(payload.sub).exec();
      if (!customer || !customer.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(customer);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(customer: Customer): CustomerTokenResponse {
    const payload: CustomerJwtPayload = {
      sub: customer._id.toString(),
      email: customer.email,
      type: 'customer',
    };

    const accessToken = this.jwtService.sign(payload as object, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: 900, // 15 minutes
    });

    const refreshToken = this.jwtService.sign(payload as object, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: 604800, // 7 days
    });

    return {
      accessToken,
      refreshToken,
      customer: {
        id: customer._id.toString(),
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }
}
