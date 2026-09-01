/**
 * Calyxo Personal Health Reports Engine (Premium)
 *
 * Generates editorial, high-retention Weekly Calyxo Reports synthesizing 7-day
 * recovery trends, training compliance, protein execution, hydration, sleep architecture,
 * biggest improvements, primary bottlenecks, and next week's focal priorities.
 * Zero fake default numbers: returns clear empty states when data has not been logged.
 */

export class PersonalHealthReportEngine {
  /**
   * Generate Grounded Weekly Calyxo Report
   */
  static generateWeeklyReport({
    weeklyRecoveryScores = [], // 7-day values
    previousWeekRecoveryAvg = null,
    workoutSessionsCount = 0,
    targetWorkoutSessions = 4,
    avgProteinGrams = 0,
    targetProteinGrams = 135,
    avgHydrationMl = 0,
    targetHydrationMl = 2700,
    avgSleepHours = 0,
    previousWeekSleepHours = null,
    lowProteinDaysCount = 0,
    userProfile = {}
  } = {}) {
    const name = userProfile.firstName || userProfile.nickname || 'Athlete';
    const hasRecoveryData = Array.isArray(weeklyRecoveryScores) && weeklyRecoveryScores.length > 0;

    // 1. Calculate recovery metrics
    let currentWeekRecoveryAvg = null;
    let recoveryDeltaPercent = null;
    let recoveryDisplay = '--';

    if (hasRecoveryData) {
      currentWeekRecoveryAvg = Math.round(
        weeklyRecoveryScores.reduce((a, b) => a + b, 0) / weeklyRecoveryScores.length
      );
      if (previousWeekRecoveryAvg && previousWeekRecoveryAvg > 0) {
        recoveryDeltaPercent = Math.round(
          ((currentWeekRecoveryAvg - previousWeekRecoveryAvg) / previousWeekRecoveryAvg) * 100
        );
        recoveryDisplay = `${currentWeekRecoveryAvg} ${recoveryDeltaPercent >= 0 ? '↑' : '↓'} ${Math.abs(recoveryDeltaPercent)}%`;
      } else {
        recoveryDisplay = `${currentWeekRecoveryAvg}%`;
      }
    }

    const proteinPercent = targetProteinGrams > 0 && avgProteinGrams > 0 
      ? Math.round((avgProteinGrams / targetProteinGrams) * 100) 
      : 0;

    const hydrationPercent = targetHydrationMl > 0 && avgHydrationMl > 0 
      ? Math.round((avgHydrationMl / targetHydrationMl) * 100) 
      : 0;

    let sleepDisplay = '--';
    let sleepDeltaPercent = null;
    if (avgSleepHours > 0) {
      const sleepHoursInt = Math.floor(avgSleepHours);
      const sleepMinutesInt = Math.round((avgSleepHours - sleepHoursInt) * 60);
      sleepDisplay = `${sleepHoursInt}h ${sleepMinutesInt}m`;
      if (previousWeekSleepHours && previousWeekSleepHours > 0) {
        sleepDeltaPercent = Math.round(
          ((avgSleepHours - previousWeekSleepHours) / previousWeekSleepHours) * 100
        );
      }
    }

    // 2. Identify biggest improvement
    let biggestImprovement = '';
    if (sleepDeltaPercent !== null && sleepDeltaPercent > 0) {
      biggestImprovement = `Your sleep consistency improved ${sleepDeltaPercent}% compared to last week (+${Math.round((avgSleepHours - previousWeekSleepHours) * 60)}m per night).`;
    } else if (recoveryDeltaPercent !== null && recoveryDeltaPercent > 0) {
      biggestImprovement = `Systemic recovery score climbed ${recoveryDeltaPercent}%, showing reduced autonomic strain.`;
    } else if (workoutSessionsCount >= targetWorkoutSessions && targetWorkoutSessions > 0) {
      biggestImprovement = `100% training split consistency achieved (${workoutSessionsCount}/${targetWorkoutSessions} sessions completed).`;
    } else if (avgHydrationMl >= targetHydrationMl && targetHydrationMl > 0) {
      biggestImprovement = `Hydration pacing was maintained across daytime hours.`;
    } else if (workoutSessionsCount > 0) {
      biggestImprovement = `Logged ${workoutSessionsCount} training session(s) this week.`;
    } else {
      biggestImprovement = `Log daily workouts, meals, and sleep to generate your 7-day retrospective analysis.`;
    }

    // 3. Identify biggest problem
    let biggestProblem = '';
    if (lowProteinDaysCount > 0) {
      biggestProblem = `Protein intake dropped below target on ${lowProteinDaysCount} training days, limiting recovery velocity.`;
    } else if (hydrationPercent > 0 && hydrationPercent < 80) {
      biggestProblem = `Hydration was below 80% baseline (${avgHydrationMl}ml vs ${targetHydrationMl}ml target).`;
    } else if (workoutSessionsCount < targetWorkoutSessions && workoutSessionsCount > 0) {
      biggestProblem = `Missed ${targetWorkoutSessions - workoutSessionsCount} planned training session(s) due to schedule friction.`;
    } else if (avgSleepHours > 0 && avgSleepHours < 7.0) {
      biggestProblem = `Sleep duration was below 7 hours (${sleepDisplay}), impacting neural restitution.`;
    } else {
      biggestProblem = `Keep maintaining consistent meal and training logs for deeper diagnostic precision.`;
    }

    // 4. Determine next week priority
    let nextWeekPriority = '';
    if (lowProteinDaysCount > 0) {
      nextWeekPriority = 'Prioritize 25–35g protein at breakfast (eggs, oats, or whey isolate) to protect muscle protein synthesis.';
    } else if (avgSleepHours > 0 && avgSleepHours < 7.0) {
      nextWeekPriority = 'Anchor your bedtime routine 30 minutes earlier to ensure at least 7.5 hours of restorative sleep.';
    } else if (workoutSessionsCount >= targetWorkoutSessions && workoutSessionsCount > 0) {
      nextWeekPriority = 'Progressive overload: Add 2.5kg to your primary compound lifts on Day 1 & Day 3.';
    } else {
      nextWeekPriority = 'Establish your daily protein and hydration targets in Settings.';
    }

    return {
      success: true,
      title: "Weekly Calyxo Report",
      recipientName: name,
      hasData: hasRecoveryData || workoutSessionsCount > 0 || avgProteinGrams > 0 || avgSleepHours > 0,
      weekSummary: {
        recovery: {
          score: currentWeekRecoveryAvg,
          deltaPercent: recoveryDeltaPercent,
          deltaDirection: (recoveryDeltaPercent || 0) >= 0 ? 'UP' : 'DOWN',
          display: recoveryDisplay
        },
        training: {
          sessionsCompleted: workoutSessionsCount,
          targetSessions: targetWorkoutSessions,
          display: workoutSessionsCount > 0 ? `${workoutSessionsCount} sessions` : '--'
        },
        protein: {
          percentOfTarget: proteinPercent,
          avgGrams: avgProteinGrams,
          targetGrams: targetProteinGrams,
          display: avgProteinGrams > 0 ? `${proteinPercent}% target` : '--'
        },
        hydration: {
          percentOfTarget: hydrationPercent,
          avgMl: avgHydrationMl,
          targetMl: targetHydrationMl,
          display: avgHydrationMl > 0 ? `${hydrationPercent}%` : '--'
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
