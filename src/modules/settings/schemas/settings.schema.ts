import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class ContactInfo {
  @Prop() email: string;
  @Prop() phone: string;
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

  createdAt: Date;
  updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
