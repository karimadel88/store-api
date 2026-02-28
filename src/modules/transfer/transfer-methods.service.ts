import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransferMethod } from './schemas/transfer-method.schema.js';
import { CreateTransferMethodDto, UpdateTransferMethodDto } from './dto/transfer-method.dto.js';

@Injectable()
export class TransferMethodsService {
  constructor(
    @InjectModel(TransferMethod.name) private transferMethodModel: Model<TransferMethod>,
  ) {}

  async create(dto: CreateTransferMethodDto): Promise<TransferMethod> {
    const existing = await this.transferMethodModel
      .findOne({ code: dto.code.toUpperCase() })
      .exec();
    if (existing) {
      throw new ConflictException(`Transfer method with code "${dto.code}" already exists`);
    }
    const method = new this.transferMethodModel({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return method.save();
  }

  async findAll(): Promise<TransferMethod[]> {
    return this.transferMethodModel
      .find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec() as unknown as TransferMethod[];
  }

  async findAllEnabled(): Promise<TransferMethod[]> {
    return this.transferMethodModel
      .find({ enabled: true })
      .sort({ sortOrder: 1 })
      .lean()
      .exec() as unknown as TransferMethod[];
  }

  async findOne(id: string): Promise<TransferMethod> {
    const method = await this.transferMethodModel
      .findById(id)
      .lean()
      .exec() as unknown as TransferMethod;
    if (!method) throw new NotFoundException('Transfer method not found');
    return method;
  }

  async findByCode(code: string): Promise<TransferMethod | null> {
    return this.transferMethodModel
      .findOne({ code: code.toUpperCase() })
      .lean()
      .exec() as unknown as TransferMethod | null;
  }

  async update(id: string, dto: UpdateTransferMethodDto): Promise<TransferMethod> {
    if (dto.code) {
      dto.code = dto.code.toUpperCase();
      const existing = await this.transferMethodModel
        .findOne({ code: dto.code, _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException(`Transfer method with code "${dto.code}" already exists`);
      }
    }
    const method = await this.transferMethodModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!method) throw new NotFoundException('Transfer method not found');
    return method;
  }

  async remove(id: string): Promise<void> {
    const result = await this.transferMethodModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Transfer method not found');
  }
}
