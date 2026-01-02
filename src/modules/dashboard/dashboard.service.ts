import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const cacheKey = 'dashboard_stats';
    const cachedStats = await this.cacheManager.get<DashboardStats>(cacheKey);
    if (cachedStats) return cachedStats;

    const [totalOrders, totalRevenue, totalCustomers, totalProducts, pendingOrders, lowStockProducts] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      this.orderModel.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]).exec().then(r => r[0]?.total || 0),
      this.customerModel.countDocuments().exec(),
      this.productModel.countDocuments({ isActive: true }).exec(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }).exec(),
      this.productModel.countDocuments({ $expr: { $lte: ['$quantity', '$lowStockThreshold'] }, isActive: true }).exec(),
    ]);
    
    const stats = { totalOrders, totalRevenue, totalCustomers, totalProducts, pendingOrders, lowStockProducts };
    await this.cacheManager.set(cacheKey, stats, 300000); // Cache for 5 minutes
    
    return stats;
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec() as unknown as Order[];
  }

  async getTopProducts(limit = 10): Promise<Product[]> {
    return this.productModel.find({ isActive: true }).sort({ reviewCount: -1 }).limit(limit).populate('categoryId').lean().exec() as unknown as Product[];
  }
}
