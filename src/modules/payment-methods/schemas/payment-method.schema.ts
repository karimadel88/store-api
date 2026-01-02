import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentMethod extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  code: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  iconId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  config: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);

PaymentMethodSchema.index({ code: 1 });
PaymentMethodSchema.index({ isActive: 1, sortOrder: 1 });
