import { create } from 'zustand';
import { useEcosystemStore } from './useEcosystemStore';
import { applyAppearanceSettings, loadSavedAppearance } from '../utils/appearanceUtils';

const DEFAULT_USER_PROFILE = {
  onboarded: false,
  firstName: '',
  lastName: '',
  nickname: '',
  username: '',
  age: 25,
  gender: 'male',
  dob: '',
  weight: 70, // in kg
  height: 175, // in cm
  goalWeight: 70, // in kg
  activity: 1.55,
  goal: 'lose',
  units: 'metric',
  experience: 'beginner',
  // Dietary
  dietPreferences: [],
  allergies: '',
  medicalRestrictions: '',
  foodDislikes: '',
  favoriteFoods: [],
  // Coach Settings
  coachPersonality: 'motivational',
  responseLength: 'short',
  coachingStyle: 'supportive',
  motivationLevel: 'gentle',
  reminderFrequency: 'daily',
  aiMemoryEnabled: true,
  // Notifications
  notifications: { 
    workout: true, 
    meal: true, 
    hydration: true, 
    checkins: true, 
    challenges: true, 
    achievements: true,
    weeklyReports: true,
    monthlyReports: true
  },
  notificationFrequency: 'daily',
  analyticsTracking: true,
  photoURL: '',
  // Health Targets
  dailyCalories: 2000,
  calorieGoal: 2000,
  waterTarget: 2500,
  proteinTarget: 120,
  protein: 120,
  carbs: 230,
  fat: 65,
  targetMacros: { protein: 120, carbs: 230, fat: 65 },
  subscriptionPlan: 'FREE',
  // Privacy
  aiDataUsage: true,
  personalizedRecommendations: true,
  performanceTracking: true,
  marketingCommunications: false,
  appearance: {
    bgEffectsEnabled: false,
    bgStyle: 'minimal',
    animationIntensity: 'medium',
    performanceMode: 'auto',
    reduceMotion: false,
    themeMode: 'system',
    largeTextMode: false,
    highContrastMode: false,
    enable3DExperience: true
  },

  bio: '',
  website: '',
  coverImage: ''
};

