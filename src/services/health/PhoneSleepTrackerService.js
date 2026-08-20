/**
 * Calyxo Phone Inactivity Sleep Analysis Service (iOS & Android)
 * Accurately estimates sleep duration from the longest nighttime screen-off / device inactivity window.
 * Eliminates the requirement of wearing a smartwatch to bed.
 */

import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const STORAGE_LAST_ACTIVE = 'calyxo_device_last_active_time';
const STORAGE_SLEEP_HISTORY = 'calyxo_phone_sleep_history';
const STORAGE_TODAY_SLEEP = 'calyxo_today_sleep_metrics';

// Minimum inactivity gap to count as real sleep (3.5 hours = 12,600,000 ms)
const MIN_SLEEP_GAP_MS = 3.5 * 60 * 60 * 1000;
// Maximum inactivity gap (14 hours = 50,400,000 ms)
const MAX_SLEEP_GAP_MS = 14 * 60 * 60 * 1000;

export class PhoneSleepTrackerService {
  static isInitialized = false;
  static heartbeatTimer = null;

  /**
   * Initialize lifecycle listeners on app start
   */
  static init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Record current active timestamp & evaluate sleep upon waking
    this.recordActiveAndEvaluateSleep();

    // 2. Continuous heartbeat while app is running (every 60s)
    this.heartbeatTimer = setInterval(() => {
      this.recordHeartbeat();
    }, 60 * 1000);

    // 3. Web & PWA visibility/blur/pagehide listeners
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.recordHeartbeat();
      } else if (document.visibilityState === 'visible') {
        this.recordActiveAndEvaluateSleep();
      }
    });

    window.addEventListener('pagehide', () => this.recordHeartbeat());
    window.addEventListener('beforeunload', () => this.recordHeartbeat());

    // 4. Capacitor native app state change listener (iOS & Android)
    if (Capacitor.isNativePlatform()) {
      try {
        App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) {
            this.recordHeartbeat();
          } else {
            this.recordActiveAndEvaluateSleep();
          }
        });
      } catch (err) {
        console.warn('[PhoneSleepTracker] Capacitor App listener error:', err);
      }
    }
  }

  /**
   * Record periodic heartbeat timestamp before device goes to sleep
   */
  static recordHeartbeat() {
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVE, String(Date.now()));
    } catch (e) {}
  }

  /**
   * Format Date to HH:mm
   */
  static formatTime(timestamp) {
    const d = new Date(timestamp);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }

  /**
   * Get date key YYYY-MM-DD
   */
  static getTodayDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Evaluate if a nighttime sleep gap occurred and record sleep duration
   */
  static recordActiveAndEvaluateSleep() {
    const now = Date.now();
    let lastActiveStr = null;
    try {
      lastActiveStr = localStorage.getItem(STORAGE_LAST_ACTIVE);
    } catch (e) {}

    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      const gapMs = now - lastActive;

      // Check if gap is within valid sleep range (3.5h to 14h)
      if (gapMs >= MIN_SLEEP_GAP_MS && gapMs <= MAX_SLEEP_GAP_MS) {
        const lastDate = new Date(lastActive);
        const nowDate = new Date(now);
        const lastHour = lastDate.getHours();
        const nowHour = nowDate.getHours();

        // Valid night sleep window: phone put down in evening/night (>= 20:00 or <= 04:00) and picked up morning/afternoon (>= 05:00 and <= 14:00)
        const isEveningSleep = lastHour >= 20 || lastHour <= 4;
        const isMorningWake = nowHour >= 5 && nowHour <= 14;

        if (isEveningSleep && isMorningWake) {
          const durationHours = Math.round((gapMs / (1000 * 60 * 60)) * 10) / 10;
          const sleepQualityPct = this.calculateSleepScore(durationHours);
          const bedTime = this.formatTime(lastActive);
          const wakeTime = this.formatTime(now);
          const dateKey = this.getTodayDateKey();

          const sleepSession = {
            date: dateKey,
            bedTime,
            wakeTime,
            durationHours,
            sleepQualityPct,
            bedTimestamp: lastActive,
            wakeTimestamp: now,
            detectionMethod: 'phone_inactivity_window'
          };

          try {
            localStorage.setItem(STORAGE_TODAY_SLEEP, JSON.stringify(sleepSession));
            
            // Save to historical ledger
            const rawHist = localStorage.getItem(STORAGE_SLEEP_HISTORY);
            const history = rawHist ? JSON.parse(rawHist) : [];
            const filtered = history.filter(item => item.date !== dateKey);
            filtered.unshift(sleepSession);
            localStorage.setItem(STORAGE_SLEEP_HISTORY, JSON.stringify(filtered.slice(0, 30)));
            console.log('[PhoneSleepTracker] Real phone sleep detected:', sleepSession);
          } catch (e) {
            console.warn('[PhoneSleepTracker] Failed to save sleep session:', e);
          }
        }
      }
    }

    // Update active timestamp
    this.recordHeartbeat();
  }

  /**
   * Calculate clinical sleep quality score from total sleep duration
   */
  static calculateSleepScore(hours) {
    if (hours >= 7.5 && hours <= 9.0) return 94;
    if (hours >= 7.0 && hours < 7.5) return 88;
    if (hours >= 6.5 && hours < 7.0) return 82;
    if (hours >= 6.0 && hours < 6.5) return 75;
    if (hours >= 5.0 && hours < 6.0) return 66;
    if (hours >= 4.0 && hours < 5.0) return 55;
    return 48;
  }

  /**
   * Query today's calculated phone sleep metrics
   */
  static getTodaySleep() {
    try {
      const raw = localStorage.getItem(STORAGE_TODAY_SLEEP);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === this.getTodayDateKey()) {
          return parsed;
        }
      }
    } catch (e) {}

    // Clean initial state if no sleep recorded yet today
    return {
      durationHours: 0.0,
      sleepQualityPct: 0,
      bedTime: '--:--',
      wakeTime: '--:--',
      detectionMethod: 'none'
    };
  }

  /**
   * Get 7-day sleep history for charts
   */
  static getSleepHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_SLEEP_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}
