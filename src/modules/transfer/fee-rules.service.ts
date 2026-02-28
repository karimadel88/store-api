import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeeRule } from './schemas/fee-rule.schema.js';
import { CreateFeeRuleDto, UpdateFeeRuleDto } from './dto/fee-rule.dto.js';

@Injectable()
export class FeeRulesService {
  constructor(
    @InjectModel(FeeRule.name) private feeRuleModel: Model<FeeRule>,
  ) {}

  async create(dto: CreateFeeRuleDto): Promise<FeeRule> {
    const rule = new this.feeRuleModel({
      ...dto,
      fromMethodId: new Types.ObjectId(dto.fromMethodId),
      toMethodId: new Types.ObjectId(dto.toMethodId),
    });
    return rule.save();
  }

  async findAll(): Promise<FeeRule[]> {
    return this.feeRuleModel
      .find()
      .populate('fromMethodId', 'name code')
      .populate('toMethodId', 'name code')
      .sort({ priority: -1, createdAt: -1 })
      .lean()
      .exec() as unknown as FeeRule[];
  }

  async findOne(id: string): Promise<FeeRule> {
    const rule = await this.feeRuleModel
      .findById(id)
      .populate('fromMethodId', 'name code')
      .populate('toMethodId', 'name code')
      .lean()
      .exec() as unknown as FeeRule;
    if (!rule) throw new NotFoundException('Fee rule not found');
    return rule;
  }

  async findBestRule(fromMethodId: string, toMethodId: string): Promise<FeeRule | null> {
    return this.feeRuleModel
      .findOne({
        fromMethodId: new Types.ObjectId(fromMethodId),
        toMethodId: new Types.ObjectId(toMethodId),
        enabled: true,
      })
      .sort({ priority: -1 })
      .lean()
      .exec() as unknown as FeeRule | null;
  }

  async update(id: string, dto: UpdateFeeRuleDto): Promise<FeeRule> {
    const updateData: Record<string, unknown> = { ...dto };
    if (dto.fromMethodId) updateData.fromMethodId = new Types.ObjectId(dto.fromMethodId);
    if (dto.toMethodId) updateData.toMethodId = new Types.ObjectId(dto.toMethodId);

    const rule = await this.feeRuleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!rule) throw new NotFoundException('Fee rule not found');
    return rule;
  }

  async remove(id: string): Promise<void> {
    const result = await this.feeRuleModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Fee rule not found');
  }
}
