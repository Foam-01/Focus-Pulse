'use client';

import React from 'react';
import { Plus, Minus, Target, Sparkles } from 'lucide-react';

interface GoalStepperProps {
  dailyGoalMinutes: number;
  onUpdateGoal: (newGoal: number) => void;
}

export const GoalStepper: React.FC<GoalStepperProps> = ({ dailyGoalMinutes, onUpdateGoal }) => {
  const goalHours = (dailyGoalMinutes / 60).toFixed(1).replace('.0', '');

  const presets = [
    { label: '4 ชั่วโมง', value: 240 },
    { label: '6 ชั่วโมง', value: 360 },
    { label: '8 ชั่วโมง (แนะนำ)', value: 480 },
    { label: '10 ชั่วโมง', value: 600 },
  ];

  return (
    <div
      className="glass-card"
      style={{
        marginTop: '1.8rem',
        padding: '1.8rem 2rem',
        borderRadius: '24px',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ตั้งเป้าหมายเวลาโฟกัส
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              กำหนดเวลาทำงานที่คุณต้องการทำในแต่ละวัน
            </p>
          </div>
        </div>

        {/* Stepper Buttons & Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'var(--bg-subtle)',
            padding: '0.6rem 1.2rem',
            borderRadius: '20px',
            border: '1px solid var(--border-card)',
          }}
        >
          <button
            onClick={() => onUpdateGoal(Math.max(60, dailyGoalMinutes - 30))}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="ลดเป้าหมาย 30 นาที"
          >
            <Minus size={18} />
          </button>

          <div style={{ textAlign: 'center', minWidth: '130px' }}>
            <span
              style={{
                fontFamily: 'Prompt, sans-serif',
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1,
                display: 'block',
              }}
            >
              {goalHours} <span style={{ fontSize: '1rem', color: 'var(--blue-sky)', fontWeight: 700 }}>ชม.</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ({dailyGoalMinutes} นาที / วัน)
            </span>
          </div>

          <button
            onClick={() => onUpdateGoal(Math.min(1440, dailyGoalMinutes + 30))}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="เพิ่มเป้าหมาย 30 นาที"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Preset Goal Pills */}
      <div style={{ marginTop: '1.4rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>เป้าหมายสำเร็จรูป:</span>
        {presets.map((p) => {
          const isActive = dailyGoalMinutes === p.value;
          return (
            <button
              key={p.value}
              onClick={() => onUpdateGoal(p.value)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '14px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'var(--bg-subtle)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid var(--border-card)',
                boxShadow: isActive ? 'var(--shadow-blue)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
