/**
 * Calyxo Flagship Live Workout State Machine & Engine
 *
 * Implements 10 explicit workout lifecycle states with zero auto-start:
 * IDLE -> STARTING -> ACTIVE -> SET_COMPLETED -> RESTING -> PAUSED -> RESUMING -> COMPLETING -> COMPLETED -> ERROR
 *
 * Fully timestamp-driven, background-resilient, and battery-efficient.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { LiveActivityManager } from '../LiveActivityManager.js';
import { saveActiveRest, clearActiveRest, loadActiveRest } from '../restTimerPersistence.js';
import { scheduleExactNotification, cancelNotification } from '../notificationService.js';

export const WORKOUT_STATES = {
  IDLE: 'IDLE',
  STARTING: 'STARTING',
  ACTIVE: 'ACTIVE',
  SET_COMPLETED: 'SET_COMPLETED',
  RESTING: 'RESTING',
  PAUSED: 'PAUSED',
  RESUMING: 'RESUMING',
  COMPLETING: 'COMPLETING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR'
};

const STORAGE_KEY = 'calyxo_live_workout_session';

class LiveWorkoutEngine {
  constructor() {
    this.state = WORKOUT_STATES.IDLE;
    this.session = null;
    this.listeners = new Set();
    this.initFromStorage();
    this.setupWindowListeners();
  }

  /**
   * Safe native haptic trigger
   */
  async triggerHaptic(type = 'medium') {
    try {
      if (Capacitor.isNativePlatform()) {
        if (type === 'success') {
          await Haptics.notification({ type: NotificationType.Success });
        } else if (type === 'heavy') {
          await Haptics.impact({ style: ImpactStyle.Heavy });
        } else {
          await Haptics.impact({ style: ImpactStyle.Medium });
        }
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'success') navigator.vibrate([100, 50, 100]);
        else if (type === 'heavy') navigator.vibrate(150);
        else navigator.vibrate(50);
      }
    } catch (e) {
      // Haptics unavailable, continue gracefully
    }
  }

  /**
   * Restore persisted session across app re-launches and force quits
   */
  initFromStorage() {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed && parsed.state && parsed.state !== WORKOUT_STATES.IDLE && parsed.state !== WORKOUT_STATES.COMPLETED) {
        this.session = parsed;
        this.state = parsed.state;

        // Reconcile rest timer if in resting state
        if (this.state === WORKOUT_STATES.RESTING && this.session.restEndDate) {
          const now = Date.now();
          if (now >= this.session.restEndDate) {
            // Rest completed while app was closed -> transition to next active set
            this.state = WORKOUT_STATES.ACTIVE;
            this.session.state = WORKOUT_STATES.ACTIVE;
            this.session.restStartDate = null;
            this.session.restEndDate = null;
          }
        }
        this.persist();
      }
    } catch (e) {
      console.warn('[CALYXO-WORKOUT] Failed to restore live session from storage:', e);
    }
  }

  persist() {
    try {
      if (typeof window === 'undefined') return;
      if (this.state === WORKOUT_STATES.IDLE || this.state === WORKOUT_STATES.COMPLETED) {
        localStorage.removeItem(STORAGE_KEY);
      } else if (this.session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...this.session,
          state: this.state,
          updatedAt: Date.now()
        }));
      }
    } catch (e) {}
  }

  setupWindowListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('calyxo_complete_active_set', () => {
      this.logCurrentSet();
    });

    window.addEventListener('calyxo_skip_active_rest', () => {
      this.skipRest();
    });

    window.addEventListener('calyxo_toggle_pause_active_workout', () => {
      this.togglePause();
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getStateSnapshot());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snap = this.getStateSnapshot();
    this.listeners.forEach(fn => fn(snap));
    this.persist();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('calyxo_live_workout_state_change', { detail: snap }));
    }
  }

  getStateSnapshot() {
    const now = Date.now();
    let remainingRestSeconds = 0;
    let elapsedWorkoutSeconds = 0;

    if (this.session) {
      if (this.session.startedAt) {
        const totalElapsedMs = (this.session.pausedAt || now) - this.session.startedAt - (this.session.totalPausedMs || 0);
        elapsedWorkoutSeconds = Math.max(0, Math.floor(totalElapsedMs / 1000));
      }

      if (this.state === WORKOUT_STATES.RESTING && this.session.restEndDate) {
        remainingRestSeconds = Math.max(0, Math.ceil((this.session.restEndDate - now) / 1000));
      }
    }

    return {
      state: this.state,
      session: this.session ? { ...this.session } : null,
      remainingRestSeconds,
      elapsedWorkoutSeconds,
      isActive: this.state !== WORKOUT_STATES.IDLE && this.state !== WORKOUT_STATES.COMPLETED,
      isResting: this.state === WORKOUT_STATES.RESTING && remainingRestSeconds > 0,
      isPaused: this.state === WORKOUT_STATES.PAUSED
    };
  }

  /**
   * 1. Start Workout Session (Requires explicit user action — zero auto-start)
   */
  async startWorkout(routine) {
    if (!routine) return;

    const exercises = routine.workout?.exercises || routine.exercises || [];
    if (!exercises.length) return;

    this.state = WORKOUT_STATES.STARTING;
    const now = Date.now();

    const currentEx = exercises[0];
    const details = String(currentEx.details || '3 sets x 10 reps').toLowerCase();
    const setsMatch = details.match(/(\d+)\s*set/);
    const repsMatch = details.match(/(\d+)\s*rep/);

    const totalSets = setsMatch ? parseInt(setsMatch[1], 10) : 3;
    const targetReps = repsMatch ? parseInt(repsMatch[1], 10) : 10;

    this.session = {
      id: `live_sess_${now}`,
      workoutName: routine.dayName || routine.workout?.name || routine.name || 'Calyxo Workout',
      exercises: exercises.map((ex, idx) => ({
        id: `ex_${idx}`,
        name: ex.name || 'Exercise',
        details: ex.details || '3 sets x 10 reps',
        completedSets: []
      })),
      currentExerciseIndex: 0,
      currentSetNumber: 1,
      totalSetsForCurrentEx: totalSets,
      currentWeightKg: 0,
      currentReps: targetReps,
      startedAt: now,
      totalPausedMs: 0,
      pausedAt: null,
      restStartDate: null,
      restEndDate: null,
      totalVolumeKg: 0,
      completedSetsTotal: 0,
      caloriesBurned: 0,
      lastCompletedSet: null
    };

    this.state = WORKOUT_STATES.ACTIVE;
    await this.triggerHaptic('medium');

    // Launch native Live Activity / Android Notification
    await LiveActivityManager.startLiveActivity({
      title: 'Calyxo Live Workout',
      workoutName: this.session.workoutName,
      exerciseName: currentEx.name,
      currentSet: 1,
      totalSets: totalSets,
      currentReps: targetReps,
      isResting: false,
      restDurationSeconds: 0
    });

    this.notify();
    return this.getStateSnapshot();
  }

  /**
   * 2. Log Set (Transition: ACTIVE -> SET_COMPLETED -> RESTING)
   */
  async logCurrentSet({ weightKg = null, reps = null, restDurationSeconds = 60 } = {}) {
    if (this.state !== WORKOUT_STATES.ACTIVE && this.state !== WORKOUT_STATES.PAUSED) return;
    if (!this.session) return;

    const currentEx = this.session.exercises[this.session.currentExerciseIndex];
    if (!currentEx) return;

    const loggedWeight = weightKg !== null ? Number(weightKg) : Number(this.session.currentWeightKg || 0);
    const loggedReps = reps !== null ? Number(reps) : Number(this.session.currentReps || 10);

    const setRecord = {
      setNumber: this.session.currentSetNumber,
      weightKg: loggedWeight,
      reps: loggedReps,
      completedAt: Date.now()
    };

    currentEx.completedSets.push(setRecord);
    this.session.completedSetsTotal += 1;
    this.session.totalVolumeKg += (loggedWeight * loggedReps);
    this.session.lastCompletedSet = setRecord;

    // 1. Brief SET_COMPLETED State & Haptics
    this.state = WORKOUT_STATES.SET_COMPLETED;
    await this.triggerHaptic('success');
    this.notify();

    // Check if this was the last set of the current exercise
    const isLastSetOfExercise = this.session.currentSetNumber >= this.session.totalSetsForCurrentEx;
    const isLastExercise = this.session.currentExerciseIndex >= this.session.exercises.length - 1;

    if (isLastSetOfExercise && isLastExercise) {
      // Workout Complete!
      setTimeout(() => {
        this.completeWorkout();
      }, 750);
      return;
    }

    // 2. Transition into RESTING
    setTimeout(async () => {
      const now = Date.now();
      const restSecs = Number(restDurationSeconds) || 60;
      this.state = WORKOUT_STATES.RESTING;
      this.session.restStartDate = now;
      this.session.restEndDate = now + (restSecs * 1000);

      if (isLastSetOfExercise) {
        // Prepare next exercise
        this.session.currentExerciseIndex += 1;
        const nextEx = this.session.exercises[this.session.currentExerciseIndex];
        const details = String(nextEx?.details || '3 sets x 10 reps').toLowerCase();
        const setsMatch = details.match(/(\d+)\s*set/);
        const repsMatch = details.match(/(\d+)\s*rep/);
        this.session.totalSetsForCurrentEx = setsMatch ? parseInt(setsMatch[1], 10) : 3;
        this.session.currentSetNumber = 1;
        this.session.currentReps = repsMatch ? parseInt(repsMatch[1], 10) : 10;
      } else {
        this.session.currentSetNumber += 1;
      }

      // Schedule background notification for rest completion
      const notifId = `rest-notif-${now}`;
      await saveActiveRest({
        workoutId: this.session.id,
        exerciseName: currentEx.name,
        setNumber: this.session.currentSetNumber,
        durationSeconds: restSecs,
        notificationId: notifId
      });

      scheduleExactNotification({
        id: notifId,
        title: 'Rest Complete! 💪',
        body: `Ready for Set ${this.session.currentSetNumber} of ${this.session.exercises[this.session.currentExerciseIndex]?.name || 'Exercise'}`,
        delayMs: restSecs * 1000,
        tag: 'workout-rest-timer'
      });

      // Update Native Live Activity
      await LiveActivityManager.updateLiveActivity({
        exerciseName: this.session.exercises[this.session.currentExerciseIndex]?.name,
        currentSet: this.session.currentSetNumber,
        totalSets: this.session.totalSetsForCurrentEx,
        currentReps: this.session.currentReps,
        isResting: true,
        restDurationSeconds: restSecs,
        isPaused: false
      });

      this.notify();
    }, 450);
  }

  /**
   * 3. Skip Rest Interval -> Transition back to ACTIVE
   */
  async skipRest() {
    if (this.state !== WORKOUT_STATES.RESTING) return;
    if (!this.session) return;

    this.state = WORKOUT_STATES.ACTIVE;
    this.session.restStartDate = null;
    this.session.restEndDate = null;
    await clearActiveRest();
    await this.triggerHaptic('medium');

    await LiveActivityManager.updateLiveActivity({
      exerciseName: this.session.exercises[this.session.currentExerciseIndex]?.name,
      currentSet: this.session.currentSetNumber,
      totalSets: this.session.totalSetsForCurrentEx,
      currentReps: this.session.currentReps,
      isResting: false,
      restDurationSeconds: 0,
      isPaused: false
    });

    this.notify();
  }

  /**
   * 4. Toggle Pause / Resume
   */
  async togglePause() {
    if (this.state === WORKOUT_STATES.IDLE || this.state === WORKOUT_STATES.COMPLETED) return;
    if (!this.session) return;

    const now = Date.now();
    if (this.state === WORKOUT_STATES.PAUSED) {
      // Resume
      const pauseDuration = now - (this.session.pausedAt || now);
      this.session.totalPausedMs = (this.session.totalPausedMs || 0) + pauseDuration;
      this.session.pausedAt = null;

      // Adjust restEndDate if paused during rest
      if (this.session.restEndDate) {
        this.session.restEndDate += pauseDuration;
      }

      this.state = this.session.restEndDate && this.session.restEndDate > now ? WORKOUT_STATES.RESTING : WORKOUT_STATES.ACTIVE;
      await this.triggerHaptic('medium');
      await LiveActivityManager.resumeLiveActivity();
    } else {
      // Pause
      this.session.pausedAt = now;
      this.state = WORKOUT_STATES.PAUSED;
      await this.triggerHaptic('medium');
      await LiveActivityManager.pauseLiveActivity();
    }

    this.notify();
  }

  /**
   * 5. End / Complete Workout Session
   */
  async completeWorkout() {
    this.state = WORKOUT_STATES.COMPLETED;
    await this.triggerHaptic('heavy');
    await clearActiveRest();
    await LiveActivityManager.endLiveActivity();
    this.notify();

    // Reset after delay to allow summary celebration
    setTimeout(() => {
      this.state = WORKOUT_STATES.IDLE;
      this.session = null;
      this.persist();
      this.notify();
    }, 4000);
  }

  /**
   * 6. Cancel / Abort Workout
   */
  async cancelWorkout() {
    this.state = WORKOUT_STATES.IDLE;
    this.session = null;
    await clearActiveRest();
    await LiveActivityManager.endLiveActivity();
    this.persist();
    this.notify();
  }
}

export const liveWorkoutEngine = new LiveWorkoutEngine();
export default liveWorkoutEngine;
