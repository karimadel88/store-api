import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum EntityType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  USER = 'user',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret: any) => {
      if (ret.url && ret.url.startsWith('/')) {
        ret.url = `${process.env.BASE_URL || ''}${ret.url}`;
      }
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret: any) => {
      if (ret.url && ret.url.startsWith('/')) {
        ret.url = `${process.env.BASE_URL || ''}${ret.url}`;
      }
      return ret;
    },
  },
})
export class Media extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Types.ObjectId, required: false })
  entityId: Types.ObjectId;

  @Prop({ type: String, enum: EntityType, required: false })
  entityType: EntityType;

  @Prop({ default: 0 })
  sortOrder: number;

  createdAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

// Index for faster lookups by entity
MediaSchema.index({ entityType: 1, entityId: 1 });
