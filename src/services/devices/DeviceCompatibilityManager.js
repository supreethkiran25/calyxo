/**
 * Calyxo Central Device Compatibility Manager
 *
 * Single Source of Truth for all hardware device integrations, capability detection,
 * connection lifecycles, and adapter routing.
 *
 * Rules:
 * 1. Truthful capability reporting: never claim a device is supported unless the API/BLE/HealthKit bridge exists.
 * 2. Extensible architecture: vendor-specific logic lives exclusively in DeviceAdapters.
 * 3. Standardized statuses: SUPPORTED, PARTIALLY_SUPPORTED, REQUIRES_BRIDGE, REQUIRES_BLE, UNSUPPORTED, COMING_SOON.
 */

export const DEVICE_CAPABILITIES = {
  HEART_RATE_LIVE: 'heart_rate_live',
  HEART_RATE_RESTING: 'heart_rate_resting',
  HRV: 'hrv',
  STEPS: 'steps',
  ACTIVE_CALORIES: 'active_calories',
  DISTANCE: 'distance',
  WORKOUT_TRACKING: 'workout_tracking',
  SLEEP_STAGES: 'sleep_stages',
  SLEEP_DURATION: 'sleep_duration',
  SPO2: 'spo2',
  BLOOD_PRESSURE: 'blood_pressure',
  VO2_MAX: 'vo2_max',
  WRIST_TEMPERATURE: 'wrist_temperature'
};

export const INTEGRATION_STATUS = {
  SUPPORTED: 'SUPPORTED',
  PARTIALLY_SUPPORTED: 'PARTIALLY_SUPPORTED',
  REQUIRES_HEALTH_BRIDGE: 'REQUIRES_HEALTH_BRIDGE',
  REQUIRES_BLE: 'REQUIRES_BLE',
  REQUIRES_EXTERNAL_SDK: 'REQUIRES_EXTERNAL_SDK',
  UNSUPPORTED: 'UNSUPPORTED',
  COMING_SOON: 'COMING_SOON'
};
export const DEVICE_SUPPORT_STATUS = INTEGRATION_STATUS;

export const CONNECTION_STATUS = {
  DISCONNECTED: 'DISCONNECTED',
  SCANNING: 'SCANNING',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  STREAMING: 'STREAMING',
  ERROR: 'ERROR'
};

