import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schemas/blog.schema.js';
import { BlogService } from './blog.service.js';
import { BlogController } from './blog.controller.js';
import { BlogStoreController } from './blog-store.controller.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
  controllers: [BlogController, BlogStoreController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
