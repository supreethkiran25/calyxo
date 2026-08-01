import { create } from 'zustand';
import { getSecureItem, setSecureItem, getCurrentUserIdSync } from '../lib/dbService';

const LOCAL_ECOSYSTEM_KEY = "calyxo_ecosystem_state";

const INITIAL_STATE = {
  streaks: { loginStreak: 1, workoutStreak: 0, nutritionStreak: 0, waterStreak: 0, lastCheckIn: new Date().toDateString() },
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
    { id: 'easy_surya_namaskar', tier: 'EASY', name: '15-Day Morning Surya Namaskar', target: 'Complete 12 rounds of Surya Namaskar daily', progress: 3, targetVal: 15, completed: false, unit: 'days' },
    { id: 'easy_walk', tier: 'EASY', name: '5,000 Step Walk', target: 'Walk 5,000 brisk steps every evening after dinner', progress: 4, targetVal: 10, completed: false, unit: 'days' },
    { id: 'medium_10k_steps', tier: 'MEDIUM', name: '10,000 Daily Step Count Master', target: 'Achieve 10,000 total steps daily', progress: 5, targetVal: 14, completed: false, unit: 'days' },
    { id: 'medium_desi_gym', tier: 'MEDIUM', name: 'Desi Gym Muscle Builder', target: 'Complete 20 total strength workout sessions', progress: 6, targetVal: 20, completed: false, unit: 'sessions' },
    { id: 'hard_100k_volume', tier: 'HARD', name: '100,000 KG Heavy Lifters Club', target: 'Lift 100,000 kg total volume across compound lifts', progress: 18500, targetVal: 100000, completed: false, unit: 'kg' },
    { id: 'hard_1000_pushups', tier: 'HARD', name: '1,000 Push-ups Upper Body Challenge', target: 'Complete 1,000 cumulative push-ups over 30 days', progress: 240, targetVal: 1000, completed: false, unit: 'reps' }
  ],
  personality: 'motivational',
  mealScans: [],
  measurementLogs: [],
  xp: 0,
  level: 1,
  clientAssignments: {}
};

const getLocalEcosystemState = () => {
  const saved = getSecureItem(LOCAL_ECOSYSTEM_KEY);
  if (saved) return saved;
  return INITIAL_STATE;
};

const saveLocalEcosystemState = (state) => {
  setSecureItem(LOCAL_ECOSYSTEM_KEY, state);
};

export const useEcosystemStore = create((set, get) => ({
  ...getLocalEcosystemState(),

  // Generic Sync from DB
  syncEcosystemState: (data) => {
    if (data) {
      set({ ...data });
      saveLocalEcosystemState(get());
    }
  },

  // Streaks actions
  checkDailyLoginStreak: () => set((state) => {
    const todayStr = new Date().toDateString();
    const lastCheckIn = state.streaks?.lastCheckIn;

    if (!lastCheckIn) {
      const nextStreaks = { ...(state.streaks || {}), loginStreak: 1, lastCheckIn: todayStr };
      const nextState = { ...state, streaks: nextStreaks };
      saveLocalEcosystemState(nextState);
      return { streaks: nextStreaks };
    }

    if (lastCheckIn === todayStr) {
      return state;
    }

    const lastDate = new Date(lastCheckIn);
    const todayDate = new Date(todayStr);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    let loginStreak = state.streaks?.loginStreak || 1;
    let workoutStreak = state.streaks?.workoutStreak || 0;

    if (diffDays === 1) {
      loginStreak += 1;
    } else if (diffDays > 1) {
      loginStreak = 1;
      workoutStreak = 0;
    }

    const nextStreaks = {
      ...(state.streaks || {}),
      loginStreak,
      workoutStreak,
      lastCheckIn: todayStr
    };

    const nextState = { ...state, streaks: nextStreaks };
    saveLocalEcosystemState(nextState);
    return { streaks: nextStreaks };
  }),

  updateStreaks: (updates) => set((state) => {
    const next = { ...(state.streaks || {}), ...updates };
    const nextState = { ...state, streaks: next };
    saveLocalEcosystemState(nextState);
    return { streaks: next };
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
    const userId = getCurrentUserId();
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

  // Meal scans logs
  addMealScan: (scan) => set((state) => {
    const next = [scan, ...state.mealScans];
    const nextState = { ...state, mealScans: next };
    saveLocalEcosystemState(nextState);
    return { mealScans: next };
  }),

  // Reset store
  resetEcosystemStore: () => {
    set({ ...INITIAL_STATE });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_ECOSYSTEM_KEY);
    }
  }
}));
