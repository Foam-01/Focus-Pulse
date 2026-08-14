'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, TrendingUp, Clock, Award, Activity } from 'lucide-react';

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

  // Helper number formatter (e.g. 12400 -> "12,400")
  const formatNum = (num: number) => num.toLocaleString('th-TH');

  // Compute accurate metrics based on timeframe
  const { chartMax, totalMins, totalHours, avgLabel, avgValueStr, footerAvgText, peakItem } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 60);
    const cMax = Math.ceil(max / 20) * 20;
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const hours = (total / 60).toFixed(1).replace('.0', '');

    let label = 'เฉลี่ยต่อวัน';
    let valStr = '0 นาที/วัน';
    let footerStr = 'เฉลี่ยต่อวัน: 0 นาที/วัน';

    if (timeframe === 'day') {
      const avg = Math.round(total / 7);
      label = 'เฉลี่ยต่อวัน';
      valStr = `${formatNum(avg)} นาที/วัน`;
      footerStr = `เฉลี่ยต่อวัน: ${formatNum(avg)} นาที/วัน`;
    } else if (timeframe === 'week') {
      const avg = Math.round(total / 4);
      label = 'เฉลี่ยต่อสัปดาห์';
      valStr = `${formatNum(avg)} นาที/สัปดาห์`;
      footerStr = `เฉลี่ยต่อสัปดาห์: ${formatNum(avg)} นาที/สัปดาห์`;
    } else {
      const avgMonth = Math.round(total / 6);
      const avgDay = Math.round(total / 180);
      label = 'เฉลี่ยต่อเดือน';
      valStr = `${formatNum(avgMonth)} นาที/เดือน`;
      footerStr = `เฉลี่ยประมาณ: ~${formatNum(avgDay)} นาที/วัน`;
    }

    const peak = data.reduce(
      (m, item) => (item.value > m.value ? item : m),
      data[0] || { label: '-', value: 0 }
    );

    return {
      chartMax: cMax,
      totalMins: total,
      totalHours: hours,
      avgLabel: label,
      avgValueStr: valStr,
      footerAvgText: footerStr,
      peakItem: peak,
    };
  }, [data, timeframe]);

  // SVG Chart Geometry Constants
  const width = 740;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const zeroY = height - paddingBottom;

  // Calculate coordinates for points & SVG paths
  const { points, linePath, areaPath } = useMemo(() => {
    const pts: ChartPoint[] = data.map((item, idx) => {
      const step = chartWidth / (data.length || 1);
      const cx = paddingLeft + idx * step + step / 2;
      const ratio = Math.min(1, Math.max(0, item.value / (chartMax || 1)));
      const cy = zeroY - ratio * chartHeight;
      return { x: cx, y: cy, item, idx };
    });

    let line = '';
    if (pts.length > 1) {
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
        padding: '2rem 2.2rem',
        borderRadius: '24px',
        border: '1px solid var(--border-card)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header Row: Title & Timeframe Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.2rem', marginBottom: '1.6rem', position: 'relative', zIndex: 2 }}>
        <div>
          <div style={{ color: 'var(--blue-sky)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            สถิตีย้อนหลัง
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            กราฟแสดงเวลาโฟกัส
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0, fontWeight: 500 }}>
            แสดงเวลาทำงานย้อนหลังตามช่วงเวลาที่เลือก
          </p>
        </div>

        {/* Timeframe Selector Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: '14px',
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
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  boxShadow: isActive ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none',
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

      {/* KPI Top Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.6rem' }}>
        {/* Total Time */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '0.9rem 1.1rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>เวลารวม</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>
            {formatNum(totalMins)} นาที <span style={{ fontSize: '0.82rem', color: 'var(--blue-sky)', fontWeight: 600 }}>({formatNum(Number(totalHours))} ชม.)</span>
          </strong>
        </div>

        {/* Average Time (Dynamic Label & Calculation) */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '0.9rem 1.1rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>{avgLabel}</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>
            <span style={{ color: '#34d399' }}>{avgValueStr}</span>
          </strong>
        </div>

        {/* Peak Record */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '0.9rem 1.1rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>ทำได้มากที่สุด</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>
            {peakItem.label} <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>({formatNum(peakItem.value)} น.)</span>
          </strong>
        </div>
      </div>

      {/* SVG Bar & Curve Hybrid Chart */}
      <div style={{ position: 'relative', width: '100%', height: '240px' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradExecutive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="barGradExecutiveHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="areaCurveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
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
                  strokeOpacity="0.7"
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
                  {formatNum(valLabel)} น.
                </text>
              </g>
            );
          })}

          {/* Base Axis Line */}
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

          {/* Render Bars & X-Axis Labels */}
          {points.map((pt: ChartPoint, idx: number) => {
            const step = chartWidth / (points.length || 1);
            const barWidth = Math.min(38, step * 0.45);
            const barX = pt.x - barWidth / 2;
            const hasValue = pt.item.value > 0;
            const barHeight = hasValue ? Math.max(8, (pt.item.value / (chartMax || 1)) * chartHeight) : 3;
            const barY = zeroY - barHeight;
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Hover Receiver Hitbox */}
                <rect
                  x={pt.x - step / 2}
                  y={0}
                  width={step}
                  height={height}
                  fill="transparent"
                />

                {/* Bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  fill={hasValue ? (isHovered ? 'url(#barGradExecutiveHover)' : 'url(#barGradExecutive)') : 'var(--border-card)'}
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isHovered ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))' : 'none',
                  }}
                />

                {/* X-Axis Label */}
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
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: 'none' }}
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
                fill={isHovered ? '#ffffff' : '#60a5fa'}
                stroke="var(--bg-card)"
                strokeWidth="2"
                style={{
                  transition: 'all 0.2s ease',
                  filter: isHovered ? 'drop-shadow(0 0 8px #3b82f6)' : 'none',
                  pointerEvents: 'none',
                }}
              />
            );
          })}
        </svg>

        {/* Dynamic Hover Tooltip Box */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              padding: '0.65rem 1rem',
              borderRadius: '14px',
              fontSize: '0.86rem',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              pointerEvents: 'none',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Calendar size={17} />
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem', display: 'block', fontWeight: 500 }}>
                {data[hoverIndex].label}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 800 }}>{formatNum(data[hoverIndex].value)} นาที</strong>
                <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600 }}>({(data[hoverIndex].value / 60).toFixed(1).replace('.0', '')} ชม.)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Summary Banner */}
      <div
        style={{
          marginTop: '1.4rem',
          padding: '1rem 1.3rem',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            เวลารวมช่วง {timeframe === 'day' ? '7 วันล่าสุด' : timeframe === 'week' ? '4 สัปดาห์' : '6 เดือน'}:
          </span>
          <strong style={{ color: 'var(--blue-sky)', fontSize: '1.1rem', fontWeight: 800 }}>
            {formatNum(totalMins)} นาที ({formatNum(Number(totalHours))} ชม.)
          </strong>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {footerAvgText}
        </div>
      </div>
    </div>
  );
});

AnalyticsChart.displayName = 'AnalyticsChart';


