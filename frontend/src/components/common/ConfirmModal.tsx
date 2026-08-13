'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'ยืนยัน',
  message,
  confirmText = 'ลบ',
  cancelText = 'ยกเลิก',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '2rem 1.8rem',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.25s ease',
          textAlign: 'center',
          color: 'var(--text-main)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-main)',
            borderRadius: '12px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Danger Icon Badge */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: isDanger ? 'rgba(225, 29, 72, 0.12)' : 'var(--bg-subtle)',
            color: isDanger ? '#f43f5e' : 'var(--blue-sky)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.2rem auto',
            border: isDanger ? '1px solid rgba(225, 29, 72, 0.25)' : '1px solid var(--border-card)',
          }}
        >
          {isDanger ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </div>

        {/* Title & Message */}
        <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.6rem', fontWeight: 500 }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid var(--border-card)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: 'none',
              background: isDanger ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isDanger ? '0 6px 20px rgba(225, 29, 72, 0.35)' : 'var(--shadow-blue)',
              transition: 'all 0.2s ease',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
