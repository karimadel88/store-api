import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  create(@Body() createDto: CreateCouponDto) { return this.couponsService.create(createDto); }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) { return this.couponsService.findAll(includeInactive === 'true'); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.couponsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCouponDto) { return this.couponsService.update(id, updateDto); }

  @Post('validate')
  validate(@Body() dto: ValidateCouponDto) { return this.couponsService.validate(dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.couponsService.remove(id); }
}
