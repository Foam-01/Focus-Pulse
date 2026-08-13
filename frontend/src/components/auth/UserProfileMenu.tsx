'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';

interface UserProfileMenuProps {
  user: any;
  onOpenAuth: () => void;
  onOpenMFA: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onOpenAuth, onOpenMFA }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '14px',
          border: '1px solid var(--border-card)',
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.88rem',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-blue)',
          transition: 'all 0.2s ease',
        }}
      >
        <User size={16} /> <span>เข้าสู่ระบบ</span>
      </button>
    );
  }

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'ผู้ใช้งาน';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.45rem 0.9rem',
          borderRadius: '14px',
          border: '1px solid var(--border-card)',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          fontSize: '0.88rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.82rem',
            fontWeight: 800,
          }}
        >
          {userDisplayName.charAt(0).toUpperCase()}
        </div>
        <span>{userDisplayName}</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '220px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '0.5rem',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 999,
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-card)', marginBottom: '0.4rem' }}>
            <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {userDisplayName}
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </span>
          </div>

          <button
            onClick={() => { setDropdownOpen(false); onOpenMFA(); }}
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={16} color="var(--blue-sky)" /> ตั้งค่าความปลอดภัย 2FA
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(225, 29, 72, 0.08)',
              color: '#f43f5e',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              textAlign: 'left',
              marginTop: '0.3rem',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
};
