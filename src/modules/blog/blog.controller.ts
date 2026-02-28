import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service.js';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('admin/blogs')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() dto: CreateBlogDto) {
    return this.blogService.create(dto);
  }

  @Get()
  findAll() {
    return this.blogService.findAll(true);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
