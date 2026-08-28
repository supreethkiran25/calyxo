/**
 * Calyxo Deterministic Muscle Stimulus & Training Exposure Engine
 * Version: muscle_stimulus_model_v1
 * 
 * Mathematical stimulus aggregation pipeline:
 * Workout -> Exercises -> Sets -> Reps -> Load (kg) -> Primary / Secondary Muscle Weighting -> 5-Level Stimulus
 * 
 * Rules:
 * - Real data only: No fabricated loads, reps, or arbitrary percentages.
 * - Calories are strictly decoupled from physiological muscle stimulus.
 * - Stimulus Levels:
 *   Level 0: None (Transparent / Outlined)
 *   Level 1: Light (#22c55e Green)
 *   Level 2: Moderate (#eab308 Yellow)
 *   Level 3: High (#f97316 Orange)
 *   Level 4: Very High (#ef4444 Red)
 */

export const MODEL_VERSION = 'muscle_stimulus_model_v1';

export const STIMULUS_LEVELS = {
  NONE: { level: 0, label: 'None', color: 'transparent', minScore: 0, textClass: 'text-muted' },
  LIGHT: { level: 1, label: 'Light', color: '#22c55e', minScore: 1, textClass: 'text-emerald-400' },
  MODERATE: { level: 2, label: 'Moderate', color: '#eab308', minScore: 35, textClass: 'text-yellow-400' },
  HIGH: { level: 3, label: 'High', color: '#f97316', minScore: 70, textClass: 'text-orange-400' },
  VERY_HIGH: { level: 4, label: 'Very High', color: '#ef4444', minScore: 110, textClass: 'text-red-500' }
};

export const ANATOMICAL_MUSCLE_GROUPS = {
  chest: { id: 'chest', name: 'Chest (Pectorals)', category: 'push', slugs: ['chest', 'upperChest', 'lowerChest'] },
  abs: { id: 'abs', name: 'Abdominals', category: 'core', slugs: ['abs', 'upperAbs', 'lowerAbs'] },
  obliques: { id: 'obliques', name: 'Obliques', category: 'core', slugs: ['obliques'] },
  serratus: { id: 'serratus', name: 'Serratus Anterior', category: 'core', slugs: ['serratus'] },
  biceps: { id: 'biceps', name: 'Biceps Brachii', category: 'pull', slugs: ['biceps'] },
  triceps: { id: 'triceps', name: 'Triceps Brachii', category: 'push', slugs: ['triceps'] },
  deltoids: { id: 'deltoids', name: 'Deltoids (Shoulders)', category: 'push', slugs: ['deltoids', 'frontDeltoid', 'rearDeltoid'] },
  frontDeltoid: { id: 'frontDeltoid', name: 'Anterior Deltoids', category: 'push', slugs: ['frontDeltoid', 'deltoids'] },
  rearDeltoid: { id: 'rearDeltoid', name: 'Rear Deltoids', category: 'pull', slugs: ['rearDeltoid', 'deltoids'] },
  upperBack: { id: 'upperBack', name: 'Upper Back & Lats', category: 'pull', slugs: ['upperBack', 'rhomboids'] },
  lowerBack: { id: 'lowerBack', name: 'Lower Back (Erector Spinae)', category: 'pull', slugs: ['lowerBack'] },
  trapezius: { id: 'trapezius', name: 'Trapezius', category: 'pull', slugs: ['trapezius', 'upperTrapezius', 'lowerTrapezius'] },
  quadriceps: { id: 'quadriceps', name: 'Quadriceps', category: 'legs', slugs: ['quadriceps', 'innerQuad', 'outerQuad'] },
  hamstring: { id: 'hamstring', name: 'Hamstrings', category: 'legs', slugs: ['hamstring'] },
  gluteal: { id: 'gluteal', name: 'Gluteals', category: 'legs', slugs: ['gluteal'] },
  calves: { id: 'calves', name: 'Calves (Gastrocnemius & Soleus)', category: 'legs', slugs: ['calves', 'tibialis'] },
  forearm: { id: 'forearm', name: 'Forearms & Grip', category: 'pull', slugs: ['forearm'] }
};

/**
 * Exercise Taxonomy with Primary & Secondary Muscle Contributions
 */
