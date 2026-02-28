import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog } from './schemas/blog.schema.js';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto.js';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async create(dto: CreateBlogDto): Promise<Blog> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.imageId) data.imageId = new Types.ObjectId(dto.imageId);
    const blog = new this.blogModel(data);
    return blog.save();
  }

  async findAll(includeInactive = false): Promise<any[]> {
    const filter = includeInactive ? {} : { isActive: true };
    const blogs = await this.blogModel
      .find(filter)
      .populate('imageId')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .exec();

    const baseUrl = process.env.BASE_URL || '';
    return blogs.map((blog: any) => {
      if (blog.imageId && blog.imageId.url && blog.imageId.url.startsWith('/')) {
        blog.imageId.url = `${baseUrl}${blog.imageId.url}`;
      }
      return blog;
    });
  }

  async findOne(id: string): Promise<any> {
    const blog = await this.blogModel.findById(id).populate('imageId').lean().exec() as any;
    if (!blog) throw new NotFoundException('Blog post not found');

    const baseUrl = process.env.BASE_URL || '';
    if (blog.imageId && blog.imageId.url && blog.imageId.url.startsWith('/')) {
      blog.imageId.url = `${baseUrl}${blog.imageId.url}`;
    }

    return blog;
  }

  async update(id: string, dto: UpdateBlogDto): Promise<Blog> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.imageId) data.imageId = new Types.ObjectId(dto.imageId);
    const blog = await this.blogModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!blog) throw new NotFoundException('Blog post not found');
    return blog;
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Blog post not found');
  }
}
