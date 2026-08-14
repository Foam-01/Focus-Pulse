import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { FocusService } from '../focus/focus.service';

describe('AnalyticsService Unit Tests', () => {
  let service: AnalyticsService;
  let focusServiceMock: Partial<FocusService>;

  const todayStr = new Date().toLocaleDateString('sv-SE');
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toLocaleDateString('sv-SE');

  const mockHistory = [
    {
      id: 'session-1',
      date: todayStr,
      time: '10:00',
      duration: 25,
      tag: 'โฟกัสงาน',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'session-2',
      date: todayStr,
      time: '14:30',
      duration: 50,
      tag: 'อ่านหนังสือ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'session-3',
      date: yesterdayStr,
      time: '09:00',
      duration: 30,
      tag: 'โฟกัสงาน',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    focusServiceMock = {
      getHistory: jest.fn().mockResolvedValue(mockHistory),
      getDailyGoal: jest.fn().mockResolvedValue(480),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: FocusService,
          useValue: focusServiceMock,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should calculate todayMinutes, todayRounds, yesterdayMinutes, and streak correctly', async () => {
      const summary = await service.getSummary('user-123', 'day');

      expect(focusServiceMock.getHistory).toHaveBeenCalledWith('user-123');
      expect(focusServiceMock.getDailyGoal).toHaveBeenCalledWith('user-123');

      expect(summary.todayMinutes).toBe(75); // 25 + 50
      expect(summary.todayRounds).toBe(2);
      expect(summary.yesterdayMinutes).toBe(30);
      expect(summary.dailyGoalMinutes).toBe(480);
      expect(summary.goalProgressPercent).toBe(Math.round((75 / 480) * 100)); // ~16%
      expect(summary.streakDays).toBeGreaterThanOrEqual(2); // consecutive today + yesterday
      expect(summary.chartData.length).toBe(7); // 7 days chart
    });

    it('should calculate 4-week chart aggregations for week timeframe', async () => {
      const summary = await service.getSummary('user-123', 'week');
      expect(summary.chartData.length).toBe(4); // 4 weeks
      expect(summary.chartData[3].label).toBe('สัปดาห์ 4');
    });

    it('should calculate 6-month chart aggregations for month timeframe', async () => {
      const summary = await service.getSummary('user-123', 'month');
      expect(summary.chartData.length).toBe(6); // 6 months
    });

    it('should handle zero history gracefully', async () => {
      focusServiceMock.getHistory = jest.fn().mockResolvedValue([]);
      const summary = await service.getSummary('empty-user', 'day');

      expect(summary.todayMinutes).toBe(0);
      expect(summary.todayRounds).toBe(0);
      expect(summary.streakDays).toBe(0);
      expect(summary.goalProgressPercent).toBe(0);
    });
  });
});
