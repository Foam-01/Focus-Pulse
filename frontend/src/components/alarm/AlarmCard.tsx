'use client';

import React from 'react';
import { AlarmItem } from '../../types';
import { Bell, Trash2, Pencil } from 'lucide-react';

interface AlarmCardProps {
  alarm: AlarmItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (alarm: AlarmItem) => void;
}

const DAY_BADGES = [
  { dayIndex: 1, label: 'M' },
  { dayIndex: 2, label: 'Tu' },
  { dayIndex: 3, label: 'We' },
  { dayIndex: 4, label: 'Th' },
  { dayIndex: 5, label: 'Fri' },
  { dayIndex: 6, label: 'Sa' },
  { dayIndex: 0, label: 'Su' },
];

export const AlarmCard: React.FC<AlarmCardProps> = ({ alarm, onToggle, onDelete, onEdit }) => {
  const format12Hour = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const pad = (n: number) => String(n).padStart(2, '0');
    return { timeStr: `${hour12}:${pad(m)}`, period };
  };

  const computeTimeUntil = (targetH: number, targetM: number, isEnabled: boolean) => {
    if (!isEnabled) return null;

    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();

    let diffMinutes = (targetH * 60 + targetM) - (currentH * 60 + currentM);
    if (diffMinutes <= 0) {
      diffMinutes += 24 * 60; // Next day
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    return `${hours > 0 ? `${hours} ชั่วโมง ` : ''}${mins} นาที`;
  };

  const timeUntilStr = computeTimeUntil(alarm.hour, alarm.minute, alarm.isEnabled);
  const { timeStr, period } = format12Hour(alarm.hour, alarm.minute);

  return (
    <div
      className="glass-card"
      style={{
        background: alarm.isEnabled ? 'var(--bg-card)' : 'rgba(15, 23, 42, 0.4)',
        border: alarm.isEnabled ? '1px solid var(--border-card)' : '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '24px',
        padding: '1.6rem 1.8rem',
        opacity: alarm.isEnabled ? 1 : 0.65,
        boxShadow: alarm.isEnabled ? 'var(--shadow-sm)' : 'none',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      {/* Top Header: Edit/Delete Buttons & Toggle Switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(alarm)}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                color: 'var(--blue-sky)',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="แก้ไขการตั้งค่านาฬิกาปลุก"
            >
              <Pencil size={14} />
            </button>
          )}

          <button
            onClick={() => onDelete(alarm.id)}
            style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#f43f5e',
              borderRadius: '8px',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="ลบรายการปลุกนี้"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Toggle Switch */}
        <div
          onClick={() => onToggle(alarm.id)}
          style={{
            width: '48px',
            height: '26px',
            borderRadius: '13px',
            background: alarm.isEnabled ? 'var(--blue-sky)' : 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            padding: '3px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: alarm.isEnabled ? 'flex-end' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.25s ease',
            }}
          />
        </div>
      </div>

      {/* Main Time Display */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.3rem' }}>
          <span
            style={{
              fontFamily: 'Prompt, sans-serif',
              fontSize: '2.8rem',
              fontWeight: 800,
              color: alarm.isEnabled ? 'var(--text-main)' : 'var(--text-muted)',
              lineHeight: 1,
            }}
          >
            {timeStr}
          </span>
          <span
            style={{
              fontFamily: 'Prompt, sans-serif',
              fontSize: '1rem',
              fontWeight: 700,
              color: alarm.isEnabled ? 'var(--blue-sky)' : 'var(--text-muted)',
            }}
          >
            {period}
          </span>
        </div>

        {/* Countdown Subtitle */}
        <div style={{ minHeight: '1.4rem', marginBottom: '0.8rem' }}>
          {alarm.isEnabled && timeUntilStr ? (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Bell size={13} style={{ color: 'var(--blue-sky)' }} /> อีก {timeUntilStr}
            </span>
          ) : (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', opacity: 0.7 }}>
              ปิดการใช้งาน
            </span>
          )}
        </div>

        {/* Alarm Label / Note */}
        <h4
          style={{
            fontFamily: 'Prompt, sans-serif',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '1rem',
            lineHeight: 1.3,
          }}
        >
          {alarm.label}
        </h4>
      </div>

      {/* Repeat Days Badges (M, Tu, We, Th, Fri, Sa, Su) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-card)' }}>
        {DAY_BADGES.map((item) => {
          const isActive = alarm.repeatDays.includes(item.dayIndex);
          return (
            <span
              key={item.dayIndex}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'var(--blue-light)' : 'transparent',
                color: isActive ? 'var(--blue-sky)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--blue-sky)' : '1px solid transparent',
              }}
            >
              {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};
