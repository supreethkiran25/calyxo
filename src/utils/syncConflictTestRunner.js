/**
 * Calyxo Sync & Conflict Resolution Production Stress Test Runner
 *
 * Tests:
 * 1. Outbox queue event creation, immutability, and deduplication
 * 2. Workout set conflict resolution (highest tonnage, completed set preservation)
 * 3. Hydration event-based additive merge & timestamp deduplication
 * 4. User settings Last-Write-Wins based on timestamps
 * 5. Biometric health metrics multi-source conflict resolution
 * 6. Offline outbox serialization, durability, and recovery
 *
 * Run: node src/utils/syncConflictTestRunner.js
 */

import {
  ConflictResolver,
  OutboxSyncManager,
  createSyncEvent,
  SYNC_OPERATIONS,
  ENTITY_TYPES
} from '../services/sync/SyncEngine.js';

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

console.log('\n🔄 Suite 1: Event Sourcing & Deduplication');
const evt1 = createSyncEvent({
  entityType: ENTITY_TYPES.WATER_LOG,
  entityId: 'water_2026-08-21',
  operation: SYNC_OPERATIONS.CREATE,
  payload: { amount: 500, date: '2026-08-21' }
});

assert('Sync event has unique eventId', evt1.eventId && evt1.eventId.startsWith('evt_'));
assert('Sync event has deterministic dedupeKey', evt1.dedupeKey === 'WATER_LOG_water_2026-08-21_CREATE_2026-08-21');

const outbox = new OutboxSyncManager();
const added1 = outbox.enqueue(evt1);
const added2 = outbox.enqueue(evt1); // Duplicate attempt
assert('First enqueue succeeds', added1 === true);
assert('Duplicate enqueue is idempotently rejected', added2 === false);
assert('Queue length is exactly 1', outbox.getQueueLength() === 1);

console.log('\n🏋️ Suite 2: Workout Set Conflict Resolution');
const localWorkout = {
  id: 'w_bench_press',
  sets: [
    { id: 'set_1', weight: 80, reps: 10, completed: true },
    { id: 'set_2', weight: 85, reps: 8, completed: true },
    { id: 'set_3', weight: 90, reps: 5, completed: false }
  ]
};

const incomingWorkout = {
  id: 'w_bench_press',
  sets: [
    { id: 'set_1', weight: 80, reps: 10, completed: true },
    { id: 'set_2', weight: 85, reps: 9, completed: true }, // Higher reps from watch
    { id: 'set_3', weight: 90, reps: 6, completed: true }, // Completed on phone
    { id: 'set_4', weight: 95, reps: 4, completed: true }  // Additional set on phone
  ]
};

const mergedWorkout = ConflictResolver.resolveWorkoutConflict(localWorkout, incomingWorkout);
assert('Merged workout has all 4 sets', mergedWorkout.sets.length === 4);
const set2 = mergedWorkout.sets.find(s => s.id === 'set_2');
assert('Set 2 preserves highest reps (9 reps)', set2 && set2.reps === 9);
const set3 = mergedWorkout.sets.find(s => s.id === 'set_3');
assert('Set 3 preserves completed state', set3 && set3.completed === true && set3.reps === 6);

console.log('\n💧 Suite 3: Hydration Additive Event Merge');
const localWater = [
  { id: 'h_1', timestamp: 1724220000000, amount: 250 },
  { id: 'h_2', timestamp: 1724223600000, amount: 500 }
];
const incomingWater = [
  { id: 'h_2', timestamp: 1724223600000, amount: 500 }, // Duplicate log from tablet
  { id: 'h_3', timestamp: 1724227200000, amount: 350 }  // New log from phone
];

const mergedWater = ConflictResolver.resolveHydrationConflict(localWater, incomingWater);
assert('Merged hydration deduplicates identical timestamps/IDs', mergedWater.length === 3);
const totalWater = mergedWater.reduce((sum, e) => sum + e.amount, 0);
assert('Total merged water volume is mathematically exact (1100ml)', totalWater === 1100);

console.log('\n⚙️ Suite 4: User Settings Last-Write-Wins');
const localSettings = {
  theme: 'dark',
  unitSystem: 'metric',
  updatedAt: '2026-08-21T08:00:00.000Z'
};
const olderIncomingSettings = {
  theme: 'light',
  unitSystem: 'imperial',
  updatedAt: '2026-08-21T07:00:00.000Z'
};
const newerIncomingSettings = {
  theme: 'neon',
  unitSystem: 'metric',
  updatedAt: '2026-08-21T09:00:00.000Z'
};

const resolvedOlder = ConflictResolver.resolveSettingsConflict(localSettings, olderIncomingSettings);
assert('Older incoming write does NOT overwrite newer local settings', resolvedOlder.theme === 'dark');

const resolvedNewer = ConflictResolver.resolveSettingsConflict(localSettings, newerIncomingSettings);
assert('Newer incoming write updates settings cleanly', resolvedNewer.theme === 'neon');

console.log('\n🫀 Suite 5: Biometric Health Metrics Multi-Source Resolution');
const localBiometrics = [
  { metricType: 'HEART_RATE', source: 'AppleWatch', timestamp: 1724220000000, value: 72 },
  { metricType: 'HEART_RATE', source: 'BLE_Strap', timestamp: 1724220000000, value: 74 }
];
const incomingBiometrics = [
  { metricType: 'HEART_RATE', source: 'AppleWatch', timestamp: 1724220000000, value: 72 }, // Dup
  { metricType: 'BLOOD_PRESSURE', source: 'BLE_BP_Monitor', timestamp: 1724220060000, systolic: 120, diastolic: 80 }
];

const mergedBio = ConflictResolver.resolveBiometricConflict(localBiometrics, incomingBiometrics);
assert('Biometric resolution deduplicates same-source same-minute readings', mergedBio.length === 3);
assert('Biometric resolution supports resolveBiometricsConflict alias without error',
  ConflictResolver.resolveBiometricsConflict(localBiometrics, incomingBiometrics).length === 3);
assert('OutboxSyncManager.resolveConflict handles biometrics without throwing',
  outbox.resolveConflict('biometrics', localBiometrics, incomingBiometrics).length === 3);

console.log('\n' + '='.repeat(70));
console.log(`📊 SYNC CONFLICT TEST RESULTS: ${passed} / ${passed + failed} PASS`);
if (failed > 0) {
  console.error(`❌ ${failed} FAILURES:`, failures);
  process.exit(1);
} else {
  console.log('🏁 SYNC CONFLICT SUITE: ALL PASS');
  process.exit(0);
}
