import { Capacitor } from '@capacitor/core';
import { syncWidgetData } from './widgetDataService';

export class LiveActivityManager {
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

  /**
   * Check whether Live Activities are enabled in iOS Settings
   */
  static async isAvailable() {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('[CALYXO-LIVE] Live Activities unavailable (non-iOS platform)');
      return { available: false, enabled: false };
    }
    try {
      const { CalyxoLiveActivity } = Capacitor.Plugins;
      if (CalyxoLiveActivity) {
        const res = await CalyxoLiveActivity.isAvailable();
        console.log('[CALYXO-LIVE] areActivitiesEnabled =', res?.enabled);
        return res;
      }
    } catch (err) {
      console.warn('[CALYXO-LIVE] Availability check error:', err);
    }
    return { available: false, enabled: false };
  }

  /**
   * Start a Live Activity on Dynamic Island & Lock Screen
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
    console.log(`[CALYXO-LIVE] JS startLiveActivity called: ${workoutName} - ${exerciseName}`);
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
      activeWorkout: { name: workoutName, duration: 0 },
      calories: caloriesBurned
    });

    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('[CALYXO-LIVE] Simulated Live Activity on web platform.');
      return 'web-simulated-activity';
    }

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
          console.log(`[CALYXO-LIVE] Activity.request SUCCEEDED id=${res.activityId}`);
          return res.activityId;
        }
      } else {
        console.warn('[CALYXO-LIVE] CalyxoLiveActivity plugin not found on native iOS');
      }
    } catch (err) {
      console.error('[CALYXO-LIVE] Activity.request FAILED:', err);
    }
    return null;
  }

  /**
   * Update the active Live Activity state (sets, reps, rest timer, calories, pause)
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

    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

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
        console.log(`[CALYXO-LIVE] Live Activity updated: ${this.currentExerciseName} | Set ${this.currentSet}/${this.totalSets} | Resting: ${this.isResting}`);
      }
    } catch (err) {
      console.error('[CALYXO-LIVE] Failed to update Live Activity:', err);
    }
  }

  /**
   * Start rest timer countdown in Dynamic Island and Lock Screen
   */
  static async startRestTimer(durationSeconds = 60) {
    console.log(`[CALYXO-LIVE] Starting rest countdown in Dynamic Island: ${durationSeconds}s`);
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
    console.log('[CALYXO-LIVE] Rest timer completed.');
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
    const activityId = this.activeActivityId;
    this.activeActivityId = null;
    this.isPaused = false;
    this.isResting = false;

    await syncWidgetData({ activeWorkout: null });

    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

    try {
      const { CalyxoLiveActivity } = Capacitor.Plugins;
      if (CalyxoLiveActivity) {
        await CalyxoLiveActivity.endActivity({ id: activityId || '' });
        console.log(`[CALYXO-LIVE] Ended Live Activity: ${activityId}`);
      }
    } catch (err) {
      console.error('[CALYXO-LIVE] Failed to end Live Activity:', err);
    }
  }

  /**
   * Reconcile Live Activity state after app relaunch.
   *
   * Called once on mount with the result of loadActiveRest().
   * - If restState is non-null and remaining > 0: update existing activity with correct countdown.
   * - If restState is null (expired/none): end any stale activity that is still showing rest UI.
   * - Never creates a new activity during reconciliation.
   */
  static async reconcileAfterLaunch(restState = null) {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

    try {
      const { CalyxoLiveActivity } = Capacitor.Plugins;
      if (!CalyxoLiveActivity) return;

      const availability = await CalyxoLiveActivity.isAvailable();
      if (!availability?.enabled) return;

      if (restState && restState.remainingSeconds > 0) {
        // Active rest — update the Live Activity with the correct remaining time
        console.log(`[CALYXO-LIVE] Reconcile: updating activity with ${restState.remainingSeconds}s remaining rest`);
        this.currentExerciseName = restState.exerciseName || this.currentExerciseName;
        this.currentSet = restState.setNumber || this.currentSet;
        await this.updateLiveActivity({
          exerciseName: restState.exerciseName,
          currentSet: restState.setNumber,
          isResting: true,
          restDurationSeconds: restState.remainingSeconds,
          isPaused: false
        });
      } else if (!restState) {
        // No active rest — if a stale activity is still showing isResting=true, end the rest state
        console.log('[CALYXO-LIVE] Reconcile: no active rest, clearing rest state from Live Activity if present');
        await this.updateLiveActivity({
          isResting: false,
          restDurationSeconds: 0,
          isPaused: false
        });
      }
    } catch (err) {
      console.warn('[CALYXO-LIVE] reconcileAfterLaunch error (non-fatal):', err);
    }
  }
}

export default LiveActivityManager;

