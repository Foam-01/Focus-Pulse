'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MultiTimerPreset } from '../../types';
import { MultiTimerCard } from './MultiTimerCard';
import { AddTimerModal } from './AddTimerModal';
import { Plus, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_PRESETS: MultiTimerPreset[] = [
  { id: 'preset-1', title: '1 นาที', totalSeconds: 60 },
  { id: 'preset-3', title: '3 นาที', totalSeconds: 180 },
  { id: 'preset-5', title: '5 นาที', totalSeconds: 300 },
  { id: 'preset-10', title: '10 นาที', totalSeconds: 600 },
];

export const MultiTimerView: React.FC = () => {
  const [timers, setTimers] = useState<MultiTimerPreset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const savedStr = localStorage.getItem('focus_multi_timers');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTimers(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved multi timers:', e);
      }
    }
    // Fallback to initial defaults
    setTimers(DEFAULT_PRESETS);
    localStorage.setItem('focus_multi_timers', JSON.stringify(DEFAULT_PRESETS));
  }, []);

  // Reset page when timers change
  useEffect(() => {
    setCurrentPage(1);
  }, [timers.length]);

  // Pagination Calculations
  const totalPages = Math.ceil(timers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTimers = useMemo(() => {
    return timers.slice(startIndex, endIndex);
  }, [timers, startIndex, endIndex]);

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

  const handleAddTimer = (title: string, totalSeconds: number) => {
    const newTimer: MultiTimerPreset = {
      id: `timer-${Date.now()}`,
      title,
      totalSeconds,
    };
    const updated = [...timers, newTimer];
    setTimers(updated);
    localStorage.setItem('focus_multi_timers', JSON.stringify(updated));
  };

  const handleDeleteTimer = (id: string) => {
    const updated = timers.filter((t) => t.id !== id);
    setTimers(updated);
    localStorage.setItem('focus_multi_timers', JSON.stringify(updated));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header & Action Bar */}
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
            <Sparkles size={14} /> ตัวจับเวลานับถอยหลัง
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            นาฬิกาหลายเรือน
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            จัดการตัวนับถอยหลังหลายรายการพร้อมกัน
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
          <span>เพิ่มตัวจับเวลา</span>
        </button>
      </div>

      {/* Timer Grid Display */}
      {timers.length === 0 ? (
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
            <Clock size={28} />
          </div>
          <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            ยังไม่มีรายการตัวจับเวลา
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            กดปุ่มเพิ่มตัวจับเวลาเพื่อเริ่มต้นใช้งาน
          </p>
          <button
            className="btn-primary-gradient"
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '0.75rem 1.6rem', borderRadius: '14px', fontWeight: 700 }}
          >
            เพิ่มตัวจับเวลา
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {paginatedTimers.map((timer) => (
              <MultiTimerCard
                key={timer.id}
                id={timer.id}
                title={timer.title}
                totalSeconds={timer.totalSeconds}
                onDelete={handleDeleteTimer}
              />
            ))}
          </div>

          {/* Pagination Pills Control Bar (Matching Screenshot) */}
          {timers.length > 0 && (
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
                  แสดง {startIndex + 1}-{Math.min(endIndex, timers.length)} จากทั้งหมด {timers.length} เรือน (หน้า {currentPage}/{totalPages})
                </span>
              </div>

              {/* Pills Button Controls (Right Side) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Previous Arrow Button */}
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
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Number Pills */}
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

                {/* Next Arrow Button */}
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
                  title="หน้าถัดไป"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Timer Modal Form */}
      <AddTimerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTimer={handleAddTimer}
      />
    </div>
  );
};

export default MultiTimerView;
