/**
 * Calyxo Premium Features & Monetization Architecture Test Suite
 *
 * Automated regression verification for all 8 Tier-1 Premium Capabilities:
 * 1. Subscription Manager & Entitlement Boundaries
 * 2. 🥗 AI Nutrition Intelligence & Auto Grocery List (Feature 6)
 * 3. 🍱 Advanced Food Intelligence & Range Estimation (Feature 7)
 * 4. 🏋️ AI Workout Coach & 4-Week Baseline Overload (Feature 8)
 * 5. ⌚ Advanced Wearable Intelligence & Unified Health Model (Feature 10)
 * 6. ❤️ Real-Time Workout Intelligence & Zone Coaching (Feature 11)
 * 7. 📊 Personal Health Reports / Weekly Calyxo Report (Feature 13)
 * 8. 🤖 Daily Morning AI Briefing (Feature 14)
 * 9. 🧠 Unlimited AI vs Free Monthly Rate Limiting (Feature 17)
 */

import { SubscriptionManager, SUBSCRIPTION_TIERS, SUBSCRIPTION_STATES, AI_CAPABILITIES, FREE_MONTHLY_AI_LIMIT } from '../services/subscription/SubscriptionManager.js';
import { AIMealPlannerEngine } from '../services/ai/AIMealPlannerEngine.js';
import { AdvancedFoodIntelligenceEngine } from '../services/ai/AdvancedFoodIntelligenceEngine.js';
import { AdaptiveWorkoutCoachEngine } from '../services/ai/AdaptiveWorkoutCoachEngine.js';
import { UnifiedHealthModelEngine } from '../services/health/UnifiedHealthModelEngine.js';
import { PersonalHealthReportEngine } from '../services/health/PersonalHealthReportEngine.js';
import { AIBriefingEngine } from '../services/ai/AIBriefingEngine.js';
import { AIUsageLimiter } from '../services/ai/AIUsageLimiter.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('======================================================================');
console.log('👑 CALYXO PREMIUM FEATURES & TIER-1 MONETIZATION TEST SUITE');
console.log('======================================================================');

// ── SECTION 1: Subscription Manager & Entitlements ─────────────────────────
console.log('\n👑 SECTION 1: Subscription Manager & Entitlement Boundaries');
const freeUser = { subscriptionPlan: 'FREE', isSubscribed: false };
const proUser = { subscriptionPlan: 'MEDIUM', isSubscribed: true };
const ultraUser = { subscriptionPlan: 'HIGH', isSubscribed: true };

assert(SubscriptionManager.isPremium(freeUser) === false, 'Free user identified as NOT premium');
assert(SubscriptionManager.isPremium(proUser) === true, 'Pro user identified as Premium');
assert(SubscriptionManager.isPremium(ultraUser) === true, 'Ultra user identified as Premium');

assert(SubscriptionManager.hasAICapability(AI_CAPABILITIES.CORE_TRACKING, freeUser) === true, 'Free user entitled to Core Tracking');
assert(SubscriptionManager.hasAICapability(AI_CAPABILITIES.AI_MEAL_PLANNER, freeUser) === false, 'Free user gated from AI Meal Planner');
assert(SubscriptionManager.hasAICapability(AI_CAPABILITIES.AI_MEAL_PLANNER, proUser) === true, 'Pro user entitled to AI Meal Planner');
assert(SubscriptionManager.hasAICapability(AI_CAPABILITIES.ADVANCED_FOOD_INTELLIGENCE, proUser) === true, 'Pro user entitled to Advanced Food Intelligence');
assert(SubscriptionManager.hasAICapability(AI_CAPABILITIES.AI_WORKOUT_COACH, proUser) === true, 'Pro user entitled to AI Workout Coach');
assert(SubscriptionManager.hasAICapability(AI_CAPABILITIES.PERSONAL_HEALTH_REPORTS, proUser) === true, 'Pro user entitled to Personal Health Reports');

// ── SECTION 2: AI Nutrition Intelligence & Auto Grocery List ────────────────
console.log('\n🥗 SECTION 2: AI Nutrition Intelligence & Auto Grocery List (Feature 6)');
const mealPlan = AIMealPlannerEngine.generateMealPlan({
  goal: 'muscle_gain',
  targetCalories: 2400,
  targetProtein: 150,
  dietType: 'nonveg'
});

