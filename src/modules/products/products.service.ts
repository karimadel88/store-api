import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto, UpdateStockDto, QueryProductDto } from './dto/product.dto';
import { SlugUtil } from '../../common/utils/slug.util';

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
    if (query.brand) {
      filter.brand = query.brand;
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: any = {};
      if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
      filter.price = priceFilter;
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId')
        .populate('imageIds')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec() as unknown as Product[],
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
      .lean()
      .exec() as unknown as Product;
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ slug })
      .populate('categoryId')
      .populate('imageIds')
      .lean()
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
      .lean()
      .exec() as unknown as Product[];
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async checkStockAvailability(items: { productId: string; quantity: number }[]): Promise<void> {
    const productIds = items.map((item) => new Types.ObjectId(item.productId));
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .select('name quantity isActive')
      .lean()
      .exec();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`Product is not active: ${product.name}`);
      }

      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        );
      }
    }
  }

  async decrementStock(items: { productId: string; quantity: number }[]): Promise<void> {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item.productId) },
        update: { $inc: { quantity: -item.quantity } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.productModel.bulkWrite(bulkOps);
    }
  }
}
