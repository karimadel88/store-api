import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { BannersModule } from '../banners/banners.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    BannersModule,
    CategoriesModule,
    ProductsModule,
    SettingsModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
