import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TransferCustomerAuthService } from '../transfer-customer-auth.service.js';

@Injectable()
export class JwtTransferStrategy extends PassportStrategy(Strategy, 'jwt-transfer') {
  constructor(
    private configService: ConfigService,
    private transferCustomerAuthService: TransferCustomerAuthService,
  ) {
    const secret = configService.get<string>('JWT_TRANSFER_SECRET')
      || configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_TRANSFER_SECRET or JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; phone: string; type: string }) {
    if (payload.type !== 'transfer-customer') {
      throw new UnauthorizedException('Invalid token type');
    }

    const customer = await this.transferCustomerAuthService.findById(payload.sub);
    if (!customer || !customer.isActive) {
      throw new UnauthorizedException('Customer not found or inactive');
    }

    return {
      customerId: payload.sub,
      phone: payload.phone,
      type: 'transfer-customer',
    };
  }
}
