import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { UploadMediaDto, ReorderMediaDto, QueryMediaDto } from './dto/media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Manual validation
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Validation failed: current file type is ${file.mimetype}, expected one of: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Validation failed: File size exceeds 5MB');
    }

    return this.mediaService.create(file, uploadMediaDto);
  }

  @Get()
  async findAll(@Query() query: QueryMediaDto) {
    return this.mediaService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch('reorder')
  async reorder(@Body() reorderDto: ReorderMediaDto) {
    await this.mediaService.reorder(reorderDto.mediaIds);
    return { message: 'Media reordered successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.mediaService.remove(id);
    return { message: 'Media deleted successfully' };
  }
}
