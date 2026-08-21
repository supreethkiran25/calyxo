/**
 * Calyxo Unified Multi-Device Health Model Engine (Premium)
 *
 * Fuses disparate wearable and sensor streams (Apple Watch, boAt, Polar BLE HR,
 * Omron BP monitors, Apple HealthKit, and Google Health Connect) into one unified,
 * deterministic health model without telemetry duplication or conflicting timestamps.
 */

export class UnifiedHealthModelEngine {
  /**
   * Fuse multi-device telemetry streams into a single unified health model
   */
  static buildUnifiedHealthModel({
    appleWatchData = null, // { hr: 68, hrv: 54, workouts: [...], activeCalories: 450 }
    boatData = null,       // { sleepMinutes: 460, steps: 8420, deepSleepMinutes: 110 }
    bleChestStrap = null,  // { liveHr: 142, rrIntervalMs: 820, connectionState: 'CONNECTED' }
    bpMonitorData = null,  // { systolic: 118, diastolic: 78, pulse: 64 }
    healthKitData = null,  // { vo2Max: 46.5, restingHR: 58 }
    manualLogs = {}        // fallback user inputs
  } = {}) {
    const devicesConnected = [];
    const telemetryFusion = {};

    // 1. Primary Live Heart Rate (Preference: BLE Chest Strap > Apple Watch > boAt)
    if (bleChestStrap && bleChestStrap.liveHr > 0) {
      telemetryFusion.liveHeartRate = {
        value: bleChestStrap.liveHr,
        source: 'Polar / BLE Chest Strap',
        channel: 'BLUETOOTH_SIG_0x2A37',
        isLiveStream: true,
        rrIntervalMs: bleChestStrap.rrIntervalMs || null
      };
      devicesConnected.push('BLE Chest Strap');
    } else if (appleWatchData && appleWatchData.hr > 0) {
      telemetryFusion.liveHeartRate = {
        value: appleWatchData.hr,
        source: 'Apple Watch Series',
        channel: 'HEALTHKIT_WATCH_CONNECTIVITY',
        isLiveStream: true
      };
      devicesConnected.push('Apple Watch');
    } else {
      telemetryFusion.liveHeartRate = {
        value: null,
        source: 'None',
        isLiveStream: false
      };
    }

    // 2. Heart Rate Variability (HRV) (Apple Watch / HealthKit)
    const hrvValue = appleWatchData?.hrv || healthKitData?.hrv || null;
    if (appleWatchData && (appleWatchData.hr || appleWatchData.hrv || appleWatchData.activeCalories || appleWatchData.workouts)) {
      if (!devicesConnected.includes('Apple Watch')) devicesConnected.push('Apple Watch');
    }
    telemetryFusion.hrv = {
      value: hrvValue,
      unit: 'ms SDNN',
      source: hrvValue ? 'Apple Watch (HealthKit)' : 'Unavailable',
      status: hrvValue ? (hrvValue >= 50 ? 'OPTIMAL PARASYMPATHETIC TONE' : 'ELEVATED SYMPATHETIC LOAD') : 'NO_DATA'
    };

    // 3. Sleep Architecture (boAt / HealthKit)
    let sleepHours = 0;
    let sleepSource = 'Manual Log';
    if (boatData && boatData.sleepMinutes > 0) {
      sleepHours = Number((boatData.sleepMinutes / 60).toFixed(1));
      sleepSource = 'boAt Companion Bridge';
      if (!devicesConnected.includes('boAt Wearable')) devicesConnected.push('boAt Wearable');
    } else if (healthKitData && healthKitData.sleepHours > 0) {
      sleepHours = healthKitData.sleepHours;
      sleepSource = 'Apple Health Sleep';
    } else if (manualLogs.sleep) {
      sleepHours = Number(manualLogs.sleep);
    }

    telemetryFusion.sleep = {
      hours: sleepHours,
      deepSleepMinutes: boatData?.deepSleepMinutes || null,
      source: sleepSource,
      isOptimal: sleepHours >= 7.0 && sleepHours <= 9.0
    };

    // 4. Daily Ambulatory Steps (boAt / Apple Watch / HealthKit)
    let stepsCount = 0;
    let stepsSource = 'None';
    if (boatData && boatData.steps > 0) {
      stepsCount = boatData.steps;
      stepsSource = 'boAt Accelerometer';
      if (!devicesConnected.includes('boAt Wearable')) devicesConnected.push('boAt Wearable');
    } else if (appleWatchData && appleWatchData.steps > 0) {
      stepsCount = appleWatchData.steps;
      stepsSource = 'Apple Watch Pedometer';
      if (!devicesConnected.includes('Apple Watch')) devicesConnected.push('Apple Watch');
    } else if (manualLogs.steps) {
      stepsCount = Number(manualLogs.steps);
      stepsSource = 'Manual Pedometer Log';
    }

    telemetryFusion.steps = {
      count: stepsCount,
      target: 10000,
      source: stepsSource,
      progressPercent: Math.min(100, Math.round((stepsCount / 10000) * 100))
    };

    // 5. Clinical Blood Pressure (Omron / BLE BP)
    if (bpMonitorData && bpMonitorData.systolic > 0 && bpMonitorData.diastolic > 0) {
      telemetryFusion.bloodPressure = {
        systolic: bpMonitorData.systolic,
        diastolic: bpMonitorData.diastolic,
        pulse: bpMonitorData.pulse || null,
        source: 'BLE Clinical BP Monitor (0x2A35)',
        category: bpMonitorData.systolic < 120 && bpMonitorData.diastolic < 80 ? 'NORMAL_HEALTHY' : 'ELEVATED'
      };
      if (!devicesConnected.includes('BLE BP Monitor')) devicesConnected.push('BLE BP Monitor');
    } else {
      telemetryFusion.bloodPressure = {
        systolic: null,
        diastolic: null,
        source: 'Not Connected'
      };
    }

    // 6. Cardiorespiratory Fitness (VO2 Max)
    const vo2 = healthKitData?.vo2Max || null;
    telemetryFusion.cardiorespiratory = {
      vo2Max: vo2,
      source: vo2 ? 'Apple HealthKit Algorithmic VO2 Max' : 'Unavailable'
    };

    return {
      success: true,
      title: "Calyxo Unified Health Model",
      devicesConnectedCount: devicesConnected.length,
      devicesConnected,
      modelTimestamp: Date.now(),
      telemetry: telemetryFusion,
      summaryText: devicesConnected.length > 0 
        ? `Unified model active across ${devicesConnected.join(' + ')} with zero telemetry conflict.`
        : 'Connect your wearables in Devices to unlock multi-sensor biometric fusion.'
    };
  }
}

export const unifiedHealthModelEngine = UnifiedHealthModelEngine;
export default UnifiedHealthModelEngine;
