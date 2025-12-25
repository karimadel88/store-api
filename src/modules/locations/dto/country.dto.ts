import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 3)
  code: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCountryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Length(2, 3)
  code?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
