import { create } from 'zustand';
import { useEcosystemStore } from './useEcosystemStore';

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
  favoriteFoods: '',
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
  waterTarget: 2500,
  proteinTarget: 120,
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
    dyslexiaFont: false,
    enable3DExperience: true
  }
};

export const useStore = create((set, get) => ({
  user: null,
  activeTab: 'dashboard',
  theme: 'dark', // Default to dark Obsidian theme
  
  // Data State
  foodLogs: [],
  workoutLogs: [],
  weightLogs: [],
  waterIntake: 0,
  userProfile: DEFAULT_USER_PROFILE,

  // Auth Actions
  setUser: (user) => set({ user }),
  
  // Tab Navigation Actions
  setActiveTab: (activeTab) => set({ activeTab }),

  // Theme Actions
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('dark');
      root.removeAttribute('data-theme');

      if (theme === 'dark' || theme === 'obsidian') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'obsidian');
        localStorage.setItem('calyxo_theme', theme);
      } else if (theme === 'solarized') {
        root.setAttribute('data-theme', 'solarized');
        localStorage.setItem('calyxo_theme', 'solarized');
      } else if (theme === 'emerald') {
        root.setAttribute('data-theme', 'emerald');
        localStorage.setItem('calyxo_theme', 'emerald');
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('calyxo_theme', 'light');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const nextTheme = (current === 'dark' || current === 'obsidian') ? 'light' : 'obsidian';
    get().setTheme(nextTheme);
  },

  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('calyxo_theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const themeToSet = savedTheme || (systemPrefersDark ? 'obsidian' : 'light');
      get().setTheme(themeToSet);
    }
  },

  // Syncing & Database setters
  setFoodLogs: (foodLogs) => set({ foodLogs }),
  addFoodLog: (logItem) => set((state) => {
    // Award +50 XP
    useEcosystemStore.getState().addXP(50);
    return { foodLogs: [logItem, ...state.foodLogs] };
  }),
  deleteFoodLog: (logId) => set((state) => ({
    foodLogs: state.foodLogs.filter((x) => x.id !== logId && x.timestamp !== logId)
  })),

  setWorkoutLogs: (workoutLogs) => set({ workoutLogs }),
  addWorkoutLog: (workout) => set((state) => {
    // Award +100 XP
    useEcosystemStore.getState().addXP(100);
    return { workoutLogs: [workout, ...state.workoutLogs] };
  }),

  setWeightLogs: (weightLogs) => set({ weightLogs }),
  addWeightLog: (entry) => set((state) => {
    const nextLogs = [...state.weightLogs, entry];
    if (nextLogs.length > 10) nextLogs.shift();
    return { weightLogs: nextLogs };
  }),

  setWaterIntake: (waterIntake) => set({ waterIntake }),
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

  setUserProfile: (profile) => set((state) => ({
    userProfile: profile 
      ? {
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
        }
      : DEFAULT_USER_PROFILE
  })),
  updateUserProfile: (profileUpdates) => set((state) => ({
    userProfile: { ...state.userProfile, ...profileUpdates }
  })),

  // Clear states on Logout
  resetStore: () => set({
    user: null,
    activeTab: 'dashboard',
    foodLogs: [],
    workoutLogs: [],
    weightLogs: [],
    waterIntake: 0,
    userProfile: DEFAULT_USER_PROFILE
  })
}));
