'use client';

import React from 'react';
import { ActiveView } from '../../types';
import { Sun, Moon, History } from 'lucide-react';
import { UserProfileMenu } from '../auth/UserProfileMenu';

interface HeaderProps {
  activeView: ActiveView;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenHistoryModal: () => void;
  user: any;
  onOpenAuth: () => void;
  onOpenMFA: () => void;
}

const HEADER_TITLES: Record<ActiveView, { title: string; sub: string }> = {
  dashboardView: {
    title: 'สรุปผลงาน',
    sub: 'สถิติเวลาโฟกัสและเป้าหมายประจำวัน',
  },
  timerView: {
    title: 'จับเวลาโฟกัส',
    sub: 'จับเวลาทำงาน 25 นาที แบบ Pomodoro',
  },
  multiTimerView: {
    title: 'จับเวลาหลายเรือน',
    sub: 'สร้างและควบคุมนาฬิกาจับเวลานับถอยหลังหลายเรือนพร้อมกัน',
  },
  videoLibraryView: {
    title: 'วิดีโอพักสายตา',
    sub: 'วิดีโอผ่อนคลายสำหรับเล่นเมื่อหมดเวลาโฟกัส',
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
}) => {
  const currentHeader = HEADER_TITLES[activeView] || HEADER_TITLES.dashboardView;

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header className="top-header-bar">
      <div className="header-titles-group">
        <h1 className="header-active-title">{currentHeader.title}</h1>
        <p className="header-active-sub">{currentHeader.sub}</p>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="action-btn-secondary" onClick={onOpenHistoryModal}>
          <History size={18} />
          <span>ประวัติ</span>
        </button>

        <button className="theme-toggle-btn" onClick={toggleTheme} title="สลับธีม">
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === 'dark' ? 'มืด' : 'สว่าง'}</span>
        </button>

        {/* User Profile / Login Button */}
        <UserProfileMenu user={user} onOpenAuth={onOpenAuth} onOpenMFA={onOpenMFA} />
      </div>
    </header>
  );
};
