import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TransferOrder, TransferOrderStatus } from './schemas/transfer-order.schema.js';
import { TransferMethodsService } from './transfer-methods.service.js';
import { FeeRulesService } from './fee-rules.service.js';
import { FeeType } from './schemas/fee-rule.schema.js';
import {
  QuoteDto,
  ConfirmTransferDto,
  QueryTransferOrderDto,
} from './dto/transfer-order.dto.js';

export interface QuoteResult {
  available: boolean;
  fromMethod: { id: string; name: string; code: string };
  toMethod: { id: string; name: string; code: string };
  amount: number;
  fee: number;
  total: number;
  feeRuleId: string | null;
  message?: string;
}

export interface PaginatedTransferOrders {
  data: TransferOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Allowed status transitions
const ALLOWED_TRANSITIONS: Record<TransferOrderStatus, TransferOrderStatus[]> = {
  [TransferOrderStatus.PENDING_CONFIRMATION]: [TransferOrderStatus.SUBMITTED],
  [TransferOrderStatus.SUBMITTED]: [
    TransferOrderStatus.IN_PROGRESS,
    TransferOrderStatus.CANCELLED,
  ],
  [TransferOrderStatus.IN_PROGRESS]: [
    TransferOrderStatus.COMPLETED,
    TransferOrderStatus.REJECTED,
  ],
  [TransferOrderStatus.COMPLETED]: [],
  [TransferOrderStatus.CANCELLED]: [],
  [TransferOrderStatus.REJECTED]: [],
};

@Injectable()
export class TransferOrdersService {
  private readonly logger = new Logger(TransferOrdersService.name);

