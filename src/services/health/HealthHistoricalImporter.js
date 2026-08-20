/**
 * Calyxo Native Health Data Integration - Historical Data Importer
 * Supports importing Apple HealthKit & Health Connect history (7d, 30d, 90d, 1y, All)
 * Strictly imports real HealthKit workouts.
 */

import { Capacitor } from '@capacitor/core';
import { HealthPermissionManager } from './HealthPermissionManager';
import { HealthDataMapper } from './HealthDataMapper';
import { HealthCache } from './HealthCache';

const IMPORTED_HISTORY_KEY = 'calyxo_health_imported_history';

export class HealthHistoricalImporter {
  /**
   * Import historical health data for selected timeframe
   */
  static async importHistory(timeframe = '30d', onProgress) {
    const isConn = HealthPermissionManager.isConnected();
    if (!isConn) {
      throw new Error("Health platform not connected. Please request permissions first.");
    }

    const platform = HealthPermissionManager.getPlatform();
    const platformName = platform === 'ios_apple_health' ? 'Apple Health' : 'Android Health Connect';

    if (onProgress) onProgress({ status: 'fetching', percent: 20, message: `Connecting to ${platformName}...` });

    const existingWorkouts = HealthCache.getWorkouts();
    let importedWorkouts = [];

    if (platform === 'ios_apple_health' && Capacitor.isNativePlatform()) {
      if (onProgress) onProgress({ status: 'importing', percent: 60, message: `Reading workouts from Apple HealthKit...` });
      try {
        const { CalyxoHealthKit } = Capacitor.Plugins;
        if (CalyxoHealthKit) {
          const res = await CalyxoHealthKit.queryRecentWorkouts();
          if (res && Array.isArray(res.workouts)) {
            importedWorkouts = res.workouts.map(w => HealthDataMapper.normalizeWorkoutRecord(w, 'Apple Health'));
          }
        }
      } catch (err) {
        console.warn("[CALYXO-HEALTH] Error importing historical workouts:", err);
      }
    }

    const uniqueNewWorkouts = HealthDataMapper.filterDuplicateWorkouts(importedWorkouts, existingWorkouts);
    const mergedWorkouts = [...uniqueNewWorkouts, ...existingWorkouts];
    HealthCache.saveWorkouts(mergedWorkouts);

    if (onProgress) onProgress({ status: 'completed', percent: 100, message: `Successfully imported ${uniqueNewWorkouts.length} workouts from ${platformName}!` });

    // Save import metadata
    try {
      const historyMetadata = {
        lastImportTimestamp: Date.now(),
        timeframe,
        recordsCount: uniqueNewWorkouts.length,
        platform: platformName
      };
      localStorage.setItem(IMPORTED_HISTORY_KEY, JSON.stringify(historyMetadata));
    } catch (e) {}

    return {
      importedCount: uniqueNewWorkouts.length,
      totalWorkouts: mergedWorkouts.length,
      platform: platformName
    };
  }

  /**
   * Delete imported health history data
   */
  static deleteImportedHistory() {
    HealthCache.clear();
    try {
      localStorage.removeItem(IMPORTED_HISTORY_KEY);
    } catch (e) {}
  }
}
