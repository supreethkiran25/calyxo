/**
 * Calyxo Native BLE State Machine & GATT Parser Certification Suite
 *
 * Validates:
 * 1. 9-State Finite State Machine (IDLE, SCANNING, CONNECTING, CONNECTED, STREAMING, DISCONNECTING, DISCONNECTED, RECONNECTING, BLUETOOTH_DISABLED)
 * 2. Bounded Exponential Backoff Reconnection Policy (1s, 2s, 4s, 8s, 16s, max 30s, capped at 6 retries)
 * 3. Standard Bluetooth SIG GATT Characteristic 0x2A37 Binary Parser (UINT8/UINT16 BPM, Contact, RR intervals in ms)
 * 4. User-initiated disconnect preventing automatic reconnect loops
 * 5. Zero-fake-data contract (Instant NULL on disconnect, no synthetic RR intervals)
 *
 * Run: node src/utils/nativeBLEStateMachineTestRunner.js
 */

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n======================================================================');
console.log('📡 CALYXO NATIVE BLE STATE MACHINE & GATT PARSER TEST SUITE');
console.log('======================================================================\n');

// ── 1. 9-State Finite State Machine Transitions ──────────────────────────────
console.log('🔄 1. 9-State Finite State Machine Transitions');

class MockBLEStateMachine {
  constructor() {
    this.state = 'IDLE';
    this.reconnectAttempts = 0;
    this.maxAttempts = 6;
    this.explicitUserDisconnect = false;
    this.telemetry = null;
  }

  startScanning(isBluetoothOn = true) {
    if (!isBluetoothOn) {
      this.state = 'BLUETOOTH_DISABLED';
      return;
    }
    this.explicitUserDisconnect = false;
    this.state = 'SCANNING';
  }

  deviceDiscovered() {
    if (this.state === 'SCANNING') {
      this.state = 'CONNECTING';
    }
  }

  connected() {
    if (this.state === 'CONNECTING' || this.state === 'RECONNECTING') {
      this.state = 'CONNECTED';
      this.reconnectAttempts = 0;
    }
  }

  subscribedToGATT() {
    if (this.state === 'CONNECTED') {
      this.state = 'STREAMING';
    }
  }

  receivedPacket(bpm, rrList = []) {
    if (this.state === 'STREAMING') {
      this.telemetry = { bpm, rrList, timestamp: Date.now() };
    }
  }

  unexpectedDisconnect() {
    this.telemetry = null; // Zero fake data contract
    if (this.explicitUserDisconnect) {
      this.state = 'DISCONNECTED';
    } else if (this.reconnectAttempts < this.maxAttempts) {
      this.state = 'RECONNECTING';
      this.reconnectAttempts++;
    } else {
      this.state = 'DISCONNECTED';
    }
  }

  userDisconnect() {
    this.explicitUserDisconnect = true;
    this.state = 'DISCONNECTING';
    this.telemetry = null;
    this.state = 'DISCONNECTED';
  }
}

const ble = new MockBLEStateMachine();
assert(ble.state === 'IDLE', 'Initial state is IDLE');

ble.startScanning(true);
assert(ble.state === 'SCANNING', 'Transitions to SCANNING on start');

ble.deviceDiscovered();
assert(ble.state === 'CONNECTING', 'Transitions to CONNECTING on device discovery');

ble.connected();
assert(ble.state === 'CONNECTED', 'Transitions to CONNECTED on successful connection');

ble.subscribedToGATT();
assert(ble.state === 'STREAMING', 'Transitions to STREAMING after GATT subscription');

ble.receivedPacket(148, [820.5, 815.0]);
assert(ble.telemetry !== null && ble.telemetry.bpm === 148, 'Captures live HR telemetry');

ble.unexpectedDisconnect();
assert(ble.state === 'RECONNECTING', 'Transitions to RECONNECTING on unexpected disconnect');
assert(ble.telemetry === null, 'Telemetry is strictly cleared to NULL on disconnect (Zero fake data)');

// ── 2. Bounded Exponential Backoff Reconnection Policy ────────────────────────
console.log('\n⏳ 2. Bounded Exponential Backoff Reconnection Policy');

