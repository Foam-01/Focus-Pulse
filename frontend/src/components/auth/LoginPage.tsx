'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthUser } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
              setSuccessMsg('สมัครสมาชิกสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านของคุณ');
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
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากเพิ่งสมัครสมาชิก โปรดปิด "Confirm Email" ใน Supabase Dashboard)');
      } else if (rawMsg.includes('rate limit')) {
        setErrorMsg('เกินโควตาการส่งอีเมลยืนยันของ Supabase (Email Rate Limit) 💡 วิธีแก้: เข้า Supabase Dashboard -> Authentication -> Providers -> Email -> ปิด "Confirm email" แล้วกดสมัครใหม่ได้ทันทีครับ');
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

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      let rawMsg = err.message || '';
      if (rawMsg.includes('not enabled') || rawMsg.includes('Unsupported provider')) {
        setErrorMsg(`ระบบล็อกอินผ่าน ${provider.toUpperCase()} ยังไม่ได้ถูกเปิดใช้งานใน Supabase Dashboard (Authentication -> Providers -> ${provider.toUpperCase()}) โปรดเข้าสู่ระบบด้วย อีเมล และ รหัสผ่าน ด้านบนครับ`);
      } else {
        setErrorMsg(rawMsg || `เกิดข้อผิดพลาดในการล็อกอินผ่าน ${provider}`);
      }
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3.5rem',
          maxWidth: '1080px',
          width: '100%',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {/* LEFT PANEL: Executive Showcase & Live Session Widget */}
        <div style={{ paddingRight: '0.5rem' }}>
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
            จัดระเบียบเวลาทำงาน <br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--blue-sky) 0%, var(--navy-primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              และพักสายตาเมื่อครบกำหนด
            </span>
          </h1>

          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '2.2rem', fontWeight: 500 }}>
            เครื่องมือจับเวลาทำงานสไตล์ Pomodoro พร้อมวิดีโอผ่อนคลายที่เล่นให้อัตโนมัติเมื่อหมดเวลา
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
                  การจับเวลาทำงาน
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
              เข้าสู่ระบบเพื่อเริ่มใช้งาน
            </p>
          </div>

          {/* Premium Pill Segmented Tab Switcher */}
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

          {/* Error & Success Notification Messages */}
          {errorMsg && (
            <div
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Executive Input Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  ชื่อผู้ใช้งาน
                </label>
                <input
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
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                อีเมล
              </label>
              <input
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
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <input
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
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

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
                'กำลังดำเนินการ...'
              ) : mode === 'login' ? (
                'เข้าสู่ระบบ'
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Social OAuth Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>หรือเข้าสู่ระบบด้วย</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
          </div>

          {/* Executive Branded OAuth Social Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--border-card)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                backdropFilter: 'blur(10px)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285f4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#fbbc05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34a853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
              </svg>
              <span>Google</span>
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--border-card)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                backdropFilter: 'blur(10px)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="19" height="19" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '1.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              พบปัญหาการใช้งาน? ติดต่อผู้ดูแลระบบ Focus Pulse
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

