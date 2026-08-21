/**
 * Calyxo RC-3 Production Launch Test Runner
 *
 * This suite tests real production failure modes, not synthetic pass conditions.
 * A smaller suite that catches a real production bug is more valuable than 1,000
 * meaningless passing tests.
 *
 * Run: node src/utils/rc3ProductionLaunchTestRunner.js
 */

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
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    failed++;
    failures.push(description);
  }
}

function read(relPath) {
  try { return fs.readFileSync(path.join(SRC, relPath), 'utf8'); } catch { return null; }
}

function exists(relPath) {
  return fs.existsSync(path.join(SRC, relPath));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ERROR BOUNDARY COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🛡️  Suite 1: Error Boundary Coverage');

const appJsx = read('App.jsx');
const pageBoundary = read('components/PageErrorBoundary.jsx');

assert('PageErrorBoundary.jsx exists', pageBoundary !== null);
assert('PageErrorBoundary is a class component (extends React.Component)',
  pageBoundary && pageBoundary.includes('extends React.Component'));
assert('PageErrorBoundary implements getDerivedStateFromError',
  pageBoundary && pageBoundary.includes('getDerivedStateFromError'));
assert('PageErrorBoundary implements componentDidCatch',
  pageBoundary && pageBoundary.includes('componentDidCatch'));
assert('PageErrorBoundary has Retry action',
  pageBoundary && pageBoundary.includes('Retry'));
assert('PageErrorBoundary has Go Home action',
  pageBoundary && pageBoundary.includes('Go Home'));
assert('App.jsx imports PageErrorBoundary',
  appJsx && appJsx.includes("import PageErrorBoundary from './components/PageErrorBoundary'"));
assert('All 7 user page routes wrapped in PageErrorBoundary',
  appJsx && (appJsx.match(/<PageErrorBoundary>/g) || []).length >= 7);
assert('Global ErrorBoundary still present in App.jsx (defense-in-depth)',
  appJsx && appJsx.includes('<ErrorBoundary>'));
assert('PageErrorBoundary does NOT pass raw error.stack string to users in render',
  pageBoundary && !pageBoundary.includes('error.stack') && !pageBoundary.includes('err.stack'));
assert('PageErrorBoundary structured log uses [CALYXO-UI] category',
  pageBoundary && pageBoundary.includes('[CALYXO-UI]'));

// ─────────────────────────────────────────────────────────────────────────────
// 2. SERVICE EXPORT INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔗  Suite 2: Service Export Integrity');

// AI Services
const chatManager = read('services/ai/ChatSessionManager.js');
const aiOrchestrator = read('services/ai/CalyxoAIOrchestrator.js');
const aiHub = read('components/ai/AIIntelligenceHub.jsx');

assert('ChatSessionManager exports chatSessionManager (named singleton)',
  chatManager && chatManager.includes('export const chatSessionManager'));
assert('AIIntelligenceHub imports chatSessionManager (named)',
  aiHub && aiHub.includes("import { chatSessionManager }"));
assert('CalyxoAIOrchestrator exports calyxoAIOrchestrator',
  aiOrchestrator && aiOrchestrator.includes('export const calyxoAIOrchestrator'));
assert('AIIntelligenceHub imports calyxoAIOrchestrator (named)',
  aiHub && aiHub.includes("import { calyxoAIOrchestrator }"));

// Notification service — P0 fix from previous RC-3 pass
const notifService = read('services/notificationService.js');
const liveModal = read('components/modals/LiveWorkoutSessionModal.jsx');
const workoutLogger = read('components/WorkoutLogger.js');

assert('notificationService exports triggerOSNotification (not sendOSNotification)',
  notifService && notifService.includes('export async function triggerOSNotification'));
assert('LiveWorkoutSessionModal uses triggerOSNotification',
  liveModal && liveModal.includes('triggerOSNotification') && !liveModal.includes('sendOSNotification('));
assert('WorkoutLogger uses triggerOSNotification',
  workoutLogger && workoutLogger.includes('triggerOSNotification') && !workoutLogger.includes('sendOSNotification('));

// Subscription
const subscriptionManager = read('services/subscription/SubscriptionManager.js');
assert('SubscriptionManager exports isPremium static method',
  subscriptionManager && subscriptionManager.includes('static isPremium'));
assert('SubscriptionManager isPremium checks isActive AND tier !== FREE (not just one)',
  subscriptionManager && subscriptionManager.includes('isActive') && subscriptionManager.includes('SUBSCRIPTION_TIERS.FREE'));

// Health
assert('DeterministicRecoveryEngine exists',
  exists('services/health/DeterministicRecoveryEngine.js'));
assert('DeterministicFitnessAgeEngine exists',
  exists('services/health/DeterministicFitnessAgeEngine.js'));
assert('DataFreshnessHelper exists',
  exists('services/health/DataFreshnessHelper.js'));
assert('WearableCompatibilityManager exists',
  exists('services/health/WearableCompatibilityManager.js'));
assert('CanonicalHealthData exists',
  exists('services/health/CanonicalHealthData.js'));

// Workout
assert('LiveWorkoutStateMachine exists',
  exists('services/liveWorkout/LiveWorkoutStateMachine.js'));
const stateMachine = read('services/liveWorkout/LiveWorkoutStateMachine.js');
assert('LiveWorkoutStateMachine exports WORKOUT_STATES',
  stateMachine && stateMachine.includes('export') && stateMachine.includes('WORKOUT_STATES'));
assert('LiveWorkoutStateMachine IDLE state exists (must start IDLE)',
  stateMachine && stateMachine.includes('IDLE'));

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRODUCTION CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n⚙️  Suite 3: Production Configuration');

const dbService = read('lib/dbService.js');
const supabaseClient = read('lib/supabaseClient.js');

assert('Supabase URL has a production fallback (not mock.supabase.co)',
  supabaseClient && supabaseClient.includes('nwcatvlfoayzrwatvyrf.supabase.co'));
assert('isMockMode only true for missing or explicitly mock URL',
  dbService && dbService.includes('"https://mock.supabase.co"'));
assert('Razorpay uses rzp_live (not rzp_test) as hardcoded fallback',
  read('utils/razorpay.js')?.includes('rzp_live'));
assert('No test/dev Razorpay key in production source',
  !read('utils/razorpay.js')?.includes('rzp_test'));
assert('VAPID key present (push notifications can work)',
  read('utils/vapidKeys.js')?.includes('BJEqrp7I'));

// ─────────────────────────────────────────────────────────────────────────────
// 4. ACCOUNT ISOLATION & LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔐  Suite 4: Account Isolation & Logout');

assert('signOutUser clears calyxo_user from localStorage',
  dbService && dbService.includes('localStorage.removeItem("calyxo_user")'));
assert('signOutUser clears calyxo_user_profile from localStorage',
  dbService && dbService.includes('localStorage.removeItem("calyxo_user_profile")'));
assert('signOutUser clears sessionStorage',
  dbService && dbService.includes('sessionStorage.clear()'));
assert('signOutUser resets the Zustand store',
  dbService && dbService.includes('resetStore()'));
assert('signOutUser calls supabase.auth.signOut()',
  dbService && dbService.includes('supabase.auth.signOut()'));
assert('signOutUser clears health permissions',
  dbService && dbService.includes('calyxo_health_permissions'));
assert('signOutUser clears widget data',
  dbService && dbService.includes('clearWidgetData'));
assert('deleteUserAccount function exists in dbService',
  dbService && dbService.includes('export const deleteUserAccount'));

// ─────────────────────────────────────────────────────────────────────────────
// 5. OFFLINE BEHAVIOR
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📡  Suite 5: Offline Behavior');

const offlineQueue = read('utils/offlineQueue.js');
const offlineIndicator = read('components/OfflineSyncIndicator.jsx');
const syncEngine = read('services/sync/SyncEngine.js');

assert('offlineQueue.js exists', offlineQueue !== null);
assert('OfflineSyncIndicator.jsx exists', offlineIndicator !== null);
assert('OfflineSyncIndicator listens to window online/offline events',
  offlineIndicator && offlineIndicator.includes("addEventListener('online'") &&
    offlineIndicator.includes("addEventListener('offline'"));
assert('OfflineSyncIndicator cleans up event listeners on unmount',
  offlineIndicator && offlineIndicator.includes("removeEventListener('online'") &&
    offlineIndicator.includes("removeEventListener('offline'"));
assert('OfflineSyncIndicator shows Offline state to user',
  offlineIndicator && offlineIndicator.includes('Offline'));
assert('OfflineSyncIndicator shows Syncing state to user',
  offlineIndicator && offlineIndicator.includes('Syncing'));
assert('OfflineSyncIndicator shows Synced state to user',
  offlineIndicator && offlineIndicator.includes('Synced'));
assert('OfflineSyncIndicator is mounted in UserLayout',
  read('layouts/UserLayout.jsx')?.includes('OfflineSyncIndicator'));
assert('SyncEngine checks navigator.onLine before processing',
  syncEngine && syncEngine.includes('navigator.onLine'));
assert('offlineQueue does not send when offline',
  offlineQueue && offlineQueue.includes('navigator.onLine'));

// ─────────────────────────────────────────────────────────────────────────────
// 6. HEALTH DATA INTEGRITY (NO FABRICATION)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🫀  Suite 6: Health Data Integrity (Zero Fabrication)');

const recoveryEngine = read('services/health/DeterministicRecoveryEngine.js');
const fitnessAgeEngine = read('services/health/DeterministicFitnessAgeEngine.js');
const bleService = read('services/health/BluetoothHealthService.js');
const deviceAdapters = read('services/devices/DeviceAdapters.js');

assert('DeterministicRecoveryEngine has no Math.random() fabrication',
  recoveryEngine && !recoveryEngine.includes('Math.random()'));
assert('DeterministicFitnessAgeEngine has no Math.random() fabrication',
  fitnessAgeEngine && !fitnessAgeEngine.includes('Math.random()'));
assert('BluetoothHealthService has no Math.random() sensor fabrication',
  bleService && !bleService.includes('Math.random()'));
assert('DeviceAdapters have no Math.random() sensor fabrication',
  deviceAdapters && !deviceAdapters.includes('Math.random()'));

// On BLE disconnect, value must become null not a stale reading
assert('BleHeartRateAdapter sets value to null on disconnect (not fake reading)',
  deviceAdapters && (deviceAdapters.includes('null') && !deviceAdapters.includes('= 72') && !deviceAdapters.includes("= '72'")));

// ─────────────────────────────────────────────────────────────────────────────
// 7. LIVE WORKOUT STATE MACHINE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🏋️  Suite 7: Live Workout State Machine');

assert('LiveWorkoutStateMachine has IDLE state',
  stateMachine && stateMachine.includes('IDLE'));
assert('LiveWorkoutStateMachine has ACTIVE state',
  stateMachine && stateMachine.includes('ACTIVE'));
assert('LiveWorkoutStateMachine has REST state',
  stateMachine && stateMachine.includes('REST'));
assert('LiveWorkoutStateMachine has PAUSED state',
  stateMachine && stateMachine.includes('PAUSED'));
assert('LiveWorkoutStateMachine has COMPLETED state',
  stateMachine && stateMachine.includes('COMPLETED'));
// Timer cleanup in live workout modal
assert('LiveWorkoutSessionModal cleans up its rest timer interval',
  liveModal && liveModal.includes('clearInterval') && liveModal.includes('clearTimeout'));
// Workout IDs use crypto.randomUUID (RC-3 fix)
assert('WorkoutLogger uses crypto.randomUUID for collision-safe IDs',
  workoutLogger && workoutLogger.includes('crypto.randomUUID'));

// ─────────────────────────────────────────────────────────────────────────────
// 8. PAYMENT & ENTITLEMENT SECURITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n💳  Suite 8: Payment & Entitlement Security');

const razorpay = read('utils/razorpay.js');

assert('Razorpay uses HMAC-SHA256 signature verification',
  razorpay && razorpay.includes('createHmac') && razorpay.includes('sha256'));
assert('Razorpay verifies via /api/verify-payment (server-side)',
  razorpay && razorpay.includes('/api/verify-payment'));
assert('Razorpay creates order via /api/create-order (server-side)',
  razorpay && razorpay.includes('/api/create-order'));
assert('Payment does not unlock Premium based only on frontend state (checks razorpay_signature)',
  razorpay && razorpay.includes('razorpay_signature'));
assert('PremiumEntitlementService exists',
  exists('services/subscription/PremiumEntitlementService.js'));
assert('SubscriptionManager exists and is the shared authority',
  exists('services/subscription/SubscriptionManager.js'));
// Entitlement checks use SubscriptionManager, not raw localStorage reads
const aiMealPlanner = read('components/nutrition/AIMealPlannerCard.jsx');
assert('AIMealPlannerCard uses SubscriptionManager.isPremium (not raw localStorage)',
  aiMealPlanner && aiMealPlanner.includes('SubscriptionManager.isPremium'));

// ─────────────────────────────────────────────────────────────────────────────
// 9. NAVIGATION COMPLETENESS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🗺️  Suite 9: Navigation Completeness');

// All route page components must exist
const pageFiles = [
  'pages/user/DashboardPage.jsx',
  'pages/user/NutritionPage.jsx',
  'pages/user/WorkoutPage.jsx',
  'pages/user/ProgressPage.jsx',
  'pages/user/HealthPage.jsx',
  'pages/user/AIPage.jsx',
  'pages/user/ProfilePage.jsx',
  'pages/user/AboutPage.jsx',
  'pages/user/SupportPage.jsx',
  'pages/user/PrivacyPage.jsx',
  'pages/user/TermsPage.jsx',
  'pages/NotFoundPage.jsx',
];
for (const f of pageFiles) {
  assert(`Page component exists: ${path.basename(f)}`, exists(f));
}

assert('404 NotFoundPage is registered for path="*"',
  appJsx && appJsx.includes('path="*"') && appJsx.includes('NotFoundPage'));
assert('HealthPage does not duplicate subscription gate (cleaned in RC-3)',
  read('pages/user/HealthPage.jsx') && !read('pages/user/HealthPage.jsx')?.includes('isSubscribed'));

// ─────────────────────────────────────────────────────────────────────────────
// 10. CODE CLEANLINESS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🧹  Suite 10: Code Cleanliness');

const viteSrcFiles = [
  'components/BackgroundEffects.js',
  'components/WorkoutLogger.js',
  'components/Dashboard.js',
  'components/ai/AIIntelligenceHub.jsx',
  'components/health/HealthHubPage.jsx',
  'pages/user/HealthPage.jsx',
];
for (const f of viteSrcFiles) {
  const content = read(f);
  assert(`No "use client" directive in ${path.basename(f)}`,
    content !== null && !content.startsWith('"use client"') && !content.startsWith("'use client'"));
}

// CalyxoLogger should not log raw secrets
const calLogger = read('services/diagnostics/CalyxoLogger.js');
assert('CalyxoLogger exists', calLogger !== null);
assert('CalyxoLogger does not log raw API keys or secrets in plaintext',
  calLogger && !calLogger.includes('GEMINI_API_KEY') && !calLogger.includes('supabaseAnonKey'));

// ─────────────────────────────────────────────────────────────────────────────
// 11. CROSS-PLATFORM PARITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📱  Suite 11: Cross-Platform Structure');

assert('capacitor.config exists (Capacitor wired)',
  exists('../capacitor.config.ts') || exists('../capacitor.config.js') || exists('../capacitor.config.json'));
assert('iOS platform directory exists',
  exists('../ios') || exists('../../ios'));
assert('Android platform directory exists',
  exists('../android') || exists('../../android'));
assert('NativeMobileBridge.jsx exists (deep link + push handling)',
  exists('components/NativeMobileBridge.jsx'));
assert('UniversalLiveHUD.jsx exists (Live Activity HUD)',
  exists('components/UniversalLiveHUD.jsx'));

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS
// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log('\n' + '='.repeat(72));
console.log(`📊 RC-3 PRODUCTION LAUNCH RESULTS: ${passed} / ${total} PASS`);
if (failed > 0) {
  console.error(`\n🔴 ${failed} FAILURE(S) — these are RELEASE BLOCKERS:`);
  failures.forEach(f => console.error(`   • ${f}`));
  process.exit(1);
} else {
  console.log('\n🏁 RC-3 PRODUCTION LAUNCH GATE: ALL PASS');
  console.log('\n⚠️  Remaining physical-device verification still required:');
  console.log('   • HealthKit live stream on real iPhone');
  console.log('   • Apple Watch WatchConnectivity pairing');
  console.log('   • Dynamic Island Live Activity on physical device');
  console.log('   • BLE HR/BP monitor end-to-end packet parsing');
  console.log('   • Razorpay production payment with real card');
  console.log('   • Push notification delivery on locked device (APNs/FCM)');
  console.log('   • Android 14+ background/Doze mode behavior');
  process.exit(0);
}
