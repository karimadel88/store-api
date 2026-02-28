import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Visit extends Document {
  /** Midnight UTC of the day this record belongs to */
  @Prop({ required: true, type: Date })
  date: Date;

  /** Total visits recorded on this day */
  @Prop({ default: 0 })
  count: number;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);

// One document per calendar day
VisitSchema.index({ date: 1 }, { unique: true });
