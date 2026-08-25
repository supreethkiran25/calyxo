/**
 * Calyxo Adaptive AI Workout Coach Engine (Premium)
 *
 * Generates custom dynamic training sessions, applies autoregulated progressive overload,
 * honors injury restrictions, and calculates 4-week strength baseline progression comparisons.
 */

export class AdaptiveWorkoutCoachEngine {
  /**
   * Generate an adaptive workout session tailored to recovery, equipment, and injury restrictions
   */
  static generateAdaptiveWorkout({
    goal = 'hypertrophy', // 'hypertrophy' | 'strength' | 'fat_loss' | 'endurance'
    muscleGroup = 'chest_triceps', // 'chest_triceps' | 'back_biceps' | 'legs_glutes' | 'shoulders_arms' | 'full_body'
    equipment = 'gym', // 'gym' | 'dumbbells_only' | 'bodyweight'
    experienceLevel = 'intermediate', // 'beginner' | 'intermediate' | 'advanced'
    durationMinutes = 45,
    injuryRestrictions = [], // e.g. ['shoulder_pain', 'lower_back_tightness']
    recoveryScore = 82,
    historicalWorkoutLogs = [],
    variationIndex = 0
  } = {}) {
    // 1. Determine volume factor from recovery score
    let setMultiplier = 1.0;
    let rpeRecommendation = 'RPE 8 (2 Reps in Reserve)';
    let coachAdvice = 'Recovery is primed. Train with progressive intensity.';

    if (recoveryScore < 60) {
      setMultiplier = 0.75;
      rpeRecommendation = 'RPE 6–7 (3–4 Reps in Reserve)';
      coachAdvice = 'Recovery score is constrained. Volume has been autoregulated by -25% to protect systemic fatigue.';
    } else if (recoveryScore >= 85) {
      setMultiplier = 1.2;
      rpeRecommendation = 'RPE 8.5–9 (1–2 Reps in Reserve)';
      coachAdvice = 'Optimal CNS readiness. Overload target weights by +2.5kg to +5kg where feasible.';
    }

    // 2. Select movement library based on equipment, split, injuries, and variationIndex
    const exercises = [];
    const hasShoulderIssue = injuryRestrictions.some(i => /shoulder/i.test(i));
    const hasLowerBackIssue = injuryRestrictions.some(i => /lower_back|lumbar|spine/i.test(i));
    const hasKneeIssue = injuryRestrictions.some(i => /knee|patell/i.test(i));

    const isGym = equipment === 'gym';
    const vIdx = Math.abs(Number(variationIndex) || 0) % 3;

    const SPLIT_TITLES = {
      chest_triceps: 'Chest + Triceps',
      back_biceps: 'Back + Biceps',
      shoulders_legs: 'Shoulder + Legs',
      shoulders_arms: 'Shoulders + Arms',
      legs_glutes: 'Legs & Glutes',
      push: 'Push (Chest, Delts & Tri)',
      pull: 'Pull (Back, Rear Delts & Bi)',
      full_body: 'Full Body Compound'
    };

    switch (muscleGroup) {
      case 'chest_triceps':
        if (isGym) {
          if (vIdx === 0) {
            exercises.push(
              { id: 'ex-bench-press', name: hasShoulderIssue ? 'Neutral Grip Dumbbell Flat Bench Press' : 'Barbell Flat Bench Press', targetSets: Math.round(4 * setMultiplier), targetReps: goal === 'strength' ? '4–6' : '8–10', suggestedWeightKg: 80, tempo: '3-0-1-0 (3s eccentric)', rpe: rpeRecommendation, notes: hasShoulderIssue ? 'Adapted for shoulder safety with neutral dumbbell grip.' : 'Primary compound overload lift.' },
              { id: 'ex-incline-press', name: 'Incline Dumbbell Press (30° angle)', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 28, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Upper clavicular head development.' },
              { id: 'ex-chest-fly', name: 'Cable Low-to-High Chest Fly', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 15, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Deep stretch at end range without joint strain.' },
              { id: 'ex-tricep-pushdown', name: 'Rope Tricep Cable Pushdown', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 25, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Flare rope outward at full elbow lockout.' },
              { id: 'ex-overhead-ext', name: 'Dual Dumbbell Overhead Tricep Extension', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 20, tempo: '3-0-1-0', rpe: 'RPE 8', notes: 'Targets the long head of the triceps.' }
            );
          } else if (vIdx === 1) {
            exercises.push(
              { id: 'ex-incline-bb', name: 'Incline Barbell Bench Press (45°)', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: 70, tempo: '3-0-1-0', rpe: rpeRecommendation, notes: 'Upper chest mass builder.' },
              { id: 'ex-flat-db-press', name: 'Flat Heavy Dumbbell Press', targetSets: Math.round(3 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 30, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Full pectoral range of motion.' },
              { id: 'ex-weighted-dips', name: 'Parallel Bar Dips (Chest Leaning)', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 0, tempo: '2-0-1-0', rpe: 'RPE 8.5', notes: 'Lower chest & triceps compound.' },
              { id: 'ex-pec-deck', name: 'Pec Deck Machine Fly (Peak Squeeze)', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 45, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Continuous resistance curve.' },
              { id: 'ex-skull-crushers', name: 'EZ-Bar Lying Tricep Skullcrushers', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 28, tempo: '3-0-1-0', rpe: 'RPE 8', notes: 'Tricep mass overload.' }
            );
          } else {
            exercises.push(
              { id: 'ex-hammer-press', name: 'Hammer Strength Incline Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 75, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Converging chest overload.' },
              { id: 'ex-db-fly-press', name: 'Dumbbell Fly-Press Hybrid', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 22, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Stretch-mediated hypertrophy.' },
              { id: 'ex-cable-crossover', name: 'High-to-Low Cable Crossovers', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 18, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Squeeze inner lower pectorals.' },
              { id: 'ex-straight-bar-tri', name: 'Straight Bar Cable Tricep Pushdown', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 30, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Lateral head tricep emphasis.' },
              { id: 'ex-single-cable-tri', name: 'Single-Arm Overhead Cable Extension', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 12, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Unilateral long head stretch.' }
            );
          }
        } else {
          exercises.push(
            { id: 'ex-db-press', name: vIdx === 0 ? 'Dumbbell Floor / Flat Press' : vIdx === 1 ? 'Neutral Grip DB Floor Press' : 'Dumbbell Squeeze Press', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 22, tempo: '3-0-1-0', rpe: rpeRecommendation, notes: 'Dumbbell progressive overload.' },
            { id: 'ex-incline-db-press', name: 'Incline Dumbbell Chest Press', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 18, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Upper chest angle focus.' },
            { id: 'ex-pushups', name: vIdx === 1 ? 'Feet-Elevated Push-Ups' : 'Deficit Push-Ups / Diamond Push-Ups', targetSets: Math.round(3 * setMultiplier), targetReps: '12–18', suggestedWeightKg: 0, tempo: '2-1-1-0', rpe: 'RPE 8.5', notes: 'Bodyweight hypertrophy finish.' },
            { id: 'ex-tricep-kickback', name: 'Incline Dumbbell Overhead Tricep Extension', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 12, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Full tricep long head stretch.' }
          );
        }
        break;

      case 'back_biceps':
        if (isGym) {
          if (vIdx === 0) {
            exercises.push(
              { id: 'ex-pullup-lat', name: 'Pronated Pull-Ups / Lat Pulldown', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 65, tempo: '3-0-1-1', rpe: rpeRecommendation, notes: 'Full scapular depression and retraction.' },
              { id: 'ex-row', name: hasLowerBackIssue ? 'Chest-Supported Dumbbell Row' : 'Barbell Bent-Over Row', targetSets: Math.round(4 * setMultiplier), targetReps: '8–12', suggestedWeightKg: 35, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Lat and rhomboid thickness.' },
              { id: 'ex-seated-cable-row', name: 'Close-Grip Seated Cable Row', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 55, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Drive elbows back and squeeze mid-traps.' },
              { id: 'ex-incline-bicep-curl', name: 'Incline Dumbbell Bicep Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 14, tempo: '3-0-1-1', rpe: 'RPE 8.5', notes: 'Strict form with full supination at top.' },
              { id: 'ex-hammer-curl', name: 'Dumbbell Cross-Body Hammer Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 14, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Brachialis & forearm hypertrophy.' }
            );
          } else if (vIdx === 1) {
            exercises.push(
              { id: 'ex-t-bar-row', name: 'T-Bar Supported Row / Chest-Supported Row', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 50, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Heavy mid-back density.' },
              { id: 'ex-neutral-lat', name: 'Neutral-Grip Lat Pulldown (V-Bar)', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 60, tempo: '3-0-1-1', rpe: rpeRecommendation, notes: 'Deep lat stretch and lower lat focus.' },
              { id: 'ex-single-arm-db-row', name: 'Single-Arm Heavy Dumbbell Row', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12/arm', suggestedWeightKg: 28, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Unilateral back symmetry.' },
              { id: 'ex-standing-ez-curl', name: 'Standing EZ-Bar Bicep Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 30, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Bicep mass overload.' },
              { id: 'ex-incline-hammer', name: 'Incline Bench Dumbbell Hammer Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 12, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Brachialis & peak development.' }
            );
          } else {
            exercises.push(
              { id: 'ex-underhand-row', name: 'Barbell Underhand (Yates) Row', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 65, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Lower lats and bicep recruitment.' },
              { id: 'ex-cable-pullover', name: 'Straight-Arm Cable Lat Pullovers', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 25, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Pure lat isolation without arm fatigue.' },
              { id: 'ex-single-cable-row', name: 'Single-Arm Cable Row with Rotation', targetSets: Math.round(3 * setMultiplier), targetReps: '12/arm', suggestedWeightKg: 30, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Full stretch & contraction.' },
              { id: 'ex-preacher-curl', name: 'Preacher Curl Machine / EZ Preacher', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 25, tempo: '3-0-1-0', rpe: 'RPE 8.5', notes: 'Strict bicep short head isolation.' },
              { id: 'ex-cable-rope-curl', name: 'Cable Rope Hammer Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 22, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Forearms & peak arm pump.' }
            );
          }
        } else {
          exercises.push(
            { id: 'ex-db-bent-row', name: 'Dumbbell Bent-Over Row (Dual Hand)', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 22, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Flat back, hip hinge compound.' },
            { id: 'ex-single-arm-row', name: 'Single-Arm Dumbbell Row (Bench Support)', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12/arm', suggestedWeightKg: 24, tempo: '2-0-1-1', rpe: rpeRecommendation, notes: 'Deep lat stretch on eccentric.' },
            { id: 'ex-db-curl', name: 'Standing Alternating Dumbbell Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 14, tempo: '3-0-1-1', rpe: 'RPE 8.5', notes: 'Keep elbows pinned to sides.' },
            { id: 'ex-db-hammer', name: 'Dumbbell Hammer Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 12, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Brachialis focus.' }
          );
        }
        break;

      case 'shoulders_legs':
        if (isGym) {
          if (vIdx === 0) {
            exercises.push(
              { id: 'ex-squat', name: hasKneeIssue ? 'Box Squats / Leg Press' : 'Barbell Back Squats', targetSets: Math.round(4 * setMultiplier), targetReps: goal === 'strength' ? '4–6' : '8–10', suggestedWeightKg: 85, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Full depth compound quadriceps driver.' },
              { id: 'ex-overhead-press', name: hasShoulderIssue ? 'Neutral Grip Seated DB Shoulder Press' : 'Standing Barbell Overhead Press (OHP)', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: 50, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Anterior delt & clavicular compound.' },
              { id: 'ex-rdl', name: hasLowerBackIssue ? 'Dumbbell Romanian Deadlifts' : 'Barbell Romanian Deadlifts (RDL)', targetSets: Math.round(3 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 75, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Hamstring & glute eccentric stretch.' },
              { id: 'ex-lat-raise', name: 'Dumbbell / Cable Lateral Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 12, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Medial deltoid isolation.' },
              { id: 'ex-leg-curl-ext', name: 'Lying Leg Curls / Leg Extensions Superset', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 45, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Complete quad & hamstring finishing pump.' },
              { id: 'ex-face-pull', name: 'Rope Cable Face Pulls', targetSets: Math.round(3 * setMultiplier), targetReps: '15–20', suggestedWeightKg: 20, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Rear deltoids & rotator cuff posture armor.' }
            );
          } else if (vIdx === 1) {
            exercises.push(
              { id: 'ex-hack-squat', name: 'Hack Squats / Heavy 45° Leg Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 120, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Deep knee flexion and quad sweep.' },
              { id: 'ex-seated-db-ohp', name: 'Seated Heavy Dumbbell Shoulder Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 24, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Strict deltoid vertical pushing.' },
              { id: 'ex-db-rdl-hams', name: 'Dumbbell Romanian Deadlifts (Toe Elevated)', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 26, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Hamstring stretch tension.' },
              { id: 'ex-cable-lat-raise', name: 'Behind-the-Back Cable Lateral Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Continuous deltoid tension.' },
              { id: 'ex-walking-lunges-gym', name: 'Dumbbell Walking Lunges', targetSets: Math.round(3 * setMultiplier), targetReps: '12/leg', suggestedWeightKg: 16, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Glute & quad unilateral drive.' },
              { id: 'ex-rear-delt-fly', name: 'Reverse Pec Deck / Cable Rear Delt Flyes', targetSets: Math.round(3 * setMultiplier), targetReps: '15', suggestedWeightKg: 35, tempo: '2-0-1-1', rpe: 'RPE 8', notes: '3D deltoid roundness.' }
            );
          } else {
            exercises.push(
              { id: 'ex-front-squat', name: 'Barbell Front Squats / Goblet Squats', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: 70, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'High quad & core engagement.' },
              { id: 'ex-arnold-press', name: 'Arnold Dumbbell Shoulder Press', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 20, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Anterior & medial delt rotation.' },
              { id: 'ex-bulgarian-gym', name: 'Bulgarian Split Squats (Dumbbells)', targetSets: Math.round(3 * setMultiplier), targetReps: '10/leg', suggestedWeightKg: 18, tempo: '2-1-1-0', rpe: 'RPE 8.5', notes: 'Unilateral glute & quad builder.' },
              { id: 'ex-egyptian-lat', name: 'Leaning Cable Lateral Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Overloaded stretch.' },
              { id: 'ex-seated-leg-curl', name: 'Seated Hamstring Curls (Fascial Stretch)', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 45, tempo: '3-0-1-1', rpe: 'RPE 8', notes: 'Hamstring muscle building.' },
              { id: 'ex-face-pull-2', name: 'High Cable Rope Face Pulls', targetSets: Math.round(3 * setMultiplier), targetReps: '15–20', suggestedWeightKg: 22, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Shoulder stability armor.' }
            );
          }
        } else {
          exercises.push(
            { id: 'ex-db-goblet-squat', name: 'Dumbbell Goblet Squats (Tempo 3-1-1)', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 28, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Upright torso with deep quad loading.' },
            { id: 'ex-db-ohp', name: 'Standing Dumbbell Overhead Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 18, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Deltoid compound power.' },
            { id: 'ex-db-rdl', name: 'Dumbbell Romanian Deadlifts', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 24, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Posterior chain loading.' },
            { id: 'ex-db-lat-raise', name: 'Dumbbell Lateral Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Strict lateral delt sweep.' },
            { id: 'ex-db-lunges', name: 'Dumbbell Walking / Reverse Lunges', targetSets: Math.round(3 * setMultiplier), targetReps: '12/leg', suggestedWeightKg: 16, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Unilateral quad & glute drive.' }
          );
        }
        break;

      case 'shoulders_arms':
        if (isGym) {
          if (vIdx === 0) {
            exercises.push(
              { id: 'ex-seated-db-press', name: 'Seated Dumbbell Shoulder Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 24, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Primary deltoid compound.' },
              { id: 'ex-cable-lat-raise', name: 'Cable Lateral Raises (Behind the back)', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Continuous lateral delt tension.' },
              { id: 'ex-ez-bar-curl', name: 'EZ-Bar Standing Bicep Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 30, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Bicep peak contraction.' },
              { id: 'ex-skull-crusher', name: 'EZ-Bar Lying Tricep Skull Crushers', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 28, tempo: '3-0-1-0', rpe: 'RPE 8', notes: 'Triceps medial and long head overload.' },
              { id: 'ex-cable-face-pull', name: 'Cable Face Pulls & Rear Delt Flyes', targetSets: Math.round(3 * setMultiplier), targetReps: '15', suggestedWeightKg: 20, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Shoulder stability and 3D deltoid roundness.' }
            );
          } else if (vIdx === 1) {
            exercises.push(
              { id: 'ex-standing-ohp-bb', name: 'Standing Barbell Military Press', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: 50, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Full body overhead power.' },
              { id: 'ex-db-lat-dropset', name: 'Dumbbell Lateral Raises (Triple Drop Set)', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 12, tempo: '2-0-1-1', rpe: 'RPE 9', notes: 'Maximum metabolic side delt stress.' },
              { id: 'ex-incline-db-curls', name: 'Incline Dumbbell Bicep Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 14, tempo: '3-0-1-1', rpe: 'RPE 8.5', notes: 'Long head stretch.' },
              { id: 'ex-rope-overhead-tri', name: 'Cable Rope Overhead Tricep Extension', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 22, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Tricep long head stretch.' },
              { id: 'ex-db-rear-delt', name: 'Bent-Over Dumbbell Rear Delt Flyes', targetSets: Math.round(3 * setMultiplier), targetReps: '15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Posterior delt isolation.' }
            );
          } else {
            exercises.push(
              { id: 'ex-arnold-shoulder', name: 'Arnold Dumbbell Shoulder Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 22, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Multi-angle delt mass.' },
              { id: 'ex-cable-egyptian', name: 'Leaning Cable Side Lateral Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Isolated peak contraction.' },
              { id: 'ex-preacher-curls', name: 'Preacher Bicep Curls (EZ-Bar)', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 26, tempo: '3-0-1-0', rpe: 'RPE 8', notes: 'Strict lower bicep development.' },
              { id: 'ex-straight-pushdown', name: 'Straight-Bar Cable Tricep Pushdown', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 30, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Tricep lockout power.' },
              { id: 'ex-face-pull-arms', name: 'Rope Face Pulls & External Rotations', targetSets: Math.round(3 * setMultiplier), targetReps: '15–20', suggestedWeightKg: 18, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Rotator cuff stability.' }
            );
          }
        } else {
          exercises.push(
            { id: 'ex-db-press-arms', name: 'Standing Dumbbell Shoulder Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 18, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Deltoid compound.' },
            { id: 'ex-db-lat-raise-arms', name: 'Dumbbell Lateral Raises (Drop set on last)', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Side delt pump.' },
            { id: 'ex-db-incline-curl', name: 'Incline Dumbbell Bicep Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 12, tempo: '3-0-1-1', rpe: 'RPE 8', notes: 'Long head bicep stretch.' },
            { id: 'ex-db-overhead-tri', name: 'Overhead Dumbbell Tricep Extension', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 18, tempo: '3-0-1-0', rpe: 'RPE 8', notes: 'Tricep stretch & lockout.' }
          );
        }
        break;

      case 'legs_glutes':
        if (isGym) {
          if (vIdx === 0) {
            exercises.push(
              { id: 'ex-barbell-squat', name: 'Barbell Back Squats / Hack Squats', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: 90, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Quad & glute compound overload.' },
              { id: 'ex-gym-rdl', name: 'Barbell Romanian Deadlifts (RDL)', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 80, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Hamstring hypertrophy.' },
              { id: 'ex-leg-press', name: 'Leg Press (Feet high for glutes/hams)', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 140, tempo: '2-1-1-0', rpe: 'RPE 8', notes: 'High volume leg power.' },
              { id: 'ex-leg-curl', name: 'Seated or Lying Hamstring Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 50, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Knee flexion hamstring isolation.' },
              { id: 'ex-calf-raise', name: 'Standing Calf Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '15–20', suggestedWeightKg: 60, tempo: '2-1-1-1', rpe: 'RPE 8.5', notes: 'Pause 1s at bottom stretch.' }
            );
          } else if (vIdx === 1) {
            exercises.push(
              { id: 'ex-hack-squats-legs', name: 'Hack Squats (Narrow Stance Quad Focus)', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 110, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Maximum quad isolation.' },
              { id: 'ex-hip-thrust', name: 'Barbell Glute Hip Thrusts', targetSets: Math.round(4 * setMultiplier), targetReps: '8–12', suggestedWeightKg: 100, tempo: '2-1-1-1', rpe: rpeRecommendation, notes: 'Peak glute extension power.' },
              { id: 'ex-bulgarian-split-gym', name: 'Bulgarian Split Squats (Dumbbells)', targetSets: Math.round(3 * setMultiplier), targetReps: '10/leg', suggestedWeightKg: 20, tempo: '2-1-1-0', rpe: 'RPE 8.5', notes: 'Unilateral balance & hypertrophy.' },
              { id: 'ex-lying-leg-curl', name: 'Lying Hamstring Leg Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 45, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Hamstring peak squeeze.' },
              { id: 'ex-seated-calf', name: 'Seated Calf Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '15–20', suggestedWeightKg: 45, tempo: '2-1-1-1', rpe: 'RPE 8', notes: 'Soleus calf developer.' }
            );
          } else {
            exercises.push(
              { id: 'ex-front-squat-legs', name: 'Barbell Front Squats', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: 75, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Anterior chain quad emphasis.' },
              { id: 'ex-db-rdl-legs-2', name: 'Dumbbell Romanian Deadlifts (Deficit)', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 28, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Hamstrings & glute fascia stretch.' },
              { id: 'ex-leg-ext', name: 'Leg Extensions (Toes Inward/Outward)', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 55, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Rectus femoris pump.' },
              { id: 'ex-glute-kickback', name: 'Cable Glute Kickbacks', targetSets: Math.round(3 * setMultiplier), targetReps: '15/leg', suggestedWeightKg: 20, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Glute medius shaping.' },
              { id: 'ex-donkey-calf', name: 'Leg Press Calf Press', targetSets: Math.round(4 * setMultiplier), targetReps: '15–20', suggestedWeightKg: 90, tempo: '2-1-1-1', rpe: 'RPE 8.5', notes: 'Full gastroc calf stretch.' }
            );
          }
        } else {
          exercises.push(
            { id: 'ex-db-squats', name: 'Dumbbell Goblet Squats', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 28, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Quad loading.' },
            { id: 'ex-db-rdl-legs', name: 'Dumbbell Romanian Deadlifts', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 24, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Hamstrings & glutes.' },
            { id: 'ex-bulgarian-split', name: 'Bulgarian Split Squats', targetSets: Math.round(3 * setMultiplier), targetReps: '10/leg', suggestedWeightKg: 14, tempo: '2-1-1-0', rpe: 'RPE 8.5', notes: 'Unilateral glute & quad driver.' },
            { id: 'ex-walking-lunges', name: 'Dumbbell Walking Lunges', targetSets: Math.round(3 * setMultiplier), targetReps: '12/leg', suggestedWeightKg: 16, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Leg volume finish.' }
          );
        }
        break;

      case 'push':
        if (vIdx === 0) {
          exercises.push(
            { id: 'ex-push-bench', name: isGym ? 'Barbell Flat Bench Press' : 'Dumbbell Flat Bench Press', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: isGym ? 80 : 26, tempo: '3-0-1-0', rpe: rpeRecommendation, notes: 'Chest compound driver.' },
            { id: 'ex-push-incline', name: 'Incline Dumbbell Press', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 24, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Upper chest.' },
            { id: 'ex-push-ohp', name: isGym ? 'Standing Barbell Overhead Press' : 'Standing DB Shoulder Press', targetSets: Math.round(3 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 50 : 18, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Anterior delt overload.' },
            { id: 'ex-push-lat-raise', name: 'Dumbbell Lateral Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Side delt hypertrophy.' },
            { id: 'ex-push-tri', name: isGym ? 'Cable Rope Tricep Pushdown' : 'Overhead DB Tricep Extension', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: isGym ? 25 : 18, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Tricep finish.' }
          );
        } else if (vIdx === 1) {
          exercises.push(
            { id: 'ex-push-incline-bb', name: isGym ? 'Incline Barbell Bench Press' : 'Incline DB Press (45°)', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: isGym ? 75 : 24, tempo: '3-0-1-0', rpe: rpeRecommendation, notes: 'Upper chest overload.' },
            { id: 'ex-push-flat-db', name: 'Flat Heavy Dumbbell Press', targetSets: Math.round(3 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 28, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Pectoral range of motion.' },
            { id: 'ex-push-seated-military', name: isGym ? 'Seated Military Press (Barbell/DB)' : 'Seated DB Press', targetSets: Math.round(3 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 45 : 20, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Shoulder pushing power.' },
            { id: 'ex-push-cable-lat', name: isGym ? 'Cable Lateral Raises' : 'DB Lateral Raise Drop Set', targetSets: Math.round(4 * setMultiplier), targetReps: '12–15', suggestedWeightKg: isGym ? 10 : 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Continuous deltoid tension.' },
            { id: 'ex-push-skull', name: isGym ? 'Lying EZ-Bar Skullcrushers' : 'Incline DB Tricep Extension', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: isGym ? 26 : 14, tempo: '3-0-1-0', rpe: 'RPE 8', notes: 'Triceps long head overload.' }
          );
        } else {
          exercises.push(
            { id: 'ex-push-dips', name: isGym ? 'Weighted Dips / Bodyweight Dips' : 'Chair / Bench Dips', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 0, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Chest and triceps power compound.' },
            { id: 'ex-push-decline-db', name: 'Decline / Flat Dumbbell Press', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 24, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Lower chest activation.' },
            { id: 'ex-push-arnold', name: 'Arnold Dumbbell Press', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 18, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: '3D deltoid rotation.' },
            { id: 'ex-push-cable-cross', name: isGym ? 'High-to-Low Cable Flyes' : 'Push-up Finisher', targetSets: Math.round(3 * setMultiplier), targetReps: '15', suggestedWeightKg: isGym ? 18 : 0, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Inner chest contraction.' },
            { id: 'ex-push-straight-tri', name: isGym ? 'Straight-Bar Cable Pushdown' : 'Diamond Push-ups', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: isGym ? 28 : 0, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Triceps burnout.' }
          );
        }
        break;

      case 'pull':
        if (vIdx === 0) {
          exercises.push(
            { id: 'ex-pull-lat', name: isGym ? 'Wide-Grip Lat Pulldowns / Pull-Ups' : 'Pull-Ups / Inverted Rows', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 65 : 0, tempo: '3-0-1-1', rpe: rpeRecommendation, notes: 'Lat width.' },
            { id: 'ex-pull-row', name: hasLowerBackIssue ? 'Chest-Supported Dumbbell Rows' : (isGym ? 'Barbell Bent-Over Rows' : 'Dumbbell Bent-Over Rows'), targetSets: Math.round(4 * setMultiplier), targetReps: '8–12', suggestedWeightKg: isGym ? 60 : 24, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Upper & mid back thickness.' },
            { id: 'ex-pull-facepull', name: isGym ? 'Cable Face Pulls' : 'Dumbbell Rear Delt Flyes', targetSets: Math.round(4 * setMultiplier), targetReps: '15', suggestedWeightKg: isGym ? 20 : 8, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Rear delts & rotator cuff.' },
            { id: 'ex-pull-curl', name: 'Incline Dumbbell Bicep Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 14, tempo: '3-0-1-1', rpe: 'RPE 8.5', notes: 'Bicep peak.' },
            { id: 'ex-pull-hammer', name: 'Dumbbell Hammer Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 12, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Forearm & brachialis.' }
          );
        } else if (vIdx === 1) {
          exercises.push(
            { id: 'ex-pull-tbar', name: isGym ? 'T-Bar Rows / Chest-Supported Rows' : 'Single-Arm DB Rows', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 55 : 26, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Mid-back thickness.' },
            { id: 'ex-pull-neutral-lat', name: isGym ? 'V-Bar Close-Grip Lat Pulldowns' : 'Doorframe Rows / Inverted Rows', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: isGym ? 60 : 0, tempo: '3-0-1-1', rpe: rpeRecommendation, notes: 'Lower lat stretch.' },
            { id: 'ex-pull-rear-pec', name: isGym ? 'Reverse Pec Deck Machine' : 'Prone Rear Delt Raises', targetSets: Math.round(4 * setMultiplier), targetReps: '15', suggestedWeightKg: isGym ? 35 : 8, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: 'Rear delt isolation.' },
            { id: 'ex-pull-ez-curl', name: isGym ? 'EZ-Bar Standing Bicep Curls' : 'Standing DB Supinated Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 28 : 14, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Bicep mass overload.' },
            { id: 'ex-pull-cross-hammer', name: 'Cross-Body Dumbbell Hammer Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 14, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Brachialis & forearm thickness.' }
          );
        } else {
          exercises.push(
            { id: 'ex-pull-deadlift', name: hasLowerBackIssue ? 'Trap Bar / Dumbbell Deadlifts' : (isGym ? 'Conventional Barbell Deadlifts' : 'Heavy DB Deadlifts'), targetSets: Math.round(3 * setMultiplier), targetReps: '5–6', suggestedWeightKg: isGym ? 100 : 30, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Full posterior chain strength.' },
            { id: 'ex-pull-single-lat', name: isGym ? 'Single-Arm Cable Lat Pulldowns' : 'Dumbbell Renegade Rows', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12/arm', suggestedWeightKg: isGym ? 30 : 18, tempo: '2-0-1-1', rpe: rpeRecommendation, notes: 'Unilateral lat development.' },
            { id: 'ex-pull-straight-arm', name: isGym ? 'Straight-Arm Cable Pullovers' : 'Dumbbell Pullovers', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: isGym ? 22 : 18, tempo: '2-0-1-1', rpe: 'RPE 8', notes: 'Lat sweep isolation.' },
            { id: 'ex-pull-preacher', name: isGym ? 'Preacher Bicep Curls' : 'Concentration Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: isGym ? 24 : 12, tempo: '3-0-1-0', rpe: 'RPE 8.5', notes: 'Short head peak contraction.' },
            { id: 'ex-pull-reverse-curl', name: 'Reverse Grip EZ-Bar / DB Curls', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: isGym ? 20 : 10, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Brachioradialis grip strength.' }
          );
        }
        break;

      case 'full_body':
      default:
        if (vIdx === 0) {
          exercises.push(
            { id: 'ex-fb-squat', name: isGym ? 'Barbell Back Squats' : 'Dumbbell Goblet Squats', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: isGym ? 85 : 28, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Lower body foundation.' },
            { id: 'ex-fb-press', name: isGym ? 'Barbell Flat Bench Press' : 'Dumbbell Flat Bench Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 75 : 24, tempo: '3-0-1-0', rpe: rpeRecommendation, notes: 'Upper body push.' },
            { id: 'ex-fb-pull', name: isGym ? 'Lat Pulldowns / Pull-Ups' : 'Dumbbell Bent-Over Rows', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 65 : 22, tempo: '2-1-1-1', rpe: rpeRecommendation, notes: 'Upper body pull.' },
            { id: 'ex-fb-rdl', name: 'Dumbbell Romanian Deadlifts', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 24, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Posterior chain.' },
            { id: 'ex-fb-delts', name: 'Dumbbell Standing Overhead Press & Lateral Raises', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 14, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Shoulder stability.' }
          );
        } else if (vIdx === 1) {
          exercises.push(
            { id: 'ex-fb-rdl-heavy', name: isGym ? 'Barbell Romanian Deadlifts' : 'Heavy DB Romanian Deadlifts', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 80 : 26, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Hamstring & glute driver.' },
            { id: 'ex-fb-incline-db', name: 'Incline Dumbbell Chest Press', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 26, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Upper chest mass.' },
            { id: 'ex-fb-seated-row', name: isGym ? 'Close-Grip Seated Cable Row' : 'Single-Arm DB Row', targetSets: Math.round(4 * setMultiplier), targetReps: '10–12', suggestedWeightKg: isGym ? 55 : 24, tempo: '2-0-1-1', rpe: rpeRecommendation, notes: 'Mid-back thickness.' },
            { id: 'ex-fb-leg-press', name: isGym ? 'Leg Press (Moderate Stance)' : 'Bulgarian Split Squats', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: isGym ? 120 : 16, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Quad volume overload.' },
            { id: 'ex-fb-lateral-raise', name: 'Dumbbell Lateral Raises & Face Pulls Superset', targetSets: Math.round(3 * setMultiplier), targetReps: '12–15', suggestedWeightKg: 10, tempo: '2-0-1-1', rpe: 'RPE 8.5', notes: '3D deltoid roundness.' }
          );
        } else {
          exercises.push(
            { id: 'ex-fb-front-squat', name: isGym ? 'Barbell Front Squats / Hack Squats' : 'Dumbbell Front Squats', targetSets: Math.round(4 * setMultiplier), targetReps: '6–8', suggestedWeightKg: isGym ? 70 : 22, tempo: '3-1-1-0', rpe: rpeRecommendation, notes: 'Quad & core power.' },
            { id: 'ex-fb-dips', name: isGym ? 'Weighted Dips / Flat DB Press' : 'Push-up Variations', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: 0, tempo: '2-0-1-0', rpe: rpeRecommendation, notes: 'Upper pushing power.' },
            { id: 'ex-fb-tbar', name: isGym ? 'T-Bar Supported Row' : 'Dumbbell Bent-Over Row', targetSets: Math.round(4 * setMultiplier), targetReps: '8–10', suggestedWeightKg: isGym ? 50 : 22, tempo: '2-1-1-0', rpe: rpeRecommendation, notes: 'Lat & rhomboid power.' },
            { id: 'ex-fb-lunges', name: 'Dumbbell Walking Lunges', targetSets: Math.round(3 * setMultiplier), targetReps: '12/leg', suggestedWeightKg: 16, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Unilateral leg stamina.' },
            { id: 'ex-fb-arnold-tri', name: 'Arnold Dumbbell Shoulder Press & Tricep Pushdown', targetSets: Math.round(3 * setMultiplier), targetReps: '10–12', suggestedWeightKg: 16, tempo: '2-0-1-0', rpe: 'RPE 8', notes: 'Shoulder & arm finish.' }
          );
        }
        break;
    }

    const totalSetsPlanned = exercises.reduce((acc, ex) => acc + ex.targetSets, 0);
    const displaySplitTitle = SPLIT_TITLES[muscleGroup] || 'Adaptive Training';

    return {
      success: true,
      title: `Today's Adaptive Workout: ${displaySplitTitle}`,
      muscleGroup: displaySplitTitle,
      durationMinutes,
      experienceLevel: experienceLevel.toUpperCase(),
      equipment: equipment.toUpperCase(),
      recoveryScore,
      targetRpe: rpeRecommendation,
      coachAdvice,
      totalSets: totalSetsPlanned,
      estimatedVolumeKg: totalSetsPlanned * 8 * 45,
      exercises
    };
  }

  /**
   * Compare Current Workout Performance against 4-Week Strength Baseline
   */
  static compute4WeekBaselineComparison({
    currentWorkout = {},
    historicalLogs = []
  } = {}) {
    // Current workout metrics
    let currentMaxBench = 0;
    let currentTonnage = 0;

    const currentExercises = currentWorkout.exercises || [currentWorkout];
    currentExercises.forEach(ex => {
      const name = (ex.name || ex.exercise_name || '').toLowerCase();
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      sets.forEach(s => {
        const wt = Number(s.weight || 0);
        const reps = Number(s.reps || 0);
        if (name.includes('bench') || name.includes('press')) {
          if (wt > currentMaxBench) currentMaxBench = wt;
        }
        currentTonnage += wt * reps;
      });
      if (sets.length === 0 && (Number(ex.weight) || 0) > 0) {
        const wt = Number(ex.weight || 0);
        const reps = Number(ex.reps || 0);
        const setCt = Number(ex.sets || 1);
        if (name.includes('bench') || name.includes('press')) {
          if (wt > currentMaxBench) currentMaxBench = wt;
        }
        currentTonnage += wt * reps * setCt;
      }
    });

    // Search 4-week history
    const fourWeeksAgo = Date.now() - (28 * 86400000);
    const validPastLogs = (historicalLogs || []).filter(l => (l.timestamp || Date.now()) >= fourWeeksAgo);

    let baselineMaxBench = null;
    let baselineAvgTonnage = null;

    if (validPastLogs.length > 0) {
      let pastMax = 0;
      let pastTonnageSum = 0;
      validPastLogs.forEach(l => {
        const sets = Array.isArray(l.sets) ? l.sets : [];
        sets.forEach(s => {
          const wt = Number(s.weight || 0);
          const reps = Number(s.reps || 0);
          if ((l.name || '').toLowerCase().includes('bench') && wt > pastMax) {
            pastMax = wt;
          }
          pastTonnageSum += wt * reps;
        });
        if (sets.length === 0 && (Number(l.weight) || 0) > 0) {
          const wt = Number(l.weight || 0);
          const reps = Number(l.reps || 0);
          const setCt = Number(l.sets || 1);
          if ((l.name || '').toLowerCase().includes('bench') && wt > pastMax) {
            pastMax = wt;
          }
          pastTonnageSum += wt * reps * setCt;
        }
      });
      if (pastMax > 0) baselineMaxBench = pastMax;
      if (pastTonnageSum > 0) baselineAvgTonnage = Math.round(pastTonnageSum / validPastLogs.length);
    }

    if (baselineMaxBench === null && baselineAvgTonnage === null) {
      return {
        currentTonnage,
        baselineAvgTonnage: 0,
        tonnageDelta: 0,
        currentMaxLiftKg: currentMaxBench || 0,
        baselineMaxLiftKg: 0,
        liftDeltaKg: 0,
        headline: 'Initial baseline calibration session. Log your sets today to establish your progressive overload moving average.',
        progressiveOverloadAchieved: false,
        fourWeekSummary: 'Historical baseline will automatically calculate after your initial workout sessions are recorded.'
      };
    }

    const baselineBenchVal = baselineMaxBench || currentMaxBench;
    const baselineTonnageVal = baselineAvgTonnage || currentTonnage;
    const benchDeltaKg = currentMaxBench - baselineBenchVal;
    const tonnageDelta = currentTonnage - baselineTonnageVal;

    let progressionMessage = '';
    if (benchDeltaKg > 0) {
      progressionMessage = `Your bench press improved ${benchDeltaKg}kg compared with your 4-week baseline.`;
    } else if (benchDeltaKg === 0) {
      progressionMessage = `Maintained your peak 4-week baseline intensity (${currentMaxBench}kg) with high movement velocity.`;
    } else {
      progressionMessage = `Deload volume applied. Focus on tendon conditioning and movement velocity.`;
    }

    return {
      currentTonnage,
      baselineAvgTonnage: baselineTonnageVal,
      tonnageDelta,
      currentMaxLiftKg: currentMaxBench || 0,
      baselineMaxLiftKg: baselineBenchVal,
      liftDeltaKg: benchDeltaKg,
      headline: progressionMessage,
      progressiveOverloadAchieved: benchDeltaKg > 0 || tonnageDelta > 0,
      fourWeekSummary: `Session volume is ${tonnageDelta >= 0 ? '+' : ''}${tonnageDelta} kg vs your 28-day moving median.`
    };
  }
}

export const adaptiveWorkoutCoachEngine = AdaptiveWorkoutCoachEngine;
export default AdaptiveWorkoutCoachEngine;
