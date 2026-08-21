/**
 * Calyxo RC-3 Navigation, Routing & Error Boundary Test Runner
 *
 * Tests:
 * 1. All primary user navigation routes are registered in App.jsx
 * 2. Per-route PageErrorBoundary containment
 * 3. 404 Catch-all route definition
 * 4. UserGuard and AdminGuard presence
 * 5. Navigation paths consistency in UI drawer & top navigation
 *
 * Run: node src/utils/rc3NavigationTestRunner.js
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

console.log('\n🧭 Suite 1: App Router Route Registration');
const appJsx = read('App.jsx');

const expectedUserRoutes = [
  'dashboard',
  'nutrition',
  'workout',
  'progress',
  'health',
  'ai',
  'profile',
  'about',
  'support',
  'privacy',
  'terms'
];

expectedUserRoutes.forEach((route) => {
  assert(`Route path="/user/${route}" is registered in App.jsx`,
    appJsx && appJsx.includes(`path="${route}"`));
});

assert('Catch-all 404 route path="*" is registered',
  appJsx && appJsx.includes('path="*"'));

console.log('\n🛡️ Suite 2: Per-Route PageErrorBoundary Isolation');
const pageBoundaryCount = (appJsx.match(/<PageErrorBoundary>/g) || []).length;
assert('All 11 user routes are protected with PageErrorBoundary', pageBoundaryCount >= 11);

console.log('\n🔐 Suite 3: Route Access Guards');
assert('User routes are protected with UserGuard', appJsx && appJsx.includes('<UserGuard>'));
assert('Admin routes are protected with AdminGuard', appJsx && appJsx.includes('<AdminGuard>'));

console.log('\n📱 Suite 4: Mobile Drawer & Top Navigation Consistency');
const drawer = read('components/MobileDrawerMenu.js');
assert('Drawer menu contains dashboard navigation link', drawer && drawer.includes('/user/dashboard'));
assert('Drawer menu contains workout navigation link', drawer && drawer.includes('/user/workout'));
assert('Drawer menu contains nutrition navigation link', drawer && drawer.includes('/user/nutrition'));

console.log('\n' + '='.repeat(70));
console.log(`📊 NAVIGATION RESULTS: ${passed} / ${passed + failed} PASS`);
if (failed > 0) {
  console.error(`❌ ${failed} FAILURES:`, failures);
  process.exit(1);
} else {
  console.log('🏁 NAVIGATION SUITE: ALL PASS');
  process.exit(0);
}
