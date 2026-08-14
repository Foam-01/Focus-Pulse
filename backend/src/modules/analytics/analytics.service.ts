import { Injectable } from '@nestjs/common';
import { FocusService } from '../focus/focus.service';

export interface AnalyticsSummary {
  todayMinutes: number;
  todayRounds: number;
  dailyGoalMinutes: number;
  goalProgressPercent: number;
  yesterdayMinutes: number;
  streakDays: number;
  chartData: { label: string; value: number }[];
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly focusService: FocusService) {}

  async getSummary(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<AnalyticsSummary> {
    const history = await this.focusService.getHistory();
    const dailyGoalMinutes = await this.focusService.getDailyGoal();

    const todayStr = new Date().toLocaleDateString('sv-SE');
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toLocaleDateString('sv-SE');

    let todayMinutes = 0;
    let todayRounds = 0;
    let yesterdayMinutes = 0;

    history.forEach((record) => {
      if (record.date === todayStr) {
        todayMinutes += record.duration;
        todayRounds += 1;
      } else if (record.date === yesterdayStr) {
        yesterdayMinutes += record.duration;
      }
    });

    const goalProgressPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

    // Calculate Streak Days
    const streakDays = this.calculateStreak(history);

    // Pre-aggregate durations by date for O(1) lookup speed
    const dateMap = new Map<string, number>();
    history.forEach((record) => {
      dateMap.set(record.date, (dateMap.get(record.date) || 0) + record.duration);
    });

    // Calculate Chart Data based on timeframe using 100% real history records
    const chartData = this.generateChartData(dateMap, history, timeframe);

    return {
      todayMinutes,
      todayRounds,
      dailyGoalMinutes,
      goalProgressPercent,
      yesterdayMinutes,
      streakDays,
      chartData,
    };
  }

  private calculateStreak(history: any[]): number {
    if (history.length === 0) return 0;

    const uniqueDates = Array.from(new Set(history.map((h) => h.date))).sort().reverse();
    const todayStr = new Date().toLocaleDateString('sv-SE');
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toLocaleDateString('sv-SE');

    let streak = 0;
    let checkDate = new Date();

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      if (!uniqueDates.includes(todayStr)) {
        checkDate = yesterdayObj;
      }

      while (true) {
        const dateStr = checkDate.toLocaleDateString('sv-SE');
        if (uniqueDates.includes(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return streak;
  }

  private generateChartData(dateMap: Map<string, number>, history: any[], timeframe: 'day' | 'week' | 'month') {
    const chartMap = new Map<string, number>();

    if (timeframe === 'day') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('th-TH', { weekday: 'short' });
        const dateStr = d.toLocaleDateString('sv-SE');
        
        const dayTotal = dateMap.get(dateStr) || 0;
        chartMap.set(key, dayTotal);
      }
    } else if (timeframe === 'week') {
      const now = new Date();
      for (let i = 3; i >= 0; i--) {
        const weekNum = 4 - i;
        const label = `สัปดาห์ ${weekNum}`;
        const endDaysAgo = i * 7;
        const startDaysAgo = (i + 1) * 7 - 1;

        const startDate = new Date();
        startDate.setDate(now.getDate() - startDaysAgo);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setDate(now.getDate() - endDaysAgo);
        endDate.setHours(23, 59, 59, 999);

        let weekTotal = 0;
        history.forEach((rec) => {
          if (rec.date) {
            const recDate = new Date(rec.date);
            if (recDate >= startDate && recDate <= endDate) {
              weekTotal += rec.duration;
            }
          }
        });
        chartMap.set(label, weekTotal);
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString('th-TH', { month: 'short' });
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        let monthTotal = 0;
        history.forEach((rec) => {
          if (rec.date && rec.date.startsWith(yearMonth)) {
            monthTotal += rec.duration;
          }
        });
        chartMap.set(label, monthTotal);
      }
    }

    return Array.from(chartMap.entries()).map(([label, value]) => ({ label, value }));
  }
}
