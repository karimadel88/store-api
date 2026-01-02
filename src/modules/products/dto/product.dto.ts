import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;



  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  compareAtPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  lowStockThreshold?: number;

  @IsMongoId()
  categoryId: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  imageIds?: string[];

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;



  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  compareAtPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  lowStockThreshold?: number;

  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  imageIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;
}

export class UpdateStockDto {
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}

export class QueryProductDto {
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsMongoId()
  @IsOptional()
  brandId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
