import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class TransferCustomer extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true })
  whatsapp: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const TransferCustomerSchema = SchemaFactory.createForClass(TransferCustomer);

TransferCustomerSchema.index({ phone: 1 });
TransferCustomerSchema.index({ isActive: 1 });

// Hash password before saving
TransferCustomerSchema.pre('save', async function () {
  const doc = this as any;
  if (!doc.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  doc.password = await bcrypt.hash(doc.password, salt);
});
