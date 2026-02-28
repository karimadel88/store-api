import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq } from './schemas/faq.schema.js';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto.js';

@Injectable()
export class FaqService {
  constructor(@InjectModel(Faq.name) private faqModel: Model<Faq>) {}

  async create(dto: CreateFaqDto): Promise<Faq> {
    const faq = new this.faqModel(dto);
    return faq.save();
  }

  async findAll(includeInactive = false): Promise<Faq[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.faqModel
      .find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec() as unknown as Faq[];
  }

  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqModel.findById(id).lean().exec() as unknown as Faq;
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async update(id: string, dto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.faqModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async remove(id: string): Promise<void> {
    const result = await this.faqModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('FAQ not found');
  }
}
