import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { QueryCityDto } from './dto/city.dto';

@Controller()
export class LocationsStoreController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  findAllCountries() {
    return this.locationsService.findAllCountries(false); // Only active countries
  }

  @Get('cities')
  findAllCities(@Query() query: QueryCityDto) {
    return this.locationsService.findAllCities(query);
  }
}
