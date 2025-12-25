import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from './schemas/contact.schema';
import { CreateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async create(createDto: CreateContactDto): Promise<Contact> {
    const contact = new this.contactModel(createDto);
    return contact.save();
  }

  async findAll(): Promise<Contact[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async markAsRead(id: string): Promise<Contact> {
    const contact = await this.contactModel.findByIdAndUpdate(id, { status: 'read' }, { new: true }).exec();
    if (!contact) {
      throw new NotFoundException('Contact message not found');
    }
    return contact;
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Contact message not found');
    }
  }
}
