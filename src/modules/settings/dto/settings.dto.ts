import { IsMongoId, IsNumber, IsObject, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ContactInfoDto {
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() 
  @IsOptional() 
  @Matches(/^[1-9]\d{7,14}$/, { message: 'WhatsApp number must be in international format without + or 00 prefix (e.g., 201234567890)' })
  whatsapp?: string;
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
  @IsMongoId() @IsOptional() logoId?: string;

  // Allow metadata fields but they should be ignored in service
  @IsOptional() _id?: string;
  @IsOptional() createdAt?: Date;
  @IsOptional() updatedAt?: Date;
  @IsOptional() __v?: number;
  @IsOptional() logo?: any; // Virtual field from GET, ignored in update
}
