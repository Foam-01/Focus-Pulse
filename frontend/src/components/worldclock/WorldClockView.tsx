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

const CITY_MAP_COORDINATES: Record<string, { top: string; left: string }> = {
  'Asia/Bangkok': { top: '44%', left: '73%' },
  'Asia/Tokyo': { top: '34%', left: '86%' },
  'Europe/London': { top: '24%', left: '48%' },
  'America/New_York': { top: '30%', left: '26%' },
  'Australia/Sydney': { top: '72%', left: '84%' },
  'Europe/Paris': { top: '26%', left: '49%' },
  'Asia/Seoul': { top: '35%', left: '83%' },
  'Asia/Singapore': { top: '50%', left: '74%' },
  'Asia/Dubai': { top: '38%', left: '62%' },
  'America/Los_Angeles': { top: '32%', left: '16%' },
  'Europe/Berlin': { top: '23%', left: '51%' },
  'Asia/Shanghai': { top: '35%', left: '79%' },
  'Europe/Rome': { top: '27%', left: '51%' },
  'Asia/Kolkata': { top: '40%', left: '68%' },
  'America/Toronto': { top: '28%', left: '26%' },
  'Europe/Moscow': { top: '20%', left: '58%' },
  'Asia/Hong_Kong': { top: '41%', left: '78%' },
};

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
      {/* World Map Header Box (Large Spacious Map Display) */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
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

        {/* High-Definition Generated World Map Image Asset */}
        <img
          src="/images/world_map_vector.png"
          alt="World Map Graphic"
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.8,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Dynamic City Location Map Pins */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'auto' }}>
          {cities.map((city) => {
            const coords = CITY_MAP_COORDINATES[city.timezone] || { top: '50%', left: '50%' };
            return (
              <div
                key={city.id}
                style={{
                  position: 'absolute',
                  top: coords.top,
                  left: coords.left,
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: city.isLocal ? '14px' : '12px',
                      height: city.isLocal ? '14px' : '12px',
                      borderRadius: '50%',
                      background: city.isLocal ? 'var(--blue-sky)' : '#60a5fa',
                      border: '2px solid #ffffff',
                      boxShadow: city.isLocal ? '0 0 14px var(--blue-sky)' : '0 0 10px #60a5fa',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-card)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)',
                      marginTop: '4px',
                      whiteSpace: 'nowrap',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {city.flagEmoji} {city.cityName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sleek Top-Left Badge */}
        <div style={{ position: 'absolute', top: '1.2rem', left: '1.4rem', zIndex: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', background: 'var(--bg-subtle)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-card)', padding: '0.4rem 0.9rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.82rem' }}>
            <Globe size={15} style={{ color: 'var(--blue-sky)' }} /> แผนที่โซนเวลาโลก 
          </div>
        </div>

        {/* Top-Right Add City Button Inside Map Image */}
        <div style={{ position: 'absolute', top: '1.2rem', right: '1.4rem', zIndex: 10 }}>
          <button
            className="btn-primary-gradient"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.3rem',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-blue)',
            }}
          >
            <Plus size={18} />
            <span>เพิ่มเมือง</span>
          </button>
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
