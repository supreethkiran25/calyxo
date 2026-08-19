/**
 * Calyxo Universal Health Data Integration - Goal Manager
 * Calculates progress percentages for steps, workouts, active minutes, and calories
 */

const GOALS_STORAGE_KEY = 'calyxo_health_goals';

export class HealthGoalManager {
  static getGoals() {
    if (typeof window === 'undefined') return this.getDefaultGoals();
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      return stored ? { ...this.getDefaultGoals(), ...JSON.parse(stored) } : this.getDefaultGoals();
    } catch (e) {
      return this.getDefaultGoals();
    }
  }

  static getDefaultGoals() {
    return {
      dailySteps: 10000,
      activeCalories: 500,
      activeMinutes: 45,
      weeklyWorkouts: 5,
      targetWeightKg: 70.0
    };
  }

  static updateGoals(newGoals) {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getGoals();
      const updated = { ...current, ...newGoals };
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return this.getGoals();
    }
  }

  static calculateProgress(metrics = {}) {
    const goals = this.getGoals();

    const steps = metrics.steps || 0;
    const calories = metrics.activeCalories || 0;
    const minutes = metrics.activeMinutes || 0;

    return {
      stepsPct: Math.min(100, Math.round((steps / goals.dailySteps) * 100)),
      caloriesPct: Math.min(100, Math.round((calories / goals.activeCalories) * 100)),
      minutesPct: Math.min(100, Math.round((minutes / goals.activeMinutes) * 100)),
      goals
    };
  }
}
