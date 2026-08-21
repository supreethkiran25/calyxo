/**
 * Calyxo Plan-to-App Action Bridge
 *
 * Bridges structured AI-generated plans directly into active application subsystems:
 * - Workout Routine Builder & 7-Day Workout Splits in Workout Section
 * - Daily Nutrition Targets & Meal Logger
 * - Real-Life Challenge Engine
 */

import { saveUserProfile, saveEcosystemState, getUserWorkoutSplits, saveUserWorkoutSplits } from '../../lib/dbService.js';
import { useEcosystemStore } from '../../store/useEcosystemStore.js';

export class PlanToActionBridge {
  /**
   * Inject AI Workout Plan into Active Workout Builder & 7-Day Splits
   */
  static async applyWorkoutPlan(plan, { user, userProfile, onNotification }) {
    if (!plan) {
      throw new Error('Invalid workout plan structure.');
    }

    try {
      const uid = user?.uid || user?.id;
      const ecoStore = useEcosystemStore.getState();
      const existingRoutines = ecoStore.customRoutines || [];
      const newRoutine = {
        id: `ai_routine_${Date.now()}`,
        name: plan.injectionPayload?.name || plan.title || 'AI Custom Workout',
        duration: plan.injectionPayload?.duration || plan.durationMinutes || 45,
        source: 'Calyxo AI',
        createdAt: new Date().toISOString(),
        exercises: plan.injectionPayload?.exercises || plan.exercises || []
      };

      const updatedRoutines = [newRoutine, ...existingRoutines];
      ecoStore.setCustomRoutines?.(updatedRoutines);

      // Map to 7-Day Workout Splits for the Workout Section
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      let updatedSplits = null;

      if (plan.isWeeklyProgram && Array.isArray(plan.days) && plan.days.length === 7) {
        updatedSplits = plan.days.map((d, idx) => ({
          dayName: dayNames[idx] || d.dayName || `Day ${idx + 1}`,
          workout: {
            type: d.dayName || d.focus || `Day ${idx + 1} Workout`,
            desc: d.focus || `${d.durationMinutes || 45} mins routine`,
            exercises: (d.exercises || []).map(ex => ({
              name: ex.name,
              details: `${ex.sets} sets × ${ex.reps}. Rest: ${ex.restSeconds || 60}s.`
            }))
          }
        }));
      } else {
        let currentSplits = await getUserWorkoutSplits(uid);
        if (!Array.isArray(currentSplits) || currentSplits.length !== 7) {
          try {
            const saved = localStorage.getItem('calyxo_user_workout_splits');
            currentSplits = saved ? JSON.parse(saved) : null;
          } catch (e) {}
        }
        if (!Array.isArray(currentSplits) || currentSplits.length !== 7) {
          currentSplits = dayNames.map(dName => ({
            dayName: dName,
            workout: { type: 'General Training', desc: 'Custom Workout', exercises: [] }
          }));
        }

        const todayDayIndex = (new Date().getDay() + 6) % 7; // 0 = Monday, 6 = Sunday
        const exercisesToInject = plan.exercises || plan.injectionPayload?.exercises || [];
        
        currentSplits[todayDayIndex] = {
          dayName: currentSplits[todayDayIndex]?.dayName || dayNames[todayDayIndex],
          workout: {
            type: plan.injectionPayload?.name || plan.title || 'AI Custom Workout',
            desc: `${plan.durationMinutes || 45} mins targeted routine`,
            exercises: exercisesToInject.map(ex => ({
              name: ex.name,
              details: `${ex.sets || 3} sets × ${ex.reps || '10-12'}. Rest: ${ex.restSeconds || 60}s.`
            }))
          }
        };
        updatedSplits = [...currentSplits];
      }

      if (updatedSplits) {
        await saveUserWorkoutSplits(uid, updatedSplits);
        try {
          localStorage.setItem('calyxo_user_workout_splits', JSON.stringify(updatedSplits));
          if (uid) localStorage.setItem(`calyxo_user_workout_splits_${uid}`, JSON.stringify(updatedSplits));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('calyxo:workout_splits_updated', { detail: updatedSplits }));
        }
      }

      if (uid) {
        await saveEcosystemState(uid, {
          ...ecoStore,
          customRoutines: updatedRoutines,
          coachingPlan: plan
        });
      }

      if (onNotification) {
        onNotification(`"${newRoutine.name}" applied to your Workout schedule!`);
      }

      return {
        success: true,
        routine: newRoutine,
        splits: updatedSplits,
        message: `Workout plan "${newRoutine.name}" successfully applied to your Workout Section.`
      };
    } catch (err) {
      console.error('Failed to inject workout plan:', err);
      if (onNotification) {
        onNotification('Failed to save workout plan. Please try again.');
      }
      return { success: false, error: err.message };
    }
  }

  /**
   * Inject AI Nutrition Plan into User Profile & Daily Tracker
   */
  static async applyNutritionPlan(plan, { user, userProfile, updateUserProfile, onNotification }) {
    if (!plan || !plan.injectionPayload) {
      throw new Error('Invalid nutrition plan structure.');
    }

    try {
      const payload = plan.injectionPayload;
      const updatedProfile = {
        ...userProfile,
        dailyCalories: payload.dailyCalories || userProfile.dailyCalories || 2000,
        calorieGoal: payload.dailyCalories || userProfile.calorieGoal || 2000,
        proteinTarget: payload.proteinTarget || userProfile.proteinTarget || 140,
        dietPreferences: [plan.dietType || 'standard'],
        aiMealPlan: plan
      };

      if (updateUserProfile) {
        updateUserProfile(updatedProfile);
      }

      if (user?.uid) {
        await saveUserProfile(user.uid, updatedProfile);
      }

      if (onNotification) {
        onNotification(`Daily nutrition targets updated to ${updatedProfile.dailyCalories} kcal & ${updatedProfile.proteinTarget}g protein!`);
      }

      return {
        success: true,
        profile: updatedProfile,
        message: 'Nutrition targets and meal blueprint applied successfully.'
      };
    } catch (err) {
      console.error('Failed to inject nutrition plan:', err);
      if (onNotification) {
        onNotification('Failed to save nutrition targets. Please try again.');
      }
      return { success: false, error: err.message };
    }
  }
}

export const planToActionBridge = PlanToActionBridge;
export default PlanToActionBridge;
