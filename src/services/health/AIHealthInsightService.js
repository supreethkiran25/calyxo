/**
 * Calyxo Universal Health Data Integration - AI Coach Insight Service
 * Generates personalized AI coaching insights based on imported health data
 */

export class AIHealthInsightService {
  /**
   * Generate data-driven AI coaching insights from active metrics
   */
  static generateInsights(metrics = {}, userGoal = 'lose') {
    const steps = metrics.steps || 0;
    const stepGoal = metrics.stepGoal || 10000;
    const activeCals = metrics.activeCalories || 0;
    const remainingSteps = Math.max(0, stepGoal - steps);
    const recoveryScore = metrics.recoveryScore || 85;

    const insights = [];

    // Step Insight
    if (remainingSteps === 0) {
      insights.push({
        id: 'ins_steps_completed',
        type: 'success',
        icon: '🏆',
        title: 'Daily Step Goal Achieved!',
        message: `Outstanding work! You've walked ${steps.toLocaleString()} steps today, exceeding your ${stepGoal.toLocaleString()} step goal.`
      });
    } else if (remainingSteps <= 1500) {
      insights.push({
        id: 'ins_steps_near',
        type: 'action',
        icon: '🚶',
        title: 'Step Goal Within Reach',
        message: `You've walked ${steps.toLocaleString()} steps today. A short 15-minute evening walk (${remainingSteps.toLocaleString()} steps) will complete your daily goal.`
      });
    } else {
      insights.push({
        id: 'ins_steps_pace',
        type: 'info',
        icon: '👟',
        title: 'Daily Movement Pace',
        message: `You are at ${steps.toLocaleString()} / ${stepGoal.toLocaleString()} steps today. Try taking post-meal walking breaks to boost your deficit.`
      });
    }

    // Active Calories & Nutrition Insight
    if (activeCals > 400) {
      insights.push({
        id: 'ins_cal_high',
        type: 'nutrition',
        icon: '🔥',
        title: 'High Active Burn Detected',
        message: `You've burned ${activeCals} active calories today! Consider increasing your complex carbohydrate and protein intake for optimal muscle recovery.`
      });
    }

    // Recovery & Sleep Insight
    if (recoveryScore >= 80) {
      insights.push({
        id: 'ins_rec_good',
        type: 'recovery',
        icon: '⚡',
        title: 'Optimal Physical Recovery',
        message: `Recovery score is high (${recoveryScore}%). Your heart rate variability and sleep indicate you are primed for intense training today.`
      });
    } else {
      insights.push({
        id: 'ins_rec_rest',
        type: 'warning',
        icon: '🛌',
        title: 'Recovery Needs Attention',
        message: `Recovery score is at ${recoveryScore}%. Consider a light active recovery walk or mobility session today to prevent fatigue.`
      });
    }

    return insights;
  }
}
