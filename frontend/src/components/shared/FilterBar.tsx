'use client';

import React from 'react';

// Reusable glass-card toolbar for search + filter pills. FilterBar is the container
// (accepts arbitrary children via composition); FilterBarButton is a pill-style toggle.
export const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.1rem 1.4rem',
        borderRadius: '18px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
};

interface FilterBarButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}

export const FilterBarButton: React.FC<FilterBarButtonProps> = ({ active, onClick, children, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      style={{
        padding: '0.45rem 0.95rem',
        borderRadius: '10px',
        fontSize: '0.82rem',
        fontWeight: active ? 700 : 500,
        background: active
          ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
          : 'var(--bg-subtle)',
        color: active ? '#ffffff' : 'var(--text-muted)',
        border: active ? 'none' : '1px solid var(--border-card)',
        boxShadow: active ? '0 4px 12px rgba(168, 85, 247, 0.35)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
};
