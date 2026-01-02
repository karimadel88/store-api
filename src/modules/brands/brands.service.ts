import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand } from './schemas/brand.schema';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { SlugUtil } from '../../common/utils/slug.util';

@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private brandModel: Model<Brand>) {}

  async create(createDto: CreateBrandDto): Promise<Brand> {
    const slug = SlugUtil.generate(createDto.name);
    const existing = await this.brandModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException('Brand with this slug already exists');
    }

    const brand = new this.brandModel({
      ...createDto,
      slug,
      logoId: createDto.logoId ? new Types.ObjectId(createDto.logoId) : undefined,
    });
    return brand.save();
  }

  async findAll(includeInactive = true): Promise<Brand[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.brandModel
      .find(filter)
      .populate('logoId')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandModel.findById(id).populate('logoId').exec();
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandModel.findOne({ slug }).populate('logoId').exec();
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async update(id: string, updateDto: UpdateBrandDto): Promise<Brand> {
    const updateData: any = { ...updateDto };
    if (updateDto.name) {
      updateData.slug = SlugUtil.generate(updateDto.name);
    }
    if (updateDto.logoId) {
      updateData.logoId = new Types.ObjectId(updateDto.logoId);
    }

    const brand = await this.brandModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('logoId')
      .exec();

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async remove(id: string): Promise<void> {
    const result = await this.brandModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Brand not found');
    }
  }
}
