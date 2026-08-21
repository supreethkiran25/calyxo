/**
 * Calyxo AI Platform Production Test Runner
 *
 * Validates:
 * 1. Open-ended reasoning and intent classification
 * 2. Medical safety guardrails
 * 3. Deterministic tool calculations (Recovery, Macros, Volume, Fitness Age)
 * 4. Grounded intelligence briefing generation
 * 5. Dynamic plan generation and contextual modification
 * 6. Chat management (hard delete, search, pin, rename, clear)
 * 7. Role-aware context adaptations
 * 8. Plan-to-app action bridge
 */

import { calyxoAIOrchestrator, AI_INTENTS } from '../services/ai/CalyxoAIOrchestrator.js';
import { AIToolRegistry } from '../services/ai/AIToolRegistry.js';
import { aiBriefingEngine } from '../services/ai/AIBriefingEngine.js';
import { chatSessionManager } from '../services/ai/ChatSessionManager.js';
import { planToActionBridge } from '../services/ai/PlanToActionBridge.js';
import { unsupervisedAIAdaptiveEngine, PERFORMANCE_CLUSTERS } from '../services/ai/UnsupervisedAIAdaptiveEngine.js';
import { SubscriptionManager, SUBSCRIPTION_STATES, SUBSCRIPTION_TIERS, AI_CAPABILITIES } from '../services/subscription/SubscriptionManager.js';

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

