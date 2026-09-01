/**
 * Calyxo Universal Health Data Integration - Permission Manager
 * Platform Support: Apple Health (iOS) & Android Health Connect (Android)
 *
 * Enforces native iOS HealthKit as the absolute source of truth.
 * Canonical states: NOT_AVAILABLE | NOT_DETERMINED | DENIED | AUTHORIZED
 */

import { PWAPedometerService } from './PWAPedometerService.js';

export const HEALTH_CANONICAL_STATE = {
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  NOT_DETERMINED: 'NOT_DETERMINED',
  DENIED: 'DENIED',
  AUTHORIZED: 'AUTHORIZED'
};

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
    if (typeof window === 'undefined' && typeof localStorage === 'undefined') return {};
    const storage = typeof localStorage !== 'undefined' ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    try {
      const stored = storage?.getItem(PERMISSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Query native authoritative HealthKit status directly without relying on local cache
   */
  static async getAuthorizationState() {
    const platform = this.getPlatform();
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform() && platform === 'ios_apple_health') {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit && typeof CalyxoHealthKit.checkAuthorizationStatus === 'function') {
          const statusResult = await CalyxoHealthKit.checkAuthorizationStatus().catch(() => null);
          if (statusResult) {
            let canonical = HEALTH_CANONICAL_STATE.NOT_DETERMINED;
            if (statusResult.available === false || statusResult.status === 'NOT_AVAILABLE' || statusResult.status === 'unavailable') {
              canonical = HEALTH_CANONICAL_STATE.NOT_AVAILABLE;
            } else if (statusResult.status === 'AUTHORIZED' || statusResult.statusString === 'authorized' || statusResult.authorized === true) {
              canonical = HEALTH_CANONICAL_STATE.AUTHORIZED;
            } else if (statusResult.status === 'DENIED' || statusResult.statusString === 'denied') {
              canonical = HEALTH_CANONICAL_STATE.DENIED;
            } else {
              canonical = HEALTH_CANONICAL_STATE.NOT_DETERMINED;
            }

            if (canonical !== HEALTH_CANONICAL_STATE.AUTHORIZED) {
              this.disconnect();
            }

            return {
              platform,
              status: canonical,
              authorized: canonical === HEALTH_CANONICAL_STATE.AUTHORIZED,
              available: canonical !== HEALTH_CANONICAL_STATE.NOT_AVAILABLE
            };
          }
        }
      } else if (Capacitor.isNativePlatform() && platform === 'android_health_connect') {
        const { CalyxoHealthPlugin } = Capacitor.Plugins;
        if (CalyxoHealthPlugin && typeof CalyxoHealthPlugin.checkPermissions === 'function') {
          const statusResult = await CalyxoHealthPlugin.checkPermissions().catch(() => null);
          const isGranted = statusResult && statusResult.health === 'granted';
          const canonical = isGranted ? HEALTH_CANONICAL_STATE.AUTHORIZED : HEALTH_CANONICAL_STATE.NOT_DETERMINED;
          if (!isGranted) this.disconnect();
          return {
            platform,
            status: canonical,
            authorized: isGranted,
            available: true
          };
        }
      }
    } catch (e) {
      console.warn('[Health] Failed to query native authorization state:', e);
    }

    const isConn = this.isConnected();
    return {
      platform,
      status: isConn ? HEALTH_CANONICAL_STATE.AUTHORIZED : HEALTH_CANONICAL_STATE.NOT_DETERMINED,
      authorized: isConn,
      available: true
    };
  }

  /**
   * Request Health permissions (Apple Health or Android Health Connect)
   */
  static async requestPermissions(customOptions = {}) {
    const platform = this.getPlatform();
    const requestPayload = {
      required: REQUIRED_PERMISSIONS,
      optional: customOptions.includeOptional ? OPTIONAL_PERMISSIONS : ['heart_rate', 'sleep', 'weight', 'resting_heart_rate']
    };

    let grantedResults = {};
    let canonicalStatus = HEALTH_CANONICAL_STATE.NOT_DETERMINED;
    let isAuthorized = false;

    // Trigger PWA Accelerometer Motion Sensor Tracking
    await PWAPedometerService.requestAndStartTracking();

    try {
      if (platform === 'ios_apple_health') {
        try {
          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            const { CalyxoHealthKit } = Capacitor.Plugins;
            if (CalyxoHealthKit) {
              const result = await CalyxoHealthKit.requestAuthorization();
              console.log('[HealthKit] Native authorization response:', result);
              
              if (result && (result.status === 'AUTHORIZED' || result.authorized === true)) {
                canonicalStatus = HEALTH_CANONICAL_STATE.AUTHORIZED;
                isAuthorized = true;
                [...REQUIRED_PERMISSIONS, ...requestPayload.optional].forEach(perm => {
                  grantedResults[perm] = true;
                });
                localStorage.setItem('calyxo_health_connected_platform', platform);
                localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
                if (typeof CalyxoHealthKit.activateHealthKitSource === 'function') {
                  CalyxoHealthKit.activateHealthKitSource().catch(() => {});
                }
              } else if (result && (result.status === 'DENIED' || result.statusString === 'denied')) {
                canonicalStatus = HEALTH_CANONICAL_STATE.DENIED;
                isAuthorized = false;
                this.disconnect();
              } else if (result && (result.status === 'NOT_AVAILABLE' || result.available === false)) {
                canonicalStatus = HEALTH_CANONICAL_STATE.NOT_AVAILABLE;
                isAuthorized = false;
                this.disconnect();
              } else {
                canonicalStatus = HEALTH_CANONICAL_STATE.NOT_DETERMINED;
                isAuthorized = false;
                this.disconnect();
              }
            } else {
              console.warn('[HealthKit] CalyxoHealthKit plugin not registered.');
              this.disconnect();
            }
          } else {
            console.log('[HealthKit] Running in web environment.');
          }
        } catch (nativeErr) {
          console.error('[HealthKit] Native authorization failed:', nativeErr);
          canonicalStatus = HEALTH_CANONICAL_STATE.DENIED;
          this.disconnect();
        }
      } else if (platform === 'android_health_connect') {
        try {
          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            const { CalyxoHealthPlugin } = Capacitor.Plugins;
            if (CalyxoHealthPlugin) {
              const result = await CalyxoHealthPlugin.requestPermissions();
              if (result && result.granted) {
                canonicalStatus = HEALTH_CANONICAL_STATE.AUTHORIZED;
                isAuthorized = true;
                [...REQUIRED_PERMISSIONS, ...requestPayload.optional].forEach(perm => {
                  grantedResults[perm] = true;
                });
                localStorage.setItem('calyxo_health_connected_platform', platform);
                localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
              } else {
                canonicalStatus = HEALTH_CANONICAL_STATE.DENIED;
                this.disconnect();
              }
            }
          } else if (window.AndroidHealthConnect?.requestPermissions) {
            const res = await window.AndroidHealthConnect.requestPermissions(JSON.stringify(requestPayload));
            grantedResults = { ...(typeof res === 'string' ? JSON.parse(res) : res) };
            isAuthorized = REQUIRED_PERMISSIONS.some(p => grantedResults[p] === true);
            canonicalStatus = isAuthorized ? HEALTH_CANONICAL_STATE.AUTHORIZED : HEALTH_CANONICAL_STATE.DENIED;
            if (isAuthorized) {
              localStorage.setItem('calyxo_health_connected_platform', platform);
              localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
            } else {
              this.disconnect();
            }
          }
        } catch (androidErr) {
          console.warn('[AndroidHealth] Authorization exception:', androidErr);
          this.disconnect();
        }
      }
    } catch (err) {
      console.warn("Health permission request failure:", err);
      this.disconnect();
    }

    if (isAuthorized) {
      try {
        localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(grantedResults));
      } catch (e) {}
    }

    return {
      platform,
      status: canonicalStatus,
      granted: grantedResults,
      hasRequired: isAuthorized,
      isConnected: isAuthorized,
      authorized: isAuthorized
    };
  }

  /**
   * Real-time query to check if user has active permissions in native Apple Health or Android Health Connect
   */
  static async checkLiveAuthorization() {
    const authState = await this.getAuthorizationState();
    return authState.authorized === true;
  }

  /**
   * Get detailed canonical health connection status
   */
  static async getDetailedStatus() {
    return this.getAuthorizationState();
  }

  /**
   * Check if Health platform is currently connected and authorized by user
   */
  static isConnected() {
    if (typeof window === 'undefined' && typeof localStorage === 'undefined') return false;
    const storage = typeof localStorage !== 'undefined' ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    const connectedAt = storage?.getItem('calyxo_health_connected_at');
    if (!connectedAt) return false;
    const permissions = this.getGrantedPermissions();
    return REQUIRED_PERMISSIONS.some(p => permissions[p] === true);
  }

  static getSyncDetails() {
    if (typeof window === 'undefined' && typeof localStorage === 'undefined') return null;
    const storage = typeof localStorage !== 'undefined' ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    const connectedAt = storage?.getItem('calyxo_health_connected_at');
    const lastSync = storage?.getItem('calyxo_health_last_sync') || connectedAt;
    const recordsCount = storage?.getItem('calyxo_health_records_count') || '0';
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
    if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
    const storage = typeof localStorage !== 'undefined' ? localStorage : (typeof window !== 'undefined' ? window.localStorage : null);
    try {
      storage?.removeItem(PERMISSION_STORAGE_KEY);
      storage?.removeItem('calyxo_health_connected_platform');
      storage?.removeItem('calyxo_health_connected_at');
      storage?.removeItem('calyxo_health_last_sync');
      storage?.removeItem('calyxo_health_records_count');
    } catch (e) {}
  }
}

export default HealthPermissionManager;
