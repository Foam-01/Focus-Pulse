'use client';

import React from 'react';
import { CityClockItem } from '../../types';
import { Sun, Moon, Trash2, MapPin } from 'lucide-react';

interface WorldClockCardProps {
  city: CityClockItem;
  currentTime: Date;
  onDelete: (id: string) => void;
}

export const WorldClockCard: React.FC<WorldClockCardProps> = ({
  city,
  currentTime,
  onDelete,
}) => {
  const getCityTimeData = () => {
    try {
      const timeStr = currentTime.toLocaleTimeString('th-TH', {
        timeZone: city.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const dateStr = currentTime.toLocaleDateString('th-TH', {
        timeZone: city.timezone,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      // Hour calculation for Day/Night icon
      const hourParts = currentTime.toLocaleTimeString('en-US', {
        timeZone: city.timezone,
        hour: 'numeric',
        hour12: false,
      });
      const hourNum = parseInt(hourParts, 10);
      const isDaytime = hourNum >= 6 && hourNum < 18;

      // Time Offset difference calculation vs local Bangkok time
      const localH = currentTime.getHours();
      const localM = currentTime.getMinutes();
      const cityH = hourNum;
      const cityM = parseInt(timeStr.split(':')[1] || '0', 10);

      let diffMinutes = (cityH * 60 + cityM) - (localH * 60 + localM);
      // Adjust wrap-around
      if (diffMinutes > 12 * 60) diffMinutes -= 24 * 60;
      if (diffMinutes < -12 * 60) diffMinutes += 24 * 60;

      const diffHours = Math.round(diffMinutes / 60);

      let diffStr = 'เวลาเดียวกัน';
      if (diffHours > 0) diffStr = `เร็วกว่า ${diffHours} ชม.`;
      if (diffHours < 0) diffStr = `ช้ากว่า ${Math.abs(diffHours)} ชม.`;

      return { timeStr, dateStr, isDaytime, diffStr };
    } catch (e) {
      return { timeStr: '12:00', dateStr: '', isDaytime: true, diffStr: '' };
    }
  };

  const { timeStr, dateStr, isDaytime, diffStr } = getCityTimeData();

  return (
    <div
      className="glass-card"
      style={{
        background: 'var(--bg-card)',
        border: city.isLocal ? '2px solid var(--blue-sky)' : '1px solid var(--border-card)',
        borderRadius: '24px',
        padding: '1.6rem 1.8rem',
        boxShadow: city.isLocal ? 'var(--shadow-blue)' : 'var(--shadow-sm)',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.6rem' }}>{city.flagEmoji || '🌐'}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {city.cityName}
              </h3>
              {city.isLocal && (
                <span style={{ fontSize: '0.72rem', background: 'var(--blue-light)', color: 'var(--blue-sky)', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                  <MapPin size={11} /> เวลาเครื่อง
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{city.countryName}</span>
          </div>
        </div>

        {!city.isLocal && (
          <button
            onClick={() => onDelete(city.id)}
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
            title="ลบเมืองนี้"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Time & Day/Night Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.6rem 0' }}>
        <div>
          <span
            style={{
              fontFamily: 'Prompt, monospace',
              fontSize: '2.8rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1,
              display: 'block',
            }}
          >
            {timeStr}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
            {dateStr}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: isDaytime ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
              color: isDaytime ? '#f59e0b' : '#818cf8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.3rem',
            }}
          >
            {isDaytime ? <Sun size={24} /> : <Moon size={24} />}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
            {diffStr}
          </span>
        </div>
      </div>
    </div>
  );
};
