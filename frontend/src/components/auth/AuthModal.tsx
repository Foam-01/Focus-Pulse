'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Mail, Lock, User, LogIn, UserPlus, ShieldCheck, Chrome, Github } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
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
          setSuccessMsg('สมัครสมาชิกสำเร็จเรียบร้อยแล้ว!');
          setTimeout(() => {
            onSuccess(data.user);
            onClose();
          }, 1200);
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
          }, 1000);
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
            <ShieldCheck size={16} /> ความปลอดภัยระดับสูง
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {mode === 'login' ? 'เข้าสู่ระบบ Focus Pulse' : 'สมัครสมาชิกใหม่'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 600 }}>
            {mode === 'login' ? 'กรอกข้อมูลเพื่อซิงค์ประวัติเวลาโฟกัสของคุณ' : 'สร้างบัญชีเพื่อปกป้องและจัดเก็บข้อมูลส่วนตัวของคุณ'}
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
              gap: '0.4rem',
            }}
          >
            <LogIn size={16} /> เข้าสู่ระบบ
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
              gap: '0.4rem',
            }}
          >
            <UserPlus size={16} /> สมัครสมาชิก
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
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="ชื่อ หรือ สมญานาม"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.78rem 1rem 0.78rem 2.8rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
              อีเมล (Email Address)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.78rem 1rem 0.78rem 2.8rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
              รหัสผ่าน (Password)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.78rem 1rem 0.78rem 2.8rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
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
              gap: '0.5rem',
            }}
          >
            {loading ? (
              <span>กำลังยืนยันข้อมูล...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={18} /> <span>เข้าสู่ระบบ</span>
              </>
            ) : (
              <>
                <UserPlus size={18} /> <span>ยืนยันการสมัครสมาชิก</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.4rem 0', gap: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>หรือเข้าสู่ระบบด้วย</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
        </div>

        {/* OAuth Provider Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleOAuthLogin('google')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '14px',
              border: '1px solid var(--border-card)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Chrome size={18} color="#ea4335" /> Google
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '14px',
              border: '1px solid var(--border-card)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Github size={18} /> GitHub
          </button>
        </div>
      </div>
    </div>
  );
};
