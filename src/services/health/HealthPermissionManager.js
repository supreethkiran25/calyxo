/**
 * Calyxo Universal Health Data Integration - Permission Manager
 * Platform Support: Apple Health (iOS) & Android Health Connect (Android)
 */

import { PWAPedometerService } from './PWAPedometerService';

export const REQUIRED_PERMISSIONS = [
  'steps',
  'distance',
  'active_calories',
  'exercise_sessions'
];

export const OPTIONAL_PERMISSIONS = [
  'heart_rate',
  'sleep',
  'weight',
  'body_fat',
  'resting_heart_rate',
  'vo2_max',
  'blood_pressure'
];

const PERMISSION_STORAGE_KEY = 'calyxo_health_permissions';

export class HealthPermissionManager {
  /**
   * Detect current operating system platform
   */
  static getPlatform() {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'ios_apple_health';
    }
    if (/Android/.test(ua)) {
      return 'android_health_connect';
    }
    return 'web_health_api';
  }

  /**
   * Get current granted permissions state
   */
  static getGrantedPermissions() {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(PERMISSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Request Health permissions (Apple Health or Android Health Connect)
   */
  static async requestPermissions(customOptions = {}) {
    const platform = this.getPlatform();
    const currentGranted = this.getGrantedPermissions();

    const requestPayload = {
      required: REQUIRED_PERMISSIONS,
      optional: customOptions.includeOptional ? OPTIONAL_PERMISSIONS : ['heart_rate', 'sleep', 'weight', 'resting_heart_rate']
    };

    let grantedResults = { ...currentGranted };

    // Trigger PWA Accelerometer Motion Sensor Tracking
    await PWAPedometerService.requestAndStartTracking();

    try {
      if (platform === 'ios_apple_health') {
        // Call the REAL native CalyxoHealthKit Capacitor plugin
        try {
          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            const { CalyxoHealthKit } = Capacitor.Plugins;
            if (CalyxoHealthKit) {
              const result = await CalyxoHealthKit.requestAuthorization();
              console.log('[HealthKit] Native authorization result:', result);
              if (result && result.authorized !== false) {
                [...REQUIRED_PERMISSIONS, ...requestPayload.optional].forEach(perm => {
                  grantedResults[perm] = true;
                });
                localStorage.setItem('calyxo_health_connected_platform', platform);
                localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
              }
            } else {
              console.warn('[HealthKit] CalyxoHealthKit plugin not registered. HealthKit will not work.');
            }
          } else {
            // Web fallback — no real HealthKit available
            console.log('[HealthKit] Running on web, using PWA sensor fallback only.');
          }
        } catch (nativeErr) {
          console.error('[HealthKit] Native authorization failed:', nativeErr);
        }
      } else if (platform === 'android_health_connect') {
        // Android Health Connect Web Intent Bridge
        if (window.AndroidHealthConnect?.requestPermissions) {
          const res = await window.AndroidHealthConnect.requestPermissions(JSON.stringify(requestPayload));
          grantedResults = { ...grantedResults, ...(typeof res === 'string' ? JSON.parse(res) : res) };
        } else {
          console.log('[HealthConnect] AndroidHealthConnect bridge not available.');
        }
      } else {
        // Web Health API — PWA sensor tracking only, no fake permissions
        console.log('[Health] Web platform, using PWA pedometer only.');
      }
    } catch (err) {
      console.warn("Health permission request failure:", err);
    }

    // Save granted state locally
    try {
      localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(grantedResults));
      localStorage.setItem('calyxo_health_connected_platform', platform);
      localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
    } catch (e) {}

    return {
      platform,
      granted: grantedResults,
      hasRequired: REQUIRED_PERMISSIONS.every(p => grantedResults[p])
    };
  }

  /**
   * Check if Health platform is currently connected and authorized by user
   */
  static isConnected() {
    if (typeof window === 'undefined') return false;
    const connectedAt = localStorage.getItem('calyxo_health_connected_at');
    if (!connectedAt) return false;
    const permissions = this.getGrantedPermissions();
    return REQUIRED_PERMISSIONS.some(p => permissions[p] === true);
  }

  static getSyncDetails() {
    if (typeof window === 'undefined') return null;
    const connectedAt = localStorage.getItem('calyxo_health_connected_at');
    const lastSync = localStorage.getItem('calyxo_health_last_sync') || connectedAt;
    const recordsCount = localStorage.getItem('calyxo_health_records_count') || '0';
    if (!connectedAt) return null;

    return {
      connectedAt: Number(connectedAt),
      lastSync: Number(lastSync || Date.now()),
      recordsCount
    };
  }

  /**
   * Disconnect Health platform and clear permissions
   */
  static disconnect() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(PERMISSION_STORAGE_KEY);
      localStorage.removeItem('calyxo_health_connected_platform');
      localStorage.removeItem('calyxo_health_connected_at');
      localStorage.removeItem('calyxo_health_last_sync');
    } catch (e) {}
  }
}
