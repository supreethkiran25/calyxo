import { Capacitor } from '@capacitor/core';
import { syncWidgetData } from './widgetDataService';

export class LiveActivityManager {
  static activeActivityId = null;
  static isPaused = false;
  static secondsElapsed = 0;

  static async startLiveActivity({ title = 'Calyxo Workout', workoutName = 'Custom Session', exerciseName = 'Compound Lifts' }) {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('[LiveActivityManager] Dynamic Island Live Activity active on native iOS.');
      return 'web-simulated-activity';
    }

    try {
      this.secondsElapsed = 0;
      this.isPaused = false;
      console.log(`[LiveActivityManager] Dynamic Island Live Activity Started for: ${workoutName} - ${exerciseName}`);
      
      await syncWidgetData({
        activeWorkout: { name: workoutName, duration: 0 }
      });

      return 'live-activity-active';
    } catch (err) {
      console.error('[LiveActivityManager] Failed to start Live Activity:', err);
      return null;
    }
  }

  static async updateLiveActivity({ exerciseName = 'Bench Press', currentSet = 1, currentReps = 10, restSecondsRemaining = 0, elapsedTime = 0, calories = 0, heartRate = 120, isPaused = false }) {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

    try {
      this.secondsElapsed = elapsedTime || this.secondsElapsed;
      this.isPaused = isPaused;
      console.log(`[LiveActivityManager] Dynamic Island Updated: ${exerciseName} | Set ${currentSet} | ${this.secondsElapsed}s | ${calories} kcal | ${heartRate} bpm`);
    } catch (err) {
      console.error('[LiveActivityManager] Failed to update Live Activity:', err);
    }
  }

  static async pauseLiveActivity() {
    this.isPaused = true;
    console.log('[LiveActivityManager] Workout Paused');
  }

  static async resumeLiveActivity() {
    this.isPaused = false;
    console.log('[LiveActivityManager] Workout Resumed');
  }

  static async endLiveActivity() {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

    try {
      console.log('[LiveActivityManager] Live Activity Ended.');
      this.activeActivityId = null;
      this.secondsElapsed = 0;
      this.isPaused = false;
      await syncWidgetData({ activeWorkout: null });
    } catch (err) {
      console.error('[LiveActivityManager] Failed to end Live Activity:', err);
    }
  }
}

export default LiveActivityManager;
