'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ShieldCheck } from 'lucide-react';
import { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'register') {
        let signUpUser = null;
        let signUpSession = null;

        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { full_name: name.trim() || 'สมาชิก Focus Pulse' },
            },
          });

          if (error) throw error;
          signUpUser = data.user;
          signUpSession = data.session;
        } catch (regErr: any) {
          const regErrMsg = (regErr.message || '').toLowerCase();
          if (regErrMsg.includes('already registered') || regErrMsg.includes('user_already_exists')) {
            throw new Error('อีเมลนี้ถูกลงทะเบียนแล้ว กรุณาสลับไปที่แท็บ "เข้าสู่ระบบ" เพื่อใช้งาน');
          }
          if (regErrMsg.includes('rate limit')) {
            const { data: directSignIn } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });

            if (directSignIn?.user) {
              setSuccessMsg('เข้าสู่ระบบเรียบร้อยแล้ว!');
              setTimeout(() => {
                onSuccess(directSignIn.user);
                onClose();
              }, 800);
              return;
            }
          }
          throw regErr;
        }

        if (signUpUser) {
          if (signUpSession) {
            setSuccessMsg('สมัครสมาชิกสำเร็จเรียบร้อยแล้ว!');
            setTimeout(() => {
              onSuccess(signUpUser);
              onClose();
            }, 800);
          } else {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });

            if (signInData?.user) {
              setSuccessMsg('สมัครสมาชิกสำเร็จและเข้าสู่ระบบเรียบร้อยแล้ว!');
              setTimeout(() => {
                onSuccess(signInData.user);
                onClose();
              }, 800);
            } else {
              setSuccessMsg('สมัครสมาชิกสำเร็จแล้ว! กรุณาตรวจสอบอีเมลของคุณเพื่อกดยืนยันบัญชี ก่อนเข้าสู่ระบบ');
              setMode('login');
            }
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('เข้าสู่ระบบสำเร็จเรียบร้อย!');
          setTimeout(() => {
            onSuccess(data.user);
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      let rawMsg = err.message || '';
      if (rawMsg.includes('Invalid login credentials')) {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง หากเพิ่งสมัครสมาชิก กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ');
      } else if (rawMsg.includes('rate limit')) {
        setErrorMsg('ระบบมีคำขอเข้ามาเยอะในขณะนี้ กรุณาลองใหม่อีกครั้งในอีกสักครู่');
      } else if (rawMsg.includes('invalid') || rawMsg.includes('Email address')) {
        setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง โปรดตรวจสอบช่องว่างหรือลองใช้อีเมลอื่น');
      } else if (rawMsg.includes('already registered')) {
        setErrorMsg('อีเมลนี้ได้รับการสมัครสมาชิกไว้แล้ว โปรดกดสลับเป็นแท็บ "เข้าสู่ระบบ"');
      } else {
        setErrorMsg(rawMsg || 'เกิดข้อผิดพลาดในการยืนยันตัวตน โปรดลองอีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="หน้าต่างเข้าสู่ระบบและสมัครสมาชิก"
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
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
          aria-label="ปิดหน้าต่าง"
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

        {/* Modal Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-sky)', fontSize: '0.86rem', fontWeight: 800, marginBottom: '0.3rem' }}>
            <ShieldCheck size={16} /> ความปลอดภัยบัญชี
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {mode === 'login' ? 'เข้าสู่ระบบ Focus Pulse' : 'สมัครสมาชิกใหม่'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 600 }}>
            {mode === 'login' ? 'ยินดีต้อนรับกลับ' : 'สร้างบัญชีใหม่เริ่มบันทึกข้อมูลได้เลย'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-subtle)',
            padding: '0.3rem',
            borderRadius: '16px',
            border: '1px solid var(--border-card)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: mode === 'login' ? 700 : 500,
              background: mode === 'login' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            เข้าสู่ระบบ
          </button>

          <button
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: mode === 'register' ? 700 : 500,
              background: mode === 'register' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div style={{ background: 'rgba(225, 29, 72, 0.12)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#f43f5e', padding: '0.75rem 1rem', borderRadius: '14px', fontSize: '0.86rem', marginBottom: '1.2rem', fontWeight: 700 }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.75rem 1rem', borderRadius: '14px', fontSize: '0.86rem', marginBottom: '1.2rem', fontWeight: 700 }}>
            {successMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                ชื่อผู้ใช้งาน
              </label>
              <input
                type="text"
                required
                className="app-input"
                placeholder="ชื่อ หรือ สมญานาม"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
              อีเมล
            </label>
            <input
              type="email"
              required
              className="app-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="app-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-gradient"
            style={{
              width: '100%',
              padding: '0.88rem',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <span>{mode === 'login' ? 'กำลังเข้าสู่ระบบ...' : 'กำลังสมัครสมาชิก...'}</span>
            ) : mode === 'login' ? (
              <span>เข้าสู่ระบบ</span>
            ) : (
              <span>ยืนยันการสมัครสมาชิก</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
