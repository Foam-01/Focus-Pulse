'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Ticking preview timer for left hero widget
  const [previewSeconds, setPreviewSeconds] = useState(1500); // 25:00

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
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: name.trim() || 'สมาชิก Focus Pulse' },
          },
        });

        if (error) throw error;

        if (data.user) {
          setSuccessMsg('สมัครสมาชิกสำเร็จเรียบร้อยแล้ว! กำลังนำคุณเข้าสู่ระบบ...');
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 1000);
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
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากเพิ่งสมัครสมาชิก โปรดตรวจสอบว่าได้ปิด Confirm Email ใน Supabase Dashboard หรือยัง)');
      } else if (rawMsg.includes('rate limit')) {
        setErrorMsg('เกินโควตาการส่งอีเมลของ Supabase ชั่วคราว (Email Rate Limit) โปรดปิด Confirm Email บน Supabase Dashboard');
      } else if (rawMsg.includes('invalid') || rawMsg.includes('Email address')) {
        setErrorMsg('รูปแบบอีเมลไม่ถูกต้อง โปรดเว้นช่องว่างหน้า/หลังออก หรือลองใช้อีเมลจริงของคุณ (เช่น yourname@gmail.com)');
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
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%)',
        color: '#f8fafc',
        padding: '2.5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Subtle Ambient Glow Halos */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '4rem',
          maxWidth: '1040px',
          width: '100%',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {/* LEFT PANEL: Perfectly Copywritten & Balanced Hero Section */}
        <div style={{ paddingRight: '0.5rem' }}>
          {/* Brand Header */}
          <div style={{ marginBottom: '1.4rem' }}>
            <span
              style={{
                fontFamily: 'Prompt, sans-serif',
                fontSize: '2.4rem',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#ffffff',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              Focus Pulse
            </span>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, marginTop: '0.3rem', display: 'block', letterSpacing: '0.5px' }}>
              Executive Workspace
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'Prompt, sans-serif',
              fontSize: '2.1rem',
              fontWeight: 800,
              lineHeight: 1.35,
              color: '#ffffff',
              marginBottom: '1.2rem',
              letterSpacing: '-0.3px',
              whiteSpace: 'pre-line',
            }}
          >
            สร้างสมาธิขั้นสูง <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              และทำงานอย่างทรงพลังในทุกๆ วัน
            </span>
          </h1>

          <p style={{ fontSize: '0.94rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '2.2rem', fontWeight: 500 }}>
            พอร์ทัลบริหารเวลาทำงานรายวัน พร้อมระบบเล่นวิดีโอพักสายตาให้อัตโนมัติเมื่อจับเวลาครบกำหนด
          </p>

          {/* Interactive Live App Preview Widget */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '1.4rem 1.6rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc' }}>
                  Live Session
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '0.22rem 0.7rem', borderRadius: '12px', fontWeight: 700 }}>
                Pomodoro 25 นาที
              </span>
            </div>

            {/* Circular Timer Ring Showcase */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
              <div
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  border: '4px solid rgba(56, 189, 248, 0.2)',
                  borderTopColor: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', display: 'block', lineHeight: 1 }}>
                    {formatTime(previewSeconds)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px', display: 'block' }}>เวลาโฟกัส</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.3rem' }}>
                  ระบบพักสายตาอัตโนมัติ
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  พร้อมเปิดเล่นวิดีโอผ่อนคลายเมื่อจับเวลาครบเซสชัน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Clean Centered Card Layout (No Badge Box Above Title) */}
        <div
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '28px',
            padding: '2.8rem 2.4rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Top Header without FP Badge */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h2
              style={{
                fontFamily: 'Prompt, sans-serif',
                fontSize: '2.2rem',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                marginBottom: '0.3rem',
              }}
            >
              Focus Pulse
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
              เข้าสู่ระบบเพื่อเริ่มต้นใช้งานพอร์ทัล
            </p>
          </div>

          {/* Underline Tab Switcher */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '1.8rem',
            }}
          >
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: 'transparent',
                fontSize: '0.94rem',
                fontWeight: mode === 'login' ? 800 : 500,
                color: mode === 'login' ? '#38bdf8' : '#94a3b8',
                borderBottom: mode === 'login' ? '3px solid #38bdf8' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                marginBottom: '-1px',
              }}
            >
              เข้าสู่ระบบ
            </button>

            <button
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                background: 'transparent',
                fontSize: '0.94rem',
                fontWeight: mode === 'register' ? 800 : 500,
                color: mode === 'register' ? '#38bdf8' : '#94a3b8',
                borderBottom: mode === 'register' ? '3px solid #38bdf8' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                marginBottom: '-1px',
              }}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(225, 29, 72, 0.12)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                color: '#f43f5e',
                padding: '0.8rem 1.1rem',
                borderRadius: '16px',
                fontSize: '0.88rem',
                marginBottom: '1.4rem',
                fontWeight: 600,
                lineHeight: 1.4,
                textAlign: 'center',
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '0.8rem 1.1rem',
                borderRadius: '16px',
                fontSize: '0.88rem',
                marginBottom: '1.4rem',
                fontWeight: 600,
                lineHeight: 1.4,
                textAlign: 'center',
              }}
            >
              {successMsg}
            </div>
          )}

          {/* Clean Input Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  ชื่อผู้ใช้งาน
                </label>
                <input
                  type="text"
                  required
                  placeholder="ระบุชื่อผู้ใช้งาน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.88rem 1.1rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: '0.96rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                อีเมล (Email Address)
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.88rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '0.96rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.88rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontSize: '0.96rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-gradient"
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 800,
                marginTop: '0.6rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                border: 'none',
                color: '#ffffff',
              }}
            >
              {loading ? (
                'กำลังยืนยันข้อมูล...'
              ) : mode === 'login' ? (
                'ยืนยันเข้าสู่ระบบ'
              ) : (
                'ยืนยันการสมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Social OAuth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.6rem 0', gap: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>หรือเข้าสู่ระบบด้วย</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => handleOAuthLogin('google')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Google
            </button>

            <button
              onClick={() => handleOAuthLogin('github')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              GitHub
            </button>
          </div>

          {/* Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
              พบปัญหาการใช้งาน? ติดต่อผู้ดูแลระบบ Focus Pulse
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
