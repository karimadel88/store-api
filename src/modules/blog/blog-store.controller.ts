import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service.js';

@Controller('blogs')
export class BlogStoreController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }
}
