'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthUser } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Ticking preview timer for left hero widget
  const [previewSeconds, setPreviewSeconds] = useState(1490); // 24:50

  useEffect(() => {
    const timer = setInterval(() => {
      setPreviewSeconds((prev) => (prev > 0 ? prev - 1 : 1500));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('กรุณากรอกอีเมลของคุณ');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
      if (error) throw error;
      setSuccessMsg('ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย');
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
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
              data: { full_name: name.trim() || 'ผู้ใช้ Focus Pulse' },
            },
          });

          if (error) throw error;
          signUpUser = data.user;
          signUpSession = data.session;
        } catch (regErr: any) {
          const regErrMsg = (regErr.message || '').toLowerCase();
          if (regErrMsg.includes('already registered') || regErrMsg.includes('user_already_exists')) {
            throw new Error('อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทนไหม?');
          }
          if (regErrMsg.includes('rate limit')) {
            const { data: directSignIn } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });

            if (directSignIn?.user) {
              setSuccessMsg('เข้าสู่ระบบเรียบร้อยแล้ว!');
              setTimeout(() => {
                onLoginSuccess(directSignIn.user);
              }, 800);
              return;
            }
          }
          throw regErr;
        }

        if (signUpUser) {
          if (signUpSession) {
            setSuccessMsg('สมัครสมาชิกสำเร็จเรียบร้อยแล้ว! กำลังนำคุณเข้าสู่ระบบ...');
            setTimeout(() => {
              onLoginSuccess(signUpUser);
            }, 800);
          } else {
            // Attempt auto-login with newly registered credentials
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });

            if (signInData?.user) {
              setSuccessMsg('สมัครสมาชิกและเข้าสู่ระบบเรียบร้อยแล้ว!');
              setTimeout(() => {
                onLoginSuccess(signInData.user);
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
          setSuccessMsg('เข้าสู่ระบบสำเร็จเรียบร้อย! ยินดีต้อนรับสู่ Focus Pulse');
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 800);
        }
      }
    } catch (err: any) {
      let rawMsg = err.message || '';
      if (rawMsg.includes('Invalid login credentials')) {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง หากเพิ่งสมัครสมาชิก กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ');
      } else if (rawMsg.includes('rate limit')) {
        setErrorMsg('ลองใหม่อีกสักครู่ ระบบรับคำขอเยอะเกินไปในขณะนี้');
      } else if (rawMsg.includes('invalid') || rawMsg.includes('Email address')) {
        setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง ลองตรวจสอบหรือใช้อีเมลอื่น');
      } else if (rawMsg.includes('already registered')) {
        setErrorMsg('อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทนไหม?');
      } else {
        setErrorMsg(rawMsg || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
        color: 'var(--text-main)',
        padding: '2.5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Prompt', 'IBM Plex Sans Thai', sans-serif",
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Background Subtle Ambient Glow Halos */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="login-page-grid"
      >
        {/* LEFT PANEL: Executive Showcase & Live Session Widget */}
        <div className="login-hero-panel" style={{ paddingRight: '0.5rem' }}>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div>
              <span
                style={{
                  fontFamily: 'Prompt, sans-serif',
                  fontSize: '1.85rem',
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  color: 'var(--text-main)',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                Focus Pulse
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--blue-sky)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Executive Workspace
              </span>
            </div>
          </div>

          <h1
            style={{
              fontFamily: 'Prompt, sans-serif',
              fontSize: '2.1rem',
              fontWeight: 800,
              lineHeight: 1.35,
              color: 'var(--text-main)',
              marginBottom: '1.2rem',
              letterSpacing: '-0.3px',
            }}
          >
            โฟกัสให้เต็มที่ <br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--blue-sky) 0%, var(--navy-primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              พักอย่างสม่ำเสมอ
            </span>
          </h1>

          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '2.2rem', fontWeight: 500 }}>
            จับเวลาแบบ Pomodoro วิดีโอพักสายตาเล่นอัตโนมัติเมื่อหมดรอบ
          </p>

          {/* Live Interactive Hero Preview Card */}
          <div
            className="glass-card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '24px',
              padding: '1.5rem 1.6rem',
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  กำลังโฟกัส
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--blue-sky)', background: 'var(--bg-subtle)', padding: '0.22rem 0.7rem', borderRadius: '12px', fontWeight: 700, border: '1px solid var(--border-card)' }}>
                Pomodoro 25 นาที
              </span>
            </div>

            {/* Circular Timer Ring Showcase */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem', marginBottom: '1.2rem' }}>
              <div
                style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  border: '4px solid var(--border-card)',
                  borderTopColor: 'var(--blue-sky)',
                  borderRightColor: 'var(--blue-sky)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', lineHeight: 1 }}>
                    {formatTime(previewSeconds)}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '3px', display: 'block' }}>เวลาโฟกัส</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  พักสายตาอัตโนมัติ
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  เล่นวิดีโอผ่อนคลายทันทีเมื่อจับเวลาครบกำหนด
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Executive Auth Card */}
        <div
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            padding: '2.5rem 2.2rem',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Top Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
            <h2
              style={{
                fontFamily: 'Prompt, sans-serif',
                fontSize: '1.75rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                letterSpacing: '-0.3px',
                marginBottom: '0.3rem',
              }}
            >
              Focus Pulse
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {mode === 'login' ? 'ยินดีต้อนรับกลับ' : mode === 'register' ? 'สร้างบัญชีฟรี เริ่มใช้งานได้เลย' : 'กรอกอีเมลเพื่อตั้งรหัสผ่านใหม่'}
            </p>
          </div>

          {/* Premium Pill Segmented Tab Switcher */}
          {mode !== 'forgot' && (
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-subtle)',
                padding: '4px',
                borderRadius: '16px',
                marginBottom: '1.6rem',
                border: '1px solid var(--border-card)',
              }}
            >
              <button
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: mode === 'login' ? 'linear-gradient(135deg, var(--navy-primary) 0%, var(--blue-sky) 100%)' : 'transparent',
                  fontSize: '0.9rem',
                  fontWeight: mode === 'login' ? 700 : 500,
                  color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: mode === 'login' ? 'var(--shadow-blue)' : 'none',
                }}
              >
                เข้าสู่ระบบ
              </button>

              <button
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: mode === 'register' ? 'linear-gradient(135deg, var(--navy-primary) 0%, var(--blue-sky) 100%)' : 'transparent',
                  fontSize: '0.9rem',
                  fontWeight: mode === 'register' ? 700 : 500,
                  color: mode === 'register' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: mode === 'register' ? 'var(--shadow-blue)' : 'none',
                }}
              >
                สมัครสมาชิก
              </button>
            </div>
          )}

          {/* Error & Success Notification Messages */}
          {errorMsg && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                background: 'rgba(225, 29, 72, 0.12)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                color: '#f43f5e',
                padding: '0.8rem 1.1rem',
                borderRadius: '14px',
                fontSize: '0.85rem',
                marginBottom: '1.4rem',
                fontWeight: 600,
                lineHeight: 1.45,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              aria-live="polite"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '0.8rem 1.1rem',
                borderRadius: '14px',
                fontSize: '0.85rem',
                marginBottom: '1.4rem',
                fontWeight: 600,
                lineHeight: 1.45,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }} aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label htmlFor="forgot-email" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  อีเมล
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.94rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.92rem',
                  borderRadius: '14px',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, var(--navy-primary) 0%, var(--blue-sky) 100%)',
                  boxShadow: 'var(--shadow-blue)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  border: 'none',
                  color: '#ffffff',
                  transition: 'all 0.25s ease',
                }}
              >
                {loading ? 'กำลังส่งลิงก์...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--blue-sky)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                ← กลับไปหน้าเข้าสู่ระบบ
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {mode === 'register' && (
              <div>
                <label htmlFor="register-name" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  ชื่อผู้ใช้งาน
                </label>
                <input
                  id="register-name"
                  type="text"
                  required
                  placeholder="กรอกชื่อของคุณ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.94rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div>
              <label htmlFor="login-email" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                อีเมล
              </label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.94rem',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label htmlFor="login-password" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="กรอกรหัสผ่าน 6 ตัวขึ้นไป"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 2.75rem 0.85rem 1.1rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.94rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: '4px',
                  }}
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--blue-sky)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="register-confirm-password" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.94rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.92rem',
                borderRadius: '14px',
                fontSize: '0.98rem',
                fontWeight: 800,
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, var(--navy-primary) 0%, var(--blue-sky) 100%)',
                boxShadow: 'var(--shadow-blue)',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                border: 'none',
                color: '#ffffff',
                transition: 'all 0.25s ease',
              }}
            >
              {loading ? (
                mode === 'login' ? 'กำลังเข้าสู่ระบบ...' : 'กำลังสมัครสมาชิก...'
              ) : mode === 'login' ? (
                'เข้าสู่ระบบ'
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>
          )}

          {/* Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '1.6rem' }}>
            <a href="mailto:support@focuspulse.app" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>
              มีปัญหา? ติดต่อทีมงาน
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

