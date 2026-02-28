import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from './schemas/faq.schema.js';
import { FaqService } from './faq.service.js';
import { FaqController } from './faq.controller.js';
import { FaqStoreController } from './faq-store.controller.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }])],
  controllers: [FaqController, FaqStoreController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
