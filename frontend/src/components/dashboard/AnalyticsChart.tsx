'use client';

import React, { useState } from 'react';
import { BarChart3, Calendar, Sparkles, TrendingUp } from 'lucide-react';

interface ChartItem {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: ChartItem[];
  timeframe: 'day' | 'week' | 'month';
  setTimeframe: (tf: 'day' | 'week' | 'month') => void;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  timeframe,
  setTimeframe,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 60);
  const totalMins = data.reduce((acc, curr) => acc + curr.value, 0);
  const totalHours = (totalMins / 60).toFixed(1).replace('.0', '');
  const avgMins = Math.round(totalMins / (data.length || 1));

  return (
    <div
      className="glass-card"
      style={{
        marginTop: '1.8rem',
        padding: '2rem 2.2rem',
        borderRadius: '24px',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header & Timeframe Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              color: 'var(--blue-sky)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--blue-sky)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.15rem' }}>
              <Sparkles size={13} /> สถิติการทำงานย้อนหลัง
            </div>
            <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              กราฟวิเคราะห์เวลาโฟกัส
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              เปรียบเทียบชั่วโมงสมาธิการทำงานย้อนหลังตามช่วงเวลาที่กำหนด
            </p>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--bg-subtle)',
            padding: '0.35rem',
            borderRadius: '16px',
            border: '1px solid var(--border-card)',
          }}
        >
          {[
            { id: 'day', title: '7 วันล่าสุด' },
            { id: 'week', title: '4 สัปดาห์' },
            { id: 'month', title: '6 เดือน' },
          ].map((tf) => {
            const isActive = timeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: isActive ? 'var(--shadow-blue)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tf.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matte Executive SVG Bar Chart */}
      <div style={{ position: 'relative', width: '100%', height: '260px', marginTop: '1rem' }}>
        <svg width="100%" height="100%" viewBox="0 0 720 240" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradMatte" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.7" />
            </linearGradient>

            <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-Axis values */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = 190 - 150 * ratio;
            return (
              <g key={i}>
                <line
                  x1="55"
                  y1={y}
                  x2="700"
                  y2={y}
                  stroke="var(--border-card)"
                  strokeDasharray="4 4"
                />
                <text x="45" y={y + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end" fontWeight="500">
                  {Math.round(maxValue * ratio)} น.
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {data.map((item, idx) => {
            const barWidth = Math.min(38, (630 / data.length) * 0.5);
            const step = 630 / data.length;
            const x = 65 + idx * step + (step - barWidth) / 2;
            const isHovered = hoverIndex === idx;

            const hasValue = item.value > 0;
            const barHeight = hasValue ? Math.max(8, (item.value / maxValue) * 145) : 2;
            const y = 190 - barHeight;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Bar Body */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={hasValue ? 6 : 1}
                  fill={hasValue ? (isHovered ? 'url(#barGradHover)' : 'url(#barGradMatte)') : 'var(--border-card)'}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* Top Value Label */}
                {hasValue && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fill={isHovered ? 'var(--blue-sky)' : 'var(--text-secondary)'}
                    fontSize="11"
                    fontWeight={isHovered ? '800' : '600'}
                  >
                    {item.value}
                  </text>
                )}

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y="215"
                  textAnchor="middle"
                  fill={isHovered ? 'var(--text-main)' : 'var(--text-muted)'}
                  fontSize="12"
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            style={{
              position: 'absolute',
              top: '15px',
              right: '25px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              padding: '0.6rem 1.1rem',
              borderRadius: '12px',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              pointerEvents: 'none',
            }}
          >
            <Calendar size={16} color="var(--blue-sky)" />
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>{data[hoverIndex].label}</span>
              <strong>{data[hoverIndex].value} นาที</strong> ({(data[hoverIndex].value / 60).toFixed(1).replace('.0', '')} ชม.)
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Summary Banner */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem 1.4rem',
          background: 'var(--bg-subtle)',
          borderRadius: '16px',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <TrendingUp size={20} color="var(--blue-sky)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            เวลารวมช่วง {timeframe === 'day' ? '7 วันล่าสุด' : timeframe === 'week' ? '4 สัปดาห์' : '6 เดือน'}:
          </span>
          <strong style={{ color: 'var(--blue-sky)', fontSize: '1.15rem', fontWeight: 800 }}>
            {totalMins} นาที ({totalHours} ชม.)
          </strong>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          เฉลี่ยต่อวัน: <strong style={{ color: 'var(--text-main)' }}>{avgMins} นาที/วัน</strong>
        </div>
      </div>
    </div>
  );
};
