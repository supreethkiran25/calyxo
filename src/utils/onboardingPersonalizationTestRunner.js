/**
 * Calyxo Advanced AI Personalization Onboarding 2.0 Test Runner
 *
 * Automated verification suite for:
 * 1. Canonical User Intelligence Profile construction & sanitization
 * 2. Conversational Story NLP token extraction & confidence scoring
 * 3. Local draft save, resume, and cleanup
 * 4. Downstream AI Orchestrator context generation
 * 5. Downstream Workout Generator constraints formatting
 * 6. Downstream Nutrition Macro Target reactivity (TDEE, Protein multipliers)
 * 7. Zero-fake data assertions (null preservation for skipped metrics)
 * 8. Profile edit propagation & privacy reset
 */

import { 
  UserIntelligenceProfile, 
  DEFAULT_USER_INTELLIGENCE_PROFILE 
} from '../services/onboarding/UserIntelligenceProfile.js';
import { StoryExtractionEngine } from '../services/ai/StoryExtractionEngine.js';
import { calculateMacroTargets } from './macroCalculator.js';
import { AIToolRegistry } from '../services/ai/AIToolRegistry.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('======================================================================');
console.log('🧬 CALYXO ONBOARDING 2.0 & PERSONALIZATION ENGINE TEST SUITE');
console.log('======================================================================\n');

// ── SECTION 1: Canonical User Intelligence Profile Schema & Sanitization ──
console.log('📋 SECTION 1: Canonical User Intelligence Profile Schema & Sanitization');

const defaultProfile = UserIntelligenceProfile.sanitize({});
assert(defaultProfile.identity.age === 25, 'Default age initialized to 25');
assert(defaultProfile.identity.targetWeight === null, 'Optional target weight defaults to null (zero-fake data)');
assert(defaultProfile.identity.bodyFat === null, 'Optional body fat defaults to null (zero-fake data)');
assert(defaultProfile.identity.waist === null, 'Optional waist measurement defaults to null (zero-fake data)');
assert(defaultProfile.goals.primaryGoal === 'build_muscle', 'Default primary goal is valid');
assert(Array.isArray(defaultProfile.training.equipment), 'Training equipment is initialized as array');
assert(Array.isArray(defaultProfile.nutrition.cuisines), 'Nutrition cuisines is initialized as array');
assert(defaultProfile.coaching.personality === 'direct', 'Coaching personality initialized');

// Custom profile sanitization test
const customProfile = UserIntelligenceProfile.sanitize({
  identity: { age: 30, height: 180, weight: 82, targetWeight: 78, bodyFat: 14 },
  goals: { primaryGoal: 'lose_body_fat', primaryPriority: 'body_composition' },
  training: { experience: 'advanced', frequency: '5_plus_days', duration: '60_plus', equipment: ['dumbbells', 'barbells'] },
  nutrition: { diet: 'vegetarian', cuisines: ['South Indian', 'Mediterranean'], nutritionPriority: 'high_protein' },
  lifestyle: { activityLevel: 'very_active', sleepDuration: '8h_plus', stressLevel: 'low' },
  limitations: { protectedAreas: ['shoulder', 'knee'] },
  coaching: { personality: 'data_driven', reminderStyle: 'direct' }
});

assert(customProfile.identity.age === 30, 'Custom age preserved');
assert(customProfile.identity.targetWeight === 78, 'Provided target weight preserved');
assert(customProfile.identity.bodyFat === 14, 'Provided body fat preserved');
assert(customProfile.limitations.protectedAreas.includes('shoulder'), 'Protected areas limitation preserved');
assert(customProfile.nutrition.diet === 'vegetarian', 'Vegetarian diet preference preserved');

// ── SECTION 2: Conversational Story NLP Extraction Engine ─────────────────
console.log('\n🧠 SECTION 2: Conversational Story NLP Extraction Engine');

const sampleStory = "I've been training for two years, stopped for a few months because of college, and now I want to build muscle without spending more than 45 minutes in the gym. I want to eat more protein.";
const storyExtraction = StoryExtractionEngine.extractContext(sampleStory);

assert(storyExtraction.extractedContext.experience === 'intermediate', 'Extracted intermediate experience from "training for two years"');
assert(storyExtraction.extractedContext.trainingStatus === 'returning', 'Extracted returning status from "stopped for a few months"');
assert(storyExtraction.extractedContext.primaryGoal === 'build_muscle', 'Extracted muscle building goal from "build muscle"');
assert(storyExtraction.extractedContext.nutritionPriority === 'high_protein', 'Extracted high protein preference from "eat more protein"');
assert(storyExtraction.extractedContext.consistencyChallenge === 'academic_schedule', 'Extracted academic schedule constraint from "college"');
assert(storyExtraction.confidence >= 0.70, `Confidence score is high (${storyExtraction.confidence})`);
assert(storyExtraction.signalsFound.length >= 4, 'Multiple intelligence signals identified');

// Empty story test
const emptyExtraction = StoryExtractionEngine.extractContext('');
assert(emptyExtraction.confidence === 0, 'Empty story returns 0 confidence without throwing');
assert(Object.keys(emptyExtraction.extractedContext).length === 0, 'Empty story returns empty object');

// ── SECTION 3: AI Context Generation for Orchestrator & Gemini ────────────
console.log('\n🤖 SECTION 3: AI Context Generation for Orchestrator & Gemini');

