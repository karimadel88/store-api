import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Banner extends Document {
  @Prop({ trim: true, required: false })
  title: string;

  @Prop({ trim: true, required: false })
  subtitle: string;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  imageId: Types.ObjectId;

  @Prop({ trim: true })
  link: string;

  @Prop({ trim: true })
  buttonText: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ isActive: 1, sortOrder: 1 });
