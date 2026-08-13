'use client';

import React from 'react';
import { VideoItem } from '../../types';
import { X, CheckCircle, Sparkles } from 'lucide-react';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  isRewardMode?: boolean;
  onFinishSession?: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  onClose,
  isRewardMode = false,
  onFinishSession,
}) => {
  if (!video) return null;

  const handleFinish = () => {
    if (onFinishSession) {
      onFinishSession();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: isRewardMode ? '2px solid #3b82f6' : '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '1.6rem',
          maxWidth: '90vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--text-main)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
          <div>
            {isRewardMode && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-subtle)', color: 'var(--blue-sky)', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                <Sparkles size={15} /> ครบกำหนดเวลาแล้ว
              </div>
            )}
            <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {video.title}
            </h3>
            <span style={{ fontSize: '0.84rem', color: 'var(--blue-sky)', fontWeight: 600 }}>{video.category}</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
            title="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        {/* Natural Video Player */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', borderRadius: '18px', overflow: 'hidden', padding: '0.2rem' }}>
          <video
            controls
            autoPlay
            loop
            src={video.src}
            poster={video.poster}
            style={{
              maxWidth: '85vw',
              maxHeight: '65vh',
              width: 'auto',
              height: 'auto',
              display: 'block',
              borderRadius: '16px',
              objectFit: 'contain',
            }}
          >
            เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
          </video>
        </div>

        {/* Footer info & Finish Session Action Button */}
        <div style={{ width: '100%', marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', flex: 1, minWidth: '220px', lineHeight: 1.5, fontWeight: 500 }}>
            {video.description}
          </p>

          {isRewardMode ? (
            <button
              className="btn-primary-gradient"
              onClick={handleFinish}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.8rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.98rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-blue)',
              }}
            >
              <CheckCircle size={20} />
              <span>บันทึกรอบนี้</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '12px',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              ปิด
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
