export interface FocusSessionRecord {
  id: string;
  date: string;
  time: string;
  duration: number;
  tag: string;
  createdAt?: string;
}

export interface AnalyticsSummary {
  todayMinutes: number;
  todayRounds: number;
  dailyGoalMinutes: number;
  goalProgressPercent: number;
  yesterdayMinutes: number;
  streakDays: number;
  chartData: { label: string; value: number }[];
}

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

export interface MultiTimerPreset {
  id: string;
  title: string;
  totalSeconds: number;
}

export interface AlarmItem {
  id: string;
  hour: number; // 0 - 23
  minute: number; // 0 - 59
  label: string;
  isEnabled: boolean;
  repeatDays: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  sound?: string;
  snoozeMinutes?: number;
}

export interface LapRecord {
  id: string;
  lapNumber: number;
  lapTimeMs: number;
  totalTimeMs: number;
}

export type ActiveView = 'dashboardView' | 'timerView' | 'multiTimerView' | 'alarmView' | 'stopwatchView' | 'videoLibraryView';
