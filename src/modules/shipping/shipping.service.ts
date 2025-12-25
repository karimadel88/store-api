import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShippingMethod } from './schemas/shipping-method.schema';
import {
  CreateShippingMethodDto,
  UpdateShippingMethodDto,
  CityPriceDto,
} from './dto/shipping-method.dto';

export interface ShippingCalculation {
  shippingMethodId: string;
  name: string;
  price: number;
  estimatedDays: number;
}

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(ShippingMethod.name) private shippingMethodModel: Model<ShippingMethod>,
  ) {}

  async create(createDto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const cityPrices = createDto.cityPrices?.map((cp) => ({
      cityId: new Types.ObjectId(cp.cityId),
      price: cp.price,
    })) || [];

    const method = new this.shippingMethodModel({
      ...createDto,
      cityPrices,
    });
    return method.save();
  }

  async findAll(includeInactive = false): Promise<ShippingMethod[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.shippingMethodModel.find(filter).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<ShippingMethod> {
    const method = await this.shippingMethodModel
      .findById(id)
      .populate('cityPrices.cityId')
      .exec();
    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }
    return method;
  }

  async update(id: string, updateDto: UpdateShippingMethodDto): Promise<ShippingMethod> {
    const method = await this.shippingMethodModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }
    return method;
  }

  async setCityPrices(id: string, cityPrices: CityPriceDto[]): Promise<ShippingMethod> {
    const prices = cityPrices.map((cp) => ({
      cityId: new Types.ObjectId(cp.cityId),
      price: cp.price,
    }));

    const method = await this.shippingMethodModel
      .findByIdAndUpdate(id, { cityPrices: prices }, { new: true })
      .populate('cityPrices.cityId')
      .exec();

    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }
    return method;
  }

  async calculateShipping(cityId: string): Promise<ShippingCalculation[]> {
    const methods = await this.shippingMethodModel.find({ isActive: true }).exec();
    const cityObjectId = new Types.ObjectId(cityId);

    return methods.map((method) => {
      const cityPrice = method.cityPrices.find(
        (cp) => cp.cityId.toString() === cityObjectId.toString(),
      );

      return {
        shippingMethodId: method._id.toString(),
        name: method.name,
        price: cityPrice ? cityPrice.price : method.basePrice,
        estimatedDays: method.estimatedDays,
      };
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.shippingMethodModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Shipping method not found');
    }
  }
}
