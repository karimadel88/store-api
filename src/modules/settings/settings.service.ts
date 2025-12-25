import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Settings.name) private settingsModel: Model<Settings>) {}

  async get(): Promise<Settings> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({ storeName: 'Store' });
    }
    return settings;
  }

  async update(updateDto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.get();
    
    // Strip metadata fields
    delete updateDto._id;
    delete updateDto.createdAt;
    delete updateDto.updatedAt;
    delete updateDto.__v;

    Object.assign(settings, updateDto);
    return settings.save();
  }
}
