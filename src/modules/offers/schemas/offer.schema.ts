import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Offer extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  offer: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  imageId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

OfferSchema.index({ isActive: 1, sortOrder: 1 });
