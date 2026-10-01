'use client';

import React from 'react';

// Reusable in-view section header (eyebrow icon+text, h2 title, description, right-aligned actions).
// Props: eyebrowIcon (ReactNode), eyebrowText (string), title (ReactNode), description (ReactNode, optional),
// actions (ReactNode, optional, rendered right-aligned).
interface PageHeaderProps {
  eyebrowIcon: React.ReactNode;
  eyebrowText: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrowIcon, eyebrowText, title, description, actions, style }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '0.4rem',
        ...style,
      }}
    >
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-sky)', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.2rem' }}>
          {eyebrowIcon} {eyebrowText}
        </div>
        <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500, margin: '0.2rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
