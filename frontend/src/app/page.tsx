'use client';

import React, { useState, useEffect } from 'react';
import { ActiveView } from '../types';
import { supabase } from '../lib/supabase';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { DashboardView } from '../components/dashboard/DashboardView';
import { TimerView } from '../components/timer/TimerView';
import { VideoLibraryView } from '../components/videos/VideoLibraryView';
import { HistoryModal } from '../components/history/HistoryModal';
import { AuthModal } from '../components/auth/AuthModal';
import { MFASecurityModal } from '../components/auth/MFASecurityModal';
import { LoginPage } from '../components/auth/LoginPage';

export default function HomePage() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboardView');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Supabase Auth State & Modals
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMFAModalOpen, setIsMFAModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check initial user session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setAuthLoading(false);
    });

    // Listen to Auth State changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Loading Screen while checking Supabase Auth session
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          color: '#f8fafc',
          fontFamily: 'Prompt, sans-serif',
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.5rem' }}>
          Focus Pulse
        </div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          กำลังตรวจสอบเซสชันความปลอดภัย...
        </div>
      </div>
    );
  }

  // GATEKEEP: If user is not logged in, render Standalone Full-Page Login Landing Screen!
  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  // Once authenticated, grant access to Main Focus Pulse App
  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <main className="app-main-content">
        {/* Top Header Bar */}
        <Header
          activeView={activeView}
          theme={theme}
          setTheme={setTheme}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenMFA={() => setIsMFAModalOpen(true)}
        />

        {/* Dynamic Section Views */}
        {activeView === 'dashboardView' && <DashboardView />}
        {activeView === 'timerView' && <TimerView />}
        {activeView === 'videoLibraryView' && <VideoLibraryView />}
      </main>

      {/* History Log In-App Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      {/* MFA Security Modal (2FA Authenticator Setup) */}
      <MFASecurityModal
        isOpen={isMFAModalOpen}
        onClose={() => setIsMFAModalOpen(false)}
        user={user}
      />
    </div>
  );
}
