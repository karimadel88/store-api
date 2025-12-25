import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxUses?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  validUntil?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxUses?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  validUntil?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderAmount: number;
}
