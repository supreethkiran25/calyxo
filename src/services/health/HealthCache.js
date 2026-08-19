/**
 * Calyxo Universal Health Data Integration - Offline Cache Storage
 * LocalStorage & IndexedDB storage for offline availability & zero latency rendering
 */

const CACHE_KEY_METRICS = 'calyxo_health_cache_metrics';
const CACHE_KEY_WORKOUTS = 'calyxo_health_cache_workouts';
const CACHE_KEY_TRENDS = 'calyxo_health_cache_trends';

export class HealthCache {
  /**
   * Store metrics snapshot in offline cache
   */
  static saveMetrics(metrics) {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        timestamp: Date.now(),
        data: metrics
      };
      localStorage.setItem(CACHE_KEY_METRICS, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to write health metrics cache:", e);
    }
  }

  /**
   * Retrieve cached metrics snapshot
   */
  static getMetrics() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY_METRICS);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Store imported workouts list
   */
  static saveWorkouts(workouts) {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        timestamp: Date.now(),
        data: workouts
      };
      localStorage.setItem(CACHE_KEY_WORKOUTS, JSON.stringify(payload));
    } catch (e) {}
  }

  /**
   * Retrieve cached workouts list
   */
  static getWorkouts() {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CACHE_KEY_WORKOUTS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return parsed.data || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Store multi-timeframe trends (7d, 30d, 90d, 1y)
   */
  static saveTrends(trendsData) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CACHE_KEY_TRENDS, JSON.stringify({
        timestamp: Date.now(),
        data: trendsData
      }));
    } catch (e) {}
  }

  /**
   * Retrieve cached trends
   */
  static getTrends() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY_TRENDS);
      return raw ? JSON.parse(raw).data : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clear all cached health data
   */
  static clear() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CACHE_KEY_METRICS);
      localStorage.removeItem(CACHE_KEY_WORKOUTS);
      localStorage.removeItem(CACHE_KEY_TRENDS);
    } catch (e) {}
  }
}
