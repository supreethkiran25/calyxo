import { createHealthRecord, HEALTH_METRIC_TYPES, HEALTH_SOURCES } from '../health/CanonicalHealthData.js';

/**
 * Base Device Adapter interface
 */
export class BaseDeviceAdapter {
  constructor(id, name, manufacturer) {
    this.id = id;
    this.name = name;
    this.manufacturer = manufacturer;
    this.isConnected = false;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify(record) {
    this.listeners.forEach((l) => l(record));
  }

  async connect() {
    throw new Error('connect() not implemented');
  }

  async disconnect() {
    this.isConnected = false;
  }
}

/**
 * Apple Watch Adapter
 * Handles HealthKit ingestion and direct watchOS companion sync with deduplication rules.
 */
export class AppleWatchAdapter extends BaseDeviceAdapter {
  constructor() {
    super('apple_watch', 'Apple Watch', 'Apple');
    this.processedSampleIds = new Set();
  }

  /**
   * Deduplicates incoming sample to prevent double-counting between Watch direct stream and HealthKit queries
   */
  isDuplicateSample(sampleId) {
    if (!sampleId) return false;
    if (this.processedSampleIds.has(sampleId)) return true;
    this.processedSampleIds.add(sampleId);
    // Maintain a bounded set of recent 500 sample IDs
    if (this.processedSampleIds.size > 500) {
      const it = this.processedSampleIds.values();
      this.processedSampleIds.delete(it.next().value);
    }
    return false;
  }

  normalizeHeartRate(bpm, sampleId, timestamp = Date.now()) {
    if (this.isDuplicateSample(sampleId)) return null;
    return createHealthRecord({
      metricType: HEALTH_METRIC_TYPES.HEART_RATE,
      value: bpm,
      unit: 'bpm',
      source: HEALTH_SOURCES.APPLE_WATCH,
      device: 'Apple Watch',
      isLive: Date.now() - timestamp < 30000,
      timestamp
    });
  }

  normalizeSteps(steps, sampleId, timestamp = Date.now()) {
    if (this.isDuplicateSample(sampleId)) return null;
    return createHealthRecord({
      metricType: HEALTH_METRIC_TYPES.STEPS,
      value: steps,
      unit: 'steps',
      source: HEALTH_SOURCES.APPLE_WATCH,
      device: 'Apple Watch',
      isLive: false,
      timestamp
    });
  }
}

/**
 * boAt Smartwatch Adapter
 * Discovers model capabilities and normalizes data arriving via boAt Crest / boAt Hub bridge.
 */
export class BoatDeviceAdapter extends BaseDeviceAdapter {
  constructor(modelName = 'boAt Smartwatch') {
    super('boat_smartwatch', modelName, 'boAt');
  }

  normalizeBridgeData({ steps = 0, activeCalories = 0, restingHR = 0, sleepMinutes = 0, timestamp = Date.now() }) {
    const records = [];

    if (steps > 0) {
      records.push(
        createHealthRecord({
          metricType: HEALTH_METRIC_TYPES.STEPS,
          value: steps,
          unit: 'steps',
          source: HEALTH_SOURCES.BOAT_COMPANION,
          device: this.name,
          isLive: false,
          timestamp
        })
      );
    }

    if (restingHR > 0) {
      records.push(
        createHealthRecord({
          metricType: HEALTH_METRIC_TYPES.RESTING_HEART_RATE,
          value: restingHR,
          unit: 'bpm',
          source: HEALTH_SOURCES.BOAT_COMPANION,
          device: this.name,
          isLive: false,
          timestamp
        })
      );
    }

    if (sleepMinutes > 0) {
      records.push(
        createHealthRecord({
          metricType: HEALTH_METRIC_TYPES.SLEEP,
          value: Math.round((sleepMinutes / 60) * 10) / 10,
          unit: 'hours',
          source: HEALTH_SOURCES.BOAT_COMPANION,
          device: this.name,
          isLive: false,
          timestamp
        })
      );
    }

    return records;
  }
}

/**
 * Bluetooth SIG Heart Rate Service (0x180D) Adapter
 * Connects directly to Polar H10, Garmin HRM-Pro, Wahoo TICKR, etc.
 */
export class BleHeartRateAdapter extends BaseDeviceAdapter {
  constructor() {
    super('ble_hr_adapter', 'Bluetooth HR Sensor', 'Generic BLE SIG');
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }

  /**
   * Parses authentic Bluetooth SIG 0x2A37 Heart Rate Measurement packet
   */
  parseHeartRateMeasurement(dataView, deviceName = 'BLE Heart Rate Strap') {
    if (!dataView || dataView.byteLength < 2) return null;

    const flags = dataView.getUint8(0);
    const is16Bit = Boolean(flags & 0x01);
    let offset = 1;

    let bpm;
    if (is16Bit) {
      bpm = dataView.getUint16(offset, true);
      offset += 2;
    } else {
      bpm = dataView.getUint8(offset);
      offset += 1;
    }

    if (flags & 0x08) {
      offset += 2;
    }

    const rrIntervals = [];
    while (offset + 1 < dataView.byteLength) {
      const rrRaw = dataView.getUint16(offset, true);
      const rrMs = Math.round((rrRaw / 1024) * 1000);
      rrIntervals.push(rrMs);
      offset += 2;
    }

    return createHealthRecord({
      metricType: HEALTH_METRIC_TYPES.HEART_RATE,
      value: bpm,
      unit: 'bpm',
      source: HEALTH_SOURCES.BLUETOOTH_SIG_HRM,
      device: deviceName,
      isLive: true,
      timestamp: Date.now(),
      extra: { rrIntervals }
    });
  }

