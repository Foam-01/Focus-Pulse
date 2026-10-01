import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto, UpdateGoalDto, UpdateSessionDto } from './dto/create-session.dto';

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

  // Builds a Prisma `where` clause equivalent to HistoryView's client-side
  // filter predicate: tag match is case-insensitive substring, date/time are
  // case-sensitive substring, and an empty/undefined search matches everything.
  private buildHistoryWhere(userId?: string, tag?: string, search?: string) {
    const where: any = userId ? { userId } : {};
    if (tag && tag !== 'all') {
      where.tag = tag;
    }
    if (search) {
      where.OR = [
        { tag: { contains: search, mode: 'insensitive' } },
        { date: { contains: search } },
        { time: { contains: search } },
      ];
    }
    return where;
  }

  async getHistory(
    userId?: string,
    page?: number,
    pageSize?: number,
    tag?: string,
    search?: string,
  ): Promise<FocusSessionRecord[]> {
    // Optional pagination: when neither page nor pageSize is provided, behavior
    // is unchanged — returns the full dataset exactly as before.
    const usePagination = page !== undefined || pageSize !== undefined;
    const take = usePagination ? (pageSize && pageSize > 0 ? pageSize : 20) : undefined;
    const skip = usePagination ? (take as number) * (page && page > 0 ? page - 1 : 0) : undefined;

    const list = await this.prisma.focusSession.findMany({
      where: this.buildHistoryWhere(userId, tag, search),
      orderBy: { createdAt: 'desc' },
      ...(take !== undefined ? { take } : {}),
      ...(skip !== undefined ? { skip } : {}),
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

  // Lightweight aggregate stats computed entirely in the DB (count/sum/groupBy),
  // used by HistoryView so it doesn't need to download the full history list
  // just to show totals / per-tag counts. Optional tag/search filters let the
  // same endpoint also report the *filtered* count for pagination labels.
  async getHistoryStats(
    userId?: string,
    tag?: string,
    search?: string,
  ): Promise<{ totalCount: number; totalMinutes: number; tagCounts: Record<string, number> }> {
    const where = this.buildHistoryWhere(userId, tag, search);

    const [totalCount, aggregate, grouped] = await Promise.all([
      this.prisma.focusSession.count({ where }),
      this.prisma.focusSession.aggregate({ where, _sum: { duration: true } }),
      this.prisma.focusSession.groupBy({
        by: ['tag'],
        where: userId ? { userId } : {},
        _count: { tag: true },
      }),
    ]);

    const tagCounts: Record<string, number> = {};
    for (const g of grouped) {
      const key = g.tag || 'โฟกัสทั่วไป';
      tagCounts[key] = (tagCounts[key] || 0) + g._count.tag;
    }

    return {
      totalCount,
      totalMinutes: aggregate._sum.duration || 0,
      tagCounts,
    };
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

  private async ensureUser(userId?: string, email?: string): Promise<void> {
    if (!userId || userId === 'guest') return;
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: email || `${userId}@placeholder.local` },
    });
  }

  async updateDailyGoal(dto: UpdateGoalDto, userId?: string, email?: string): Promise<number> {
    await this.ensureUser(userId, email);
    const targetUserId = userId && userId !== 'guest' ? userId : null;

    if (targetUserId) {
      // A-4: Authenticated users — upsert by unique userId (1 query instead of 2)
      const upserted = await this.prisma.userSettings.upsert({
        where: { userId: targetUserId },
        update: { dailyGoalMinutes: dto.dailyGoalMinutes },
        create: {
          userId: targetUserId,
          dailyGoalMinutes: dto.dailyGoalMinutes,
        },
      });
      return upserted.dailyGoalMinutes;
    }

    // Guest / null userId: PostgreSQL allows multiple NULL in unique columns,
    // so upsert by userId=null is not reliable — keep findFirst pattern
    const existing = await this.prisma.userSettings.findFirst({
      where: { userId: null },
    });
    if (existing) {
      const updated = await this.prisma.userSettings.update({
        where: { id: existing.id },
        data: { dailyGoalMinutes: dto.dailyGoalMinutes },
      });
      return updated.dailyGoalMinutes;
    }
    const created = await this.prisma.userSettings.create({
      data: { userId: null, dailyGoalMinutes: dto.dailyGoalMinutes },
    });
    return created.dailyGoalMinutes;
  }


  async createSession(dto: CreateSessionDto, userId?: string, email?: string): Promise<FocusSessionRecord> {
    await this.ensureUser(userId, email);
    const now = new Date();
    const created = await this.prisma.focusSession.create({
      data: {
        userId: userId && userId !== 'guest' ? userId : null,
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

  async updateSession(id: string, dto: UpdateSessionDto, userId?: string): Promise<FocusSessionRecord | null> {
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
