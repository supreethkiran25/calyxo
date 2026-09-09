/**
 * Calyxo Universal Health Data Integration - Auto-Sync Engine
 * Manages periodic sync, app opening sync, and humanized "Last synced X ago"
 *
 * Implements deterministic sync state machine:
 * 'checking' | 'reading' | 'syncing' | 'synced' | 'sync_failed' | 'permission_denied' | 'idle'
 */

import { HealthDataService } from './HealthDataService.js';
import { HealthPermissionManager } from './HealthPermissionManager.js';
import { supabase } from '../../lib/supabaseClient.js';

export class HealthSyncEngine {
  static listeners = new Set();
  static isSyncing = false;
  static lastSyncTime = null;
  static currentStatus = 'idle';

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
   * Emit real-time live heart rate and resting HR directly to active dashboard components
   */
  static emitLiveHeartRate(hrData) {
    if (!hrData || !hrData.heartRateBpm) return;
    this.notifyListeners({
      type: 'live_heart_rate',
      heartRateBpm: hrData.heartRateBpm,
      heartRateSource: hrData.heartRateSource || hrData.source || 'Watch Sync',
      restingHeartRateBpm: hrData.restingHeartRateBpm || 0,
      restingHeartRateSource: hrData.restingHeartRateSource || hrData.restingSource || '',
      heartRateTimestamp: hrData.heartRateTimestamp || hrData.timestamp || Date.now(),
      isLive: true
    });
  }

  /**
   * Initialize native HealthKit live observer queries (Garmin, Whoop, boAt, Apple Health)
   */
  static initLiveNativeListeners() {
    if (typeof window === 'undefined') return;
    try {
      import('@capacitor/core').then(({ Capacitor }) => {
        if (Capacitor.isNativePlatform()) {
          const { CalyxoHealthKit } = Capacitor.Plugins;
          if (CalyxoHealthKit) {
            CalyxoHealthKit.addListener('onHeartRateLiveUpdate', (data) => {
              console.log('[CALYXO-HEALTH] Live HealthKit HR event received:', data);
              HealthSyncEngine.emitLiveHeartRate(data);
            });
            CalyxoHealthKit.startHeartRateObserver().catch(() => {});
          }
        }
      });
    } catch (e) {}
  }

  /**
   * Execute immediate health sync
   */
  static async triggerSync() {
    if (this.isSyncing) return null;
    this.isSyncing = true;
    this.currentStatus = 'syncing';
    this.notifyListeners({ status: 'syncing' });

    try {
      const authState = await HealthPermissionManager.getAuthorizationState();
      if (authState.status === 'DENIED') {
        this.currentStatus = 'permission_denied';
        this.notifyListeners({ status: 'permission_denied', error: 'Permission denied in system settings.' });
        return null;
      }

      this.notifyListeners({ status: 'reading' });
      const metrics = await HealthDataService.fetchTodayMetrics();
      const workouts = await HealthDataService.fetchRecentWorkouts();
      this.lastSyncTime = Date.now();
      this.currentStatus = 'synced';

      const syncResult = {
        status: 'synced',
        lastSyncTimestamp: this.lastSyncTime,
        metrics,
        workouts,
        formattedLastSync: 'Just now'
      };

      this.notifyListeners(syncResult);
      return syncResult;
    } catch (err) {
      console.warn("[HealthSyncEngine] sync error:", err);
      this.currentStatus = 'sync_failed';
      this.notifyListeners({ status: 'sync_failed', error: err.message });
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Verified Reconnect & Backend Sync State Machine
   */
  static async reconnectAndSync(userId = null) {
    if (this.isSyncing) return { success: false, status: 'already_syncing' };
    this.isSyncing = true;

    try {
      // 1. Checking Health Access
      this.notifyListeners({ status: 'checking', message: 'Checking Health Access...' });
      const authState = await HealthPermissionManager.getAuthorizationState();

      if (authState.status === 'DENIED') {
        this.notifyListeners({ status: 'permission_denied', message: 'Permission Denied' });
        return { success: false, status: 'permission_denied' };
      }

      if (authState.status === 'NOT_DETERMINED') {
        const reqResult = await HealthPermissionManager.requestPermissions({ includeOptional: true });
        if (reqResult.status !== 'AUTHORIZED' && !reqResult.authorized) {
          this.notifyListeners({ status: 'permission_denied', message: 'Permission Required' });
          return { success: false, status: 'permission_denied' };
        }
      }

      // 2. Reading Health Data
      this.notifyListeners({ status: 'reading', message: 'Reading Health Data...' });
      const metrics = await HealthDataService.fetchTodayMetrics();
      const workouts = await HealthDataService.fetchRecentWorkouts();

      // 3. Backend Synchronization to Supabase (if authenticated)
      if (userId && supabase) {
        this.notifyListeners({ status: 'syncing', message: 'Syncing to Calyxo Cloud...' });
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          const snapshotPayload = {
            id: userId,
            data: {
              todayMetrics: metrics,
              workouts,
              lastSyncedAt: new Date().toISOString(),
              syncSource: authState.platform
            },
            updated_at: new Date().toISOString()
          };

          const { error: upsertError, status } = await supabase
            .from('users_ecosystem')
            .upsert(snapshotPayload, { onConflict: 'id' });

          if (upsertError || (status && (status < 200 || status >= 300))) {
            console.error('[HealthSync] Supabase sync error:', upsertError || status);
            this.notifyListeners({ status: 'sync_failed', message: 'Sync Failed' });
            return { success: false, status: 'sync_failed' };
          }
        }
      }

      // 4. Successful Synced state
      this.lastSyncTime = Date.now();
      this.notifyListeners({
        status: 'synced',
        message: 'Synced',
        metrics,
        workouts,
        lastSyncTimestamp: this.lastSyncTime
      });

      return { success: true, status: 'synced', metrics, workouts };
    } catch (err) {
      console.error('[HealthSync] Reconnect sync exception:', err);
      this.notifyListeners({ status: 'sync_failed', message: 'Sync Failed', error: err.message });
      return { success: false, status: 'sync_failed' };
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

    window.addEventListener('focus', () => {
      this.triggerSync();
    });

    const timer = setInterval(() => {
      if (HealthPermissionManager.isConnected()) {
        this.triggerSync();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }
}

export default HealthSyncEngine;
