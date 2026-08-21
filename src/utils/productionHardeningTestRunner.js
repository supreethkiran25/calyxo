/**
 * Calyxo Production Hardening & Reliability Automated Test Runner
 *
 * Runs standalone regression tests across core engines and algorithms:
 * - Canonical Health Data Normalization & Unit Conversions
 * - Deterministic Clinical Fitness Age Engine
 * - Deterministic Recovery & Training Readiness Engine
 * - Real-Life Challenge Gamification Engine
 * - Wearable Compatibility Profiles
 * - Local Day Boundary Calculations
 */

import {
  createHealthRecord,
  HEALTH_METRIC_TYPES,
  HEALTH_SOURCES,
  UnitConverters,
  getLocalDayBoundaries,
  validateHealthReading
} from '../services/health/CanonicalHealthData.js';

import { calculateDeterministicFitnessAge } from '../services/health/DeterministicFitnessAgeEngine.js';
import { calculateDeterministicRecovery } from '../services/health/DeterministicRecoveryEngine.js';
import { evaluateUserChallenges, CURATED_CHALLENGES } from '../services/workout/ChallengeEngine.js';
import { getWearableProfile, WEARABLE_VENDORS } from '../services/health/WearableCompatibilityManager.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('==================================================');
console.log('🚀 CALYXO MASTER PRODUCTION REGRESSION TEST SUITE');
console.log('==================================================\n');

// ── TEST SUITE 1: CANONICAL HEALTH DATA & ZERO-FAKE-DATA ────────────────
console.log('📦 TEST SUITE 1: Canonical Health Data Normalization');

const nullHeartRate = createHealthRecord({
  metricType: HEALTH_METRIC_TYPES.HEART_RATE,
  value: null,
  unit: 'bpm'
});
assert(nullHeartRate.available === false, 'Null heart rate is marked available: false');
assert(nullHeartRate.displayText === 'No data available', 'Null heart rate shows "No data available"');
assert(nullHeartRate.value === null, 'Null heart rate has value: null (no fallback 72)');

const validHeartRate = createHealthRecord({
  metricType: HEALTH_METRIC_TYPES.HEART_RATE,
  value: 78,
  unit: 'bpm',
  source: HEALTH_SOURCES.APPLE_WATCH,
  isLive: true
});
assert(validHeartRate.available === true, 'Valid heart rate is marked available: true');
assert(validHeartRate.value === 78, 'Valid heart rate preserves exact 78 BPM value');
assert(validHeartRate.source === 'Apple Watch', 'Valid heart rate preserves Apple Watch source');
assert(validHeartRate.isLive === true, 'Valid heart rate preserves isLive: true flag');

// Unit conversions
assert(UnitConverters.kgToLbs(70) === 154.3, '70 kg converts to 154.3 lbs');
assert(UnitConverters.lbsToKg(154.3) === 70, '154.3 lbs converts back to 70.0 kg');
assert(UnitConverters.metersToKm(5000) === 5.0, '5000 meters converts to 5.0 km');
assert(UnitConverters.mlToOz(3000) === 101, '3000 ml converts to 101 oz');

// Local Day Boundaries
const localBounds = getLocalDayBoundaries(new Date('2026-08-20T12:00:00'));
assert(localBounds.localDateStr === '2026-08-20', 'Local day calculation formats local calendar date');
assert(localBounds.endMs > localBounds.startMs, 'End of day ms is strictly after start of day ms');

// ── TEST SUITE 2: DETERMINISTIC FITNESS AGE ENGINE ───────────────────────
console.log('\n🧠 TEST SUITE 2: Deterministic Fitness Age Engine');

const fitAge1 = calculateDeterministicFitnessAge({
  chronologicalAge: 26,
  trainingYears: 4,
  monthlyWorkouts: 16,
  restingHR: 52,
  vo2Max: 48
});
const fitAge2 = calculateDeterministicFitnessAge({
  chronologicalAge: 26,
  trainingYears: 4,
  monthlyWorkouts: 16,
  restingHR: 52,
  vo2Max: 48
});
assert(fitAge1.available === true, 'Fitness age is available for valid profile');
assert(fitAge1.fitnessAge === fitAge2.fitnessAge, 'Deterministic guarantee: identical inputs produce identical Fitness Age');
assert(fitAge1.fitnessAge < 26, 'Trained athlete with low resting HR has fitness age younger than chronological age');

