import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export const WIDGET_DATA_KEY = 'calyxo_widget_data';

export const syncWidgetData = async ({
  calories = 0,
  calorieGoal = 2000,
  protein = 0,
  proteinGoal = 150,
  carbs = 0,
  fat = 0,
  steps = 0,
  water = 0,
  waterGoal = 2500,
  streak = 0,
  activeWorkout = null
} = {}) => {
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
    activeWorkoutName: activeWorkout ? activeWorkout.name : '',
    activeWorkoutDuration: activeWorkout ? activeWorkout.duration : 0
  };

  try {
    // 1. Save locally in Capacitor Preferences
    await Preferences.set({
      key: WIDGET_DATA_KEY,
      value: JSON.stringify(payload)
    });

    // 2. On iOS Native, bridge directly to App Group UserDefaults & WidgetKit
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
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
        console.log('[WidgetDataService] Synced with iOS App Group & WidgetKit:', payload);
      }
    } else if (Capacitor.isNativePlatform()) {
      console.log('[WidgetDataService] Native Widget Data Synced:', payload);
    }
  } catch (err) {
    console.error('[WidgetDataService] Failed to sync widget data:', err);
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
