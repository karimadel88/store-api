import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Media, EntityType } from './schemas/media.schema';
import { UploadMediaDto, QueryMediaDto } from './dto/media.dto';

@Injectable()
export class MediaService {
  constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {}

  async create(
    file: Express.Multer.File,
    uploadMediaDto: UploadMediaDto,
  ): Promise<Media> {
    const media = new this.mediaModel({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      entityId: uploadMediaDto.entityId
        ? new Types.ObjectId(uploadMediaDto.entityId)
        : undefined,
      entityType: uploadMediaDto.entityType,
      sortOrder: uploadMediaDto.sortOrder || 0,
    });
    return media.save();
  }

  async findAll(query: QueryMediaDto): Promise<Media[]> {
    const filter: Record<string, unknown> = {};
    if (query.entityType) {
      filter.entityType = query.entityType;
    }
    if (query.entityId) {
      filter.entityId = new Types.ObjectId(query.entityId);
    }
    return this.mediaModel.find(filter).sort({ sortOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }


  async findByEntity(entityType: EntityType, entityId: string): Promise<Media[]> {
    return this.mediaModel
      .find({
        entityType,
        entityId: new Types.ObjectId(entityId),
      })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async linkToEntity(
    mediaId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<Media> {
    const media = await this.mediaModel
      .findByIdAndUpdate(
        mediaId,
        {
          entityType,
          entityId: new Types.ObjectId(entityId),
        },
        { new: true },
      )
      .exec();
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async reorder(mediaIds: string[]): Promise<void> {
    const updates = mediaIds.map((id, index) =>
      this.mediaModel.updateOne({ _id: id }, { sortOrder: index }).exec(),
    );
    await Promise.all(updates);
  }

  async remove(id: string): Promise<void> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), media.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.mediaModel.findByIdAndDelete(id).exec();
  }

  async removeByEntity(entityType: EntityType, entityId: string): Promise<void> {
    const mediaItems = await this.findByEntity(entityType, entityId);
    for (const media of mediaItems) {
      await this.remove(media._id.toString());
    }
  }
}
