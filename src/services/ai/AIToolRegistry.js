/**
 * Calyxo Deterministic AI Tool Registry
 *
 * Provides grounded, clinically deterministic calculation engines for AI:
 * - Mifflin-St Jeor Energy Balance & Macronutrient Formulas
 * - Deterministic Physiological Fitness Age Engine
 * - Deterministic Neurological & Metabolic Recovery Engine
 * - Authentic Cumulative Workout Volume & Tonnage
 * - Grounded Weekly and Daily Workout Routine Generators
 * - Structured Nutrition Blueprint Generator
 */

import { calculateDeterministicRecovery } from '../health/DeterministicRecoveryEngine.js';
import { calculateDeterministicFitnessAge } from '../health/DeterministicFitnessAgeEngine.js';
import { ExplainableAICoachService } from './ExplainableAICoachService.js';
import { getTodayDateString, isSameLocalDate, parseSafeDate } from '../../utils/dateUtils.js';
import { calculateConsecutiveDaysStreak } from '../../utils/streakEngine.js';

export class AIToolRegistry {
  /**
   * 1. Get Live Authentic Health Telemetry
   */
  static getCurrentHealth(healthLogs = {}) {
    return {
      heartRate: healthLogs.liveHeartRate || healthLogs.heartRate || null,
      restingHeartRate: healthLogs.restingHeartRate || null,
      steps: healthLogs.steps || 0,
      sleepHours: healthLogs.sleep || null,
      bloodPressure: healthLogs.bloodPressure || null,
      source: healthLogs.source || 'Calyxo Logs',
      freshness: healthLogs.freshness || 'Verified',
      isLive: healthLogs.isLive || false
    };
  }

  /**
   * 2. Calculate Explainable Recovery Score
   */
  static getRecoveryAnalysis({
    sleepHours = 0,
    waterMl = 0,
    waterGoalMl = 3000,
    proteinGrams = 0,
    proteinGoalGrams = 130,
    soreness = 3,
    fatigue = 3,
    restingHR = 0,
    hasLoggedWorkoutToday = false
  }) {
    const recoveryResult = calculateDeterministicRecovery({
      sleepHours,
      waterMl,
      waterGoalMl,
      proteinGrams,
      proteinGoalGrams,
      soreness,
      fatigue,
      restingHR,
      hasLoggedWorkoutToday
    });

    if (!recoveryResult.available) {
      return {
        available: false,
        score: null,
        status: 'INSUFFICIENT_DATA',
        reasons: ['No qualifying biometrics logged today.'],
        recommendation: 'Log sleep, hydration, or biometrics to compute your recovery readiness.'
      };
    }

    const explanation = ExplainableAICoachService.explainRecoveryChange({
      sleepHours,
      waterMl,
      waterGoalMl,
      proteinGrams,
      proteinGoalGrams,
      soreness,
      fatigue,
      restingHR,
      hasLoggedWorkoutToday
    });

    return {
      available: true,
      score: recoveryResult.score,
      status: recoveryResult.status || recoveryResult.readiness,
      readiness: recoveryResult.readiness,
      breakdown: recoveryResult.breakdown,
      reasons: explanation.reasons || [],
      recommendation: recoveryResult.recommendation
    };
  }

  /**
   * 3. Calculate Deterministic Physiological Fitness Age
   */
  static getFitnessAge({
    chronologicalAge,
    trainingYears = 0,
    monthlyWorkouts = 0,
    restingHR = 0,
    vo2Max = 0
  }) {
    return calculateDeterministicFitnessAge({
      chronologicalAge,
      trainingYears,
      monthlyWorkouts,
      restingHR,
      vo2Max
    });
  }

