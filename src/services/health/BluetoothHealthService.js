/**
 * Calyxo Bluetooth Health Sensor Service (BLE)
 * Connects to standard Bluetooth Heart Rate monitors (0x180D) and BPM machines (0x1810)
 * Streams real-time physiological data without fake/simulated numbers.
 */

import { HealthCache } from './HealthCache';

class BluetoothHealthService {
  constructor() {
    this.device = null;
    this.server = null;
    this.hrCharacteristic = null;
    this.bpmCharacteristic = null;
    this.listeners = new Set();
    this.currentData = {
      isConnected: false,
      deviceName: null,
      heartRateBpm: 0,
      systolic: 0,
      diastolic: 0,
      source: 'None'
    };
  }

  isSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.currentData);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener({ ...this.currentData });
    }
  }

  /**
   * Request user permission and pair with standard Bluetooth Heart Rate or BPM device
   */
  async connectDevice() {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported on this browser or platform. Telemetry will sync via Apple Health or Health Connect.');
    }

    try {
      console.log('[CALYXO-BLE] Requesting Bluetooth device with standard Heart Rate (0x180D) or Blood Pressure (0x1810)...');
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['blood_pressure'] }
        ],
        optionalServices: ['battery_service', 'device_information']
      });

      if (!this.device) {
        throw new Error('No device selected');
      }

      this.device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));

      this.server = await this.device.gatt.connect();
      this.currentData.isConnected = true;
      this.currentData.deviceName = this.device.name || 'Bluetooth Heart Rate Sensor';
      this.currentData.source = this.device.name || 'BLE Monitor';

      // 1. Connect to Heart Rate Service (0x180D)
      try {
        const hrService = await this.server.getPrimaryService('heart_rate');
        this.hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');
        await this.hrCharacteristic.startNotifications();
        this.hrCharacteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateData.bind(this));
        console.log('[CALYXO-BLE] Subscribed to Heart Rate notifications');
      } catch (e) {
        console.log('[CALYXO-BLE] Heart rate service not available on this device:', e);
      }

      // 2. Connect to Blood Pressure Service (0x1810) if present
      try {
        const bpService = await this.server.getPrimaryService('blood_pressure');
        this.bpmCharacteristic = await bpService.getCharacteristic('blood_pressure_measurement');
        await this.bpmCharacteristic.startNotifications();
        this.bpmCharacteristic.addEventListener('characteristicvaluechanged', this.handleBloodPressureData.bind(this));
        console.log('[CALYXO-BLE] Subscribed to Blood Pressure notifications');
      } catch (e) {
        console.log('[CALYXO-BLE] Blood pressure service not available on this device:', e);
      }

      this.notify();
      return this.currentData;
    } catch (err) {
      console.warn('[CALYXO-BLE] Connection failed:', err);
      this.currentData.isConnected = false;
      this.notify();
      throw err;
    }
  }

  handleHeartRateData(event) {
    const value = event.target.value;
    if (!value || value.byteLength === 0) return;

    // Standard Bluetooth SIG Heart Rate Measurement Parsing (0x2A37)
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) === 1;
    let offset = 1;
    let bpm = 0;

    if (is16Bit) {
      bpm = value.getUint16(offset, true);
      offset += 2;
    } else {
      bpm = value.getUint8(offset);
      offset += 1;
    }

    // Energy Expended check (Bit 3)
    const hasEnergyExpended = (flags & 0x08) !== 0;
    if (hasEnergyExpended) {
      offset += 2;
    }

    // RR-Intervals check (Bit 4)
    let rrIntervalMs = null;
    const hasRRInterval = (flags & 0x10) !== 0;
    if (hasRRInterval && value.byteLength >= offset + 2) {
      // Units are 1/1024 seconds
      const rawRR = value.getUint16(offset, true);
      rrIntervalMs = Math.round((rawRR / 1024) * 1000);
    }

    if (bpm > 0) {
      this.currentData.heartRateBpm = bpm;
      this.currentData.rrIntervalMs = rrIntervalMs;
      this.currentData.lastReadingTimestamp = Date.now();
      this.currentData.source = this.device?.name || 'Bluetooth HRM';
      this.currentData.isDisconnected = false;
      
      // Update global health cache
      const cached = HealthCache.getMetrics() || {};
      HealthCache.saveMetrics({
        ...cached,
        heartRateBpm: bpm,
        heartRateSource: this.currentData.source,
        lastSyncTimestamp: Date.now()
      });

      this.notify();
    }
  }

  handleBloodPressureData(event) {
    const value = event.target.value;
    if (!value || value.byteLength < 5) return;

    // Standard Bluetooth SIG Blood Pressure Parsing (0x2A35)
    const systolic = value.getUint16(1, true);
    const diastolic = value.getUint16(3, true);
    let pulseRate = null;
    if (value.byteLength >= 14) {
      pulseRate = value.getUint16(12, true);
    }

    if (systolic > 0 && diastolic > 0) {
      this.currentData.systolic = systolic;
      this.currentData.diastolic = diastolic;
      this.currentData.pulseRate = pulseRate;
      this.currentData.lastReadingTimestamp = Date.now();
      this.currentData.source = this.device?.name || 'BLE BP Monitor';
      this.notify();
    }
  }

  handleDisconnect() {
    console.log('[CALYXO-BLE] Sensor disconnected');
    this.currentData.isConnected = false;
    this.currentData.isDisconnected = true;
    this.currentData.heartRateBpm = null;
    this.notify();
  }

  disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.currentData.isConnected = false;
    this.currentData.isDisconnected = true;
    this.currentData.heartRateBpm = null;
    this.notify();
  }
}

export const bluetoothHealthService = new BluetoothHealthService();
export default bluetoothHealthService;
