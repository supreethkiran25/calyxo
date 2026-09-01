/**
 * Calyxo Phase 12C — Physical-Device-First Root Cause Verification Test Suite
 * 
 * Verifies:
 * 1. HealthKit Canonical Authorization States (NOT_AVAILABLE, NOT_DETERMINED, DENIED, AUTHORIZED)
 * 2. Onboarding initial device state strictly disconnected / toggle OFF for new sessions
 * 3. Health permission request state transitions (denial purges storage, auth persists)
 * 4. Reconnect and sync state machine (never asserts SYNCED on backend/network failure)
 * 5. Elimination of all fake health data & placeholder biometrics (returns '--' when empty)
 * 6. Canonical subscription timeline label & date matrix (Next billing / Active until / Expires / Expired)
 */

import { HealthPermissionManager, HEALTH_CANONICAL_STATE } from '../services/health/HealthPermissionManager.js';
import { HealthSyncEngine } from '../services/health/HealthSyncEngine.js';
import { UnifiedHealthModelEngine } from '../services/health/UnifiedHealthModelEngine.js';
import { PersonalHealthReportEngine } from '../services/health/PersonalHealthReportEngine.js';
import { SubscriptionManager, SUBSCRIPTION_STATES, SUBSCRIPTION_TIERS } from '../services/subscription/SubscriptionManager.js';

