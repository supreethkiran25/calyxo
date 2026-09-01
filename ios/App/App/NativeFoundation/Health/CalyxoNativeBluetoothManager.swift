//
//  CalyxoNativeBluetoothManager.swift
//  Calyxo Native Foundation
//
//  Production-Grade CoreBluetooth Heart Rate & Sensor Central Manager.
//  Implements 9-State Finite State Machine, Bounded Exponential Backoff,
//  Strict GATT Characteristic 0x2A37 Parsing, and Zero-Fake-Data Enforcement.
//

import Foundation
import CoreBluetooth

public final class CalyxoNativeBluetoothManager: NSObject, ObservableObject {
    public static let shared = CalyxoNativeBluetoothManager()
    
    // MARK: - State Machine States
    public enum BLEState: String, Codable {
        case idle = "IDLE"
        case scanning = "SCANNING"
        case connecting = "CONNECTING"
        case connected = "CONNECTED"
        case streaming = "STREAMING"
        case disconnecting = "DISCONNECTING"
        case disconnected = "DISCONNECTED"
        case reconnecting = "RECONNECTING"
        case bluetoothDisabled = "BLUETOOTH_DISABLED"
        case permissionDenied = "PERMISSION_DENIED"
    }
    
    // MARK: - Normalized Telemetry Model
    public struct HeartRateTelemetry: Codable {
        public let heartRateBpm: Int
        public let rrIntervalsMs: [Double]
        public let hasContact: Bool
        public let energyExpendedKcal: Int?
        public let timestamp: Date
        public let isLive: Bool
    }
    
    // Standard Bluetooth SIG UUIDs
    public let heartRateServiceUUID = CBUUID(string: "180D")
    public let heartRateMeasurementUUID = CBUUID(string: "2A37")
    public let batteryServiceUUID = CBUUID(string: "180F")
    public let batteryLevelUUID = CBUUID(string: "2A19")
    
    @Published public private(set) var state: BLEState = .idle
    @Published public private(set) var latestTelemetry: HeartRateTelemetry?
    @Published public private(set) var connectedPeripheralName: String?
    @Published public private(set) var batteryLevelPct: Int?
    
    private var centralManager: CBCentralManager!
    private var targetPeripheral: CBPeripheral?
    
    // Reconnect Policy Parameters
    private var reconnectAttempt = 0
    private let maxReconnectAttempts = 6
    private var reconnectWorkItem: DispatchWorkItem?
    private var explicitUserDisconnect = false
    
    override private init() {
        super.init()
        self.centralManager = CBCentralManager(delegate: self, queue: .main)
    }
    
    // MARK: - Discovery & Connection Commands
    public func startScanning() {
        guard centralManager.state == .poweredOn else {
            self.state = centralManager.state == .unauthorized ? .permissionDenied : .bluetoothDisabled
            return
        }
        
        self.explicitUserDisconnect = false
        self.state = .scanning
        print("[CALYXO-BLE] 📡 Scanning for Heart Rate Monitors (Service 0x180D)...")
        centralManager.scanForPeripherals(withServices: [heartRateServiceUUID], options: [CBCentralManagerScanOptionAllowDuplicatesKey: false])
    }
    
    public func stopScanning() {
        centralManager.stopScan()
        if state == .scanning {
            self.state = .idle
        }
    }
    
    public func connect(peripheral: CBPeripheral) {
        stopScanning()
        self.targetPeripheral = peripheral
        self.targetPeripheral?.delegate = self
        self.state = .connecting
        print("[CALYXO-BLE] 🔗 Connecting to \(peripheral.name ?? "BLE Device")...")
        centralManager.connect(peripheral, options: nil)
    }
    
    public func disconnect() {
        explicitUserDisconnect = true
        reconnectWorkItem?.cancel()
        reconnectAttempt = 0
        
        if let peripheral = targetPeripheral {
            self.state = .disconnecting
            centralManager.cancelPeripheralConnection(peripheral)
        } else {
            self.state = .idle
        }
        
        // Zero-Fake-Data Contract: Instantly clear telemetry upon user disconnect
        self.latestTelemetry = nil
        self.connectedPeripheralName = nil
    }
    
