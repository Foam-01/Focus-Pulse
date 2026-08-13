'use client';

import React, { useState, useEffect } from 'react';
import { CityClockItem } from '../../types';
import { WorldClockCard } from './WorldClockCard';
import { AddCityModal } from './AddCityModal';
import { Plus, Globe, Sparkles } from 'lucide-react';

const DEFAULT_5_CITIES: CityClockItem[] = [
  {
    id: 'city-bkk',
    cityName: 'กรุงเทพฯ',
    countryName: 'ประเทศไทย (Bangkok, Thailand)',
    timezone: 'Asia/Bangkok',
    flagEmoji: '🇹🇭',
    isLocal: true,
  },
  {
    id: 'city-tky',
    cityName: 'โตเกียว',
    countryName: 'ญี่ปุ่น (Tokyo, Japan)',
    timezone: 'Asia/Tokyo',
    flagEmoji: '🇯🇵',
  },
  {
    id: 'city-ldn',
    cityName: 'ลอนดอน',
    countryName: 'สหราชอาณาจักร (London, UK)',
    timezone: 'Europe/London',
    flagEmoji: '🇬🇧',
  },
  {
    id: 'city-nyc',
    cityName: 'นิวยอร์ก',
    countryName: 'สหรัฐอเมริกา (New York, USA)',
    timezone: 'America/New_York',
    flagEmoji: '🇺🇸',
  },
  {
    id: 'city-syd',
    cityName: 'ซิดนีย์',
    countryName: 'ออสเตรเลีย (Sydney, Australia)',
    timezone: 'Australia/Sydney',
    flagEmoji: '🇦🇺',
  },
];

export const WorldClockView: React.FC = () => {
  const [cities, setCities] = useState<CityClockItem[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedStr = localStorage.getItem('focus_world_clock_cities');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCities(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved world cities:', e);
      }
    }
    setCities(DEFAULT_5_CITIES);
    localStorage.setItem('focus_world_clock_cities', JSON.stringify(DEFAULT_5_CITIES));
  }, []);

  // Update real-time clock every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCity = (newCity: CityClockItem) => {
    const updated = [...cities, newCity];
    setCities(updated);
    localStorage.setItem('focus_world_clock_cities', JSON.stringify(updated));
  };

  const handleDeleteCity = (id: string) => {
    const updated = cities.filter((c) => c.id !== id);
    setCities(updated);
    localStorage.setItem('focus_world_clock_cities', JSON.stringify(updated));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.8rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-sky)', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            <Sparkles size={14} /> โซนเวลาโลก
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            เวลาโลก
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            ดูเวลาจริงของเมืองสำคัญทั่วโลกและเปรียบเทียบความต่างของเวลา
          </p>
        </div>

        <button
          className="btn-primary-gradient"
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.4rem',
            borderRadius: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          <span>เพิ่มเมือง</span>
        </button>
      </div>

      {/* World Map Header Box (Styled after Windows Clock App) */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0b1329 0%, #090d16 100%)',
          border: '1px solid var(--border-card)',
          marginBottom: '1.8rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Real-time Solar Day/Night Shadow Mask Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.65) 75%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Realistic World Continents SVG Path Illustration */}
        <svg
          viewBox="0 0 1000 500"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0.6,
          }}
        >
          {/* North America & Greenland */}
          <path
            fill="var(--navy-muted)"
            opacity="0.4"
            d="M 120 80 Q 180 50 280 70 T 320 140 T 260 210 T 180 260 T 140 180 Z M 340 40 Q 380 30 420 50 T 390 100 T 350 70 Z"
          />
          {/* South America */}
          <path
            fill="var(--navy-muted)"
            opacity="0.4"
            d="M 280 270 Q 340 280 370 340 T 320 440 T 270 380 T 260 300 Z"
          />
          {/* Europe */}
          <path
            fill="var(--navy-muted)"
            opacity="0.4"
            d="M 460 90 Q 520 80 560 110 T 540 170 T 480 160 T 460 120 Z"
          />
          {/* Africa */}
          <path
            fill="var(--navy-muted)"
            opacity="0.4"
            d="M 470 180 Q 560 170 580 250 T 540 370 T 480 340 T 460 230 Z"
          />
          {/* Asia & Middle East */}
          <path
            fill="var(--navy-muted)"
            opacity="0.4"
            d="M 570 90 Q 720 70 850 110 T 880 220 T 780 280 T 640 220 T 560 150 Z"
          />
          {/* Australia & Oceania */}
          <path
            fill="var(--navy-muted)"
            opacity="0.4"
            d="M 800 320 Q 890 310 910 370 T 850 430 T 790 390 Z"
          />

          {/* Grid Latitude/Longitude Lines */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        </svg>

        {/* City Location Map Pins */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'auto' }}>
          {/* 1. Bangkok, Thailand (71%, 46%) */}
          <div style={{ position: 'absolute', top: '46%', left: '71%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #ffffff', boxShadow: '0 0 12px #3b82f6' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ffffff', background: 'rgba(15, 23, 42, 0.85)', padding: '0.15rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇹🇭 กรุงเทพฯ
              </span>
            </div>
          </div>

          {/* 2. Tokyo, Japan (83%, 35%) */}
          <div style={{ position: 'absolute', top: '35%', left: '83%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(15, 23, 42, 0.8)', padding: '0.15rem 0.45rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇯🇵 โตเกียว
              </span>
            </div>
          </div>

          {/* 3. London, UK (49%, 28%) */}
          <div style={{ position: 'absolute', top: '28%', left: '49%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(15, 23, 42, 0.8)', padding: '0.15rem 0.45rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇬🇧 ลอนดอน
              </span>
            </div>
          </div>

          {/* 4. New York, USA (28%, 34%) */}
          <div style={{ position: 'absolute', top: '34%', left: '28%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(15, 23, 42, 0.8)', padding: '0.15rem 0.45rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇺🇸 นิวยอร์ก
              </span>
            </div>
          </div>

          {/* 5. Sydney, Australia (85%, 74%) */}
          <div style={{ position: 'absolute', top: '74%', left: '85%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(15, 23, 42, 0.8)', padding: '0.15rem 0.45rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇦🇺 ซิดนีย์
              </span>
            </div>
          </div>
        </div>

        {/* Sleek Top-Left Badge */}
        <div style={{ position: 'absolute', top: '1.2rem', left: '1.4rem', zIndex: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ffffff', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-card)', padding: '0.4rem 0.9rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}>
            <Globe size={15} style={{ color: 'var(--blue-sky)' }} /> แผนที่โซนเวลาโลก (World Clock Map)
          </div>
        </div>
      </div>

      {/* Cities Cards Grid Display */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {cities.map((city) => (
          <WorldClockCard
            key={city.id}
            city={city}
            currentTime={currentTime}
            onDelete={handleDeleteCity}
          />
        ))}
      </div>

      {/* Add City Modal */}
      <AddCityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectCity={handleAddCity}
        existingTimezones={cities.map((c) => c.timezone)}
      />
    </div>
  );
};

export default WorldClockView;