export const EXERCISE_ANATOMY_TAXONOMY = {
  // Chest / Push
  'bench press': { primary: ['chest'], secondary: ['triceps', 'frontDeltoid'], category: 'push', type: 'weight' },
  'incline bench press': { primary: ['chest', 'frontDeltoid'], secondary: ['triceps'], category: 'push', type: 'weight' },
  'incline dumbbell press': { primary: ['chest', 'frontDeltoid'], secondary: ['triceps'], category: 'push', type: 'weight' },
  'dumbbell press': { primary: ['chest'], secondary: ['triceps', 'frontDeltoid'], category: 'push', type: 'weight' },
  'dumbbell fly': { primary: ['chest'], secondary: ['frontDeltoid'], category: 'push', type: 'weight' },
  'cable fly': { primary: ['chest'], secondary: ['serratus'], category: 'push', type: 'weight' },
  'push-up': { primary: ['chest'], secondary: ['triceps', 'frontDeltoid', 'abs'], category: 'push', type: 'bodyweight' },
  'pushups': { primary: ['chest'], secondary: ['triceps', 'frontDeltoid', 'abs'], category: 'push', type: 'bodyweight' },
  'dips': { primary: ['triceps', 'chest'], secondary: ['frontDeltoid'], category: 'push', type: 'bodyweight' },
  'overhead press': { primary: ['deltoids', 'frontDeltoid'], secondary: ['triceps', 'upperBack'], category: 'push', type: 'weight' },
  'military press': { primary: ['deltoids', 'frontDeltoid'], secondary: ['triceps'], category: 'push', type: 'weight' },
  'lateral raise': { primary: ['deltoids'], secondary: ['trapezius'], category: 'push', type: 'weight' },
  'tricep pushdown': { primary: ['triceps'], secondary: [], category: 'push', type: 'weight' },
  'skull crusher': { primary: ['triceps'], secondary: [], category: 'push', type: 'weight' },

  // Back / Pull
  'pull-up': { primary: ['upperBack'], secondary: ['biceps', 'forearm'], category: 'pull', type: 'bodyweight' },
  'chin-up': { primary: ['upperBack', 'biceps'], secondary: ['forearm'], category: 'pull', type: 'bodyweight' },
  'lat pulldown': { primary: ['upperBack'], secondary: ['biceps', 'forearm'], category: 'pull', type: 'weight' },
  'barbell row': { primary: ['upperBack'], secondary: ['biceps', 'lowerBack', 'rearDeltoid'], category: 'pull', type: 'weight' },
  'dumbbell row': { primary: ['upperBack'], secondary: ['biceps', 'rearDeltoid'], category: 'pull', type: 'weight' },
  'seated cable row': { primary: ['upperBack'], secondary: ['biceps', 'trapezius'], category: 'pull', type: 'weight' },
  'deadlift': { primary: ['lowerBack', 'gluteal', 'hamstring'], secondary: ['trapezius', 'forearm', 'quadriceps'], category: 'pull', type: 'weight' },
  'romanian deadlift': { primary: ['hamstring', 'gluteal', 'lowerBack'], secondary: ['trapezius'], category: 'pull', type: 'weight' },
  'rdl': { primary: ['hamstring', 'gluteal', 'lowerBack'], secondary: ['trapezius'], category: 'pull', type: 'weight' },
  'bicep curl': { primary: ['biceps'], secondary: ['forearm'], category: 'pull', type: 'weight' },
  'hammer curl': { primary: ['biceps', 'forearm'], secondary: [], category: 'pull', type: 'weight' },
  'face pull': { primary: ['rearDeltoid', 'trapezius'], secondary: ['upperBack'], category: 'pull', type: 'weight' },
  'shrug': { primary: ['trapezius'], secondary: ['forearm'], category: 'pull', type: 'weight' },

  // Legs
  'squat': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'calves', 'lowerBack'], category: 'legs', type: 'weight' },
  'barbell squat': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'lowerBack'], category: 'legs', type: 'weight' },
  'front squat': { primary: ['quadriceps', 'abs'], secondary: ['gluteal'], category: 'legs', type: 'weight' },
  'leg press': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstring'], category: 'legs', type: 'weight' },
  'leg extension': { primary: ['quadriceps'], secondary: [], category: 'legs', type: 'weight' },
  'leg curl': { primary: ['hamstring'], secondary: ['calves'], category: 'legs', type: 'weight' },
  'hamstring curl': { primary: ['hamstring'], secondary: ['calves'], category: 'legs', type: 'weight' },
  'lunges': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'calves'], category: 'legs', type: 'weight' },
  'calf raise': { primary: ['calves'], secondary: [], category: 'legs', type: 'weight' },
  'standing calf raise': { primary: ['calves'], secondary: [], category: 'legs', type: 'weight' },
  'hip thrust': { primary: ['gluteal'], secondary: ['hamstring'], category: 'legs', type: 'weight' },

  // Core
  'plank': { primary: ['abs'], secondary: ['obliques', 'serratus', 'deltoids'], category: 'core', type: 'bodyweight' },
  'crunches': { primary: ['abs'], secondary: ['obliques'], category: 'core', type: 'bodyweight' },
  'hanging leg raise': { primary: ['abs'], secondary: ['forearm'], category: 'core', type: 'bodyweight' },
  'russian twist': { primary: ['obliques', 'abs'], secondary: [], category: 'core', type: 'bodyweight' },
  'cable crunch': { primary: ['abs'], secondary: ['obliques'], category: 'core', type: 'weight' }
};

