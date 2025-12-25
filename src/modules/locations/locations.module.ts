import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { LocationsStoreController } from './locations-store.controller';
import { Country, CountrySchema } from './schemas/country.schema';
import { City, CitySchema } from './schemas/city.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      { name: City.name, schema: CitySchema },
    ]),
  ],
  controllers: [LocationsController, LocationsStoreController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
