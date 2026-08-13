'use client';

import React, { useEffect, useState } from 'react';
import { AnalyticsSummary } from '../../types';
import { ApiService } from '../../services/api';
import { KPICard } from './KPICard';
import { AnalyticsChart } from './AnalyticsChart';
import { GoalStepper } from './GoalStepper';

export const DashboardView: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');

  const fetchAnalytics = async () => {
    const data = await ApiService.getAnalyticsSummary(timeframe);
    setSummary(data);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleUpdateGoal = async (newGoal: number) => {
    await ApiService.updateDailyGoal(newGoal);
    fetchAnalytics();
  };

  if (!summary) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลดข้อมูล...</div>;
  }

  const hoursToday = (summary.todayMinutes / 60).toFixed(1).replace('.0', '');

  return (
    <div>
      {/* Top KPI Cards Grid (Styled after Image 2 reference with dark theme accents) */}
      <div className="kpi-cards-grid">
        <KPICard
          title="เวลาโฟกัสวันนี้"
          value={`${summary.todayMinutes} นาที`}
          sub={`ประมาณ ${hoursToday} ชั่วโมง`}
          accentColor="#60a5fa"
          bgTint="rgba(59, 130, 246, 0.08)"
          borderColor="rgba(59, 130, 246, 0.25)"
        />
        <KPICard
          title="รอบที่สำเร็จ"
          value={`${summary.todayRounds} รอบ`}
          sub="รอบละ 25 นาที"
          accentColor="#34d399"
          bgTint="rgba(16, 185, 129, 0.08)"
          borderColor="rgba(16, 185, 129, 0.25)"
        />
        <KPICard
          title="เป้าหมายประจำวัน"
          value={`${summary.goalProgressPercent}%`}
          sub={`เป้าหมาย ${summary.dailyGoalMinutes} นาที`}
          accentColor="#fbbf24"
          bgTint="rgba(245, 158, 11, 0.08)"
          borderColor="rgba(245, 158, 11, 0.25)"
        />
        <KPICard
          title="ทำต่อเนื่อง"
          value={`${summary.streakDays} วัน`}
          sub="สะสมต่อเนื่อง"
          accentColor="#f472b6"
          bgTint="rgba(236, 72, 153, 0.08)"
          borderColor="rgba(236, 72, 153, 0.25)"
        />
      </div>

      {/* Goal Stepper Section */}
      <GoalStepper dailyGoalMinutes={summary.dailyGoalMinutes} onUpdateGoal={handleUpdateGoal} />

      {/* SVG Analytics Chart Section */}
      <AnalyticsChart data={summary.chartData} timeframe={timeframe} setTimeframe={setTimeframe} />
    </div>
  );
};
