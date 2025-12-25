import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './schemas/review.schema';
import { CreateReviewDto, UpdateReviewDto, QueryReviewDto } from './dto/review.dto';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createDto: CreateReviewDto): Promise<Review> {
    const review = new this.reviewModel({
      ...createDto,
      productId: new Types.ObjectId(createDto.productId),
      customerId: new Types.ObjectId(createDto.customerId),
      orderId: createDto.orderId ? new Types.ObjectId(createDto.orderId) : undefined,
    });
    return review.save();
  }

  async findAll(query: QueryReviewDto): Promise<Review[]> {
    const filter: Record<string, unknown> = {};
    if (query.productId) filter.productId = new Types.ObjectId(query.productId);
    if (query.customerId) filter.customerId = new Types.ObjectId(query.customerId);
    if (query.isApproved !== undefined) filter.isApproved = query.isApproved;
    return this.reviewModel.find(filter).populate('productId').populate('customerId').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).populate('productId').populate('customerId').exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async approve(id: string): Promise<Review> {
    const review = await this.reviewModel.findByIdAndUpdate(id, { isApproved: true }, { new: true }).exec();
    if (!review) throw new NotFoundException('Review not found');
    await this.updateProductRating(review.productId.toString());
    return review;
  }

  async reject(id: string): Promise<Review> {
    const review = await this.reviewModel.findByIdAndUpdate(id, { isApproved: false }, { new: true }).exec();
    if (!review) throw new NotFoundException('Review not found');
    await this.updateProductRating(review.productId.toString());
    return review;
  }

  async remove(id: string): Promise<void> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    const productId = review.productId.toString();
    await this.reviewModel.findByIdAndDelete(id).exec();
    await this.updateProductRating(productId);
  }

  private async updateProductRating(productId: string): Promise<void> {
    const reviews = await this.reviewModel.find({ productId: new Types.ObjectId(productId), isApproved: true }).exec();
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
    await this.productModel.findByIdAndUpdate(productId, { avgRating: Math.round(avgRating * 10) / 10, reviewCount }).exec();
  }
}
