/**
 * Calyxo Universal Wearable Integration Manager
 * Manages real hardware adapters for Apple Health, Apple Watch, Garmin, WHOOP, 
 * and Universal Bluetooth Low Energy (BLE) sensors without simulated data.
 */

import { HealthPermissionManager } from './HealthPermissionManager';
import { HealthDataService } from './HealthDataService';
import { bluetoothHealthService } from './BluetoothHealthService';
import { HealthCache } from './HealthCache';

export const BLE_STATES = {
  BLUETOOTH_OFF: 'BLUETOOTH_OFF',
  PERMISSION_REQUIRED: 'PERMISSION_REQUIRED',
  IDLE: 'IDLE',
  SCANNING: 'SCANNING',
  DEVICE_FOUND: 'DEVICE_FOUND',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCOVERING_SERVICES: 'DISCOVERING_SERVICES',
  SUBSCRIBING: 'SUBSCRIBING',
  RECEIVING_MEASUREMENTS: 'RECEIVING_MEASUREMENTS',
  STREAM_VERIFIED: 'STREAM_VERIFIED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR'
};

export const SUPPORTED_WEARABLE_CATEGORIES = [
  {
    id: 'apple_health',
    name: 'Apple Health & Apple Watch',
    type: 'healthkit',
    models: 'Apple Watch Series 1-10, Ultra 1-2, SE & iPhone Pedometer',
    description: 'Direct native HealthKit sync for steps, active calories, resting HR, workouts, and sleep.',
    requiresNativeAuth: true
  },
  {
    id: 'garmin_whoop',
    name: 'Garmin, WHOOP & Oura Ring',
    type: 'companion_healthkit',
    models: 'Forerunner, Fenix, Epix, Whoop 4.0, Oura Gen 3',
    description: 'Syncs via official iOS companion apps directly into Apple Health.',
    requiresNativeAuth: true
  },
  {
    id: 'ble_heart_rate',
    name: 'Universal Bluetooth Heart Rate Sensors',
    type: 'ble_gatt',
    models: 'Polar H10/H9, Garmin HRM-Pro, Wahoo TICKR, Scosche, BLE Smart Straps',
    description: 'Real-time CoreBluetooth streaming via standard GATT Heart Rate Service (0x180D).',
    requiresNativeAuth: false
  },
  {
    id: 'other_watches',
    name: 'Amazfit, boAt, Realme, Noise & Fitbit',
    type: 'companion_healthkit',
    models: 'Amazfit (Zepp), boAt (Crest), Realme (Link), Noise (Fit), Fitbit',
    description: 'Enables Apple Health sync in watch companion app to stream into Calyxo.',
    requiresNativeAuth: true
  }
];

class WearableIntegrationManager {
  constructor() {
    this.bleState = BLE_STATES.IDLE;
    this.discoveredDevices = [];
    this.connectedDevice = null;
    this.liveHeartRate = null;
    this.lastPacketTime = null;
    this.listeners = new Set();
    this.blePlugin = null;
    this.isNative = false;

    this.initNativeBLE();
  }

