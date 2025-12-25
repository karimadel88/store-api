import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Customer, Address } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto, AddressDto, QueryCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  async create(createDto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerModel.findOne({ email: createDto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);
    const addresses = createDto.addresses?.map((addr) => ({
      ...addr,
      cityId: new Types.ObjectId(addr.cityId),
    })) || [];

    const customer = new this.customerModel({
      ...createDto,
      password: hashedPassword,
      addresses,
    });
    return customer.save();
  }

  async findAll(query: QueryCustomerDto): Promise<Customer[]> {
    const filter: Record<string, unknown> = {};
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }
    if (query.search) {
      filter.$or = [
        { email: { $regex: query.search, $options: 'i' } },
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
      ];
    }
    return this.customerModel
      .find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel
      .findById(id)
      .select('-password')
      .populate('wishlist')
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerModel.findOne({ email }).exec();
  }

  async update(id: string, updateDto: UpdateCustomerDto): Promise<Customer> {
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    const customer = await this.customerModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .select('-password')
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async addAddress(id: string, addressDto: AddressDto): Promise<Customer> {
    const address: Address = {
      ...addressDto,
      cityId: new Types.ObjectId(addressDto.cityId),
    } as Address;

    const customer = await this.customerModel
      .findByIdAndUpdate(
        id,
        { $push: { addresses: address } },
        { new: true },
      )
      .select('-password')
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async removeAddress(customerId: string, addressIndex: number): Promise<Customer> {
    const customer = await this.customerModel.findById(customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    customer.addresses.splice(addressIndex, 1);
    await customer.save();
    return this.findOne(customerId);
  }

  async remove(id: string): Promise<void> {
    const result = await this.customerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Customer not found');
    }
  }
}
