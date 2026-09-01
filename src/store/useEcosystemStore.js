import { create } from 'zustand';
import { getSecureItem, setSecureItem, getCurrentUserIdSync, saveEcosystemState } from '../lib/dbService.js';
import { calculateConsecutiveDaysStreak, calculateWaterGoalStreak, shiftDays, isStreakActive } from '../utils/streakEngine.js';
import { getTodayDateString } from '../utils/dateUtils.js';

const LOCAL_ECOSYSTEM_KEY = "calyxo_ecosystem_state";


const INITIAL_STATE = {
  streaks: { loginStreak: 1, workoutStreak: 0, nutritionStreak: 0, waterStreak: 0, lastCheckIn: new Date().toISOString().split('T')[0], lastCheckInDate: new Date().toISOString().split('T')[0] },
  achievements: [
    { id: 'first_workout', name: 'First Workout', icon: 'Dumbbell', description: 'Log your first workout session', unlocked: false },
    { id: 'first_meal', name: 'First Meal Logged', icon: 'Utensils', description: 'Log your first meal entry', unlocked: false },
    { id: 'first_week', name: 'First Week Complete', icon: 'Calendar', description: 'Log activities for 7 consecutive days', unlocked: false },
    { id: 'streak_7', name: '7 Day Streak', icon: 'Flame', description: 'Maintain any log streak for 7 days', unlocked: false },
    { id: 'hydration_hero', name: 'Hydration Hero', icon: 'Droplets', description: 'Hit 3000ml water target in a single day', unlocked: false },
    { id: 'protein_master', name: 'Protein Master', icon: 'Beef', description: 'Hit daily protein target of 120g+', unlocked: false },
    { id: 'muscle_builder', name: 'Muscle Builder', icon: 'Activity', description: 'Log at least 10 workout sessions', unlocked: false }
  ],
  coachingPlan: null,
  predictions: null,
  timelineLogs: [],
  fitnessScore: { dailyScore: 70, weeklyScore: 72, monthlyScore: 75, recommendations: ["Hit your protein target today", "Log 3000ml of water to hit hydration goals"] },
  healthTwin: {
    recoveryScore: 85,
    fitnessAge: 25,
    sleepDebt: 0,
    dailyHealthScore: 80,
    predictedWeight: 70,
    predictedMuscleGain: 0.5,
    predictedFatLoss: 0.5,
    calorieForecast: 2200,
    weeklyHealthForecast: "Maintained steady progress.",
    riskDetection: "None",
    personalizedRecommendations: ["Stay hydrated", "Increase protein"]
  },
  activeChallenges: [
    { id: 'easy_surya_namaskar', tier: 'EASY', name: '15-Day Morning Surya Namaskar', target: 'Complete 12 rounds of Surya Namaskar daily', progress: 0, targetVal: 15, completed: false, unit: 'days' },
    { id: 'easy_walk', tier: 'EASY', name: '5,000 Step Walk', target: 'Walk 5,000 brisk steps every evening after dinner', progress: 0, targetVal: 10, completed: false, unit: 'days' },
    { id: 'medium_10k_steps', tier: 'MEDIUM', name: '10,000 Daily Step Count Master', target: 'Achieve 10,000 total steps daily', progress: 0, targetVal: 14, completed: false, unit: 'days' },
    { id: 'medium_desi_gym', tier: 'MEDIUM', name: 'Desi Gym Muscle Builder', target: 'Complete 20 total strength workout sessions', progress: 0, targetVal: 20, completed: false, unit: 'sessions' },
    { id: 'hard_100k_volume', tier: 'HARD', name: '100,000 KG Heavy Lifters Club', target: 'Lift 100,000 kg total volume across compound lifts', progress: 0, targetVal: 100000, completed: false, unit: 'kg' },
    { id: 'hard_1000_pushups', tier: 'HARD', name: '1,000 Push-ups Upper Body Challenge', target: 'Complete 1,000 cumulative push-ups over 30 days', progress: 0, targetVal: 1000, completed: false, unit: 'reps' }
  ],
  personality: 'motivational',
  measurementLogs: [],
  xp: 0,
  level: 1,
  clientAssignments: {}
};

