import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockHistory, StockAdjustmentReason } from './schemas/stock-history.schema';
import { Product } from '../products/schemas/product.schema';
import { CreateStockAdjustmentDto, QueryStockHistoryDto, BatchStockUpdateDto } from './dto/inventory.dto';

export interface PaginatedStockHistory {
  data: StockHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(StockHistory.name) private stockHistoryModel: Model<StockHistory>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createStockAdjustment(
    productId: string,
    createDto: CreateStockAdjustmentDto,
    userId?: string,
  ): Promise<StockHistory> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + createDto.adjustment;

    if (newQuantity < 0) {
      throw new BadRequestException(
        `Adjustment would result in negative quantity. Current: ${previousQuantity}, Adjustment: ${createDto.adjustment}`,
      );
    }

    // Update product quantity
    product.quantity = newQuantity;
    await product.save();

    // Create stock history entry
    const stockHistory = new this.stockHistoryModel({
      productId: new Types.ObjectId(productId),
      previousQuantity,
      newQuantity,
      adjustment: createDto.adjustment,
      reason: createDto.reason,
      notes: createDto.notes,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      orderId: createDto.orderId ? new Types.ObjectId(createDto.orderId) : undefined,
    });

    return stockHistory.save();
  }

  async getStockHistory(productId: string, query: QueryStockHistoryDto): Promise<PaginatedStockHistory> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { productId: new Types.ObjectId(productId) };
    if (query.reason) {
      filter.reason = query.reason;
    }

    const [data, total] = await Promise.all([
      this.stockHistoryModel
        .find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('orderId', 'orderNumber')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.stockHistoryModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLowStockAlerts(): Promise<Product[]> {
    return this.productModel
      .find({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
        isActive: true,
      })
      .populate('categoryId')
      .populate('imageIds')
      .sort({ quantity: 1 })
      .exec();
  }

  async batchUpdateStock(updates: BatchStockUpdateDto[], userId?: string): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const update of updates) {
      try {
        const product = await this.productModel.findById(update.productId);
        if (!product) {
          errors.push(`Product ${update.productId} not found`);
          failed++;
          continue;
        }

        const adjustment = update.quantity - product.quantity;
        await this.createStockAdjustment(
          update.productId,
          {
            adjustment,
            reason: StockAdjustmentReason.MANUAL,
            notes: update.notes || 'Batch update',
          },
          userId,
        );
        success++;
      } catch (error) {
        errors.push(`Product ${update.productId}: ${error.message}`);
        failed++;
      }
    }

    return { success, failed, errors };
  }

  async reserveStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const availableStock = product.quantity - product.reservedStock;
    if (availableStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`,
      );
    }

    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { reservedStock: quantity },
    });
  }

  async releaseReservedStock(productId: string, quantity: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { reservedStock: -quantity },
    });
  }

  async confirmStockReduction(
    productId: string,
    quantity: number,
    orderId: string,
    userId?: string,
  ): Promise<void> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Reduce both quantity and reserved stock
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { quantity: -quantity, reservedStock: -quantity },
    });

    // Log the stock adjustment
    await this.createStockAdjustment(
      productId,
      {
        adjustment: -quantity,
        reason: StockAdjustmentReason.ORDER,
        notes: 'Order confirmed',
        orderId,
      },
      userId,
    );
  }

  async restoreStock(
    productId: string,
    quantity: number,
    orderId: string,
    userId?: string,
  ): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { quantity: quantity },
    });

    // Log the stock adjustment
    await this.createStockAdjustment(
      productId,
      {
        adjustment: quantity,
        reason: StockAdjustmentReason.CANCELLATION,
        notes: 'Order cancelled',
        orderId,
      },
      userId,
    );
  }
}
