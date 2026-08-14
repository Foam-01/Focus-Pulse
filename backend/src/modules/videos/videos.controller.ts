import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { VideosService, VideoItem } from './videos.service';

const uploadDir = path.join(process.cwd(), '..', 'frontend', 'public', 'Vdo');

@ApiTags('Video Library')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Get ambient video library list' })
  async getAllVideos(): Promise<VideoItem[]> {
    return await this.videosService.getAllVideos();
  }

  @Get('primary')
  async getPrimaryVideo(): Promise<VideoItem> {
    return await this.videosService.getPrimaryVideo();
  }

  @Post('primary')
  async setPrimaryVideo(@Body() body: { id: string }): Promise<VideoItem> {
    const updated = await this.videosService.setPrimaryVideo(body.id);
    if (!updated) {
      throw new NotFoundException(`Video with ID ${body.id} not found`);
    }
    return updated;
  }

  @Post()
  async createVideo(
    @Body()
    body: {
      title: string;
      category?: string;
      durationStr?: string;
      src: string;
      poster?: string;
      description?: string;
    },
  ): Promise<VideoItem> {
    return await this.videosService.addVideo(body);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname) || '.mp4';
          cb(null, `vdo-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadVideoFile(
    @UploadedFile() file: any,
    @Body() body: { title?: string; category?: string; description?: string },
  ): Promise<VideoItem> {
    const fileUrl = file ? `/Vdo/${file.filename}` : '/Vdo/ch.mp4';
    return await this.videosService.addVideo({
      title: body.title || (file ? file.originalname : 'วิดีโอที่อัปโหลดใหม่'),
      category: body.category || 'อัปโหลดเอง',
      durationStr: 'Uploaded Video',
      src: fileUrl,
      description: body.description || 'วิดีโอผ่อนคลายที่อัปโหลดเข้ามาในระบบ',
    });
  }

  @Put(':id')
  async updateVideo(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      category?: string;
      durationStr?: string;
      src?: string;
      poster?: string;
      description?: string;
    },
  ): Promise<VideoItem> {
    const updated = await this.videosService.updateVideo(id, body);
    if (!updated) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string): Promise<{ success: boolean }> {
    const deleted = await this.videosService.deleteVideo(id);
    if (!deleted) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return { success: true };
  }

  @Get(':id')
  async getVideoById(@Param('id') id: string): Promise<VideoItem> {
    const video = await this.videosService.getVideoById(id);
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }
}
