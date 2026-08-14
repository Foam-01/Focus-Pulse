import { Test, TestingModule } from '@nestjs/testing';
import { FocusService } from './focus.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FocusService Unit Tests', () => {
  let service: FocusService;
  let prismaServiceMock: any;

  const mockRecord = {
    id: 'uuid-session-1',
    userId: 'user-abc',
    date: '2026-08-14',
    time: '10:00',
    duration: 25,
    tag: 'โฟกัสงาน',
    createdAt: new Date('2026-08-14T10:00:00Z'),
  };

  const mockSettings = {
    id: 'setting-1',
    userId: 'user-abc',
    dailyGoalMinutes: 300,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaServiceMock = {
      focusSession: {
        findMany: jest.fn().mockResolvedValue([mockRecord]),
        create: jest.fn().mockResolvedValue(mockRecord),
        update: jest.fn().mockResolvedValue(mockRecord),
        delete: jest.fn().mockResolvedValue(mockRecord),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      userSettings: {
        findFirst: jest.fn().mockResolvedValue(mockSettings),
        create: jest.fn().mockResolvedValue(mockSettings),
        update: jest.fn().mockResolvedValue(mockSettings),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FocusService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<FocusService>(FocusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHistory', () => {
    it('should filter focus history by userId', async () => {
      const history = await service.getHistory('user-abc');

      expect(prismaServiceMock.focusSession.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-abc' },
        orderBy: { createdAt: 'desc' },
      });
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('uuid-session-1');
      expect(history[0].duration).toBe(25);
    });
  });

  describe('createSession', () => {
    it('should create focus session scoped to userId', async () => {
      const result = await service.createSession(
        { duration: 45, tag: 'อ่านหนังสือ', date: '2026-08-14', time: '11:00' },
        'user-abc',
      );

      expect(prismaServiceMock.focusSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-abc',
          duration: 45,
          tag: 'อ่านหนังสือ',
        }),
      });
      expect(result).toBeDefined();
    });
  });

  describe('getDailyGoal & updateDailyGoal', () => {
    it('should return daily goal for specific userId', async () => {
      const goal = await service.getDailyGoal('user-abc');
      expect(goal).toBe(300);
    });

    it('should update daily goal for userId', async () => {
      const updatedGoal = await service.updateDailyGoal({ dailyGoalMinutes: 400 }, 'user-abc');
      expect(updatedGoal).toBe(300); // returns mockSettings dailyGoalMinutes
    });
  });

  describe('resetAllHistory', () => {
    it('should clear sessions scoped only to target userId', async () => {
      await service.resetAllHistory('user-abc');
      expect(prismaServiceMock.focusSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-abc' },
      });
    });
  });
});
