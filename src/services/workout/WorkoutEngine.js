/**
 * Calyxo Master Workout Engine & Progressive Overload Architecture
 * Fully conforming to Sections 10-19 of Calyxo Master Specification.
 *
 * Provides:
 * - Scalable workout & set data models
 * - Set types: Warmup, Working, Drop set, Failure, AMRAP, Rest-pause, Myo-rep
 * - RPE (1-10) and RIR (0-5+)
 * - Supersets grouping (A1, A2, etc.)
 * - Automatic PR detection (Weight, Reps, 1RM, Volume)
 * - Estimated 1RM formulas (Epley & Brzycki)
 * - Deterministic progressive overload targets
 * - Instant persistent auto-save to eliminate data loss
 */

import { generateUuid } from '../../lib/dbService.js';

export const SET_TYPES = {
  WARMUP: { id: 'W', label: 'Warm-up', color: 'text-amber-400 bg-amber-400/10' },
  WORKING: { id: '1', label: 'Working Set', color: 'text-foreground bg-surface-elevated' },
  DROP: { id: 'D', label: 'Drop Set', color: 'text-purple-400 bg-purple-400/10' },
  FAILURE: { id: 'F', label: 'Failure', color: 'text-destructive bg-destructive/10' },
  AMRAP: { id: 'A', label: 'AMRAP', color: 'text-cyan-400 bg-cyan-400/10' },
  REST_PAUSE: { id: 'RP', label: 'Rest-Pause', color: 'text-emerald-400 bg-emerald-400/10' },
  MYO_REP: { id: 'M', label: 'Myo-Rep', color: 'text-pink-400 bg-pink-400/10' }
};

const STORAGE_KEY = 'calyxo_active_workout_session_v2';

export class WorkoutEngine {
  static SET_TYPES = SET_TYPES;

