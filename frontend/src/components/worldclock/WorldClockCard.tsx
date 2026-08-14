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
        border: city.isLocal ? '2px solid #3b82f6' : '1px solid var(--border-card)',
        borderRadius: '20px',
        padding: '1.4rem 1.6rem',
        boxShadow: city.isLocal ? '0 8px 25px rgba(59, 130, 246, 0.18)' : 'var(--shadow-sm)',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* LEFT SIDE: Flag, Offset Badge, City Name, Country Name & Date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: 0 }}>
        {/* Top Badges Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{city.flagEmoji || '🌐'}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {diffStr}
          </span>
          {city.isLocal && (
            <span
              style={{
                fontSize: '0.7rem',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                padding: '0.12rem 0.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <MapPin size={10} /> เวลาเครื่อง
            </span>
          )}
        </div>

        {/* City Name */}
        <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>
          {city.cityName}
        </h3>

        {/* Country Subtitle */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {city.countryName.replace(/\s*\(.*?\)/g, '')}
        </div>
      </div>

      {/* RIGHT SIDE: Giant Time Display + Sun/Moon Icon + Delete Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span
            style={{
              fontFamily: 'Prompt, sans-serif',
              fontSize: '2.8rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              lineHeight: 1,
              letterSpacing: '-0.5px',
            }}
          >
            {timeStr}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: isDaytime ? '#f59e0b' : '#818cf8', fontWeight: 600, marginTop: '0.25rem' }}>
            {isDaytime ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDaytime ? 'กลางวัน' : 'กลางคืน'}</span>
          </div>
        </div>

        {!city.isLocal && (
          <button
            onClick={() => onDelete(city.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '0.4rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="ลบเมืองนี้"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};


