import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { useStore } from '../store/useStore.js';
import { isToday, getTodayDateString, isSameLocalDate } from '../utils/dateUtils.js';
import { getCurrentUserIdSync, getAuthTokenSync } from '../lib/dbService.js';
import { supabase } from '../lib/supabaseClient.js';

export const WIDGET_DATA_KEY = 'calyxo_widget_data';
export const WIDGET_CONFIG_KEY = 'calyxo_widget_customization';

export const DEFAULT_WIDGET_CONFIG = {
  theme: 'emerald', // 'emerald' | 'obsidian' | 'cyberpunk' | 'solar' | 'cosmic' | 'frosted'
  size: 'medium',   // 'small' | 'medium' | 'large' | 'lockscreen'
  type: 'rings',    // 'rings' | 'steps' | 'nutrition' | 'hydration' | 'workout'
  showStreak: true,
  showGlow: true,
  showLabels: true,
  ringPriority: 'quad', // 'quad' | 'steps' | 'calories' | 'hydration'
  updatedAt: new Date().toISOString()
};

export const syncWidgetData = async (customData = {}) => {
  // 1. Read current real state from useStore and pedometer cache
  let stateCalories = null;
  let stateProtein = null;
  let stateCarbs = null;
  let stateFat = null;
  let stateWater = null;
  let stateCalGoal = null;
  let stateProtGoal = null;
  let stateWaterGoal = null;
  let stateStreak = null;
  let stateSteps = null;
  let stateStepGoal = null;

  try {
    const storeState = useStore?.getState ? useStore.getState() : null;
    const todayStr = getTodayDateString();

    if (storeState) {
      const foodLogs = storeState.foodLogs || [];
      const todaysLogs = foodLogs.filter(x => isSameLocalDate(x.timestamp, todayStr) || isToday(x.timestamp));

      stateCalories = todaysLogs.reduce((s, x) => s + (Number(x.calories) || 0), 0);
      stateProtein = todaysLogs.reduce((s, x) => s + (Number(x.protein) || 0), 0);
      stateCarbs = todaysLogs.reduce((s, x) => s + (Number(x.carbs) || 0), 0);
      stateFat = todaysLogs.reduce((s, x) => s + (Number(x.fat) || 0), 0);
      stateWater = Number(storeState.waterIntake || 0);

      const userProfile = storeState.userProfile;
      stateCalGoal = Number(userProfile?.calorieGoal || userProfile?.dailyCalories || 2000);
      stateProtGoal = Number(userProfile?.proteinGoal || 150);
      stateWaterGoal = Number(userProfile?.waterGoal || userProfile?.waterTarget || 3000);
      stateStepGoal = Number(userProfile?.stepGoal || userProfile?.dailySteps || 10000);
      stateStreak = Number(userProfile?.streak || 0);
    }

    // Try reading real step count from localStorage / health sync cache
    if (typeof localStorage !== 'undefined') {
      try {
        const pedometerKey = 'calyxo_pedometer_steps_' + todayStr;
        const storedSteps = localStorage.getItem(pedometerKey);
        if (storedSteps !== null) {
          const parsed = parseInt(storedSteps, 10);
          if (!isNaN(parsed) && parsed >= 0) stateSteps = parsed;
        }

        if (stateSteps === null) {
          const healthCacheRaw = localStorage.getItem('calyxo_health_metrics');
          if (healthCacheRaw) {
            const h = JSON.parse(healthCacheRaw);
            if (h && typeof h.steps === 'number') stateSteps = h.steps;
            if (h && typeof h.stepGoal === 'number' && !stateStepGoal) stateStepGoal = h.stepGoal;
          }
        }
      } catch (e) {}
    }
  } catch (e) {
    // Non-fatal fallback
  }

  // 2. Read previous widget data to preserve existing non-zero values
  let prev = null;
  try {
    const { value } = await Preferences.get({ key: WIDGET_DATA_KEY });
    if (value) prev = JSON.parse(value);
  } catch (e) {}

  const calories = customData.calories !== undefined 
    ? customData.calories 
    : (stateCalories !== null ? stateCalories : (prev?.calories || 0));

  const calorieGoal = customData.calorieGoal !== undefined 
    ? customData.calorieGoal 
    : (stateCalGoal !== null ? stateCalGoal : (prev?.calorieGoal || 2000));

  const protein = customData.protein !== undefined 
    ? customData.protein 
    : (stateProtein !== null ? stateProtein : (prev?.protein || 0));

  const proteinGoal = customData.proteinGoal !== undefined 
    ? customData.proteinGoal 
    : (stateProtGoal !== null ? stateProtGoal : (prev?.proteinGoal || 150));

  const carbs = customData.carbs !== undefined 
    ? customData.carbs 
    : (stateCarbs !== null ? stateCarbs : (prev?.carbs || 0));

  const fat = customData.fat !== undefined 
    ? customData.fat 
    : (stateFat !== null ? stateFat : (prev?.fat || 0));

  const steps = customData.steps !== undefined 
    ? customData.steps 
    : (stateSteps !== null ? stateSteps : (prev?.steps || 0));

  const stepGoal = customData.stepGoal !== undefined
    ? customData.stepGoal
    : (stateStepGoal !== null ? stateStepGoal : (prev?.stepGoal || 10000));

  const water = customData.water !== undefined 
    ? customData.water 
    : (stateWater !== null ? stateWater : (prev?.water || 0));

  const waterGoal = customData.waterGoal !== undefined 
    ? customData.waterGoal 
    : (stateWaterGoal !== null ? stateWaterGoal : (prev?.waterGoal || 3000));

  const streak = customData.streak !== undefined 
    ? customData.streak 
    : (stateStreak !== null ? stateStreak : (prev?.streak || 0));

  const activeWorkoutName = customData.activeWorkout 
    ? (customData.activeWorkout.name || '') 
    : (customData.activeWorkoutName !== undefined ? customData.activeWorkoutName : (prev?.activeWorkoutName || ''));

  const payload = {
    updatedAt: new Date().toISOString(),
    calories: Math.round(calories),
    calorieGoal: Math.round(calorieGoal),
    protein: Math.round(protein),
    proteinGoal: Math.round(proteinGoal),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    steps: Math.round(steps),
    stepGoal: Math.round(stepGoal),
    water: Math.round(water),
    waterGoal: Math.round(waterGoal),
    streak: Math.max(0, streak),
    activeWorkoutName
  };

  try {
    // Save locally in Capacitor Preferences
    await Preferences.set({
      key: WIDGET_DATA_KEY,
      value: JSON.stringify(payload)
    });

    // Bridge directly to Native App Group UserDefaults / SharedPreferences & Widgets
    if (Capacitor.isNativePlatform()) {
      const { CalyxoWidget } = Capacitor.Plugins;
      if (CalyxoWidget) {
        let userId = '';
        let authToken = '';
        try {
          userId = getCurrentUserIdSync();
          authToken = getAuthTokenSync();
        } catch (e) {}

        const supabaseUrl = supabase?.supabaseUrl || 'https://nwcatvlfoayzrwatvyrf.supabase.co';
        const supabaseAnonKey = supabase?.supabaseKey || '';

        await CalyxoWidget.syncWidgetData({
          calories: payload.calories,
          calorieGoal: payload.calorieGoal,
          protein: payload.protein,
          proteinGoal: payload.proteinGoal,
          carbs: payload.carbs,
          fat: payload.fat,
          steps: payload.steps,
          stepGoal: payload.stepGoal,
          water: payload.water,
          waterGoal: payload.waterGoal,
          streak: payload.streak,
          activeWorkoutName: payload.activeWorkoutName,
          supabaseUrl,
          supabaseAnonKey,
          userId: userId || '',
          authToken: authToken || ''
        });
        console.log('[WidgetDataService] Synced with Native Widgets (iOS & Android):', payload);
      }
    }
  } catch (err) {
    console.error('[WidgetDataService] Failed to sync widget data:', err);
  }

  return payload;
};