  /**
   * 4. Calculate Energy & Macro Targets (Mifflin-St Jeor Equation)
   */
  static calculateCalorieAndMacroTargets({
    weightKg = 70,
    heightCm = 175,
    age = 25,
    gender = 'male',
    activityLevel = 1.55,
    goal = 'maintain',
    dietPreference = 'standard'
  }) {
    let bmr = (10 * Number(weightKg)) + (6.25 * Number(heightCm)) - (5 * Number(age));
    if (gender.toLowerCase() === 'female') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    const tdee = Math.round(bmr * Number(activityLevel));
    let targetCalories = tdee;

    if (goal === 'lose' || goal === 'fat_loss') {
      targetCalories = Math.max(1200, Math.round(tdee - 450));
    } else if (goal === 'gain' || goal === 'muscle_gain' || goal === 'hypertrophy') {
      targetCalories = Math.round(tdee + 350);
    }

    let proteinGrams = Math.round(Number(weightKg) * (goal.includes('lose') ? 2.2 : 2.0));
    if (dietPreference === 'vegetarian' || dietPreference === 'vegan') {
      proteinGrams = Math.round(Number(weightKg) * 2.0);
    }

    const fatCalories = targetCalories * 0.25;
    const fatGrams = Math.round(fatCalories / 9);

    const proteinCalories = proteinGrams * 4;
    const remainingCarbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbGrams = Math.round(remainingCarbCalories / 4);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      macros: {
        protein: proteinGrams,
        carbs: carbGrams,
        fat: fatGrams
      },
      goal,
      formula: 'Mifflin-St Jeor Clinical Standard'
    };
  }

  /**
   * 5. Calculate Cumulative Workout Volume & Tonnage
   */
  static calculateWorkoutVolume(workoutLogs = []) {
    let totalTonnageKg = 0;
    let totalSets = 0;
    let totalReps = 0;
    const exerciseVolumes = {};

    (workoutLogs || []).forEach(workout => {
      (workout.sets || []).forEach(set => {
        if (set.completed || (set.weight > 0 && set.reps > 0)) {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          const vol = w * r;
          totalTonnageKg += vol;
          totalSets += 1;
          totalReps += r;

          const exName = set.exerciseName || workout.name || 'General Exercise';
          exerciseVolumes[exName] = (exerciseVolumes[exName] || 0) + vol;
        }
      });
    });

    return {
      totalTonnageKg: Math.round(totalTonnageKg * 10) / 10,
      totalSets,
      totalReps,
      exerciseBreakdown: exerciseVolumes,
      sessionCount: workoutLogs.length
    };
  }

  /**
   * 6. Generate Anatomically Accurate Single-Day Workout Plan
   */
  static generateWorkoutPlan({
    goal = 'hypertrophy',
    experience = 'intermediate',
    durationMinutes = 45,
    availableEquipment = 'full_gym',
    focusSplit = 'Upper Body Power'
  }) {
    const focus = focusSplit.toLowerCase();

    const catalog = {
      chest_triceps: {
        full_gym: [
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', restSeconds: 90, targetMuscle: 'Chest' },
          { name: 'Incline Dumbbell Chest Press', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Upper Chest' },
          { name: 'Cable Low-to-High Chest Flyes', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Chest' },
          { name: 'Cable Tricep Rope Pushdowns', sets: 4, reps: '12-15', restSeconds: 45, targetMuscle: 'Triceps' },
          { name: 'Overhead Dumbbell Tricep Extension', sets: 3, reps: '10-12', restSeconds: 45, targetMuscle: 'Triceps' }
        ],
        dumbbells_only: [
          { name: 'Dumbbell Flat Bench / Floor Press', sets: 4, reps: '8-12', restSeconds: 60, targetMuscle: 'Chest' },
          { name: 'Incline Dumbbell Chest Press', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Upper Chest' },
          { name: 'Deficit Push-Ups', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Chest' },
          { name: 'Overhead Dumbbell Tricep Extension', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Triceps' }
        ],
        bodyweight: [
          { name: 'Standard Push-Ups (Tempo 3-0-1)', sets: 4, reps: '15-20', restSeconds: 45, targetMuscle: 'Chest' },
          { name: 'Decline Push-Ups', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Upper Chest' },
          { name: 'Diamond Push-Ups', sets: 4, reps: '12-15', restSeconds: 45, targetMuscle: 'Triceps' }
        ]
      },
      back_biceps: {
        full_gym: [
          { name: 'Wide-Grip Lat Pulldowns / Pull-Ups', sets: 4, reps: '8-10', restSeconds: 75, targetMuscle: 'Lats' },
          { name: 'Barbell Bent-Over Rows', sets: 4, reps: '8-12', restSeconds: 60, targetMuscle: 'Mid-Back' },
          { name: 'Close-Grip Seated Cable Rows', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Lats' },
          { name: 'Incline Dumbbell Bicep Curls', sets: 4, reps: '10-12', restSeconds: 45, targetMuscle: 'Biceps' },
          { name: 'Dumbbell Hammer Curls', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Brachialis' }
        ],
        dumbbells_only: [
          { name: 'Dumbbell Bent-Over Rows', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Single-Arm Dumbbell Rows', sets: 3, reps: '10-12/side', restSeconds: 60, targetMuscle: 'Lats' },
          { name: 'Incline Dumbbell Bicep Curls', sets: 4, reps: '10-12', restSeconds: 45, targetMuscle: 'Biceps' },
          { name: 'Dumbbell Hammer Curls', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Brachialis' }
        ],
        bodyweight: [
          { name: 'Pull-Ups / Chin-Ups', sets: 4, reps: '8-12', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Inverted Rows (Under Table/Bar)', sets: 4, reps: '10-15', restSeconds: 45, targetMuscle: 'Back' },
          { name: 'Doorframe Bicep Pulls', sets: 3, reps: '15', restSeconds: 30, targetMuscle: 'Biceps' }
        ]
      },
      shoulders_legs: {
        full_gym: [
          { name: 'Barbell Back Squats / Hack Squats', sets: 4, reps: '6-8', restSeconds: 120, targetMuscle: 'Quads' },
          { name: 'Standing Barbell / DB Overhead Press', sets: 4, reps: '6-8', restSeconds: 90, targetMuscle: 'Deltoids' },
          { name: 'Barbell Romanian Deadlifts (RDL)', sets: 3, reps: '8-10', restSeconds: 90, targetMuscle: 'Hamstrings' },
          { name: 'Dumbbell / Cable Lateral Raises', sets: 4, reps: '12-15', restSeconds: 45, targetMuscle: 'Side Delts' },
          { name: 'Lying Leg Curls & Leg Extensions', sets: 3, reps: '12-15', restSeconds: 60, targetMuscle: 'Legs' },
          { name: 'Cable Face Pulls', sets: 3, reps: '15', restSeconds: 45, targetMuscle: 'Rear Delts' }
        ],
        dumbbells_only: [
          { name: 'Dumbbell Goblet Squats', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Quads' },
          { name: 'Standing Dumbbell Overhead Press', sets: 4, reps: '8-10', restSeconds: 60, targetMuscle: 'Deltoids' },
          { name: 'Dumbbell Romanian Deadlifts', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Hamstrings' },
          { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restSeconds: 45, targetMuscle: 'Side Delts' },
          { name: 'Dumbbell Walking Lunges', sets: 3, reps: '12/leg', restSeconds: 60, targetMuscle: 'Glutes' }
        ],
        bodyweight: [
          { name: 'Bodyweight Bulgarian Split Squats', sets: 4, reps: '12/leg', restSeconds: 60, targetMuscle: 'Quads' },
          { name: 'Pike Push-Ups', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Shoulders' },
          { name: 'Single-Leg Glute Bridges', sets: 3, reps: '15/leg', restSeconds: 45, targetMuscle: 'Glutes' },
          { name: 'Air Squats (Tempo 3-1-1)', sets: 4, reps: '20', restSeconds: 45, targetMuscle: 'Quads' }
        ]
      },
      upper: {
        full_gym: [
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', restSeconds: 90, targetMuscle: 'Chest' },
          { name: 'Lat Pulldowns (Wide Grip)', sets: 4, reps: '8-10', restSeconds: 75, targetMuscle: 'Lats' },
          { name: 'Incline Dumbbell Chest Press', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Upper Chest' },
          { name: 'Seated Cable Rows', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Mid-Back' },
          { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restSeconds: 45, targetMuscle: 'Side Delts' },
          { name: 'Cable Tricep Rope Pushdowns', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Triceps' }
        ],
        dumbbells_only: [
          { name: 'Dumbbell Flat Bench / Floor Press', sets: 4, reps: '8-12', restSeconds: 60, targetMuscle: 'Chest' },
          { name: 'Dumbbell Bent-Over Rows', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Standing Dumbbell Overhead Press', sets: 3, reps: '8-10', restSeconds: 60, targetMuscle: 'Deltoids' },
          { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restSeconds: 45, targetMuscle: 'Side Delts' },
          { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Biceps' },
          { name: 'Overhead Dumbbell Tricep Extension', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Triceps' }
        ],
        bodyweight: [
          { name: 'Standard Push-Ups (Tempo 3-0-1)', sets: 4, reps: '15-20', restSeconds: 45, targetMuscle: 'Chest' },
          { name: 'Pull-Ups / Inverted Table Rows', sets: 4, reps: '8-12', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Pike Push-Ups', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Shoulders' },
          { name: 'Diamond Push-Ups', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Triceps' },
          { name: 'Doorframe Bicep Pulls', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Biceps' }
        ]
      },
      lower: {
        full_gym: [
          { name: 'Barbell Back Squats / Hack Squats', sets: 4, reps: '6-8', restSeconds: 120, targetMuscle: 'Quads' },
          { name: 'Romanian Deadlifts (RDL)', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Hamstrings' },
          { name: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 75, targetMuscle: 'Quads / Glutes' },
          { name: 'Lying Leg Curls', sets: 3, reps: '12-15', restSeconds: 60, targetMuscle: 'Hamstrings' },
          { name: 'Standing Calf Raises', sets: 4, reps: '15-20', restSeconds: 45, targetMuscle: 'Calves' }
        ],
        dumbbells_only: [
          { name: 'Dumbbell Goblet Squats', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Quads' },
          { name: 'Dumbbell Romanian Deadlifts', sets: 4, reps: '10-12', restSeconds: 75, targetMuscle: 'Hamstrings' },
          { name: 'Dumbbell Bulgarian Split Squats', sets: 3, reps: '10/leg', restSeconds: 60, targetMuscle: 'Quads / Glutes' },
          { name: 'Dumbbell Walking Lunges', sets: 3, reps: '12/leg', restSeconds: 60, targetMuscle: 'Glutes' },
          { name: 'Single-Leg Dumbbell Calf Raises', sets: 4, reps: '15/leg', restSeconds: 45, targetMuscle: 'Calves' }
        ],
        bodyweight: [
          { name: 'Bodyweight Bulgarian Split Squats', sets: 4, reps: '12/leg', restSeconds: 60, targetMuscle: 'Quads' },
          { name: 'Single-Leg Glute Bridges', sets: 3, reps: '15/leg', restSeconds: 45, targetMuscle: 'Glutes' },
          { name: 'Bodyweight Air Squats (Tempo 3-1-1)', sets: 4, reps: '20', restSeconds: 45, targetMuscle: 'Quads' },
          { name: 'Walking Lunges', sets: 3, reps: '15/leg', restSeconds: 45, targetMuscle: 'Legs' },
          { name: 'Standing Calf Raises (Elevated Ledge)', sets: 4, reps: '25', restSeconds: 30, targetMuscle: 'Calves' }
        ]
      },
      full_body: {
        full_gym: [
          { name: 'Barbell Back Squats', sets: 4, reps: '6-8', restSeconds: 120, targetMuscle: 'Quads' },
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', restSeconds: 90, targetMuscle: 'Chest' },
          { name: 'Lat Pulldowns (Wide Grip)', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Lats' },
          { name: 'Romanian Deadlifts', sets: 3, reps: '8-10', restSeconds: 75, targetMuscle: 'Hamstrings' },
          { name: 'Dumbbell Lateral Raises', sets: 3, reps: '12-15', restSeconds: 45, targetMuscle: 'Delts' }
        ],
        dumbbells_only: [
          { name: 'Dumbbell Goblet Squats', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Quads' },
          { name: 'Dumbbell Flat Bench Press', sets: 4, reps: '8-12', restSeconds: 60, targetMuscle: 'Chest' },
          { name: 'Dumbbell Bent-Over Rows', sets: 4, reps: '10-12', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Dumbbell Romanian Deadlifts', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Hamstrings' },
          { name: 'Dumbbell Standing Overhead Press', sets: 3, reps: '8-10', restSeconds: 60, targetMuscle: 'Delts' }
        ],
        bodyweight: [
          { name: 'Standard Push-Ups (Tempo 3-0-1)', sets: 4, reps: '15-20', restSeconds: 45, targetMuscle: 'Chest' },
          { name: 'Bodyweight Bulgarian Split Squats', sets: 3, reps: '12/leg', restSeconds: 60, targetMuscle: 'Quads' },
          { name: 'Inverted Table Rows / Pull-Ups', sets: 4, reps: '8-12', restSeconds: 60, targetMuscle: 'Back' },
          { name: 'Bodyweight Glute Bridges', sets: 3, reps: '20', restSeconds: 45, targetMuscle: 'Glutes' },
          { name: 'Pike Push-Ups', sets: 3, reps: '10-12', restSeconds: 60, targetMuscle: 'Shoulders' }
        ]
      }
    };

    const category = (focus.includes('chest') && (focus.includes('tri') || focus.includes('arm')))
      ? 'chest_triceps'
      : (focus.includes('back') && (focus.includes('bi') || focus.includes('arm')))
      ? 'back_biceps'
      : ((focus.includes('shoulder') || focus.includes('delt')) && (focus.includes('leg') || focus.includes('squat')))
      ? 'shoulders_legs'
      : (focus.includes('leg') || focus.includes('lower') || focus.includes('glute')) 
      ? 'lower' 
      : (focus.includes('full body') || focus.includes('total body'))
      ? 'full_body'
      : 'upper';

    const eqKey = catalog[category][availableEquipment] ? availableEquipment : 'full_gym';
    const baseExercises = catalog[category][eqKey];
    const targetExerciseCount = durationMinutes <= 30 ? 4 : durationMinutes <= 45 ? 5 : 6;
    const selectedExercises = baseExercises.slice(0, targetExerciseCount);

    return {
      planId: `plan_${Date.now()}`,
      title: `${durationMinutes}-Min ${category.toUpperCase().replace('_', ' ')} (${eqKey.replace('_', ' ')})`,
      goal,
      experience,
      durationMinutes,
      equipment: eqKey,
      category,
      estimatedCaloriesBurned: Math.round(durationMinutes * 6.5),
      exercises: selectedExercises,
      actionType: 'WORKOUT_INJECTION',
      injectionPayload: {
        name: `${durationMinutes}-Min ${category.toUpperCase().replace('_', ' ')}`,
        duration: durationMinutes,
        exercises: selectedExercises.map(ex => ({
          name: ex.name,
          targetSets: ex.sets,
          targetReps: ex.reps,
          restSeconds: ex.restSeconds
        }))
      }
    };
  }

  /**
   * 7. Generate Complete Periodized 7-Day Weekly Workout Program
   */
  static generateWeeklyWorkoutProgram({
    goal = 'hypertrophy',
    experience = 'intermediate',
    availableEquipment = 'full_gym',
    splitType = 'upper_lower'
  }) {
    const eqKey = ['full_gym', 'dumbbells_only', 'bodyweight'].includes(availableEquipment) ? availableEquipment : 'full_gym';

    const weeklySchedule = [
      {
        day: 1,
        dayName: 'Day 1 — Upper Body Strength & Power',
        focus: 'Chest, Back, Shoulders & Arms',
        durationMinutes: 45,
        estimatedCalories: 310,
        exercises: [
          { name: eqKey === 'dumbbells_only' ? 'Dumbbell Flat Bench Press' : eqKey === 'bodyweight' ? 'Push-Ups (Tempo 3-0-1)' : 'Barbell Flat Bench Press', sets: 4, reps: '6-8', restSeconds: 90 },
          { name: eqKey === 'bodyweight' ? 'Pull-Ups / Inverted Rows' : 'Lat Pulldowns (Wide Grip)', sets: 4, reps: '8-10', restSeconds: 75 },
          { name: eqKey === 'bodyweight' ? 'Pike Push-Ups' : 'Standing Dumbbell Overhead Press', sets: 3, reps: '8-10', restSeconds: 60 },
          { name: 'Chest-Supported Dumbbell Rows', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', restSeconds: 45 }
        ]
      },
      {
        day: 2,
        dayName: 'Day 2 — Lower Body Power & Quad Focus',
        focus: 'Quads, Hamstrings, Glutes & Calves',
        durationMinutes: 45,
        estimatedCalories: 330,
        exercises: [
          { name: eqKey === 'dumbbells_only' ? 'Dumbbell Goblet Squats' : eqKey === 'bodyweight' ? 'Bulgarian Split Squats' : 'Barbell Back Squat / Hack Squat', sets: 4, reps: '6-8', restSeconds: 120 },
          { name: 'Romanian Deadlifts (RDL)', sets: 4, reps: '8-10', restSeconds: 90 },
          { name: eqKey === 'full_gym' ? 'Leg Press / Hack Squat' : 'Dumbbell Walking Lunges', sets: 3, reps: '12/leg', restSeconds: 60 },
          { name: eqKey === 'full_gym' ? 'Lying Leg Curls' : 'Single-Leg Glute Bridges', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Standing Calf Raises', sets: 4, reps: '15-20', restSeconds: 45 }
        ]
      },
      {
        day: 3,
        dayName: 'Day 3 — Active Recovery & Mobility',
        focus: 'Zone 2 Cardio, Hip Mobility & Core Stability',
        durationMinutes: 30,
        estimatedCalories: 160,
        exercises: [
          { name: 'Zone 2 Incline Walk / Light Cycling', sets: 1, reps: '20 min', restSeconds: 0 },
          { name: 'World’s Greatest Stretch & Thoracic Flow', sets: 3, reps: '10/side', restSeconds: 30 },
          { name: 'Deadbugs & Hollow Body Holds', sets: 3, reps: '45s', restSeconds: 45 },
          { name: 'Plank to Downward Dog Flow', sets: 3, reps: '10 reps', restSeconds: 30 }
        ]
      },
      {
        day: 4,
        dayName: 'Day 4 — Push Hypertrophy & Delts',
        focus: 'Chest, Front & Lateral Delts, Triceps',
        durationMinutes: 45,
        estimatedCalories: 290,
        exercises: [
          { name: eqKey === 'bodyweight' ? 'Decline Push-Ups' : 'Incline Dumbbell Bench Press', sets: 4, reps: '10-12', restSeconds: 75 },
          { name: 'Dumbbell Seated Shoulder Press', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: eqKey === 'full_gym' ? 'Cable Chest Flyes' : 'Flat Dumbbell Flyes', sets: 3, reps: '12-15', restSeconds: 45 },
          { name: 'Dumbbell Lateral Raises (Drop Set on 4th)', sets: 4, reps: '12-15', restSeconds: 45 },
          { name: eqKey === 'full_gym' ? 'Cable Tricep Rope Pushdowns' : 'Overhead Dumbbell Tricep Extension', sets: 3, reps: '12-15', restSeconds: 45 }
        ]
      },
      {
        day: 5,
        dayName: 'Day 5 — Pull Hypertrophy & Posterior Chain',
        focus: 'Lats, Upper Back, Rear Delts & Biceps',
        durationMinutes: 45,
        estimatedCalories: 300,
        exercises: [
          { name: eqKey === 'bodyweight' ? 'Pull-Ups / Chin-Ups' : 'Neutral Grip Lat Pulldowns', sets: 4, reps: '10-12', restSeconds: 75 },
          { name: 'Single-Arm Dumbbell Rows', sets: 4, reps: '10-12/arm', restSeconds: 60 },
          { name: eqKey === 'full_gym' ? 'Cable Face Pulls' : 'Dumbbell Rear Delt Flyes', sets: 4, reps: '15', restSeconds: 45 },
          { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12-15', restSeconds: 45 },
          { name: 'Dumbbell Hammer Curls', sets: 3, reps: '12-15', restSeconds: 45 }
        ]
      },
      {
        day: 6,
        dayName: 'Day 6 — Lower Body Posterior & Core',
        focus: 'Glutes, Hamstrings, Quads & Abdominals',
        durationMinutes: 45,
        estimatedCalories: 320,
        exercises: [
          { name: eqKey === 'full_gym' ? 'Barbell Deadlifts / Trap Bar Deadlifts' : 'Heavy Dumbbell Romanian Deadlifts', sets: 4, reps: '6-8', restSeconds: 120 },
          { name: 'Bulgarian Split Squats', sets: 3, reps: '10/leg', restSeconds: 60 },
          { name: eqKey === 'full_gym' ? 'Leg Extensions' : 'Goblet Squats (Tempo 3-1-1)', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Hanging Leg Raises / Lying Leg Raises', sets: 3, reps: '15-20', restSeconds: 45 },
          { name: 'Seated Calf Raises', sets: 4, reps: '15-20', restSeconds: 45 }
        ]
      },
      {
        day: 7,
        dayName: 'Day 7 — Full Neurological Rest',
        focus: 'Sleep, Hydration & Tissue Repair',
        durationMinutes: 0,
        estimatedCalories: 0,
        exercises: [
          { name: 'Complete Rest & 8+ Hours Sleep', sets: 1, reps: 'Full Day', restSeconds: 0 },
          { name: 'Optimal Hydration (2.5L+)', sets: 1, reps: 'Continuous', restSeconds: 0 },
          { name: 'Protein Target Adherence (2.0g/kg)', sets: 1, reps: 'Target Met', restSeconds: 0 }
        ]
      }
    ];

    return {
      planId: `weekly_plan_${Date.now()}`,
      title: `7-Day Periodized Program (${eqKey.replace('_', ' ')})`,
      isWeeklyProgram: true,
      goal,
      experience,
      equipment: eqKey,
      durationMinutes: 45,
      daysCount: 7,
      estimatedCaloriesBurned: 1710,
      days: weeklySchedule,
      actionType: 'WORKOUT_INJECTION',
      injectionPayload: {
        name: `7-Day ${eqKey.replace('_', ' ')} Program`,
        duration: 45,
        daysCount: 7,
        exercises: weeklySchedule[0].exercises.map(ex => ({
          name: ex.name,
          targetSets: ex.sets,
          targetReps: ex.reps,
          restSeconds: ex.restSeconds
        }))
      }
    };
  }

  /**
   * 8. Generate Dynamic Structured Nutrition / Meal Plan
   */
  static generateNutritionPlan({
    targetCalories = 2000,
    dietType = 'standard',
    mealsCount = 4,
    proteinTarget = 140
  }) {
    const mealDatabase = {
      standard: [
        { name: 'Meal 1: High-Protein Breakfast Bowl', calories: Math.round(targetCalories * 0.25), protein: Math.round(proteinTarget * 0.25), items: ['3 Whole Eggs + 2 Egg Whites', 'Oatmeal (60g) with Blueberries', '1 scoop Whey Isolate'] },
        { name: 'Meal 2: Lean Fuel Lunch', calories: Math.round(targetCalories * 0.35), protein: Math.round(proteinTarget * 0.35), items: ['Grilled Chicken Breast (180g)', 'Brown / Basmati Rice (150g)', 'Steamed Broccoli & Olive Oil'] },
        { name: 'Meal 3: Pre/Post Workout Fuel', calories: Math.round(targetCalories * 0.15), protein: Math.round(proteinTarget * 0.15), items: ['Greek Yogurt (200g)', 'Handful of Almonds', '1 Medium Banana'] },
        { name: 'Meal 4: Recovery Dinner', calories: Math.round(targetCalories * 0.25), protein: Math.round(proteinTarget * 0.25), items: ['Salmon or Lean Sirloin (170g)', 'Sweet Potato (200g)', 'Mixed Green Salad'] }
      ],
      vegetarian: [
        { name: 'Meal 1: Power Protein Oats & Seeds', calories: Math.round(targetCalories * 0.25), protein: Math.round(proteinTarget * 0.25), items: ['Rolled Oats (70g) with Soy Milk', '1.5 scoops Plant / Whey Protein', 'Chia Seeds & Walnuts'] },
        { name: 'Meal 2: Tofu & Quinoa Power Bowl', calories: Math.round(targetCalories * 0.35), protein: Math.round(proteinTarget * 0.35), items: ['Pan-Seared High-Protein Tofu (200g)', 'Cooked Quinoa (180g)', 'Roasted Veggies & Tahini'] },
        { name: 'Meal 3: Sprouted Moong & Paneer Snack', calories: Math.round(targetCalories * 0.15), protein: Math.round(proteinTarget * 0.15), items: ['Low-Fat Paneer (100g)', 'Sprouted Moong Salad', 'Cucumber & Lemon Juice'] },
        { name: 'Meal 4: Soya Chunk & Dal Khichdi', calories: Math.round(targetCalories * 0.25), protein: Math.round(proteinTarget * 0.25), items: ['Soya Chunks Curry (50g dry)', 'Moong Dal & Brown Rice (150g)', 'Curd / Yogurt (100g)'] }
      ]
    };

    const chosenMeals = mealDatabase[dietType] || mealDatabase.standard;

    return {
      planId: `nutrition_${Date.now()}`,
      title: `Daily ${dietType.toUpperCase()} Meal Blueprint (${targetCalories} kcal)`,
      targetCalories,
      dietType,
      proteinTarget,
      meals: chosenMeals,
      actionType: 'NUTRITION_INJECTION',
      injectionPayload: {
        dailyCalories: targetCalories,
        proteinTarget
      }
    };
  }

  /**
   * 9. Evaluate Real-World Challenges & Gamification Progress
   */
  static getChallengesProgress({
    workoutLogs = [],
    waterLogs = [],
    currentStreak = 0
  }) {
    const totalWaterMl = waterLogs.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    const totalWorkouts = workoutLogs.length;

    return [
      {
        id: 'streak_master',
        title: '7-Day Streak Master',
        targetValue: 7,
        currentProgress: Math.min(7, currentStreak),
        unit: 'days',
        progressPercent: Math.min(100, Math.round((currentStreak / 7) * 100)),
        xpReward: 250
      },
      {
        id: 'iron_consistency',
        title: 'Monthly Volume Master (15 Workouts)',
        targetValue: 15,
        currentProgress: Math.min(15, totalWorkouts),
        unit: 'workouts',
        progressPercent: Math.min(100, Math.round((totalWorkouts / 15) * 100)),
        xpReward: 500
      },
      {
        id: 'hydration_champion',
        title: 'Hydration Champion (20,000 ml)',
        targetValue: 20000,
        currentProgress: Math.min(20000, totalWaterMl),
        unit: 'ml',
        progressPercent: Math.min(100, Math.round((totalWaterMl / 20000) * 100)),
        xpReward: 200
      }
    ];
  }

  /**
   * 10. Authoritative Today's Nutrition Breakdown & Macro Remaining
   */
  static getTodayNutritionSummary({
    foodLogs = [],
    userProfile = {},
    todayStr = getTodayDateString()
  } = {}) {
    const rawItems = Array.isArray(foodLogs) ? foodLogs : Object.values(foodLogs || {}).flat();
    const todayLogs = rawItems.filter(f => f && isSameLocalDate(f.timestamp || f.created_at || f.date, todayStr));

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealsBySlot = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: []
    };

    todayLogs.forEach(item => {
      const cals = Number(item.calories || 0);
      const prot = Number(item.protein || 0);
      const carbs = Number(item.carbs || 0);
      const fat = Number(item.fat || 0);
      const name = item.name || item.food_name || item.title || 'Food Item';
      const slot = item.mealType || item.category || 'Lunch';

      totalCalories += cals;
      totalProtein += prot;
      totalCarbs += carbs;
      totalFat += fat;

      const normalizedSlot = slot.toLowerCase().includes('break') ? 'Breakfast'
        : slot.toLowerCase().includes('lunch') ? 'Lunch'
        : slot.toLowerCase().includes('din') ? 'Dinner'
        : 'Snack';

      mealsBySlot[normalizedSlot].push({
        name,
        calories: Math.round(cals),
        protein: Math.round(prot * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        quantity: item.quantity || 1,
        unit: item.unit || item.servingUnit || 'portion'
      });
    });

    const targetCalories = Number(userProfile.dailyCalories || userProfile.calorieGoal || 2000);
    const targetProtein = Number(userProfile.proteinTarget || userProfile.protein || 130);
    const targetCarbs = Number(userProfile.carbsTarget || userProfile.carbs || 220);
    const targetFat = Number(userProfile.fatTarget || userProfile.fat || 65);

    const remainingCalories = Math.max(0, targetCalories - totalCalories);
    const remainingProtein = Math.max(0, targetProtein - totalProtein);
    const remainingCarbs = Math.max(0, targetCarbs - totalCarbs);
    const remainingFat = Math.max(0, targetFat - totalFat);

    return {
      hasLogged: todayLogs.length > 0,
      itemCount: todayLogs.length,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      remainingCalories,
      remainingProtein: Math.round(remainingProtein * 10) / 10,
      remainingCarbs: Math.round(remainingCarbs * 10) / 10,
      remainingFat: Math.round(remainingFat * 10) / 10,
      calorieDeficit: targetCalories - totalCalories,
      mealsBySlot,
      items: todayLogs
    };
  }

  /**
   * 11. Authoritative Workout History Query
   */
  static getWorkoutHistorySummary({
    workoutLogs = [],
    targetDateStr = null
  } = {}) {
    const rawWorkouts = Array.isArray(workoutLogs) ? workoutLogs : [];
    
    let filteredLogs = rawWorkouts;
    if (targetDateStr) {
      filteredLogs = rawWorkouts.filter(w => w && isSameLocalDate(w.timestamp || w.created_at || w.date, targetDateStr));
    }

    let totalVolume = 0;
    let totalSets = 0;
    const exerciseSummaries = [];

    filteredLogs.forEach(w => {
      const name = w.name || w.exercise_name || w.title || 'Exercise';
      const setsArr = Array.isArray(w.sets) ? w.sets : [];
      let exVol = 0;
      let exSets = setsArr.length || Number(w.sets || 1);
      let repsStr = w.reps || '';
      let weightKg = Number(w.weight || 0);

      if (setsArr.length > 0) {
        setsArr.forEach(s => {
          const wt = Number(s.weight || 0);
          const rp = Number(s.reps || 0);
          exVol += wt * rp;
        });
      } else {
        exVol = weightKg * (Number(w.reps) || 10) * exSets;
      }

      totalVolume += exVol;
      totalSets += exSets;

      exerciseSummaries.push({
        name,
        category: w.category || 'Strength',
        sets: exSets,
        reps: repsStr || '10',
        weight: weightKg,
        volumeKg: Math.round(exVol)
      });
    });

    return {
      hasWorkouts: filteredLogs.length > 0,
      sessionCount: filteredLogs.length,
      totalVolumeKg: Math.round(totalVolume),
      totalSets,
      exercises: exerciseSummaries
    };
  }

  /**
   * 12. Authoritative Streak Query
   */
  static getStreakSummary({
    foodLogs = [],
    workoutLogs = [],
    waterLogs = [],
    userProfile = {},
    todayStr = getTodayDateString()
  } = {}) {
    const foodTimestamps = (foodLogs || []).map(f => f.timestamp || f.created_at || f.date);
    const workoutTimestamps = (workoutLogs || []).map(w => w.timestamp || w.created_at || w.date);
    const allTimestamps = [...foodTimestamps, ...workoutTimestamps];

    const currentStreak = calculateConsecutiveDaysStreak(allTimestamps, todayStr);
    const nutritionStreak = calculateConsecutiveDaysStreak(foodTimestamps, todayStr);
    const workoutStreak = calculateConsecutiveDaysStreak(workoutTimestamps, todayStr);

    const hasLoggedToday = allTimestamps.some(ts => ts && isSameLocalDate(ts, todayStr));

    return {
      currentStreak,
      nutritionStreak,
      workoutStreak,
      hasLoggedToday,
      todayStr
    };
  }
}

export const aiToolRegistry = AIToolRegistry;
export default AIToolRegistry;