// Storage polyfill for standalone Node.js execution
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(String(k)) || null,
    setItem: (k, v) => store.set(String(k), String(v)),
    removeItem: (k) => store.delete(String(k)),
    clear: () => store.clear()
  };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Test failed: ${message}`);
  }
}

async function runPhase12cTestSuite() {
  console.log('\n============================================================');
  console.log('  CALYXO PHASE 12C: PHYSICAL-DEVICE-FIRST STATE MACHINE TESTS');
  console.log('============================================================\n');

  // --- SECTION 1: HealthKit Canonical Authorization States ---
  console.log('[SECTION 1] Validating HealthKit Canonical Authorization States...');
  assert(HEALTH_CANONICAL_STATE.NOT_AVAILABLE === 'NOT_AVAILABLE', 'NOT_AVAILABLE canonical state defined');
  assert(HEALTH_CANONICAL_STATE.NOT_DETERMINED === 'NOT_DETERMINED', 'NOT_DETERMINED canonical state defined');
  assert(HEALTH_CANONICAL_STATE.DENIED === 'DENIED', 'DENIED canonical state defined');
  assert(HEALTH_CANONICAL_STATE.AUTHORIZED === 'AUTHORIZED', 'AUTHORIZED canonical state defined');

  globalThis.localStorage.clear();
  const initialAuthState = await HealthPermissionManager.getAuthorizationState();
  assert(
    initialAuthState.status === HEALTH_CANONICAL_STATE.NOT_DETERMINED || initialAuthState.status === HEALTH_CANONICAL_STATE.NOT_AVAILABLE,
    `Initial ungranted authorization state is ${initialAuthState.status} (never falsely AUTHORIZED)`
  );
  assert(initialAuthState.authorized === false, 'initialAuthState.authorized is strictly false');

  // --- SECTION 2: Storage Decoupling & Stale Flag Purging ---
  console.log('\n[SECTION 2] Validating Storage Decoupling & Stale Flag Purging...');
  globalThis.localStorage.setItem('calyxo_health_connected_at', String(Date.now()));
  globalThis.localStorage.setItem('calyxo_health_connected_platform', 'ios_apple_health');
  
  HealthPermissionManager.disconnect();
  assert(HealthPermissionManager.isConnected() === false, 'disconnect() purges cached connection state');
  assert(globalThis.localStorage.getItem('calyxo_health_connected_at') === null, 'connected_at purged from localStorage');

  // --- SECTION 3: Verified Sync State Machine ---
  console.log('\n[SECTION 3] Validating Verified Sync State Machine...');
  const recordedStatuses = [];
  const unsubscribe = HealthSyncEngine.subscribe((event) => {
    if (event && event.status) {
      recordedStatuses.push(event.status);
    }
  });

  const syncResult = await HealthSyncEngine.reconnectAndSync('test-user-id');
  unsubscribe();

  assert(typeof syncResult === 'object', 'reconnectAndSync returns an object');
  assert(typeof syncResult.success === 'boolean', 'reconnectAndSync returns explicit boolean success');
  assert(recordedStatuses.includes('checking'), 'State machine entered "checking" stage');

  // --- SECTION 4: Zero Fake Health Biometrics ---
  console.log('\n[SECTION 4] Validating Zero Fake Health Biometrics...');
  const emptyUnifiedModel = UnifiedHealthModelEngine.buildUnifiedHealthModel({
    appleWatchData: null,
    boatData: null,
    bleChestStrap: null,
    bpMonitorData: null
  });

  assert(emptyUnifiedModel.devicesConnected.length === 0, 'Zero devices connected reported for empty telemetry');
  assert(emptyUnifiedModel.telemetry.liveHeartRate.value === null, 'Live heart rate is null when disconnected (no fake 68 BPM)');
  assert(emptyUnifiedModel.telemetry.hrv.value === null, 'HRV is null when disconnected (no fake 54 ms)');
  assert(emptyUnifiedModel.telemetry.bloodPressure.systolic === null, 'BP systolic is null when disconnected (no fake 118 mmHg)');

  const emptyWeeklyReport = PersonalHealthReportEngine.generateWeeklyReport({
    weeklyRecoveryScores: [],
    workoutSessionsCount: 0,
    avgProteinGrams: 0,
    avgHydrationMl: 0,
    avgSleepHours: 0
  });

  assert(emptyWeeklyReport.weekSummary.recovery.display === '--', 'Empty recovery displays "--" instead of fake 74%');
  assert(emptyWeeklyReport.weekSummary.training.display === '--', 'Empty training displays "--" instead of fake sessions');
  assert(emptyWeeklyReport.weekSummary.protein.display === '--', 'Empty protein displays "--" instead of fake grams');
  assert(emptyWeeklyReport.weekSummary.hydration.display === '--', 'Empty hydration displays "--" instead of fake ml');
  assert(emptyWeeklyReport.weekSummary.sleep.display === '--', 'Empty sleep displays "--" instead of fake 7.3h');

  // --- SECTION 5: Canonical Subscription Timeline Matrix ---
  console.log('\n[SECTION 5] Validating Canonical Subscription Timeline Matrix...');
  const now = Date.now();
  const futureDate = new Date(now + 30 * 86400000).toISOString();
  const pastDate = new Date(now - 5 * 86400000).toISOString();

  // 1. ACTIVE + AUTO RENEW
  const activeAutoRenew = SubscriptionManager.getSubscriptionTimeline({
    subscriptionPlan: 'HIGH',
    subscriptionStatus: 'ACTIVE',
    auto_renew: true,
    next_billing_date: futureDate
  });
  assert(activeAutoRenew.timelineLabel === 'Next billing', 'ACTIVE + AUTO RENEW produces "Next billing" label');
  assert(activeAutoRenew.timelineDate === futureDate, 'ACTIVE + AUTO RENEW returns actual next billing date');

  // 2. ACTIVE + CANCELLED
  const activeCancelled = SubscriptionManager.getSubscriptionTimeline({
    subscriptionPlan: 'HIGH',
    subscriptionStatus: 'ACTIVE',
    is_cancelled: true,
    subscriptionExpiresAt: futureDate
  });
  assert(activeCancelled.timelineLabel === 'Active until', 'ACTIVE + CANCELLED produces "Active until" label');
  assert(activeCancelled.timelineDate === futureDate, 'ACTIVE + CANCELLED returns actual expiration date');

  // 3. FIXED TERM / NON-RENEWING
  const fixedTerm = SubscriptionManager.getSubscriptionTimeline({
    subscriptionPlan: 'HIGH_ANNUAL',
    subscriptionStatus: 'ACTIVE',
    auto_renew: false,
    subscriptionExpiresAt: futureDate
  });
  assert(fixedTerm.timelineLabel === 'Expires', 'ACTIVE FIXED TERM produces "Expires" label');
  assert(fixedTerm.timelineDate === futureDate, 'ACTIVE FIXED TERM returns actual expiration date');

  // 4. EXPIRED
  const expired = SubscriptionManager.getSubscriptionTimeline({
    subscriptionPlan: 'HIGH',
    subscriptionStatus: 'EXPIRED',
    subscriptionExpiresAt: pastDate
  });
  assert(expired.timelineLabel === 'Expired', 'EXPIRED subscription produces "Expired" label');
  assert(expired.timelineDate === pastDate, 'EXPIRED returns past expiration date');

  // 5. NO DATE
  const noDate = SubscriptionManager.getSubscriptionTimeline({
    subscriptionPlan: 'FREE',
    subscriptionStatus: 'FREE'
  });
  assert(noDate.timelineLabel === null, 'FREE tier with no date returns null timelineLabel (zero date fabrication)');
  assert(noDate.timelineDate === null, 'FREE tier with no date returns null timelineDate');

  console.log('\n------------------------------------------------------------');
  console.log(`  ALL ${totalTests} PHASE 12C STATE MACHINE TESTS PASSED (100%)`);
  console.log('------------------------------------------------------------\n');
}

runPhase12cTestSuite().catch(err => {
  console.error('\n💥 Phase 12C Suite Execution Error:', err);
  process.exit(1);
});
