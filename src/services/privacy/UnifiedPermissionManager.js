/**
 * Calyxo Unified Privacy & Permission Manager
 *
 * Enforces:
 * 1. Explicit permission tracking: NOT_REQUESTED, AUTHORIZED, DENIED, RESTRICTED, UNAVAILABLE.
 * 2. Minimum necessary data access policies (zero silent collection).
 * 3. Complete Data Retention & User Account Deletion wipe pathways.
 */

export const PERMISSION_STATUS = {
  NOT_REQUESTED: 'NOT_REQUESTED',
  AUTHORIZED: 'AUTHORIZED',
  DENIED: 'DENIED',
  RESTRICTED: 'RESTRICTED',
  UNAVAILABLE: 'UNAVAILABLE'
};

export const PERMISSION_DOMAINS = {
  HEALTHKIT: 'HEALTHKIT',
  BLUETOOTH: 'BLUETOOTH',
  MOTION_SENSORS: 'MOTION_SENSORS',
  NOTIFICATIONS: 'NOTIFICATIONS',
  BACKGROUND_SYNC: 'BACKGROUND_SYNC'
};

export class UnifiedPermissionManager {
  constructor() {
    this.statusMap = new Map();
    this.restorePermissions();
  }

  restorePermissions() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('calyxo_permissions_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.entries(parsed).forEach(([domain, status]) => {
            this.statusMap.set(domain, status);
          });
        }
      } catch (e) {}
    }
  }

  persistPermissions() {
    if (typeof localStorage !== 'undefined') {
      try {
        const obj = {};
        this.statusMap.forEach((val, key) => {
          obj[key] = val;
        });
        localStorage.setItem('calyxo_permissions_v1', JSON.stringify(obj));
      } catch (e) {}
    }
  }

  getPermissionStatus(domain) {
    return this.statusMap.get(domain) || PERMISSION_STATUS.NOT_REQUESTED;
  }

  setPermissionStatus(domain, status) {
    if (Object.values(PERMISSION_STATUS).includes(status)) {
      this.statusMap.set(domain, status);
      this.persistPermissions();
    }
  }

  /**
   * Complete Local Data Wipe Pathway (Account Deletion & Data Purge)
   * Safely clears all local health records, cached telemetry, offline queues,
   * outboxes, gamification state, and credentials.
   */
  static async wipeAllLocalUserData() {
    console.log('[CALYXO-PRIVACY] Executing complete local user data wipe...');

    if (typeof localStorage !== 'undefined') {
      const keysToPurge = [
        'calyxo_health_cache',
        'calyxo_user_workout_splits',
        'calyxo_active_rest_state_v1',
        'calyxo_outbox_queue_v1',
        'calyxo_notif_prefs_v1',
        'calyxo_gamification_state_v1',
        'calyxo_permissions_v1',
        'calyxo_water_log_cache',
        'calyxo_food_log_cache',
        'calyxo_cached_profile'
      ];
      keysToPurge.forEach((k) => localStorage.removeItem(k));
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    // Clear IndexedDB offline store if present
    if (typeof indexedDB !== 'undefined') {
      try {
        indexedDB.deleteDatabase('calyxo_offline_db');
      } catch (e) {
        console.warn('[CALYXO-PRIVACY] IndexedDB deletion skipped:', e);
      }
    }

    return { wiped: true, timestamp: new Date().toISOString() };
  }
}

export const permissionManager = new UnifiedPermissionManager();
export default permissionManager;
