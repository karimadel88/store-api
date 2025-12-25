import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ShippingZonePrice {
  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  price: number;
}

export const ShippingZonePriceSchema = SchemaFactory.createForClass(ShippingZonePrice);

@Schema({ timestamps: true })
export class ShippingMethod extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({ type: [ShippingZonePriceSchema], default: [] })
  cityPrices: ShippingZonePrice[];

  @Prop({ default: 3, min: 1 })
  estimatedDays: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ShippingMethodSchema = SchemaFactory.createForClass(ShippingMethod);

ShippingMethodSchema.index({ isActive: 1 });
