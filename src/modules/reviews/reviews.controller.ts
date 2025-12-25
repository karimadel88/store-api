import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, QueryReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createDto: CreateReviewDto) { return this.reviewsService.create(createDto); }

  @Get()
  findAll(@Query() query: QueryReviewDto) { return this.reviewsService.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.reviewsService.findOne(id); }

  @Patch(':id/approve')
  approve(@Param('id') id: string) { return this.reviewsService.approve(id); }

  @Patch(':id/reject')
  reject(@Param('id') id: string) { return this.reviewsService.reject(id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.reviewsService.remove(id); }
}
