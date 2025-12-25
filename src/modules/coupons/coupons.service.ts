import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponType } from './schemas/coupon.schema';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

export interface CouponValidation {
  isValid: boolean;
  discount: number;
  message?: string;
}

@Injectable()
export class CouponsService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<Coupon>) {}

  async create(createDto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponModel.findOne({ code: createDto.code.toUpperCase() }).exec();
    if (existing) throw new ConflictException('Coupon code already exists');
    const coupon = new this.couponModel({ ...createDto, code: createDto.code.toUpperCase() });
    return coupon.save();
  }

  async findAll(includeInactive = false): Promise<Coupon[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.couponModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, updateDto: UpdateCouponDto): Promise<Coupon> {
    if (updateDto.code) updateDto.code = updateDto.code.toUpperCase();
    const coupon = await this.couponModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async validate(dto: ValidateCouponDto): Promise<CouponValidation> {
    const coupon = await this.couponModel.findOne({ code: dto.code.toUpperCase(), isActive: true }).exec();
    if (!coupon) return { isValid: false, discount: 0, message: 'Coupon not found' };
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) return { isValid: false, discount: 0, message: 'Coupon not yet valid' };
    if (coupon.validUntil && now > coupon.validUntil) return { isValid: false, discount: 0, message: 'Coupon expired' };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { isValid: false, discount: 0, message: 'Coupon usage limit reached' };
    if (dto.orderAmount < coupon.minOrderAmount) return { isValid: false, discount: 0, message: `Minimum order amount: ${coupon.minOrderAmount}` };
    const discount = coupon.type === CouponType.PERCENTAGE ? (dto.orderAmount * coupon.value) / 100 : coupon.value;
    return { isValid: true, discount: Math.min(discount, dto.orderAmount) };
  }

  async incrementUsage(code: string): Promise<void> {
    await this.couponModel.updateOne({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } }).exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Coupon not found');
  }
}
