import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingsStoreController } from './settings-store.controller';
import { Settings, SettingsSchema } from './schemas/settings.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }])],
  controllers: [SettingsController, SettingsStoreController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
