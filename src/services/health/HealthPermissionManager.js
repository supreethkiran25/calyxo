/**
 * Calyxo Universal Health Data Integration - Permission Manager
 * Platform Support: Apple Health (iOS) & Android Health Connect (Android)
 */

import { PWAPedometerService } from './PWAPedometerService.js';

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
    try {
      if (window.Capacitor && typeof window.Capacitor.getPlatform === 'function') {
        const plat = window.Capacitor.getPlatform();
        if (plat === 'ios') return 'ios_apple_health';
        if (plat === 'android') return 'android_health_connect';
      }
    } catch (e) {}
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
              if (result && result.authorized) {
                [...REQUIRED_PERMISSIONS, ...requestPayload.optional].forEach(perm => {
                  grantedResults[perm] = true;
                });
                localStorage.setItem('calyxo_health_connected_platform', platform);
                localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
                if (typeof CalyxoHealthKit.activateHealthKitSource === 'function') {
                  CalyxoHealthKit.activateHealthKitSource().catch(() => {});
                }
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
        try {
          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            const { CalyxoHealthPlugin } = Capacitor.Plugins;
            if (CalyxoHealthPlugin) {
              const result = await CalyxoHealthPlugin.requestPermissions();
              console.log('[AndroidHealth] Native sensor authorization result:', result);
              if (result && result.granted) {
                [...REQUIRED_PERMISSIONS, ...requestPayload.optional].forEach(perm => {
                  grantedResults[perm] = true;
                });
                localStorage.setItem('calyxo_health_connected_platform', platform);
                localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
              }
            }
          } else if (window.AndroidHealthConnect?.requestPermissions) {
            const res = await window.AndroidHealthConnect.requestPermissions(JSON.stringify(requestPayload));
            grantedResults = { ...grantedResults, ...(typeof res === 'string' ? JSON.parse(res) : res) };
          }
        } catch (androidErr) {
          console.warn('[AndroidHealth] Android authorization exception:', androidErr);
        }
      } else {
        // Web Health API — PWA sensor tracking only, no fake permissions
        console.log('[Health] Web platform, using PWA pedometer only.');
      }
    } catch (err) {
      console.warn("Health permission request failure:", err);
    }

    // Save granted state locally only if permissions actually granted
    try {
      localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(grantedResults));
      const hasAnyGranted = REQUIRED_PERMISSIONS.some(p => grantedResults[p] === true);
      if (hasAnyGranted) {
        localStorage.setItem('calyxo_health_connected_platform', platform);
        localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
      } else {
        localStorage.removeItem('calyxo_health_connected_platform');
        localStorage.removeItem('calyxo_health_connected_at');
      }
    } catch (e) {}

    const isAuthorized = REQUIRED_PERMISSIONS.some(p => grantedResults[p] === true);

    return {
      platform,
      granted: grantedResults,
      hasRequired: isAuthorized,
      isConnected: isAuthorized
    };
  }

  /**
   * Real-time query to check if user has active permissions in native Apple Health or Android Health Connect
   */
  static async checkLiveAuthorization() {
    const platform = this.getPlatform();
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform() && platform === 'ios_apple_health') {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit) {
          // If already connected locally, verify plugin availability
          if (this.isConnected()) {
            return true;
          }
          // Test live metrics query to verify active read access
          if (typeof CalyxoHealthKit.queryTodayMetrics === 'function') {
            const metrics = await CalyxoHealthKit.queryTodayMetrics().catch(() => null);
            if (metrics && typeof metrics === 'object') {
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Live authorization check note:', e);
    }
    return this.isConnected();
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
   * Open native iOS Settings for Calyxo Health permissions
   */
  static async openSettings() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit && typeof CalyxoHealthKit.openSettings === 'function') {
          return await CalyxoHealthKit.openSettings();
        }
      }
    } catch (e) {
      console.warn('Open settings error:', e);
    }
  }

  /**
   * Directly open Apple Health / iOS Settings to toggle permissions ON
   */
  static async openHealthSettings() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit) {
          if (typeof CalyxoHealthKit.openHealthSettings === 'function') {
            return await CalyxoHealthKit.openHealthSettings();
          }
          if (typeof CalyxoHealthKit.openSettings === 'function') {
            return await CalyxoHealthKit.openSettings();
          }
        }
      }
    } catch (e) {
      console.warn('Open health settings error:', e);
    }
  }

  /**
   * Request native Motion & Fitness sensor access (CMPedometer)
   */
  static async requestMotionPermission() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit && typeof CalyxoHealthKit.requestMotionPermission === 'function') {
          return await CalyxoHealthKit.requestMotionPermission();
        }
      }
    } catch (e) {
      console.warn('Motion permission note:', e);
    }
  }

  /**
   * Request native App Tracking Transparency (ATT) authorization
   */
  static async requestTrackingPermission() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit && typeof CalyxoHealthKit.requestTrackingPermission === 'function') {
          return await CalyxoHealthKit.requestTrackingPermission();
        }
      }
    } catch (e) {
      console.warn('Tracking permission note:', e);
    }
  }

  /**
   * Open native iOS Bluetooth settings to pair heart rate straps
   */
  static async openBluetoothSettings() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit && typeof CalyxoHealthKit.openBluetoothSettings === 'function') {
          return await CalyxoHealthKit.openBluetoothSettings();
        }
      }
    } catch (e) {
      console.warn('Open Bluetooth settings error:', e);
    }
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
