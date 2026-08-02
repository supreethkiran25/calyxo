import { create } from 'zustand';

export const useMobileStore = create((set, get) => ({
  // Session & User
  user: null,
  profile: {
    full_name: 'Fitness Member',
    email: '',
    role: 'user',
    target_calories: 2200,
    target_water_ml: 3000,
    target_workouts_per_week: 5,
    current_weight_kg: 72,
    goal_weight_kg: 68,
    fitness_goal: 'weight_loss', // 'weight_loss' | 'muscle_gain' | 'maintenance'
  },
  
  // Daily Metrics State
  todayMetrics: {
    calories_consumed: 1450,
    protein_g: 110,
    carbs_g: 160,
    fats_g: 45,
    water_ml: 2250,
    workouts_completed: 1,
    active_minutes: 45,
    calories_burned: 420,
  },

  // Meals Logged Today
  meals: [
    { id: '1', name: 'Oatmeal & Protein Shake', meal_type: 'Breakfast', calories: 450, protein: 35, carbs: 55, fat: 8, time: '08:30 AM' },
    { id: '2', name: 'Grilled Chicken Salad & Quinoa', meal_type: 'Lunch', calories: 650, protein: 55, carbs: 60, fat: 18, time: '01:15 PM' },
    { id: '3', name: 'Greek Yogurt & Almonds', meal_type: 'Snack', calories: 350, protein: 20, carbs: 45, fat: 19, time: '05:00 PM' }
  ],

  // Workouts Logged Today
  workouts: [
    {
      id: 'w1',
      title: 'Upper Body Strength',
      category: 'Strength',
      duration_minutes: 45,
      calories_burned: 420,
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 10, weight: '70 kg' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight: '22 kg' },
        { name: 'Cable Flyes', sets: 3, reps: 15, weight: '15 kg' }
      ],
      time: '07:00 AM'
    }
  ],

  // AI Assistant Chat Messages
  aiChatMessages: [
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Hello! I am your Calyxo AI Coach. How can I support your fitness, nutrition, or workout goals today?',
      timestamp: 'Just now'
    }
  ],

  isLoading: false,

  // Actions
  setUser: (user) => set({ user }),
  setProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),
  
  addWater: (amountMl) => set((state) => {
    const updatedWater = Math.max(0, state.todayMetrics.water_ml + amountMl);
    return {
      todayMetrics: {
        ...state.todayMetrics,
        water_ml: updatedWater
      }
    };
  }),

  addMeal: (meal) => set((state) => {
    const newMeal = { id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...meal };
    const updatedMeals = [newMeal, ...state.meals];
    const newCal = state.todayMetrics.calories_consumed + Number(meal.calories || 0);
    const newProt = state.todayMetrics.protein_g + Number(meal.protein || 0);
    const newCarb = state.todayMetrics.carbs_g + Number(meal.carbs || 0);
    const newFat = state.todayMetrics.fats_g + Number(meal.fat || 0);

    return {
      meals: updatedMeals,
      todayMetrics: {
        ...state.todayMetrics,
        calories_consumed: newCal,
        protein_g: newProt,
        carbs_g: newCarb,
        fats_g: newFat
      }
    };
  }),

  addWorkout: (workout) => set((state) => {
    const newWorkout = { id: Date.now().toString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...workout };
    const updatedWorkouts = [newWorkout, ...state.workouts];
    return {
      workouts: updatedWorkouts,
      todayMetrics: {
        ...state.todayMetrics,
        workouts_completed: state.todayMetrics.workouts_completed + 1,
        active_minutes: state.todayMetrics.active_minutes + Number(workout.duration_minutes || 30),
        calories_burned: state.todayMetrics.calories_burned + Number(workout.calories_burned || 250)
      }
    };
  }),

  addAIChatMessage: (msg) => set((state) => ({
    aiChatMessages: [...state.aiChatMessages, msg]
  })),

  resetState: () => set({
    user: null,
    profile: { full_name: 'Member', email: '' }
  })
}));
