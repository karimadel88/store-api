import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @IsMongoId()
  productId: string;

  @IsMongoId()
  customerId: string;

  @IsMongoId()
  @IsOptional()
  orderId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class UpdateReviewDto {
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}

export class QueryReviewDto {
  @IsMongoId()
  @IsOptional()
  productId?: string;

  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;
}
