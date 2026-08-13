'use client';

import React, { useEffect, useRef } from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';
import { AlarmItem } from '../../types';

interface AlarmRingingModalProps {
  alarm: AlarmItem | null;
  onDismiss: () => void;
  onSnooze: (alarm: AlarmItem) => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  alarm,
  onDismiss,
  onSnooze,
}) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (alarm) {
      // Start alarm sound sequence
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        
        const playBeep = () => {
          if (!audioCtxRef.current) return;
          try {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(659.25, audioCtxRef.current.currentTime); // E5 note
            osc.frequency.setValueAtTime(880, audioCtxRef.current.currentTime + 0.15); // A5 note
            gain.gain.setValueAtTime(0.4, audioCtxRef.current.currentTime);
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            osc.start();
            osc.stop(audioCtxRef.current.currentTime + 0.4);
          } catch (e) {}
        };

        playBeep();
        intervalRef.current = setInterval(playBeep, 800);
      } catch (e) {
        console.log('Audio Context error');
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [alarm]);

  if (!alarm) return null;

  const formatAlarmTimeStr = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${hour12}:${pad(m)} ${period}`;
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(5, 10, 25, 0.88)', zIndex: 10000 }}>
      <div
        className="modal-content-box"
        style={{
          maxWidth: '460px',
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '28px',
          background: 'var(--bg-card)',
          border: '2px solid #f43f5e',
          boxShadow: '0 20px 60px rgba(244, 63, 94, 0.35)',
        }}
      >
        {/* Pulsing Bell Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.14)',
            color: '#f43f5e',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.2rem',
            animation: 'pulse 1.5s infinite',
          }}
        >
          <Bell size={42} />
        </div>

        <h2
          style={{
            fontFamily: 'Prompt, monospace',
            fontSize: '3rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            margin: '0.2rem 0',
            lineHeight: 1,
          }}
        >
          {formatAlarmTimeStr(alarm.hour, alarm.minute)}
        </h2>

        <p
          style={{
            fontFamily: 'Prompt, sans-serif',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--blue-sky)',
            marginBottom: '2rem',
          }}
        >
          {alarm.label || 'ถึงเวลาปลุกแล้ว!'}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <button
            onClick={onDismiss}
            className="btn-primary-gradient"
            style={{
              padding: '0.9rem',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
              boxShadow: '0 6px 20px rgba(225, 29, 72, 0.4)',
            }}
          >
            <BellOff size={20} />
            <span>ปิดเสียงปลุก (Dismiss)</span>
          </button>

          <button
            onClick={() => onSnooze(alarm)}
            className="action-btn-secondary"
            style={{
              padding: '0.8rem',
              borderRadius: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Clock size={18} />
            <span>เลื่อนการปลุก 5 นาที (Snooze)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
