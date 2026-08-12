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
        {/* LEFT PANEL: Hero Section */}
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

        {/* RIGHT PANEL: Clean Form Card with Natural Typography Labels */}
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
          {/* Top Header */}
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

          {/* Clean Input Form (Natural Clean Thai Typography Labels) */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
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
                รหัสผ่าน
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="กรอกรหัสผ่าน 6 ตัวขึ้นไป"
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

          {/* Social OAuth Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.6rem 0', gap: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>หรือเข้าสู่ระบบด้วย</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* Executive Branded OAuth Social Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285f4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#fbbc05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                <path fill="#34a853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
              </svg>
              <span>Google</span>
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
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
