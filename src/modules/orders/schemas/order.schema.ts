import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class CustomerDetails {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;
}

@Schema({ _id: false })
export class OrderAddress {
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
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  sku: string;

  @Prop()
  image: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  total: number;
}

export const CustomerDetailsSchema = SchemaFactory.createForClass(CustomerDetails);
export const OrderAddressSchema = SchemaFactory.createForClass(OrderAddress);
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop({ type: CustomerDetailsSchema, required: true })
  customerDetails: CustomerDetails;

  @Prop({ type: OrderAddressSchema, required: true })
  shippingAddress: OrderAddress;

  @Prop({ type: OrderAddressSchema })
  billingAddress: OrderAddress;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Types.ObjectId, ref: 'ShippingMethod' })
  shippingMethodId: Types.ObjectId;

  @Prop()
  shippingMethodName: string;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  couponId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  shippingCost: number;

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop()
  paymentMethod: string;

  @Prop()
  trackingNumber: string;

  @Prop()
  notes: string;

  @Prop()
  shippedAt: Date;

  @Prop()
  deliveredAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
