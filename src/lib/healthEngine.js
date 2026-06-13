/**
 * Calyxo Health Hub Calculation Engine
 */

export function calculateRecoveryScore({ sleepDuration, sleepQuality, restingHR, workoutLoad }) {
  // 1. Sleep Quality: 40% of the score
  const sleepFactor = Math.min(100, Math.max(0, sleepQuality || 70)) * 0.40;

  // 2. Resting Heart Rate: 30% of the score
  // Optimal resting HR is assumed to be 55 bpm. Score decreases as it deviates.
  const optimalHR = 55;
  const hrDeviation = Math.abs((restingHR || 65) - optimalHR);
  const hrScore = Math.max(0, 100 - hrDeviation * 3);
  const hrFactor = hrScore * 0.30;

  // 3. Workout Load & Fatigue: 30% of the score
  // A higher workout load reduces immediate recovery capacity.
  const loadScore = Math.min(100, Math.max(0, workoutLoad || 0));
  const recoveryLoadFactor = (100 - loadScore) * 0.30;

  const totalScore = Math.round(sleepFactor + hrFactor + recoveryLoadFactor);
  
  let category = "Good";
  if (totalScore >= 80) category = "Excellent";
  else if (totalScore >= 60) category = "Good";
  else if (totalScore >= 40) category = "Fair";
  else category = "Poor";

  return {
    score: totalScore,
    category,
    breakdown: {
      sleep: Math.round(sleepFactor / 0.40),
      heartRate: Math.round(hrFactor / 0.30),
      strainFactor: Math.round(recoveryLoadFactor / 0.30)
    }
  };
}

export function calculateReadinessScore({ sleepDuration, recoveryScore, steps, stepsGoal, hydration, hydrationGoal, calorieBalance }) {
  // 1. Recovery Score: 35%
  const recoveryFactor = (recoveryScore || 70) * 0.35;

  // 2. Sleep duration: 25% (Target is 8 hours)
  const sleepHours = sleepDuration || 7;
  const sleepRatio = Math.min(1.2, sleepHours / 8);
  const sleepScore = Math.min(100, sleepRatio * 100);
  const sleepFactor = sleepScore * 0.25;

  // 3. Hydration index: 15%
  const hGoal = hydrationGoal || 3000;
  const hydrationRatio = Math.min(1.0, (hydration || 0) / hGoal);
  const hydrationFactor = hydrationRatio * 100 * 0.15;

  // 4. Nutrition calorie balance: 15%
  // Optimal balance is 100% compliance (closeness to target)
  const nutritionScore = Math.max(0, 100 - Math.min(100, calorieBalance || 0));
  const nutritionFactor = nutritionScore * 0.15;

  // 5. Activity/Steps today: 10%
  const sGoal = stepsGoal || 10000;
  const stepsRatio = Math.min(1.0, (steps || 0) / sGoal);
  const activityFactor = stepsRatio * 100 * 0.10;

  const totalScore = Math.round(recoveryFactor + sleepFactor + hydrationFactor + nutritionFactor + activityFactor);
  
  let recommendation = "Moderate Workout";
  if (totalScore >= 80) recommendation = "Train Hard";
  else if (totalScore < 50) recommendation = "Recovery Day";

  return {
    score: totalScore,
    recommendation,
    breakdown: {
      recovery: Math.round(recoveryFactor / 0.35),
      sleep: Math.round(sleepFactor / 0.25),
      hydration: Math.round(hydrationFactor / 0.15),
      nutrition: Math.round(nutritionFactor / 0.15),
      activity: Math.round(activityFactor / 0.10)
    }
  };
}

export function calculateCalyxoHealthScore({ nutrition, activity, recovery, consistency }) {
  const nutScore = Math.min(100, Math.max(0, nutrition || 75));
  const actScore = Math.min(100, Math.max(0, activity || 75));
  const recScore = Math.min(100, Math.max(0, recovery || 75));
  const conScore = Math.min(100, Math.max(0, consistency || 75));

  const overall = Math.round((nutScore + actScore + recScore + conScore) / 4);

  return {
    overall,
    components: {
      nutrition: nutScore,
      activity: actScore,
      recovery: recScore,
      consistency: conScore
    }
  };
}

