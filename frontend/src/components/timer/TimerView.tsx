'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../../services/api';
import { VideoItem, AnalyticsSummary, FocusSessionRecord } from '../../types';
import { VideoModal } from '../videos/VideoModal';
import { TimerCircle } from './TimerCircle';
import { Play, Pause, RotateCcw, Zap, ChevronUp, ChevronDown, Clock, CheckCircle2, History, BookOpen, Code, Palette, Briefcase } from 'lucide-react';

export const TimerView: React.FC = () => {
  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [focusMinutesInput, setFocusMinutesInput] = useState<string>('25');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionStatus, setSessionStatus] = useState<string>('พร้อมเริ่มต้นโฟกัส');
  const [selectedTag, setSelectedTag] = useState<string>('งานทั่วไป');

  // Analytics & History state
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    todayMinutes: 0,
    todayRounds: 0,
    dailyGoalMinutes: 480,
    goalProgressPercent: 0,
    yesterdayMinutes: 0,
    streakDays: 0,
    chartData: [],
  });

  const [recentHistory, setRecentHistory] = useState<FocusSessionRecord[]>([]);

  // Reward Video Modal state
  const [rewardVideo, setRewardVideo] = useState<VideoItem | null>(null);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const loadData = async () => {
    const summary = await ApiService.getAnalyticsSummary('day');
    setAnalytics(summary);
    const historyList = await ApiService.getHistory();
    setRecentHistory(historyList.slice(0, 5));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keep input text field synced with focusMinutes
  useEffect(() => {
    setFocusMinutesInput(String(focusMinutes));
  }, [focusMinutes]);

  // Play audio chime synthesized via Web Audio API
  const playNotificationSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const handleTimerFinish = async () => {
    setIsRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setSessionStatus('ครบกำหนดเวลาโฟกัสแล้ว! กำลังเปิดวิดีโอผ่อนคลาย...');
    playNotificationSound();

    // Fetch primary reward video and open popup
    const primaryVdo = await ApiService.getPrimaryVideo();
    setRewardVideo(primaryVdo);
    setShowRewardModal(true);
  };

  // Called when user clicks "เสร็จสิ้นเซสชัน 1 รอบ" in the VideoModal
  const handleConfirmFinishSession = async () => {
    const now = new Date();
    await ApiService.createSession({
      date: now.toLocaleDateString('sv-SE'),
      time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      duration: focusMinutes,
      tag: selectedTag,
    });
    setSessionStatus('เซสชันโฟกัสเสร็จสิ้นเรียบร้อยแล้ว (+1 รอบ)');
    setShowRewardModal(false);
    await loadData();
  };

  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleTimerFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, focusMinutes]);

  const selectPresetMinutes = (mins: number) => {
    if (isRunning) return;
    setFocusMinutes(mins);
    setFocusMinutesInput(String(mins));
    setRemainingSeconds(mins * 60);
    setSessionStatus('พร้อมเริ่มต้นโฟกัส');
  };

  const adjustMinutes = (delta: number) => {
    if (isRunning) return;
    const newMins = Math.min(480, Math.max(1, focusMinutes + delta));
    setFocusMinutes(newMins);
    setFocusMinutesInput(String(newMins));
    setRemainingSeconds(newMins * 60);
    setSessionStatus('พร้อมเริ่มต้นโฟกัส');
  };

  // Handle direct custom typing into the minute display box
  const handleMinutesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRunning) return;
    const raw = e.target.value.replace(/[^0-9]/g, ''); // Allow digits only
    if (raw.length > 3) return; // Limit to max 3 digits

    setFocusMinutesInput(raw);

    if (raw !== '') {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val >= 1 && val <= 480) {
        setFocusMinutes(val);
        setRemainingSeconds(val * 60);
        setSessionStatus('พร้อมเริ่มต้นโฟกัส');
      }
    }
  };

  // Validation / boundary guard when user finishes typing (onBlur or Enter)
  const handleMinutesInputBlur = () => {
    if (isRunning) return;
    let val = parseInt(focusMinutesInput, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
    } else if (val > 480) {
      val = 480;
    }
    setFocusMinutes(val);
    setFocusMinutesInput(String(val));
    setRemainingSeconds(val * 60);
    setSessionStatus('พร้อมเริ่มต้นโฟกัส');
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setSessionStatus('พักการจับเวลา');
    } else {
      setIsRunning(true);
      setSessionStatus('กำลังจับเวลาโฟกัส');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(focusMinutes * 60);
    setSessionStatus('พร้อมเริ่มต้นโฟกัส');
  };

  const testQuickFinish = () => {
    setRemainingSeconds(3);
    if (!isRunning) {
      setIsRunning(true);
      setSessionStatus('กำลังทดสอบ 3 วินาทีสุดท้าย...');
    }
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const goalHours = (analytics.dailyGoalMinutes / 60).toFixed(0);

  const tagOptions = [
    { name: 'งานทั่วไป', icon: Briefcase },
    { name: 'อ่านหนังสือ', icon: BookOpen },
    { name: 'เขียนโค้ด', icon: Code },
    { name: 'งานออกแบบ', icon: Palette },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.8rem', width: '100%' }}>
      {/* LEFT CARD: เตรียมตัวเริ่มงาน */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2.2rem 2rem',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              เตรียมตัวลุยงาน
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-subtle)', color: 'var(--blue-sky)', padding: '0.25rem 0.75rem', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 600 }}>
              <Clock size={14} /> โหมดตั้งสมาธิ
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            เตรียมพร้อมจับเวลาทำงาน เมื่อครบกำหนดเวลาระบบจะเปิดวิดีโอผ่อนคลายให้พักสายตาโดยอัตโนมัติ
          </p>

          {/* Category / Tag Selector */}
          <div style={{ marginBottom: '1.4rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              เลือกประเภทงานที่ลุยอยู่:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {tagOptions.map((t) => {
                const IconComp = t.icon;
                const isSelected = selectedTag === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTag(t.name)}
                    disabled={isRunning}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: isSelected ? '1px solid var(--blue-sky)' : '1px solid var(--border-card)',
                      background: isSelected ? 'var(--bg-subtle)' : 'transparent',
                      color: isSelected ? 'var(--blue-sky)' : 'var(--text-secondary)',
                      cursor: isRunning ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IconComp size={13} /> {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Control Box with Direct Typing & Boundary Guards */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                borderRadius: '20px',
                padding: '0.8rem 1.6rem',
                minWidth: '220px',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ textAlign: 'center', flex: 1 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isRunning}
                  value={focusMinutesInput}
                  onChange={handleMinutesInputChange}
                  onBlur={handleMinutesInputBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleMinutesInputBlur();
                  }}
                  style={{
                    fontFamily: 'Prompt, sans-serif',
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    lineHeight: 1,
                    letterSpacing: '-1px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isRunning ? 'none' : '2px dashed var(--blue-sky)',
                    width: '110px',
                    textAlign: 'center',
                    outline: 'none',
                    cursor: isRunning ? 'not-allowed' : 'text',
                    transition: 'all 0.2s ease',
                  }}
                  title={isRunning ? 'กำลังจับเวลา ไม่สามารถแก้ไขเวลาได้' : 'คลิกเพื่อพิมพ์ระบุจำนวนนาทีเอง (ขอบเขต 1 - 480 นาที)'}
                />
                <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--blue-sky)', fontWeight: 600, marginTop: '2px' }}>
                  นาที (คลิกพิมพ์ระบุเลขได้)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginLeft: '1.2rem', borderLeft: '1px solid var(--border-card)', paddingLeft: '1rem' }}>
                <button
                  onClick={() => adjustMinutes(5)}
                  disabled={isRunning}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    padding: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title="เพิ่มเวลา 5 นาที"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => adjustMinutes(-5)}
                  disabled={isRunning}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    padding: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  title="ลดเวลา 5 นาที"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem', fontWeight: 500 }}>
            {focusMinutes <= 25 ? 'ลุยยาวรวดเดียว ไม่มีเวลาพัก' : 'มีเวลาพักสั้นๆ หลังจบช่วงงาน'}
          </p>

          {/* Preset Pills */}
          <div className="pill-btns-group" style={{ justifyContent: 'center', marginBottom: '1.8rem', gap: '0.6rem' }}>
            {[15, 25, 45, 60].map((m) => (
              <button
                key={m}
                className={`pill-btn ${focusMinutes === m ? 'active' : ''}`}
                onClick={() => selectPresetMinutes(m)}
                disabled={isRunning}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '16px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  background: focusMinutes === m ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'var(--bg-subtle)',
                  color: focusMinutes === m ? '#ffffff' : 'var(--text-secondary)',
                  border: focusMinutes === m ? 'none' : '1px solid var(--border-card)',
                  boxShadow: focusMinutes === m ? 'var(--shadow-blue)' : 'none',
                }}
              >
                {m} นาที
              </button>
            ))}
          </div>

          {/* Timer Display Circle */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TimerCircle
              remainingSeconds={remainingSeconds}
              totalSeconds={focusMinutes * 60}
              formattedTime={formattedTime}
              sessionStatus={sessionStatus}
            />
          </div>
        </div>

        {/* Action Button Group */}
        <div style={{ marginTop: '1.8rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <button
            className={`btn-primary-gradient ${isRunning ? 'running' : ''}`}
            onClick={toggleTimer}
            style={{
              width: '100%',
              padding: '1.05rem',
              fontSize: '1.1rem',
              borderRadius: '18px',
              fontWeight: 700,
              background: isRunning ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
              boxShadow: isRunning ? '0 8px 25px rgba(225, 29, 72, 0.35)' : 'var(--shadow-blue)',
            }}
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
            <span>{isRunning ? 'พักชั่วคราว' : 'เริ่มลุยงาน'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="action-btn-secondary" onClick={resetTimer} style={{ flex: 1, padding: '0.7rem' }}>
              <RotateCcw size={16} /> <span>เริ่มใหม่</span>
            </button>
            <button className="action-btn-secondary" onClick={testQuickFinish} style={{ flex: 1, padding: '0.7rem' }}>
              <Zap size={16} /> <span>ทดสอบระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT CARD: สรุปผลงานวันนี้ (ขนาดใหญ่เด่นชัดสะใจ) */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '1.4rem',
          padding: '2.4rem 2.2rem',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* TOP SECTION: สรุปผลงานวันนี้ + 3 Stat Layout + ความคืบหน้าวันนี้ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              สรุปผลงานวันนี้
            </h2>
            <span style={{ fontSize: '0.95rem', color: 'var(--blue-sky)', background: 'var(--bg-subtle)', padding: '0.35rem 1rem', borderRadius: '16px', fontWeight: 700 }}>
              สรุปภาพรวม
            </span>
          </div>

          {/* 3 Stat Layout: เมื่อวาน | เป้าหมายวันนี้ Circle Ring (ใหญ่เด่นสะใจ 185px) | ทำต่อเนื่อง */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem', textAlign: 'center' }}>
            {/* 1. เมื่อวาน */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.4rem 0.6rem', borderRadius: '22px', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                เมื่อวาน
              </span>
              <span style={{ fontFamily: 'Prompt, sans-serif', fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                {analytics.yesterdayMinutes}
              </span>
              <span style={{ display: 'block', fontSize: '0.92rem', color: 'var(--blue-sky)', marginTop: '0.4rem', fontWeight: 700 }}>
                นาที
              </span>
            </div>

            {/* 2. เป้าหมายวันนี้ Circle Ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '185px',
                  height: '185px',
                  borderRadius: '50%',
                  background: `conic-gradient(#3b82f6 ${analytics.goalProgressPercent}%, var(--bg-subtle) 0)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    เป้าหมายวันนี้
                  </span>
                  <span style={{ fontFamily: 'Prompt, sans-serif', fontSize: '3.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, margin: '3px 0' }}>
                    {goalHours}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--blue-sky)', fontWeight: 700 }}>
                    ชั่วโมง
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1rem', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                ทำไปได้แล้ว: <span style={{ color: 'var(--blue-sky)', fontSize: '1.3rem', fontWeight: 900 }}>{analytics.todayMinutes} นาที</span>
              </div>
            </div>

            {/* 3. ทำต่อเนื่อง */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.4rem 0.6rem', borderRadius: '22px', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                ทำต่อเนื่อง
              </span>
              <span style={{ fontFamily: 'Prompt, sans-serif', fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', lineHeight: 1 }}>
                {analytics.streakDays}
              </span>
              <span style={{ display: 'block', fontSize: '0.92rem', color: 'var(--blue-sky)', marginTop: '0.4rem', fontWeight: 700 }}>
                วัน
              </span>
            </div>
          </div>

          {/* ความคืบหน้าวันนี้ */}
          <div style={{ padding: '1.1rem 1.4rem', background: 'var(--bg-subtle)', borderRadius: '18px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>
              ความคืบหน้าวันนี้: <strong style={{ color: 'var(--blue-sky)', fontSize: '1.6rem', fontWeight: 900 }}>{analytics.goalProgressPercent}%</strong> ของเป้าหมายประจำวัน
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: ประวัติการลุยงานล่าสุด */}
        <div style={{ paddingTop: '1.2rem', borderTop: '1px solid var(--border-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--bg-subtle)', color: 'var(--blue-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <History size={19} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  ประวัติการโฟกัสล่าสุด (Recent Completed Rounds)
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  รายการรอบการทำงานที่ทำเสร็จล่าสุดเพื่อติดตามความต่อเนื่อง
                </p>
              </div>
            </div>

            <span style={{ fontSize: '0.82rem', color: 'var(--blue-sky)', background: 'var(--bg-subtle)', padding: '0.22rem 0.75rem', borderRadius: '10px', fontWeight: 700 }}>
              {recentHistory.length} รอบล่าสุด
            </span>
          </div>

          {recentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--bg-subtle)', borderRadius: '14px' }}>
              ยังไม่มีรายการโฟกัสในวันนี้ เริ่มกดจับเวลาเพื่อสั่งสมความสำเร็จได้เลย!
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="history-table" style={{ fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>เวลา</th>
                    <th>ระยะเวลา</th>
                    <th>หมวดหมู่งาน</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHistory.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.date}</td>
                      <td>{item.time}</td>
                      <td>
                        <span style={{ color: 'var(--blue-sky)', fontWeight: 700 }}>{item.duration} นาที</span>
                      </td>
                      <td>
                        <span style={{ background: 'var(--bg-subtle)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {item.tag || 'โฟกัสทั่วไป'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem' }}>
                          <CheckCircle2 size={14} /> สำเร็จ 1 รอบ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reward Video Popup Modal upon completion */}
      {showRewardModal && rewardVideo && (
        <VideoModal
          video={rewardVideo}
          isRewardMode={true}
          onClose={() => setShowRewardModal(false)}
          onFinishSession={handleConfirmFinishSession}
        />
      )}
    </div>
  );
};
