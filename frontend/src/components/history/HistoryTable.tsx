'use client';

import React from 'react';
import { FocusSessionRecord } from '../../types';
import { Trash2, Pencil } from 'lucide-react';

interface HistoryTableProps {
  history: FocusSessionRecord[];
  onDelete: (id: string) => void;
  onEdit?: (record: FocusSessionRecord) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onDelete, onEdit }) => {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
        ยังไม่มีประวัติการจับเวลา
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>ระยะเวลา</th>
            <th>ประเภทงาน</th>
            <th style={{ textAlign: 'right' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>
                <span style={{ fontWeight: 600, color: 'var(--blue-sky)' }}>
                  {item.duration} นาที
                </span>
              </td>
              <td>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    fontSize: '0.8rem',
                  }}
                >
                  {item.tag}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  {onEdit && (
                    <button
                      className="action-btn-secondary"
                      onClick={() => onEdit(item)}
                      style={{ padding: '0.35rem 0.6rem', color: 'var(--blue-sky)', borderColor: 'var(--border-card)' }}
                      title="แก้ไขรายการนี้"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  <button
                    className="action-btn-secondary"
                    onClick={() => onDelete(item.id)}
                    style={{ padding: '0.35rem 0.6rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                    title="ลบรายการนี้"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
