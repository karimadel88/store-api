import { Controller, Get, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingStoreController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('calculate')
  calculate(@Query('cityId') cityId: string) {
    return this.shippingService.calculateShipping(cityId);
  }
}
