/**
 * Calyxo Platform Hardening Automated Test Runner
 *
 * Runs comprehensive regression tests covering:
 * - Device Compatibility Manager & Registry
 * - Device Adapters & Deduplication Logic
 * - Data Freshness Classifications
 * - Event-Sourced Sync Engine & Conflict Resolution
 * - Centralized Notification Manager & Deduplication
 * - Advanced Gamification Engine & Social Privacy Scopes
 * - Explainable AI Coaching & Predictive Insights
 * - Unified Permission Manager & User Data Purge
 */

import {
  DeviceCompatibilityManager,
  DEVICE_CAPABILITIES,
  INTEGRATION_STATUS
} from '../services/devices/DeviceCompatibilityManager.js';

import {
  AppleWatchAdapter,
  BoatDeviceAdapter,
  BleBloodPressureAdapter
} from '../services/devices/DeviceAdapters.js';

import { getFreshnessState, FRESHNESS_THRESHOLDS } from '../services/health/DataFreshnessHelper.js';

import {
  createSyncEvent,
  ConflictResolver,
  OutboxSyncManager,
  ENTITY_TYPES,
  SYNC_OPERATIONS
} from '../services/sync/SyncEngine.js';

import { CalyxoNotificationManager, NOTIFICATION_CATEGORIES } from '../services/notifications/CalyxoNotificationManager.js';
import { AdvancedGamificationEngine, GAMIFICATION_EVENTS, SOCIAL_PRIVACY_SCOPES } from '../services/workout/AdvancedGamificationEngine.js';
import { ExplainableAICoachService } from '../services/ai/ExplainableAICoachService.js';
import { UnifiedPermissionManager, PERMISSION_DOMAINS, PERMISSION_STATUS } from '../services/privacy/UnifiedPermissionManager.js';

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
console.log('🚀 CALYXO PLATFORM HARDENING AUTOMATED TEST SUITE');
console.log('==================================================\n');

// ── TEST SUITE 1: DEVICE COMPATIBILITY MANAGER & REGISTRY ──────────────
console.log('📱 TEST SUITE 1: Device Compatibility Manager & Registry');

const registry = DeviceCompatibilityManager.getRegistry();
assert(registry.length >= 7, 'Device registry contains all registered manufacturers and profiles');

const appleWatch = DeviceCompatibilityManager.getDeviceProfile('apple_watch_all');
assert(appleWatch !== null, 'Apple Watch profile exists');
assert(appleWatch.integrationStatus === INTEGRATION_STATUS.SUPPORTED, 'Apple Watch marked as SUPPORTED via HealthKit');
assert(
  DeviceCompatibilityManager.hasCapability('apple_watch_all', DEVICE_CAPABILITIES.HEART_RATE_LIVE),
  'Apple Watch supports live heart rate capability'
);

const boatWatch = DeviceCompatibilityManager.getDeviceProfile('boat_wave_xtend');
assert(boatWatch !== null, 'boAt smartwatch profile exists');
assert(
  boatWatch.integrationStatus === INTEGRATION_STATUS.REQUIRES_HEALTH_BRIDGE,
  'boAt truthfully marked as REQUIRES_HEALTH_BRIDGE'
);
assert(boatWatch.requiresCompanionBridge === true, 'boAt truthfully declares companion bridge requirement');
assert(
  !DeviceCompatibilityManager.hasCapability('boat_wave_xtend', DEVICE_CAPABILITIES.HEART_RATE_LIVE),
  'boAt truthfully declares live sub-second HR streaming is unsupported without external SDK'
);

const instructions = DeviceCompatibilityManager.getSetupInstructions('boat_wave_xtend');
assert(instructions.includes('boAt Crest / boAt Hub'), 'Setup instructions guide user to link companion app');

// ── TEST SUITE 2: DEVICE ADAPTERS & DEDUPLICATION ───────────────────────
console.log('\n⌚ TEST SUITE 2: Device Adapters & Deduplication');

const appleAdapter = new AppleWatchAdapter();
const sample1 = appleAdapter.normalizeHeartRate(76, 'sample-12345', Date.now());
assert(sample1 !== null, 'First instance of Apple Watch sample-12345 is accepted');
assert(sample1.value === 76, 'Preserves exact 76 BPM reading');

