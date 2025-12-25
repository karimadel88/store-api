import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus, PaymentStatus } from './schemas/order.schema';
import { CreateOrderDto, QueryOrderDto } from './dto/order.dto';

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  async create(createDto: CreateOrderDto): Promise<Order> {
    const subtotal = createDto.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + createDto.shippingCost;

    const orderData = {
      ...createDto,
      orderNumber: this.generateOrderNumber(),
      customerId: createDto.customerId ? new Types.ObjectId(createDto.customerId) : undefined,
      shippingMethodId: createDto.shippingMethodId
        ? new Types.ObjectId(createDto.shippingMethodId)
        : undefined,
      shippingAddress: {
        ...createDto.shippingAddress,
        cityId: new Types.ObjectId(createDto.shippingAddress.cityId),
      },
      billingAddress: createDto.billingAddress
        ? {
            ...createDto.billingAddress,
            cityId: new Types.ObjectId(createDto.billingAddress.cityId),
          }
        : undefined,
      items: createDto.items.map((item) => ({
        ...item,
        productId: new Types.ObjectId(item.productId),
      })),
      subtotal,
      total,
    };

    const order = new this.orderModel(orderData);
    return order.save();
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedOrders> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.customerId) filter.customerId = new Types.ObjectId(query.customerId);

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('customerId')
        .populate('shippingMethodId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId')
      .populate('shippingMethodId')
      .populate('items.productId')
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const updates: Record<string, unknown> = { status };
    if (status === OrderStatus.SHIPPED) updates.shippedAt = new Date();
    if (status === OrderStatus.DELIVERED) updates.deliveredAt = new Date();

    const order = await this.orderModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, { paymentStatus }, { new: true }).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateTracking(id: string, trackingNumber: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, { trackingNumber }, { new: true }).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
