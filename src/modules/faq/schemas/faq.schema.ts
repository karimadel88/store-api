import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Faq extends Document {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);

FaqSchema.index({ isActive: 1, sortOrder: 1 });
