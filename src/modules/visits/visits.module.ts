import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Visit, VisitSchema } from './schemas/visit.schema.js';
import { VisitsService } from './visits.service.js';
import { VisitsController } from './visits.controller.js';
import { VisitsMiddleware } from './visits.middleware.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }]),
  ],
  controllers: [VisitsController],
  providers: [VisitsService, VisitsMiddleware],
  exports: [VisitsService, VisitsMiddleware],
})
export class VisitsModule {}
