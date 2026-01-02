import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentMethod } from './schemas/payment-method.schema';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethod>,
  ) {}

  async create(createDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const existing = await this.paymentMethodModel.findOne({ code: createDto.code }).exec();
    if (existing) {
      throw new ConflictException('Payment method code already exists');
    }

    const paymentMethod = new this.paymentMethodModel({
      ...createDto,
      iconId: createDto.iconId ? new Types.ObjectId(createDto.iconId) : undefined,
    });
    return paymentMethod.save();
  }

  async findAll(includeInactive = true): Promise<PaymentMethod[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.paymentMethodModel
      .find(filter)
      .populate('iconId')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodModel.findById(id).populate('iconId').exec();
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }
    return paymentMethod;
  }

  async update(id: string, updateDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const updateData: any = { ...updateDto };
    if (updateDto.iconId) {
      updateData.iconId = new Types.ObjectId(updateDto.iconId);
    }

    const paymentMethod = await this.paymentMethodModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('iconId')
      .exec();

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }
    return paymentMethod;
  }

  async remove(id: string): Promise<void> {
    const result = await this.paymentMethodModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Payment method not found');
    }
  }
}
