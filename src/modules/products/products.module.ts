import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsStoreController } from './products-store.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [ProductsController, ProductsStoreController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
