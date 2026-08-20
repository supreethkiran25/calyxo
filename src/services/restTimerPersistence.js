/**
 * restTimerPersistence.js
 *
 * Single-responsibility owner of active rest timer state across app restarts.
 * All timestamps are ISO 8601 strings. Never stores sensitive data.
 *
 * Shape persisted:
 * {
 *   workoutId: string,
 *   exerciseName: string,
 *   setNumber: number,
 *   durationSeconds: number,
 *   restStartDate: ISO string,
 *   restEndDate: ISO string,
 *   notificationId: string
 * }
 */
import { Preferences } from '@capacitor/preferences';

const KEY = 'calyxo_active_rest';

/**
 * Persist a new active rest. restEndDate is computed from durationSeconds.
 */
export async function saveActiveRest({
  workoutId = 'unknown',
  exerciseName = '',
  setNumber = 1,
  durationSeconds = 60,
  notificationId = ''
} = {}) {
  const now = new Date();
  const restEndDate = new Date(now.getTime() + durationSeconds * 1000);
  const payload = {
    workoutId,
    exerciseName,
    setNumber,
    durationSeconds,
    restStartDate: now.toISOString(),
    restEndDate: restEndDate.toISOString(),
    notificationId
  };
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(payload) });
    console.log('[CALYXO-REST] Persisted active rest:', payload);
  } catch (e) {
    console.warn('[CALYXO-REST] Failed to persist rest state:', e);
  }
  return payload;
}

/**
 * Load persisted rest state.
 * Returns null if none exists or if the rest has already expired.
 * Returns the state object with a `remainingSeconds` field if still active.
 */
export async function loadActiveRest() {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (!value) return null;

    const state = JSON.parse(value);
    const endMs = new Date(state.restEndDate).getTime();
    const nowMs = Date.now();
    const remainingSeconds = Math.ceil((endMs - nowMs) / 1000);

    if (remainingSeconds <= 0) {
      // Expired — clean up stale state
      console.log('[CALYXO-REST] Persisted rest has expired. Clearing.');
      await clearActiveRest();
      return null;
    }

    console.log(`[CALYXO-REST] Restored rest state: ${remainingSeconds}s remaining for ${state.exerciseName} set ${state.setNumber}`);
    return { ...state, remainingSeconds };
  } catch (e) {
    console.warn('[CALYXO-REST] Failed to load rest state:', e);
    return null;
  }
}

/**
 * Clear the persisted rest state.
 */
export async function clearActiveRest() {
  try {
    await Preferences.remove({ key: KEY });
    console.log('[CALYXO-REST] Cleared active rest state.');
  } catch (e) {
    console.warn('[CALYXO-REST] Failed to clear rest state:', e);
  }
}
