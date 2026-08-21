/**
 * Calyxo Universal Health Data Integration - Auto-Sync Engine
 * Manages periodic sync, app opening sync, and humanized "Last synced X ago"
 */

import { HealthDataService } from './HealthDataService.js';
import { HealthPermissionManager } from './HealthPermissionManager.js';

export class HealthSyncEngine {
  static listeners = new Set();
  static isSyncing = false;
  static lastSyncTime = Date.now();

  /**
   * Register listener for live sync updates
   */
  static subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static notifyListeners(data) {
    this.listeners.forEach(cb => {
      try { cb(data); } catch (e) {}
    });
  }

  /**
   * Execute immediate health sync
   */
  static async triggerSync() {
    if (this.isSyncing) return null;
    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing' });

    try {
      const metrics = await HealthDataService.fetchTodayMetrics();
      const workouts = await HealthDataService.fetchRecentWorkouts();
      this.lastSyncTime = Date.now();

      const syncResult = {
        status: 'idle',
        lastSyncTimestamp: this.lastSyncTime,
        metrics,
        workouts,
        formattedLastSync: 'Just now'
      };

      this.notifyListeners(syncResult);
      return syncResult;
    } catch (err) {
      console.warn("HealthSyncEngine sync error:", err);
      this.notifyListeners({ status: 'error', error: err.message });
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Format human readable last sync time ("2 minutes ago", "Just now")
   */
  static formatLastSyncTime(timestamp = this.lastSyncTime) {
    if (!timestamp) return 'Never synced';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);

    if (diffSec < 45) return 'Just now';
    if (diffSec < 90) return '1 minute ago';
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    return 'Yesterday';
  }

  /**
   * Start auto-sync interval on app focus / background timer
   */
  static startAutoSync(intervalMs = 60000) {
    if (typeof window === 'undefined') return;

    // Sync on page load / tab focus
    window.addEventListener('focus', () => {
      this.triggerSync();
    });

    // Periodic interval
    const timer = setInterval(() => {
      if (HealthPermissionManager.isConnected()) {
        this.triggerSync();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }
}
