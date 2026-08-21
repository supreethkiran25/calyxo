/**
 * Calyxo Deterministic Fitness Age Engine
 *
 * Mathematically calculates biological/cellular fitness adaptation from verifiable user metrics:
 * - Chronological Age (from User Profile)
 * - Athletic Experience & Training Years
 * - Weekly Workout Consistency / Adherence
 * - Resting Heart Rate (BPM)
 * - VO2 Max / Cardio Fitness Score (where available)
 *
 * Rules:
 * - Deterministic: Same input ALWAYS produces identical output.
 * - Zero hallucination: AI explains the findings but never invents the number.
 * - Missing data: If chronological age is missing or invalid (< 10), returns `{ available: false }`.
 */

export function calculateDeterministicFitnessAge({
  chronologicalAge,
  trainingYears = 0,
  monthlyWorkouts = 0,
  restingHR = 0,
  vo2Max = 0
}) {
  const bioAge = Number(chronologicalAge);

  // Guard: Chronological age must be explicitly provided
  if (!bioAge || isNaN(bioAge) || bioAge < 12 || bioAge > 110) {
    return {
      available: false,
      fitnessAge: null,
      bioAge: null,
      delta: null,
      status: 'unavailable',
      message: 'Set your chronological age in Profile to calculate your clinical Fitness Age.',
      breakdown: null
    };
  }

  // 1. Training Experience Factor (Up to 3.5 years biological reduction)
  // Progressive adaptation: each year of consistent training yields ~0.7 years biological advantage (max 5 yrs cap)
  const experienceYears = Math.max(0, Math.min(15, Number(trainingYears) || 0));
  const experienceBenefit = Math.min(3.5, experienceYears * 0.7);

  // 2. Consistency / Monthly Adherence Factor (Up to 2.5 years benefit)
  // 16 workouts/month (~4 per week) represents optimal athletic training volume
  const workouts = Math.max(0, Math.min(31, Number(monthlyWorkouts) || 0));
  const consistencyRatio = Math.min(1.0, workouts / 16);
  const consistencyBenefit = consistencyRatio * 2.5;

  // 3. Resting Heart Rate Factor (Up to 2.0 years benefit)
  // Normal baseline: 70 BPM. Highly conditioned cardiovascular system: < 55 BPM.
  let restingHRBenefit = 0;
  if (restingHR >= 40 && restingHR <= 100) {
    if (restingHR < 60) {
      restingHRBenefit = Math.min(2.0, ((60 - restingHR) / 10) * 1.5 + 0.5);
    } else if (restingHR > 75) {
      restingHRBenefit = -Math.min(2.0, ((restingHR - 75) / 10) * 1.0);
    }
  }

  // 4. VO2 Max / Aerobic Capacity Factor (Up to 3.0 years benefit)
  // Normal baseline ~35-40 ml/kg/min. Elite endurance: > 50 ml/kg/min.
  let vo2MaxBenefit = 0;
  if (vo2Max >= 15 && vo2Max <= 85) {
    if (vo2Max > 40) {
      vo2MaxBenefit = Math.min(3.0, ((vo2Max - 40) / 10) * 1.5);
    } else if (vo2Max < 30) {
      vo2MaxBenefit = -Math.min(2.0, ((30 - vo2Max) / 10) * 1.0);
    }
  }

  // Aggregate Total Biological Age Delta (Max positive adaptation benefit: 8.5 years younger)
  const totalDelta = Math.min(8.5, Math.max(-6.0, experienceBenefit + consistencyBenefit + restingHRBenefit + vo2MaxBenefit));
  
  // Computed clinical fitness age
  const fitnessAge = Math.max(16, Math.round((bioAge - totalDelta) * 10) / 10);
  const roundedDelta = Math.round((bioAge - fitnessAge) * 10) / 10;

  const isYounger = roundedDelta > 0;
  const isOlder = roundedDelta < 0;

  // Confidence calculation based on number of active input variables
  let activeSignals = 1; // Chronological age
  if (trainingYears > 0) activeSignals++;
  if (monthlyWorkouts > 0) activeSignals++;
  if (restingHR > 0) activeSignals++;
  if (vo2Max > 0) activeSignals++;

  const confidence = activeSignals >= 4 ? 'High' : activeSignals >= 3 ? 'Medium' : 'Low';

  return {
    available: true,
    title: 'Estimated Fitness Age',
    fitnessAge,
    estimatedFitnessAge: fitnessAge,
    bioAge,
    delta: roundedDelta,
    confidence,
    explanation: 'Your Calyxo Fitness Age is estimated from training experience, monthly consistency, resting heart rate, and aerobic capacity metrics.',
    isYounger,
    isOlder,
    status: isYounger ? 'optimal' : isOlder ? 'needs_work' : 'matched',
    label: isYounger
      ? `🔥 ${roundedDelta} yrs younger than biological age`
      : isOlder
      ? `⚠️ ${Math.abs(roundedDelta)} yrs above biological age`
      : `Matched with biological age (${bioAge} yrs)`,
    breakdown: {
      experienceBenefit: Math.round(experienceBenefit * 10) / 10,
      consistencyBenefit: Math.round(consistencyBenefit * 10) / 10,
      restingHRBenefit: Math.round(restingHRBenefit * 10) / 10,
      vo2MaxBenefit: Math.round(vo2MaxBenefit * 10) / 10,
      totalDelta: roundedDelta
    }
  };
}