    // MARK: - Bounded Exponential Backoff Reconnection
    private func scheduleReconnect() {
        guard !explicitUserDisconnect, let peripheral = targetPeripheral else {
            self.state = .disconnected
            return
        }
        
        guard reconnectAttempt < maxReconnectAttempts else {
            print("[CALYXO-BLE] 🛑 Max reconnection attempts (\(maxReconnectAttempts)) reached. Transitioning to DISCONNECTED.")
            self.state = .disconnected
            self.targetPeripheral = nil
            return
        }
        
        reconnectAttempt += 1
        // Backoff: 1s, 2s, 4s, 8s, 16s, 30s max
        let delaySeconds = min(30.0, pow(2.0, Double(reconnectAttempt - 1)))
        self.state = .reconnecting
        print("[CALYXO-BLE] 🔄 Reconnect attempt #\(reconnectAttempt) scheduled in \(delaySeconds)s...")
        
        reconnectWorkItem?.cancel()
        let workItem = DispatchWorkItem { [weak self] in
            guard let self = self, !self.explicitUserDisconnect else { return }
            print("[CALYXO-BLE] 🔌 Executing reconnect to \(peripheral.name ?? "Device")...")
            self.centralManager.connect(peripheral, options: nil)
        }
        reconnectWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + delaySeconds, execute: workItem)
    }
    
    // MARK: - GATT Characteristic 0x2A37 Parser
    public func parseHeartRateData(data: Data) -> HeartRateTelemetry? {
        guard !data.isEmpty else { return nil }
        
        let bytes = [UInt8](data)
        let flags = bytes[0]
        
        // Bit 0: 0 = UINT8 BPM, 1 = UINT16 BPM
        let is16Bit = (flags & 0x01) != 0
        var offset = 1
        
        var bpm = 0
        if is16Bit {
            guard bytes.count >= offset + 2 else { return nil }
            bpm = Int(bytes[offset]) | (Int(bytes[offset + 1]) << 8)
            offset += 2
        } else {
            guard bytes.count >= offset + 1 else { return nil }
            bpm = Int(bytes[offset])
            offset += 1
        }
        
        // Bit 1-2: Sensor Contact Status
        let contactBit = (flags & 0x06) >> 1
        let hasContact = (contactBit == 3 || contactBit == 2)
        
        // Bit 3: Energy Expended Present
        let energyPresent = (flags & 0x08) != 0
        var energyKcal: Int? = nil
        if energyPresent && bytes.count >= offset + 2 {
            energyKcal = Int(bytes[offset]) | (Int(bytes[offset + 1]) << 8)
            offset += 2
        }
        
        // Bit 4: RR-Intervals Present
        let rrPresent = (flags & 0x10) != 0
        var rrIntervals: [Double] = []
        if rrPresent {
            while offset + 1 < bytes.count {
                let rawRR = Int(bytes[offset]) | (Int(bytes[offset + 1]) << 8)
                // Convert 1/1024 seconds to milliseconds
                let rrMs = (Double(rawRR) / 1024.0) * 1000.0
                rrIntervals.append(rrMs)
                offset += 2
            }
        }
        
        return HeartRateTelemetry(
            heartRateBpm: bpm,
            rrIntervalsMs: rrIntervals,
            hasContact: hasContact,
            energyExpendedKcal: energyKcal,
            timestamp: Date(),
            isLive: true
        )
    }
}

// MARK: - CBCentralManagerDelegate
extension CalyxoNativeBluetoothManager: CBCentralManagerDelegate {
    public func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            print("[CALYXO-BLE] ✅ Bluetooth hardware powered on.")
            if state == .bluetoothDisabled || state == .idle {
                self.state = .idle
            }
        case .unauthorized:
            print("[CALYXO-BLE] ❌ Bluetooth permission denied.")
            self.state = .permissionDenied
        case .poweredOff:
            print("[CALYXO-BLE] ⚠️ Bluetooth powered off.")
            self.state = .bluetoothDisabled
            self.latestTelemetry = nil
        default:
            self.state = .idle
        }
    }
    
    public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {
        print("[CALYXO-BLE] 🎯 Discovered HR Peripheral: \(peripheral.name ?? "Unknown") (RSSI: \(RSSI))")
        // Auto-connect to first discovered validated HR peripheral
        connect(peripheral: peripheral)
    }
    
    public func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("[CALYXO-BLE] ✅ Connected to \(peripheral.name ?? "Device"). Discovering services...")
        self.state = .connected
        self.connectedPeripheralName = peripheral.name ?? "Heart Rate Sensor"
        self.reconnectAttempt = 0
        peripheral.discoverServices([heartRateServiceUUID, batteryServiceUUID])
    }
    
    public func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        print("[CALYXO-BLE] ❌ Connection failed: \(error?.localizedDescription ?? "Unknown error")")
        self.latestTelemetry = nil
        scheduleReconnect()
    }
    
    public func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        print("[CALYXO-BLE] ⚠️ Peripheral disconnected: \(error?.localizedDescription ?? "Normal disconnect")")
        // Zero-Fake-Data Contract: Instantly clear active stream on disconnect
        self.latestTelemetry = nil
        
        if explicitUserDisconnect {
            self.state = .disconnected
            self.connectedPeripheralName = nil
            self.targetPeripheral = nil
        } else {
            scheduleReconnect()
        }
    }
}

// MARK: - CBPeripheralDelegate
extension CalyxoNativeBluetoothManager: CBPeripheralDelegate {
    public func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard let services = peripheral.services, error == nil else { return }
        for service in services {
            if service.uuid == heartRateServiceUUID {
                peripheral.discoverCharacteristics([heartRateMeasurementUUID], for: service)
            } else if service.uuid == batteryServiceUUID {
                peripheral.discoverCharacteristics([batteryLevelUUID], for: service)
            }
        }
    }
    
    public func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        guard let characteristics = service.characteristics, error == nil else { return }
        for characteristic in characteristics {
            if characteristic.uuid == heartRateMeasurementUUID {
                // Subscribe to live notifications
                peripheral.setNotifyValue(true, for: characteristic)
                self.state = .streaming
                print("[CALYXO-BLE] 🫀 Subscribed to Heart Rate Measurement stream (0x2A37).")
            } else if characteristic.uuid == batteryLevelUUID {
                peripheral.readValue(for: characteristic)
            }
        }
    }
    
    public func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        guard let data = characteristic.value, error == nil else { return }
        
        if characteristic.uuid == heartRateMeasurementUUID {
            if let telemetry = parseHeartRateData(data: data) {
                self.latestTelemetry = telemetry
                self.state = .streaming
            }
        } else if characteristic.uuid == batteryLevelUUID && !data.isEmpty {
            self.batteryLevelPct = Int(data[0])
        }
    }
}
