import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsStoreController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductDto) {
    // Force isActive to true for public store
    query.isActive = true;
    return this.productsService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
