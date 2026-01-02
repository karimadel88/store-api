import { Controller, Get } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('store/payment-methods')
export class PaymentMethodsStoreController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  findAll() {
    return this.paymentMethodsService.findAll(false);
  }
}
