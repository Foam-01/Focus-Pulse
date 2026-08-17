'use client';

import React, { useState, useEffect } from 'react';
import { VideoItem } from '../../types';
import { X, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';

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
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);

  useEffect(() => {
    setHasVideoError(false);
  }, [video?.id, video?.src]);

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

        {/* Natural Video Player or Fallback Alert */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', borderRadius: '18px', overflow: 'hidden', padding: '0.2rem', minHeight: '260px' }}>
          {hasVideoError ? (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#ffffff' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.16)', color: '#f43f5e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <AlertTriangle size={28} />
              </div>
              <h4 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                ไม่สามารถเล่นวิดีโอนี้ได้
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.7)', maxWidth: '440px', margin: '0 auto 1.2rem auto', lineHeight: 1.5 }}>
                เนื่องจากไฟล์นี้เป็นลิงก์ Blob ชั่วคราวที่หมดอายุหลังรีเฟรชเบราว์เซอร์ กรุณาลบไฟล์นี้ออกและอัปโหลดวิดีโอนี้ใหม่อีกครั้ง
              </p>
            </div>
          ) : (
            <video
              controls
              autoPlay
              muted
              loop
              preload="auto"
              playsInline
              src={video.src}
              poster={video.poster}
              onError={() => setHasVideoError(true)}
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
          )}
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
