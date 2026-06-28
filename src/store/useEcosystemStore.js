import { create } from 'zustand';
import { getSecureItem, setSecureItem, getCurrentUserId } from '../lib/dbService';

const LOCAL_ECOSYSTEM_KEY = "calyxo_ecosystem_state";

const getLocalEcosystemState = () => {
  const saved = getSecureItem(LOCAL_ECOSYSTEM_KEY);
  if (saved) return saved;

  return {
    streaks: { loginStreak: 1, workoutStreak: 0, nutritionStreak: 0, waterStreak: 0, lastCheckIn: new Date().toDateString() },
    achievements: [
      { id: 'first_workout', name: 'First Workout', icon: '💪', description: 'Log your first workout session', unlocked: false },
      { id: 'first_meal', name: 'First Meal Logged', icon: '🍽️', description: 'Log your first meal entry', unlocked: false },
      { id: 'first_week', name: 'First Week Complete', icon: '📅', description: 'Log activities for 7 consecutive days', unlocked: false },
      { id: 'streak_7', name: '7 Day Streak', icon: '🔥', description: 'Maintain any log streak for 7 days', unlocked: false },
      { id: 'hydration_hero', name: 'Hydration Hero', icon: '💧', description: 'Hit 3000ml water target in a single day', unlocked: false },
      { id: 'protein_master', name: 'Protein Master', icon: '🍗', description: 'Hit daily protein target of 120g+', unlocked: false },
      { id: 'muscle_builder', name: 'Muscle Builder', icon: '🏋️', description: 'Log at least 10 workout sessions', unlocked: false }
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
      { id: 'fat_loss_30', name: '30 Day Fat Loss Challenge', target: 'Burn 15,000 active calories', progress: 0, targetVal: 15000, completed: false, unit: 'kcal' },
      { id: 'hydration_30', name: '30 Day Hydration Challenge', target: 'Drink 90L of water', progress: 0, targetVal: 90000, completed: false, unit: 'ml' },
      { id: 'pushups_1000', name: '1000 Push-ups Challenge', target: 'Complete 1000 push-ups total', progress: 0, targetVal: 1000, completed: false, unit: 'reps' },
      { id: 'running_50k', name: '50K Running Challenge', target: 'Run 50km total distance', progress: 0, targetVal: 50, completed: false, unit: 'km' }
    ],
    personality: 'motivational',
    mealScans: [],
    measurementLogs: [],
    xp: 0,
    level: 1,
    clientAssignments: {}
  };
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
  updateStreaks: (updates) => set((state) => {
    const next = { ...state.streaks, ...updates };
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
    const userId = getCurrentUserId();
    const oldLevel = state.level || 1;
    if (userId && xpGranted > 0) {
      const achName = next.find(a => a.id === id)?.name || "Achievement";
      import('../lib/socialService').then(m => {
        m.publishActivity(
          userId,
          'achievement',
          'Achievement Unlocked! 🏆',
          `Unlocked a new achievement badge: ${achName}`,
          { achievementId: id, achievementName: achName }
        ).catch(e => console.error(e));
      }).catch(e => console.error(e));
    }

    if (userId && nextLevel > oldLevel) {
      import('../lib/socialService').then(m => {
        m.publishActivity(
          userId,
          'level_up',
          'XP Level Up! ⚡',
          `Leveled up to Level ${nextLevel}! Keep crushing those goals.`,
          { level: nextLevel }
        ).catch(e => console.error(e));
      }).catch(e => console.error(e));
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

    const userId = getCurrentUserId();
    if (userId && nextLevel > oldLevel) {
      import('../lib/socialService').then(m => {
        m.publishActivity(
          userId,
          'level_up',
          'XP Level Up! ⚡',
          `Leveled up to Level ${nextLevel}! Keep crushing those goals.`,
          { level: nextLevel }
        ).catch(e => console.error(e));
      }).catch(e => console.error(e));
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
      import('../lib/socialService').then(m => {
        m.publishActivity(
          userId,
          'challenge',
          'Challenge Completed! 🥇',
          `Successfully completed the challenge: ${nextCh.name}!`,
          { challengeId: id, challengeName: nextCh.name }
        ).catch(e => console.error(e));
      }).catch(e => console.error(e));
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
    const fresh = getLocalEcosystemState();
    set({ ...fresh });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_ECOSYSTEM_KEY);
    }
  }
}));
