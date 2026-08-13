'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, Sparkles, TrendingUp, Award, Clock, Activity } from 'lucide-react';

interface ChartItem {
  label: string;
  value: number;
}

interface ChartPoint {
  x: number;
  y: number;
  item: ChartItem;
  idx: number;
}

interface AnalyticsChartProps {
  data: ChartItem[];
  timeframe: 'day' | 'week' | 'month';
  setTimeframe: (tf: 'day' | 'week' | 'month') => void;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = React.memo(({
  data,
  timeframe,
  setTimeframe,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute metrics with useMemo
  const { maxVal, chartMax, totalMins, totalHours, avgMins, peakItem } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 60);
    const cMax = Math.ceil(max / 15) * 15;
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const hours = (total / 60).toFixed(1).replace('.0', '');
    const avg = Math.round(total / (data.length || 1));
    const peak = data.reduce(
      (m, item) => (item.value > m.value ? item : m),
      data[0] || { label: '-', value: 0 }
    );
    return { maxVal: max, chartMax: cMax, totalMins: total, totalHours: hours, avgMins: avg, peakItem: peak };
  }, [data]);

  // SVG Chart Geometry Constants
  const width = 740;
  const height = 250;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const zeroY = height - paddingBottom;

  // Calculate coordinates for points & SVG paths with useMemo
  const { points, linePath, areaPath } = useMemo(() => {
    const pts: ChartPoint[] = data.map((item, idx) => {
      const step = chartWidth / (data.length || 1);
      const cx = paddingLeft + idx * step + step / 2;
      const ratio = Math.min(1, Math.max(0, item.value / chartMax));
      const cy = zeroY - ratio * chartHeight;
      return { x: cx, y: cy, item, idx };
    });

    let line = '';
    if (pts.length === 1) line = `M ${pts[0].x} ${pts[0].y}`;
    else if (pts.length > 1) {
      line = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const current = pts[i];
        const next = pts[i + 1];
        const controlX = (current.x + next.x) / 2;
        line += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
      }
    }

    const area = pts.length > 0
      ? `${line} L ${pts[pts.length - 1].x} ${zeroY} L ${pts[0].x} ${zeroY} Z`
      : '';

    return { points: pts, linePath: line, areaPath: area };
  }, [data, chartMax, chartWidth, chartHeight, zeroY]);

  return (
    <div
      className="glass-card"
      style={{
        marginTop: '1.8rem',
        padding: '2.2rem 2.4rem',
        borderRadius: '28px',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(24px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Subtle Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Row: Title & Timeframe Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.2rem', marginBottom: '1.8rem', position: 'relative', zIndex: 2 }}>
        <div>
          <div style={{ color: 'var(--blue-sky)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            สถิตีย้อนหลัง
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.3px', margin: 0 }}>
            กราฟแสดงเวลาโฟกัส
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0, fontWeight: 500 }}>
            แสดงเวลาทำงานย้อนหลังตามช่วงเวลาที่เลือก
          </p>
        </div>

        {/* Executive Pill Timeframe Selector Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'var(--bg-subtle)',
            padding: '5px',
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
                  padding: '0.55rem 1.15rem',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'linear-gradient(135deg, var(--navy-primary) 0%, var(--blue-sky) 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: isActive ? 'var(--shadow-blue)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                {tf.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Top Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.8rem' }}>
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '0.95rem 1.2rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>เวลารวม</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>{totalMins} นาที <span style={{ fontSize: '0.82rem', color: 'var(--blue-sky)', fontWeight: 600 }}>({totalHours} ชม.)</span></strong>
        </div>

        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '0.95rem 1.2rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>เฉลี่ยต่อรอบ</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>{avgMins} <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>นาที/รอบ</span></strong>
        </div>

        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '0.95rem 1.2rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>ทำได้มากที่สุด</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>{peakItem.label} <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>({peakItem.value} น.)</span></strong>
        </div>
      </div>

      {/* Production-Grade Matte & Glowing Hybrid SVG Chart */}
      <div style={{ position: 'relative', width: '100%', height: '260px' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            {/* Bar Gradient Matte */}
            <linearGradient id="barGradExecutive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
            </linearGradient>

            {/* Bar Gradient Hover */}
            <linearGradient id="barGradExecutiveHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
            </linearGradient>

            {/* Smooth Curved Line Area Gradient */}
            <linearGradient id="areaCurveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Scale Values */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = zeroY - chartHeight * ratio;
            const valLabel = Math.round(chartMax * ratio);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border-card)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="11"
                  textAnchor="end"
                  fontWeight="600"
                  fontFamily="Prompt, sans-serif"
                >
                  {valLabel} น.
                </text>
              </g>
            );
          })}

          {/* Zero Base Axis Line */}
          <line
            x1={paddingLeft}
            y1={zeroY}
            x2={width - paddingRight}
            y2={zeroY}
            stroke="var(--border-card)"
            strokeWidth="1.5"
          />

          {/* Translucent Curve Area Background Fill */}
          {areaPath && <path d={areaPath} fill="url(#areaCurveGrad)" />}

          {/* Render Bars & Spline Curve Nodes */}
          {points.map((pt: ChartPoint, idx: number) => {
            const step = chartWidth / (points.length || 1);
            const barWidth = Math.min(36, step * 0.48);
            const barX = pt.x - barWidth / 2;
            const hasValue = pt.item.value > 0;
            const barHeight = hasValue ? Math.max(8, (pt.item.value / chartMax) * chartHeight) : 3;
            const barY = zeroY - barHeight;
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Invisible Hover Receiver Hitbox */}
                <rect
                  x={pt.x - step / 2}
                  y={0}
                  width={step}
                  height={height}
                  fill="transparent"
                />

                {/* Animated Rounded Bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx={hasValue ? 7 : 2}
                  fill={hasValue ? (isHovered ? 'url(#barGradExecutiveHover)' : 'url(#barGradExecutive)') : 'var(--border-card)'}
                  style={{
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: isHovered ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.5))' : 'none',
                  }}
                />

                {/* Bar Value Label at Top */}
                {hasValue && (
                  <text
                    x={pt.x}
                    y={barY - 8}
                    textAnchor="middle"
                    fill={isHovered ? 'var(--blue-sky)' : 'var(--text-secondary)'}
                    fontSize="11"
                    fontWeight={isHovered ? '800' : '600'}
                    fontFamily="Prompt, sans-serif"
                  >
                    {pt.item.value}
                  </text>
                )}

                {/* X-Axis Date Label */}
                <text
                  x={pt.x}
                  y={zeroY + 22}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--text-main)' : 'var(--text-muted)'}
                  fontSize="12"
                  fontWeight={isHovered ? '800' : '600'}
                  fontFamily="Prompt, sans-serif"
                >
                  {pt.item.label}
                </text>
              </g>
            );
          })}

          {/* Smooth Bezier Overlay Curve Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--blue-sky)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.4))' }}
            />
          )}

          {/* Spline Glowing Node Dots */}
          {points.map((pt, idx) => {
            if (pt.item.value === 0) return null;
            const isHovered = hoverIndex === idx;
            return (
              <circle
                key={`dot-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#ffffff' : 'var(--blue-sky)'}
                stroke="var(--bg-card)"
                strokeWidth="2"
                style={{
                  transition: 'all 0.2s ease',
                  filter: isHovered ? 'drop-shadow(0 0 10px #38bdf8)' : 'none',
                  pointerEvents: 'none',
                }}
              />
            );
          })}
        </svg>

        {/* Dynamic Floating Tooltip Card */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              padding: '0.7rem 1.1rem',
              borderRadius: '16px',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              pointerEvents: 'none',
              backdropFilter: 'blur(16px)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-sky)' }}>
              <Calendar size={18} />
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem', display: 'block', fontWeight: 500 }}>
                {data[hoverIndex].label}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800 }}>{data[hoverIndex].value} นาที</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--blue-sky)', fontWeight: 600 }}>({(data[hoverIndex].value / 60).toFixed(1).replace('.0', '')} ชม.)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Summary Banner */}
      <div
        style={{
          marginTop: '1.6rem',
          padding: '1.1rem 1.4rem',
          background: 'var(--bg-subtle)',
          borderRadius: '18px',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            เวลารวมช่วง {timeframe === 'day' ? '7 วันล่าสุด' : timeframe === 'week' ? '4 สัปดาห์' : '6 เดือน'}:
          </span>
          <strong style={{ color: 'var(--blue-sky)', fontSize: '1.15rem', fontWeight: 900 }}>
            {totalMins} นาที ({totalHours} ชม.)
          </strong>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          เฉลี่ยต่อวัน: <strong style={{ color: 'var(--text-main)', fontWeight: 800 }}>{avgMins} นาที/วัน</strong>
        </div>
      </div>
    </div>
  );
});

AnalyticsChart.displayName = 'AnalyticsChart';

