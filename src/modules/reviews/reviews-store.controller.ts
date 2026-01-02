import { Controller, Post, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';

// Test
@Controller('reviews')
export class ReviewsStoreController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createDto: CreateReviewDto) {
    return this.reviewsService.create(createDto);
  }
}
