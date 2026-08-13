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

export type ActiveView = 'dashboardView' | 'timerView' | 'multiTimerView' | 'videoLibraryView';
