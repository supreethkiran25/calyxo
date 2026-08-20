import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { useStore } from '../store/useStore';
import { isToday, getTodayDateString, isSameLocalDate } from '../utils/dateUtils';

export const WIDGET_DATA_KEY = 'calyxo_widget_data';

export const syncWidgetData = async (customData = {}) => {
  // 1. Read current real state from useStore if available
  let stateCalories = null;
  let stateProtein = null;
  let stateCarbs = null;
  let stateFat = null;
  let stateWater = null;
  let stateCalGoal = null;
  let stateProtGoal = null;
  let stateWaterGoal = null;
  let stateStreak = null;

  try {
    const storeState = useStore?.getState ? useStore.getState() : null;
    if (storeState) {
      const foodLogs = storeState.foodLogs || [];
      const todayStr = getTodayDateString();
      const todaysLogs = foodLogs.filter(x => isSameLocalDate(x.timestamp, todayStr) || isToday(x.timestamp));

      stateCalories = todaysLogs.reduce((s, x) => s + (Number(x.calories) || 0), 0);
      stateProtein = todaysLogs.reduce((s, x) => s + (Number(x.protein) || 0), 0);
      stateCarbs = todaysLogs.reduce((s, x) => s + (Number(x.carbs) || 0), 0);
      stateFat = todaysLogs.reduce((s, x) => s + (Number(x.fat) || 0), 0);
      stateWater = Number(storeState.waterIntake || 0);

      const userProfile = storeState.userProfile;
      stateCalGoal = Number(userProfile?.calorieGoal || userProfile?.dailyCalories || 2000);
      stateProtGoal = Number(userProfile?.proteinGoal || 150);
      stateWaterGoal = Number(userProfile?.waterGoal || 2500);
      stateStreak = Number(userProfile?.streak || 0);
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
    : (prev?.steps || 0);

  const water = customData.water !== undefined 
    ? customData.water 
    : (stateWater !== null ? stateWater : (prev?.water || 0));

  const waterGoal = customData.waterGoal !== undefined 
    ? customData.waterGoal 
    : (stateWaterGoal !== null ? stateWaterGoal : (prev?.waterGoal || 2500));

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
        await CalyxoWidget.syncWidgetData({
          calories: payload.calories,
          calorieGoal: payload.calorieGoal,
          protein: payload.protein,
          proteinGoal: payload.proteinGoal,
          carbs: payload.carbs,
          fat: payload.fat,
          steps: payload.steps,
          water: payload.water,
          waterGoal: payload.waterGoal,
          streak: payload.streak,
          activeWorkoutName: payload.activeWorkoutName
        });
        console.log('[WidgetDataService] Synced with Native Widgets (iOS & Android):', payload);
      }
    }
  } catch (err) {
    console.error('[WidgetDataService] Failed to sync widget data:', err);
  }
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
          water: 0,
          waterGoal: 2500,
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

export const pinWidgetToHomeScreen = async () => {
  if (Capacitor.isNativePlatform()) {
    const { CalyxoWidget } = Capacitor.Plugins;
    if (CalyxoWidget && CalyxoWidget.pinWidget) {
      return await CalyxoWidget.pinWidget();
    }
  }
  return { supported: false, success: false };
};
