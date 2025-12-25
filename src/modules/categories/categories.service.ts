import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { SlugUtil } from '../../common/utils/slug.util';

import { Product } from '../products/schemas/product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = SlugUtil.generate(createCategoryDto.name);
    
    const existingCategory = await this.categoryModel.findOne({ slug }).exec();
    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug,
      parentId: createCategoryDto.parentId
        ? new Types.ObjectId(createCategoryDto.parentId)
        : null,
      imageId: createCategoryDto.imageId
        ? new Types.ObjectId(createCategoryDto.imageId)
        : undefined,
    });
    return category.save();
  }

  // Used by Admin
  async findAll(includeInactive = false): Promise<Category[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.categoryModel
      .find(filter)
      .populate('imageId')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  // Used by Store Front
  async findAllWithStats(): Promise<any[]> {
    // 1. Get all active categories
    const categories = await this.categoryModel
      .find({ isActive: true })
      .populate('imageId')
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .exec();

    // 2. Aggregate product counts for active products
    const productCounts = await this.productModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    productCounts.forEach(p => countMap.set(p._id.toString(), p.count));

    // 3. Merge, Filter, and Transform Image URL
    const baseUrl = process.env.BASE_URL || '';
    
    const result = categories.map((cat: any) => {
      // Transform Image URL if exists
      if (cat.imageId && cat.imageId.url && cat.imageId.url.startsWith('/')) {
        cat.imageId.url = `${baseUrl}${cat.imageId.url}`;
      }

      return {
        ...cat,
        productCount: countMap.get(cat._id.toString()) || 0,
      };
    }).filter(cat => cat.productCount > 0);

    return result;
  }

  async findTree(): Promise<unknown[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .populate('imageId')
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .exec();

    return this.buildTree(categories as unknown as Record<string, unknown>[]);
  }

  private buildTree(categories: Record<string, unknown>[], parentId: string | null = null): unknown[] {
    return categories
      .filter((cat) => {
        const catParentId = (cat.parentId as { toString(): string })?.toString() || null;
        return catParentId === parentId;
      })
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, (cat._id as { toString(): string }).toString()),
      }));
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findById(id)
      .populate('imageId')
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel
      .findOne({ slug })
      .populate('imageId')
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const updateData: any = { ...updateCategoryDto };

    if (updateCategoryDto.name) {
      updateData.slug = SlugUtil.generate(updateCategoryDto.name);
      
      const existingCategory = await this.categoryModel
        .findOne({ slug: updateData.slug, _id: { $ne: id } } as any)
        .exec();
      if (existingCategory) {
        throw new ConflictException('Category name results in a slug that already exists');
      }
    }

    if (updateCategoryDto.parentId) {
      updateData.parentId = new Types.ObjectId(updateCategoryDto.parentId);
    }
    if (updateCategoryDto.imageId) {
      updateData.imageId = new Types.ObjectId(updateCategoryDto.imageId);
    }

    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('imageId')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(id: string): Promise<void> {
    // Orphan subcategories before deleting parent
    await this.categoryModel.updateMany(
      { parentId: new Types.ObjectId(id) },
      { $set: { parentId: null } },
    ).exec();

    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }
}
