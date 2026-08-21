/**
 * Calyxo RC-3 Cross-Platform Parity & Native Plugin Test Runner
 *
 * Tests:
 * 1. iOS Native Extensions & Plugins (HealthKit, Live Activities, Widgets)
 * 2. Android Native Services & Plugins (Health Connect / Hardware Step Counter, Widgets)
 * 3. Deep link schemas on both iOS & Android
 * 4. Cross-platform universal HUD & bridges
 *
 * Run: node src/utils/rc3CrossPlatformParityTestRunner.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '../..');

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

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function read(relPath) {
  try { return fs.readFileSync(path.join(ROOT, relPath), 'utf8'); } catch { return null; }
}

console.log('\n🍎 Suite 1: iOS Native Extensions & Bridges');
assert('CalyxoHealthKitPlugin.swift exists',
  exists('ios/App/App/CalyxoHealthKitPlugin.swift'));

assert('CalyxoLiveActivityBridge.swift exists',
  exists('ios/App/App/CalyxoLiveActivityBridge.swift'));

assert('CalyxoActivityAttributes.swift exists',
  exists('ios/App/App/CalyxoActivityAttributes.swift'));

assert('iOS Widget Extension project exists',
  exists('ios/App/CalyxoWidgets/CalyxoWidgetBundle.swift') || exists('ios/App/CalyxoWidgets/CalyxoHomeWidgets.swift'));

console.log('\n🤖 Suite 2: Android Native Plugins & Providers');
assert('CalyxoHealthPlugin.java exists',
  exists('android/app/src/main/java/com/calyxo/app/CalyxoHealthPlugin.java'));

assert('CalyxoAppWidgetProvider.java exists',
  exists('android/app/src/main/java/com/calyxo/app/CalyxoAppWidgetProvider.java'));

assert('CalyxoNotificationPlugin.java exists',
  exists('android/app/src/main/java/com/calyxo/app/CalyxoNotificationPlugin.java'));

console.log('\n🔗 Suite 3: Cross-Platform Deep Linking Configurations');
const androidManifest = read('android/app/src/main/AndroidManifest.xml');
assert('AndroidManifest.xml registers calyxo:// custom scheme',
  androidManifest && androidManifest.includes('android:scheme="calyxo"'));

assert('AndroidManifest.xml registers https://calyxo.vercel.app App Links',
  androidManifest && androidManifest.includes('android:scheme="https"') && androidManifest.includes('calyxo.vercel.app'));

const infoPlist = read('ios/App/App/Info.plist');
assert('Info.plist registers calyxo URL scheme',
  infoPlist && infoPlist.includes('calyxo'));

console.log('\n📱 Suite 4: Universal JS Mobile Bridges');
assert('NativeMobileBridge.jsx exists',
  exists('src/components/NativeMobileBridge.jsx'));

assert('UniversalLiveHUD.jsx exists',
  exists('src/components/UniversalLiveHUD.jsx'));

console.log('\n' + '='.repeat(70));
console.log(`📊 CROSS-PLATFORM PARITY RESULTS: ${passed} / ${passed + failed} PASS`);
if (failed > 0) {
  console.error(`❌ ${failed} FAILURES:`, failures);
  process.exit(1);
} else {
  console.log('🏁 CROSS-PLATFORM PARITY SUITE: ALL PASS');
  process.exit(0);
}
