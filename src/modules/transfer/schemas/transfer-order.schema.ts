import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransferOrderStatus {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  SUBMITTED = 'SUBMITTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class TransferOrder extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TransferMethod', required: true })
  fromMethodId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TransferMethod', required: true })
  toMethodId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, min: 0 })
  fee: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: String, enum: TransferOrderStatus, default: TransferOrderStatus.SUBMITTED })
  status: TransferOrderStatus;

  @Prop({ trim: true })
  customerName: string;

  @Prop({ trim: true })
  customerPhone: string;

  @Prop({ trim: true })
  customerWhatsapp: string;

  @Prop({ trim: true })
  adminNotes: string;

  @Prop({ type: Types.ObjectId, ref: 'FeeRule' })
  feeRuleId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const TransferOrderSchema = SchemaFactory.createForClass(TransferOrder);

TransferOrderSchema.index({ status: 1 });
TransferOrderSchema.index({ createdAt: -1 });
TransferOrderSchema.index({ userId: 1 });
TransferOrderSchema.index({ customerPhone: 1 });
TransferOrderSchema.index({ orderNumber: 1 });