const sampleDuplicate = appleAdapter.normalizeHeartRate(76, 'sample-12345', Date.now());
assert(sampleDuplicate === null, 'Duplicate instance of sample-12345 is dropped to prevent double counting');

const boatAdapter = new BoatDeviceAdapter('boAt Wave Prime');
const boatRecords = boatAdapter.normalizeBridgeData({
  steps: 6420,
  restingHR: 68,
  sleepMinutes: 450
});
assert(boatRecords.length === 3, 'boAt adapter normalizes steps, resting HR, and sleep');
assert(boatRecords.find((r) => r.metricType === 'steps').value === 6420, 'boAt steps value preserved accurately');
assert(boatRecords.find((r) => r.metricType === 'sleep').value === 7.5, 'boAt 450 minutes converted to 7.5 hours');

const bpAdapter = new BleBloodPressureAdapter();
const bpReading = bpAdapter.normalizeReading({
  systolic: 120,
  diastolic: 80,
  pulse: 72,
  deviceName: 'Omron BP7000'
});
assert(bpReading.available === true, 'Blood pressure reading normalized');
assert(bpReading.value.systolic === 120, 'Systolic stored independently (120 mmHg)');
assert(bpReading.value.diastolic === 80, 'Diastolic stored independently (80 mmHg)');
assert(bpReading.value.pulse === 72, 'Pulse rate stored independently (72 BPM)');

// ── TEST SUITE 3: DATA FRESHNESS CLASSIFICATION ────────────────────────
console.log('\n⏱️ TEST SUITE 3: Data Freshness & Provenance Indicators');

const liveHR = getFreshnessState(Date.now() - 10000, 'HEART_RATE'); // 10s old
assert(liveHR.status === 'LIVE', 'Heart rate under 30s is classified as LIVE');

const freshSteps = getFreshnessState(Date.now() - 5 * 60 * 1000, 'STEPS'); // 5m old
assert(freshSteps.status === 'RECENT' || freshSteps.status === 'FRESH', 'Steps under 15m classified as RECENT / FRESH');

const staleSteps = getFreshnessState(Date.now() - 3 * 3600 * 1000, 'STEPS'); // 3h old
assert(staleSteps.status === 'STALE', 'Steps older than 2h classified as STALE');

const nullFreshness = getFreshnessState(null, 'HEART_RATE');
assert(nullFreshness.status === 'UNAVAILABLE', 'Null timestamp classified as UNAVAILABLE');

// ── TEST SUITE 4: EVENT-SOURCED SYNC & CONFLICT RESOLUTION ──────────────
console.log('\n🔄 TEST SUITE 4: Event-Sourced Sync & Conflict Resolution');

const syncEvt1 = createSyncEvent({
  entityType: ENTITY_TYPES.WATER_LOG,
  entityId: 'water-2026-08-20',
  operation: SYNC_OPERATIONS.APPEND_LOG,
  payload: { amount: 500, timestamp: 1000 }
});
assert(syncEvt1.eventId.startsWith('evt_WATER_LOG'), 'Sync event assigned unique immutable event ID');
assert(syncEvt1.dedupeKey.includes('WATER_LOG_water-2026-08-20'), 'Dedupe key contains entity and operation signature');

// Conflict Resolution: Workout Set Merge
const localWorkout = {
  id: 'w-1',
  sets: [{ setNumber: 1, weight: 60, reps: 10, completed: true }]
};
const inWorkout = {
  id: 'w-1',
  sets: [
    { setNumber: 1, weight: 60, reps: 10, completed: true },
    { setNumber: 2, weight: 70, reps: 8, completed: true }
  ]
};
const mergedWorkout = ConflictResolver.resolveWorkoutConflict(localWorkout, inWorkout);
assert(mergedWorkout.sets.length === 2, 'Workout conflict resolution merges sets without dropping progress');
assert(mergedWorkout.sets[1].weight === 70, 'Preserves incoming completed set 2');

// Conflict Resolution: Hydration Delta Event Merge
const localHydration = [{ id: 'h1', amount: 500, timestamp: 100 }];
const inHydration = [
  { id: 'h1', amount: 500, timestamp: 100 },
  { id: 'h2', amount: 250, timestamp: 200 }
];
const mergedHydration = ConflictResolver.resolveHydrationConflict(localHydration, inHydration);
assert(mergedHydration.length === 2, 'Hydration conflict merges distinct events and deduplicates duplicate IDs');

