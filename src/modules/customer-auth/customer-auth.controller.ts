import { Controller, Post, Body } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/customer-auth.dto';

@Controller('customers')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterCustomerDto) {
    return this.customerAuthService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginCustomerDto) {
    return this.customerAuthService.login(loginDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.customerAuthService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.customerAuthService.resetPassword(resetPasswordDto);
  }
}
