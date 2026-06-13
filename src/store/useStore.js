import { create } from 'zustand';

export const useStore = create((set, get) => ({
  user: null,
  activeTab: 'dashboard',
  theme: 'dark', // Default to dark Obsidian theme
  
  // Data State
  foodLogs: [],
  workoutLogs: [],
  weightLogs: [],
  waterIntake: 0,
  userProfile: {
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
      dyslexiaFont: false
    }
  },

  // Auth Actions
  setUser: (user) => set({ user }),
  
  // Tab Navigation Actions
  setActiveTab: (activeTab) => set({ activeTab }),

  // Theme Actions
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('calyxo_theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('calyxo_theme', 'light');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('calyxo_theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const themeToSet = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      get().setTheme(themeToSet);
    }
  },

  // Syncing & Database setters
  setFoodLogs: (foodLogs) => set({ foodLogs }),
  addFoodLog: (logItem) => set((state) => ({ foodLogs: [logItem, ...state.foodLogs] })),
  deleteFoodLog: (logId) => set((state) => ({
    foodLogs: state.foodLogs.filter((x) => x.id !== logId && x.timestamp !== logId)
  })),

  setWorkoutLogs: (workoutLogs) => set({ workoutLogs }),
  addWorkoutLog: (workout) => set((state) => ({ workoutLogs: [workout, ...state.workoutLogs] })),

  setWeightLogs: (weightLogs) => set({ weightLogs }),
  addWeightLog: (entry) => set((state) => {
    const nextLogs = [...state.weightLogs, entry];
    if (nextLogs.length > 10) nextLogs.shift();
    return { weightLogs: nextLogs };
  }),

  setWaterIntake: (waterIntake) => set({ waterIntake }),
  addWaterIntake: (amount) => set((state) => ({ waterIntake: Math.min(state.waterIntake + amount, 10000) })),
  resetWaterIntake: () => set({ waterIntake: 0 }),

  setUserProfile: (userProfile) => set({ userProfile }),
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
    userProfile: {
      onboarded: false,
      firstName: '',
      lastName: '',
      nickname: '',
      username: '',
      age: 25,
      gender: 'male',
      dob: '',
      weight: 70,
      height: 175,
      goalWeight: 70,
      activity: 1.55,
      goal: 'lose',
      units: 'metric',
      experience: 'beginner',
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
        dyslexiaFont: false
      }
    }
  })
}));
