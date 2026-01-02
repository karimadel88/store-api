import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MediaModule } from './modules/media/media.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ContactModule } from './modules/contact/contact.module';
import { BannersModule } from './modules/banners/banners.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { HomeModule } from './modules/home/home.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { BrandsModule } from './modules/brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting: 100 requests per minute
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // MongoDB with connection pooling
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    MediaModule,
    CategoriesModule,
    ProductsModule,
    LocationsModule,
    ShippingModule,
    CustomersModule,
    OrdersModule,
    CouponsModule,
    ReviewsModule,
    SettingsModule,
    DashboardModule,
    ContactModule,
    BannersModule,
    SeederModule,
    InventoryModule,
    CustomerAuthModule,
    HomeModule,
    PaymentMethodsModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

