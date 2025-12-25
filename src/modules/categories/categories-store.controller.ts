import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesStoreController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAllWithStats();
  }

  @Get('tree')
  findTree() {
    return this.categoriesService.findTree();
  }
}
