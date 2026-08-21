/**
 * Calyxo Explainable AI Coaching & Predictive Insights Architecture
 *
 * Rules:
 * 1. AI is grounded strictly in deterministic canonical metrics.
 * 2. Never invents measurements, fake heart rates, or arbitrary numbers.
 * 3. Every "Why?" explanation maps directly to verified mathematical components.
 * 4. Predictive insights are clearly framed as Trends / Estimates, never medical diagnoses.
 */

import { calculateDeterministicRecovery } from '../health/DeterministicRecoveryEngine.js';
import { calculateDeterministicFitnessAge } from '../health/DeterministicFitnessAgeEngine.js';

export class ExplainableAICoachService {
  /**
   * Generates a fully explainable "Why?" breakdown for today's Recovery Score
   */
  static explainRecoveryChange({
    sleepHours = 0,
    waterMl = 0,
    waterGoalMl = 3000,
    proteinGrams = 0,
    proteinGoalGrams = 150,
    soreness = 5,
    fatigue = 5,
    restingHR = 0,
    hasLoggedWorkoutToday = false
  }) {
    const recoveryRes = calculateDeterministicRecovery({
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

    if (!recoveryRes.available) {
      return {
        available: false,
        summary: 'Recovery score unavailable.',
        reasons: ['No sleep or hydration logs recorded for today yet.']
      };
    }

    const { breakdown, score, readiness } = recoveryRes;
    const reasons = [];

    // Sleep insight
    if (sleepHours >= 7.5) {
      reasons.push(`🌙 Optimal sleep duration (${sleepHours} hrs) contributed +${breakdown.sleepPoints} recovery points.`);
    } else if (sleepHours > 0) {
      const deficit = Math.round((8.0 - sleepHours) * 10) / 10;
      reasons.push(`⚠️ Sleep deficit of ${deficit} hrs limited sleep recovery score to +${breakdown.sleepPoints}/25.`);
    }

    // Hydration insight
    if (waterMl >= waterGoalMl) {
      reasons.push(`💧 Daily hydration target fulfilled (${waterMl} ml), securing maximum +${breakdown.waterPoints} points.`);
    } else {
      const remaining = waterGoalMl - waterMl;
      reasons.push(`💧 Hydration deficit of ${remaining} ml reduced hydration score to +${breakdown.waterPoints}/15.`);
    }

    // Protein insight
    if (proteinGrams >= proteinGoalGrams) {
      reasons.push(`🥩 Protein synthesis target achieved (${proteinGrams} g), adding +${breakdown.proteinPoints} muscular repair points.`);
    }

    // Fatigue & workout impact
    if (hasLoggedWorkoutToday) {
      reasons.push(`🏋️ Today's active training session applied a -5 point acute fatigue modulation.`);
    }

    return {
      available: true,
      score,
      readiness,
      summary: `Your Recovery Score is ${score}% (${readiness}).`,
      reasons,
      recommendation: recoveryRes.recommendation
    };
  }

  /**
   * Generates safe, data-grounded predictive trend estimates
   */
  static generatePredictiveInsight({
    currentWeightKg,
    targetWeightKg,
    weeklyDeficitCalories = 0,
    consecutiveWorkoutWeeks = 0
  }) {
    if (!currentWeightKg || !targetWeightKg || currentWeightKg === targetWeightKg) {
      return {
        hasInsight: false,
        message: 'Set a target weight or log consistent weekly calories to project timeline.'
      };
    }

    const weightDelta = Math.abs(currentWeightKg - targetWeightKg);
    const isWeightLoss = currentWeightKg > targetWeightKg;

    // 1 kg of fat ~= 7700 kcal
    let estimatedWeeks = null;
    if (weeklyDeficitCalories > 500) {
      const weeklyKgRate = weeklyDeficitCalories / 7700;
      estimatedWeeks = Math.round(weightDelta / weeklyKgRate);
    }

    return {
      hasInsight: true,
      type: 'TREND_ESTIMATE',
      disclaimer: 'Projections are mathematical estimates based on current caloric trends, not guaranteed medical outcomes.',
      projectedWeeks: estimatedWeeks,
      summary: estimatedWeeks
        ? `Based on your average weekly caloric pace, reaching your ${targetWeightKg} kg goal is estimated in ~${estimatedWeeks} weeks.`
        : `Continue logging daily meals and workouts to establish a reliable milestone trajectory.`
    };
  }
}

export default ExplainableAICoachService;
