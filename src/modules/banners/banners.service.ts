import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Banner } from './schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<Banner>) {}

  async create(createDto: CreateBannerDto): Promise<Banner> {
    const banner = new this.bannerModel({
      ...createDto,
      imageId: new Types.ObjectId(createDto.imageId),
    });
    return banner.save();
  }

  async findAll(includeInactive = false): Promise<Banner[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.bannerModel
      .find(filter)
      .populate('imageId')
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerModel.findById(id).populate('imageId').exec();
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  async update(id: string, updateDto: UpdateBannerDto): Promise<Banner> {
    const updateData: any = { ...updateDto };
    if (updateDto.imageId) {
      updateData.imageId = new Types.ObjectId(updateDto.imageId);
    }

    const banner = await this.bannerModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('imageId')
      .exec();

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return banner;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bannerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Banner not found');
    }
  }
}
