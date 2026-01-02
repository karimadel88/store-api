import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum StockAdjustmentReason {
  MANUAL = 'manual',
  ORDER = 'order',
  CANCELLATION = 'cancellation',
  RETURN = 'return',
  CORRECTION = 'correction',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

@Schema({ timestamps: true })
export class StockHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  previousQuantity: number;

  @Prop({ required: true })
  newQuantity: number;

  @Prop({ required: true })
  adjustment: number;

  @Prop({ type: String, enum: StockAdjustmentReason, required: true })
  reason: StockAdjustmentReason;

  @Prop({ trim: true })
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const StockHistorySchema = SchemaFactory.createForClass(StockHistory);

StockHistorySchema.index({ productId: 1, createdAt: -1 });
StockHistorySchema.index({ orderId: 1 });