export const useStore = create((set, get) => ({
  user: null,
  activeTab: 'dashboard',
  theme: typeof window !== 'undefined' ? (localStorage.getItem('calyxo_theme') || 'dark') : 'dark',
  
  // Data State
  foodLogs: [],
  workoutLogs: [],
  weightLogs: [],
  waterIntake: 0,
  userProfile: DEFAULT_USER_PROFILE,
  favoriteExercises: typeof window !== 'undefined' ? (() => {
    try {
      return JSON.parse(localStorage.getItem('calyxo_favorite_exercises') || '[]');
    } catch(e) { return []; }
  })() : [],
  recentlyViewedExercises: typeof window !== 'undefined' ? (() => {
    try {
      return JSON.parse(localStorage.getItem('calyxo_recent_exercises') || '[]');
    } catch(e) { return []; }
  })() : [],

  // Auth Actions
  setUser: (user) => set({ user }),
  
  // Tab Navigation Actions
  setActiveTab: (activeTab) => set({ activeTab }),

  // Theme & Appearance Actions
  setTheme: (theme) => {
    const currentApp = get().userProfile?.appearance || {};
    applyAppearanceSettings({
      ...currentApp,
      theme
    });

    set((state) => ({
      theme,
      userProfile: {
        ...state.userProfile,
        appearance: {
          ...(state.userProfile?.appearance || {}),
          themeMode: theme
        }
      }
    }));
  },

  toggleTheme: () => {
    const current = get().theme;
    const nextTheme = (current === 'dark' || current === 'obsidian') ? 'light' : 'obsidian';
    get().setTheme(nextTheme);
  },

  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = loadSavedAppearance();
      const currentApp = get().userProfile?.appearance || {};
      applyAppearanceSettings({
        ...currentApp,
        theme: saved.theme || 'dark',
        largeText: currentApp.largeTextMode ?? saved.largeText,
        highContrast: currentApp.highContrastMode ?? saved.highContrast,
        reduceMotion: currentApp.reduceMotion ?? saved.reduceMotion
      });
      set({ theme: saved.theme || 'dark' });
    }
  },

  // Syncing & Database setters
  setFoodLogs: (foodLogs) => set({ foodLogs }),
  addFoodLog: (logItem) => set((state) => {
    // Award +50 XP
    useEcosystemStore.getState().addXP(50);
    return { foodLogs: [logItem, ...state.foodLogs] };
  }),
  updateFoodLog: (logId, updatedData) => set((state) => ({
    foodLogs: state.foodLogs.map(x => (x.id === logId || x.timestamp === logId) ? { ...x, ...updatedData } : x)
  })),
  deleteFoodLog: (logId) => set((state) => ({
    foodLogs: state.foodLogs.filter((x) => x.id !== logId && x.timestamp !== logId)
  })),

  setWorkoutLogs: (workoutLogs) => set({ workoutLogs }),
  addWorkoutLog: (workout) => set((state) => {
    // Award +100 XP
    useEcosystemStore.getState().addXP(100);
    return { workoutLogs: [workout, ...state.workoutLogs] };
  }),
  updateWorkoutLog: (logId, updatedData) => set((state) => ({
    workoutLogs: state.workoutLogs.map(x => (x.id === logId || x.timestamp === logId) ? { ...x, ...updatedData } : x)
  })),
  deleteWorkoutLog: (logId) => set((state) => ({
    workoutLogs: state.workoutLogs.filter((x) => x.id !== logId && x.timestamp !== logId)
  })),

  setWeightLogs: (weightLogs) => set({ weightLogs }),
  addWeightLog: (entry) => set((state) => ({
    weightLogs: [...state.weightLogs, entry]
  })),

  waterLogDate: typeof window !== 'undefined' ? new Date().toDateString() : '',

  checkDailyReset: () => set((state) => {
    const today = new Date().toDateString();
    if (state.waterLogDate && state.waterLogDate !== today) {
      return { waterIntake: 0, waterLogDate: today };
    }
    return { waterLogDate: today };
  }),

  setWaterIntake: (waterIntake) => set({ waterIntake, waterLogDate: new Date().toDateString() }),
  addWaterIntake: (amount) => set((state) => {
    const prevWater = state.waterIntake;
    const target = state.userProfile?.waterTarget || 2500;
    const nextWater = Math.min(prevWater + amount, 10000);
    if (prevWater < target && nextWater >= target) {
      // Crossed target! Award +30 XP
      useEcosystemStore.getState().addXP(30);
    }
    return { waterIntake: nextWater };
  }),
  resetWaterIntake: () => set({ waterIntake: 0 }),

  // Trainer Data
  trainerClients: [],
  setTrainerClients: (clients) => set({ trainerClients: clients }),
  setUserProfile: (profile) => set((state) => {
    const raw = profile ? {
      ...DEFAULT_USER_PROFILE,
      ...profile,
      notifications: {
        ...DEFAULT_USER_PROFILE.notifications,
        ...(profile.notifications || {})
      },
      appearance: {
        ...DEFAULT_USER_PROFILE.appearance,
        ...(profile.appearance || {})
      }
    } : DEFAULT_USER_PROFILE;

    const targetCals = Number(raw.calorieGoal || raw.dailyCalories || raw.calTarget || 2000);
    const targetProt = Number(raw.proteinGoal || raw.proteinTarget || raw.protein || raw.protTarget || 120);
    const targetWater = Number(raw.waterGoal || raw.waterTarget || 3000);

    return {
      userProfile: {
        ...raw,
        calorieGoal: targetCals,
        dailyCalories: targetCals,
        calTarget: targetCals,
        proteinGoal: targetProt,
        proteinTarget: targetProt,
        protein: targetProt,
        protTarget: targetProt,
        waterGoal: targetWater,
        waterTarget: targetWater
      }
    };
  }),
  updateUserProfile: (profileUpdates) => set((state) => {
    const raw = { ...state.userProfile, ...profileUpdates };
    const targetCals = Number(raw.calorieGoal || raw.dailyCalories || raw.calTarget || 2000);
    const targetProt = Number(raw.proteinGoal || raw.proteinTarget || raw.protein || raw.protTarget || 120);
    const targetWater = Number(raw.waterGoal || raw.waterTarget || 3000);

    return {
      userProfile: {
        ...raw,
        calorieGoal: targetCals,
        dailyCalories: targetCals,
        calTarget: targetCals,
        proteinGoal: targetProt,
        proteinTarget: targetProt,
        protein: targetProt,
        protTarget: targetProt,
        waterGoal: targetWater,
        waterTarget: targetWater
      }
    };
  }),

  toggleFavoriteExercise: (id) => set((state) => {
    const isFav = state.favoriteExercises.includes(id);
    const nextFavs = isFav 
      ? state.favoriteExercises.filter(x => x !== id)
      : [...state.favoriteExercises, id];
    if (typeof window !== 'undefined') {
      localStorage.setItem('calyxo_favorite_exercises', JSON.stringify(nextFavs));
    }
    return { favoriteExercises: nextFavs };
  }),

  addRecentlyViewedExercise: (id) => set((state) => {
    const filtered = state.recentlyViewedExercises.filter(x => x !== id);
    const nextRecents = [id, ...filtered].slice(0, 10);
    if (typeof window !== 'undefined') {
      localStorage.setItem('calyxo_recent_exercises', JSON.stringify(nextRecents));
    }
    return { recentlyViewedExercises: nextRecents };
  }),

  // Clear states on Logout
  resetStore: () => set({
    user: null,
    activeTab: 'dashboard',
    foodLogs: [],
    workoutLogs: [],
    weightLogs: [],
    waterIntake: 0,
    userProfile: DEFAULT_USER_PROFILE,
    favoriteExercises: [],
    recentlyViewedExercises: []
  })
}));
