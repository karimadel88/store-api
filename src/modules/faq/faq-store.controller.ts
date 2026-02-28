import { Controller, Get } from '@nestjs/common';
import { FaqService } from './faq.service.js';

@Controller('faqs')
export class FaqStoreController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  findAll() {
    return this.faqService.findAll();
  }
}
