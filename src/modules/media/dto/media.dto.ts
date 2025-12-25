import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { EntityType } from '../schemas/media.schema';

export class UploadMediaDto {
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @IsMongoId()
  @IsOptional()
  entityId?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class ReorderMediaDto {
  @IsMongoId({ each: true })
  mediaIds: string[];
}

export class QueryMediaDto {
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @IsMongoId()
  @IsOptional()
  entityId?: string;
}
