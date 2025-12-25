import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateCountryDto, UpdateCountryDto } from './dto/country.dto';
import { CreateCityDto, UpdateCityDto, QueryCityDto } from './dto/city.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // Country endpoints
  @Post('countries')
  createCountry(@Body() createCountryDto: CreateCountryDto) {
    return this.locationsService.createCountry(createCountryDto);
  }

  @Get('countries')
  findAllCountries(@Query('includeInactive') includeInactive?: string) {
    return this.locationsService.findAllCountries(includeInactive === 'true');
  }

  @Get('countries/:id')
  findCountry(@Param('id') id: string) {
    return this.locationsService.findCountry(id);
  }

  @Patch('countries/:id')
  updateCountry(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.locationsService.updateCountry(id, updateCountryDto);
  }

  @Delete('countries/:id')
  removeCountry(@Param('id') id: string) {
    return this.locationsService.removeCountry(id);
  }

  // City endpoints
  @Post('cities')
  createCity(@Body() createCityDto: CreateCityDto) {
    return this.locationsService.createCity(createCityDto);
  }

  @Get('cities')
  findAllCities(@Query() query: QueryCityDto) {
    return this.locationsService.findAllCities(query);
  }

  @Get('cities/:id')
  findCity(@Param('id') id: string) {
    return this.locationsService.findCity(id);
  }

  @Patch('cities/:id')
  updateCity(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.locationsService.updateCity(id, updateCityDto);
  }

  @Delete('cities/:id')
  removeCity(@Param('id') id: string) {
    return this.locationsService.removeCity(id);
  }
}
