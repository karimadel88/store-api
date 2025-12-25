import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  countryId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsMongoId()
  @IsOptional()
  countryId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryCityDto {
  @IsMongoId()
  @IsOptional()
  countryId?: string;
}
