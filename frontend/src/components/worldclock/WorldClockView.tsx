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
      {/* Action Bar (Add City Button) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem' }}>
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
            boxShadow: 'var(--shadow-blue)',
          }}
        >
          <Plus size={18} />
          <span>เพิ่มเมือง</span>
        </button>
      </div>

      {/* World Map Header Box (Theme-Adaptive Light & Dark Mode) */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          marginBottom: '1.8rem',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Real-time Solar Day/Night Shadow Mask Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(59, 130, 246, 0.06) 0%, rgba(15, 23, 42, 0.35) 75%)',
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
          }}
        >
          {/* Grid Latitude/Longitude Lines */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="var(--border-card)" strokeDasharray="4 4" opacity="0.6" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="var(--border-card)" strokeDasharray="4 4" opacity="0.6" />

          {/* North America & Greenland */}
          <path
            fill="var(--text-muted)"
            opacity="0.25"
            d="M 120 70 L 160 50 L 220 55 L 290 60 L 320 110 L 290 140 L 250 190 L 210 240 L 170 210 L 140 160 L 100 120 Z M 330 35 L 390 25 L 430 45 L 380 90 L 340 60 Z"
          />
          {/* South America */}
          <path
            fill="var(--text-muted)"
            opacity="0.25"
            d="M 270 250 L 320 260 L 370 300 L 350 360 L 310 440 L 280 410 L 260 330 L 250 280 Z"
          />
          {/* Europe */}
          <path
            fill="var(--text-muted)"
            opacity="0.25"
            d="M 460 70 L 510 65 L 560 90 L 540 150 L 490 160 L 450 120 Z"
          />
          {/* Africa */}
          <path
            fill="var(--text-muted)"
            opacity="0.25"
            d="M 460 170 L 540 160 L 580 230 L 550 340 T 490 370 L 460 300 L 440 210 Z"
          />
          {/* Asia */}
          <path
            fill="var(--text-muted)"
            opacity="0.25"
            d="M 570 70 L 750 50 L 870 90 L 890 180 L 810 240 L 760 270 L 680 240 L 620 210 L 560 140 Z"
          />
          {/* Australia & Oceania */}
          <path
            fill="var(--text-muted)"
            opacity="0.25"
            d="M 790 310 L 890 300 L 910 370 L 850 430 L 770 390 Z"
          />
          {/* Japan */}
          <path
            fill="var(--text-muted)"
            opacity="0.35"
            d="M 870 160 L 880 150 L 890 180 L 875 200 Z"
          />
          {/* UK & Ireland */}
          <path
            fill="var(--text-muted)"
            opacity="0.35"
            d="M 460 100 L 470 90 L 475 110 L 465 120 Z"
          />
        </svg>

        {/* City Location Map Pins */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'auto' }}>
          {/* 1. Bangkok, Thailand (73%, 44%) */}
          <div style={{ position: 'absolute', top: '44%', left: '73%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--blue-sky)', border: '2px solid #ffffff', boxShadow: '0 0 12px var(--blue-sky)' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', padding: '0.2rem 0.6rem', borderRadius: '10px', boxShadow: 'var(--shadow-sm)', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇹🇭 กรุงเทพฯ
              </span>
            </div>
          </div>

          {/* 2. Tokyo, Japan (86%, 34%) */}
          <div style={{ position: 'absolute', top: '34%', left: '86%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', padding: '0.15rem 0.5rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇯🇵 โตเกียว
              </span>
            </div>
          </div>

          {/* 3. London, UK (48%, 24%) */}
          <div style={{ position: 'absolute', top: '24%', left: '48%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', padding: '0.15rem 0.5rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇬🇧 ลอนดอน
              </span>
            </div>
          </div>

          {/* 4. New York, USA (26%, 30%) */}
          <div style={{ position: 'absolute', top: '30%', left: '26%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', padding: '0.15rem 0.5rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇺🇸 นิวยอร์ก
              </span>
            </div>
          </div>

          {/* 5. Sydney, Australia (84%, 72%) */}
          <div style={{ position: 'absolute', top: '72%', left: '84%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa', border: '2px solid #ffffff', boxShadow: '0 0 10px #60a5fa' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', padding: '0.15rem 0.5rem', borderRadius: '8px', marginTop: '4px', whiteSpace: 'nowrap' }}>
                🇦🇺 ซิดนีย์
              </span>
            </div>
          </div>
        </div>

        {/* Sleek Top-Left Badge */}
        <div style={{ position: 'absolute', top: '1.2rem', left: '1.4rem', zIndex: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', background: 'var(--bg-subtle)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-card)', padding: '0.4rem 0.9rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}>
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
