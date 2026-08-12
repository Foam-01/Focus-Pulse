import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  sub: string;
  accentColor?: string;
  bgTint?: string;
  borderColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  sub,
  accentColor = '#2563eb',
  bgTint = 'rgba(59, 130, 246, 0.08)',
  borderColor = 'rgba(59, 130, 246, 0.25)',
}) => {
  return (
    <div
      className="kpi-card-item"
      style={{
        background: bgTint,
        border: `1px solid ${borderColor}`,
        borderRadius: '18px',
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '110px',
        transition: 'all 0.25s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Title (Top-Left) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: accentColor,
            fontFamily: 'Prompt, sans-serif',
          }}
        >
          {title}
        </span>
      </div>

      {/* Bottom Area: Subtitle (Bottom-Left) & Large Number (Bottom-Right) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginTop: '0.8rem',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {sub}
        </span>

        <span
          style={{
            fontFamily: 'Prompt, sans-serif',
            fontSize: '2.2rem',
            fontWeight: 800,
            color: accentColor,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
};
