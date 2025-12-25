import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { ShippingStoreController } from './shipping-store.controller';
import { ShippingMethod, ShippingMethodSchema } from './schemas/shipping-method.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingMethod.name, schema: ShippingMethodSchema },
    ]),
  ],
  controllers: [ShippingController, ShippingStoreController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