const getLocalEcosystemState = (userId = null) => {
  const uid = userId || getCurrentUserIdSync();
  if (uid) {
    const key = LOCAL_ECOSYSTEM_KEY + '_' + uid;
    const saved = getSecureItem(key, uid);
    if (saved) {
      const todayStr = getTodayDateString();
      const lastCheck = saved.streaks?.lastCheckInDate || saved.streaks?.lastCheckIn;
      // If user missed a day (last check-in was before yesterday), reset broken streaks
      if (lastCheck && !isStreakActive(lastCheck, todayStr)) {
        saved.streaks = {
          ...(saved.streaks || {}),
          loginStreak: 0,
          workoutStreak: 0,
          nutritionStreak: 0,
          waterStreak: 0
        };
      }
      return saved;
    }
  }
  // Clear any stale global un-scoped key to prevent cross-account pollution
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(LOCAL_ECOSYSTEM_KEY); } catch (e) {}
  }
  return { ...INITIAL_STATE };
};

const saveLocalEcosystemState = (state, userId = null) => {
  const uid = userId || getCurrentUserIdSync();
  if (uid) {
    const key = LOCAL_ECOSYSTEM_KEY + '_' + uid;
    setSecureItem(key, state, uid);
  }
};

export const useEcosystemStore = create((set, get) => ({
  ...getLocalEcosystemState(),

  // Initialize or switch active user session (Strictly User-Scoped)
  initUserEcosystem: (userId) => {
    if (!userId) {
      set({ ...INITIAL_STATE });
      return;
    }
    const userState = getLocalEcosystemState(userId);
    set(userState);
  },

  // Authoritative Sync from DB for the authenticated user (Strictly User-Scoped)
  syncEcosystemState: (data) => {
    if (data) {
      const uid = getCurrentUserIdSync();
      const currentState = get();
      const todayStr = getTodayDateString();

      const incomingLastCheck = data.streaks?.lastCheckInDate || data.streaks?.lastCheckIn || currentState.streaks?.lastCheckInDate || todayStr;
      const streakStillActive = isStreakActive(incomingLastCheck, todayStr);

      const rawLoginStreak = Number(data.streaks?.loginStreak ?? currentState.streaks?.loginStreak ?? 1);
      const sanitizedLoginStreak = streakStillActive ? rawLoginStreak : (incomingLastCheck === todayStr ? 1 : 0);

      const mergedStreaks = {
        ...(currentState.streaks || {}),
        ...(data.streaks || {}),
        loginStreak: sanitizedLoginStreak,
        workoutStreak: streakStillActive ? Number(data.streaks?.workoutStreak ?? currentState.streaks?.workoutStreak ?? 0) : 0,
        nutritionStreak: streakStillActive ? Number(data.streaks?.nutritionStreak ?? currentState.streaks?.nutritionStreak ?? 0) : 0,
        waterStreak: streakStillActive ? Number(data.streaks?.waterStreak ?? currentState.streaks?.waterStreak ?? 0) : 0,
        lastCheckInDate: incomingLastCheck,
        lastCheckIn: incomingLastCheck,
        loginDates: Array.isArray(data.streaks?.loginDates) ? data.streaks.loginDates : (currentState.streaks?.loginDates || [])
      };

      const mergedState = {
        ...currentState,
        ...data,
        streaks: mergedStreaks
      };

      set(mergedState);
      saveLocalEcosystemState(mergedState, uid);
    }
  },

  // Evaluate daily streak integrity: reset broken streaks if user did not open the app for a day
  evaluateDailyStreakReset: () => set((state) => {
    const uid = getCurrentUserIdSync();
    const todayStr = getTodayDateString();
    const lastCheck = state.streaks?.lastCheckInDate || state.streaks?.lastCheckIn;

    if (lastCheck && !isStreakActive(lastCheck, todayStr)) {
      // User missed 1+ days: reset streak engine
      const nextStreaks = {
        ...(state.streaks || {}),
        loginStreak: 0,
        workoutStreak: 0,
        nutritionStreak: 0,
        waterStreak: 0
      };
      const nextState = { ...state, streaks: nextStreaks };
      saveLocalEcosystemState(nextState, uid);
      if (uid) saveEcosystemState(uid, nextState).catch(() => {});
      return { streaks: nextStreaks };
    }
    return {};
  }),

  // Streaks actions — Pure Mathematical Streak Synchronization with Missed-Day Reset
  checkDailyLoginStreak: () => set((state) => {
    const uid = getCurrentUserIdSync();
    const todayStr = getTodayDateString(); // Authoritative local calendar date YYYY-MM-DD
    const lastCheck = state.streaks?.lastCheckInDate || state.streaks?.lastCheckIn;
    const isConsecutive = isStreakActive(lastCheck, todayStr);

    // Existing login history dates (YYYY-MM-DD)
    const existingDates = Array.isArray(state.streaks?.loginDates) ? state.streaks.loginDates : [];
    const dateSet = new Set(existingDates);

    // If user has a previous login streak but empty loginDates array, reconstruct historical dates ONLY IF active
    const priorStreak = Number(state.streaks?.loginStreak) || 0;
    if (dateSet.size === 0 && priorStreak > 0 && isConsecutive && lastCheck) {
      for (let i = 0; i < priorStreak; i++) {
        dateSet.add(shiftDays(lastCheck, -i));
      }
    }

    // Add today's check-in
    dateSet.add(todayStr);
    const updatedDates = Array.from(dateSet).sort();

    // Mathematically calculate the exact consecutive days streak
    // If the user skipped a day, calculateConsecutiveDaysStreak will automatically reduce to 1
    const exactLoginStreak = calculateConsecutiveDaysStreak(updatedDates, todayStr);

    const nextStreaks = {
      ...(state.streaks || {}),
      loginStreak: exactLoginStreak,
      loginDates: updatedDates,
      lastCheckInDate: todayStr,
      lastCheckIn: todayStr
    };

    const nextState = { ...state, streaks: nextStreaks };
    saveLocalEcosystemState(nextState, uid);
    if (uid) saveEcosystemState(uid, nextState).catch(() => {});
    return { streaks: nextStreaks };
  }),

  updateStreaks: (updates) => set((state) => {
    const uid = getCurrentUserIdSync();
    const next = { ...(state.streaks || {}), ...updates };
    const nextState = { ...state, streaks: next };
    saveLocalEcosystemState(nextState);
    if (uid) saveEcosystemState(uid, nextState).catch(() => {});
    return { streaks: next };
  }),

  recalculateDynamicStreaks: (foodLogs = [], workoutLogs = [], waterLogs = [], waterTarget = 3000) => set((state) => {
    const uid = getCurrentUserIdSync();
    const todayStr = getTodayDateString();
    const nutritionTimestamps = (foodLogs || []).map(f => f.timestamp || f.created_at);
    // Count ONLY completed workout sessions (not abandoned or in-progress)
    const completedWorkoutTimestamps = (workoutLogs || [])
      .filter(w => w && w.completed !== false && w.status !== 'abandoned' && w.status !== 'started')
      .map(w => w.timestamp || w.created_at);

    const nutritionStreak = calculateConsecutiveDaysStreak(nutritionTimestamps, todayStr);
    const workoutStreak = calculateConsecutiveDaysStreak(completedWorkoutTimestamps, todayStr);
    const waterStreak = calculateWaterGoalStreak(waterLogs, waterTarget, todayStr);

    const nextStreaks = {
      ...(state.streaks || {}),
      nutritionStreak,
      workoutStreak,
      waterStreak
    };

    const nextState = { ...state, streaks: nextStreaks };
    saveLocalEcosystemState(nextState);
    if (uid) saveEcosystemState(uid, nextState).catch(() => {});
    return { streaks: nextStreaks };
  }),



  // Unlock Achievements
  unlockAchievement: (id) => set((state) => {
    let xpGranted = 0;
    const next = state.achievements.map(a => {
      if (a.id === id && !a.unlocked) {
        xpGranted = 200;
        return { ...a, unlocked: true, unlockedAt: Date.now() };
      }
      return a;
    });

    let nextXP = state.xp || 0;
    let nextLevel = state.level || 1;
    if (xpGranted > 0) {
      nextXP += xpGranted;
      while (nextXP >= nextLevel * 1000) {
        nextXP -= nextLevel * 1000;
        nextLevel += 1;
      }
    }

    const nextState = { ...state, achievements: next, xp: nextXP, level: nextLevel };
    saveLocalEcosystemState(nextState);

    // Publish Achievement & Level Up Activities
    const userId = getCurrentUserIdSync();
    const oldLevel = state.level || 1;
    if (userId && xpGranted > 0) {
      const achName = next.find(a => a.id === id)?.name || "Achievement";
      // Publish Achievement & Level Up Activities removed
    }

    if (userId && nextLevel > oldLevel) {
      // Level up publish removed
    }

    return { achievements: next, xp: nextXP, level: nextLevel };
  }),

  // Add XP directly (for food logs, workouts, water target)
  addXP: (amount) => set((state) => {
    let nextXP = (state.xp || 0) + amount;
    let nextLevel = state.level || 1;
    const oldLevel = state.level || 1;
    while (nextXP >= nextLevel * 1000) {
      nextXP -= nextLevel * 1000;
      nextLevel += 1;
    }
    const nextState = { ...state, xp: nextXP, level: nextLevel };
    saveLocalEcosystemState(nextState);

    const userId = getCurrentUserIdSync();
    if (userId && nextLevel > oldLevel) {
      // Level up publish removed
    }

    return { xp: nextXP, level: nextLevel };
  }),

  // Add body measurement log
  addMeasurementLog: (log) => set((state) => {
    const next = [log, ...(state.measurementLogs || [])];
    const nextState = { ...state, measurementLogs: next };
    saveLocalEcosystemState(nextState);
    return { measurementLogs: next };
  }),

  // Save generated active coaching plan
  setCoachingPlan: (coachingPlan) => set((state) => {
    const nextState = { ...state, coachingPlan };
    saveLocalEcosystemState(nextState);
    return { coachingPlan };
  }),

  // Predictions updates
  setPredictions: (predictions) => set((state) => {
    const nextState = { ...state, predictions };
    saveLocalEcosystemState(nextState);
    return { predictions };
  }),

  // Timeline uploads (before/after photos)
  addTimelineLog: (log) => set((state) => {
    const next = [log, ...state.timelineLogs];
    const nextState = { ...state, timelineLogs: next };
    saveLocalEcosystemState(nextState);
    return { timelineLogs: next };
  }),

  // Fitness score update
  updateFitnessScore: (updates) => set((state) => {
    const next = { ...state.fitnessScore, ...updates };
    const nextState = { ...state, fitnessScore: next };
    saveLocalEcosystemState(nextState);
    return { fitnessScore: next };
  }),

  // AI Health Twin update
  updateHealthTwin: (updates) => set((state) => {
    const next = { ...state.healthTwin, ...updates };
    const nextState = { ...state, healthTwin: next };
    saveLocalEcosystemState(nextState);
    return { healthTwin: next };
  }),

  // Challenge tracking
  joinChallenge: (challengeObj) => set((state) => {
    const existing = (state.activeChallenges || []).find(c => c.id === challengeObj.id);
    if (existing) return state;
    const newChallenge = {
      id: challengeObj.id,
      name: challengeObj.name,
      target: challengeObj.target,
      targetVal: challengeObj.targetVal || 30,
      unit: challengeObj.unit || 'days',
      progress: 0,
      completed: false,
      tier: challengeObj.tier || 'EASY'
    };
    const next = [...(state.activeChallenges || []), newChallenge];
    const nextState = { ...state, activeChallenges: next };
    saveLocalEcosystemState(nextState);
    return { activeChallenges: next };
  }),

  updateChallengeProgress: (id, amount) => set((state) => {
    const next = state.activeChallenges.map(c => {
      if (c.id === id) {
        const nextProgress = Math.min(c.progress + amount, c.targetVal);
        return { ...c, progress: nextProgress, completed: nextProgress >= c.targetVal };
      }
      return c;
    });
    const nextState = { ...state, activeChallenges: next };
    saveLocalEcosystemState(nextState);

    const oldCh = state.activeChallenges.find(c => c.id === id);
    const nextCh = next.find(c => c.id === id);
    const userId = getCurrentUserIdSync();
    if (userId && nextCh && nextCh.completed && !oldCh?.completed) {
      // Challenge complete publish removed
    }


    return { activeChallenges: next };
  }),

  // Coach Personality Setting
  setPersonality: (personality) => set((state) => {
    const nextState = { ...state, personality };
    saveLocalEcosystemState(nextState);
    return { personality };
  }),



  // Reset store
  resetEcosystemStore: () => {
    const uid = getCurrentUserIdSync();
    set({ ...INITIAL_STATE });
    if (typeof window !== 'undefined') {
      if (uid) localStorage.removeItem();
      localStorage.removeItem(LOCAL_ECOSYSTEM_KEY);
    }
  }
}));
