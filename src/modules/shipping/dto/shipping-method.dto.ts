import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CityPriceDto {
  @IsMongoId()
  cityId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}

export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  basePrice: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  estimatedDays?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityPriceDto)
  @IsOptional()
  cityPrices?: CityPriceDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateShippingMethodDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  basePrice?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  estimatedDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SetCityPricesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityPriceDto)
  cityPrices: CityPriceDto[];
}

export class CalculateShippingDto {
  @IsMongoId()
  cityId: string;
}