assert(mealPlan.success === true, 'AI Meal Planner generates structured day');
assert(mealPlan.meals.breakfast !== undefined, 'Includes Breakfast (Masala oats + eggs)');
assert(mealPlan.meals.lunch !== undefined, 'Includes Lunch (Chicken rice bowl)');
assert(mealPlan.meals.preWorkout !== undefined, 'Includes Pre-Workout (Banana + curd)');
assert(mealPlan.meals.dinner !== undefined, 'Includes Dinner (Paneer + roti)');
assert(mealPlan.groceryList.produce.length > 0, 'Auto-compiles Produce grocery category');
assert(mealPlan.groceryList.proteinAndDairy.length > 0, 'Auto-compiles Protein & Dairy grocery category');
assert(mealPlan.totals.calories > 2000, 'Calculates daily caloric target match');

// ── SECTION 3: Advanced Food Intelligence & Range Estimation ────────────────
console.log('\n🍱 SECTION 3: Advanced Food Intelligence & Range Estimation (Feature 7)');
const rangeResult = AdvancedFoodIntelligenceEngine.estimateNaturalLanguageMeal('2 masala dosas and one filter coffee');

assert(rangeResult.success === true, 'Natural language food estimation succeeds');
assert(rangeResult.isEstimatedRange === true, 'Returns explicit uncertainty range (never fake precision)');
assert(rangeResult.calories.min >= 600 && rangeResult.calories.max <= 850, 'Caloric range correctly spans ~680–780 kcal');
assert(rangeResult.displayRange.includes('Estimated:'), 'Formats range label as "Estimated: MIN–MAX kcal"');

const qualityResult = AdvancedFoodIntelligenceEngine.evaluateMealQuality({
  mealItems: [
    { name: 'Fresh Spinach Salad', calories: 50, protein: 4, fiber: 5 },
    { name: 'Grilled Chicken Breast', calories: 240, protein: 46, fiber: 0 },
    { name: 'Steamed Brown Rice', calories: 220, protein: 5, fiber: 4 }
  ],
  dailyProteinTarget: 140
});

assert(qualityResult.mealQualityScore >= 75, 'High whole-food & protein density yields high meal quality score');
assert(qualityResult.proteinAdequacy.grams === 55, 'Computes meal protein adequacy');
assert(qualityResult.fiberAnalysis.grams === 9, 'Analyzes meal dietary fiber');

// ── SECTION 4: AI Workout Coach & Progressive Overload ──────────────────────
console.log('\n🏋️ SECTION 4: AI Workout Coach & Progressive Overload (Feature 8)');
const workoutSession = AdaptiveWorkoutCoachEngine.generateAdaptiveWorkout({
  goal: 'hypertrophy',
  muscleGroup: 'chest_triceps',
  equipment: 'gym',
  recoveryScore: 85
});

assert(workoutSession.success === true, 'AI Workout Coach generates adaptive session');
assert(workoutSession.muscleGroup.includes('CHEST'), 'Focuses on Chest + Triceps');
assert(workoutSession.exercises.length >= 4, 'Includes multi-angle compound & isolation lifts');

// Progressive Overload 4-Week Baseline Comparison
const baselineComp = AdaptiveWorkoutCoachEngine.compute4WeekBaselineComparison({
  currentWorkout: {
    exercises: [
      { name: 'Barbell Flat Bench Press', sets: [{ weight: 85, reps: 8 }] }
    ]
  },
  historicalLogs: [
    { name: 'Barbell Flat Bench Press', timestamp: Date.now() - 1000000, sets: [{ weight: 80, reps: 8 }] }
  ]
});

assert(baselineComp.liftDeltaKg === 5, 'Detects exact 5kg progression on Bench Press');
assert(baselineComp.headline.includes('improved 5kg compared with your 4-week baseline'), 'Matches authentic progressive overload headline');

// ── SECTION 5: Multi-Device Unified Health Model ────────────────────────────
console.log('\n⌚ SECTION 5: Multi-Device Unified Health Model (Feature 10)');
const unifiedModel = UnifiedHealthModelEngine.buildUnifiedHealthModel({
  appleWatchData: { hr: 68, hrv: 54, workouts: [], activeCalories: 450 },
  boatData: { sleepMinutes: 460, steps: 8420, deepSleepMinutes: 110 },
  bleChestStrap: { liveHr: 142, rrIntervalMs: 820 },
  bpMonitorData: { systolic: 118, diastolic: 78, pulse: 64 }
});

assert(unifiedModel.success === true, 'Unified health model created successfully');
assert(unifiedModel.devicesConnectedCount === 4, 'Combines 4 hardware streams into 1 health model');
assert(unifiedModel.telemetry.liveHeartRate.value === 142, 'Prioritizes live Polar BLE HR strap for active workout HR');
assert(unifiedModel.telemetry.hrv.value === 54, 'Ingests Apple Watch HRV SDNN stream');
assert(unifiedModel.telemetry.sleep.hours === 7.7, 'Ingests boAt sleep duration without collision');
assert(unifiedModel.telemetry.bloodPressure.systolic === 118, 'Ingests BLE BP monitor systolic measurement');

