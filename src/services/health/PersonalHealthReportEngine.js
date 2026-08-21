/**
 * Calyxo Personal Health Reports Engine (Premium)
 *
 * Generates editorial, high-retention Weekly Calyxo Reports synthesizing 7-day
 * recovery trends, training compliance, protein execution, hydration, sleep architecture,
 * biggest improvements, primary bottlenecks, and next week's focal priorities.
 */

export class PersonalHealthReportEngine {
  /**
   * Generate Grounded Weekly Calyxo Report
   */
  static generateWeeklyReport({
    weeklyRecoveryScores = [74, 76, 78, 80, 82, 79, 78], // 7-day values
    previousWeekRecoveryAvg = 73.5,
    workoutSessionsCount = 4,
    targetWorkoutSessions = 4,
    avgProteinGrams = 122,
    targetProteinGrams = 135,
    avgHydrationMl = 2250,
    targetHydrationMl = 2700,
    avgSleepHours = 7.3, // 7h 18m
    previousWeekSleepHours = 6.6,
    lowProteinDaysCount = 3,
    userProfile = {}
  } = {}) {
    const name = userProfile.firstName || userProfile.nickname || 'Athlete';

    // 1. Calculate deltas
    const currentWeekRecoveryAvg = Math.round(
      weeklyRecoveryScores.reduce((a, b) => a + b, 0) / Math.max(1, weeklyRecoveryScores.length)
    );
    const recoveryDeltaPercent = Math.round(
      ((currentWeekRecoveryAvg - previousWeekRecoveryAvg) / previousWeekRecoveryAvg) * 100
    );

    const proteinPercent = Math.round((avgProteinGrams / targetProteinGrams) * 100);
    const hydrationPercent = Math.round((avgHydrationMl / targetHydrationMl) * 100);

    const sleepHoursInt = Math.floor(avgSleepHours);
    const sleepMinutesInt = Math.round((avgSleepHours - sleepHoursInt) * 60);
    const sleepDisplay = `${sleepHoursInt}h ${sleepMinutesInt}m`;

    const sleepDeltaPercent = Math.round(
      ((avgSleepHours - previousWeekSleepHours) / previousWeekSleepHours) * 100
    );

    // 2. Identify biggest improvement
    let biggestImprovement = '';
    if (sleepDeltaPercent > 0) {
      biggestImprovement = `Your sleep consistency improved ${sleepDeltaPercent}% compared to last week (+${Math.round((avgSleepHours - previousWeekSleepHours) * 60)}m per night).`;
    } else if (recoveryDeltaPercent > 0) {
      biggestImprovement = `Systemic recovery score climbed ${recoveryDeltaPercent}%, showing reduced autonomic strain.`;
    } else if (workoutSessionsCount >= targetWorkoutSessions) {
      biggestImprovement = `100% training split consistency achieved (${workoutSessionsCount}/${targetWorkoutSessions} sessions completed).`;
    } else {
      biggestImprovement = `Hydration pacing was maintained across daytime hours.`;
    }

    // 3. Identify biggest problem
    let biggestProblem = '';
    if (lowProteinDaysCount > 0) {
      biggestProblem = `Protein intake dropped below target on ${lowProteinDaysCount} training days, limiting recovery velocity.`;
    } else if (hydrationPercent < 80) {
      biggestProblem = `Hydration was below 80% baseline (${avgHydrationMl}ml vs ${targetHydrationMl}ml target).`;
    } else if (workoutSessionsCount < targetWorkoutSessions) {
      biggestProblem = `Missed ${targetWorkoutSessions - workoutSessionsCount} planned training session(s) due to schedule friction.`;
    } else {
      biggestProblem = `Sleep latency was delayed by late evening digital blue light exposure.`;
    }

    // 4. Determine next week priority
    let nextWeekPriority = '';
    if (lowProteinDaysCount > 0) {
      nextWeekPriority = 'Prioritize 25–35g protein at breakfast (eggs, oats, or whey isolate) to protect muscle protein synthesis.';
    } else if (avgSleepHours < 7.0) {
      nextWeekPriority = 'Anchor your bedtime routine 30 minutes earlier to ensure at least 7.5 hours of restorative sleep.';
    } else {
      nextWeekPriority = 'Progressive overload: Add 2.5kg to your primary compound lifts on Day 1 & Day 3.';
    }

    return {
      success: true,
      title: "Weekly Calyxo Report",
      recipientName: name,
      weekSummary: {
        recovery: {
          score: currentWeekRecoveryAvg,
          deltaPercent: recoveryDeltaPercent,
          deltaDirection: recoveryDeltaPercent >= 0 ? 'UP' : 'DOWN',
          display: `${currentWeekRecoveryAvg} ${recoveryDeltaPercent >= 0 ? '↑' : '↓'} ${Math.abs(recoveryDeltaPercent)}%`
        },
        training: {
          sessionsCompleted: workoutSessionsCount,
          targetSessions: targetWorkoutSessions,
          display: `${workoutSessionsCount} sessions`
        },
        protein: {
          percentOfTarget: proteinPercent,
          avgGrams: avgProteinGrams,
          targetGrams: targetProteinGrams,
          display: `${proteinPercent}% target`
        },
        hydration: {
          percentOfTarget: hydrationPercent,
          avgMl: avgHydrationMl,
          targetMl: targetHydrationMl,
          display: `${hydrationPercent}%`
        },
        sleep: {
          hours: avgSleepHours,
          display: sleepDisplay,
          deltaPercent: sleepDeltaPercent
        }
      },
      biggestImprovement,
      biggestProblem,
      nextWeekPriority,
      generatedAt: Date.now()
    };
  }
}

export const personalHealthReportEngine = PersonalHealthReportEngine;
export default PersonalHealthReportEngine;