export const DEVICE_REGISTRY = [
  {
    id: 'apple_watch_all',
    manufacturer: 'Apple',
    model: 'Apple Watch (Series 4+, Ultra, SE)',
    deviceType: 'SMARTWATCH',
    connectionType: 'NATIVE_HEALTHKIT',
    integrationStatus: INTEGRATION_STATUS.SUPPORTED,
    supportedCapabilities: [
      DEVICE_CAPABILITIES.HEART_RATE_LIVE,
      DEVICE_CAPABILITIES.HEART_RATE_RESTING,
      DEVICE_CAPABILITIES.HRV,
      DEVICE_CAPABILITIES.STEPS,
      DEVICE_CAPABILITIES.ACTIVE_CALORIES,
      DEVICE_CAPABILITIES.DISTANCE,
      DEVICE_CAPABILITIES.WORKOUT_TRACKING,
      DEVICE_CAPABILITIES.SLEEP_STAGES,
      DEVICE_CAPABILITIES.SPO2,
      DEVICE_CAPABILITIES.VO2_MAX,
      DEVICE_CAPABILITIES.WRIST_TEMPERATURE
    ],
    unsupportedCapabilities: [DEVICE_CAPABILITIES.BLOOD_PRESSURE],
    syncDescription: 'Direct Apple HealthKit background telemetry and WatchConnectivity companion app.',
    requiresCompanionBridge: false,
    externalConfigRequired: null
  },
  {
    id: 'wear_os_all',
    manufacturer: 'Google / Samsung',
    model: 'Wear OS (Galaxy Watch 4+, Pixel Watch)',
    deviceType: 'SMARTWATCH',
    connectionType: 'HEALTH_CONNECT',
    integrationStatus: INTEGRATION_STATUS.SUPPORTED,
    supportedCapabilities: [
      DEVICE_CAPABILITIES.HEART_RATE_LIVE,
      DEVICE_CAPABILITIES.STEPS,
      DEVICE_CAPABILITIES.ACTIVE_CALORIES,
      DEVICE_CAPABILITIES.DISTANCE,
      DEVICE_CAPABILITIES.WORKOUT_TRACKING,
      DEVICE_CAPABILITIES.SLEEP_DURATION
    ],
    unsupportedCapabilities: [DEVICE_CAPABILITIES.WRIST_TEMPERATURE],
    syncDescription: 'Android Health Connect background synchronization.',
    requiresCompanionBridge: false,
    externalConfigRequired: null
  },
  {
    id: 'boat_wave_xtend',
    manufacturer: 'boAt',
    model: 'boAt Smartwatches (Wave, Xtend, Storm, Ultima, Lunar Series)',
    deviceType: 'SMARTWATCH',
    connectionType: 'COMPANION_BRIDGE',
    integrationStatus: INTEGRATION_STATUS.REQUIRES_HEALTH_BRIDGE,
    supportedCapabilities: [
      DEVICE_CAPABILITIES.STEPS,
      DEVICE_CAPABILITIES.ACTIVE_CALORIES,
      DEVICE_CAPABILITIES.HEART_RATE_RESTING,
      DEVICE_CAPABILITIES.SLEEP_DURATION,
      DEVICE_CAPABILITIES.WORKOUT_TRACKING
    ],
    unsupportedCapabilities: [
      DEVICE_CAPABILITIES.HEART_RATE_LIVE,
      DEVICE_CAPABILITIES.HRV,
      DEVICE_CAPABILITIES.VO2_MAX,
      DEVICE_CAPABILITIES.BLOOD_PRESSURE
    ],
    syncDescription:
      'boAt companion apps (boAt Crest / boAt Hub) synchronize recorded steps, heart rate, and workouts into Apple Health / Health Connect, which Calyxo ingests.',
    requiresCompanionBridge: true,
    bridgeAppName: 'boAt Crest / boAt Hub',
    externalConfigRequired: 'User must link boAt app with Apple Health / Health Connect'
  },
  {
    id: 'garmin_all',
    manufacturer: 'Garmin',
    model: 'Garmin (Forerunner, Fenix, Venu, Instinct)',
    deviceType: 'SMARTWATCH',
    connectionType: 'COMPANION_BRIDGE',
    integrationStatus: INTEGRATION_STATUS.REQUIRES_HEALTH_BRIDGE,
    supportedCapabilities: [
      DEVICE_CAPABILITIES.STEPS,
      DEVICE_CAPABILITIES.HEART_RATE_LIVE,
      DEVICE_CAPABILITIES.HEART_RATE_RESTING,
      DEVICE_CAPABILITIES.HRV,
      DEVICE_CAPABILITIES.ACTIVE_CALORIES,
      DEVICE_CAPABILITIES.SLEEP_STAGES,
      DEVICE_CAPABILITIES.VO2_MAX,
      DEVICE_CAPABILITIES.WORKOUT_TRACKING
    ],
    unsupportedCapabilities: [DEVICE_CAPABILITIES.BLOOD_PRESSURE],
    syncDescription: 'Garmin Connect App synchronizes telemetry into Apple Health / Health Connect.',
    requiresCompanionBridge: true,
    bridgeAppName: 'Garmin Connect',
    externalConfigRequired: 'User must enable Apple Health sync in Garmin Connect Settings'
  },
  {
    id: 'whoop_all',
    manufacturer: 'Whoop',
    model: 'Whoop 4.0',
    deviceType: 'FITNESS_BAND',
    connectionType: 'COMPANION_BRIDGE',
    integrationStatus: INTEGRATION_STATUS.REQUIRES_HEALTH_BRIDGE,
    supportedCapabilities: [
      DEVICE_CAPABILITIES.HEART_RATE_RESTING,
      DEVICE_CAPABILITIES.HRV,
      DEVICE_CAPABILITIES.SLEEP_STAGES,
      DEVICE_CAPABILITIES.WORKOUT_TRACKING
    ],
    unsupportedCapabilities: [DEVICE_CAPABILITIES.STEPS, DEVICE_CAPABILITIES.BLOOD_PRESSURE],
    syncDescription: 'Whoop App synchronizes recovery, HRV, and sleep stages into Apple Health.',
    requiresCompanionBridge: true,
    bridgeAppName: 'Whoop App',
    externalConfigRequired: 'User must enable HealthKit sync in Whoop App Settings'
  },
  {
    id: 'polar_wahoo_ble_hrm',
    manufacturer: 'Polar / Wahoo / Garmin',
    model: 'Standard Bluetooth HR Chest Straps (Polar H10, TICKR, HRM-Pro)',
    deviceType: 'HEART_RATE_STRAP',
    connectionType: 'DIRECT_BLUETOOTH',
    integrationStatus: INTEGRATION_STATUS.SUPPORTED,
    supportedCapabilities: [
      DEVICE_CAPABILITIES.HEART_RATE_LIVE,
      DEVICE_CAPABILITIES.HRV
    ],
    unsupportedCapabilities: [
      DEVICE_CAPABILITIES.STEPS,
      DEVICE_CAPABILITIES.SLEEP_DURATION,
      DEVICE_CAPABILITIES.BLOOD_PRESSURE
    ],
    syncDescription: 'Direct Web Bluetooth GATT connection via standard Heart Rate Service (UUID 0x180D).',
    requiresCompanionBridge: false,
    externalConfigRequired: null
  },
  {
    id: 'ble_bp_monitors',
    manufacturer: 'Omron / Beurer / Qardio',
    model: 'Bluetooth Blood Pressure Monitors (Omron 10/Evolv, QardioArm)',
    deviceType: 'BLOOD_PRESSURE_MONITOR',
    connectionType: 'DIRECT_BLUETOOTH',
    integrationStatus: INTEGRATION_STATUS.SUPPORTED,
    supportedCapabilities: [
      DEVICE_CAPABILITIES.BLOOD_PRESSURE,
      DEVICE_CAPABILITIES.HEART_RATE_RESTING
    ],
    unsupportedCapabilities: [
      DEVICE_CAPABILITIES.STEPS,
      DEVICE_CAPABILITIES.SLEEP_DURATION,
      DEVICE_CAPABILITIES.WORKOUT_TRACKING
    ],
    syncDescription: 'Direct Web Bluetooth GATT connection via Blood Pressure Service (UUID 0x1810).',
    requiresCompanionBridge: false,
    externalConfigRequired: null
  }
];

