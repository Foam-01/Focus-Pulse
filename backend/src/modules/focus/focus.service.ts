import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto, UpdateGoalDto } from './dto/create-session.dto';

export interface FocusSessionRecord {
  id: string;
  date: string;
  time: string;
  duration: number;
  tag: string;
  createdAt: string;
}

@Injectable()
export class FocusService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(userId?: string): Promise<FocusSessionRecord[]> {
    const list = await this.prisma.focusSession.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
    });
    return list.map((item) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      duration: item.duration,
      tag: item.tag || 'โฟกัสทั่วไป',
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async getDailyGoal(userId?: string): Promise<number> {
    if (!userId) {
      const defaultSetting = await this.prisma.userSettings.findFirst({
        where: { id: 'default' },
      });
      return defaultSetting ? defaultSetting.dailyGoalMinutes : 480;
    }

    const settings = await this.prisma.userSettings.findFirst({
      where: { userId },
    });
    return settings ? settings.dailyGoalMinutes : 480;
  }

  async updateDailyGoal(dto: UpdateGoalDto, userId?: string): Promise<number> {
    const targetUserId = userId || 'guest';
    const existing = await this.prisma.userSettings.findFirst({
      where: { userId: targetUserId },
    });

    if (existing) {
      const updated = await this.prisma.userSettings.update({
        where: { id: existing.id },
        data: { dailyGoalMinutes: dto.dailyGoalMinutes },
      });
      return updated.dailyGoalMinutes;
    } else {
      const created = await this.prisma.userSettings.create({
        data: {
          userId: targetUserId,
          dailyGoalMinutes: dto.dailyGoalMinutes,
        },
      });
      return created.dailyGoalMinutes;
    }
  }

  async createSession(dto: CreateSessionDto, userId?: string): Promise<FocusSessionRecord> {
    const now = new Date();
    const created = await this.prisma.focusSession.create({
      data: {
        userId: userId || null,
        date: dto.date || now.toLocaleDateString('sv-SE'),
        time: dto.time || now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        duration: Number(dto.duration),
        tag: dto.tag || 'โฟกัสทั่วไป',
      },
    });

    return {
      id: created.id,
      date: created.date,
      time: created.time,
      duration: created.duration,
      tag: created.tag || 'โฟกัสทั่วไป',
      createdAt: created.createdAt.toISOString(),
    };
  }

  async updateSession(id: string, dto: any, userId?: string): Promise<FocusSessionRecord | null> {
    try {
      const updated = await this.prisma.focusSession.update({
        where: { id },
        data: {
          ...(dto.date && { date: dto.date }),
          ...(dto.time && { time: dto.time }),
          ...(dto.duration !== undefined && { duration: Number(dto.duration) }),
          ...(dto.tag && { tag: dto.tag }),
        },
      });
      return {
        id: updated.id,
        date: updated.date,
        time: updated.time,
        duration: updated.duration,
        tag: updated.tag || 'โฟกัสทั่วไป',
        createdAt: updated.createdAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async deleteSession(id: string, userId?: string): Promise<boolean> {
    try {
      await this.prisma.focusSession.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async resetAllHistory(userId?: string): Promise<void> {
    if (userId) {
      await this.prisma.focusSession.deleteMany({
        where: { userId },
      });
    } else {
      await this.prisma.focusSession.deleteMany({});
    }
  }
}