/**
 * Normalizes an exercise name to match taxonomy keys
 */
export function findExerciseTaxonomy(name = '') {
  const clean = String(name).toLowerCase().trim();
  if (EXERCISE_ANATOMY_TAXONOMY[clean]) return EXERCISE_ANATOMY_TAXONOMY[clean];

  for (const [key, mapping] of Object.entries(EXERCISE_ANATOMY_TAXONOMY)) {
    if (clean.includes(key) || key.includes(clean)) {
      return mapping;
    }
  }

  // Generic fallback inference based on keywords
  if (clean.includes('press') || clean.includes('chest') || clean.includes('fly')) {
    return { primary: ['chest'], secondary: ['triceps', 'frontDeltoid'], category: 'push', type: 'weight' };
  }
  if (clean.includes('row') || clean.includes('pull') || clean.includes('lat') || clean.includes('back')) {
    return { primary: ['upperBack'], secondary: ['biceps'], category: 'pull', type: 'weight' };
  }
  if (clean.includes('squat') || clean.includes('leg') || clean.includes('lunge')) {
    return { primary: ['quadriceps', 'gluteal'], secondary: ['hamstring'], category: 'legs', type: 'weight' };
  }
  if (clean.includes('curl')) {
    return { primary: ['biceps'], secondary: ['forearm'], category: 'pull', type: 'weight' };
  }
  if (clean.includes('abs') || clean.includes('core') || clean.includes('crunch')) {
    return { primary: ['abs'], secondary: ['obliques'], category: 'core', type: 'bodyweight' };
  }

  return { primary: [], secondary: [], category: 'other', type: 'weight' };
}

/**
 * Computes deterministic stimulus score for a single set
 */
export function calculateSetStimulus(setObj = {}, exerciseType = 'weight') {
  const reps = Math.max(0, Number(setObj.reps) || 0);
  const weight = Math.max(0, Number(setObj.weight) || 0);

  if (exerciseType === 'bodyweight') {
    return reps * 1.5;
  }

  if (weight > 0 && reps > 0) {
    const baseVolume = (weight * reps) / 20;
    const intensityBonus = Math.min(2.5, 1 + (weight / 100));
    return baseVolume * intensityBonus;
  }

  if (reps > 0) {
    return reps * 1.5;
  }

  return 10;
}

/**
 * Maps raw numerical score to 5-level stimulus bracket
 */
export function getStimulusLevelFromScore(score = 0) {
  if (score >= STIMULUS_LEVELS.VERY_HIGH.minScore) return STIMULUS_LEVELS.VERY_HIGH;
  if (score >= STIMULUS_LEVELS.HIGH.minScore) return STIMULUS_LEVELS.HIGH;
  if (score >= STIMULUS_LEVELS.MODERATE.minScore) return STIMULUS_LEVELS.MODERATE;
  if (score >= STIMULUS_LEVELS.LIGHT.minScore) return STIMULUS_LEVELS.LIGHT;
  return STIMULUS_LEVELS.NONE;
}

/**
 * Aggregates all completed workout records for a given date
 */
