import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  durationStr: string;
  src: string;
  poster: string;
  description: string;
  isPrimary?: boolean;
}

@Injectable()
export class VideosService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultVideo();
  }

  private async seedDefaultVideo() {
    const count = await this.prisma.videoItem.count();
    if (count === 0) {
      await this.prisma.videoItem.create({
        data: {
          id: 'vdo_ch',
          title: 'วิดีโอผ่อนคลายความเครียดหลัก',
          category: 'ผ่อนคลายหลัก',
          durationStr: 'ความคมชัดสูง',
          src: '/Vdo/ch.mp4?v=105',
          poster: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80',
          description: 'วิดีโอบรรยากาศผ่อนคลายหลักสำหรับเปิดให้อัตโนมัติเมื่อจับเวลาทำงานเสร็จสิ้น',
          isPrimary: true,
        },
      });
    }
  }

  async getAllVideos(): Promise<VideoItem[]> {
    const list = await this.prisma.videoItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Ensure primary video is sorted to position #1
    const sorted = list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    return sorted.map((v) => ({
      id: v.id,
      title: v.title,
      category: v.category,
      durationStr: v.durationStr,
      src: v.src,
      poster: v.poster,
      description: v.description,
      isPrimary: v.isPrimary,
    }));
  }

  async getVideoById(id: string): Promise<VideoItem | null> {
    const v = await this.prisma.videoItem.findUnique({ where: { id } });
    if (!v) return null;
    return {
      id: v.id,
      title: v.title,
      category: v.category,
      durationStr: v.durationStr,
      src: v.src,
      poster: v.poster,
      description: v.description,
      isPrimary: v.isPrimary,
    };
  }

  async getPrimaryVideo(): Promise<VideoItem> {
    const primary = await this.prisma.videoItem.findFirst({
      where: { isPrimary: true },
    });

    if (primary) {
      return {
        id: primary.id,
        title: primary.title,
        category: primary.category,
        durationStr: primary.durationStr,
        src: primary.src,
        poster: primary.poster,
        description: primary.description,
        isPrimary: true,
      };
    }

    const first = await this.prisma.videoItem.findFirst();
    if (first) {
      return {
        id: first.id,
        title: first.title,
        category: first.category,
        durationStr: first.durationStr,
        src: first.src,
        poster: first.poster,
        description: first.description,
        isPrimary: false,
      };
    }

    return {
      id: 'vdo_ch',
      title: 'วิดีโอผ่อนคลายความเครียดหลัก',
      category: 'ผ่อนคลายหลัก',
      durationStr: 'ความคมชัดสูง',
      src: '/Vdo/ch.mp4',
      poster: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80',
      description: 'วิดีโอบรรยากาศผ่อนคลายหลักสำหรับเปิดให้อัตโนมัติเมื่อจับเวลาทำงานเสร็จสิ้น',
      isPrimary: true,
    };
  }

  async setPrimaryVideo(id: string): Promise<VideoItem | null> {
    await this.prisma.videoItem.updateMany({
      data: { isPrimary: false },
    });

    const updated = await this.prisma.videoItem.update({
      where: { id },
      data: { isPrimary: true },
    });

    return {
      id: updated.id,
      title: updated.title,
      category: updated.category,
      durationStr: updated.durationStr,
      src: updated.src,
      poster: updated.poster,
      description: updated.description,
      isPrimary: updated.isPrimary,
    };
  }

  async addVideo(video: { title: string; category?: string; durationStr?: string; src: string; poster?: string; description?: string }): Promise<VideoItem> {
    const created = await this.prisma.videoItem.create({
      data: {
        title: video.title || 'วิดีโอผ่อนคลายใหม่',
        category: video.category || 'วิดีโอทั่วไป',
        durationStr: video.durationStr || 'วิดีโอคุณภาพ',
        src: video.src,
        poster: video.poster || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80',
        description: video.description || 'วิดีโอผ่อนคลายความเครียดที่อัปโหลดเพิ่มเข้ามา',
        isPrimary: false,
      },
    });

    return {
      id: created.id,
      title: created.title,
      category: created.category,
      durationStr: created.durationStr,
      src: created.src,
      poster: created.poster,
      description: created.description,
      isPrimary: created.isPrimary,
    };
  }

  async updateVideo(id: string, updates: Partial<VideoItem>): Promise<VideoItem | null> {
    try {
      const updated = await this.prisma.videoItem.update({
        where: { id },
        data: {
          ...(updates.title && { title: updates.title }),
          ...(updates.category && { category: updates.category }),
          ...(updates.durationStr && { durationStr: updates.durationStr }),
          ...(updates.src && { src: updates.src }),
          ...(updates.poster && { poster: updates.poster }),
          ...(updates.description && { description: updates.description }),
          ...(updates.isPrimary !== undefined && { isPrimary: updates.isPrimary }),
        },
      });

      return {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        durationStr: updated.durationStr,
        src: updated.src,
        poster: updated.poster,
        description: updated.description,
        isPrimary: updated.isPrimary,
      };
    } catch {
      return null;
    }
  }

  async deleteVideo(id: string): Promise<boolean> {
    try {
      const target = await this.prisma.videoItem.findUnique({ where: { id } });
      if (!target) return false;

      // Delete record from Prisma DB
      await this.prisma.videoItem.delete({ where: { id } });

      // Delete physical file from /public/Vdo/ folder if it is an uploaded file
      if (target.src && target.src.startsWith('/Vdo/vdo-')) {
        const fileName = path.basename(target.src);
        const filePath = path.join(process.cwd(), '..', 'frontend', 'public', 'Vdo', fileName);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn(`Failed to delete physical file: ${filePath}`, err);
          }
        }
      }

      if (target.isPrimary) {
        const firstRemaining = await this.prisma.videoItem.findFirst();
        if (firstRemaining) {
          await this.prisma.videoItem.update({
            where: { id: firstRemaining.id },
            data: { isPrimary: true },
          });
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}
