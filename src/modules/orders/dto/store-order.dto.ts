import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StoreCustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class StoreAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string; // Payload sends 'city' string

  @IsMongoId()
  @IsNotEmpty()
  cityId: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  details?: string;
}

export class StoreOrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number; // Frontend price, valid for now, or verifiable
}

export class StoreCreateOrderDto {
  @ValidateNested()
  @Type(() => StoreCustomerDto)
  customer: StoreCustomerDto;

  @ValidateNested()
  @Type(() => StoreAddressDto)
  shippingAddress: StoreAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoreOrderItemDto)
  items: StoreOrderItemDto[];

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
