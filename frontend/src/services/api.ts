import { FocusSessionRecord, AnalyticsSummary, VideoItem } from '../types';

const API_BASE = '/api';

export const ApiService = {
  // --- Focus Sessions History ---
  async getHistory(): Promise<FocusSessionRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/focus/history`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend API unreachable, using LocalStorage fallback.');
    }
    const local = localStorage.getItem('focus_history_list');
    return local ? JSON.parse(local) : [];
  },

  async createSession(session: { date?: string; time?: string; duration: number; tag?: string }): Promise<FocusSessionRecord> {
    const now = new Date();
    const payload = {
      date: session.date || now.toLocaleDateString('sv-SE'),
      time: session.time || now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      duration: Number(session.duration),
      tag: session.tag || 'โฟกัส Pomodoro',
    };

    try {
      const res = await fetch(`${API_BASE}/focus/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend API unreachable, saving to LocalStorage.');
    }

    const newRecord: FocusSessionRecord = {
      id: 'local_' + Date.now(),
      date: payload.date,
      time: payload.time,
      duration: payload.duration,
      tag: payload.tag,
    };

    const current = await this.getHistory();
    current.unshift(newRecord);
    localStorage.setItem('focus_history_list', JSON.stringify(current));
    return newRecord;
  },

  async deleteSession(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/focus/history/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Backend API unreachable, deleting from LocalStorage.');
    }

    const current = await this.getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem('focus_history_list', JSON.stringify(updated));
    return true;
  },

  async updateSession(id: string, session: { date?: string; time?: string; duration?: number; tag?: string }): Promise<FocusSessionRecord | null> {
    try {
      const res = await fetch(`${API_BASE}/focus/history/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend API unreachable, updating in LocalStorage.');
    }

    const current = await this.getHistory();
    const idx = current.findIndex((item) => item.id === id);
    if (idx !== -1) {
      current[idx] = {
        ...current[idx],
        ...(session.date && { date: session.date }),
        ...(session.time && { time: session.time }),
        ...(session.duration !== undefined && { duration: Number(session.duration) }),
        ...(session.tag && { tag: session.tag }),
      };
      localStorage.setItem('focus_history_list', JSON.stringify(current));
      return current[idx];
    }
    return null;
  },

  async resetAllHistory(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/focus/history`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Backend API unreachable, clearing LocalStorage.');
    }
    localStorage.removeItem('focus_history_list');
    return true;
  },

  // --- Daily Goal ---
  async getDailyGoal(): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/focus/goal`);
      if (res.ok) {
        const data = await res.json();
        return data.dailyGoalMinutes;
      }
    } catch (e) {}
    const localGoal = localStorage.getItem('focus_daily_goal');
    return localGoal ? parseInt(localGoal, 10) : 480;
  },

  async updateDailyGoal(dailyGoalMinutes: number): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/focus/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyGoalMinutes }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.dailyGoalMinutes;
      }
    } catch (e) {}
    localStorage.setItem('focus_daily_goal', String(dailyGoalMinutes));
    return dailyGoalMinutes;
  },

  // --- Analytics Summary ---
  async getAnalyticsSummary(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<AnalyticsSummary> {
    try {
      const res = await fetch(`${API_BASE}/analytics/summary?timeframe=${timeframe}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Fallback Client-side Calculation
    const history = await this.getHistory();
    const dailyGoalMinutes = await this.getDailyGoal();
    const todayStr = new Date().toLocaleDateString('sv-SE');

    let todayMinutes = 0;
    let todayRounds = 0;

    history.forEach((rec) => {
      if (rec.date === todayStr) {
        todayMinutes += rec.duration;
        todayRounds += 1;
      }
    });

    return {
      todayMinutes,
      todayRounds,
      dailyGoalMinutes,
      goalProgressPercent: Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100)),
      yesterdayMinutes: 0,
      streakDays: history.length > 0 ? 1 : 0,
      chartData: [
        { label: 'จ.', value: todayMinutes > 0 ? todayMinutes : 25 },
        { label: 'อ.', value: 50 },
        { label: 'พ.', value: 75 },
        { label: 'พฤ.', value: 100 },
        { label: 'ศ.', value: 125 },
        { label: 'ส.', value: 60 },
        { label: 'อา.', value: 90 },
      ],
    };
  },

  // --- Video Library ---
  async getVideos(): Promise<VideoItem[]> {
    let list: VideoItem[] = [];

    try {
      const res = await fetch(`${API_BASE}/videos`);
      if (res.ok) {
        const data: VideoItem[] = await res.json();
        const primaryId = localStorage.getItem('primary_video_id');
        if (primaryId && data.length > 0) {
          list = data.map((v) => ({ ...v, isPrimary: v.id === primaryId }));
        } else {
          list = data;
        }
      }
    } catch (e) {}

    if (list.length === 0) {
      const localVdosStr = localStorage.getItem('custom_videos_list');
      const customList: VideoItem[] = localVdosStr ? JSON.parse(localVdosStr) : [];
      const defaultList: VideoItem[] = [
        {
          id: 'vdo_ch',
          title: 'วิดีโอผ่อนคลายความเครียดหลัก (Cozy Relaxation)',
          category: 'ผ่อนคลายหลัก',
          durationStr: 'HD High Quality',
          src: '/Vdo/ch.mp4',
          poster: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80',
          description: 'วิดีโอบรรยากาศผ่อนคลายหลักสำหรับเล่นเมื่อนาฬิกาจับเวลาโฟกัสทำงานเสร็จสิ้น',
          isPrimary: true,
        },
      ];

      const combined = [...defaultList, ...customList];
      const primaryId = localStorage.getItem('primary_video_id') || 'vdo_ch';
      list = combined.map((v) => ({ ...v, isPrimary: v.id === primaryId }));
    }

    // Always sort Primary Video to Position #1 (index 0)
    return list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  },

  async getPrimaryVideo(): Promise<VideoItem> {
    try {
      const res = await fetch(`${API_BASE}/videos/primary`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    const videos = await this.getVideos();
    const primary = videos.find((v) => v.isPrimary);
    return primary || videos[0];
  },

  async setPrimaryVideo(id: string): Promise<VideoItem> {
    try {
      const res = await fetch(`${API_BASE}/videos/primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem('primary_video_id', id);
        return updated;
      }
    } catch (e) {}

    localStorage.setItem('primary_video_id', id);
    const videos = await this.getVideos();
    const found = videos.find((v) => v.id === id);
    return found ? { ...found, isPrimary: true } : videos[0];
  },

  async uploadVideo(file: File, title: string, category?: string, description?: string): Promise<VideoItem> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (category) formData.append('category', category);
      if (description) formData.append('description', description);

      const res = await fetch(`${API_BASE}/videos/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend upload failed, creating object URL fallback.');
    }

    // Fallback using Object URL
    const fileUrl = URL.createObjectURL(file);
    const newVideo: VideoItem = {
      id: 'vdo_' + Date.now(),
      title: title || file.name,
      category: category || 'อัปโหลดเอง',
      durationStr: 'Local File',
      src: fileUrl,
      poster: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80',
      description: description || 'วิดีโอผ่อนคลายความเครียดที่อัปโหลดเข้ามา',
      isPrimary: false,
    };

    const localVdosStr = localStorage.getItem('custom_videos_list');
    const customList: VideoItem[] = localVdosStr ? JSON.parse(localVdosStr) : [];
    customList.push(newVideo);
    localStorage.setItem('custom_videos_list', JSON.stringify(customList));
    return newVideo;
  },

  async updateVideo(id: string, updates: Partial<VideoItem>): Promise<VideoItem> {
    try {
      const res = await fetch(`${API_BASE}/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend update video failed, updating LocalStorage.');
    }

    const localVdosStr = localStorage.getItem('custom_videos_list');
    if (localVdosStr) {
      const customList: VideoItem[] = JSON.parse(localVdosStr);
      const idx = customList.findIndex((v) => v.id === id);
      if (idx !== -1) {
        customList[idx] = { ...customList[idx], ...updates };
        localStorage.setItem('custom_videos_list', JSON.stringify(customList));
        return customList[idx];
      }
    }
    const videos = await this.getVideos();
    return videos.find((v) => v.id === id) || videos[0];
  },

  async deleteVideo(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/videos/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Backend delete video failed, updating LocalStorage.');
    }

    const localVdosStr = localStorage.getItem('custom_videos_list');
    if (localVdosStr) {
      const customList: VideoItem[] = JSON.parse(localVdosStr);
      const updated = customList.filter((v) => v.id !== id);
      localStorage.setItem('custom_videos_list', JSON.stringify(updated));
    }
    return true;
  },
};
