import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Offer } from './schemas/offer.schema.js';
import { CreateOfferDto, UpdateOfferDto } from './dto/offer.dto.js';

@Injectable()
export class OffersService {
  constructor(@InjectModel(Offer.name) private offerModel: Model<Offer>) {}

  async create(dto: CreateOfferDto): Promise<Offer> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.imageId) data.imageId = new Types.ObjectId(dto.imageId);
    const offer = new this.offerModel(data);
    return offer.save();
  }

  async findAll(includeInactive = false): Promise<any[]> {
    const filter = includeInactive ? {} : { isActive: true };
    const offers = await this.offerModel
      .find(filter)
      .populate('imageId')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec();

    const baseUrl = process.env.BASE_URL || '';
    return offers.map((offer: any) => {
      if (offer.imageId && offer.imageId.url && offer.imageId.url.startsWith('/')) {
        offer.imageId.url = `${baseUrl}${offer.imageId.url}`;
      }
      return offer;
    });
  }

  async findOne(id: string): Promise<any> {
    const offer = await this.offerModel.findById(id).populate('imageId').lean().exec() as any;
    if (!offer) throw new NotFoundException('Offer not found');

    const baseUrl = process.env.BASE_URL || '';
    if (offer.imageId && offer.imageId.url && offer.imageId.url.startsWith('/')) {
      offer.imageId.url = `${baseUrl}${offer.imageId.url}`;
    }

    return offer;
  }

  async update(id: string, dto: UpdateOfferDto): Promise<Offer> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.imageId) data.imageId = new Types.ObjectId(dto.imageId);
    const offer = await this.offerModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async remove(id: string): Promise<void> {
    const result = await this.offerModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Offer not found');
  }
}
