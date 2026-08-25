/**
 * Calyxo Centralized Notification Manager & Deduplication Gateway
 *
 * Enforces:
 * 1. Deterministic deduplication keys to prevent spam and colliding notifications.
 * 2. Automatic cancellation of obsolete notifications (e.g. canceling previous rest notification when starting a new set).
 * 3. Deep-link routing metadata.
 * 4. User category preferences.
 */

import { scheduleExactNotification, cancelNotification } from '../notificationService.js';

export const NOTIFICATION_CATEGORIES = {
  WORKOUT: 'WORKOUT',
  REST: 'REST',
  HYDRATION: 'HYDRATION',
  NUTRITION: 'NUTRITION',
  RECOVERY: 'RECOVERY',
  CHALLENGE: 'CHALLENGE',
  BRIEFING: 'BRIEFING',
  MARKETING: 'MARKETING',
  ENGAGEMENT: 'ENGAGEMENT',
  STREAK: 'STREAK',
  SYSTEM: 'SYSTEM'
};

export class CalyxoNotificationManager {
  constructor() {
    this.activeNotifications = new Map(); // dedupeKey -> notifId
    this.preferences = {
      [NOTIFICATION_CATEGORIES.WORKOUT]: true,
      [NOTIFICATION_CATEGORIES.REST]: true,
      [NOTIFICATION_CATEGORIES.HYDRATION]: true,
      [NOTIFICATION_CATEGORIES.NUTRITION]: true,
      [NOTIFICATION_CATEGORIES.RECOVERY]: true,
      [NOTIFICATION_CATEGORIES.CHALLENGE]: true,
      [NOTIFICATION_CATEGORIES.BRIEFING]: true,
      [NOTIFICATION_CATEGORIES.MARKETING]: true,
      [NOTIFICATION_CATEGORIES.ENGAGEMENT]: true,
      [NOTIFICATION_CATEGORIES.STREAK]: true,
      [NOTIFICATION_CATEGORIES.SYSTEM]: true
    };
    this.restorePreferences();
  }

  restorePreferences() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('calyxo_notif_prefs_v1');
        if (saved) this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      } catch (e) {}
    }
  }

  setCategoryPreference(category, isEnabled) {
    if (category in this.preferences) {
      this.preferences[category] = Boolean(isEnabled);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('calyxo_notif_prefs_v1', JSON.stringify(this.preferences));
        } catch (e) {}
      }
    }
  }

  isCategoryEnabled(category) {
    return this.preferences[category] !== false;
  }

  /**
   * Schedule a deduplicated notification
   */
  async scheduleNotification({
    category = NOTIFICATION_CATEGORIES.SYSTEM,
    entityId = 'generic',
    title,
    body,
    delaySeconds = 1,
    deepLink = '/user/dashboard',
    extraData = {}
  }) {
    if (!this.isCategoryEnabled(category)) {
      return { scheduled: false, reason: 'Category disabled in user preferences' };
    }

    const dedupeKey = `${category}.${entityId}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyUniqueKey = `${dedupeKey}_${todayStr}`;

    // Persistent deduplication check: if this notification was already dispatched today and delay <= 60s, suppress duplicates
    if (typeof localStorage !== 'undefined') {
      try {
        const sentLog = JSON.parse(localStorage.getItem('calyxo_sent_notif_log_v2') || '{}');
        if (sentLog[dailyUniqueKey] && delaySeconds <= 60) {
          console.log(`[CALYXO-PUSH] Suppressed duplicate notification for key=${dailyUniqueKey} (already sent today)`);
          return { scheduled: false, reason: 'Duplicate notification suppressed for today', dedupeKey };
        }
      } catch (e) {}
    }

    // Cancel existing pending notification for this dedupe key before scheduling a fresh one
    if (this.activeNotifications.has(dedupeKey)) {
      const prevId = this.activeNotifications.get(dedupeKey);
      await cancelNotification(prevId);
      this.activeNotifications.delete(dedupeKey);
    }

    const notifId = `calyxo.${category.toLowerCase()}.${entityId}`;
    this.activeNotifications.set(dedupeKey, notifId);

    // Record persistent delivery for today
    if (typeof localStorage !== 'undefined') {
      try {
        const sentLog = JSON.parse(localStorage.getItem('calyxo_sent_notif_log_v2') || '{}');
        sentLog[dailyUniqueKey] = Date.now();
        // Clean entries older than 3 days
        const cutoff = Date.now() - 3 * 86400000;
        for (const k in sentLog) {
          if (sentLog[k] < cutoff) delete sentLog[k];
        }
        localStorage.setItem('calyxo_sent_notif_log_v2', JSON.stringify(sentLog));
      } catch (e) {}
    }

    await scheduleExactNotification({
      id: notifId,
      title,
      body,
      delayMs: Math.max(500, delaySeconds * 1000),
      tag: `calyxo-${category.toLowerCase()}`,
      type: category,
      deepLink,
      ...extraData
    });

    return { scheduled: true, notifId, dedupeKey };
  }

  /**
   * Cancel pending notification by dedupe key or notification ID
   */
  async cancelNotificationByKey(category, entityId) {
    const dedupeKey = `${category}.${entityId}`;
    if (this.activeNotifications.has(dedupeKey)) {
      const notifId = this.activeNotifications.get(dedupeKey);
      await cancelNotification(notifId);
      this.activeNotifications.delete(dedupeKey);
      return true;
    }
    return false;
  }

  /**
   * Cancel all notifications for a specific category (e.g. clearing rest timers)
   */
  async cancelCategory(category) {
    const keys = Array.from(this.activeNotifications.keys()).filter((k) => k.startsWith(`${category}.`));
    for (const key of keys) {
      const notifId = this.activeNotifications.get(key);
      await cancelNotification(notifId);
      this.activeNotifications.delete(key);
    }
  }
}

export const notificationManager = new CalyxoNotificationManager();
export default notificationManager;
