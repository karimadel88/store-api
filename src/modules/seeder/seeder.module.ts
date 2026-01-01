import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Banner, BannerSchema } from '../banners/schemas/banner.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Media, MediaSchema } from '../media/schemas/media.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Media.name, schema: MediaSchema },
    ]),
  ],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
