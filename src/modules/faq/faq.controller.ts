import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service.js';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('admin/faqs')
@UseGuards(JwtAuthGuard)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqService.create(dto);
  }

  @Get()
  findAll() {
    return this.faqService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
