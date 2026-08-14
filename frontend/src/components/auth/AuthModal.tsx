'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ShieldCheck } from 'lucide-react';

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
          const regErrMsg = regErr.message || '';
          if (regErrMsg.includes('rate limit') || regErrMsg.includes('already registered')) {
            const { data: directSignIn } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });

            if (directSignIn?.user) {
              setSuccessMsg('เข้าสู่ระบบด้วยบัญชีของคุณเรียบร้อยแล้ว!');
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
              setSuccessMsg('สมัครสมาชิกสำเร็จแล้ว! คุณสามารถเข้าสู่ระบบได้ทันที');
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
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากเพิ่งสมัครสมาชิก โปรดปิด Confirm Email ใน Supabase Dashboard)');
      } else if (rawMsg.includes('rate limit')) {
        setErrorMsg('เกินโควตาการส่งอีเมลของ Supabase ชั่วคราว (Email Rate Limit) 💡 วิธีแก้: เข้า Supabase Dashboard -> Authentication -> Providers -> Email -> ปิด Confirm email');
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
            <ShieldCheck size={16} /> ความปลอดภัยบัญชี
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {mode === 'login' ? 'เข้าสู่ระบบ Focus Pulse' : 'สมัครสมาชิกใหม่'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 600 }}>
            {mode === 'login' ? 'กรอกข้อมูลเพื่อเข้าสู่ระบบ' : 'สร้างบัญชีใหม่เพื่อเริ่มบันทึกข้อมูล'}
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
                placeholder="ชื่อ หรือ สมญานาม"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.78rem 1rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-card)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
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
                padding: '0.78rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--border-card)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
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
                padding: '0.78rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--border-card)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                outline: 'none',
              }}
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
              <span>กำลังยืนยันข้อมูล...</span>
            ) : mode === 'login' ? (
              <span>เข้าสู่ระบบ</span>
            ) : (
              <span>ยืนยันการสมัครสมาชิก</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.4rem 0', gap: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>หรือเข้าสู่ระบบด้วย</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-card)' }} />
        </div>

        {/* Official Branded OAuth Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            style={{
              flex: 1,
              padding: '0.75rem',
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
            <svg width="18" height="18" viewBox="0 0 24 24">
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
              padding: '0.75rem',
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
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
