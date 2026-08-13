'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, Plus, Check } from 'lucide-react';
import { AlarmItem } from '../../types';

interface AddAlarmModalProps {
  isOpen: boolean;
  initialAlarm?: AlarmItem | null;
  onClose: () => void;
  onAddAlarm: (hour: number, minute: number, label: string, repeatDays: number[], id?: string) => void;
}

const DAY_LABELS = [
  { dayIndex: 1, shortLabel: 'จ.' },
  { dayIndex: 2, shortLabel: 'อ.' },
  { dayIndex: 3, shortLabel: 'พ.' },
  { dayIndex: 4, shortLabel: 'พฤ.' },
  { dayIndex: 5, shortLabel: 'ศ.' },
  { dayIndex: 6, shortLabel: 'ส.' },
  { dayIndex: 0, shortLabel: 'อา.' },
];

export const AddAlarmModal: React.FC<AddAlarmModalProps> = ({
  isOpen,
  initialAlarm,
  onClose,
  onAddAlarm,
}) => {
  const [hour, setHour] = useState<number>(7);
  const [minute, setMinute] = useState<number>(0);
  const [label, setLabel] = useState<string>('Good morning');
  const [repeatDays, setRepeatDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    if (initialAlarm) {
      setHour(initialAlarm.hour);
      setMinute(initialAlarm.minute);
      setLabel(initialAlarm.label);
      setRepeatDays(initialAlarm.repeatDays);
    } else {
      setHour(7);
      setMinute(0);
      setLabel('Good morning');
      setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
    }
  }, [initialAlarm, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    if (repeatDays.includes(dayIndex)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIndex));
    } else {
      setRepeatDays([...repeatDays, dayIndex].sort());
    }
  };

  const setPresetDays = (days: number[]) => {
    setRepeatDays(days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlarm(hour, minute, label.trim() || 'นาฬิกาปลุก', repeatDays, initialAlarm?.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '500px',
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
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {initialAlarm ? 'แก้ไขนาฬิกาปลุก' : 'เพิ่มนาฬิกาปลุกใหม่'}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>ตั้งเวลาปลุกและกำหนดวันปลุกซ้ำ</span>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
          {/* Time Picker Controls */}
          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              เวลาปลุก (ชั่วโมง : นาที)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '18px', border: '1px solid var(--border-card)' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textAlign: 'center' }}>ชั่วโมง</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => setHour(Math.max(0, Math.min(23, parseInt(e.target.value || '0', 10))))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    fontFamily: 'Prompt, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>

              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue-sky)', marginTop: '1.2rem' }}>:</span>

              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', textAlign: 'center' }}>นาที</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => setMinute(Math.max(0, Math.min(59, parseInt(e.target.value || '0', 10))))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-main)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    fontFamily: 'Prompt, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Alarm Label Input */}
          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              ชื่อรายการปลุก / ข้อความเตือนความจำ
            </label>
            <input
              type="text"
              placeholder="เช่น Good morning, ไปห้องน้ำ รอบ 1, ประชุมทีม"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
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

          {/* Repeat Days Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700 }}>
                ปลุกซ้ำในวัน
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setPresetDays([0, 1, 2, 3, 4, 5, 6])}
                  style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--blue-sky)', cursor: 'pointer', fontWeight: 600 }}
                >
                  ทุกวัน
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                <button
                  type="button"
                  onClick={() => setPresetDays([1, 2, 3, 4, 5])}
                  style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--blue-sky)', cursor: 'pointer', fontWeight: 600 }}
                >
                  วันธรรมดา
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                <button
                  type="button"
                  onClick={() => setPresetDays([0, 6])}
                  style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--blue-sky)', cursor: 'pointer', fontWeight: 600 }}
                >
                  วันหยุด
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
              {DAY_LABELS.map((item) => {
                const active = repeatDays.includes(item.dayIndex);
                return (
                  <button
                    key={item.dayIndex}
                    type="button"
                    onClick={() => toggleDay(item.dayIndex)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      border: active ? '1px solid var(--blue-sky)' : '1px solid var(--border-card)',
                      background: active ? 'var(--blue-light)' : 'var(--bg-subtle)',
                      color: active ? 'var(--blue-sky)' : 'var(--text-muted)',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.6rem' }}>
            <button type="button" className="action-btn-secondary" onClick={onClose} style={{ padding: '0.75rem 1.3rem' }}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary-gradient" style={{ padding: '0.75rem 1.6rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {initialAlarm ? <Check size={18} /> : <Plus size={18} />}
              <span>{initialAlarm ? 'บันทึก' : 'บันทึกนาฬิกาปลุก'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