  constructor(
    @InjectModel(TransferOrder.name) private transferOrderModel: Model<TransferOrder>,
    private readonly transferMethodsService: TransferMethodsService,
    private readonly feeRulesService: FeeRulesService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRF-${timestamp}-${random}`;
  }

  async quote(dto: QuoteDto): Promise<QuoteResult> {
    // Validate amount
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Validate from != to
    if (dto.fromMethodId === dto.toMethodId) {
      throw new BadRequestException('Source and destination methods must be different');
    }

    // Validate methods exist and are enabled
    const fromMethod = await this.transferMethodsService.findOne(dto.fromMethodId);
    const toMethod = await this.transferMethodsService.findOne(dto.toMethodId);

    if (!fromMethod.enabled) {
      throw new BadRequestException(`Transfer method "${fromMethod.name}" is currently disabled`);
    }
    if (!toMethod.enabled) {
      throw new BadRequestException(`Transfer method "${toMethod.name}" is currently disabled`);
    }

    // Find best fee rule
    const rule = await this.feeRulesService.findBestRule(dto.fromMethodId, dto.toMethodId);

    if (!rule) {
      return {
        available: false,
        fromMethod: { id: fromMethod._id.toString(), name: fromMethod.name, code: fromMethod.code },
        toMethod: { id: toMethod._id.toString(), name: toMethod.name, code: toMethod.code },
        amount: dto.amount,
        fee: 0,
        total: 0,
        feeRuleId: null,
        message: 'This transfer route is not available at the moment',
      };
    }

    // Calculate fee
    let fee: number;
    if (rule.feeType === FeeType.PERCENT) {
      fee = (dto.amount * rule.feeValue) / 100;
    } else {
      fee = rule.feeValue;
    }

    // Apply min/max fee bounds
    if (rule.minFee != null && fee < rule.minFee) {
      fee = rule.minFee;
    }
    if (rule.maxFee != null && fee > rule.maxFee) {
      fee = rule.maxFee;
    }

    // Round to 2 decimal places
    fee = Math.round(fee * 100) / 100;
    const total = Math.round((dto.amount + fee) * 100) / 100;

    return {
      available: true,
      fromMethod: { id: fromMethod._id.toString(), name: fromMethod.name, code: fromMethod.code },
      toMethod: { id: toMethod._id.toString(), name: toMethod.name, code: toMethod.code },
      amount: dto.amount,
      fee,
      total,
      feeRuleId: rule._id.toString(),
    };
  }

  async confirm(dto: ConfirmTransferDto, customerId?: string): Promise<TransferOrder> {
    // Get the fresh quote to ensure accuracy
    const quoteResult = await this.quote({
      fromMethodId: dto.fromMethodId,
      toMethodId: dto.toMethodId,
      amount: dto.amount,
    });

    if (!quoteResult.available) {
      throw new BadRequestException('This transfer route is not available');
    }

    // Create the order
    const order = new this.transferOrderModel({
      orderNumber: this.generateOrderNumber(),
      fromMethodId: new Types.ObjectId(dto.fromMethodId),
      toMethodId: new Types.ObjectId(dto.toMethodId),
      amount: quoteResult.amount,
      fee: quoteResult.fee,
      total: quoteResult.total,
      status: TransferOrderStatus.SUBMITTED,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerWhatsapp: dto.customerWhatsapp || dto.customerPhone,
      userId: customerId ? new Types.ObjectId(customerId) : undefined,
      feeRuleId: quoteResult.feeRuleId ? new Types.ObjectId(quoteResult.feeRuleId) : undefined,
    });

    const savedOrder = await order.save();

    this.logger.log(`Transfer order created: ${savedOrder.orderNumber} | ${quoteResult.fromMethod.name} → ${quoteResult.toMethod.name} | Amount: ${dto.amount} | Fee: ${quoteResult.fee}`);

    // Return populated order
    return this.findOne(savedOrder._id.toString());
  }

  async updateStatus(id: string, newStatus: TransferOrderStatus): Promise<TransferOrder> {
    const order = await this.transferOrderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Transfer order not found');

    const currentStatus = order.status;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowedNext || !allowedNext.includes(newStatus)) {
      throw new ConflictException(
        `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowedNext?.join(', ') || 'none'}`,
      );
    }

    order.status = newStatus;
    await order.save();

    this.logger.log(`Transfer order ${order.orderNumber} status changed: ${currentStatus} → ${newStatus}`);

    return this.findOne(id);
  }

  async updateNotes(id: string, adminNotes: string): Promise<TransferOrder> {
    const order = await this.transferOrderModel
      .findByIdAndUpdate(id, { adminNotes }, { new: true })
      .exec();
    if (!order) throw new NotFoundException('Transfer order not found');
    return this.findOne(id);
  }

  async findAll(query: QueryTransferOrderDto): Promise<PaginatedTransferOrders> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.phone) filter.customerPhone = query.phone;

    const [data, total] = await Promise.all([
      this.transferOrderModel
        .find(filter)
        .populate('fromMethodId', 'name code')
        .populate('toMethodId', 'name code')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec() as unknown as TransferOrder[],
      this.transferOrderModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<TransferOrder> {
    const order = await this.transferOrderModel
      .findById(id)
      .populate('fromMethodId', 'name code')
      .populate('toMethodId', 'name code')
      .lean()
      .exec() as unknown as TransferOrder;
    if (!order) throw new NotFoundException('Transfer order not found');
    return order;
  }

  async findByPhone(phone: string, query: QueryTransferOrderDto): Promise<PaginatedTransferOrders> {
    return this.findAll({ ...query, phone });
  }

  async findByCustomerId(customerId: string, query: QueryTransferOrderDto): Promise<PaginatedTransferOrders> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId: new Types.ObjectId(customerId) };
    if (query.status) filter.status = query.status;

    const [data, total] = await Promise.all([
      this.transferOrderModel
        .find(filter)
        .populate('fromMethodId', 'name code')
        .populate('toMethodId', 'name code')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec() as unknown as TransferOrder[],
      this.transferOrderModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneByCustomer(id: string, customerId: string): Promise<TransferOrder> {
    const order = await this.transferOrderModel
      .findOne({ _id: id, userId: new Types.ObjectId(customerId) })
      .populate('fromMethodId', 'name code')
      .populate('toMethodId', 'name code')
      .lean()
      .exec() as unknown as TransferOrder;
    if (!order) throw new NotFoundException('Transfer order not found');
    return order;
  }
}
