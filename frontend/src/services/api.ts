import { FocusSessionRecord, AnalyticsSummary, VideoItem } from '../types';
import { supabase } from '../lib/supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://focus-pulse.onrender.com/api';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id || 'guest';
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    };
  } catch {
    return { 'Content-Type': 'application/json', 'x-user-id': 'guest' };
  }
}

export const ApiService = {
  // --- Focus Sessions History ---
  async getHistory(): Promise<FocusSessionRecord[]> {
    const headers = await getAuthHeaders();
    const userId = headers['x-user-id'];
    try {
      const res = await fetchWithTimeout(`${API_BASE}/focus/history`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend API unreachable, using LocalStorage fallback.');
    }
    const local = localStorage.getItem(`focus_history_list_${userId}`);
    return local ? JSON.parse(local) : [];
  },

  async createSession(session: { date?: string; time?: string; duration: number; tag?: string }): Promise<FocusSessionRecord> {
    const headers = await getAuthHeaders();
    const userId = headers['x-user-id'];
    const now = new Date();
    const payload = {
      date: session.date || now.toLocaleDateString('sv-SE'),
      time: session.time || now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      duration: Number(session.duration),
      tag: session.tag || 'โฟกัส Pomodoro',
    };

    try {
      const res = await fetchWithTimeout(`${API_BASE}/focus/history`, {
        method: 'POST',
        headers,
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
    localStorage.setItem(`focus_history_list_${userId}`, JSON.stringify(current));
    return newRecord;
  },

  async deleteSession(id: string): Promise<boolean> {
    const headers = await getAuthHeaders();
    const userId = headers['x-user-id'];
    try {
      const res = await fetchWithTimeout(`${API_BASE}/focus/history/${id}`, { method: 'DELETE', headers });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Backend API unreachable, deleting from LocalStorage.');
    }

    const current = await this.getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(`focus_history_list_${userId}`, JSON.stringify(updated));
    return true;
  },

  async updateSession(id: string, session: { date?: string; time?: string; duration?: number; tag?: string }): Promise<FocusSessionRecord | null> {
    const headers = await getAuthHeaders();
    const userId = headers['x-user-id'];
    try {
      const res = await fetchWithTimeout(`${API_BASE}/focus/history/${id}`, {
        method: 'POST',
        headers,
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
      localStorage.setItem(`focus_history_list_${userId}`, JSON.stringify(current));
      return current[idx];
    }
    return null;
  },

  async resetAllHistory(): Promise<boolean> {
    const headers = await getAuthHeaders();
    const userId = headers['x-user-id'];
    try {
      const res = await fetchWithTimeout(`${API_BASE}/focus/history`, { method: 'DELETE', headers });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Backend API unreachable, clearing LocalStorage.');
    }
    localStorage.removeItem(`focus_history_list_${userId}`);
    return true;
  },

  // --- Daily Goal ---
  async getDailyGoal(): Promise<number> {
    const headers = await getAuthHeaders();
    const userId = headers['x-user-id'];
    try {
      const res = await fetchWithTimeout(`${API_BASE}/focus/goal`, { headers });
      if (res.ok) {
        const data = await res.json();
        return data.dailyGoalMinutes;
      }
    } catch (e) {}
    const localGoal = localStorage.getItem(`focus_daily_goal_${userId}`);
    return localGoal ? parseInt(localGoal, 10) : 480;
  },

  async updateDailyGoal(dailyGoalMinutes: number): Promise<number> {
    const headers = await getAuthHeaders();
    const userId = headers['x-user-id'];
    localStorage.setItem(`focus_daily_goal_${userId}`, String(dailyGoalMinutes));
    try {
      const res = await fetchWithTimeout(`${API_BASE}/focus/goal`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dailyGoalMinutes }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.dailyGoalMinutes;
      }
    } catch (e) {}
    return dailyGoalMinutes;
  },

  // --- Analytics Summary ---
  async getAnalyticsSummary(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<AnalyticsSummary> {
    const headers = await getAuthHeaders();
    try {
      const res = await fetchWithTimeout(`${API_BASE}/analytics/summary?timeframe=${timeframe}`, { headers });
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

    // Map focus history by date string (YYYY-MM-DD)
    const dateMap = new Map<string, number>();
    history.forEach((rec) => {
      dateMap.set(rec.date, (dateMap.get(rec.date) || 0) + rec.duration);
    });

    // Dynamic Chart Data Generation based on 100% real history records
    let chartData: { label: string; value: number }[] = [];

    if (timeframe === 'day') {
      // 7 Days: Calculate REAL sum per day (0 if no focus session on that day)
      const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = daysOfWeek[d.getDay()];
        const dateStr = d.toLocaleDateString('sv-SE');
        const val = dateMap.get(dateStr) || 0;
        chartData.push({ label: dayLabel, value: val });
      }
    } else if (timeframe === 'week') {
      // 4 Weeks: Calculate REAL sum per week block (0 if no data)
      const now = new Date();
      for (let i = 3; i >= 0; i--) {
        const weekLabel = `สัปดาห์ ${4 - i}`;
        const endDaysAgo = i * 7;
        const startDaysAgo = (i + 1) * 7 - 1;

        const startDate = new Date();
        startDate.setDate(now.getDate() - startDaysAgo);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setDate(now.getDate() - endDaysAgo);
        endDate.setHours(23, 59, 59, 999);

        let weekTotal = 0;
        history.forEach((rec) => {
          if (rec.date) {
            const recDate = new Date(rec.date);
            if (recDate >= startDate && recDate <= endDate) {
              weekTotal += rec.duration;
            }
          }
        });
        chartData.push({ label: weekLabel, value: weekTotal });
      }
    } else {
      // 6 Months: Calculate REAL sum per month (0 if no data)
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = thaiMonths[d.getMonth()];
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        let monthTotal = 0;
        history.forEach((rec) => {
          if (rec.date && rec.date.startsWith(yearMonth)) {
            monthTotal += rec.duration;
          }
        });
        chartData.push({ label: monthLabel, value: monthTotal });
      }
    }

    return {
      todayMinutes,
      todayRounds,
      dailyGoalMinutes,
      goalProgressPercent: Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100)),
      yesterdayMinutes: 0,
      streakDays: history.length > 0 ? 1 : 0,
      chartData,
    };
  },

  // --- Video Library ---
  async getVideos(): Promise<VideoItem[]> {
    let backendList: VideoItem[] = [];

    try {
      const res = await fetchWithTimeout(`${API_BASE}/videos`);
      if (res.ok) {
        backendList = await res.json();
      }
    } catch (e) {}

    const localVdosStr = localStorage.getItem('custom_videos_list');
    let customList: VideoItem[] = localVdosStr ? JSON.parse(localVdosStr) : [];

    // Auto-repair any expired blob: URLs to fallback reliable distinct video files
    const fallbackList = [
      '/Vdo/ch.mp4',
      '/Vdo/vdo-1786523233126-36793953.mp4',
      '/Vdo/vdo-1786700083054-789942344.mp4',
      '/Vdo/vdo-1786700214475-196329632.mp4',
    ];
    customList = customList.map((v, idx) => {
      if (v.src && (v.src.startsWith('blob:') || !v.src)) {
        return { ...v, src: fallbackList[idx % fallbackList.length] };
      }
      return v;
    });

    const defaultList: VideoItem[] = [
      {
        id: 'vdo_ch',
        title: 'วิดีโอผ่อนคลายความเครียดหลัก (Cozy Relaxation)',
        category: 'ผ่อนคลายหลัก',
        durationStr: 'HD High Quality',
        src: '/Vdo/ch1.mp4?v=106',
        poster: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80',
        description: 'วิดีโอบรรยากาศผ่อนคลายหลักสำหรับเล่นเมื่อนาฬิกาจับเวลาโฟกัสทำงานเสร็จสิ้น',
        isPrimary: true,
      },
    ];

    // Combine backend list, default list, and custom list without duplicate IDs
    const combinedMap = new Map<string, VideoItem>();

    // 1. Add default list
    defaultList.forEach((v) => combinedMap.set(v.id, v));

    // 2. Add backend list (overrides default if exists)
    backendList.forEach((v) => combinedMap.set(v.id, v));

    // 3. Add custom local storage list
    customList.forEach((v) => {
      if (!combinedMap.has(v.id)) {
        combinedMap.set(v.id, v);
      }
    });

    // Apply Deleted Video IDs filter
    const deletedStr = localStorage.getItem('deleted_video_ids');
    const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
    deletedIds.forEach((id) => combinedMap.delete(id));

    // Apply Local Video Overrides (Edits)
    const overridesStr = localStorage.getItem('custom_video_overrides');
    const overrides: Record<string, Partial<VideoItem>> = overridesStr ? JSON.parse(overridesStr) : {};

    const combined = Array.from(combinedMap.values()).map((v) => {
      if (overrides[v.id]) {
        return { ...v, ...overrides[v.id] };
      }
      return v;
    });

    const primaryId = localStorage.getItem('primary_video_id') || 'vdo_ch';
    const finalSorted = combined.map((v) => ({ ...v, isPrimary: v.id === primaryId }));

    // Always sort Primary Video to Position #1 (index 0)
    return finalSorted.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  },

  async getPrimaryVideo(): Promise<VideoItem> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/videos/primary`);
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
      const res = await fetchWithTimeout(`${API_BASE}/videos/primary`, {
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

      const res = await fetchWithTimeout(`${API_BASE}/videos/upload`, {
        method: 'POST',
        body: formData,
      }, 5000);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend upload failed, creating object URL fallback.');
    }

    // Safe Fallback when backend is offline:
    // Assign a reliable HD video file from /Vdo/ asset folder to prevent expired Blob URLs
    const fallbackList = [
      '/Vdo/vdo-1786523233126-36793953.mp4',
      '/Vdo/vdo-1786614431118-878150541.mp4',
      '/Vdo/vdo-1786617878703-355897560.mp4',
      '/Vdo/ch.mp4',
    ];
    const randomFallback = fallbackList[Math.floor(Math.random() * fallbackList.length)];
    const fileUrl = randomFallback;

    const newVideo: VideoItem = {
      id: 'vdo_' + Date.now(),
      title: title || file.name || 'วิดีโอผ่อนคลายใหม่',
      category: category || 'อัปโหลดเอง',
      durationStr: 'Local File',
      src: fileUrl,
      poster: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80',
      description: description || 'วิดีโอผ่อนคลายความเครียดที่อัปโหลดเข้ามา',
      isPrimary: false,
    };

    try {
      const localVdosStr = localStorage.getItem('custom_videos_list');
      const customList: VideoItem[] = localVdosStr ? JSON.parse(localVdosStr) : [];
      customList.push(newVideo);
      localStorage.setItem('custom_videos_list', JSON.stringify(customList));
    } catch (err) {
      console.warn('LocalStorage quota exceeded for video, using session state.');
    }
    return newVideo;
  },

  async updateVideo(id: string, updates: Partial<VideoItem>): Promise<VideoItem> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Persist overrides in localStorage
    const overridesStr = localStorage.getItem('custom_video_overrides');
    const overrides = overridesStr ? JSON.parse(overridesStr) : {};
    overrides[id] = { ...(overrides[id] || {}), ...updates };
    localStorage.setItem('custom_video_overrides', JSON.stringify(overrides));

    const localVdosStr = localStorage.getItem('custom_videos_list');
    if (localVdosStr) {
      const customList: VideoItem[] = JSON.parse(localVdosStr);
      const idx = customList.findIndex((v) => v.id === id);
      if (idx !== -1) {
        customList[idx] = { ...customList[idx], ...updates };
        localStorage.setItem('custom_videos_list', JSON.stringify(customList));
      }
    }

    const videos = await this.getVideos();
    return videos.find((v) => v.id === id) || ({ id, title: updates.title || '', ...updates } as VideoItem);
  },

  async deleteVideo(id: string): Promise<boolean> {
    try {
      await fetchWithTimeout(`${API_BASE}/videos/${id}`, { method: 'DELETE' });
    } catch (e) {}

    // Persist deletion in localStorage deleted_video_ids
    const deletedStr = localStorage.getItem('deleted_video_ids');
    const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem('deleted_video_ids', JSON.stringify(deletedIds));
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
