import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { TransferCustomer } from './schemas/transfer-customer.schema.js';
import {
  RegisterTransferCustomerDto,
  LoginTransferCustomerDto,
} from './dto/transfer-customer.dto.js';

export interface TransferCustomerTokenResponse {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    whatsapp: string;
  };
}

@Injectable()
export class TransferCustomerAuthService {
  constructor(
    @InjectModel(TransferCustomer.name) private customerModel: Model<TransferCustomer>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterTransferCustomerDto): Promise<TransferCustomerTokenResponse> {
    const existing = await this.customerModel.findOne({ phone: dto.phone }).exec();
    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const customer = new this.customerModel({
      name: dto.name,
      phone: dto.phone,
      password: dto.password,
      whatsapp: dto.whatsapp || dto.phone,
    });

    await customer.save();
    return this.generateTokens(customer);
  }

  async login(dto: LoginTransferCustomerDto): Promise<TransferCustomerTokenResponse> {
    const customer = await this.customerModel.findOne({ phone: dto.phone }).exec();
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!customer.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(customer);
  }

  async findById(id: string): Promise<TransferCustomer | null> {
    return this.customerModel.findById(id).select('-password').lean().exec() as unknown as TransferCustomer | null;
  }

  async findAll(): Promise<TransferCustomer[]> {
    return this.customerModel.find().select('-password').sort({ createdAt: -1 }).lean().exec() as unknown as TransferCustomer[];
  }

  async toggleActive(id: string, isActive: boolean): Promise<TransferCustomer> {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .select('-password')
      .exec();
    if (!customer) throw new UnauthorizedException('Customer not found');
    return customer;
  }

  private generateTokens(customer: TransferCustomer): TransferCustomerTokenResponse {
    const payload = {
      sub: customer._id.toString(),
      phone: customer.phone,
      type: 'transfer-customer',
    };

    const secret = this.configService.get<string>('JWT_TRANSFER_SECRET')
      || this.configService.get<string>('JWT_SECRET');

    const accessToken = this.jwtService.sign(payload as object, {
      secret,
      expiresIn: 86400, // 24 hours
    });

    const refreshSecret = this.configService.get<string>('JWT_TRANSFER_REFRESH_SECRET')
      || this.configService.get<string>('JWT_REFRESH_SECRET');

    const refreshToken = this.jwtService.sign(payload as object, {
      secret: refreshSecret,
      expiresIn: 2592000, // 30 days
    });

    return {
      accessToken,
      refreshToken,
      customer: {
        id: customer._id.toString(),
        name: customer.name,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
      },
    };
  }
}
