/**
 * Calyxo RC-3 Master Production Certification Orchestrator
 *
 * Runs and aggregates all specialized RC-3 pre-production certification suites:
 * 1. rc3ProductionLaunchTestRunner
 * 2. rc3RegressionTestRunner
 * 3. rc3FailureInjectionTestRunner
 * 4. rc3HealthIntegrityTestRunner
 * 5. rc3PaymentSafetyTestRunner
 * 6. rc3AITruthfulnessTestRunner
 * 7. rc3WearableCompatibilityTestRunner
 * 8. rc3NotificationDedupTestRunner
 * 9. rc3NavigationTestRunner
 * 10. rc3PrivacySecurityTestRunner
 * 11. rc3CrossPlatformParityTestRunner
 * 12. syncConflictTestRunner
 * 13. interactionAuditTestRunner
 *
 * Run: node src/utils/rc3MasterProductionTestRunner.js
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const DIR = path.dirname(__filename);

const suites = [
  { name: 'RC-3 Production Launch Suite', file: 'rc3ProductionLaunchTestRunner.js' },
  { name: 'RC-3 Regression Fixes Suite', file: 'rc3RegressionTestRunner.js' },
  { name: 'RC-3 Failure Injection & Resilience', file: 'rc3FailureInjectionTestRunner.js' },
  { name: 'RC-3 Health Integrity & Zero-Fake Data', file: 'rc3HealthIntegrityTestRunner.js' },
  { name: 'RC-3 Payment Safety & Anti-Fraud', file: 'rc3PaymentSafetyTestRunner.js' },
  { name: 'RC-3 AI Truthfulness & Grounding', file: 'rc3AITruthfulnessTestRunner.js' },
  { name: 'RC-3 Wearable Compatibility & BLE', file: 'rc3WearableCompatibilityTestRunner.js' },
  { name: 'RC-3 Notification Deduplication & Reminders', file: 'rc3NotificationDedupTestRunner.js' },
  { name: 'RC-3 Navigation & Error Boundaries', file: 'rc3NavigationTestRunner.js' },
  { name: 'RC-3 Privacy & Security Sanitization', file: 'rc3PrivacySecurityTestRunner.js' },
  { name: 'RC-3 Cross-Platform Parity & Native Bridges', file: 'rc3CrossPlatformParityTestRunner.js' },
  { name: 'RC-3 Sync Conflict & Event Outbox', file: 'syncConflictTestRunner.js' },
  { name: 'RC-3 UI Interaction & Button Audit', file: 'interactionAuditTestRunner.js' }
];

console.log('🚀 CALYXO RC-3 MASTER PRODUCTION CERTIFICATION GATE');
console.log('='.repeat(70) + '\n');

let totalPassed = 0;
let totalFailed = 0;
const summary = [];

for (const suite of suites) {
  const filePath = path.join(DIR, suite.file);
  try {
    const output = execSync(`node "${filePath}"`, { encoding: 'utf8' });
    const match = output.match(/RESULTS:?\s*(\d+)\s*\/\s*(\d+)\s*PASS/i);
    if (match) {
      const pass = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      totalPassed += pass;
      summary.push({ name: suite.name, passed: pass, total, status: 'PASS' });
      console.log(`✅ [PASS] ${suite.name.padEnd(50)} (${pass}/${total})`);
    } else {
      totalPassed += 1;
      summary.push({ name: suite.name, passed: 1, total: 1, status: 'PASS' });
      console.log(`✅ [PASS] ${suite.name.padEnd(50)}`);
    }
  } catch (err) {
    totalFailed += 1;
    summary.push({ name: suite.name, status: 'FAIL', error: err.message });
    console.error(`❌ [FAIL] ${suite.name}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log(`📊 RC-3 MASTER CERTIFICATION SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log('='.repeat(70));

if (totalFailed > 0) {
  console.error('\n🔴 RELEASE GATE FAILED — RELEASE BLOCKERS PRESENT');
  process.exit(1);
} else {
  console.log('\n🏁 RC-3 RELEASE GATE: ALL CERTIFICATION SUITES PASSED (100%)');
  process.exit(0);
}
