import { Capacitor } from '@capacitor/core';
import { syncWidgetData } from './widgetDataService.js';
import { scheduleExactNotification, cancelNotification } from './notificationService.js';

export class LiveActivityManager {
  static isSessionActive = false;
  static activeActivityId = null;
  static isPaused = false;
  static isResting = false;
  static workoutName = 'Calyxo Workout';
  static currentExerciseName = 'Exercise';
  static currentSet = 1;
  static totalSets = 3;
  static currentReps = 10;
  static caloriesBurned = 0;
  static heartRate = 0;
  static activeNotifId = null;

  /**
   * Broadcast state to universal in-app Dynamic Island / Notch HUD
   */
  static broadcastUniversalHUD(isEnded = false, restDurationSeconds = 0) {
    if (!this.isSessionActive && !isEnded) return;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('calyxo_live_activity_sync', {
          detail: {
            isEnded,
            workoutName: this.workoutName,
            exerciseName: this.currentExerciseName,
            currentSet: this.currentSet,
            totalSets: this.totalSets,
            currentReps: this.currentReps,
            isResting: this.isResting,
            restDurationSeconds: restDurationSeconds || (this.isResting ? 60 : 0),
            caloriesBurned: this.caloriesBurned,
            heartRate: this.heartRate,
            isPaused: this.isPaused
          }
        })
      );
    }
  }

  /**
   * Check whether Live Activities are enabled
   */
  static async isAvailable() {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      try {
        const { CalyxoLiveActivity } = Capacitor.Plugins;
        if (CalyxoLiveActivity) {
          const res = await CalyxoLiveActivity.isAvailable();
          return res;
        }
      } catch (err) {
        console.warn('[CALYXO-LIVE] Availability check error:', err);
      }
    }
    // Available universally across Android, Notch devices & Web via in-app Dynamic HUD
    return { available: true, enabled: true };
  }

  /**
   * Start a Live Activity (Dynamic Island, Notch, Android Heads-Up & Lock Screen)
   */
  static async startLiveActivity({
    title = 'Calyxo Workout',
    workoutName = 'Workout Session',
    exerciseName = 'Exercise',
    currentSet = 1,
    totalSets = 3,
    currentReps = 10,
    isResting = false,
    restDurationSeconds = 0,
    caloriesBurned = 0,
    heartRate = 0
  } = {}) {
    this.isSessionActive = true;
    this.workoutName = workoutName;
    this.currentExerciseName = exerciseName;
    this.currentSet = currentSet;
    this.totalSets = totalSets;
    this.currentReps = currentReps;
    this.isResting = isResting;
    this.isPaused = false;
    this.caloriesBurned = caloriesBurned;
    this.heartRate = heartRate;

    // Sync widget state with active workout
    await syncWidgetData({
      activeWorkout: { name: workoutName, duration: 0 }
    });

    // 1. Universal In-App HUD Broadcast
    this.broadcastUniversalHUD(false, restDurationSeconds);

    // 2. Android Native Ongoing Live Notification
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      this.activeNotifId = `android-live-${Date.now()}`;
      scheduleExactNotification({
        id: this.activeNotifId,
        title: `🏋️ Calyxo Workout: ${exerciseName}`,
        body: `Set ${currentSet} of ${totalSets} • ${currentReps} Reps • ${caloriesBurned} kcal burned`,
        delayMs: 100,
        tag: 'calyxo-live-workout'
      });
      return 'android-live-session';
    }

    // 3. iOS Dynamic Island & Lock Screen Live Activity
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      try {
        const { CalyxoLiveActivity } = Capacitor.Plugins;
        if (CalyxoLiveActivity) {
          const res = await CalyxoLiveActivity.startActivity({
            title,
            workoutName,
            exerciseName,
            currentSet,
            totalSets,
            currentReps,
            isResting,
            restDurationSeconds,
            caloriesBurned,
            heartRate
          });
          if (res && res.activityId) {
            this.activeActivityId = res.activityId;
            return res.activityId;
          }
        }
      } catch (err) {
        console.error('[CALYXO-LIVE] Activity.request FAILED:', err);
      }
    }

    return 'universal-hud-session';
  }

  /**
   * Update the active Live Activity state
   */
  static async updateLiveActivity({
    exerciseName,
    currentSet,
    totalSets,
    currentReps,
    isResting,
    restDurationSeconds,
    caloriesBurned,
    heartRate,
    isPaused
  } = {}) {
    if (exerciseName !== undefined) this.currentExerciseName = exerciseName;
    if (currentSet !== undefined) this.currentSet = currentSet;
    if (totalSets !== undefined) this.totalSets = totalSets;
    if (currentReps !== undefined) this.currentReps = currentReps;
    if (isResting !== undefined) this.isResting = isResting;
    if (caloriesBurned !== undefined) this.caloriesBurned = caloriesBurned;
    if (heartRate !== undefined) this.heartRate = heartRate;
    if (isPaused !== undefined) this.isPaused = isPaused;

    // 1. Universal In-App HUD Broadcast
    this.broadcastUniversalHUD(false, restDurationSeconds);

    // 2. Android Live Notification Update
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      if (this.isResting) {
        scheduleExactNotification({
          id: this.activeNotifId || `android-rest-${Date.now()}`,
          title: `⏳ Rest Time: ${restDurationSeconds || 60}s`,
          body: `Next up: Set ${this.currentSet} of ${this.currentExerciseName}`,
          delayMs: 100,
          tag: 'calyxo-live-workout',
          isOngoing: true
        });
      } else {
        scheduleExactNotification({
          id: this.activeNotifId || `android-live-${Date.now()}`,
          title: `🏋️ Calyxo Workout: ${this.currentExerciseName}`,
          body: `Set ${this.currentSet} of ${this.totalSets} • ${this.currentReps} Reps • ${this.caloriesBurned} kcal burned`,
          delayMs: 100,
          tag: 'calyxo-live-workout',
          isOngoing: true
        });
      }
    }

    // 3. iOS Live Activity Update
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      try {
        const { CalyxoLiveActivity } = Capacitor.Plugins;
        if (CalyxoLiveActivity) {
          await CalyxoLiveActivity.updateActivity({
            id: this.activeActivityId || '',
            exerciseName: this.currentExerciseName,
            currentSet: this.currentSet,
            totalSets: this.totalSets,
            currentReps: this.currentReps,
            isResting: this.isResting,
            restDurationSeconds: restDurationSeconds || 0,
            calories: this.caloriesBurned,
            heartRate: this.heartRate,
            isPaused: this.isPaused
          });
        }
      } catch (err) {
        console.error('[CALYXO-LIVE] Failed to update Live Activity:', err);
      }
    }
  }

  /**
   * Start rest timer countdown
   */
  static async startRestTimer(durationSeconds = 60) {
    await this.updateLiveActivity({
      isResting: true,
      restDurationSeconds: durationSeconds,
      isPaused: false
    });
  }

  /**
   * Complete rest timer
   */
  static async endRestTimer() {
    await this.updateLiveActivity({
      isResting: false,
      restDurationSeconds: 0,
      isPaused: false
    });
  }

  /**
   * Pause the active workout Live Activity
   */
  static async pauseLiveActivity() {
    this.isPaused = true;
    await this.updateLiveActivity({ isPaused: true });
  }

  /**
   * Resume the active workout Live Activity
   */
  static async resumeLiveActivity() {
    this.isPaused = false;
    await this.updateLiveActivity({ isPaused: false });
  }

  /**
   * End and dismiss the Live Activity
   */
  static async endLiveActivity() {
    this.isSessionActive = false;
    const activityId = this.activeActivityId;
    this.activeActivityId = null;
    this.isPaused = false;
    this.isResting = false;

    // 1. Universal In-App HUD Dismissal
    this.broadcastUniversalHUD(true, 0);

    // 2. Clear Android Notification
    if (this.activeNotifId) {
      cancelNotification(this.activeNotifId);
      this.activeNotifId = null;
    }

    await syncWidgetData({ activeWorkout: null });

    // 3. Dismiss iOS Live Activity
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      try {
        const { CalyxoLiveActivity } = Capacitor.Plugins;
        if (CalyxoLiveActivity) {
          await CalyxoLiveActivity.endActivity({ id: activityId || '' });
        }
      } catch (err) {
        console.error('[CALYXO-LIVE] Failed to end Live Activity:', err);
      }
    }
  }

  /**
   * Reconcile Live Activity state after app relaunch
   */
  static async reconcileAfterLaunch(restState = null) {
    if (restState && restState.remainingSeconds > 0) {
      this.isSessionActive = true;
      this.currentExerciseName = restState.exerciseName || this.currentExerciseName;
      this.currentSet = restState.setNumber || this.currentSet;
      await this.updateLiveActivity({
        exerciseName: restState.exerciseName,
        currentSet: restState.setNumber,
        isResting: true,
        restDurationSeconds: restState.remainingSeconds,
        isPaused: false
      });
    } else {
      await this.endLiveActivity();
    }
  }
}

export default LiveActivityManager;
