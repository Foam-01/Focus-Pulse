'use client';

import React from 'react';
import { FocusSessionRecord } from '../../types';
import { Trash2 } from 'lucide-react';

interface HistoryTableProps {
  history: FocusSessionRecord[];
  onDelete: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onDelete }) => {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
        ยังไม่มีประวัติการบันทึกเวลาโฟกัส เริ่มต้นจับเวลาเพื่อสร้างบันทึกแรกของคุณ!
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
            <th>หมวดหมู่ / แท็ก</th>
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
                <button
                  className="action-btn-secondary"
                  onClick={() => onDelete(item.id)}
                  style={{ padding: '0.35rem 0.6rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                  title="ลบรายการนี้"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
