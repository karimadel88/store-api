import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BenefitType, FeeType } from '../schemas/fee-rule.schema.js';

export class CreateFeeRuleDto {
  @IsMongoId()
  fromMethodId: string;

  @IsMongoId()
  toMethodId: string;

  @IsEnum(FeeType)
  feeType: FeeType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  feeValue: number;

  /** Minimum transfer amount allowed */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minAmount?: number;

  /** Maximum transfer amount allowed */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxAmount?: number;

  /** FEE = client pays a fee; CASHBACK = client gets money back */
  @IsEnum(BenefitType)
  @IsOptional()
  benefitType?: BenefitType;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priority?: number;
}

export class UpdateFeeRuleDto {
  @IsMongoId()
  @IsOptional()
  fromMethodId?: string;

  @IsMongoId()
  @IsOptional()
  toMethodId?: string;

  @IsEnum(FeeType)
  @IsOptional()
  feeType?: FeeType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  feeValue?: number;

  /** Minimum transfer amount allowed */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minAmount?: number;

  /** Maximum transfer amount allowed */
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxAmount?: number;

  /** FEE = client pays a fee; CASHBACK = client gets money back */
  @IsEnum(BenefitType)
  @IsOptional()
  benefitType?: BenefitType;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priority?: number;
}
