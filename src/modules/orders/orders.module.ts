import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersStoreController } from './orders-store.controller';
import { Order, OrderSchema } from './schemas/order.schema';

import { ProductsModule } from '../products/products.module';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
    ShippingModule,
  ],
  controllers: [OrdersController, OrdersStoreController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
