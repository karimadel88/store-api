import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsStoreController } from './payment-methods-store.controller';
import { PaymentMethod, PaymentMethodSchema } from './schemas/payment-method.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PaymentMethod.name, schema: PaymentMethodSchema }]),
  ],
  controllers: [PaymentMethodsController, PaymentMethodsStoreController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