export const forceWidgetSync = async (customData = {}) => {
  return await syncWidgetData(customData);
};

export const clearWidgetData = async () => {
  try {
    await Preferences.remove({ key: WIDGET_DATA_KEY });

    if (Capacitor.isNativePlatform()) {
      const { CalyxoWidget } = Capacitor.Plugins;
      if (CalyxoWidget && CalyxoWidget.clearWidgetData) {
        await CalyxoWidget.clearWidgetData();
      } else if (CalyxoWidget && CalyxoWidget.syncWidgetData) {
        await CalyxoWidget.syncWidgetData({
          calories: 0,
          calorieGoal: 2000,
          protein: 0,
          proteinGoal: 150,
          carbs: 0,
          fat: 0,
          steps: 0,
          stepGoal: 10000,
          water: 0,
          waterGoal: 3000,
          streak: 0,
          activeWorkoutName: ''
        });
      }
      console.log('[WidgetDataService] Widget data cleared on signout (iOS & Android).');
    }
  } catch (err) {
    console.warn('[WidgetDataService] Failed to clear widget data:', err);
  }
};

export const getWidgetData = async () => {
  try {
    const { value } = await Preferences.get({ key: WIDGET_DATA_KEY });
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('[WidgetDataService] Failed to get widget data:', err);
    return null;
  }
};

export const saveWidgetCustomization = async (config) => {
  try {
    const merged = { ...DEFAULT_WIDGET_CONFIG, ...config, updatedAt: new Date().toISOString() };
    await Preferences.set({
      key: WIDGET_CONFIG_KEY,
      value: JSON.stringify(merged)
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch (err) {
    console.warn('[WidgetDataService] Failed to save widget customization:', err);
    return DEFAULT_WIDGET_CONFIG;
  }
};

export const getWidgetCustomization = async () => {
  try {
    const { value } = await Preferences.get({ key: WIDGET_CONFIG_KEY });
    if (value) return JSON.parse(value);
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(WIDGET_CONFIG_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch (err) {}
  return DEFAULT_WIDGET_CONFIG;
};

export const pinWidgetToHomeScreen = async () => {
  if (Capacitor.isNativePlatform()) {
    const { CalyxoWidget } = Capacitor.Plugins;
    if (CalyxoWidget && CalyxoWidget.pinWidget) {
      return await CalyxoWidget.pinWidget();
    }
  }
  return { supported: false, success: false };
};
