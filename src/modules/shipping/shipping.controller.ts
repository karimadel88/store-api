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
import { ShippingService } from './shipping.service';
import {
  CreateShippingMethodDto,
  UpdateShippingMethodDto,
  SetCityPricesDto,
  CalculateShippingDto,
} from './dto/shipping-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/shipping-methods')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  create(@Body() createDto: CreateShippingMethodDto) {
    return this.shippingService.create(createDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.shippingService.findAll(includeInactive === 'true');
  }

  @Get('calculate')
  calculateShipping(@Query() query: CalculateShippingDto) {
    return this.shippingService.calculateShipping(query.cityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateShippingMethodDto) {
    return this.shippingService.update(id, updateDto);
  }

  @Post(':id/city-prices')
  setCityPrices(@Param('id') id: string, @Body() dto: SetCityPricesDto) {
    return this.shippingService.setCityPrices(id, dto.cityPrices);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}
