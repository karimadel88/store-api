import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schemas/offer.schema.js';
import { OffersService } from './offers.service.js';
import { OffersController } from './offers.controller.js';
import { OffersStoreController } from './offers-store.controller.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }])],
  controllers: [OffersController, OffersStoreController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
