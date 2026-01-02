import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateProfileDto } from '../customer-auth/dto/customer-auth.dto';
import { AddAddressDto, AddressDto } from './dto/customer.dto';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';

interface AuthenticatedCustomerRequest {
  user: {
    customerId: string;
    email: string;
    type: string;
  };
}

@Controller('customers')
@UseGuards(CustomerJwtAuthGuard)
export class CustomersStoreController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('profile')
  getProfile(@Request() req: AuthenticatedCustomerRequest) {
    return this.customersService.findOne(req.user.customerId);
  }

  @Patch('profile')
  updateProfile(
    @Request() req: AuthenticatedCustomerRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.customersService.update(req.user.customerId, updateProfileDto);
  }

  @Get('orders')
  getOrders(@Request() req: AuthenticatedCustomerRequest) {
    return this.customersService.getOrderHistory(req.user.customerId);
  }

  @Get('wishlist')
  getWishlist(@Request() req: AuthenticatedCustomerRequest) {
    return this.customersService.getWishlist(req.user.customerId);
  }

  @Post('wishlist/:productId')
  addToWishlist(
    @Request() req: AuthenticatedCustomerRequest,
    @Param('productId') productId: string,
  ) {
    return this.customersService.addToWishlist(req.user.customerId, productId);
  }

  @Delete('wishlist/:productId')
  removeFromWishlist(
    @Request() req: AuthenticatedCustomerRequest,
    @Param('productId') productId: string,
  ) {
    return this.customersService.removeFromWishlist(req.user.customerId, productId);
  }

  @Post('addresses')
  addAddress(@Request() req: AuthenticatedCustomerRequest, @Body() dto: AddAddressDto) {
    return this.customersService.addAddress(req.user.customerId, dto.address);
  }

  @Delete('addresses/:index')
  removeAddress(@Request() req: AuthenticatedCustomerRequest, @Param('index') index: string) {
    return this.customersService.removeAddress(req.user.customerId, parseInt(index, 10));
  }
}
