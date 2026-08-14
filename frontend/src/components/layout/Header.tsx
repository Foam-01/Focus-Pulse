'use client';

import React from 'react';
import { ActiveView, AuthUser } from '../../types';
import { Sun, Moon, Menu } from 'lucide-react';
import { UserProfileMenu } from '../auth/UserProfileMenu';

interface HeaderProps {
  activeView: ActiveView;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenHistoryModal: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onOpenMFA: () => void;
  onToggleMobileMenu?: () => void;
}

const HEADER_TITLES: Record<ActiveView, { title: string; sub: string }> = {
  dashboardView: {
    title: 'แดชบอร์ด',
    sub: 'สรุปสถิติเวลาทำงานและเป้าหมายรายวัน',
  },
  timerView: {
    title: 'จับเวลาโฟกัส',
    sub: 'ตั้งเวลาทำงานแบบ Pomodoro',
  },
  multiTimerView: {
    title: 'นาฬิกาหลายเรือน',
    sub: 'ตั้งเวลานับถอยหลังหลายรายการพร้อมกัน',
  },
  alarmView: {
    title: 'นาฬิกาปลุก',
    sub: 'ตั้งเวลาปลุกและกำหนดวันแจ้งเตือนซ้ำ',
  },
  stopwatchView: {
    title: 'นาฬิกาจับเวลา',
    sub: 'จับเวลาเดินหน้าและบันทึกเวลาต่อรอบ',
  },
  worldClockView: {
    title: 'เวลาโลก',
    sub: 'เทียบเวลาเมืองสำคัญทั่วโลก',
  },
  videoLibraryView: {
    title: 'คลังวิดีโอพักสายตา',
    sub: 'วิดีโอพักสายตาระหว่างช่วงพัก',
  },
  historyView: {
    title: 'ประวัติการโฟกัส',
    sub: 'ตรวจสอบและจัดการประวัติการโฟกัสย้อนหลัง',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  theme,
  setTheme,
  onOpenHistoryModal,
  user,
  onOpenAuth,
  onOpenMFA,
  onToggleMobileMenu,
}) => {
  const currentHeader = HEADER_TITLES[activeView] || HEADER_TITLES.dashboardView;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="top-header-bar">
      <div className="header-titles-group" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        {onToggleMobileMenu && (
          <button
            className="mobile-menu-btn"
            onClick={onToggleMobileMenu}
            title="เปิดเมนู"
            aria-label="เปิดเมนูนำทางไซด์บาร์"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              borderRadius: '12px',
              padding: '0.55rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="header-active-title">{currentHeader.title}</h1>
          <p className="header-active-sub">{currentHeader.sub}</p>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="สลับธีม"
          aria-label={theme === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === 'dark' ? 'มืด' : 'สว่าง'}</span>
        </button>

        {/* User Profile / Login Button */}
        <UserProfileMenu user={user} onOpenAuth={onOpenAuth} onOpenMFA={onOpenMFA} />
      </div>
    </header>
  );
};
