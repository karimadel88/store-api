import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ trim: true })
  description: string;
  @Prop({ trim: true })
  brand: string;


  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  sku: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  compareAtPrice: number;

  @Prop({ min: 0 })
  costPrice: number;

  @Prop({ required: true, default: 0, min: 0 })
  quantity: number;

  @Prop({ default: 5, min: 0 })
  lowStockThreshold: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Media', default: [] })
  imageIds: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: Object, default: {} })
  attributes: Record<string, string>;

  @Prop({ default: 0, min: 0, max: 5 })
  avgRating: number;

  @Prop({ default: 0, min: 0 })
  reviewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
