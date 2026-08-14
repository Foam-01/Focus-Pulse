'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AlarmItem } from '../../types';
import { AlarmCard } from './AlarmCard';
import { AddAlarmModal } from './AddAlarmModal';
import { AlarmRingingModal } from './AlarmRingingModal';
import { Plus, Bell, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-1',
    hour: 7,
    minute: 0,
    label: 'Good morning',
    isEnabled: false,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'alarm-2',
    hour: 10,
    minute: 47,
    label: 'ไปห้องน้ำ รอบ 1',
    isEnabled: false,
    repeatDays: [1, 2, 3, 4, 5],
  },
  {
    id: 'alarm-3',
    hour: 14,
    minute: 47,
    label: 'ไปห้องน้ำ รอบ 2',
    isEnabled: false,
    repeatDays: [1, 2, 3, 4, 5],
  },
  {
    id: 'alarm-4',
    hour: 16,
    minute: 33,
    label: 'ไปห้องน้ำ รอบ 3',
    isEnabled: false,
    repeatDays: [1, 2, 3, 4, 5],
  },
];

export const AlarmView: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AlarmItem | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [editingAlarm, setEditingAlarm] = useState<AlarmItem | null>(null);
  const lastRungKeyRef = useRef<string>('');

  useEffect(() => {
    const savedStr = localStorage.getItem('focus_alarms_list');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAlarms(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved alarms:', e);
      }
    }
    setAlarms(DEFAULT_ALARMS);
    localStorage.setItem('focus_alarms_list', JSON.stringify(DEFAULT_ALARMS));
  }, []);

  // Reset page when alarms count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [alarms.length]);

  // Pagination Calculations
  const totalPages = Math.ceil(alarms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlarms = useMemo(() => {
    return alarms.slice(startIndex, endIndex);
  }, [alarms, startIndex, endIndex]);

  // Helper for generating page numbers with dots
  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  // Real-Time Clock Listener
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentS = now.getSeconds();
      const currentDay = now.getDay(); // 0 = Sun, 1 = Mon ...

      // Check at start of minute (seconds === 0)
      if (currentS === 0 || currentS === 1) {
        const minuteKey = `${currentH}:${currentM}:${currentDay}`;
        if (lastRungKeyRef.current === minuteKey) return;

        alarms.forEach((alarm) => {
          if (
            alarm.isEnabled &&
            alarm.hour === currentH &&
            alarm.minute === currentM &&
            alarm.repeatDays.includes(currentDay)
          ) {
            lastRungKeyRef.current = minuteKey;
            setActiveRingingAlarm(alarm);
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a));
    setAlarms(updated);
    localStorage.setItem('focus_alarms_list', JSON.stringify(updated));
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    localStorage.setItem('focus_alarms_list', JSON.stringify(updated));
  };

  const handleSaveAlarm = (hour: number, minute: number, label: string, repeatDays: number[]) => {
    let updated: AlarmItem[];
    if (editingAlarm) {
      updated = alarms.map((a) =>
        a.id === editingAlarm.id
          ? { ...a, hour, minute, label, repeatDays, isEnabled: true }
          : a
      );
    } else {
      const newAlarm: AlarmItem = {
        id: `alarm-${Date.now()}`,
        hour,
        minute,
        label,
        isEnabled: true,
        repeatDays,
      };
      updated = [...alarms, newAlarm];
    }
    setAlarms(updated);
    localStorage.setItem('focus_alarms_list', JSON.stringify(updated));
    setEditingAlarm(null);
  };

  const handleDismissAlarm = () => {
    setActiveRingingAlarm(null);
  };

  const handleSnoozeAlarm = (alarm: AlarmItem) => {
    setActiveRingingAlarm(null);
    const now = new Date();
    const snoozeTime = new Date(now.getTime() + 5 * 60 * 1000); // +5 minutes

    const snoozedAlarm: AlarmItem = {
      id: `snooze-${Date.now()}`,
      hour: snoozeTime.getHours(),
      minute: snoozeTime.getMinutes(),
      label: `[Snooze] ${alarm.label}`,
      isEnabled: true,
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
    };

    const updated = [...alarms, snoozedAlarm];
    setAlarms(updated);
    localStorage.setItem('focus_alarms_list', JSON.stringify(updated));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.8rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-sky)', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            <Sparkles size={14} /> แจ้งเตือนเวลาจริง
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            นาฬิกาปลุก
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            ตั้งเวลาปลุกตามเวลาจริงของเครื่องพร้อมตัวเลือกวันปลุกซ้ำ
          </p>
        </div>

        <button
          className="btn-primary-gradient"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          <span>เพิ่มนาฬิกาปลุก</span>
        </button>
      </div>

      {/* Alarms Grid Display */}
      {alarms.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              color: 'var(--blue-sky)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <Bell size={28} />
          </div>
          <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            ยังไม่มีรายการปลุก
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            กดปุ่มด้านล่างเพื่อเพิ่มการตั้งเวลาปลุกแรกของคุณ
          </p>
          <button
            className="btn-primary-gradient"
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '0.75rem 1.6rem', borderRadius: '14px', fontWeight: 700 }}
          >
            เพิ่มนาฬิกาปลุก
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {paginatedAlarms.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onToggle={handleToggleAlarm}
                onDelete={handleDeleteAlarm}
                onEdit={(target) => {
                  setEditingAlarm(target);
                  setIsAddModalOpen(true);
                }}
              />
            ))}
          </div>

          {/* Pagination Pills Control Bar */}
          {alarms.length > 0 && (
            <div
              className="glass-card"
              style={{
                marginTop: '1.8rem',
                padding: '1rem 1.6rem',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Page Indicator (Left Side) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.14)',
                    color: '#818cf8',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {currentPage}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  แสดง {startIndex + 1}-{Math.min(endIndex, alarms.length)} จากทั้งหมด {alarms.length} รายการ (หน้า {currentPage}/{totalPages})
                </span>
              </div>

              {/* Pills Button Controls (Right Side) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: currentPage === 1 ? 'var(--border-card)' : 'var(--text-main)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                {getPaginationRange(currentPage, totalPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                        ...
                      </span>
                    );
                  }

                  const isAct = currentPage === p;
                  return (
                    <button
                      key={`page-${p}`}
                      onClick={() => setCurrentPage(p as number)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        fontSize: '0.88rem',
                        fontWeight: isAct ? 800 : 600,
                        background: isAct
                          ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
                          : 'var(--bg-subtle)',
                        color: isAct ? '#ffffff' : 'var(--text-main)',
                        border: isAct ? 'none' : '1px solid var(--border-card)',
                        boxShadow: isAct ? '0 4px 14px rgba(168, 85, 247, 0.4)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: currentPage === totalPages ? 'var(--border-card)' : 'var(--text-main)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Alarm Modal */}
      <AddAlarmModal
        isOpen={isAddModalOpen}
        initialAlarm={editingAlarm}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAlarm(null);
        }}
        onAddAlarm={handleSaveAlarm}
      />

      {/* Alarm Ringing Overlay Popup */}
      <AlarmRingingModal
        alarm={activeRingingAlarm}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
      />
    </div>
  );
};

export default AlarmView;