  async initNativeBLE() {
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        this.isNative = true;
        this.blePlugin = Capacitor.Plugins.CalyxoBLE;

        if (this.blePlugin) {
          // Listen for discovered peripherals
          this.blePlugin.addListener('bleDiscoveredDevice', (device) => {
            this.handleDiscoveredDevice(device);
          });

          // Listen for live heart rate packets (0x2A37)
          this.blePlugin.addListener('bleHeartRateData', (packet) => {
            this.handleLiveHeartRatePacket(packet);
          });

          // Listen for peripheral disconnects
          this.blePlugin.addListener('bleDeviceDisconnected', (event) => {
            this.handleDeviceDisconnected(event);
          });

          // Listen for Bluetooth state changes
          this.blePlugin.addListener('bleStateChange', ({ state, isAvailable }) => {
            if (!isAvailable) {
              this.setState(BLE_STATES.BLUETOOTH_OFF);
            } else if (this.bleState === BLE_STATES.BLUETOOTH_OFF) {
              this.setState(BLE_STATES.IDLE);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[WearableManager] Native BLE initialization note:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getStateSnapshot());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getStateSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (e) {}
    }
  }

  getStateSnapshot() {
    return {
      bleState: this.bleState,
      discoveredDevices: [...this.discoveredDevices],
      connectedDevice: this.connectedDevice,
      liveHeartRate: this.liveHeartRate,
      lastPacketTime: this.lastPacketTime,
      isVerified: this.bleState === BLE_STATES.STREAM_VERIFIED
    };
  }

  setState(newState) {
    this.bleState = newState;
    this.notify();
  }

  // --- Real CoreBluetooth BLE Scanning ---

  async startBLEScan() {
    this.discoveredDevices = [];
    this.setState(BLE_STATES.SCANNING);

    if (this.isNative && this.blePlugin) {
      try {
        await this.blePlugin.startScan();
      } catch (err) {
        console.error('[WearableManager] BLE scan failed:', err);
        this.setState(BLE_STATES.ERROR);
        throw err;
      }
    } else if (bluetoothHealthService.isSupported()) {
      // Web Bluetooth desktop browser fallback
      try {
        const deviceData = await bluetoothHealthService.connectDevice();
        this.connectedDevice = {
          id: 'web_bluetooth_device',
          name: deviceData.deviceName || 'Web Bluetooth Sensor',
          hasHeartRateService: true
        };
        this.setState(BLE_STATES.CONNECTED);
      } catch (e) {
        this.setState(BLE_STATES.IDLE);
      }
    } else {
      this.setState(BLE_STATES.ERROR);
      throw new Error('Bluetooth Low Energy is not available in this environment.');
    }
  }

  async stopBLEScan() {
    if (this.isNative && this.blePlugin) {
      try {
        await this.blePlugin.stopScan();
      } catch (e) {}
    }
    if (this.bleState === BLE_STATES.SCANNING) {
      this.setState(BLE_STATES.IDLE);
    }
  }

  handleDiscoveredDevice(device) {
    if (!device || !device.id) return;
    const exists = this.discoveredDevices.some(d => d.id === device.id);
    if (!exists) {
      this.discoveredDevices.push({
        id: device.id,
        name: device.name || 'Bluetooth Peripheral',
        rssi: device.rssi || -70,
        hasHeartRate: Boolean(device.hasHeartRate)
      });
      this.setState(BLE_STATES.DEVICE_FOUND);
    }
  }

  // --- Real CoreBluetooth GATT Connection & Heart Rate Subscription ---

  async connectBLEDevice(deviceId) {
    this.setState(BLE_STATES.CONNECTING);
    await this.stopBLEScan();

    if (this.isNative && this.blePlugin) {
      try {
        const result = await this.blePlugin.connectDevice({ deviceId });
        this.connectedDevice = {
          id: deviceId,
          name: result?.name || 'Bluetooth Heart Rate Sensor',
          hasHeartRateService: result?.hasHeartRateService !== false
        };

        if (result?.hasHeartRateService) {
          this.setState(BLE_STATES.SUBSCRIBING);
          await this.blePlugin.startHeartRateStream({ deviceId });
          this.setState(BLE_STATES.RECEIVING_MEASUREMENTS);
        } else {
          this.setState(BLE_STATES.CONNECTED);
        }
        return this.connectedDevice;
      } catch (err) {
        console.error('[WearableManager] Failed to connect to BLE device:', err);
        this.setState(BLE_STATES.ERROR);
        throw err;
      }
    }
  }

  handleLiveHeartRatePacket(packet) {
    if (!packet || typeof packet.bpm !== 'number' || packet.bpm <= 0) return;

    this.liveHeartRate = packet.bpm;
    this.lastPacketTime = packet.timestamp || Date.now();
    this.setState(BLE_STATES.STREAM_VERIFIED);

    // Update global normalized health cache
    const current = HealthCache.getMetrics() || {};
    HealthCache.saveMetrics({
      ...current,
      heartRateBpm: packet.bpm,
      heartRateSource: this.connectedDevice?.name || 'Bluetooth Heart Rate Monitor',
      lastSyncTimestamp: Date.now()
    });
  }

  handleDeviceDisconnected(event) {
    console.log('[WearableManager] Device disconnected:', event);
    this.connectedDevice = null;
    this.liveHeartRate = null;
    this.setState(BLE_STATES.DISCONNECTED);
  }

  async disconnectBLEDevice() {
    if (this.isNative && this.blePlugin) {
      try {
        await this.blePlugin.disconnectDevice();
      } catch (e) {}
    } else {
      bluetoothHealthService.disconnect();
    }
    this.connectedDevice = null;
    this.liveHeartRate = null;
    this.setState(BLE_STATES.IDLE);
  }
}

export const wearableIntegrationManager = new WearableIntegrationManager();
export default wearableIntegrationManager;