async function runAITests() {
  console.log('======================================================================');
  console.log('🧠 CALYXO ADVANCED AI PLATFORM AUTOMATED TEST SUITE');
  console.log('======================================================================\n');

  // ── SECTION 1: Open-Ended Natural Language Intent Classification ────────
  console.log('🎯 SECTION 1: Open-Ended Natural Language Intent Classification');
  assert(
    calyxoAIOrchestrator.classifyIntent('Why is my recovery score lower today?') === AI_INTENTS.RECOVERY_EXPLANATION,
    'Classified recovery inquiry as RECOVERY_EXPLANATION'
  );
  assert(
    calyxoAIOrchestrator.classifyIntent('Build me a 30 minute dumbbell workout') === AI_INTENTS.WORKOUT_PLAN_REQUEST,
    'Classified workout request as WORKOUT_PLAN_REQUEST'
  );
  assert(
    calyxoAIOrchestrator.classifyIntent('Make this workout 30 minutes and dumbbells only') === AI_INTENTS.WORKOUT_PLAN_MODIFICATION,
    'Classified modification as WORKOUT_PLAN_MODIFICATION'
  );
  assert(
    calyxoAIOrchestrator.classifyIntent('Create a vegetarian high-protein meal plan') === AI_INTENTS.NUTRITION_PLAN_REQUEST,
    'Classified vegetarian nutrition request as NUTRITION_PLAN_REQUEST'
  );
  assert(
    calyxoAIOrchestrator.classifyIntent('Giv eme one week workout plan') === AI_INTENTS.WEEKLY_WORKOUT_PROGRAM_REQUEST,
    'Classified "Giv eme one week workout plan" as WEEKLY_WORKOUT_PROGRAM_REQUEST'
  );
  assert(
    calyxoAIOrchestrator.classifyIntent('Give me a 7-day workout routine') === AI_INTENTS.WEEKLY_WORKOUT_PROGRAM_REQUEST,
    'Classified 7-day routine as WEEKLY_WORKOUT_PROGRAM_REQUEST'
  );
  assert(
    calyxoAIOrchestrator.classifyIntent('What is my estimated fitness age?') === AI_INTENTS.FITNESS_AGE_QUERY,
    'Classified fitness age inquiry as FITNESS_AGE_QUERY'
  );
  assert(
    calyxoAIOrchestrator.classifyIntent('I have severe chest pain and shortness of breath') === AI_INTENTS.MEDICAL_SAFETY_ALERT,
    'Detected acute red flags as MEDICAL_SAFETY_ALERT'
  );

  // ── SECTION 2: Medical Safety Protocol ──────────────────────────────────
  console.log('\n🛡️ SECTION 2: Medical Safety Protocol');
  const safetyRes = await calyxoAIOrchestrator.processUserQuery({
    query: 'I feel sharp chest pain when lifting',
    userProfile: { nickname: 'Supreeth' }
  });
  assert(safetyRes.text.includes('Important Health Notice'), 'Emits prominent clinical disclaimer');
  assert(safetyRes.text.includes('emergency'), 'Directs user to healthcare professionals / emergency care');
  assert(safetyRes.sourceProvenance === 'Clinical Safety Protocol', 'Labeled as Clinical Safety Protocol');

  // ── SECTION 3: Deterministic Tool Calculations ──────────────────────────
  console.log('\n📐 SECTION 3: Deterministic Tool Calculations');
  const macros = AIToolRegistry.calculateCalorieAndMacroTargets({
    weightKg: 80,
    heightCm: 180,
    age: 28,
    gender: 'male',
    activityLevel: 1.55,
    goal: 'lose',
    dietPreference: 'vegetarian'
  });
  assert(macros.tdee > 2000, 'Calculates valid Mifflin-St Jeor TDEE (> 2000 kcal)');
  assert(macros.targetCalories < macros.tdee, 'Calorie target reflects fat loss deficit');
  assert(macros.macros.protein === 160, 'Vegetarian protein set to exactly 160g (2.0g/kg)');

  const volume = AIToolRegistry.calculateWorkoutVolume([
    {
      name: 'Chest & Back',
      sets: [
        { exerciseName: 'Bench Press', weight: 80, reps: 10, completed: true },
        { exerciseName: 'Bench Press', weight: 80, reps: 8, completed: true },
        { exerciseName: 'Lat Pulldown', weight: 60, reps: 12, completed: true }
      ]
    }
  ]);
  assert(volume.totalTonnageKg === 2160, 'Cumulative tonnage calculated accurately (2,160 kg)');
  assert(volume.totalSets === 3, 'Counts 3 completed sets');

  // ── SECTION 4: Grounded AI Intelligence Briefing Engine ─────────────────
  console.log('\n☀️ SECTION 4: Grounded AI Intelligence Briefing Engine');
  const briefing = aiBriefingEngine.generateGroundedBriefing({
    userProfile: { firstName: 'Supreeth', dailyCalories: 2200, proteinTarget: 150, waterTarget: 3000 },
    foodLogs: [
      { calories: 600, protein: 45, carbs: 60, fat: 18 },
      { calories: 750, protein: 55, carbs: 70, fat: 22 }
    ],
    workoutLogs: [
      { sets: [{ weight: 100, reps: 5, completed: true }] }
    ],
    waterIntake: 2200,
    healthLogs: { sleep: 8.0, restingHeartRate: 54, source: 'Apple Health', lastSyncTimestamp: Date.now() }
  });
  assert(briefing.metricsSummary.workoutCount === 1, 'Reflects exactly 1 completed workout session');
  assert(briefing.metricsSummary.recoveryScore >= 75, 'Computes deterministic high recovery readiness');
  assert(briefing.metricsSummary.nutrition.calories === 1350, 'Includes exact logged calories in briefing breakdown');
  assert(briefing.source === 'Apple Health', 'Source transparency preserves Apple Health origin');

  // ── SECTION 5: Dynamic Plan Generation & In-App Action Bridge ───────────
  console.log('\n🏋️ SECTION 5: Dynamic Plan Generation & Modification');
  const initialWorkoutRes = await calyxoAIOrchestrator.processUserQuery({
    query: 'Build a 45 minute dumbbell upper body routine',
    userProfile: { goal: 'hypertrophy', experience: 'intermediate' }
  });
  assert(initialWorkoutRes.plan !== null, 'Generates structured workout plan object');
  assert(initialWorkoutRes.plan.equipment === 'dumbbells_only', 'Selected dumbbells_only catalog');
  assert(initialWorkoutRes.plan.exercises.length >= 4, 'Includes 4+ compound movements');

  // Modify plan
  const modifiedRes = await calyxoAIOrchestrator.processUserQuery({
    query: 'Make this 30 minutes and home bodyweight only',
    userProfile: { goal: 'hypertrophy' },
    activePlan: initialWorkoutRes.plan
  });
  assert(modifiedRes.plan.durationMinutes === 30, 'Duration updated to 30 minutes');
  assert(modifiedRes.plan.equipment === 'bodyweight', 'Equipment adjusted to bodyweight');

  // In-App Action injection test
  const bridgeRes = await planToActionBridge.applyWorkoutPlan(modifiedRes.plan, {
    user: { uid: 'usr_test_123' },
    userProfile: {}
  });
  assert(bridgeRes.success === true, 'Successfully injected AI workout into Routine store');

  // 7-Day Periodized Program Test
  const weeklyRes = await calyxoAIOrchestrator.processUserQuery({
    query: 'Giv eme one week workout plan',
    userProfile: { goal: 'hypertrophy', experience: 'intermediate' }
  });
  assert(weeklyRes.plan !== null && weeklyRes.plan.isWeeklyProgram === true, 'Generates full 7-day periodized program');
  assert(weeklyRes.plan.days.length === 7, 'Includes exactly 7 structured days');
  assert(weeklyRes.plan.days[0].dayName.includes('Upper'), 'Day 1 focuses on Upper Body');
  assert(weeklyRes.plan.days[1].dayName.includes('Lower'), 'Day 2 focuses on Lower Body');
  assert(weeklyRes.plan.days[6].durationMinutes === 0, 'Day 7 dedicated to Full Rest');

  // Topic-specific Question Answering Test
  const creatineRes = await calyxoAIOrchestrator.processUserQuery({
    query: 'What is creatine and how do I take it?'
  });
  assert(creatineRes.text.includes('Creatine Monohydrate'), 'Accurately answers specific supplement question');
  assert(creatineRes.text.includes('3–5g daily'), 'Includes clinical dosage recommendation');

  // ── SECTION 6: Chat Management & True Hard Deletion ─────────────────────
  console.log('\n💬 SECTION 6: Chat Management & True Hard Deletion');
  const sess1 = chatSessionManager.createSession({ title: 'Diet Discussion' });
  const sess2 = chatSessionManager.createSession({ title: 'Leg Day Optimization' });
  assert(chatSessionManager.getActiveSessionsList().length >= 2, 'Created multiple user conversations');

  // Renaming
  chatSessionManager.renameSession(sess1.id, 'Nutrition Strategy 2026');
  assert(chatSessionManager.sessions.find(s => s.id === sess1.id)?.title === 'Nutrition Strategy 2026', 'Renamed targeted session title');

  // Pinning
  chatSessionManager.togglePin(sess2.id);
  const list = chatSessionManager.getActiveSessionsList();
  assert(list[0].id === sess2.id && list[0].isPinned === true, 'Pinned session floats to the top of the list');

  // Search
  const searchResults = chatSessionManager.searchSessions('Leg Day');
  assert(searchResults.length === 1 && searchResults[0].id === sess2.id, 'Search filters conversations accurately');

  // Deletion (True Hard Delete)
  const countBefore = chatSessionManager.sessions.length;
  chatSessionManager.deleteSession(sess1.id);
  assert(chatSessionManager.sessions.length === countBefore - 1, 'Hard deleted session from memory & store');
  assert(!chatSessionManager.sessions.some(s => s.id === sess1.id), 'Deleted session no longer exists in index');

  // ── SECTION 7: Canonical Subscription Entitlements ───────────────────────
  console.log('\n👑 SECTION 7: Canonical Subscription Entitlements');
  const freeProfile = { subscriptionPlan: 'FREE', isSubscribed: false };
  const proProfile = { subscriptionPlan: 'MEDIUM', isSubscribed: true };
  const adminProfile = { role: 'admin' };

  assert(
    SubscriptionManager.hasAICapability(AI_CAPABILITIES.BASIC_INTELLIGENCE_PREVIEW, freeProfile),
    'Free tier entitled to Basic Intelligence preview'
  );
  assert(
    !SubscriptionManager.hasAICapability(AI_CAPABILITIES.DYNAMIC_WORKOUT_PLANNING, freeProfile),
    'Free tier blocked from advanced plan generation'
  );
  assert(
    SubscriptionManager.hasAICapability(AI_CAPABILITIES.GYM_BUSINESS_INTELLIGENCE, adminProfile),
    'Admin role entitled to Gym Business Intelligence'
  );

  // ── SECTION 8: Unsupervised Learning & Autoregulation Engine ─────────────
  console.log('\n🧬 SECTION 8: Unsupervised Learning & Autoregulation Engine');
  const featureVec = unsupervisedAIAdaptiveEngine.extractFeatureVector({
    workoutLogs: [{ sets: [{ weight: 100, reps: 5, completed: true }] }],
    foodLogs: [{ calories: 2200, protein: 160 }],
    healthLogs: { sleep: 8.2, restingHeartRate: 52 },
    waterIntake: 2800,
    userProfile: { streak: 5, dailyCalories: 2200, waterTarget: 2500 }
  });
  assert(featureVec.length === 4, 'Extracted 4-dimensional normalized biometric feature vector');
  assert(featureVec[1] >= 0.8, 'High sleep + low resting HR yields high recovery vector component');

  const clusterRes = unsupervisedAIAdaptiveEngine.classifyPerformanceCluster(featureVec);
  assert(clusterRes.cluster.id !== undefined, 'Unsupervised centroid matches valid performance cluster');
  assert(clusterRes.similarityConfidence >= 65, 'Computes valid unsupervised similarity confidence');

  const autoregulated = unsupervisedAIAdaptiveEngine.autoregulateWorkout({
    exercises: [{ name: 'Squat', sets: 4, restSeconds: 90 }]
  }, clusterRes);
  assert(autoregulated.aiAutoregulation !== undefined, 'Injects explainable unsupervised metadata');
  assert(autoregulated.aiAutoregulation.clusterName === PERFORMANCE_CLUSTERS.OPTIMAL_HYPERTROPHY.name, 'Preserves cluster name in plan');

  // Edge case: Null / empty inputs safety
  const emptyRes = await calyxoAIOrchestrator.processUserQuery({
    query: 'hello',
    userProfile: null,
    user: null,
    foodLogs: null,
    workoutLogs: null,
    healthLogs: null
  });
  assert(emptyRes && emptyRes.text.length > 0, 'Gracefully handles null logs/profile without throwing');

  const nullVec = unsupervisedAIAdaptiveEngine.extractFeatureVector({
    workoutLogs: null,
    foodLogs: null,
    healthLogs: null,
    userProfile: null
  });
  assert(nullVec.length === 4, 'Feature extraction returns valid vector even with null inputs');

  console.log('\n======================================================================');
  console.log(`📊 AI SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) process.exit(1);
}

runAITests();
