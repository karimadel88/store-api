import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TransferMethod extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ trim: true })
  category: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

export const TransferMethodSchema = SchemaFactory.createForClass(TransferMethod);

TransferMethodSchema.index({ enabled: 1 });
TransferMethodSchema.index({ sortOrder: 1 });
