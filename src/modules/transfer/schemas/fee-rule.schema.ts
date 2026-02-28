import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FeeType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

@Schema({ timestamps: true })
export class FeeRule extends Document {
  @Prop({ type: Types.ObjectId, ref: 'TransferMethod', required: true })
  fromMethodId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TransferMethod', required: true })
  toMethodId: Types.ObjectId;

  @Prop({ type: String, enum: FeeType, required: true })
  feeType: FeeType;

  @Prop({ required: true, min: 0 })
  feeValue: number;

  @Prop({ min: 0 })
  minFee: number;

  @Prop({ min: 0 })
  maxFee: number;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  priority: number;

  createdAt: Date;
  updatedAt: Date;
}

export const FeeRuleSchema = SchemaFactory.createForClass(FeeRule);

FeeRuleSchema.index({ fromMethodId: 1, toMethodId: 1, enabled: 1 });
FeeRuleSchema.index({ priority: -1 });
