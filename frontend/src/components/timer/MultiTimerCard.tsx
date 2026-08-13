'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Trash2, X, Bell } from 'lucide-react';

interface MultiTimerCardProps {
  id: string;
  title: string;
  totalSeconds: number;
  onDelete: (id: string) => void;
}

export const MultiTimerCard: React.FC<MultiTimerCardProps> = ({
  id,
  title,
  totalSeconds,
  onDelete,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
    setIsCompleted(false);
  }, [totalSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            triggerAlarmSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const triggerAlarmSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio Context beep play');
    }
  };

  const handleTogglePlay = () => {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(totalSeconds);
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(totalSeconds);
  };

  const formatTimeStr = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // SVG Circumference calculation for diameter 150 (r = 75, circumference = 2 * PI * 75 ≈ 471.2)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <>
      <div
        className="glass-card"
        style={{
          background: isCompleted ? 'rgba(244, 63, 94, 0.08)' : 'var(--bg-card)',
          border: isCompleted ? '2px solid #f43f5e' : isRunning ? '2px solid var(--blue-sky)' : '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '1.4rem 1.6rem',
          boxShadow: isRunning ? 'var(--shadow-blue)' : 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <span style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {title}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="ขยายขนาดการ์ดจับเวลา"
            >
              <Maximize2 size={14} />
            </button>

            <button
              onClick={() => onDelete(id)}
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: '#f43f5e',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="ลบการ์ดจับเวลานี้"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Circular Progress & Formatted Time Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.8rem 0' }}>
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {/* Background Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="var(--bg-subtle)"
                strokeWidth="10"
              />
              {/* Progress Active Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={isCompleted ? '#f43f5e' : 'var(--blue-sky)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>

            {/* Time Text Overlay */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span
                style={{
                  fontFamily: 'Prompt, monospace',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: isCompleted ? '#f43f5e' : 'var(--text-main)',
                  letterSpacing: '0.5px',
                  display: 'block',
                }}
              >
                {formatTimeStr(remainingSeconds)}
              </span>
              {isCompleted && (
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                  <Bell size={12} /> หมดเวลาแล้ว!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
          <button
            onClick={handleTogglePlay}
            style={{
              width: '44px',
              height: '44px',
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
            title={isRunning ? 'พักชั่วคราว' : 'เริ่มจับเวลา'}
          >
            {isRunning ? <Pause size={20} fill="#ffffff" /> : <Play size={20} fill="#ffffff" style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={handleReset}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="รีเซ็ตเวลา"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Fullscreen Expand Modal */}
      {isExpanded && (
        <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
          <div
            className="modal-content-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              textAlign: 'center',
              padding: '2.5rem 2rem',
              borderRadius: '28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {title}
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

            {/* Large Modal Clock */}
            <div style={{ position: 'relative', width: '240px', height: '240px', margin: '1rem auto' }}>
              <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="120" cy="120" r="105" fill="none" stroke="var(--bg-subtle)" strokeWidth="12" />
                <circle
                  cx="120"
                  cy="120"
                  r="105"
                  fill="none"
                  stroke={isCompleted ? '#f43f5e' : 'var(--blue-sky)'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 105}
                  strokeDashoffset={2 * Math.PI * 105 * (1 - progressRatio)}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>

              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Prompt, monospace', fontSize: '2.5rem', fontWeight: 800, color: isCompleted ? '#f43f5e' : 'var(--text-main)' }}>
                  {formatTimeStr(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.8rem' }}>
              <button
                onClick={handleTogglePlay}
                className="btn-primary-gradient"
                style={{ padding: '0.8rem 2rem', borderRadius: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
              >
                {isRunning ? <Pause size={20} fill="#ffffff" /> : <Play size={20} fill="#ffffff" />}
                <span>{isRunning ? 'พักชั่วคราว' : 'เริ่มจับเวลา'}</span>
              </button>

              <button
                onClick={handleReset}
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
    </>
  );
};
