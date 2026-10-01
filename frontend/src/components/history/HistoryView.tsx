'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FocusSessionRecord } from '../../types';
import { ApiService } from '../../services/api';
import { ConfirmModal } from '../common/ConfirmModal';
import { getPaginationRange } from '../../utils/pagination';
import { PageHeader } from '../shared/PageHeader';
import { FilterBar, FilterBarButton } from '../shared/FilterBar';
import { History, Search, Plus, Trash2, Pencil, Calendar, Clock, Tag, Sparkles, Filter, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const HistoryView: React.FC = () => {
  // Server-paginated/filtered data: only the CURRENT page's rows are ever
  // downloaded (instead of the full history list), keeping displayed numbers
  // and behavior identical to the previous full-client-side-compute version.
  const [pageItems, setPageItems] = useState<FocusSessionRecord[]>([]);
  const [overallStats, setOverallStats] = useState<{ totalCount: number; totalMinutes: number; tagCounts: Record<string, number> }>({
    totalCount: 0,
    totalMinutes: 0,
    tagCounts: {},
  });
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FocusSessionRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);

  // Form states for Add / Edit
  const [formDuration, setFormDuration] = useState<number>(25);
  const [formTag, setFormTag] = useState<string>('โฟกัสงาน');
  const [formDate, setFormDate] = useState<string>(new Date().toLocaleDateString('sv-SE'));
  const [formTime, setFormTime] = useState<string>(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }));

  // Overall aggregate stats (totals/per-tag counts) are always computed over
  // the FULL unfiltered dataset server-side, independent of search/tag — this
  // matches the previous behavior where these numbers came from the full
  // in-memory historyList rather than the filtered view.
  const loadOverallStats = async () => {
    try {
      const data = await ApiService.getHistoryStats();
      setOverallStats(data);
    } catch (e) {
      console.error('Failed to load focus history stats', e);
    }
  };

  // Current page's rows plus the matching (filtered) total count, both fetched
  // server-side for the active search term / tag filter and page number.
  const loadPage = async () => {
    setLoading(true);
    try {
      const tagParam = selectedTag !== 'all' ? selectedTag : undefined;
      const searchParam = searchTerm ? searchTerm : undefined;
      const [items, filteredStats] = await Promise.all([
        ApiService.getHistory(currentPage, itemsPerPage, tagParam, searchParam),
        ApiService.getHistoryStats(tagParam, searchParam),
      ]);
      setPageItems(items);
      setFilteredCount(filteredStats.totalCount);
    } catch (e) {
      console.error('Failed to load focus history', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadOverallStats(), loadPage()]);
  };

  useEffect(() => {
    loadOverallStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag]);

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedTag]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = pageItems;

  // Helper for generating page numbers with dots (via shared util)
  // See: src/utils/pagination.ts

  // Overall Statistics Summary (derived from server-computed aggregate stats)
  const stats = useMemo(() => {
    const totalCount = overallStats.totalCount;
    const totalMinutes = overallStats.totalMinutes;
    const totalHours = (totalMinutes / 60).toFixed(1).replace('.0', '');
    const avgMinutes = totalCount > 0 ? Math.round(totalMinutes / totalCount) : 0;

    return { totalCount, totalMinutes, totalHours, avgMinutes };
  }, [overallStats]);

  // Tag options
  const tagOptions = ['โฟกัสงาน', 'อ่านหนังสือ', 'ออกกำลังกาย', 'อื่นๆ'];

  // Add Session Handler
  const handleOpenAdd = () => {
    setFormDuration(25);
    setFormTag('โฟกัสงาน');
    setFormDate(new Date().toLocaleDateString('sv-SE'));
    setFormTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createSession({
      duration: Number(formDuration),
      tag: formTag,
      date: formDate,
      time: formTime,
    });
    setShowAddModal(false);
    refreshAll();
  };

  // Edit Session Handler
  const handleOpenEdit = (record: FocusSessionRecord) => {
    setEditingRecord(record);
    setFormDuration(record.duration);
    setFormTag(record.tag);
    setFormDate(record.date);
    setFormTime(record.time);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      await ApiService.updateSession(editingRecord.id, {
        duration: Number(formDuration),
        tag: formTag,
        date: formDate,
        time: formTime,
      });
      setEditingRecord(null);
      refreshAll();
    }
  };

  // Delete Single Session Handler
  const handleConfirmDelete = async () => {
    if (deletingId) {
      await ApiService.deleteSession(deletingId);
      setDeletingId(null);
      refreshAll();
    }
  };

  // Clear All History Handler
  const handleConfirmClearAll = async () => {
    await ApiService.resetAllHistory();
    setShowClearAllConfirm(false);
    refreshAll();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      {/* Top Title & Header Actions Bar */}
      <PageHeader
        eyebrowIcon={<Sparkles size={14} />}
        eyebrowText="ประวัติการโฟกัสย้อนหลัง"
        title={`ประวัติการโฟกัส (${overallStats.totalCount} รายการ)`}
        description="ตรวจสอบ ค้นหา และจัดการประวัติการโฟกัสย้อนหลัง"
        actions={
          <>
            <button
              className="btn-primary-gradient"
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              <span>เพิ่มประวัติ</span>
            </button>

            {overallStats.totalCount > 0 && (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-card)',
                  color: '#f43f5e',
                  padding: '0.75rem 1.3rem',
                  borderRadius: '14px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-subtle)';
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                }}
              >
                <Trash2 size={16} />
                <span>ลบประวัติทั้งหมด</span>
              </button>
            )}
          </>
        }
      />

      {/* KPI Stats Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        <div className="glass-card" style={{ padding: '1.3rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
            รอบโฟกัสทั้งหมด
          </span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>
            {stats.totalCount.toLocaleString('th-TH')} <span style={{ fontSize: '0.9rem', color: 'var(--blue-sky)', fontWeight: 700 }}>รอบ</span>
          </strong>
        </div>

        <div className="glass-card" style={{ padding: '1.3rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
            เวลารวมสะสม
          </span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 800 }}>
            {stats.totalMinutes.toLocaleString('th-TH')} <span style={{ fontSize: '0.9rem', color: 'var(--blue-sky)', fontWeight: 700 }}>นาที ({stats.totalHours} ชม.)</span>
          </strong>
        </div>

        <div className="glass-card" style={{ padding: '1.3rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
            เฉลี่ยต่อรอบ
          </span>
          <strong style={{ fontSize: '1.6rem', color: '#34d399', fontWeight: 800 }}>
            {stats.avgMinutes.toLocaleString('th-TH')} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>นาที/รอบ</span>
          </strong>
        </div>
      </div>

      {/* Filter & Search Bar Toolbar */}
      <FilterBar>
        {/* Search Keyword Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
          <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <label htmlFor="history-search" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
            ค้นหาประวัติ
          </label>
          <input
            id="history-search"
            type="text"
            placeholder="ค้นหาตามวันที่ เวลา หรือหมวดหมู่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="app-input-inline"
            aria-label="ค้นหาประวัติตามวันที่ เวลา หรือหมวดหมู่"
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.6rem',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="ล้างการค้นหา"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category Tag Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={15} /> หมวดหมู่:
          </span>
          <FilterBarButton active={selectedTag === 'all'} onClick={() => setSelectedTag('all')}>
            ทั้งหมด ({overallStats.totalCount})
          </FilterBarButton>
          {tagOptions.map((tag) => {
            const count = overallStats.tagCounts[tag] || 0;
            const isSel = selectedTag === tag;
            return (
              <FilterBarButton key={tag} active={isSel} onClick={() => setSelectedTag(tag)}>
                {tag} ({count})
              </FilterBarButton>
            );
          })}
        </div>
      </FilterBar>

      {/* History Items List Section */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>กำลังโหลดประวัติ...</div>
      ) : filteredCount === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
          }}
        >
          <History size={48} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
            ไม่พบประวัติการโฟกัส
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            {searchTerm || selectedTag !== 'all'
              ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ใหม่'
              : 'เริ่มต้นจับเวลาโฟกัสเพื่อบันทึกประวัติการทำงานของคุณ'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {paginatedHistory.map((item) => (
            <div
              key={item.id}
              className="glass-card history-card-body"
              style={{
                padding: '1rem 1.4rem',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
              }}
            >
              {/* Left Info Column */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                {/* Category Icon Badge */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background:
                      item.tag === 'โฟกัสงาน'
                        ? 'rgba(59, 130, 246, 0.12)'
                        : item.tag === 'อ่านหนังสือ'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : item.tag === 'ออกกำลังกาย'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(99, 102, 241, 0.12)',
                    color:
                      item.tag === 'โฟกัสงาน'
                        ? '#60a5fa'
                        : item.tag === 'อ่านหนังสือ'
                        ? '#34d399'
                        : item.tag === 'ออกกำลังกาย'
                        ? '#fbbf24'
                        : '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <Tag size={20} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '8px',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-card)',
                      }}
                    >
                      {item.tag}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} aria-hidden="true" /> {item.date}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} aria-hidden="true" /> {item.time} น.
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Duration & Actions Column */}
              <div className="history-card-right">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                    {item.duration} นาที
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--blue-sky)', fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
                    ({(item.duration / 60).toFixed(1).replace('.0', '')} ชม.)
                  </span>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="icon-btn-action"
                    title="แก้ไขรายการ"
                    aria-label={`แก้ไขรายการ ${item.tag} วันที่ ${item.date}`}
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="icon-btn-danger"
                    title="ลบรายการนี้"
                    aria-label={`ลบรายการ ${item.tag} วันที่ ${item.date}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Pills Control Bar (Matching Screenshot) */}
          {totalPages > 1 && (
            <div
              className="glass-card"
              style={{
                marginTop: '1.2rem',
                padding: '1rem 1.6rem',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Page Indicator (Left Side) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.14)',
                    color: '#818cf8',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {currentPage}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  แสดง {startIndex + 1}-{Math.min(endIndex, filteredCount)} จากทั้งหมด {filteredCount} รายการ (หน้า {currentPage}/{totalPages})
                </span>
              </div>

              {/* Pills Button Controls (Right Side) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Previous Arrow Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="หน้าก่อนหน้า"
                  aria-disabled={currentPage === 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: currentPage === 1 ? 'var(--border-card)' : 'var(--text-main)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title="หน้าก่อนหน้า"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Number Pills */}
                {getPaginationRange(currentPage, totalPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '0 0.25rem' }} aria-hidden="true">
                        ...
                      </span>
                    );
                  }

                  const isAct = currentPage === p;
                  return (
                    <button
                      key={`page-${p}`}
                      onClick={() => setCurrentPage(p as number)}
                      aria-label={`หน้า ${p}`}
                      aria-current={isAct ? 'page' : undefined}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        fontSize: '0.88rem',
                        fontWeight: isAct ? 800 : 600,
                        background: isAct
                          ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
                          : 'var(--bg-subtle)',
                        color: isAct ? '#ffffff' : 'var(--text-main)',
                        border: isAct ? 'none' : '1px solid var(--border-card)',
                        boxShadow: isAct ? '0 4px 14px rgba(168, 85, 247, 0.4)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}

                {/* Next Arrow Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="หน้าถัดไป"
                  aria-disabled={currentPage === totalPages}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: currentPage === totalPages ? 'var(--border-card)' : 'var(--text-main)',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title="หน้าถัดไป"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD Session Record Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: '1.8rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h3 id="add-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={18} style={{ color: '#3b82f6' }} aria-hidden="true" /> เพิ่มประวัติโฟกัสใหม่
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                aria-label="ปิดหน้าต่างเพิ่มประวัติ"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="add-duration" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  ระยะเวลาโฟกัส (นาที):
                </label>
                <input
                  id="add-duration"
                  type="number"
                  min="1"
                  max="1440"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  required
                  autoFocus
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label htmlFor="add-tag" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  หมวดหมู่:
                </label>
                <select
                  id="add-tag"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                >
                  {tagOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="add-date" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    วันที่:
                  </label>
                  <input
                    id="add-date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="add-time" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    เวลา:
                  </label>
                  <input
                    id="add-time"
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700 }}>
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Session Record Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div
            className="modal-content-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: '1.8rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h3 id="edit-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Pencil size={18} style={{ color: '#3b82f6' }} aria-hidden="true" /> แก้ไขประวัติการโฟกัส
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                aria-label="ปิดหน้าต่างแก้ไขประวัติ"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="edit-duration" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  ระยะเวลาโฟกัส (นาที):
                </label>
                <input
                  id="edit-duration"
                  type="number"
                  min="1"
                  max="1440"
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  required
                  autoFocus
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label htmlFor="edit-tag" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  หมวดหมู่:
                </label>
                <select
                  id="edit-tag"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                >
                  {tagOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="edit-date" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    วันที่:
                  </label>
                  <input
                    id="edit-date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="edit-time" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    เวลา:
                  </label>
                  <input
                    id="edit-time"
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                <button type="button" onClick={() => setEditingRecord(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1px solid var(--border-card)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', fontWeight: 700 }}>
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Item Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบรายการ"
        message="คุณต้องการลบรายการนี้ใช่หรือไม่? ข้อมูลจะถูกลบถาวร"
        confirmText="ลบรายการ"
        cancelText="ยกเลิก"
        isDanger={true}
      />

      {/* Clear All History Confirm Modal */}
      <ConfirmModal
        isOpen={showClearAllConfirm}
        onCancel={() => setShowClearAllConfirm(false)}
        onConfirm={handleConfirmClearAll}
        title="ยืนยันลบประวัติทั้งหมด"
        message="คุณต้องการลบประวัติทั้งหมดใช่หรือไม่? ข้อมูลจะถูกลบถาวร"
        confirmText="ลบประวัติทั้งหมด"
        cancelText="ยกเลิก"
        isDanger={true}
      />
    </div>
  );
};
