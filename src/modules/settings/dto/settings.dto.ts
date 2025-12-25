import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ContactInfoDto {
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() address?: string;
}

export class SocialLinksDto {
  @IsString() @IsOptional() facebook?: string;
  @IsString() @IsOptional() instagram?: string;
  @IsString() @IsOptional() twitter?: string;
  @IsString() @IsOptional() youtube?: string;
}

export class UpdateSettingsDto {
  @IsString() @IsOptional() storeName?: string;
  @IsString() @IsOptional() currency?: string;
  @IsNumber() @Min(0) @IsOptional() @Type(() => Number) taxRate?: number;
  @IsString() @IsOptional() taxName?: string;
  @IsObject() @IsOptional() contactInfo?: ContactInfoDto;
  @IsObject() @IsOptional() socialLinks?: SocialLinksDto;

  // Allow metadata fields but they should be ignored in service
  @IsOptional() _id?: string;
  @IsOptional() createdAt?: Date;
  @IsOptional() updatedAt?: Date;
  @IsOptional() __v?: number;
}