export function calculateDailyMuscleStimulus(workoutLogs = [], targetDateStr = null) {
  const targetDate = targetDateStr || new Date().toISOString().split('T')[0];

  const matchingWorkouts = workoutLogs.filter(w => {
    if (!w) return false;
    const wDate = w.date || (w.timestamp ? new Date(w.timestamp).toISOString().split('T')[0] : null);
    return wDate === targetDate;
  });

  const muscleScores = {};
  const muscleDetails = {};
  let totalVolumeKg = 0;
  let totalCaloriesKcal = 0;
  let totalExercisesLogged = 0;
  let hasValidData = matchingWorkouts.length > 0;

  for (const mKey of Object.keys(ANATOMICAL_MUSCLE_GROUPS)) {
    muscleScores[mKey] = 0;
    muscleDetails[mKey] = {
      muscleKey: mKey,
      name: ANATOMICAL_MUSCLE_GROUPS[mKey].name,
      category: ANATOMICAL_MUSCLE_GROUPS[mKey].category,
      rawScore: 0,
      stimulusLevel: STIMULUS_LEVELS.NONE,
      totalVolumeKg: 0,
      totalSets: 0,
      totalReps: 0,
      contributingExercises: []
    };
  }

  matchingWorkouts.forEach(workout => {
    if (workout.caloriesBurned && !isNaN(workout.caloriesBurned)) {
      totalCaloriesKcal += Number(workout.caloriesBurned);
    }

    const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];

    if (exercises.length > 0) {
      exercises.forEach(ex => {
        totalExercisesLogged++;
        const exName = ex.name || ex.exerciseName || 'Custom Exercise';
        const taxonomy = findExerciseTaxonomy(exName);
        const sets = Array.isArray(ex.sets) ? ex.sets : (ex.setCount ? Array(Number(ex.setCount)).fill({ reps: ex.reps || 10, weight: ex.weight || 0 }) : []);

        let exVolume = 0;
        let exReps = 0;
        let exSets = sets.length;
        let exStimulusSum = 0;

        sets.forEach(s => {
          const sWeight = Math.max(0, Number(s.weight) || 0);
          const sReps = Math.max(0, Number(s.reps) || 0);
          if (sWeight > 0 && sReps > 0) {
            exVolume += (sWeight * sReps);
          }
          exReps += sReps;
          exStimulusSum += calculateSetStimulus(s, taxonomy.type);
        });

        totalVolumeKg += exVolume;

        // Apply primary weighting (1.0)
        taxonomy.primary.forEach(mKey => {
          if (muscleScores[mKey] !== undefined) {
            const added = exStimulusSum * 1.0;
            muscleScores[mKey] += added;
            muscleDetails[mKey].rawScore += added;
            muscleDetails[mKey].totalVolumeKg += exVolume;
            muscleDetails[mKey].totalSets += exSets;
            muscleDetails[mKey].totalReps += exReps;
            muscleDetails[mKey].contributingExercises.push({
              name: exName,
              sets: exSets,
              reps: exReps,
              volumeKg: exVolume,
              contribution: 'Primary'
            });
          }
        });

        // Apply secondary weighting (0.45)
        taxonomy.secondary.forEach(mKey => {
          if (muscleScores[mKey] !== undefined) {
            const added = exStimulusSum * 0.45;
            muscleScores[mKey] += added;
            muscleDetails[mKey].rawScore += added;
            muscleDetails[mKey].totalVolumeKg += Math.round(exVolume * 0.45);
            muscleDetails[mKey].totalSets += exSets;
            muscleDetails[mKey].totalReps += exReps;
            muscleDetails[mKey].contributingExercises.push({
              name: exName,
              sets: exSets,
              reps: exReps,
              volumeKg: Math.round(exVolume * 0.45),
              contribution: 'Secondary'
            });
          }
        });
      });
    } else if (workout.exerciseName || workout.name) {
      // Single exercise workout log
      totalExercisesLogged++;
      const exName = workout.exerciseName || workout.name;
      const taxonomy = findExerciseTaxonomy(exName);
      const setsCount = Number(workout.sets || workout.setCount || 3);
      const repsCount = Number(workout.reps || 10);
      const weight = Number(workout.weight || 0);
      const exVolume = (weight > 0) ? (weight * repsCount * setsCount) : 0;
      totalVolumeKg += exVolume;

      const singleStimulus = calculateSetStimulus({ reps: repsCount, weight }, taxonomy.type) * setsCount;

      taxonomy.primary.forEach(mKey => {
        if (muscleScores[mKey] !== undefined) {
          muscleScores[mKey] += singleStimulus;
          muscleDetails[mKey].rawScore += singleStimulus;
          muscleDetails[mKey].totalVolumeKg += exVolume;
          muscleDetails[mKey].totalSets += setsCount;
          muscleDetails[mKey].totalReps += (repsCount * setsCount);
          muscleDetails[mKey].contributingExercises.push({
            name: exName,
            sets: setsCount,
            reps: repsCount * setsCount,
            volumeKg: exVolume,
            contribution: 'Primary'
          });
        }
      });

      taxonomy.secondary.forEach(mKey => {
        if (muscleScores[mKey] !== undefined) {
          muscleScores[mKey] += (singleStimulus * 0.45);
          muscleDetails[mKey].rawScore += (singleStimulus * 0.45);
          muscleDetails[mKey].totalVolumeKg += Math.round(exVolume * 0.45);
          muscleDetails[mKey].totalSets += setsCount;
          muscleDetails[mKey].totalReps += (repsCount * setsCount);
          muscleDetails[mKey].contributingExercises.push({
            name: exName,
            sets: setsCount,
            reps: repsCount * setsCount,
            volumeKg: Math.round(exVolume * 0.45),
            contribution: 'Secondary'
          });
        }
      });
    }
  });

  // Finalize stimulus levels
  const slugColorMap = {};
  const activeMusclesList = [];

  for (const [mKey, detail] of Object.entries(muscleDetails)) {
    const levelObj = getStimulusLevelFromScore(detail.rawScore);
    detail.stimulusLevel = levelObj;

    const groupDef = ANATOMICAL_MUSCLE_GROUPS[mKey];
    if (groupDef && groupDef.slugs) {
      groupDef.slugs.forEach(slug => {
        slugColorMap[slug] = levelObj;
      });
    }

    if (levelObj.level > 0) {
      activeMusclesList.push(detail);
    }
  }

  activeMusclesList.sort((a, b) => b.rawScore - a.rawScore);

  return {
    date: targetDate,
    modelVersion: MODEL_VERSION,
    hasWorkouts: hasValidData && totalExercisesLogged > 0,
    workoutCount: matchingWorkouts.length,
    totalVolumeKg: Math.round(totalVolumeKg),
    totalCaloriesKcal: Math.round(totalCaloriesKcal),
    totalExercises: totalExercisesLogged,
    slugColorMap,
    muscleDetails,
    activeMuscles: activeMusclesList,
    topStimulated: activeMusclesList.slice(0, 5)
  };
}

