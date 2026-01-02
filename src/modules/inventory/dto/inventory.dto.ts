import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StockAdjustmentReason } from '../schemas/stock-history.schema';

export class CreateStockAdjustmentDto {
  @IsNumber()
  @Type(() => Number)
  adjustment: number;

  @IsEnum(StockAdjustmentReason)
  reason: StockAdjustmentReason;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsMongoId()
  @IsOptional()
  orderId?: string;
}

export class BatchStockUpdateDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryStockHistoryDto {
  @IsMongoId()
  @IsOptional()
  productId?: string;

  @IsEnum(StockAdjustmentReason)
  @IsOptional()
  reason?: StockAdjustmentReason;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
