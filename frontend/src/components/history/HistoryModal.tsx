'use client';

import React, { useState, useEffect } from 'react';
import { FocusSessionRecord } from '../../types';
import { ApiService } from '../../services/api';
import { HistoryTable } from './HistoryTable';
import { ConfirmModal } from '../common/ConfirmModal';
import { X, Plus, RotateCcw } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<FocusSessionRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Confirm Modal States
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Form states
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('sv-SE'));
  const [time, setTime] = useState<string>('12:00');
  const [duration, setDuration] = useState<number>(25);
  const [tag, setTag] = useState<string>('โฟกัสทั่วไป');

  const loadHistory = async () => {
    const data = await ApiService.getHistory();
    setHistory(data);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createSession({ date, time, duration, tag });
    setShowAddForm(false);
    loadHistory();
  };

  const handlePromptDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await ApiService.deleteSession(deletingId);
      setDeletingId(null);
      loadHistory();
    }
  };

  const handleConfirmResetAll = async () => {
    await ApiService.resetAllHistory();
    setShowResetConfirm(false);
    loadHistory();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ประวัติและบันทึกเวลาโฟกัส
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              รายการเซสชันการทำงานย้อนหลังทั้งหมด
            </p>
          </div>

          <button className="action-btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem' }}>
          <button
            className="btn-primary-gradient"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem', fontWeight: 700 }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} />
            <span>เพิ่มบันทึกย้อนหลัง</span>
          </button>

          {history.length > 0 && (
            <button
              className="action-btn-secondary"
              onClick={() => setShowResetConfirm(true)}
              style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)', fontWeight: 600 }}
            >
              <RotateCcw size={16} />
              <span>ล้างประวัติทั้งหมด</span>
            </button>
          )}
        </div>

        {/* Manual Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddManual}
            style={{
              background: 'var(--bg-subtle)',
              padding: '1.2rem',
              borderRadius: '16px',
              marginBottom: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              border: '1px solid var(--border-card)',
            }}
          >
            <h4 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
              เพิ่มบันทึกโฟกัสด้วยตนเอง
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 700 }}>วันที่</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 700 }}>เวลา</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 700 }}>ระยะเวลา (นาที)</label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 700 }}>หมวดหมู่ / แท็ก</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-card)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-gradient"
              style={{ marginTop: '0.5rem', padding: '0.65rem', fontWeight: 700 }}
            >
              บันทึกข้อมูล
            </button>
          </form>
        )}

        {/* History Table */}
        <HistoryTable history={history} onDelete={handlePromptDelete} />

        {/* Single Item Delete Confirm Modal */}
        <ConfirmModal
          isOpen={deletingId !== null}
          title="ยืนยันการลบรายการประวัติ"
          message="คุณต้องการลบรายการบันทึกเวลาโฟกัสนี้ใช่หรือไม่?"
          confirmText="ยืนยันการลบ"
          cancelText="ยกเลิก"
          isDanger={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingId(null)}
        />

        {/* Reset All History Confirm Modal */}
        <ConfirmModal
          isOpen={showResetConfirm}
          title="ยืนยันล้างประวัติทั้งหมด"
          message="คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติการจับเวลาโฟกัสทั้งหมด? ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้"
          confirmText="ล้างประวัติทั้งหมด"
          cancelText="ยกเลิก"
          isDanger={true}
          onConfirm={handleConfirmResetAll}
          onCancel={() => setShowResetConfirm(false)}
        />
      </div>
    </div>
  );
};
