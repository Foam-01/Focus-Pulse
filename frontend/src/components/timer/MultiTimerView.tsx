'use client';

import React, { useState, useEffect } from 'react';
import { MultiTimerPreset } from '../../types';
import { MultiTimerCard } from './MultiTimerCard';
import { AddTimerModal } from './AddTimerModal';
import { Plus, Clock, Sparkles } from 'lucide-react';

const DEFAULT_PRESETS: MultiTimerPreset[] = [
  { id: 'preset-1', title: '1 นาที', totalSeconds: 60 },
  { id: 'preset-3', title: '3 นาที', totalSeconds: 180 },
  { id: 'preset-5', title: '5 นาที', totalSeconds: 300 },
  { id: 'preset-10', title: '10 นาที', totalSeconds: 600 },
];

export const MultiTimerView: React.FC = () => {
  const [timers, setTimers] = useState<MultiTimerPreset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedStr = localStorage.getItem('focus_multi_timers');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTimers(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved multi timers:', e);
      }
    }
    // Fallback to initial defaults
    setTimers(DEFAULT_PRESETS);
    localStorage.setItem('focus_multi_timers', JSON.stringify(DEFAULT_PRESETS));
  }, []);

  const handleAddTimer = (title: string, totalSeconds: number) => {
    const newTimer: MultiTimerPreset = {
      id: `timer-${Date.now()}`,
      title,
      totalSeconds,
    };
    const updated = [...timers, newTimer];
    setTimers(updated);
    localStorage.setItem('focus_multi_timers', JSON.stringify(updated));
  };

  const handleDeleteTimer = (id: string) => {
    const updated = timers.filter((t) => t.id !== id);
    setTimers(updated);
    localStorage.setItem('focus_multi_timers', JSON.stringify(updated));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.8rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-sky)', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            <Sparkles size={14} /> นาฬิกาจับเวลาเฉพาะกิจ
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            จับเวลาหลายเรือน
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            ควบคุมนาฬิกานับถอยหลังหลายเรือนแยกกันอย่างอิสระ
          </p>
        </div>

        <button
          className="btn-primary-gradient"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          <span>เพิ่มตัวจับเวลา</span>
        </button>
      </div>

      {/* Timer Grid Display */}
      {timers.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              color: 'var(--blue-sky)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Clock size={28} />
          </div>
          <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            ยังไม่มีการ์ดตัวจับเวลา
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            กดปุ่มด้านล่างเพื่อเพิ่มการ์ดจับเวลานับถอยหลังเรือนแรกของคุณ
          </p>
          <button
            className="btn-primary-gradient"
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '0.75rem 1.6rem', borderRadius: '14px', fontWeight: 700 }}
          >
            เพิ่มตัวจับเวลา
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {timers.map((timer) => (
            <MultiTimerCard
              key={timer.id}
              id={timer.id}
              title={timer.title}
              totalSeconds={timer.totalSeconds}
              onDelete={handleDeleteTimer}
            />
          ))}
        </div>
      )}

      {/* Add Timer Modal Form */}
      <AddTimerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTimer={handleAddTimer}
      />
    </div>
  );
};

export default MultiTimerView;
