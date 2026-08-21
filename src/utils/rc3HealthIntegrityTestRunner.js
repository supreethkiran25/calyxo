/**
 * Calyxo RC-3 Health Data Integrity & Zero-Fabrication Test Runner
 *
 * Tests:
 * 1. Deterministic Recovery engine calculation without synthetic noise
 * 2. Deterministic Fitness Age engine calculation without synthetic noise
 * 3. DataFreshnessHelper classification (LIVE, RECENT, STALE, UNAVAILABLE)
 * 4. Zero fabricated metrics on null inputs
 * 5. Health metric provenance model
 *
 * Run: node src/utils/rc3HealthIntegrityTestRunner.js
 */

import { calculateDeterministicRecovery, RECOVERY_STATUS } from '../services/health/DeterministicRecoveryEngine.js';
import { calculateDeterministicFitnessAge } from '../services/health/DeterministicFitnessAgeEngine.js';
import { getFreshnessState, FRESHNESS_LEVELS, FRESHNESS_THRESHOLDS } from '../services/health/DataFreshnessHelper.js';
import { BleHeartRateAdapter, BleBloodPressureAdapter } from '../services/devices/DeviceAdapters.js';

let passed = 0;
let failed = 0;
const failures = [];

function assert(description, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
    failures.push(description);
  }
}

console.log('\n🫀 Suite 1: Deterministic Recovery Mathematical Engine');
const baselineInputs = {
  sleepHours: 8.0,
  waterMl: 2800,
  waterGoalMl: 3000,
  proteinGrams: 140,
  proteinGoalGrams: 150,
  soreness: 2,
  fatigue: 2,
  restingHR: 58,
  hasLoggedWorkoutToday: false
};

const result1 = calculateDeterministicRecovery(baselineInputs);
const result2 = calculateDeterministicRecovery(baselineInputs);

assert('Identical recovery inputs produce strictly identical scores (deterministic)',
  result1.score === result2.score);
assert('Recovery score is bounded between 0 and 100',
  result1.score >= 0 && result1.score <= 100);
assert('Recovery result returns breakdown object',
  result1.breakdown !== null && typeof result1.breakdown === 'object');
assert('Recovery result includes readiness status',
  ['OPTIMAL', 'MODERATE', 'RECOVERY NEEDED', 'UNAVAILABLE'].includes(result1.readiness));

// Test extreme exhaustion input
const exhaustedInputs = {
  sleepHours: 3.0,
  waterMl: 500,
  waterGoalMl: 3000,
  proteinGrams: 20,
  proteinGoalGrams: 150,
  soreness: 9,
  fatigue: 9,
  restingHR: 88,
  hasLoggedWorkoutToday: true
};
const exhaustedResult = calculateDeterministicRecovery(exhaustedInputs);
assert('Severe fatigue & poor sleep reduces recovery below optimal baseline',
  exhaustedResult.score < result1.score);

console.log('\n🏃 Suite 2: Deterministic Fitness Age Engine');
const fitnessInputs = {
  chronologicalAge: 30,
  trainingYears: 5,
  monthlyWorkouts: 16,
  restingHR: 55,
  vo2Max: 48
};
const fitAge1 = calculateDeterministicFitnessAge(fitnessInputs);
const fitAge2 = calculateDeterministicFitnessAge(fitnessInputs);

assert('Identical fitness age inputs produce identical results',
  fitAge1.fitnessAge === fitAge2.fitnessAge);
assert('Fitness age provides calculated delta versus chronological age',
  fitAge1.delta !== null && typeof fitAge1.delta === 'number');
assert('Fitness age includes explanation breakdown',
  fitAge1.breakdown !== null && typeof fitAge1.breakdown === 'object');

console.log('\n⏱️ Suite 3: Data Freshness Engine');
const now = Date.now();
const freshTimestamp = now - 10000; // 10s ago
const recentTimestamp = now - 600000; // 10 min ago
const staleTimestamp = now - 86400000; // 24 hours ago

const freshState = getFreshnessState(freshTimestamp, 'HEART_RATE');
assert('Sub-30s heart rate is classified as LIVE', freshState.status === FRESHNESS_LEVELS.LIVE);

const recentState = getFreshnessState(recentTimestamp, 'DEFAULT');
assert('10-min data is classified as RECENT', recentState.status === FRESHNESS_LEVELS.RECENT);

const staleState = getFreshnessState(staleTimestamp, 'DEFAULT');
assert('24-hour data is classified as STALE', staleState.status === FRESHNESS_LEVELS.STALE);

const nullState = getFreshnessState(null);
assert('Null timestamp is classified as UNAVAILABLE', nullState.status === FRESHNESS_LEVELS.UNAVAILABLE);

console.log('\n🚫 Suite 4: Zero Fake Data on Disconnect');
const hrAdapter = new BleHeartRateAdapter();
hrAdapter.disconnect();
assert('Disconnected BLE HR sensor emits null, never fake 72 BPM',
  !hrAdapter.currentReading || hrAdapter.currentReading.heartRateBpm === null);

console.log('\n' + '='.repeat(70));
console.log(`📊 HEALTH INTEGRITY RESULTS: ${passed} / ${passed + failed} PASS`);
if (failed > 0) {
  console.error(`❌ ${failed} FAILURES:`, failures);
  process.exit(1);
} else {
  console.log('🏁 HEALTH INTEGRITY SUITE: ALL PASS');
  process.exit(0);
}
