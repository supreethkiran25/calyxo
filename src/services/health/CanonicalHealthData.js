/**
 * Calyxo Canonical Health Data Layer & Normalizer
 *
 * Single Source of Truth for all health, biometric, and wearable telemetry.
 * Rules:
 * 1. ZERO fabricated data: never invent, randomize, or hardcode fallback metrics.
 * 2. If data is not present or authorized, return `{ available: false, value: null, displayText: "No data available" }`.
 * 3. All internal units are canonical:
 *    - Weight: kg
 *    - Distance: meters
 *    - Water: ml
 *    - Energy: kcal
 *    - Heart Rate: BPM
 *    - Blood Pressure: mmHg
 *    - Duration: seconds
 * 4. Local calendar-day boundaries: always respect the user's local timezone.
 */

export const HEALTH_METRIC_TYPES = {
  HEART_RATE: 'heart_rate',
  RESTING_HEART_RATE: 'resting_heart_rate',
  HEART_RATE_VARIABILITY: 'hrv',
  BLOOD_PRESSURE: 'blood_pressure',
  STEPS: 'steps',
  ACTIVE_CALORIES: 'active_calories',
  DISTANCE: 'distance',
  WEIGHT: 'weight',
  BODY_FAT: 'body_fat',
  SLEEP: 'sleep',
  VO2_MAX: 'vo2_max',
  HYDRATION: 'hydration',
  RECOVERY: 'recovery',
  FITNESS_AGE: 'fitness_age'
};

export const HEALTH_SOURCES = {
  APPLE_HEALTHKIT: 'Apple Health',
  APPLE_WATCH: 'Apple Watch',
  ANDROID_HEALTH_CONNECT: 'Health Connect',
  BLUETOOTH_SIG_HRM: 'Bluetooth HR Monitor',
  BLUETOOTH_SIG_BPM: 'Bluetooth BPM Machine',
  BOAT_COMPANION: 'boAt (via Apple Health / Health Connect)',
  GARMIN_COMPANION: 'Garmin (via HealthKit)',
  WHOOP_COMPANION: 'Whoop (via HealthKit)',
  USER_MANUAL_LOG: 'Manual Entry',
  INTERNAL_ENGINE: 'Calyxo Deterministic Engine'
};

/**
 * Creates a normalized health record
 */
export function createHealthRecord({
  metricType,
  value,
  unit,
  timestamp = Date.now(),
  source = HEALTH_SOURCES.APPLE_HEALTHKIT,
  device = '',
  isLive = false,
  dataQuality = 'valid',
  extra = {}
}) {
  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
    return {
      metricType,
      available: false,
      value: null,
      unit,
      displayText: 'No data available',
      source,
      device,
      isLive: false,
      timestamp,
      lastUpdatedAt: new Date(timestamp).toISOString()
    };
  }

  return {
    metricType,
    available: true,
    value,
    unit,
    displayText: `${value} ${unit}`,
    source,
    device,
    isLive,
    dataQuality,
    timestamp,
    lastUpdatedAt: new Date(timestamp).toISOString(),
    ...extra
  };
}

/**
 * Unit conversion utilities
 */
export const UnitConverters = {
  // Weight
  kgToLbs: (kg) => (kg !== null && kg !== undefined ? Math.round(kg * 2.20462 * 10) / 10 : null),
  lbsToKg: (lbs) => (lbs !== null && lbs !== undefined ? Math.round((lbs / 2.20462) * 10) / 10 : null),

  // Distance
  metersToKm: (meters) => (meters !== null && meters !== undefined ? Math.round((meters / 1000) * 100) / 100 : null),
  metersToMiles: (meters) => (meters !== null && meters !== undefined ? Math.round((meters / 1609.34) * 100) / 100 : null),
  kmToMeters: (km) => (km !== null && km !== undefined ? Math.round(km * 1000) : null),

  // Water
  mlToOz: (ml) => (ml !== null && ml !== undefined ? Math.round(ml * 0.033814) : null),
  ozToMl: (oz) => (oz !== null && oz !== undefined ? Math.round(oz / 0.033814) : null),

  // Energy
  kcalToKj: (kcal) => (kcal !== null && kcal !== undefined ? Math.round(kcal * 4.184) : null),

  // Format with user preference
  formatWeight: (kg, useLbs = false) => {
    if (kg === null || kg === undefined || isNaN(kg) || kg <= 0) return 'No data available';
    return useLbs ? `${UnitConverters.kgToLbs(kg)} lbs` : `${kg} kg`;
  },
  formatDistance: (meters, useMiles = false) => {
    if (meters === null || meters === undefined || isNaN(meters) || meters < 0) return 'No data available';
    return useMiles ? `${UnitConverters.metersToMiles(meters)} mi` : `${UnitConverters.metersToKm(meters)} km`;
  },
  formatWater: (ml, useOz = false) => {
    if (ml === null || ml === undefined || isNaN(ml) || ml < 0) return 'No data available';
    return useOz ? `${UnitConverters.mlToOz(ml)} oz` : `${ml} ml`;
  }
};

export const convertWeight = UnitConverters.kgToLbs;
export const convertDistance = UnitConverters.metersToKm;
export const convertVolume = UnitConverters.mlToOz;

/**
 * Local Calendar Day Boundary Calculator
 * Calculates precise start of day and end of day in the user's local timezone.
 */
export function getLocalDayBoundaries(date = new Date()) {
  const target = new Date(date);
  const startOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
  
  // Format local date string: YYYY-MM-DD
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  const localDateStr = `${year}-${month}-${day}`;

  return {
    startOfDay,
    endOfDay,
    startMs: startOfDay.getTime(),
    endMs: endOfDay.getTime(),
    localDateStr
  };
}

/**
 * Validates whether a health reading is realistic & not corrupted
 */
export function validateHealthReading(metricType, value) {
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  switch (metricType) {
    case HEALTH_METRIC_TYPES.HEART_RATE:
    case HEALTH_METRIC_TYPES.RESTING_HEART_RATE:
      return value >= 30 && value <= 240;
    case HEALTH_METRIC_TYPES.STEPS:
      return value >= 0 && value <= 150000;
    case HEALTH_METRIC_TYPES.ACTIVE_CALORIES:
      return value >= 0 && value <= 20000;
    case HEALTH_METRIC_TYPES.WEIGHT:
      return value >= 20 && value <= 350;
    case HEALTH_METRIC_TYPES.SLEEP:
      return value >= 0 && value <= 24;
    case HEALTH_METRIC_TYPES.VO2_MAX:
      return value >= 10 && value <= 90;
    case HEALTH_METRIC_TYPES.HYDRATION:
      return value >= 0 && value <= 15000;
    default:
      return true;
  }
}
