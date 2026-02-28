import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';

export class RegisterTransferCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;
}

export class LoginTransferCustomerDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
