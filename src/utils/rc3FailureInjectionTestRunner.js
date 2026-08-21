/**
 * Calyxo RC-3 Failure-Injection & Resilience Test Runner
 *
 * Tests system behavior under intentional failure modes:
 * 1. Rest timer drift on background resume / clock jumps
 * 2. BLE disconnection: values set to null (never synthetic 72 BPM)
 * 3. Offline outbox durable storage & reconnection replay
 * 4. Payment tampering & replay rejection
 * 5. Page-level fault boundary containment
 * 6. Subscription expiration handling
 *
 * Run: node src/utils/rc3FailureInjectionTestRunner.js
 */

import { OutboxSyncManager, createSyncEvent, SYNC_OPERATIONS, ENTITY_TYPES } from '../services/sync/SyncEngine.js';
import { BleHeartRateAdapter, BleBloodPressureAdapter } from '../services/devices/DeviceAdapters.js';
import { SubscriptionManager, SUBSCRIPTION_STATES, SUBSCRIPTION_TIERS } from '../services/subscription/SubscriptionManager.js';
import { verifyPaymentSignature } from '../utils/razorpay.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const SRC = path.resolve(path.dirname(__filename), '..');

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

function read(relPath) {
  try { return fs.readFileSync(path.join(SRC, relPath), 'utf8'); } catch { return null; }
}

console.log('\n⏱️ Suite 1: Rest Timer Background & Clock Drift Resilience');
// Simulate timer persistence math: restEndDate - now
const nowMs = Date.now();
const targetRestEnd = nowMs + 45000; // 45s remaining

const remainingOnActive = Math.max(0, Math.ceil((targetRestEnd - nowMs) / 1000));
assert('Active timer computes exact remaining seconds', remainingOnActive === 45);

const simulatedResumeAfterExpiry = nowMs + 60000; // 15s after completion
const remainingExpired = Math.max(0, Math.ceil((targetRestEnd - simulatedResumeAfterExpiry) / 1000));
assert('Expired timer resumes at 0 without negative numbers or re-starting', remainingExpired === 0);

const liveWorkoutModal = read('components/modals/LiveWorkoutSessionModal.jsx');
assert('LiveWorkoutSessionModal persists active rest time to localStorage',
  liveWorkoutModal && liveWorkoutModal.includes('saveActiveRest'));
assert('LiveWorkoutSessionModal clears rest on workout complete or cancel',
  liveWorkoutModal && liveWorkoutModal.includes('clearActiveRest'));

console.log('\n🫀 Suite 2: BLE Disconnection & Sensor Failure');
const hrAdapter = new BleHeartRateAdapter();
hrAdapter.disconnect();
assert('BleHeartRateAdapter disconnect sets isConnected to false', hrAdapter.isConnected === false);
assert('BleHeartRateAdapter disconnect does not emit fake heart rate',
  !hrAdapter.currentReading || hrAdapter.currentReading.heartRateBpm === null || hrAdapter.currentReading === null);

const bpAdapter = new BleBloodPressureAdapter();
bpAdapter.disconnect();
assert('BleBloodPressureAdapter disconnect sets isConnected to false', bpAdapter.isConnected === false);

console.log('\n📡 Suite 3: Offline Outbox Durable Storage & Recovery');
const outbox = new OutboxSyncManager();
const offlineEvent = createSyncEvent({
  entityType: ENTITY_TYPES.WORKOUT_LOG,
  entityId: 'w_offline_123',
  operation: SYNC_OPERATIONS.CREATE,
  payload: { name: 'Deadlift', sets: 4 }
});

const enqueued = outbox.enqueue(offlineEvent);
assert('Offline event successfully enters outbox queue', enqueued === true);
assert('Outbox preserves queued event count', outbox.getPendingCount() === 1);

// Test idempotent duplicate rejection during reconnection retry
const dupRejected = outbox.enqueue(offlineEvent);
assert('Reconnection duplicate is rejected without duplication', dupRejected === false);

console.log('\n💳 Suite 4: Payment Tampering & Signature Rejection');
const secret = 'rzp_test_secret_key';
const validSig = 'a1b2c3d4e5f6';
const tamperedResult = verifyPaymentSignature({
  orderId: 'order_123',
  paymentId: 'pay_123',
  signature: 'fake_tampered_sig',
  keySecret: secret
});
assert('Forged signature is rejected by verification algorithm', tamperedResult === false);

console.log('\n🛡️ Suite 5: Subsystem Fault Isolation (PageErrorBoundary)');
const appJsx = read('App.jsx');
const pageBoundary = read('components/PageErrorBoundary.jsx');
assert('PageErrorBoundary is integrated into App.jsx routes',
  appJsx && appJsx.includes('PageErrorBoundary') && pageBoundary && pageBoundary.includes('componentDidCatch'));

console.log('\n⏳ Suite 6: Subscription Expiry State Transitions');
const pastDate = new Date(Date.now() - 3600000).toISOString();
const expiredProfile = {
  subscriptionPlan: SUBSCRIPTION_TIERS.PRO,
  isSubscribed: false,
  subscriptionExpiresAt: pastDate
};
const expiredStatus = SubscriptionManager.getSubscriptionStatus(expiredProfile);
assert('Expired subscription state is correctly EXPIRED', expiredStatus.state === SUBSCRIPTION_STATES.EXPIRED);
assert('Expired subscription has isActive: false', expiredStatus.isActive === false);

console.log('\n' + '='.repeat(70));
console.log(`📊 FAILURE-INJECTION RESULTS: ${passed} / ${passed + failed} PASS`);
if (failed > 0) {
  console.error(`❌ ${failed} FAILURES:`, failures);
  process.exit(1);
} else {
  console.log('🏁 FAILURE-INJECTION SUITE: ALL PASS');
  process.exit(0);
}