// ── TEST SUITE 5: NOTIFICATION MANAGER & DEDUPLICATION ──────────────────
console.log('\n🔔 TEST SUITE 5: Notification Manager & Deduplication');

const notifMgr = new CalyxoNotificationManager();
notifMgr.setCategoryPreference(NOTIFICATION_CATEGORIES.HYDRATION, false);
assert(!notifMgr.isCategoryEnabled(NOTIFICATION_CATEGORIES.HYDRATION), 'Category preference toggle is respected');
assert(notifMgr.isCategoryEnabled(NOTIFICATION_CATEGORIES.WORKOUT), 'Enabled category remains active');

// ── TEST SUITE 6: ADVANCED GAMIFICATION ENGINE ──────────────────────────
console.log('\n🎮 TEST SUITE 6: Advanced Gamification & Social Privacy');

const gamification = new AdvancedGamificationEngine();
gamification.totalXp = 0;
gamification.claimedEventIds.clear();

const award1 = gamification.awardEventXp(GAMIFICATION_EVENTS.WORKOUT_COMPLETED, 'workout-event-101');
assert(award1.awarded === true, 'First workout completion awards +100 XP');
assert(gamification.totalXp === 100, 'Total XP increments accurately to 100');
assert(gamification.getLevel() === 2, '100 XP unlocks Level 2');

const awardDuplicate = gamification.awardEventXp(GAMIFICATION_EVENTS.WORKOUT_COMPLETED, 'workout-event-101');
assert(awardDuplicate.awarded === false, 'Duplicate reward for workout-event-101 is prevented (idempotency)');
assert(gamification.totalXp === 100, 'Total XP remains 100 without duplicate inflation');

gamification.setPrivacyScope(SOCIAL_PRIVACY_SCOPES.FRIENDS);
assert(gamification.getPrivacyScope() === SOCIAL_PRIVACY_SCOPES.FRIENDS, 'Privacy scope updated to FRIENDS');

// ── TEST SUITE 7: EXPLAINABLE AI COACHING & PREDICTIONS ─────────────────
console.log('\n💡 TEST SUITE 7: Explainable AI Coaching & Predictive Insights');

const explanation = ExplainableAICoachService.explainRecoveryChange({
  sleepHours: 6.0,
  waterMl: 3000,
  waterGoalMl: 3000,
  proteinGrams: 150,
  proteinGoalGrams: 150,
  hasLoggedWorkoutToday: true
});
assert(explanation.available === true, 'Explainable recovery breakdown available');
assert(explanation.reasons.some((r) => r.includes('Sleep deficit')), 'Identified exact sleep deficit reasoning');
assert(explanation.reasons.some((r) => r.toLowerCase().includes('hydration target fulfilled')), 'Identified hydration contribution');

const prediction = ExplainableAICoachService.generatePredictiveInsight({
  currentWeightKg: 80,
  targetWeightKg: 75,
  weeklyDeficitCalories: 3850 // ~0.5 kg/week -> 10 weeks
});
assert(prediction.hasInsight === true, 'Predictive trajectory generated');
assert(prediction.projectedWeeks === 10, 'Estimated ~10 weeks based on mathematical caloric rate');
assert(prediction.type === 'TREND_ESTIMATE', 'Clearly labeled as TREND_ESTIMATE disclaimer');

// ── TEST SUITE 8: UNIFIED PRIVACY & PERMISSION MANAGER ──────────────────
console.log('\n🔒 TEST SUITE 8: Unified Privacy & Permission Manager');

const permMgr = new UnifiedPermissionManager();
permMgr.setPermissionStatus(PERMISSION_DOMAINS.HEALTHKIT, PERMISSION_STATUS.AUTHORIZED);
assert(
  permMgr.getPermissionStatus(PERMISSION_DOMAINS.HEALTHKIT) === PERMISSION_STATUS.AUTHORIZED,
  'HealthKit permission status tracked as AUTHORIZED'
);

// ── SUMMARY REPORT ───────────────────────────────────────────────────────
console.log('\n==================================================');
console.log(`📊 PLATFORM SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
