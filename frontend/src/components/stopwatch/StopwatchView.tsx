'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LapRecord } from '../../types';
import { LapTable } from './LapTable';
import { Play, Pause, Flag, RotateCcw, Maximize2, X, Sparkles } from 'lucide-react';

export const StopwatchView: React.FC = () => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const lastLapTimeMsRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedMs;
      interval = setInterval(() => {
        setElapsedMs(performance.now() - startTimeRef.current);
      }, 10);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleRecordLap = () => {
    if (elapsedMs <= 0) return;

    const currentTotal = Math.floor(elapsedMs);
    const lapTimeMs = currentTotal - lastLapTimeMsRef.current;
    lastLapTimeMsRef.current = currentTotal;

    const newLap: LapRecord = {
      id: `lap-${Date.now()}`,
      lapNumber: laps.length + 1,
      lapTimeMs,
      totalTimeMs: currentTotal,
    };

    setLaps([newLap, ...laps]); // Newest lap on top
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
    lastLapTimeMsRef.current = 0;
  };

  const formatMsToParts = (totalMs: number) => {
    const totalSecs = Math.floor(totalMs / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const ms = Math.floor((totalMs % 1000) / 10); // 2 digits 00-99

    const pad = (n: number) => String(n).padStart(2, '0');

    return {
      hh: pad(h),
      mm: pad(m),
      ss: pad(s),
      ms: pad(ms),
      formattedStr: `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms)}`,
    };
  };

  const timeParts = formatMsToParts(elapsedMs);

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
            <Sparkles size={14} /> นาฬิกาจับเวลา
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            นาฬิกาจับเวลา
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            จับเวลาเดินหน้าและบันทึกเวลาต่อรอบ
          </p>
        </div>
      </div>

      {/* Main Stopwatch Digital Display Card */}
      <div
        className="glass-card"
        style={{
          padding: '3rem 2rem 2.5rem 2rem',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Top-Right Expand Icon */}
        <div style={{ position: 'absolute', top: '1.4rem', right: '1.4rem' }}>
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="ขยายจับเวลาเต็มจอ"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Giant Digital Time Numbers Display */}
        <div style={{ display: 'inline-block', margin: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
            <span
              style={{
                fontFamily: 'Prompt, monospace',
                fontSize: '4.8rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '1px',
                lineHeight: 1,
              }}
            >
              {timeParts.hh}:{timeParts.mm}:{timeParts.ss}
            </span>
            <span
              style={{
                fontFamily: 'Prompt, monospace',
                fontSize: '2.8rem',
                fontWeight: 800,
                color: 'var(--blue-sky)',
                lineHeight: 1,
              }}
            >
              .{timeParts.ms}
            </span>
          </div>

          {/* Unit Subtitles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600 }}>
            <span>hr</span>
            <span>min</span>
            <span>sec</span>
          </div>
        </div>

        {/* Control Buttons Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.4rem', marginTop: '2.2rem' }}>
          {/* Button 1: Play / Pause */}
          <button
            onClick={handleTogglePlay}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: isRunning
                ? 'linear-gradient(135deg, #e11d48, #f43f5e)'
                : 'linear-gradient(135deg, var(--navy-primary), var(--blue-sky))',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-blue)',
              transition: 'all 0.2s ease',
            }}
            title={isRunning ? 'พักเวลาชั่วคราว' : 'เริ่มจับเวลา'}
          >
            {isRunning ? <Pause size={28} fill="#ffffff" /> : <Play size={28} fill="#ffffff" style={{ marginLeft: '4px' }} />}
          </button>

          {/* Button 2: Flag / Record Lap */}
          <button
            onClick={handleRecordLap}
            disabled={elapsedMs <= 0}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              color: elapsedMs > 0 ? 'var(--blue-sky)' : 'var(--text-muted)',
              opacity: elapsedMs > 0 ? 1 : 0.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: elapsedMs > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
            title="บันทึกรอบ (Lap)"
          >
            <Flag size={22} />
          </button>

          {/* Button 3: Reset */}
          <button
            onClick={handleReset}
            disabled={elapsedMs <= 0 && laps.length === 0}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              color: elapsedMs > 0 || laps.length > 0 ? 'var(--text-main)' : 'var(--text-muted)',
              opacity: elapsedMs > 0 || laps.length > 0 ? 1 : 0.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: elapsedMs > 0 || laps.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
            title="รีเซ็ตเวลาและรอบ"
          >
            <RotateCcw size={22} />
          </button>
        </div>
      </div>

      {/* Laps History Table */}
      <LapTable laps={laps} formatMs={(ms) => formatMsToParts(ms).formattedStr} />

      {/* Fullscreen Modal */}
      {isExpanded && (
        <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
          <div
            className="modal-content-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '640px',
              textAlign: 'center',
              padding: '3rem 2rem',
              borderRadius: '28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                จับเวลาเดินหน้า
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
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

            {/* Giant Time Display in Modal */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', margin: '2rem 0' }}>
              <span style={{ fontFamily: 'Prompt, monospace', fontSize: '5.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                {timeParts.hh}:{timeParts.mm}:{timeParts.ss}
              </span>
              <span style={{ fontFamily: 'Prompt, monospace', fontSize: '3rem', fontWeight: 800, color: 'var(--blue-sky)', lineHeight: 1 }}>
                .{timeParts.ms}
              </span>
            </div>

            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '2rem' }}>
              <button
                onClick={handleTogglePlay}
                className="btn-primary-gradient"
                style={{ padding: '0.8rem 2rem', borderRadius: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
              >
                {isRunning ? <Pause size={22} fill="#ffffff" /> : <Play size={22} fill="#ffffff" />}
                <span>{isRunning ? 'พักเวลาชั่วคราว' : 'เริ่มจับเวลา'}</span>
              </button>

              <button
                onClick={handleRecordLap}
                disabled={elapsedMs <= 0}
                className="action-btn-secondary"
                style={{ padding: '0.8rem 1.6rem', borderRadius: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Flag size={18} />
                <span>บันทึกรอบ</span>
              </button>

              <button
                onClick={handleReset}
                disabled={elapsedMs <= 0 && laps.length === 0}
                className="action-btn-secondary"
                style={{ padding: '0.8rem 1.6rem', borderRadius: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RotateCcw size={18} />
                <span>รีเซ็ต</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopwatchView;