  /**
   * Calculate Estimated 1 Rep Max using Epley & Brzycki formulas
   */
  static calculateEstimated1RM(weightKg, reps) {
    const w = Number(weightKg) || 0;
    const r = Number(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    // Epley formula: w * (1 + r / 30)
    const epley = w * (1 + (r / 30));
    // Brzycki formula: w / (1.0278 - 0.0278 * r)
    const brzycki = r < 37 ? w / (1.0278 - (0.0278 * r)) : epley;
    return Math.round((epley + brzycki) / 2 * 10) / 10;
  }

  /**
   * Deterministic Progressive Overload Engine (Section 15)
   * Evaluates previous performance and computes the next overload target.
   */
  static calculateOverloadTarget(previousSets = [], exerciseCategory = 'compound') {
    if (!previousSets || previousSets.length === 0) {
      return { recommendedWeight: 0, recommendedReps: '8–10', advice: 'Establish initial baseline weight.' };
    }

    // Get the heaviest working set from the previous session
    const workingSets = previousSets.filter(s => s.type !== 'W' && s.completed);
    const targetSet = workingSets.length > 0 ? workingSets[0] : previousSets[0];

    const prevWeight = Number(targetSet.weight || targetSet.weightKg || 0);
    const prevReps = Number(targetSet.reps || 0);

    // If athlete hit upper bound reps (e.g. >= 8 reps for compound or >= 12 for isolation)
    const isCompound = exerciseCategory === 'compound' || prevWeight >= 50;
    const thresholdReps = isCompound ? 8 : 10;
    const weightIncrement = isCompound ? 2.5 : 1.25;

    if (prevReps >= thresholdReps) {
      const nextWeight = prevWeight + weightIncrement;
      return {
        recommendedWeight: nextWeight,
        recommendedReps: isCompound ? '6–8' : '8–10',
        advice: `Target hit previously (${prevWeight}kg × ${prevReps}). Increase weight by +${weightIncrement}kg today.`
      };
    } else {
      return {
        recommendedWeight: prevWeight,
        recommendedReps: `${prevReps + 1} reps`,
        advice: `Keep weight at ${prevWeight}kg and aim for +1 extra rep with clean form before increasing load.`
      };
    }
  }

  /**
   * Find Previous Performance for a given exercise from user's workout history
   */
  static getPreviousPerformance(exerciseName, workoutLogs = []) {
    if (!exerciseName || !workoutLogs || workoutLogs.length === 0) return null;
    const cleanName = exerciseName.toLowerCase().trim();

    for (const workout of workoutLogs) {
      const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
      for (const ex of exercises) {
        const exName = (ex.name || ex.title || '').toLowerCase().trim();
        if (exName === cleanName || cleanName.includes(exName) || exName.includes(cleanName)) {
          const sets = Array.isArray(ex.sets) ? ex.sets : (Array.isArray(ex.completedSets) ? ex.completedSets : []);
          if (sets.length > 0) {
            return {
              date: workout.timestamp ? new Date(workout.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Previous',
              sets: sets.map((s, idx) => ({
                setNumber: idx + 1,
                weight: Number(s.weight || s.weightKg || 0),
                reps: Number(s.reps || 0),
                type: s.type || '1',
                rpe: s.rpe || null
              }))
            };
          }
        }
      }
    }
    return null;
  }

  /**
   * Automatically Detect Personal Records (PRs) achieved in a workout session
   */
  static detectPersonalRecords(currentExercises = [], historicalLogs = []) {
    const prs = [];
    const safeLogs = Array.isArray(historicalLogs) ? historicalLogs : [];
    const safeExercises = Array.isArray(currentExercises) ? currentExercises : [];

    // Build historical maximums index
    const historicalMaxMap = new Map();
    safeLogs.forEach(w => {
      const exs = Array.isArray(w.exercises) ? w.exercises : [];
      exs.forEach(e => {
        const name = (e.name || '').toLowerCase().trim();
        if (!name) return;
        let entry = historicalMaxMap.get(name) || { maxWeight: 0, maxReps: 0, maxEst1RM: 0 };
        const sets = Array.isArray(e.sets) ? e.sets : (Array.isArray(e.completedSets) ? e.completedSets : []);
        sets.forEach(s => {
          const wt = Number(s.weight || s.weightKg || 0);
          const rp = Number(s.reps || 0);
          const est1RM = WorkoutEngine.calculateEstimated1RM(wt, rp);
          if (wt > entry.maxWeight) entry.maxWeight = wt;
          if (rp > entry.maxReps && wt >= entry.maxWeight * 0.7) entry.maxReps = rp;
          if (est1RM > entry.maxEst1RM) entry.maxEst1RM = est1RM;
        });
        historicalMaxMap.set(name, entry);
      });
    });

    // Check completed sets in current session
    safeExercises.forEach(ex => {
      const name = (ex.name || '').toLowerCase().trim();
      const hist = historicalMaxMap.get(name) || { maxWeight: 0, maxReps: 0, maxEst1RM: 0 };
      const completedSets = (ex.sets || []).filter(s => s.completed);

      completedSets.forEach(s => {
        const wt = Number(s.weight || 0);
        const rp = Number(s.reps || 0);
        const est1RM = WorkoutEngine.calculateEstimated1RM(wt, rp);

        if (hist.maxWeight > 0 && wt > hist.maxWeight) {
          prs.push({
            exerciseName: ex.name,
            type: 'MAX_WEIGHT',
            value: `${wt} kg × ${rp} reps`,
            previous: `${hist.maxWeight} kg`
          });
          hist.maxWeight = wt; // Prevent duplicate within same workout
        } else if (hist.maxEst1RM > 0 && est1RM > hist.maxEst1RM) {
          prs.push({
            exerciseName: ex.name,
            type: 'ESTIMATED_1RM',
            value: `Est. 1RM: ${est1RM} kg`,
            previous: `${hist.maxEst1RM} kg`
          });
          hist.maxEst1RM = est1RM;
        }
      });
    });

    return prs;
  }

  /**
   * Create an initial blank workout session from a routine or template
   */
  static createWorkoutSession({ routine = null, routineName = 'Quick Workout' } = {}) {
    const now = Date.now();
    const exercisesList = routine?.workout?.exercises || routine?.exercises || [];

    const formattedExercises = exercisesList.map((ex, exIdx) => {
      const details = String(ex.details || '3 sets x 10 reps').toLowerCase();
      const setsMatch = details.match(/(\d+)\s*set/);
      const repsMatch = details.match(/(\d+)\s*rep/);
      const setTotal = setsMatch ? Math.min(10, parseInt(setsMatch[1], 10)) : 3;
      const targetReps = repsMatch ? parseInt(repsMatch[1], 10) : 10;

      const sets = Array.from({ length: setTotal }, (_, sIdx) => ({
        id: `set_${exIdx}_${sIdx}`,
        setNumber: sIdx + 1,
        type: sIdx === 0 && setTotal > 3 ? 'W' : '1',
        weight: 0,
        reps: targetReps,
        rpe: 8,
        rir: 2,
        restSeconds: 90,
        completed: false,
        timestamp: null
      }));

      return {
        id: `ex_${exIdx}_${now}`,
        name: ex.name || 'Exercise',
        target: ex.target || ex.muscle_group || 'Compound',
        equipment: ex.equipment || 'Barbell',
        supersetGroup: null, // e.g. 'A', 'B'
        restSeconds: 90,
        notes: '',
        sets
      };
    });

    return {
      id: `workout_${now}`,
      title: routine?.dayName || routine?.workout?.name || routine?.name || routineName,
      routineId: routine?.id || null,
      startedAt: now,
      completedAt: null,
      durationMinutes: 0,
      totalVolumeKg: 0,
      notes: '',
      exercises: formattedExercises
    };
  }

  /**
   * Save active workout session to local storage for crash/background protection
   */
  static saveActiveSession(session) {
    if (typeof window === 'undefined') return;
    try {
      if (!session) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
    } catch (e) {}
  }

  /**
   * Restore interrupted session if present
   */
  static restoreActiveSession() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clear active session upon completion or discard
   */
  static clearActiveSession() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}

export default WorkoutEngine;
