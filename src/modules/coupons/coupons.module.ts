import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { CouponsStoreController } from './coupons-store.controller';
import { Coupon, CouponSchema } from './schemas/coupon.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }])],
  controllers: [CouponsController, CouponsStoreController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
