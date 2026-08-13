'use client';

import React, { useState } from 'react';
import { X, Search, Globe, Plus } from 'lucide-react';
import { CityClockItem } from '../../types';

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: CityClockItem) => void;
  existingTimezones: string[];
}

const GLOBAL_CITIES_CATALOG: Omit<CityClockItem, 'id'>[] = [
  { cityName: 'ปารีส', countryName: 'ฝรั่งเศส (Paris, France)', timezone: 'Europe/Paris', flagEmoji: '🇫🇷' },
  { cityName: 'โซล', countryName: 'เกาหลีใต้ (Seoul, South Korea)', timezone: 'Asia/Seoul', flagEmoji: '🇰🇷' },
  { cityName: 'สิงคโปร์', countryName: 'สิงคโปร์ (Singapore)', timezone: 'Asia/Singapore', flagEmoji: '🇸🇬' },
  { cityName: 'ดูไบ', countryName: 'สหรัฐอาหรับเอมิเรตส์ (Dubai, UAE)', timezone: 'Asia/Dubai', flagEmoji: '🇦🇪' },
  { cityName: 'ลอสแอนเจลิส', countryName: 'สหรัฐอเมริกา (Los Angeles, USA)', timezone: 'America/Los_Angeles', flagEmoji: '🇺🇸' },
  { cityName: 'เบอร์ลิน', countryName: 'เยอรมนี (Berlin, Germany)', timezone: 'Europe/Berlin', flagEmoji: '🇩🇪' },
  { cityName: 'ปักกิ่ง', countryName: 'จีน (Beijing, China)', timezone: 'Asia/Shanghai', flagEmoji: '🇨🇳' },
  { cityName: 'โรม', countryName: 'อิตาลี (Rome, Italy)', timezone: 'Europe/Rome', flagEmoji: '🇮🇹' },
  { cityName: 'นิวเดลี', countryName: 'อินเดีย (New Delhi, India)', timezone: 'Asia/Kolkata', flagEmoji: '🇮🇳' },
  { cityName: 'โตรอนโต', countryName: 'แคนาดา (Toronto, Canada)', timezone: 'America/Toronto', flagEmoji: '🇨🇦' },
  { cityName: 'มอสโก', countryName: 'รัสเซีย (Moscow, Russia)', timezone: 'Europe/Moscow', flagEmoji: '🇷🇺' },
  { cityName: 'ฮ่องกง', countryName: 'จีน (Hong Kong)', timezone: 'Asia/Hong_Kong', flagEmoji: '🇭🇰' },
];

export const AddCityModal: React.FC<AddCityModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  existingTimezones,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCities = GLOBAL_CITIES_CATALOG.filter(
    (c) =>
      c.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.countryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-card)',
          padding: '2.2rem 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--blue-sky)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                ค้นหาและเพิ่มเมือง
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>เลือกเมืองสำคัญทั่วโลกเพื่อดูเวลาปัจจุบัน</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              borderRadius: '10px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ค้นหาชื่อเมือง หรือประเทศ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 2.8rem',
              borderRadius: '14px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              fontSize: '0.94rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Cities Catalog List */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filteredCities.map((item) => {
            const isAlreadyAdded = existingTimezones.includes(item.timezone);
            return (
              <div
                key={item.timezone}
                onClick={() => {
                  if (!isAlreadyAdded) {
                    onSelectCity({
                      id: `city-${Date.now()}-${Math.random()}`,
                      ...item,
                    });
                    onClose();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-card)',
                  cursor: isAlreadyAdded ? 'default' : 'pointer',
                  opacity: isAlreadyAdded ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.flagEmoji}</span>
                  <div>
                    <h4 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {item.cityName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.countryName}</span>
                  </div>
                </div>

                {isAlreadyAdded ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>เพิ่มแล้ว</span>
                ) : (
                  <button
                    style={{
                      background: 'var(--blue-light)',
                      color: 'var(--blue-sky)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.35rem 0.7rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> เพิ่ม
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