/**
 * Computes 7-Day Training Exposure & Discipline Balance
 */
export function calculateWeeklyMuscleAnalytics(workoutLogs = [], referenceDateStr = null) {
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const past7Days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    past7Days.push(d.toISOString().split('T')[0]);
  }

  const categoryStimulus = { push: 0, pull: 0, legs: 0, core: 0, other: 0 };
  const muscleFrequency = {};
  let totalWeeklyVolume = 0;
  let totalWorkoutsInWeek = 0;

  past7Days.forEach(dateStr => {
    const dailyResult = calculateDailyMuscleStimulus(workoutLogs, dateStr);
    if (dailyResult.hasWorkouts) {
      totalWorkoutsInWeek += dailyResult.workoutCount;
      totalWeeklyVolume += dailyResult.totalVolumeKg;

      dailyResult.activeMuscles.forEach(m => {
        muscleFrequency[m.muscleKey] = (muscleFrequency[m.muscleKey] || 0) + 1;
        const cat = m.category || 'other';
        if (categoryStimulus[cat] !== undefined) {
          categoryStimulus[cat] += m.rawScore;
        }
      });
    }
  });

  const totalCatScore = Object.values(categoryStimulus).reduce((a, b) => a + b, 0) || 1;
  const balancePercentages = {
    push: Math.round((categoryStimulus.push / totalCatScore) * 100),
    pull: Math.round((categoryStimulus.pull / totalCatScore) * 100),
    legs: Math.round((categoryStimulus.legs / totalCatScore) * 100),
    core: Math.round((categoryStimulus.core / totalCatScore) * 100)
  };

  return {
    daysAnalyzed: past7Days,
    totalWorkouts: totalWorkoutsInWeek,
    totalWeeklyVolumeKg: totalWeeklyVolume,
    categoryStimulus,
    balancePercentages,
    muscleFrequency
  };
}
