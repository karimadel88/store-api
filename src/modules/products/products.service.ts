import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto, UpdateStockDto, QueryProductDto } from './dto/product.dto';
import { SlugUtil } from '../../common/utils/slug.util';
import { Review } from '../reviews/schemas/review.schema';

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}


  async create(createProductDto: CreateProductDto): Promise<Product> {
    const slug = SlugUtil.generate(createProductDto.name);
    
    const existingSlug = await this.productModel.findOne({ slug }).exec();
    if (existingSlug) {
      throw new ConflictException('Product with this slug already exists');
    }

    const existingSku = await this.productModel.findOne({ sku: createProductDto.sku.toUpperCase() }).exec();
    if (existingSku) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const product = new this.productModel({
      ...createProductDto,
      slug,
      sku: createProductDto.sku.toUpperCase(),
      categoryId: new Types.ObjectId(createProductDto.categoryId),
      brandId: createProductDto.brandId ? new Types.ObjectId(createProductDto.brandId) : undefined,
      imageIds: createProductDto.imageIds?.map((id) => new Types.ObjectId(id)) || [],
    });
    return product.save();
  }

  async findAll(query: QueryProductDto): Promise<PaginatedProducts> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    
    if (query.categoryId) {
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }
    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured;
    }
    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: any = {};
      if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
      filter.price = priceFilter;
    }
    if (query.brandId) {
      filter.brandId = new Types.ObjectId(query.brandId);
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId')
        .populate('imageIds')
        .populate('brandId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('categoryId')
      .populate('imageIds')
      .populate('brandId')
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findOneWithReviews(id: string) {
    const product = await this.findOne(id);
    
    const reviews = await this.reviewModel
      .find({ productId: new Types.ObjectId(id), isApproved: true })
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();

    // Calculate rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      product,
      reviews,
      reviewStats: {
        totalReviews: reviews.length,
        averageRating: product.avgRating,
        ratingDistribution,
      },
    };
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ slug })
      .populate('categoryId')
      .populate('imageIds')
      .populate('brandId')
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updateData: any = { ...updateProductDto };
    
    if (updateProductDto.name) {
      updateData.slug = SlugUtil.generate(updateProductDto.name);
      
      const existingProduct = await this.productModel
        .findOne({ slug: updateData.slug, _id: { $ne: id } } as any)
        .exec();
      if (existingProduct) {
        throw new ConflictException('Product name results in a slug that already exists');
      }
    }

    if (updateProductDto.categoryId) {
      updateData.categoryId = new Types.ObjectId(updateProductDto.categoryId);
    }
    if (updateProductDto.brandId) {
      updateData.brandId = new Types.ObjectId(updateProductDto.brandId);
    }
    if (updateProductDto.imageIds) {
      updateData.imageIds = updateProductDto.imageIds.map((imgId) => new Types.ObjectId(imgId));
    }
    if (updateProductDto.sku) {
      updateData.sku = updateProductDto.sku.toUpperCase();
    }

    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoryId')
      .populate('imageIds')
      .populate('brandId')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { quantity: updateStockDto.quantity } },
        { new: true },
      )
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Ensure quantity doesn't go negative
    if (product.quantity < 0) {
      await this.productModel.findByIdAndUpdate(id, { quantity: 0 }).exec();
      product.quantity = 0;
    }

    return product;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productModel
      .find({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
        isActive: true,
      })
      .populate('categoryId')
      .exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async checkStockAvailability(items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      const product = await this.productModel.findById(item.productId);
      
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`Product is not active: ${product.name}`);
      }

      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
        );
      }
    }
  }

  async decrementStock(items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } }
      );
    }
  }
}
