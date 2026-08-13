'use client';

import React from 'react';
import { LapRecord } from '../../types';
import { Flag, Zap, Snail } from 'lucide-react';

interface LapTableProps {
  laps: LapRecord[];
  formatMs: (ms: number) => string;
}

export const LapTable: React.FC<LapTableProps> = ({ laps, formatMs }) => {
  if (laps.length === 0) return null;

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
            {laps.map((lap) => {
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
    </div>
  );
};