/**
 * Generates mock synced data for a wearable connection sync event
 */
export function generateWearableData(provider, userProfile, foodLogs = [], workoutLogs = [], waterIntake = 0) {
  const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const now = Date.now();
  const dateStr = new Date().toISOString().split('T')[0];

  // Base configurations based on user stats
  const userWeight = userProfile?.weight || 70;
  const userGoal = userProfile?.goal || 'lose';

  // Standard steps goal
  const stepsGoal = 10000;
  const waterGoal = userProfile?.waterTarget || 2500;
  const calorieGoal = userProfile?.dailyCalories || 2000;

  // Let's create specific structures per provider
  let data = {
    steps: 0,
    caloriesBurned: 0,
    distance: 0,
    activeMinutes: 0,
    sleepDuration: 0,
    sleepQuality: 0,
    restingHR: 0,
    hydrationStatus: waterIntake,
    weight: userWeight,
    exerciseSessions: []
  };

  switch (provider) {
    case 'google':
      // Google Health Connect: Balanced data across steps, activity, sleep
      data.steps = randomBetween(8200, 11400);
      data.distance = Number((data.steps * 0.00075).toFixed(2)); // in km
      data.caloriesBurned = randomBetween(420, 680);
      data.activeMinutes = randomBetween(35, 70);
      data.sleepDuration = Number((randomBetween(390, 480) / 60).toFixed(1)); // 6.5 to 8 hrs
      data.sleepQuality = randomBetween(70, 92);
      data.restingHR = randomBetween(58, 68);
      data.exerciseSessions = [
        { name: "Walking", duration: 25, calories: 120, type: "Cardio" },
        { name: "Strength Training", duration: 45, calories: 280, type: "Strength" }
      ];
      break;

    case 'fitbit':
      // Fitbit: Heavy focus on steps, sleep details, active zone minutes
      data.steps = randomBetween(9500, 14200);
      data.distance = Number((data.steps * 0.00076).toFixed(2));
      data.activeMinutes = randomBetween(50, 90);
      data.sleepDuration = Number((randomBetween(420, 510) / 60).toFixed(1)); // 7 to 8.5 hrs
      data.sleepQuality = randomBetween(78, 94);
      data.restingHR = randomBetween(54, 64);
      data.caloriesBurned = randomBetween(480, 780);
      data.exerciseSessions = [
        { name: "Treadmill Run", duration: 30, calories: 350, type: "Cardio" }
      ];
      break;

    case 'garmin':
      // Garmin: Performance & running/cycling stats, recovery data, VO2 max
      data.steps = randomBetween(7500, 12500);
      data.distance = Number((data.steps * 0.00078).toFixed(2));
      data.caloriesBurned = randomBetween(600, 950);
      data.activeMinutes = randomBetween(60, 110);
      data.sleepDuration = Number((randomBetween(360, 450) / 60).toFixed(1)); // 6 to 7.5 hrs
      data.sleepQuality = randomBetween(65, 85);
      data.restingHR = randomBetween(48, 58); // typically lower resting heart rate
      data.vo2Max = randomBetween(45, 56);
      data.recoveryTimeHours = randomBetween(12, 36);
      data.exerciseSessions = [
        { name: "Outdoor Run", duration: 45, calories: 550, type: "Cardio" }
      ];
      break;

    case 'samsung':
      // Samsung Health: Daily activity rings, sleep stats, steps
      data.steps = randomBetween(8000, 12000);
      data.distance = Number((data.steps * 0.00074).toFixed(2));
      data.caloriesBurned = randomBetween(400, 620);
      data.activeMinutes = randomBetween(30, 60);
      data.sleepDuration = Number((randomBetween(400, 490) / 60).toFixed(1));
      data.sleepQuality = randomBetween(72, 89);
      data.restingHR = randomBetween(59, 70);
      data.exerciseSessions = [
        { name: "Cycling", duration: 40, calories: 310, type: "Cardio" }
      ];
      break;

    case 'apple':
      // Apple HealthKit Ready (architecture verification)
      data.steps = randomBetween(8800, 13000);
      data.distance = Number((data.steps * 0.00076).toFixed(2));
      data.caloriesBurned = randomBetween(450, 720);
      data.activeMinutes = randomBetween(40, 80);
      data.sleepDuration = Number((randomBetween(410, 500) / 60).toFixed(1));
      data.sleepQuality = randomBetween(75, 93);
      data.restingHR = randomBetween(55, 65);
      data.appleWatchStandHours = randomBetween(8, 14);
      data.exerciseSessions = [
        { name: "HIIT Workout", duration: 30, calories: 320, type: "Cardio" }
      ];
      break;

    default:
      break;
  }

  // Inject current logged inputs to compute scores dynamically
  const totalCaloriesConsumed = foodLogs.reduce((s, x) => s + x.calories, 0);
  const totalWorkouts = workoutLogs.length + data.exerciseSessions.length;
  
  // Calculate calorie balance indicator
  const deviationVal = totalCaloriesConsumed - calorieGoal;
  const calorieBalance = Math.abs(deviationVal);

  const recoveryCalculations = calculateRecoveryScore({
    sleepDuration: data.sleepDuration,
    sleepQuality: data.sleepQuality,
    restingHR: data.restingHR,
    workoutLoad: totalWorkouts * 20 + (data.activeMinutes * 0.5)
  });

  const readinessCalculations = calculateReadinessScore({
    sleepDuration: data.sleepDuration,
    recoveryScore: recoveryCalculations.score,
    steps: data.steps,
    stepsGoal,
    hydration: waterIntake,
    hydrationGoal: waterGoal,
    calorieBalance
  });

  // Proprietary Calyxo Health Score Components
  // 1. Nutrition Component
  const proteinLogged = foodLogs.reduce((s, x) => s + (x.protein || 0), 0);
  const targetProtein = userProfile?.proteinTarget || 120;
  const proteinPct = Math.min(100, (proteinLogged / targetProtein) * 100);
  const hydrationPct = Math.min(100, (waterIntake / waterGoal) * 100);
  const caloriePct = Math.max(0, 100 - (calorieBalance / calorieGoal) * 100);
  const nutritionComp = Math.round((proteinPct * 0.4) + (hydrationPct * 0.3) + (caloriePct * 0.3));

  // 2. Activity Component
  const stepsPct = Math.min(100, (data.steps / stepsGoal) * 100);
  const activeMinPct = Math.min(100, (data.activeMinutes / 60) * 100);
  const workoutLoggedPct = totalWorkouts > 0 ? 100 : 0;
  const activityComp = Math.round((stepsPct * 0.4) + (activeMinPct * 0.3) + (workoutLoggedPct * 0.3));

  // 3. Recovery Component
  const recoveryComp = recoveryCalculations.score;

  // 4. Consistency Component
  // Pull from streaks or generate a solid score based on streaks
  const consistencyComp = Math.min(100, 70 + (userProfile?.loginStreak || 3) * 5);

  const calyxoHealthCalculations = calculateCalyxoHealthScore({
    nutrition: nutritionComp,
    activity: activityComp,
    recovery: recoveryComp,
    consistency: consistencyComp
  });

  return {
    ...data,
    recoveryScore: recoveryCalculations.score,
    recoveryCategory: recoveryCalculations.category,
    readinessScore: readinessCalculations.score,
    readinessRecommendation: readinessCalculations.recommendation,
    healthScore: calyxoHealthCalculations.overall,
    nutritionScore: calyxoHealthCalculations.components.nutrition,
    activityScore: calyxoHealthCalculations.components.activity,
    consistencyScore: calyxoHealthCalculations.components.consistency,
    timestamp: now
  };
}