export class DeviceCompatibilityManager {
  /**
   * Get complete device registry
   */
  static getRegistry() {
    return DEVICE_REGISTRY;
  }

  /**
   * Look up a registered device profile by ID
   */
  static getDeviceProfile(id) {
    return DEVICE_REGISTRY.find((d) => d.id === id) || null;
  }

  /**
   * Check if a device supports a specific capability
   */
  static hasCapability(deviceId, capability) {
    const profile = this.getDeviceProfile(deviceId);
    if (!profile) return false;
    return profile.supportedCapabilities.includes(capability);
  }

  /**
   * Get all devices that support a given capability (e.g. LIVE Heart Rate)
   */
  static getDevicesByCapability(capability) {
    return DEVICE_REGISTRY.filter((d) => d.supportedCapabilities.includes(capability));
  }

  /**
   * Get human-readable setup instructions for any device
   */
  static getSetupInstructions(deviceId) {
    const profile = this.getDeviceProfile(deviceId);
    if (!profile) return 'Device profile not found.';

    if (profile.connectionType === 'NATIVE_HEALTHKIT') {
      return '1. Open Calyxo Settings.\n2. Tap "Connect Apple Health".\n3. Allow permissions for Heart Rate, Steps, Workouts, and Sleep.\n4. Wear Apple Watch — data syncs automatically.';
    }

    if (profile.connectionType === 'COMPANION_BRIDGE') {
      return `1. Open your ${profile.bridgeAppName} mobile app.\n2. Go to App Settings → Third-Party Connections.\n3. Enable syncing to Apple Health (iOS) or Health Connect (Android).\n4. Return to Calyxo to see your synchronized metrics.`;
    }

    if (profile.connectionType === 'DIRECT_BLUETOOTH') {
      return '1. Ensure Bluetooth is ON on your device.\n2. Turn on or wear your sensor.\n3. Tap "Pair Bluetooth Sensor" in Calyxo to connect directly.';
    }

    return 'Follow manufacturer instructions to connect via Apple Health or Bluetooth.';
  }
}

export { DeviceCompatibilityManager as deviceCompatibilityManager };
export default DeviceCompatibilityManager;
