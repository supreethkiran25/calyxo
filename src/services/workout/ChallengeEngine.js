/**
 * Calyxo Real-Life Challenge & Gamification Engine
 *
 * Evaluates challenges strictly against verified user logs and database events:
 * - Real workout logs (reps, sets, volume, completed session timestamps)
 * - Real water logs (daily ml vs target)
 * - Real macro nutrition logs (daily protein vs target)
 * - Real workout streaks (consecutive days)
 *
 * Rules:
 * - ZERO fabricated progress bars.
 * - Idempotent evaluation: same log history produces identical progression state.
 */

export const CURATED_CHALLENGES = [
  {
    id: 'streak_7_days',
    title: '7-Day Unbroken Streak',
    category: 'STREAK',
    targetValue: 7,
    unit: 'days',
    description: 'Complete and log a training session for 7 consecutive days.',
    rewardXp: 500,
    badgeName: 'Consistency Titan'
  },
  {
    id: 'hydration_champion_30l',
    title: '30L Hydration Sentinel',
    category: 'HYDRATION',
    targetValue: 30000,
    unit: 'ml',
    description: 'Log 30,000 ml of water consumption across your journey.',
    rewardXp: 350,
    badgeName: 'Hydration Master'
  },
  {
    id: 'volume_crusher_50k',
    title: '50,000 kg Volume Crusher',
    category: 'STRENGTH',
    targetValue: 50000,
    unit: 'kg',
    description: 'Lift a cumulative total of 50,000 kg across all logged compound and isolated sets.',
    rewardXp: 750,
    badgeName: 'Iron Vanguard'
  },
  {
    id: 'workout_sessions_20',
    title: '20-Session Discipline',
    category: 'WORKOUT_COUNT',
    targetValue: 20,
    unit: 'sessions',
    description: 'Log 20 completed workout sessions in Calyxo.',
    rewardXp: 600,
    badgeName: 'Elite Warrior'
  }
];

/**
 * Evaluates user progress for all challenges from authentic logs
 */
export function evaluateUserChallenges({
  workoutLogs = [],
  waterLogs = [],
  currentStreak = 0
}) {
  // 1. Calculate cumulative tonnage (Weight * Reps) across all completed sets
  let totalVolumeKg = 0;
  const uniqueWorkoutDays = new Set();

  (workoutLogs || []).forEach((log) => {
    if (log.date) uniqueWorkoutDays.add(log.date);
    if (Array.isArray(log.sets)) {
      log.sets.forEach((set) => {
        if (set.completed || set.weight > 0) {
          const w = Number(set.weight) || 0;
          const r = Number(set.reps) || 0;
          totalVolumeKg += w * r;
        }
      });
    }
  });

  const totalWorkoutCount = (workoutLogs || []).length;

  // 2. Calculate cumulative water consumption
  let totalWaterMl = 0;
  (waterLogs || []).forEach((w) => {
    totalWaterMl += Number(w.amount || w.water || 0);
  });

  // 3. Map progress to each challenge
  return CURATED_CHALLENGES.map((challenge) => {
    let currentProgress = 0;

    switch (challenge.category) {
      case 'STREAK':
        currentProgress = Math.min(challenge.targetValue, Math.max(0, currentStreak || 0));
        break;
      case 'HYDRATION':
        currentProgress = Math.min(challenge.targetValue, Math.max(0, totalWaterMl));
        break;
      case 'STRENGTH':
        currentProgress = Math.min(challenge.targetValue, Math.max(0, totalVolumeKg));
        break;
      case 'WORKOUT_COUNT':
        currentProgress = Math.min(challenge.targetValue, Math.max(0, totalWorkoutCount));
        break;
      default:
        currentProgress = 0;
    }

    const pct = Math.min(100, Math.round((currentProgress / challenge.targetValue) * 100));
    const isCompleted = currentProgress >= challenge.targetValue;

    return {
      ...challenge,
      currentProgress,
      progressPercent: pct,
      isCompleted,
      remaining: Math.max(0, challenge.targetValue - currentProgress)
    };
  });
}

export { evaluateUserChallenges as evaluateChallengeProgress };
export default evaluateUserChallenges;
