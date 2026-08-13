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

      {/* World Map Vector Illustration Header Card */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(9, 13, 22, 0.98))',
          border: '1px solid var(--border-card)',
          marginBottom: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* World Map SVG Vector */}
        <svg viewBox="0 0 1000 500" style={{ width: '100%', height: '100%', opacity: 0.25, objectFit: 'cover' }}>
          <path
            fill="var(--text-main)"
            d="M150,150 Q200,100 250,150 T350,150 T450,150 T550,150 T650,150 T750,150 T850,150 M100,250 Q200,200 300,250 T500,250 T700,250 T900,250 M200,350 Q300,300 400,350 T600,350 T800,350"
            stroke="var(--blue-sky)"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
          {/* Map Pins */}
          <circle cx="780" cy="240" r="8" fill="#3b82f6" /> {/* Bangkok */}
          <circle cx="850" cy="200" r="8" fill="#60a5fa" /> {/* Tokyo */}
          <circle cx="480" cy="180" r="8" fill="#60a5fa" /> {/* London */}
          <circle cx="280" cy="210" r="8" fill="#60a5fa" /> {/* NYC */}
          <circle cx="880" cy="360" r="8" fill="#60a5fa" /> {/* Sydney */}
        </svg>

        {/* Ambient Map Text Overlay */}
        <div style={{ position: 'absolute', textAlign: 'center', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-sky)', background: 'var(--blue-light)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.4rem' }}>
            <Globe size={16} /> แผนที่โซนเวลาโลก (World Timezones Map)
          </div>
          <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            เปรียบเทียบเวลาจริง 5 เมืองสำคัญทั่วโลก
          </span>
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
