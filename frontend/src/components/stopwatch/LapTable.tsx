'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LapRecord } from '../../types';
import { Flag, Zap, Snail, ChevronLeft, ChevronRight } from 'lucide-react';

interface LapTableProps {
  laps: LapRecord[];
  formatMs: (ms: number) => string;
}

export const LapTable: React.FC<LapTableProps> = ({ laps, formatMs }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [laps.length]);

  if (laps.length === 0) return null;

  // Pagination Calculations
  const totalPages = Math.ceil(laps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLaps = laps.slice(startIndex, endIndex);

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

  // Identify Fastest and Slowest Laps (only if there are 2 or more laps)
  let fastestId: string | null = null;
  let slowestId: string | null = null;

  if (laps.length >= 2) {
    let minTime = Infinity;
    let maxTime = -1;

    laps.forEach((lap) => {
      if (lap.lapTimeMs < minTime) {
        minTime = lap.lapTimeMs;
        fastestId = lap.id;
      }
      if (lap.lapTimeMs > maxTime) {
        maxTime = lap.lapTimeMs;
        slowestId = lap.id;
      }
    });
  }

  return (
    <div
      className="glass-card"
      style={{
        marginTop: '2rem',
        padding: '1.8rem 2rem',
        borderRadius: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-subtle)', color: 'var(--blue-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flag size={18} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            ประวัติการบันทึกรอบ ({laps.length} รอบ)
          </h3>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>รอบที่</th>
              <th>เวลารอบนี้ (Lap Time)</th>
              <th style={{ textAlign: 'right' }}>เวลารวมสะสม (Total Time)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLaps.map((lap) => {
              const isFastest = lap.id === fastestId;
              const isSlowest = lap.id === slowestId;

              return (
                <tr
                  key={lap.id}
                  style={{
                    background: isFastest
                      ? 'rgba(16, 185, 129, 0.08)'
                      : isSlowest
                      ? 'rgba(244, 63, 94, 0.08)'
                      : 'transparent',
                  }}
                >
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <span>Lap {lap.lapNumber}</span>
                      {isFastest && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.16)', padding: '0.15rem 0.5rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Zap size={11} /> เร็วที่สุด
                        </span>
                      )}
                      {isSlowest && (
                        <span style={{ fontSize: '0.72rem', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.16)', padding: '0.15rem 0.5rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Snail size={11} /> ช้าที่สุด
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'Prompt, monospace',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        color: isFastest ? '#10b981' : isSlowest ? '#f43f5e' : 'var(--text-main)',
                      }}
                    >
                      {formatMs(lap.lapTimeMs)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'Prompt, monospace', fontWeight: 600, fontSize: '1rem', color: 'var(--text-secondary)' }}>
                      {formatMs(lap.totalTimeMs)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Pills Control Bar */}
      {laps.length > 0 && (
        <div
          style={{
            marginTop: '1.4rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
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
              แสดง {startIndex + 1}-{Math.min(endIndex, laps.length)} จากทั้งหมด {laps.length} รอบ (หน้า {currentPage}/{totalPages})
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
    </div>
  );
};