const fitAgeNoBioAge = calculateDeterministicFitnessAge({
  chronologicalAge: null
});
assert(fitAgeNoBioAge.available === false, 'Missing chronological age returns available: false');
assert(fitAgeNoBioAge.status === 'unavailable', 'Missing chronological age marked as unavailable');

// ── TEST SUITE 3: DETERMINISTIC RECOVERY ENGINE ──────────────────────────
console.log('\n⚡ TEST SUITE 3: Deterministic Recovery Engine');

const recoveryHigh = calculateDeterministicRecovery({
  sleepHours: 8.5,
  waterMl: 3200,
  waterGoalMl: 3000,
  proteinGrams: 160,
  proteinGoalGrams: 150,
  soreness: 2,
  fatigue: 2,
  restingHR: 52
});
assert(recoveryHigh.available === true, 'Recovery score is available for active logs');
assert(recoveryHigh.score >= 82, 'Optimal sleep, hydration, and low fatigue yields high recovery (>=82)');
assert(recoveryHigh.readiness === 'OPTIMAL', 'High score marked as OPTIMAL readiness');

const recoveryLow = calculateDeterministicRecovery({
  sleepHours: 4.0,
  waterMl: 800,
  waterGoalMl: 3000,
  proteinGrams: 30,
  proteinGoalGrams: 150,
  soreness: 9,
  fatigue: 9,
  hasLoggedWorkoutToday: true
});
assert(recoveryLow.score < 60, 'Poor sleep, severe soreness, and dehydration yields low recovery (<60)');
assert(recoveryLow.readiness === 'RECOVERY NEEDED', 'Low score marked as RECOVERY NEEDED');

const recoveryNoData = calculateDeterministicRecovery({});
assert(recoveryNoData.available === false, 'Zero logs returns available: false (no fake 85% fallback)');

// ── TEST SUITE 4: REAL-LIFE CHALLENGE GAMIFICATION ENGINE ────────────────
console.log('\n🏆 TEST SUITE 4: Real-Life Challenge Gamification Engine');

const mockWorkouts = [
  { date: '2026-08-19', sets: [{ weight: 100, reps: 10, completed: true }] }, // 1000 kg
  { date: '2026-08-20', sets: [{ weight: 80, reps: 10, completed: true }] }   // 800 kg
];
const mockWater = [{ amount: 2500 }, { amount: 1500 }]; // 4000 ml

const challenges = evaluateUserChallenges({
  workoutLogs: mockWorkouts,
  waterLogs: mockWater,
  currentStreak: 4
});

const streakCh = challenges.find((c) => c.category === 'STREAK');
assert(streakCh.currentProgress === 4, 'Streak challenge correctly reads 4 days from real streak');
assert(streakCh.progressPercent === Math.round((4 / 7) * 100), 'Streak progress % calculated accurately');

const waterCh = challenges.find((c) => c.category === 'HYDRATION');
assert(waterCh.currentProgress === 4000, 'Hydration challenge reads exact 4,000 ml from real water logs');

const strengthCh = challenges.find((c) => c.category === 'STRENGTH');
assert(strengthCh.currentProgress === 1800, 'Strength challenge sums exact 1,800 kg total volume');

// ── TEST SUITE 5: WEARABLE COMPATIBILITY PROFILES ────────────────────────
console.log('\n⌚ TEST SUITE 5: Wearable Compatibility Matrix');

const boatProfile = getWearableProfile('BOAT_SMARTWATCH');
assert(boatProfile !== null, 'boAt smartwatch profile exists');
assert(boatProfile.vendor === WEARABLE_VENDORS.BOAT, 'boAt vendor correctly registered');
assert(boatProfile.requiresCompanionApp === true, 'boAt truthfully declares companion app bridge requirement');
assert(boatProfile.unsupportedMetrics.length > 0, 'boAt truthfully declares unsupported direct BLE limitations');

const appleProfile = getWearableProfile('APPLE_WATCH');
assert(appleProfile.connectionType === 'NATIVE_HEALTHKIT', 'Apple Watch uses native HealthKit & WatchConnectivity');

// ── SUMMARY REPORT ───────────────────────────────────────────────────────
console.log('\n==================================================');
console.log(`📊 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
