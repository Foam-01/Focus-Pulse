'use client';

import React, { useEffect, useState } from 'react';
import { AnalyticsSummary } from '../../types';
import { ApiService } from '../../services/api';
import { KPICard } from './KPICard';
import { AnalyticsChart } from './AnalyticsChart';
import { GoalStepper } from './GoalStepper';
import { Timer, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTimer?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTimer }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');

  const fetchAnalytics = async () => {
    const data = await ApiService.getAnalyticsSummary(timeframe);
    setSummary(data);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const handleUpdateGoal = (newGoal: number) => {
    // Optimistic UI Update: Change screen numbers instantly (0ms response)
    setSummary((prev) => {
      if (!prev) return null;
      const goalProgressPercent = Math.min(100, Math.round((prev.todayMinutes / newGoal) * 100));
      return {
        ...prev,
        dailyGoalMinutes: newGoal,
        goalProgressPercent,
      };
    });

    // Background sync to DB without blocking the user interface
    ApiService.updateDailyGoal(newGoal).catch((err) => console.error(err));
  };

  if (!summary) {
    return (
      <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--border-card)', borderTopColor: 'var(--blue-sky)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
        <div>กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  const hoursToday = (summary.todayMinutes / 60).toFixed(1).replace('.0', '');

  return (
    <div>
      {/* Quick Action CTA Banner for First-Time / Returning Users */}
      {onNavigateToTimer && (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.2rem 1.6rem',
            marginBottom: '1.8rem',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(96, 165, 250, 0.08))',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Timer size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                พร้อมเริ่มโฟกัสงานตอนนี้หรือยัง?
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                กดปุ่มเริ่มจับเวลาเพื่อสะสมนาทีโฟกัสและพิชิตเป้าหมายประจำวันของคุณ
              </p>
            </div>
          </div>

          <button
            className="btn-primary-gradient"
            onClick={onNavigateToTimer}
            style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>เริ่มจับเวลาโฟกัส</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Top KPI Cards Grid */}
      <div className="kpi-cards-grid">
        <KPICard
          title="เวลาโฟกัสวันนี้"
          value={`${summary.todayMinutes} นาที`}
          sub={`รวม ${hoursToday} ชั่วโมง`}
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
