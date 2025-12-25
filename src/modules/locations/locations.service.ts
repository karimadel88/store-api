import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Country } from './schemas/country.schema';
import { City } from './schemas/city.schema';
import { CreateCountryDto, UpdateCountryDto } from './dto/country.dto';
import { CreateCityDto, UpdateCityDto, QueryCityDto } from './dto/city.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<Country>,
    @InjectModel(City.name) private cityModel: Model<City>,
  ) {}

  // Country methods
  async createCountry(createCountryDto: CreateCountryDto): Promise<Country> {
    const existing = await this.countryModel.findOne({ code: createCountryDto.code.toUpperCase() }).exec();
    if (existing) {
      throw new ConflictException('Country with this code already exists');
    }
    const country = new this.countryModel({
      ...createCountryDto,
      code: createCountryDto.code.toUpperCase(),
    });
    return country.save();
  }

  async findAllCountries(includeInactive = false): Promise<Country[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.countryModel.find(filter).sort({ name: 1 }).exec();
  }

  async findCountry(id: string): Promise<Country> {
    const country = await this.countryModel.findById(id).exec();
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    return country;
  }

  async updateCountry(id: string, updateCountryDto: UpdateCountryDto): Promise<Country> {
    if (updateCountryDto.code) {
      updateCountryDto.code = updateCountryDto.code.toUpperCase();
    }
    const country = await this.countryModel.findByIdAndUpdate(id, updateCountryDto, { new: true }).exec();
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    return country;
  }

  async removeCountry(id: string): Promise<void> {
    const hasCities = await this.cityModel.exists({ countryId: id });
    if (hasCities) {
      throw new ConflictException('Cannot delete country with cities');
    }
    const result = await this.countryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Country not found');
    }
  }

  // City methods
  async createCity(createCityDto: CreateCityDto): Promise<City> {
    const country = await this.countryModel.findById(createCityDto.countryId).exec();
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    const city = new this.cityModel({
      ...createCityDto,
      countryId: new Types.ObjectId(createCityDto.countryId),
    });
    return city.save();
  }

  async findAllCities(query: QueryCityDto): Promise<City[]> {
    const filter: Record<string, unknown> = { isActive: true };
    if (query.countryId) {
      filter.countryId = new Types.ObjectId(query.countryId);
    }
    return this.cityModel.find(filter).populate('countryId').sort({ name: 1 }).exec();
  }

  async findCity(id: string): Promise<City> {
    const city = await this.cityModel.findById(id).populate('countryId').exec();
    if (!city) {
      throw new NotFoundException('City not found');
    }
    return city;
  }

  async updateCity(id: string, updateCityDto: UpdateCityDto): Promise<City> {
    const updateData: Record<string, unknown> = { ...updateCityDto };
    if (updateCityDto.countryId) {
      updateData.countryId = new Types.ObjectId(updateCityDto.countryId);
    }
    const city = await this.cityModel.findByIdAndUpdate(id, updateData, { new: true }).populate('countryId').exec();
    if (!city) {
      throw new NotFoundException('City not found');
    }
    return city;
  }

  async removeCity(id: string): Promise<void> {
    const result = await this.cityModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('City not found');
    }
  }
}
