import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class Address {
  @Prop({ required: true, trim: true })
  street: string;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  cityId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  cityName: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ trim: true })
  postalCode: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  wishlist: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ isActive: 1 });
