'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ShieldCheck, QrCode, Key, CheckCircle2, Lock } from 'lucide-react';

interface MFASecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const MFASecurityModal: React.FC<MFASecurityModalProps> = ({ isOpen, onClose, user }) => {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      checkMFAStatus();
    }
  }, [isOpen, user]);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactor = data.totp.find((f) => f.status === 'verified');
      if (totpFactor) {
        setIsEnrolled(true);
        setFactorId(totpFactor.id);
      } else {
        setIsEnrolled(false);
      }
    } catch (e) {
      console.warn('MFA status check failed:', e);
    }
  };

  const handleEnrollMFA = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Focus Pulse',
        friendlyName: 'Authenticator Key',
      });
      if (error) throw error;

      setFactorId(data.id);
      setQrCodeSvg(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err: any) {
      setStatusMsg(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setStatusMsg('');
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      setIsEnrolled(true);
      setStatusMsg('เปิดใช้งานระบบความปลอดภัย 2FA สำเร็จเรียบร้อยแล้ว!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMsg(err.message || 'รหัส 6 หลักไม่ถูกต้อง โปรดลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(12px)',
        padding: '1rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '2.2rem 2rem',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.3s ease',
          color: 'var(--text-main)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-main)',
            borderRadius: '12px',
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

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-sky)', fontSize: '0.86rem', fontWeight: 800, marginBottom: '0.3rem' }}>
            <ShieldCheck size={16} /> การยืนยันตัวตน 2 ชั้น (2FA)
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ตั้งค่าความปลอดภัย 2FA
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 600 }}>
            สแกนด้วยแอป Authenticator เช่น Google Authenticator เพื่อเพิ่มความปลอดภัย
          </p>
        </div>

        {statusMsg && (
          <div
            style={{
              background: statusMsg.includes('สำเร็จ') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)',
              border: `1px solid ${statusMsg.includes('สำเร็จ') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(225, 29, 72, 0.4)'}`,
              color: statusMsg.includes('สำเร็จ') ? '#10b981' : '#f43f5e',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              fontSize: '0.88rem',
              marginBottom: '1.2rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {statusMsg}
          </div>
        )}

        {isEnrolled ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              เปิดใช้งาน 2FA แล้ว
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
              บัญชีของคุณเปิดใช้งานการยืนยันตัวตน 2 ชั้นเรียบร้อยแล้ว
            </p>
          </div>
        ) : !qrCodeSvg ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--bg-subtle)', color: 'var(--blue-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto', border: '1px solid var(--border-card)' }}>
              <Lock size={28} />
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5, fontWeight: 600 }}>
              กดปุ่มด้านล่างเพื่อแสดง QR Code สำหรับสแกนผูกแอป Authenticator
            </p>
            <button
              onClick={handleEnrollMFA}
              disabled={loading}
              className="btn-primary-gradient"
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '16px',
                fontSize: '0.98rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <QrCode size={18} /> {loading ? 'กำลังสร้าง...' : 'เริ่มตั้งค่า 2FA'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '20px', display: 'inline-block', border: '2px solid var(--blue-sky)', boxShadow: 'var(--shadow-md)' }}>
                <img src={qrCodeSvg} alt="MFA QR Code" style={{ width: '190px', height: '190px', display: 'block' }} />
              </div>
              <div style={{ marginTop: '0.8rem', padding: '0.5rem 0.8rem', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-card)', display: 'inline-block' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Secret Key: <code style={{ color: 'var(--blue-sky)', fontWeight: 800, fontSize: '0.9rem' }}>{secret}</code>
                </span>
              </div>
            </div>

            <form onSubmit={handleVerifyMFA} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 700 }}>
                กรอกรหัส 6 หลักจากแอป Authenticator:
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--blue-sky)' }} />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border-card)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontFamily: 'Prompt, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    letterSpacing: '4px',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || verifyCode.length !== 6}
                className="btn-primary-gradient"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '16px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  marginTop: '0.4rem',
                }}
              >
                {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
