'use client';

import React, { useState } from 'react';
import { X, Clock, Plus } from 'lucide-react';

interface AddTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimer: (title: string, totalSeconds: number) => void;
}

export const AddTimerModal: React.FC<AddTimerModalProps> = ({ isOpen, onClose, onAddTimer }) => {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSecs = hours * 3600 + minutes * 60 + seconds;
    if (totalSecs <= 0) {
      setError('โปรดระบุเวลาอย่างน้อย 1 วินาที');
      return;
    }

    const name = title.trim() || `${hours > 0 ? `${hours} ชม. ` : ''}${minutes > 0 ? `${minutes} นาที` : ''}${seconds > 0 ? ` ${seconds} วินาที` : ''}`.trim() || 'ตัวจับเวลา';
    
    onAddTimer(name, totalSecs);
    setTitle('');
    setHours(0);
    setMinutes(5);
    setSeconds(0);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-card)',
          padding: '2.2rem 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--blue-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                เพิ่มตัวจับเวลาใหม่
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>กำหนดชื่อและระยะเวลาการจับเวลา</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', borderRadius: '12px', fontSize: '0.86rem', fontWeight: 600, marginBottom: '1.2rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              ชื่อการ์ดจับเวลา
            </label>
            <input
              type="text"
              placeholder="เช่น ต้มมาม่า, พักสายตา 5 นาที, ชงกาแฟ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '14px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-main)',
                fontSize: '0.94rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              ตั้งเวลานับถอยหลัง
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textAlign: 'center' }}>ชั่วโมง</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textAlign: 'center' }}>นาที</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value || '0', 10))))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textAlign: 'center' }}>วินาที</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value || '0', 10))))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.6rem' }}>
            <button type="button" className="action-btn-secondary" onClick={onClose} style={{ padding: '0.75rem 1.3rem' }}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary-gradient" style={{ padding: '0.75rem 1.6rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} />
              <span>สร้างตัวจับเวลา</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
