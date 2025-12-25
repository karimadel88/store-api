import { Controller, Post, Body } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/coupon.dto';

@Controller('coupons')
export class CouponsStoreController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto);
  }
}
