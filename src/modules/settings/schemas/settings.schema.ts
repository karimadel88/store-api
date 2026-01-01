import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Media } from '../../media/schemas/media.schema';

@Schema({ _id: false })
export class ContactInfo {
  @Prop() email: string;
  @Prop() phone: string;
  @Prop() whatsapp?: string; // International format without + or 00 (e.g., 201234567890)
  @Prop() address: string;
}

@Schema({ _id: false })
export class SocialLinks {
  @Prop() facebook: string;
  @Prop() instagram: string;
  @Prop() twitter: string;
  @Prop() youtube: string;
}

@Schema({ timestamps: true })
export class Settings extends Document {
  @Prop({ required: true, default: 'Store' })
  storeName: string;

  @Prop({ default: 'EGP' })
  currency: string;

  @Prop({ default: 0, min: 0 })
  taxRate: number;

  @Prop({ default: 'VAT' })
  taxName: string;

  @Prop({ type: ContactInfo, default: {} })
  contactInfo: ContactInfo;

  @Prop({ type: SocialLinks, default: {} })
  socialLinks: SocialLinks;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  logoId?: Types.ObjectId;

  logo?: Media; // Virtual field, populated when fetching

  createdAt: Date;
  updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
