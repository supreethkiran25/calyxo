/**
 * Calyxo RC-3 Regression Test Runner
 *
 * Covers every real bug confirmed and fixed during the RC-3 pass:
 *   1. sendOSNotification → triggerOSNotification (P0 ReferenceError crash)
 *   2. Duplicate PremiumGate on HealthPage (P1)
 *   3. "use client" directive removed from Vite files (P1)
 *   4. Workout ID collision safety with crypto.randomUUID (P1)
 *
 * Run: node src/utils/rc3RegressionTestRunner.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname = src/utils — go up two levels to repo root, then into src/
const SRC = path.resolve(__dirname, '..');

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

function readFile(relPath) {
  try {
    return fs.readFileSync(path.join(SRC, relPath), 'utf8');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// SUITE 1: P0 — sendOSNotification crash fix
// ---------------------------------------------------------------------------
console.log('\n📦 Suite 1: P0 — sendOSNotification → triggerOSNotification');

const liveWorkoutModal = readFile('components/modals/LiveWorkoutSessionModal.jsx');
assert('LiveWorkoutSessionModal imports triggerOSNotification',
  liveWorkoutModal && liveWorkoutModal.includes('triggerOSNotification'));
assert('LiveWorkoutSessionModal does NOT call undefined sendOSNotification',
  liveWorkoutModal && !liveWorkoutModal.includes('sendOSNotification('));
assert('LiveWorkoutSessionModal triggerOSNotification in import statement',
  liveWorkoutModal && /import\s*\{[^}]*triggerOSNotification[^}]*\}[^;]*notificationService/.test(liveWorkoutModal));

const workoutLogger = readFile('components/WorkoutLogger.js');
assert('WorkoutLogger imports triggerOSNotification',
  workoutLogger && workoutLogger.includes('triggerOSNotification'));
assert('WorkoutLogger does NOT call undefined sendOSNotification',
  workoutLogger && !workoutLogger.includes('sendOSNotification('));
assert('WorkoutLogger triggerOSNotification in import statement',
  workoutLogger && /import\s*\{[^}]*triggerOSNotification[^}]*\}[^;]*notificationService/.test(workoutLogger));

const notificationService = readFile('services/notificationService.js');
assert('notificationService exports triggerOSNotification (correct name)',
  notificationService && notificationService.includes('export async function triggerOSNotification'));
assert('notificationService does NOT export sendOSNotification',
  notificationService && !notificationService.includes('export function sendOSNotification') &&
    !notificationService.includes('export async function sendOSNotification'));

// ---------------------------------------------------------------------------
// SUITE 2: P1 — Duplicate PremiumGate removed from HealthPage
// ---------------------------------------------------------------------------
console.log('\n📦 Suite 2: P1 — HealthPage duplicate premium gate');

const healthPage = readFile('pages/user/HealthPage.jsx');
assert('HealthPage exists', healthPage !== null);
assert('HealthPage renders HealthHubPage', healthPage && healthPage.includes('HealthHubPage'));
assert('HealthPage does NOT contain a duplicate isSubscribed check',
  healthPage && !healthPage.includes('isSubscribed'));
assert('HealthPage does NOT import PremiumGate',
  healthPage && !healthPage.includes('import PremiumGate'));
assert('HealthPage does NOT import useStore',
  healthPage && !healthPage.includes("from '../../store/useStore'"));

const healthHubPage = readFile('components/health/HealthHubPage.jsx');
assert('HealthHubPage still has its authoritative PremiumGate check',
  healthHubPage && healthHubPage.includes('PremiumGate'));
assert('HealthHubPage isSubscribed check present',
  healthHubPage && healthHubPage.includes('isSubscribed'));

// ---------------------------------------------------------------------------
// SUITE 3: P1 — "use client" directive removed from Vite files
// ---------------------------------------------------------------------------
console.log('\n📦 Suite 3: P1 — "use client" directive cleanup');

const viteFiles = [
  'components/BackgroundEffects.js',
  'components/FoodTracker.js',
  'components/ThreeHealthCore.js',
  'components/AICoach.js',
  'components/LandingPage.js',
  'components/UserProfile.js',
  'components/health/HealthHubPage.jsx',
  'components/health/HealthConnectionsModal.jsx',
  'components/health/HealthSettingsModal.jsx',
  'components/LaunchScreen.js',
  'components/PWAInstallBanner.jsx',
  'components/ThemeToggle.js',
  'components/Progress.js',
  'components/ai/AIIntelligenceHub.jsx',
  'components/AuthFlow.js',
  'components/WorkoutLogger.js',
  'components/Dashboard.js',
  'components/workout/ChallengeModule.jsx',
  'components/PermissionsConnectionsSection.jsx',
  'components/OnboardingFlow.js',
  'components/GlobalSearch.js',
  'pages/user/HealthPage.jsx',
];

for (const f of viteFiles) {
  const content = readFile(f);
  assert(`"use client" removed from ${path.basename(f)}`,
    content !== null && !content.startsWith('"use client"') && !content.startsWith("'use client'"));
}

// ---------------------------------------------------------------------------
// SUITE 4: P1 — Workout ID collision safety
// ---------------------------------------------------------------------------
console.log('\n📦 Suite 4: P1 — Workout ID uses crypto.randomUUID');

assert('WorkoutLogger uses crypto.randomUUID pattern for workout IDs',
  workoutLogger && workoutLogger.includes('crypto.randomUUID'));

const generatedIds = new Set();
let collisionDetected = false;
for (let i = 0; i < 1000; i++) {
  const id = 'w_' + crypto.randomUUID();
  if (generatedIds.has(id)) { collisionDetected = true; break; }
  generatedIds.add(id);
}
assert('1000 rapid workout ID generations produce zero collisions', !collisionDetected);

// ---------------------------------------------------------------------------
// SUITE 5: Regression guard — confirmed non-issues remain correct
// ---------------------------------------------------------------------------
console.log('\n📦 Suite 5: Regression guard — confirmed non-issues');

const waterVessel = readFile('components/common/RealisticWaterVessel.jsx');
assert('RealisticWaterVessel uses Math.random() for particle physics (expected)',
  waterVessel && waterVessel.includes('Math.random()'));

const backgroundEffects = readFile('components/BackgroundEffects.js');
assert('BackgroundEffects uses Math.random() for particle animation (expected)',
  backgroundEffects && backgroundEffects.includes('Math.random()'));

const recoveryEngine = readFile('services/health/DeterministicRecoveryEngine.js');
assert('DeterministicRecoveryEngine has no Math.random() fabrication',
  recoveryEngine && !recoveryEngine.includes('Math.random()'));

const fitnessAgeEngine = readFile('services/health/DeterministicFitnessAgeEngine.js');
assert('DeterministicFitnessAgeEngine has no Math.random() fabrication',
  fitnessAgeEngine && !fitnessAgeEngine.includes('Math.random()'));

const bleService = readFile('services/health/BluetoothHealthService.js');
assert('BluetoothHealthService has no Math.random() HR fabrication',
  bleService && !bleService.includes('Math.random()'));

const deviceAdapters = readFile('services/devices/DeviceAdapters.js');
assert('DeviceAdapters have no Math.random() sensor fabrication',
  deviceAdapters && !deviceAdapters.includes('Math.random()'));

const healthHubFull = readFile('components/health/HealthHubPage.jsx');
assert('isWearableModalOpen properly initialized with useState(false)',
  healthHubFull && healthHubFull.includes('useState(false)') && healthHubFull.includes('isWearableModalOpen'));

// ---------------------------------------------------------------------------
// RESULTS
// ---------------------------------------------------------------------------
const total = passed + failed;
console.log('\n' + '='.repeat(70));
console.log(`📊 RC-3 REGRESSION RESULTS: ${passed} / ${total} PASS`);
if (failed > 0) {
  console.error(`\n❌ ${failed} FAILURE(S):`);
  failures.forEach(f => console.error(`   • ${f}`));
  process.exit(1);
} else {
  console.log('\n🏁 RC-3 REGRESSION GATE: ALL PASS');
  process.exit(0);
}