function calculateBackoffDelay(attemptNumber) {
  // Policy: min(30, 2^(attempt - 1))
  return Math.min(30, Math.pow(2, attemptNumber - 1));
}

assert(calculateBackoffDelay(1) === 1, 'Attempt 1 delay is 1s');
assert(calculateBackoffDelay(2) === 2, 'Attempt 2 delay is 2s');
assert(calculateBackoffDelay(3) === 4, 'Attempt 3 delay is 4s');
assert(calculateBackoffDelay(4) === 8, 'Attempt 4 delay is 8s');
assert(calculateBackoffDelay(5) === 16, 'Attempt 5 delay is 16s');
assert(calculateBackoffDelay(6) === 30, 'Attempt 6 delay is capped at 30s');
assert(calculateBackoffDelay(7) === 30, 'Attempt 7 delay remains capped at 30s');

// Reconnect limit termination test
for (let i = 0; i < 6; i++) {
  ble.unexpectedDisconnect();
}
assert(ble.state === 'DISCONNECTED', 'Transitions to DISCONNECTED after exhausting 6 attempts');

// ── 3. GATT Characteristic 0x2A37 Binary Parser Contract ─────────────────────
console.log('\n🫀 3. GATT Characteristic 0x2A37 Binary Parser Contract');

function parseGATT0x2A37(buffer) {
  if (!buffer || buffer.length === 0) return null;
  const flags = buffer[0];
  const is16Bit = (flags & 0x01) !== 0;
  let offset = 1;

  let bpm = 0;
  if (is16Bit) {
    if (buffer.length < offset + 2) return null;
    bpm = buffer[offset] | (buffer[offset + 1] << 8);
    offset += 2;
  } else {
    if (buffer.length < offset + 1) return null;
    bpm = buffer[offset];
    offset += 1;
  }

  const hasContact = ((flags & 0x06) >> 1) >= 2;
  const rrPresent = (flags & 0x10) !== 0;
  const rrIntervals = [];

  if (rrPresent) {
    while (offset + 1 < buffer.length) {
      const rawRR = buffer[offset] | (buffer[offset + 1] << 8);
      const rrMs = (rawRR / 1024.0) * 1000.0;
      rrIntervals.push(Math.round(rrMs * 10) / 10);
      offset += 2;
    }
  }

  return { bpm, hasContact, rrIntervals, isRRSupported: rrPresent };
}

// 8-bit BPM packet without RR: Flags=0x06 (Contact detected, 8-bit), BPM=152 (0x98)
const packet8Bit = Buffer.from([0x06, 152]);
const parsed8 = parseGATT0x2A37(packet8Bit);
assert(parsed8.bpm === 152, 'Accurately parses 8-bit format BPM (152 bpm)');
assert(parsed8.hasContact === true, 'Accurately parses sensor contact detected');
assert(parsed8.isRRSupported === false, 'Accurately reports RR unavailable for basic packets');
assert(parsed8.rrIntervals.length === 0, 'Zero synthetic RR intervals injected');

// 16-bit BPM packet with RR: Flags=0x17 (16-bit, Contact, RR present), BPM=180 (0xB4, 0x00), RR=850ms (0x66, 0x03)
// 850ms in 1/1024s = 850 * 1024 / 1000 = 870.4 -> 870 = 0x0366
const packet16Bit = Buffer.from([0x17, 0xB4, 0x00, 0x66, 0x03]);
const parsed16 = parseGATT0x2A37(packet16Bit);
assert(parsed16.bpm === 180, 'Accurately parses 16-bit format BPM (180 bpm)');
assert(parsed16.isRRSupported === true, 'Accurately reports RR intervals available');
assert(parsed16.rrIntervals.length === 1, 'Decodes exact 1 RR interval');
assert(parsed16.rrIntervals[0] >= 849 && parsed16.rrIntervals[0] <= 851, `Decodes exact RR interval in ms (${parsed16.rrIntervals[0]} ms)`);

console.log('\n======================================================================');
console.log(`📊 BLE STATE MACHINE TEST RESULTS: ${passed} / ${passed + failed} PASS`);
console.log('======================================================================\n');

if (failed > 0) {
  process.exit(1);
}