  async connect() {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth is not supported in this environment.');
    }

    // Battery optimization: Scan directly for 0x180D and immediately stop scanning upon connection
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }]
    });

    this.server = await this.device.gatt.connect();
    const service = await this.server.getPrimaryService('heart_rate');
    this.characteristic = await service.getCharacteristic('heart_rate_measurement');

    await this.characteristic.startNotifications();
    this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const dataView = event.target.value;
      const record = this.parseHeartRateMeasurement(dataView, this.device?.name || 'BLE Heart Rate Strap');
      if (record && record.value > 30 && record.value < 250) {
        console.log(`[CALYXO-HR] Real BLE HR stream: ${record.value} BPM`);
        this.notify(record);
      }
    });

    this.isConnected = true;
    console.log(`[CALYXO-BLE] Connected to BLE Heart Rate sensor: ${this.device.name}`);
    return { success: true, deviceName: this.device.name };
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
      console.log(`[CALYXO-BLE] Disconnected BLE Heart Rate sensor`);
    }
    this.isConnected = false;
  }
}

/**
 * Bluetooth SIG Blood Pressure Service (0x1810) Adapter
 * Characteristic 0x2A35 parser for Systolic, Diastolic, MAP, and Pulse rate.
 */
export class BleBloodPressureAdapter extends BaseDeviceAdapter {
  constructor() {
    super('ble_bp_adapter', 'Bluetooth Blood Pressure Monitor', 'Generic BLE SIG');
  }

  /**
   * Parses authentic Bluetooth SIG 0x2A35 Blood Pressure Measurement packet
   */
  parseBloodPressureMeasurement(dataView, deviceName = 'BLE Blood Pressure Monitor') {
    if (!dataView || dataView.byteLength < 7) {
      console.warn('[CALYXO-BP] Malformed or truncated BLE BP packet');
      return null;
    }

    const flags = dataView.getUint8(0);
    const isKPa = Boolean(flags & 0x01); // 0 = mmHg, 1 = kPa
    let offset = 1;

    // Systolic, Diastolic, MAP
    let systolic = dataView.getUint16(offset, true);
    let diastolic = dataView.getUint16(offset + 2, true);
    let map = dataView.getUint16(offset + 4, true);
    offset += 6;

    // Convert kPa to mmHg if flag is set (1 kPa = 7.50062 mmHg)
    if (isKPa) {
      systolic = Math.round(systolic * 7.50062);
      diastolic = Math.round(diastolic * 7.50062);
      map = Math.round(map * 7.50062);
    }

    // Timestamp field (Bit 1)
    let sampleTime = Date.now();
    if (flags & 0x02) {
      if (offset + 6 < dataView.byteLength) {
        const year = dataView.getUint16(offset, true);
        const month = dataView.getUint8(offset + 2);
        const day = dataView.getUint8(offset + 3);
        const hour = dataView.getUint8(offset + 4);
        const minute = dataView.getUint8(offset + 5);
        const second = dataView.getUint8(offset + 6);
        sampleTime = new Date(year, month - 1, day, hour, minute, second).getTime();
        offset += 7;
      }
    }

    // Pulse Rate field (Bit 2)
    let pulse = null;
    if (flags & 0x04) {
      if (offset + 1 < dataView.byteLength) {
        pulse = dataView.getUint16(offset, true);
        offset += 2;
      }
    }

    console.log(`[CALYXO-BP] Parsed BLE BP measurement: ${systolic}/${diastolic} mmHg, Pulse: ${pulse || '--'} BPM`);

    return this.normalizeReading({
      systolic,
      diastolic,
      pulse,
      deviceName,
      timestamp: sampleTime
    });
  }

  normalizeReading({ systolic, diastolic, pulse, deviceName = 'BLE BPM Monitor', timestamp = Date.now() }) {
    if (!systolic || !diastolic || isNaN(systolic) || isNaN(diastolic)) {
      return createHealthRecord({
        metricType: HEALTH_METRIC_TYPES.BLOOD_PRESSURE,
        value: null,
        unit: 'mmHg',
        source: HEALTH_SOURCES.BLUETOOTH_SIG_BPM,
        device: deviceName,
        isLive: false,
        timestamp
      });
    }

    return createHealthRecord({
      metricType: HEALTH_METRIC_TYPES.BLOOD_PRESSURE,
      value: { systolic, diastolic, pulse },
      unit: 'mmHg',
      displayText: `${systolic}/${diastolic} mmHg (Pulse: ${pulse || '--'} BPM)`,
      source: HEALTH_SOURCES.BLUETOOTH_SIG_BPM,
      device: deviceName,
      isLive: false,
      timestamp,
      extra: { systolic, diastolic, pulse }
    });
  }
}

export const deviceAdapters = {
  appleWatch: new AppleWatchAdapter(),
  boat: new BoatDeviceAdapter(),
  bleHeartRate: new BleHeartRateAdapter(),
  bleBloodPressure: new BleBloodPressureAdapter()
};
