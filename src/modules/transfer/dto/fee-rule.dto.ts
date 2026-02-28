import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeType } from '../schemas/fee-rule.schema.js';

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

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxFee?: number;

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

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxFee?: number;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priority?: number;
}
