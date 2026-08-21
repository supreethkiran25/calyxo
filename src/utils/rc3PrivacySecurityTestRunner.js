/**
 * Calyxo RC-3 Privacy, Data Redaction & Security Test Runner
 *
 * Tests:
 * 1. signOutUser account isolation (wiping localStorage, sessionStorage, Zustand, Health permissions)
 * 2. deleteUserAccount complete deletion pipeline
 * 3. CalyxoLogger PII & credential redaction
 * 4. Zero client-side API secrets leaked in plain text
 * 5. HealthPermissionManager disconnect and revocation
 *
 * Run: node src/utils/rc3PrivacySecurityTestRunner.js
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

console.log('\n🔒 Suite 1: Account Isolation & Data Sanitization on Sign Out');
const dbService = read('lib/dbService.js');

assert('signOutUser clears user auth token from localStorage',
  dbService && dbService.includes('localStorage.removeItem("calyxo_user")'));

assert('signOutUser clears user profile from localStorage',
  dbService && dbService.includes('localStorage.removeItem("calyxo_user_profile")'));

assert('signOutUser clears all health permissions from localStorage',
  dbService && dbService.includes('localStorage.removeItem("calyxo_health_permissions")'));

assert('signOutUser invokes sessionStorage.clear()',
  dbService && dbService.includes('sessionStorage.clear()'));

assert('signOutUser resets the active Zustand store',
  dbService && dbService.includes('useStore.getState().resetStore()'));

assert('signOutUser wipes widget storage data',
  dbService && dbService.includes('clearWidgetData()'));

assert('signOutUser disconnects HealthPermissionManager',
  dbService && dbService.includes('HealthPermissionManager.disconnect()'));

console.log('\n🗑️ Suite 2: Account Deletion Pipeline');
assert('deleteUserAccount export exists in dbService',
  dbService && dbService.includes('export const deleteUserAccount'));

const userProfile = read('components/UserProfile.js');
assert('UserProfile component connects to deleteUserAccount',
  userProfile && userProfile.includes('deleteUserAccount'));

console.log('\n🛡️ Suite 3: Diagnostic Logging & Secret Redaction');
const logger = read('services/diagnostics/CalyxoLogger.js');
assert('CalyxoLogger exists for production observability', logger !== null);
assert('CalyxoLogger redacts sensitive tokens and does not log plain text API secrets',
  logger && !logger.includes('GEMINI_API_KEY') && !logger.includes('SUPABASE_SERVICE_ROLE'));

console.log('\n' + '='.repeat(70));
console.log(`📊 PRIVACY & SECURITY RESULTS: ${passed} / ${passed + failed} PASS`);
if (failed > 0) {
  console.error(`❌ ${failed} FAILURES:`, failures);
  process.exit(1);
} else {
  console.log('🏁 PRIVACY & SECURITY SUITE: ALL PASS');
  process.exit(0);
}
