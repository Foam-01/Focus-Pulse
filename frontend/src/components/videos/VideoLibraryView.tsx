'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { VideoItem } from '../../types';
import { ApiService } from '../../services/api';
import { VideoModal } from './VideoModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { Play, Star, Upload, Check, Trash2, Pencil, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const VideoLibraryView: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Delete Confirm Modal State
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('ผ่อนคลายทั่วไป');
  const [uploadDesc, setUploadDesc] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Edit Modal State
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editSrc, setEditSrc] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const loadVideos = async () => {
    const list = await ApiService.getVideos();
    setVideos(list);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Reset page if video list count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [videos.length]);

  // Pagination Calculations
  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVideos = useMemo(() => {
    return videos.slice(startIndex, endIndex);
  }, [videos, startIndex, endIndex]);

  // Helper for generating page numbers with dots (matching screenshot)
  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const handleSetPrimary = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    await ApiService.setPrimaryVideo(videoId);
    await loadVideos();
  };

  const handleOpenEdit = (e: React.MouseEvent, video: VideoItem) => {
    e.stopPropagation();
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditCategory(video.category);
    setEditDesc(video.description);
    setEditSrc(video.src);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editTitle) return;

    setIsEditing(true);
    try {
      await ApiService.updateVideo(editingVideo.id, {
        title: editTitle,
        category: editCategory,
        description: editDesc,
        src: editSrc,
      });
      setEditingVideo(null);
      await loadVideos();
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditing(false);
    }
  };

  const handlePromptDeleteVideo = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    setDeletingVideoId(videoId);
  };

  const handleConfirmDeleteVideo = async () => {
    if (deletingVideoId) {
      await ApiService.deleteVideo(deletingVideoId);
      setDeletingVideoId(null);
      await loadVideos();
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    setIsUploading(true);
    try {
      if (uploadFile) {
        await ApiService.uploadVideo(uploadFile, uploadTitle, uploadCategory, uploadDesc);
      } else {
        await ApiService.uploadVideo(
          new File([''], 'vdo.mp4'),
          uploadTitle,
          uploadCategory,
          uploadDesc,
        );
      }
      await loadVideos();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadFile(null);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header Bar */}
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
            <Sparkles size={14} /> คลังวิดีโอพักสายตา
          </div>
          <h2 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            คลังวิดีโอผ่อนคลาย
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            เล่นวิดีโอหลักให้อัตโนมัติเมื่อหมดเวลาโฟกัส
          </p>
        </div>

        <button
          className="btn-primary-gradient"
          onClick={() => setShowUploadModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem', borderRadius: '14px', fontWeight: 700 }}
        >
          <Upload size={18} />
          <span>เพิ่มวิดีโอ</span>
        </button>
      </div>

      {/* Video Cards Grid */}
      <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {paginatedVideos.map((video) => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => setSelectedVideo(video)}
            style={{
              background: 'var(--bg-card)',
              border: video.isPrimary ? '2px solid #3b82f6' : '1px solid var(--border-card)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: video.isPrimary ? '0 8px 25px rgba(37, 99, 235, 0.25)' : 'var(--shadow-sm)',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div>
              {/* Thumbnail Header */}
              <div className="video-thumbnail-wrapper" style={{ position: 'relative', width: '100%', height: '190px', background: '#000', overflow: 'hidden' }}>
                {video.src ? (
                  <video
                    src={`${video.src}#t=0.5`}
                    preload="metadata"
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                  />
                ) : (
                  <img src={video.poster} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div className="video-play-overlay">
                  <div className="play-circle-icon">
                    <Play size={24} fill="#ffffff" />
                  </div>
                </div>

                {video.isPrimary && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.7rem',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      zIndex: 3,
                    }}
                  >
                    <Star size={13} fill="#ffffff" /> วิดีโอหลัก
                  </div>
                )}
              </div>

              {/* Video Information */}
              <div style={{ padding: '1.2rem 1.2rem 0.8rem 1.2rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--blue-sky)', fontWeight: 600, marginBottom: '0.3rem' }}>
                  {video.category} • {video.durationStr}
                </div>
                <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {video.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4, height: '2.8em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {video.description}
                </p>
              </div>
            </div>

            {/* Standardized Card Toolbar Action Buttons */}
            <div
              style={{
                padding: '0.8rem 1.2rem 1.2rem 1.2rem',
                borderTop: '1px solid var(--border-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.4rem',
              }}
            >
              {/* BUTTON 1: ตั้งเป็นวิดีโอหลัก */}
              {video.isPrimary ? (
                <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.12)', padding: '0.35rem 0.7rem', borderRadius: '10px' }}>
                  <Check size={14} /> วิดีโอหลัก
                </span>
              ) : (
                <button
                  onClick={(e) => handleSetPrimary(e, video.id)}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--blue-sky)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                    padding: '0.35rem 0.7rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.2s ease',
                  }}
                  title="เลือกวิดีโอนี้เป็นวิดีโอหลัก"
                >
                  <Star size={13} /> เลือกเป็นวิดีโอหลัก
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {/* BUTTON 2: แก้ไข */}
                <button
                  onClick={(e) => handleOpenEdit(e, video)}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-main)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s ease',
                  }}
                  title="แก้ไขข้อมูลวิดีโอ"
                >
                  <Pencil size={13} /> แก้ไข
                </button>

                {/* BUTTON 3: ลบ */}
                <button
                  onClick={(e) => handlePromptDeleteVideo(e, video.id)}
                  style={{
                    fontSize: '0.78rem',
                    color: '#f43f5e',
                    background: 'rgba(225, 29, 72, 0.08)',
                    border: '1px solid rgba(225, 29, 72, 0.2)',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s ease',
                  }}
                  title="ลบวิดีโอนี้ออกจากคลัง"
                >
                  <Trash2 size={13} /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Pills Control Bar (Matching Screenshot) */}
      {videos.length > 0 && (
        <div
          className="glass-card"
          style={{
            marginTop: '1.8rem',
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
              แสดง {startIndex + 1}-{Math.min(endIndex, videos.length)} จากทั้งหมด {videos.length} วิดีโอ (หน้า {currentPage}/{totalPages})
            </span>
          </div>

          {/* Pills Button Controls (Right Side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {/* Previous Arrow Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
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
                  <span key={`dots-${idx}`} style={{ fontSize: '0.88rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                    ...
                  </span>
                );
              }

              const isAct = currentPage === p;
              return (
                <button
                  key={`page-${p}`}
                  onClick={() => setCurrentPage(p as number)}
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

      {/* Play Video Modal */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />

      {/* Custom Confirmation Modal for Deleting Video */}
      <ConfirmModal
        isOpen={deletingVideoId !== null}
        title="ลบวิดีโอ"
        message="คุณต้องการลบวิดีโอนี้ใช่หรือไม่?"
        confirmText="ลบ"
        cancelText="ยกเลิก"
        isDanger={true}
        onConfirm={handleConfirmDeleteVideo}
        onCancel={() => setDeletingVideoId(null)}
      />

      {/* EDIT Video Modal Form */}
      {editingVideo && (
        <div className="modal-overlay" onClick={() => setEditingVideo(null)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '24px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                แก้ไขวิดีโอ
              </h3>
              <button onClick={() => setEditingVideo(null)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  ชื่อวิดีโอ *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  หมวดหมู่
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  ลิงก์วิดีโอ
                </label>
                <input
                  type="text"
                  value={editSrc}
                  onChange={(e) => setEditSrc(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  คำอธิบาย
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" className="action-btn-secondary" onClick={() => setEditingVideo(null)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary-gradient" disabled={isEditing} style={{ padding: '0.75rem 1.4rem', fontWeight: 700 }}>
                  {isEditing ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD Video Modal Form */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '24px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'Prompt, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                เพิ่มวิดีโอ
              </h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  ชื่อวิดีโอ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เสียงฝนตก, ดนตรีคาเฟ่"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  หมวดหมู่
                </label>
                <input
                  type="text"
                  placeholder="เช่น ธรรมชาติ, เสียงฝน, คาเฟ่"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  เลือกไฟล์วิดีโอ (.mp4, .webm)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  คำอธิบาย
                </label>
                <textarea
                  rows={3}
                  placeholder="อธิบายบรรยากาศของวิดีโอนี้..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-card)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" className="action-btn-secondary" onClick={() => setShowUploadModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary-gradient" disabled={isUploading} style={{ padding: '0.75rem 1.4rem', fontWeight: 700 }}>
                  {isUploading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