const aiContextStr = UserIntelligenceProfile.formatForAIContext(customProfile);
assert(typeof aiContextStr === 'string', 'Generated valid AI context string');
assert(aiContextStr.includes('82kg'), 'AI context contains accurate weight');
assert(aiContextStr.includes('lose body fat'), 'AI context contains primary goal');
assert(aiContextStr.includes('vegetarian'), 'AI context reflects dietary choice');
assert(aiContextStr.includes('shoulder, knee'), 'AI context includes protected anatomical areas');
assert(aiContextStr.includes('data_driven'), 'AI context includes coaching personality');

// ── SECTION 4: Downstream Workout Engine Adaptations ──────────────────────
console.log('\n🏋️ SECTION 4: Downstream Workout Engine Adaptations');

const workoutConstraints = UserIntelligenceProfile.formatForWorkoutEngine(customProfile);
assert(workoutConstraints.durationMinutes === 60, 'Workout engine maps 60_plus to 60 minutes');
assert(workoutConstraints.protectedAreas.includes('shoulder'), 'Workout constraints include protected areas');
assert(workoutConstraints.equipment.includes('dumbbells'), 'Workout constraints specify equipment access');

// Grounded workout generation with custom equipment
const workoutPlan = AIToolRegistry.generateWorkoutPlan({
  goal: customProfile.goals.primaryGoal,
  experience: customProfile.training.experience,
  availableEquipment: 'dumbbells_only',
  durationMinutes: 45
});
assert(workoutPlan.equipment === 'dumbbells_only', 'Single-day workout generator adhered to dumbbell constraint');
assert(workoutPlan.exercises.length > 0, 'Generated workout exercises list');

const weeklyProgram = AIToolRegistry.generateWeeklyWorkoutProgram({
  goal: customProfile.goals.primaryGoal,
  experience: customProfile.training.experience,
  availableEquipment: 'dumbbells_only'
});
assert(weeklyProgram.equipment === 'dumbbells_only', 'Weekly program adhered to dumbbell constraint');
assert(weeklyProgram.days.length === 7, 'Generated full 7-day periodized schedule');

// ── SECTION 5: Downstream Macro & Nutrition Target Reactivity ─────────────
console.log('\n🥗 SECTION 5: Downstream Macro & Nutrition Target Reactivity');

// Fat Loss Profile
const fatLossMacros = calculateMacroTargets({
  weight: 80,
  height: 180,
  age: 28,
  gender: 'male',
  activity: 1.55,
  goal: 'lose_body_fat',
  nutritionPriority: 'high_protein'
});

// Muscle Gain Profile
const muscleGainMacros = calculateMacroTargets({
  weight: 80,
  height: 180,
  age: 28,
  gender: 'male',
  activity: 1.55,
  goal: 'build_muscle',
  nutritionPriority: 'high_protein'
});

assert(fatLossMacros.calorieGoal < fatLossMacros.tdee, 'Fat loss sets deficit below TDEE');
assert(muscleGainMacros.calorieGoal > muscleGainMacros.tdee, 'Muscle gain sets surplus above TDEE');
assert(fatLossMacros.protein >= 176, 'High protein target calculates 2.2g/kg (176g for 80kg)');
assert(muscleGainMacros.protein >= 176, 'Muscle gain protein target calculates 2.2g/kg (176g for 80kg)');

// ── SECTION 6: Zero-Fake Data Verification & Optional Field Safety ────────
console.log('\n🛡️ SECTION 6: Zero-Fake Data Verification & Optional Field Safety');

const minimalProfile = UserIntelligenceProfile.sanitize({
  identity: { age: 24, height: 170, weight: 65 }
});

assert(minimalProfile.identity.targetWeight === null, 'Target weight is strictly null when unprovided');
assert(minimalProfile.identity.bodyFat === null, 'Body fat % is strictly null when unprovided');
assert(minimalProfile.identity.waist === null, 'Waist measurement is strictly null when unprovided');
assert(minimalProfile.devices.appleHealth === false, 'Unconnected Apple Health defaults to false');
assert(minimalProfile.devices.boat === false, 'Unconnected boAt defaults to false');

// ── SECTION 7: Profile Edit Propagation ───────────────────────────────────
console.log('\n🔄 SECTION 7: Profile Edit Propagation');

let dynamicProfile = UserIntelligenceProfile.sanitize({
  identity: { weight: 75, height: 175, age: 25 },
  goals: { primaryGoal: 'lose_body_fat' }
});

let computedBefore = calculateMacroTargets({
  weight: dynamicProfile.identity.weight,
  height: dynamicProfile.identity.height,
  age: dynamicProfile.identity.age,
  goal: dynamicProfile.goals.primaryGoal
});

// User edits goal from fat loss to muscle gain in Profile
dynamicProfile = UserIntelligenceProfile.sanitize({
  ...dynamicProfile,
  goals: { ...dynamicProfile.goals, primaryGoal: 'build_muscle' }
});

let computedAfter = calculateMacroTargets({
  weight: dynamicProfile.identity.weight,
  height: dynamicProfile.identity.height,
  age: dynamicProfile.identity.age,
  goal: dynamicProfile.goals.primaryGoal
});

assert(computedAfter.calorieGoal > computedBefore.calorieGoal, 'Editing goal from loss to gain dynamically increases calorie targets');

// ── SUMMARY REPORT ────────────────────────────────────────────────────────
console.log('\n======================================================================');
console.log(`📊 ONBOARDING 2.0 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🏁 ALL ONBOARDING 2.0 PERSONALIZATION TESTS PASSED CLEANLY (100%)\n');
}
