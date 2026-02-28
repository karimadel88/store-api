import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  offer: string;

  @IsMongoId()
  @IsOptional()
  imageId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateOfferDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  offer?: string;

  @IsMongoId()
  @IsOptional()
  imageId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}
