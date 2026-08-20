/**
 * Calyxo Universal Health Data Integration - Data Service
 * Reads and normalizes activity from Apple Health / Android Health Connect
 * NO FAKE/RANDOM DATA. Real metrics or 0/"No data available".
 */

import { Capacitor } from '@capacitor/core';
import { HealthPermissionManager } from './HealthPermissionManager';
import { HealthCache } from './HealthCache';
import { PWAPedometerService } from './PWAPedometerService';
import { syncWidgetData } from '../widgetDataService';

export class HealthDataService {
  /**
   * Fetch today's current health metrics snapshot from native OS or PWA sensor
   */
  static async fetchTodayMetrics() {
    const isConn = HealthPermissionManager.isConnected();
    const platform = HealthPermissionManager.getPlatform();
    const pwaSteps = PWAPedometerService.getTodaySteps();

    // Default clean initial metric state (0s when no data, never fake randoms)
    let metrics = {
      steps: pwaSteps || 0,
      stepGoal: 10000,
      distanceKm: pwaSteps > 0 ? Number((pwaSteps * 0.00075).toFixed(2)) : 0.0,
      activeCalories: pwaSteps > 0 ? Math.round(pwaSteps * 0.042) : 0,
      calorieGoal: 500,
      activeMinutes: pwaSteps > 0 ? Math.round(pwaSteps / 110) : 0,
      activeMinutesGoal: 60,
      heartRateBpm: 0,
      restingHeartRateBpm: 0,
      sleepHours: 0.0,
      sleepQualityPct: 0,
      weightKg: 0.0,
      bodyFatPct: 0.0,
      vo2Max: 0.0,
      recoveryScore: 0,
      lastSyncTimestamp: Date.now()
    };

    try {
      if (platform === 'ios_apple_health' && Capacitor.isNativePlatform()) {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit) {
          const hkData = await CalyxoHealthKit.queryTodayMetrics();
          console.log('[CALYXO-HEALTH] Native HealthKit data received:', hkData);
          if (hkData) {
            metrics.steps = hkData.steps || metrics.steps;
            metrics.distanceKm = hkData.distanceKm || (metrics.steps > 0 ? Number((metrics.steps * 0.00075).toFixed(2)) : 0.0);
            metrics.activeCalories = hkData.activeCalories || (metrics.steps > 0 ? Math.round(metrics.steps * 0.042) : 0);
            metrics.heartRateBpm = hkData.heartRateBpm || 0;
            metrics.restingHeartRateBpm = hkData.restingHeartRateBpm || 0;
            metrics.weightKg = hkData.weightKg || 0.0;
            metrics.bodyFatPct = hkData.bodyFatPct || 0.0;
            metrics.vo2Max = hkData.vo2Max || 0.0;
            metrics.lastSyncTimestamp = Date.now();
          }
        }
      } else if (platform === 'android_health_connect' && window.AndroidHealthConnect?.getTodaySummary) {
        const res = await window.AndroidHealthConnect.getTodaySummary();
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        if (parsed) {
          metrics = { ...metrics, ...parsed, lastSyncTimestamp: Date.now() };
        }
      }

      HealthCache.saveMetrics(metrics);

      // Automatically sync real state to iOS & Android native widgets
      await syncWidgetData({
        calories: metrics.activeCalories,
        calorieGoal: metrics.calorieGoal,
        steps: metrics.steps
      });
    } catch (err) {
      console.warn('[CALYXO-HEALTH] HealthDataService fetch error:', err);
    }

    return metrics;
  }

  /**
   * Fetch automatically detected device workout sessions (Real HealthKit data)
   */
  static async fetchRecentWorkouts() {
    const platform = HealthPermissionManager.getPlatform();

    if (platform === 'ios_apple_health' && Capacitor.isNativePlatform()) {
      try {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit) {
          const res = await CalyxoHealthKit.queryRecentWorkouts();
          if (res && Array.isArray(res.workouts) && res.workouts.length > 0) {
            console.log(`[CALYXO-HEALTH] Loaded ${res.workouts.length} real workouts from Apple Health`);
            HealthCache.saveWorkouts(res.workouts);
            return res.workouts;
          }
        }
      } catch (err) {
        console.warn('[CALYXO-HEALTH] Failed to query native workouts:', err);
      }
    }

    const cachedWorkouts = HealthCache.getWorkouts();
    return cachedWorkouts || [];
  }

  /**
   * Fetch multi-timeframe analytics based on real cached historical logs
   */
  static async fetchTrends(timeframe = '7d') {
    const cached = HealthCache.getTrends();
    if (cached && cached[timeframe]) {
      return cached[timeframe];
    }

    const daysCount = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    const labels = [];
    const stepsData = [];
    const caloriesData = [];
    const durationData = [];
    const weightData = [];

    const now = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const label = timeframe === '7d'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : timeframe === '30d'
        ? `${d.getMonth() + 1}/${d.getDate()}`
        : d.toLocaleDateString('en-US', { month: 'short' });

      labels.push(label);
      // Zero initialized for days without recorded workouts
      stepsData.push(0);
      caloriesData.push(0);
      durationData.push(0);
      weightData.push(0);
    }

    const trendsObj = {
      labels,
      steps: stepsData,
      calories: caloriesData,
      duration: durationData,
      weight: weightData
    };

    return trendsObj;
  }
}

export default HealthDataService;
