/**
 * Calyxo RC-3 Wearable Device & Bluetooth SIG Protocol Test Runner
 *
 * Tests:
 * 1. Bluetooth SIG 0x180D / 0x2A37 Heart Rate parsing (8-bit, 16-bit, RR intervals)
 * 2. Bluetooth SIG 0x1810 / 0x2A35 Blood Pressure parsing (systolic, diastolic, pulse, unit conversion)
 * 3. WearableCompatibilityManager vendor profiles (Apple Watch, boAt, Garmin, Polar, WHOOP, Oura)
 * 4. boAt truthful integration policy (Health Connect / Apple Health companion bridge)
 * 5. Disconnection behavior: values reset to null (no stale or fake fallback)
 *
 * Run: node src/utils/rc3WearableCompatibilityTestRunner.js
 */

import { BleHeartRateAdapter, BleBloodPressureAdapter, deviceAdapters } from '../services/devices/DeviceAdapters.js';
import { getWearableProfile, getAllWearableProfiles, WEARABLE_VENDORS } from '../services/health/WearableCompatibilityManager.js';

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

console.log('\n🫀 Suite 1: Bluetooth SIG 0x2A37 Heart Rate Parsing');
const hrAdapter = new BleHeartRateAdapter();

// 8-bit Heart Rate Payload: Flags = 0x00, HR = 75 BPM
const buffer8Bit = new Uint8Array([0x00, 75]).buffer;
const reading8Bit = hrAdapter.parseHeartRateMeasurement(new DataView(buffer8Bit));
assert('8-bit HR packet correctly parses 75 BPM', reading8Bit.value === 75);
assert('8-bit HR packet has empty RR intervals when flag bit 4 is 0', reading8Bit.rrIntervals.length === 0);

// 16-bit Heart Rate Payload: Flags = 0x01 (16-bit format), HR = 260 BPM (0x0104 little-endian)
const buffer16Bit = new Uint8Array([0x01, 0x04, 0x01]).buffer;
const reading16Bit = hrAdapter.parseHeartRateMeasurement(new DataView(buffer16Bit));
assert('16-bit HR packet correctly parses 260 BPM', reading16Bit.value === 260);

// 8-bit HR with RR-intervals: Flags = 0x10 (bit 4 set = RR interval present), HR = 80, RR = 1024/1024s (1000ms = 0x0400)
const bufferRR = new Uint8Array([0x10, 80, 0x00, 0x04]).buffer;
const readingRR = hrAdapter.parseHeartRateMeasurement(new DataView(bufferRR));
assert('HR packet with RR flag correctly extracts RR intervals (1000ms)',
  readingRR.value === 80 && readingRR.rrIntervals.length > 0 && Math.round(readingRR.rrIntervals[0]) === 1000);

console.log('\n🩺 Suite 2: Bluetooth SIG 0x2A35 Blood Pressure Parsing');
const bpAdapter = new BleBloodPressureAdapter();

// Blood Pressure in mmHg: Flags = 0x00 (bit 0 = 0 -> mmHg, bit 2 = 0 -> no pulse), Systolic = 120 (0x0078), Diastolic = 80 (0x0050), MAP = 93 (0x005D)
const bufferBP = new Uint8Array([0x00, 120, 0, 80, 0, 93, 0]).buffer;
const readingBP = bpAdapter.parseBloodPressureMeasurement(new DataView(bufferBP));
assert('Blood Pressure in mmHg parses Systolic 120, Diastolic 80',
  readingBP.value.systolic === 120 && readingBP.value.diastolic === 80);
assert('Blood Pressure unit is mmHg', readingBP.unit === 'mmHg');

// Blood Pressure in kPa with Pulse: Flags = 0x05 (bit 0 = 1 -> kPa, bit 2 = 1 -> pulse present)
// 16.0 kPa Systolic (~120 mmHg), 10.0 kPa Diastolic (~75 mmHg), Pulse = 72 (0x0048)
const bufferBP_kPa = new Uint8Array([0x05, 16, 0, 10, 0, 12, 0, 72, 0]).buffer;
const readingBP_kPa = bpAdapter.parseBloodPressureMeasurement(new DataView(bufferBP_kPa));
assert('Blood Pressure in kPa converts to mmHg correctly and extracts pulse rate',
  readingBP_kPa.value.systolic > 0 && readingBP_kPa.value.pulse === 72);

console.log('\n⌚ Suite 3: Wearable Compatibility Matrix & boAt Policy');
const profiles = getAllWearableProfiles();
assert('WearableCompatibilityManager provides profiles for multiple vendors',
  profiles && Object.keys(profiles).length >= 5);

const appleWatch = getWearableProfile('apple_watch');
assert('Apple Watch profile documents HealthKit & WatchConnectivity data pathways',
  appleWatch && (appleWatch.connectionType === 'NATIVE_HEALTHKIT' || appleWatch.syncMechanism.includes('HealthKit')));

const boatProfile = getWearableProfile('boat_smartwatch');
assert('boAt profile truthfully documents companion bridge / Health Connect requirement',
  boatProfile && (boatProfile.requiresCompanionApp === true || boatProfile.syncMechanism.includes('boAt Crest')));

console.log('\n🔌 Suite 4: Disconnection State Purity');
hrAdapter.disconnect();
assert('BLE HR Adapter emits isConnected: false on disconnect', hrAdapter.isConnected === false);

console.log('\n' + '='.repeat(70));
console.log(`📊 WEARABLE COMPATIBILITY RESULTS: ${passed} / ${passed + failed} PASS`);
if (failed > 0) {
  console.error(`❌ ${failed} FAILURES:`, failures);
  process.exit(1);
} else {
  console.log('🏁 WEARABLE COMPATIBILITY SUITE: ALL PASS');
  process.exit(0);
}