// ── SECTION 6: Personal Health Reports / Weekly Calyxo Report ───────────────
console.log('\n📊 SECTION 6: Personal Health Reports / Weekly Calyxo Report (Feature 13)');
const weeklyReport = PersonalHealthReportEngine.generateWeeklyReport({
  weeklyRecoveryScores: [74, 76, 78, 80, 82, 79, 78],
  previousWeekRecoveryAvg: 73.5,
  workoutSessionsCount: 4,
  targetWorkoutSessions: 4,
  avgProteinGrams: 122,
  targetProteinGrams: 135,
  avgHydrationMl: 2250,
  targetHydrationMl: 2700,
  avgSleepHours: 7.3,
  previousWeekSleepHours: 6.6,
  lowProteinDaysCount: 3,
  userProfile: { firstName: 'Supreeth' }
});

assert(weeklyReport.success === true, 'Weekly Calyxo Report generates cleanly');
assert(weeklyReport.weekSummary.recovery.score === 78, 'Recovery average calculates to 78');
assert(weeklyReport.weekSummary.recovery.deltaPercent === 6, 'Recovery climbed +6% vs prior week');
assert(weeklyReport.weekSummary.training.sessionsCompleted === 4, 'Reflects 4 training sessions');
assert(weeklyReport.weekSummary.protein.percentOfTarget === 90 || weeklyReport.weekSummary.protein.percentOfTarget === 91, 'Reflects ~91% protein target');
assert(weeklyReport.weekSummary.sleep.display === '7h 18m', 'Formats sleep duration as 7h 18m');
assert(weeklyReport.biggestImprovement.includes('sleep consistency improved 11%'), 'Identifies biggest improvement: Sleep consistency (+11%)');
assert(weeklyReport.biggestProblem.includes('Protein intake dropped below target on 3 training days'), 'Identifies biggest problem: Protein dropped on 3 training days');
assert(weeklyReport.nextWeekPriority.includes('Prioritize 25–35g protein at breakfast'), 'Sets clear next week priority: 25–35g protein at breakfast');

// ── SECTION 7: Daily Morning AI Briefing ────────────────────────────────────
console.log('\n🤖 SECTION 7: Daily Morning AI Briefing (Feature 14)');
const dailyBriefing = AIBriefingEngine.generateGroundedBriefing({
  userProfile: { firstName: 'Supreeth', proteinTarget: 140 },
  foodLogs: [{ calories: 400, protein: 25 }],
  workoutLogs: [],
  waterIntake: 800,
  healthLogs: { sleep: 7.7, restingHeartRate: 60 }
});

assert(dailyBriefing.briefingData.recoveryScore >= 75, 'Briefing reports optimal Recovery score');
assert(dailyBriefing.briefingData.recoveryHeadline.includes("ready for moderate-high intensity"), 'Advises ready for moderate-high intensity');
assert(dailyBriefing.briefingData.sleepDisplay === '7h 42m', 'Reports Sleep — 7h 42m');
assert(dailyBriefing.briefingData.sleepDeltaText === '+34m vs your 7-day average', 'Calculates +34m vs 7-day average');
assert(dailyBriefing.briefingData.trainingRecommendation.includes('Upper body'), 'Recommends Upper body session');
assert(dailyBriefing.briefingData.todaysFocus === 'Train hard. Hydrate early. Get 30g protein at breakfast.', "Provides exact actionable Today's Focus directive");

// ── SECTION 8: Monthly AI Rate Limiting & Fair-Use ─────────────────────────
console.log('\n🧠 SECTION 8: Monthly AI Fair-Use vs Unlimited AI (Feature 17)');
const freeQuota = AIUsageLimiter.checkQuota({ subscriptionPlan: 'FREE' }, { id: 'usr_free_test' });
const premiumQuota = AIUsageLimiter.checkQuota({ subscriptionPlan: 'HIGH' }, { id: 'usr_premium_test' });

assert(freeQuota.limit === FREE_MONTHLY_AI_LIMIT, 'Free tier has 10 monthly interactions limit');
assert(freeQuota.isPremium === false, 'Free quota flagged as non-premium');
assert(premiumQuota.limit === Infinity, 'Premium tier has unlimited AI limit');
assert(premiumQuota.isPremium === true, 'Premium quota flagged as unlimited premium');

console.log('\n======================================================================');
console.log(`📊 PREMIUM SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
