import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service.js';
import { CreateOfferDto, UpdateOfferDto } from './dto/offer.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('admin/offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  @Get()
  findAll() {
    return this.offersService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
}
