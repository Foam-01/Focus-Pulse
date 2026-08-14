'use client';

import React from 'react';
import { ActiveView } from '../../types';
import { LayoutDashboard, Timer, Clock, Bell, Watch, Globe, Film, History, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: { id: ActiveView; title: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboardView',
      title: 'แดชบอร์ด',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'timerView',
      title: 'จับเวลา',
      icon: <Timer size={20} />,
    },
    {
      id: 'historyView',
      title: 'ประวัติการโฟกัส',
      icon: <History size={20} />,
    },
    {
      id: 'multiTimerView',
      title: 'นาฬิกาหลายเรือน',
      icon: <Clock size={20} />,
    },
    {
      id: 'alarmView',
      title: 'นาฬิกาปลุก',
      icon: <Bell size={20} />,
    },
    {
      id: 'stopwatchView',
      title: 'นาฬิกาจับเวลา',
      icon: <Watch size={20} />,
    },
    {
      id: 'worldClockView',
      title: 'เวลาโลก',
      icon: <Globe size={20} />,
    },
    {
      id: 'videoLibraryView',
      title: 'วิดีโอผ่อนคลาย',
      icon: <Film size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile Overlay Background */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 25, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 40,
          }}
        />
      )}

      <aside aria-label="เมนูหลักของแอปพลิเคชัน" className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-group">
            <div className="brand-icon">
              <Timer size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-name">Focus Pulse</span>
            </div>
          </div>

          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="ย่อ/ขยายเมนู"
            aria-label={isCollapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">เมนู</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              title={item.title}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-text">{item.title}</span>
            </button>
          ))}
        </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {!isCollapsed && <span>Focus Pulse v1.0</span>}
      </div>
    </aside>
    </>
  );
};
