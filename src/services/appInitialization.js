/**
 * Calyxo Real Application Startup & Initialization Orchestrator
 *
 * Implements real weighted startup tasks:
 * 1. Config (5%)
 * 2. Auth (15%) -> Cumulative 20%
 * 3. Local Storage / IndexedDB (15%) -> Cumulative 35%
 * 4. Zustand Stores (10%) -> Cumulative 45%
 * 5. Supabase Client Verification (15%) -> Cumulative 60%
 * 6. Cached User Data Restore (10%) -> Cumulative 70%
 * 7. Active Workout Session Restore (10%) -> Cumulative 80%
 * 8. Offline Queue Verification (10%) -> Cumulative 90%
 * 9. Initial Route Resolution (10%) -> Cumulative 100%
 */

import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';
import { loadUserData } from '../lib/dbService';
import { liveWorkoutEngine } from './liveWorkout/LiveWorkoutStateMachine';
import { getPendingQueueCount } from '../utils/offlineQueue';
import { useAppStore } from '../stores/appStore';

// Safe timeout wrapper to prevent any task from hanging the splash screen
const withTimeout = (promise, ms, fallbackValue = null) => {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallbackValue), ms))
  ]);
};

export async function initializeApplication(onProgress = () => {}) {
  const startTime = performance.now();
  let currentProgress = 0;

  const report = (progress, key, status = 'in_progress') => {
    currentProgress = Math.max(currentProgress, progress);
    useAppStore.getState().setInitProgress(currentProgress, key);
    onProgress(currentProgress, { key, progress: currentProgress, status });
  };

  let authUser = null;
  let hasActiveWorkout = false;
  let destination = '/';

  try {
    // -------------------------------------------------------------
    // TASK 1: Application Configuration & Platform (0% -> 5%)
    // -------------------------------------------------------------
    report(2, 'config', 'starting');
    const isNative = Capacitor.isNativePlatform();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    useAppStore.getState().setOfflineStatus(!isOnline);
    report(5, 'config', 'complete');

    // -------------------------------------------------------------
    // TASK 2: Authentication Session Restoration (5% -> 20%)
    // -------------------------------------------------------------
    report(8, 'auth', 'starting');
    let localUser = null;
    try {
      const rawUser = localStorage.getItem('calyxo_user') || localStorage.getItem('calyxo_mock_user');
      if (rawUser) localUser = JSON.parse(rawUser);
    } catch (e) {
      console.warn('[Init] Local user parse notice:', e);
    }

    try {
      // Check Supabase session with 900ms timeout for offline resilience
      const sessionResult = await withTimeout(
        supabase.auth.getSession(),
        900,
        { data: { session: null } }
      );
      if (sessionResult?.data?.session?.user) {
        authUser = sessionResult.data.session.user;
      } else if (localUser) {
        authUser = localUser;
      }
    } catch (authErr) {
      console.warn('[Init] Supabase auth check notice:', authErr);
      if (localUser) authUser = localUser;
    }
    report(20, 'auth', 'complete');

    // -------------------------------------------------------------
    // TASK 3: Local Storage & IndexedDB Verification (20% -> 35%)
    // -------------------------------------------------------------
    report(23, 'storage', 'starting');
    try {
      // Test storage access
      const testKey = '__calyxo_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);

      // Verify IndexedDB queue is operational
      await withTimeout(getPendingQueueCount(), 500, 0);
    } catch (storageErr) {
      console.warn('[Init] Storage verification notice:', storageErr);
    }
    report(35, 'storage', 'complete');

    // -------------------------------------------------------------
    // TASK 4: Zustand Stores & Theme Setup (35% -> 45%)
    // -------------------------------------------------------------
    report(38, 'stores', 'starting');
    try {
      useStore.getState().initializeTheme();
      if (authUser) {
        useStore.getState().setUser(authUser);
      }
    } catch (storeErr) {
      console.warn('[Init] Zustand stores init notice:', storeErr);
    }
    report(45, 'stores', 'complete');

    // -------------------------------------------------------------
    // TASK 5: Supabase Connection Verification (45% -> 60%)
    // -------------------------------------------------------------
    report(48, 'supabase', 'starting');
    if (isOnline) {
      try {
        // Lightweight connection probe with 800ms timeout
        await withTimeout(
          supabase.from('profiles').select('id').limit(1),
          800,
          null
        );
      } catch (connErr) {
        console.warn('[Init] Supabase probe offline fallback:', connErr);
      }
    }
    report(60, 'supabase', 'complete');

    // -------------------------------------------------------------
    // TASK 6: Restore Cached User Data (60% -> 70%)
    // -------------------------------------------------------------
    report(63, 'cachedData', 'starting');
    if (authUser) {
      const uid = authUser.id || authUser.uid;
      try {
        const cachedData = await withTimeout(loadUserData(uid), 1000, null);
        if (cachedData) {
          if (cachedData.profile) useStore.getState().setUserProfile(cachedData.profile);
          if (cachedData.foods) useStore.getState().setFoodLogs(cachedData.foods);
          if (cachedData.workouts) useStore.getState().setWorkoutLogs(cachedData.workouts);
          if (cachedData.weights) useStore.getState().setWeightLogs(cachedData.weights);
          if (cachedData.water != null) useStore.getState().setWaterIntake(cachedData.water);
        }
      } catch (cacheErr) {
        console.warn('[Init] Cached data restore notice:', cacheErr);
      }
    }
    report(70, 'cachedData', 'complete');

    // -------------------------------------------------------------
    // TASK 7: Active Workout Session Restoration (70% -> 80%)
    // -------------------------------------------------------------
    report(73, 'workoutRestore', 'starting');
    try {
      const rawWorkout = localStorage.getItem('calyxo_live_workout_session');
      if (rawWorkout) {
        const parsed = JSON.parse(rawWorkout);
        if (parsed && parsed.state && parsed.state !== 'IDLE' && parsed.state !== 'COMPLETED') {
          hasActiveWorkout = true;
          liveWorkoutEngine.initFromStorage();
          useAppStore.getState().setActiveWorkoutSession(parsed);
          console.log('[Init] ✅ Restored active live workout session:', parsed.state);
        }
      }
    } catch (workoutErr) {
      console.warn('[Init] Active workout recovery notice:', workoutErr);
    }
    report(80, 'workoutRestore', 'complete');

    // -------------------------------------------------------------
    // TASK 8: Offline Queue Verification (80% -> 90%)
    // -------------------------------------------------------------
    report(83, 'offlineQueue', 'starting');
    try {
      const pendingMutations = await withTimeout(getPendingQueueCount(), 400, 0);
      if (pendingMutations > 0) {
        console.log(`[Init] Offline queue contains ${pendingMutations} pending actions`);
      }
    } catch (queueErr) {
      console.warn('[Init] Offline queue check notice:', queueErr);
    }
    report(90, 'offlineQueue', 'complete');

    // -------------------------------------------------------------
    // TASK 9: Initial Route Resolution (90% -> 100%)
    // -------------------------------------------------------------
    report(93, 'routeResolution', 'starting');
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    if (hasActiveWorkout) {
      // Active workout special case: Return immediately to workout screen
      destination = '/user/workout';
    } else if (authUser) {
      if (isNative) {
        // Native mobile app authenticated launch -> Dashboard
        destination = currentPath.startsWith('/user/') ? currentPath : '/user/dashboard';
      } else {
        // Web platform:
        // RULE: NEVER redirect from root URL "/" to "/user/dashboard" (AGENTS.md rule)
        if (currentPath === '/') {
          destination = '/';
        } else if (currentPath === '/app' || currentPath === '/welcome') {
          destination = '/user/dashboard';
        } else {
          destination = currentPath;
        }
      }
    } else {
      // Unauthenticated state
      if (currentPath.startsWith('/user/')) {
        destination = '/onboarding';
      } else {
        destination = currentPath;
      }
    }

    useAppStore.getState().setDestinationRoute(destination);
    report(100, 'routeResolution', 'complete');

    const totalElapsed = performance.now() - startTime;
    console.log(`[Init] ✅ Application initialized in ${Math.round(totalElapsed)}ms. Destination: ${destination}`);

    useAppStore.getState().setInitialized(true);
    return {
      success: true,
      user: authUser,
      hasActiveWorkout,
      destination,
      elapsedMs: totalElapsed
    };
  } catch (criticalErr) {
    console.error('[Init] ❌ Critical initialization error:', criticalErr);
    useAppStore.getState().setError(criticalErr.message || 'Initialization failed');
    report(100, 'error', 'failed');
    return {
      success: false,
      error: criticalErr,
      destination: '/'
    };
  }
}

export default initializeApplication;
