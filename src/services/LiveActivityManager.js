import { Capacitor } from '@capacitor/core';
import { syncWidgetData } from './widgetDataService';

export class LiveActivityManager {
  static activeActivityId = null;
  static timerInterval = null;
  static secondsElapsed = 0;

  static async startLiveActivity({ title = 'Calyxo Workout', workoutName = 'Custom Session' }) {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('[LiveActivityManager] Dynamic Island Live Activity is supported on native iOS (iPhone 14 Pro/15/16).');
      return null;
    }

    try {
      this.secondsElapsed = 0;
      console.log(`[LiveActivityManager] Initialized Live Activity for: ${workoutName}`);
      
      // Sync widget data simultaneously
      await syncWidgetData({
        activeWorkout: { name: workoutName, duration: 0 }
      });

      return 'live-activity-active';
    } catch (err) {
      console.error('[LiveActivityManager] Failed to start Live Activity:', err);
      return null;
    }
  }

  static async updateLiveActivity({ elapsedTime, calories = 0, heartRate = 120, isPaused = false }) {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

    try {
      this.secondsElapsed = elapsedTime || this.secondsElapsed;
      console.log(`[LiveActivityManager] Dynamic Island updated: ${this.secondsElapsed}s | ${calories} kcal`);
    } catch (err) {
      console.error('[LiveActivityManager] Failed to update Live Activity:', err);
    }
  }

  static async endLiveActivity() {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

    try {
      console.log('[LiveActivityManager] Live Activity Ended.');
      this.activeActivityId = null;
      this.secondsElapsed = 0;
      await syncWidgetData({ activeWorkout: null });
    } catch (err) {
      console.error('[LiveActivityManager] Failed to end Live Activity:', err);
    }
  }
}

export default LiveActivityManager;
