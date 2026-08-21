/**
 * Calyxo Wearable Compatibility Manager
 *
 * Truthful, vendor-specific device integration matrix.
 * Declares supported capabilities, sync mechanisms, and limitations.
 * Never fabricates connection states or unsupported metrics.
 */

export const WEARABLE_VENDORS = {
  APPLE: 'Apple',
  GOOGLE_SAMSUNG: 'Wear OS / Samsung',
  BOAT: 'boAt',
  GARMIN: 'Garmin',
  WHOOP: 'Whoop',
  OURA: 'Oura',
  POLAR_WAHOO: 'Polar / Wahoo / Chest Straps',
  OMRON_BPM: 'Omron / Bluetooth BPM'
};

export const DEVICE_PROFILES = {
  APPLE_WATCH: {
    id: 'apple_watch',
    name: 'Apple Watch (Series 4+, Ultra, SE)',
    vendor: WEARABLE_VENDORS.APPLE,
    connectionType: 'NATIVE_HEALTHKIT',
    supportedMetrics: [
      'Heart Rate (Live & Resting)',
      'High-Precision Steps',
      'Active & Total Calories',
      'Workout Tracking & Splits',
      'Sleep Stages (REM, Deep, Core)',
      'VO2 Max (Cardio Fitness)',
      'Blood Oxygen (SpO2)',
      'Wrist Temperature'
    ],
    unsupportedMetrics: ['Continuous Blood Pressure (Without cuff)'],
    syncMechanism: 'Direct HealthKit Background Sync & WatchConnectivity',
    requiresCompanionApp: false,
    instructions: 'Enable Apple Health permissions in Calyxo Settings. Apple Watch syncs telemetry automatically in real time.'
  },

  WEAR_OS: {
    id: 'wear_os',
    name: 'Wear OS (Galaxy Watch 4+, Pixel Watch)',
    vendor: WEARABLE_VENDORS.GOOGLE_SAMSUNG,
    connectionType: 'HEALTH_CONNECT',
    supportedMetrics: [
      'Heart Rate',
      'Daily Steps',
      'Active Calories',
      'Sleep Analysis',
      'Workouts'
    ],
    unsupportedMetrics: ['Direct Live Activity Dynamic Island (iOS-only)'],
    syncMechanism: 'Android Health Connect Background Sync',
    requiresCompanionApp: false,
    instructions: 'Install Health Connect on Android and grant Calyxo read permissions.'
  },

  BOAT_SMARTWATCH: {
    id: 'boat_smartwatch',
    name: 'boAt Smartwatches (Wave, Xtend, Storm, Ultima, Lunar)',
    vendor: WEARABLE_VENDORS.BOAT,
    connectionType: 'COMPANION_BRIDGE',
    supportedMetrics: [
      'Daily Steps',
      'Active Calories',
      'Heart Rate (Recorded sessions & periodic snapshots)',
      'Sleep Duration',
      'Recorded Workouts'
    ],
    unsupportedMetrics: [
      'Direct Web Bluetooth streaming without phone app',
      'Real-time sub-second continuous BPM streaming'
    ],
    syncMechanism: 'boAt Crest / boAt Hub App → Apple Health (iOS) or Health Connect (Android) → Calyxo',
    requiresCompanionApp: true,
    companionAppName: 'boAt Crest or boAt Hub',
    instructions:
      '1. Open boAt Crest/Hub app.\n2. Go to Profile → Settings → Connect to Apple Health / Health Connect.\n3. Enable Steps, Workouts, and Heart Rate sharing.\n4. Calyxo will automatically ingest and display your synchronized boAt metrics.'
  },

  GARMIN_WATCH: {
    id: 'garmin_watch',
    name: 'Garmin (Forerunner, Fenix, Venu, Instinct)',
    vendor: WEARABLE_VENDORS.GARMIN,
    connectionType: 'COMPANION_BRIDGE',
    supportedMetrics: ['Steps', 'Heart Rate', 'Resting HR', 'HRV', 'Sleep', 'Workouts', 'VO2 Max'],
    unsupportedMetrics: [],
    syncMechanism: 'Garmin Connect App → Apple Health / Health Connect → Calyxo',
    requiresCompanionApp: true,
    companionAppName: 'Garmin Connect',
    instructions: 'Enable Apple Health sync in Garmin Connect App Settings.'
  },

  BLE_HEART_RATE_STRAP: {
    id: 'ble_hr_strap',
    name: 'Bluetooth Heart Rate Chest Strap (Polar H10, Garmin HRM-Pro, Wahoo TICKR)',
    vendor: WEARABLE_VENDORS.POLAR_WAHOO,
    connectionType: 'DIRECT_BLUETOOTH',
    supportedMetrics: ['Instantaneous Real-Time Live BPM (0x180D)', 'R-R Intervals / HRV'],
    unsupportedMetrics: ['Steps', 'Sleep'],
    syncMechanism: 'Direct Web Bluetooth GATT (Heart Rate Service UUID 0x180D)',
    requiresCompanionApp: false,
    instructions: 'Put on chest strap, ensure Bluetooth is ON, and tap "Pair Bluetooth Sensor" in Calyxo.'
  },

  BLE_BLOOD_PRESSURE_MONITOR: {
    id: 'ble_bpm_machine',
    name: 'Bluetooth Blood Pressure Monitor (Omron, Beurer, QardioArm)',
    vendor: WEARABLE_VENDORS.OMRON_BPM,
    connectionType: 'DIRECT_BLUETOOTH',
    supportedMetrics: ['Systolic Blood Pressure (mmHg)', 'Diastolic Blood Pressure (mmHg)', 'Pulse Rate (BPM)'],
    unsupportedMetrics: ['Continuous tracking (snapshot only)'],
    syncMechanism: 'Direct Web Bluetooth GATT (Blood Pressure Service UUID 0x1810)',
    requiresCompanionApp: false,
    instructions: 'Take a reading on your BPM monitor and connect via Calyxo Health Hub.'
  }
};

/**
 * Returns capabilities and honest sync instructions for any device model
 */
export function getWearableProfile(deviceId) {
  if (!deviceId) return null;
  if (DEVICE_PROFILES[deviceId]) return DEVICE_PROFILES[deviceId];
  const upper = String(deviceId).toUpperCase();
  if (DEVICE_PROFILES[upper]) return DEVICE_PROFILES[upper];
  return Object.values(DEVICE_PROFILES).find(p => p.id === deviceId || p.id === String(deviceId).toLowerCase()) || null;
}

export function getAllWearableProfiles() {
  return Object.values(DEVICE_PROFILES);
}
