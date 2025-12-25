import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';

export class CustomerDetailsDto {
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

export class OrderAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsMongoId()
  cityId: string;

  @IsString()
  @IsNotEmpty()
  cityName: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class OrderItemDto {
  @IsMongoId()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  total: number;
}

export class CreateOrderDto {
  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @ValidateNested()
  @Type(() => CustomerDetailsDto)
  customerDetails: CustomerDetailsDto;

  @ValidateNested()
  @Type(() => OrderAddressDto)
  shippingAddress: OrderAddressDto;

  @ValidateNested()
  @Type(() => OrderAddressDto)
  @IsOptional()
  billingAddress?: OrderAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsMongoId()
  @IsOptional()
  shippingMethodId?: string;

  @IsString()
  @IsOptional()
  shippingMethodName?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippingCost: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}

export class UpdateTrackingDto {
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;
}

export class QueryOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
