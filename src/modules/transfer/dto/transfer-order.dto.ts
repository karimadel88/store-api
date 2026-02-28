import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransferOrderStatus } from '../schemas/transfer-order.schema.js';

export class QuoteDto {
  @IsMongoId()
  fromMethodId: string;

  @IsMongoId()
  toMethodId: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;
}

export class ConfirmTransferDto {
  @IsMongoId()
  fromMethodId: string;

  @IsMongoId()
  toMethodId: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsOptional()
  customerWhatsapp?: string;
}

export class QueryTransferOrderDto {
  @IsEnum(TransferOrderStatus)
  @IsOptional()
  status?: TransferOrderStatus;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class UpdateTransferOrderStatusDto {
  @IsEnum(TransferOrderStatus)
  status: TransferOrderStatus;
}

export class UpdateTransferOrderNotesDto {
  @IsString()
  @IsNotEmpty()
  adminNotes: string;
}
