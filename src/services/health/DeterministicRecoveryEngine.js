/**
 * Calyxo Deterministic Recovery Engine
 *
 * Mathematically calculates recovery status, cellular replenishment, and training readiness.
 *
 * Inputs:
 * - Sleep Duration (Hours) & Sleep Quality
 * - Daily Hydration Adherence (Current ml vs Target ml)
 * - Daily Protein Adherence (Current g vs Target g)
 * - 24-Hour Training Fatigue Load (from logged workout volume and RPE/soreness)
 * - Resting Heart Rate (BPM)
 *
 * Output:
 * - Deterministic Score: 0 to 100
 * - Readiness Level: 'OPTIMAL' | 'MODERATE' | 'RECOVERY NEEDED'
 * - Transparent factor breakdown
 */

export const RECOVERY_STATUS = {
  OPTIMAL: 'OPTIMAL',
  MODERATE: 'MODERATE',
  RECOVERY_NEEDED: 'RECOVERY NEEDED',
  UNAVAILABLE: 'UNAVAILABLE'
};

export { calculateDeterministicRecovery as calculateRecoveryScore };

export function calculateDeterministicRecovery({
  sleepHours = 0,
  waterMl = 0,
  waterGoalMl = 3000,
  proteinGrams = 0,
  proteinGoalGrams = 150,
  soreness = 5, // 1 (none) to 10 (severe)
  fatigue = 5,  // 1 (fresh) to 10 (exhausted)
  restingHR = 0,
  hasLoggedWorkoutToday = false
}) {
  // Guard: If zero metrics have ever been recorded, return unavailable
  if (sleepHours <= 0 && waterMl <= 0 && proteinGrams <= 0 && !hasLoggedWorkoutToday && restingHR <= 0) {
    return {
      available: false,
      score: null,
      readiness: 'UNAVAILABLE',
      message: 'Not enough data. Connect sleep and heart-rate data to improve recovery accuracy.',
      recommendation: 'Connect sleep and heart-rate data to improve recovery accuracy.',
      breakdown: null
    };
  }

  // 1. Baseline starting foundation
  let baseScore = 50;

  // 2. Sleep Component (+0 to +25 points)
  // Optimal sleep: 8.0 hours
  const validSleepHours = Math.max(0, Math.min(14, Number(sleepHours) || 0));
  const sleepRatio = Math.min(1.25, validSleepHours / 8.0);
  const sleepPoints = Math.round(sleepRatio * 25);

  // 3. Hydration Component (+0 to +15 points)
  const validWater = Math.max(0, Number(waterMl) || 0);
  const validWaterGoal = Math.max(1000, Number(waterGoalMl) || 3000);
  const waterRatio = Math.min(1.0, validWater / validWaterGoal);
  const waterPoints = Math.round(waterRatio * 15);

  // 4. Protein / Muscle Repair Component (+0 to +10 points)
  const validProtein = Math.max(0, Number(proteinGrams) || 0);
  const validProteinGoal = Math.max(50, Number(proteinGoalGrams) || 150);
  const proteinRatio = Math.min(1.0, validProtein / validProteinGoal);
  const proteinPoints = Math.round(proteinRatio * 10);

  // 5. Subjective Soreness & Fatigue Modulation (-20 to 0 points)
  const normSoreness = Math.max(1, Math.min(10, Number(soreness) || 5));
  const normFatigue = Math.max(1, Math.min(10, Number(fatigue) || 5));
  const sorenessDeduction = Math.round(((normSoreness - 1) / 9) * 10);
  const fatigueDeduction = Math.round(((normFatigue - 1) / 9) * 10);

  // 6. Cardiovascular Resting HR modifier (-5 to +5 points)
  let hrModifier = 0;
  if (restingHR >= 40 && restingHR <= 100) {
    if (restingHR < 58) {
      hrModifier = +5;
    } else if (restingHR > 75) {
      hrModifier = -5;
    }
  }

  // 7. Today's Workout Load impact (-5 points if heavy session already logged)
  const workoutLoadDeduction = hasLoggedWorkoutToday ? 5 : 0;

  // Aggregate final recovery score
  const totalScore = Math.max(
    10,
    Math.min(
      100,
      baseScore +
        sleepPoints +
        waterPoints +
        proteinPoints -
        sorenessDeduction -
        fatigueDeduction +
        hrModifier -
        workoutLoadDeduction
    )
  );

  let readiness = 'MODERATE';
  let recommendation = 'Standard training volume recommended.';
  if (totalScore >= 82) {
    readiness = 'OPTIMAL';
    recommendation = 'CNS and muscular systems primed for high intensity or PR attempts.';
  } else if (totalScore < 60) {
    readiness = 'RECOVERY NEEDED';
    recommendation = 'Focus on active recovery, hydration, and restorative mobility.';
  }

  return {
    available: true,
    score: totalScore,
    readiness,
    recommendation,
    breakdown: {
      baseScore,
      sleepPoints,
      waterPoints,
      proteinPoints,
      sorenessDeduction,
      fatigueDeduction,
      hrModifier,
      workoutLoadDeduction,
      totalScore
    }
  };
}
