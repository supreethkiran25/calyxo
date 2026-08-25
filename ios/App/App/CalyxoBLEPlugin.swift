import Foundation
import Capacitor
import CoreBluetooth

@objc(CalyxoBLEPlugin)
public class CalyxoBLEPlugin: CAPPlugin, CAPBridgedPlugin, CBCentralManagerDelegate, CBPeripheralDelegate {
    public let identifier = "CalyxoBLEPlugin"
    public let jsName = "CalyxoBLE"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getBluetoothState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestBluetoothPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startScan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopScan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "connectDevice", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disconnectDevice", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startHeartRateStream", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopHeartRateStream", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getConnectedDevices", returnType: CAPPluginReturnPromise)
    ]

    private var centralManager: CBCentralManager!
    private var discoveredPeripherals: [String: CBPeripheral] = [:]
    private var connectedPeripheral: CBPeripheral?
    private var hrCharacteristic: CBCharacteristic?
    private var isScanning: Bool = false
    private var connectCall: CAPPluginCall?

    // Standard Bluetooth SIG GATT UUIDs
    public static let heartRateServiceUUID = CBUUID(string: "180D")
    public static let heartRateMeasurementUUID = CBUUID(string: "2A37")
    public static let bodySensorLocationUUID = CBUUID(string: "2A38")
    public static let deviceInformationServiceUUID = CBUUID(string: "180A")
    public static let batteryServiceUUID = CBUUID(string: "180F")
    public static let bloodPressureServiceUUID = CBUUID(string: "1810")
    public static let bloodPressureMeasurementUUID = CBUUID(string: "2A35")

    public override func load() {
        super.load()
        centralManager = CBCentralManager(delegate: self, queue: DispatchQueue.main, options: [
            CBCentralManagerOptionShowPowerAlertKey: true
        ])
    }

    // MARK: - Plugin Methods

    @objc func getBluetoothState(_ call: CAPPluginCall) {
        let stateStr = self.stringForState(centralManager.state)
        call.resolve([
            "state": stateStr,
            "isAvailable": centralManager.state == .poweredOn
        ])
    }

    @objc func requestBluetoothPermission(_ call: CAPPluginCall) {
        if centralManager.state == .poweredOn {
            call.resolve(["granted": true, "state": "poweredOn"])
        } else if centralManager.state == .unauthorized {
            call.resolve(["granted": false, "state": "unauthorized"])
        } else {
            call.resolve([
                "granted": centralManager.state == .poweredOn,
                "state": self.stringForState(centralManager.state)
            ])
        }
    }

    @objc func startScan(_ call: CAPPluginCall) {
        guard centralManager.state == .poweredOn else {
            call.reject("Bluetooth is not powered on (State: \(self.stringForState(centralManager.state)))")
            return
        }

        discoveredPeripherals.removeAll()
        isScanning = true

        // Scan for standard Health Services or all peripherals with advertised names
        let scanServices: [CBUUID]? = [
            CalyxoBLEPlugin.heartRateServiceUUID,
            CalyxoBLEPlugin.bloodPressureServiceUUID
        ]

        // If allowDuplicates is false, peripheral is reported once per discovery
        centralManager.scanForPeripherals(withServices: nil, options: [
            CBCentralManagerScanOptionAllowDuplicatesKey: false
        ])

        print("[CALYXO-BLE] Real BLE scan started")
        call.resolve(["scanning": true])
    }

    @objc func stopScan(_ call: CAPPluginCall) {
        if isScanning {
            centralManager.stopScan()
            isScanning = false
            print("[CALYXO-BLE] Real BLE scan stopped")
        }
        call.resolve(["scanning": false])
    }

    @objc func connectDevice(_ call: CAPPluginCall) {
        guard let deviceId = call.getString("deviceId") else {
            call.reject("Missing required deviceId")
            return
        }

        guard let peripheral = discoveredPeripherals[deviceId] else {
            call.reject("Device not found in scanned peripherals. Please scan again.")
            return
        }

        connectCall = call
        if isScanning {
            centralManager.stopScan()
            isScanning = false
        }

        centralManager.connect(peripheral, options: nil)
        print("[CALYXO-BLE] Connecting to peripheral: \(peripheral.name ?? deviceId)...")
    }

    @objc func disconnectDevice(_ call: CAPPluginCall) {
        if let peripheral = connectedPeripheral {
            centralManager.cancelPeripheralConnection(peripheral)
            connectedPeripheral = nil
            hrCharacteristic = nil
            print("[CALYXO-BLE] Disconnected peripheral")
        }
        call.resolve(["disconnected": true])
    }

    @objc func startHeartRateStream(_ call: CAPPluginCall) {
        guard let peripheral = connectedPeripheral else {
            call.reject("No BLE peripheral currently connected")
            return
        }

        guard let char = hrCharacteristic else {
            call.reject("Heart Rate characteristic (0x2A37) not discovered on connected peripheral")
            return
        }

        peripheral.setNotifyValue(true, for: char)
        print("[CALYXO-BLE] Subscribed to live 0x2A37 Heart Rate notifications")
        call.resolve(["streaming": true])
    }

    @objc func stopHeartRateStream(_ call: CAPPluginCall) {
        if let peripheral = connectedPeripheral, let char = hrCharacteristic {
            peripheral.setNotifyValue(false, for: char)
            print("[CALYXO-BLE] Unsubscribed from 0x2A37 Heart Rate notifications")
        }
        call.resolve(["streaming": false])
    }

    @objc func getConnectedDevices(_ call: CAPPluginCall) {
        if let connected = connectedPeripheral {
            call.resolve([
                "devices": [[
                    "id": connected.identifier.uuidString,
                    "name": connected.name ?? "Bluetooth Heart Rate Sensor",
                    "state": "connected"
                ]]
            ])
        } else {
            call.resolve(["devices": []])
        }
    }

    // MARK: - CBCentralManagerDelegate

    public func centralManagerDidUpdateState(_ central: CBCentralManager) {
        let stateStr = self.stringForState(central.state)
        print("[CALYXO-BLE] CentralManager state updated: \(stateStr)")
        self.notifyListeners("bleStateChange", data: [
            "state": stateStr,
            "isAvailable": central.state == .poweredOn
        ])
    }

    public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        let deviceId = peripheral.identifier.uuidString
        let name = peripheral.name ?? advertisementData[CBAdvertisementDataLocalNameKey] as? String

        discoveredPeripherals[deviceId] = peripheral

        var serviceUUIDs: [String] = []
        if let uuids = advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID] {
            serviceUUIDs = uuids.map { $0.uuidString }
        }

        let hasHeartRate = serviceUUIDs.contains("180D") || (name?.lowercased().contains("hrm") ?? false) || (name?.lowercased().contains("polar") ?? false) || (name?.lowercased().contains("garmin") ?? false) || (name?.lowercased().contains("wahoo") ?? false)

        let deviceData: [String: Any] = [
            "id": deviceId,
            "name": name ?? "BLE Peripheral (\(deviceId.prefix(6)))",
            "rssi": RSSI.intValue,
            "serviceUUIDs": serviceUUIDs,
            "hasHeartRate": hasHeartRate,
            "advertisedName": name ?? ""
        ]

        self.notifyListeners("bleDiscoveredDevice", data: deviceData)
    }

    public func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("[CALYXO-BLE] Successfully connected to \(peripheral.name ?? peripheral.identifier.uuidString)")
        connectedPeripheral = peripheral
        peripheral.delegate = self

        // Discover services
        peripheral.discoverServices([
            CalyxoBLEPlugin.heartRateServiceUUID,
            CalyxoBLEPlugin.deviceInformationServiceUUID,
            CalyxoBLEPlugin.batteryServiceUUID,
            CalyxoBLEPlugin.bloodPressureServiceUUID
        ])
    }

    public func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        print("[CALYXO-BLE] Failed to connect: \(error?.localizedDescription ?? "Unknown error")")
        connectCall?.reject(error?.localizedDescription ?? "Connection failed")
        connectCall = nil
    }

    public func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        print("[CALYXO-BLE] Peripheral disconnected: \(peripheral.name ?? peripheral.identifier.uuidString)")
        connectedPeripheral = nil
        hrCharacteristic = nil
        self.notifyListeners("bleDeviceDisconnected", data: [
            "deviceId": peripheral.identifier.uuidString,
            "name": peripheral.name ?? "Device"
        ])
    }

    // MARK: - CBPeripheralDelegate

    public func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let error = error {
            print("[CALYXO-BLE] Discover services error: \(error.localizedDescription)")
            connectCall?.reject(error.localizedDescription)
            connectCall = nil
            return
        }

        guard let services = peripheral.services else {
            connectCall?.resolve([
                "connected": true,
                "id": peripheral.identifier.uuidString,
                "name": peripheral.name ?? "Bluetooth Device",
                "hasHeartRateService": false
            ])
            connectCall = nil
            return
        }

        var foundHR = false
        for service in services {
            if service.uuid == CalyxoBLEPlugin.heartRateServiceUUID {
                foundHR = true
                peripheral.discoverCharacteristics([
                    CalyxoBLEPlugin.heartRateMeasurementUUID,
                    CalyxoBLEPlugin.bodySensorLocationUUID
                ], for: service)
            }
        }

        if !foundHR {
            connectCall?.resolve([
                "connected": true,
                "id": peripheral.identifier.uuidString,
                "name": peripheral.name ?? "Bluetooth Device",
                "hasHeartRateService": false,
                "message": "Device connected, but standard Heart Rate Service (0x180D) was not found."
            ])
            connectCall = nil
        }
    }

    public func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        if let error = error {
            print("[CALYXO-BLE] Discover characteristics error: \(error.localizedDescription)")
            connectCall?.reject(error.localizedDescription)
            connectCall = nil
            return
        }

        guard let characteristics = service.characteristics else { return }

        for char in characteristics {
            if char.uuid == CalyxoBLEPlugin.heartRateMeasurementUUID {
                hrCharacteristic = char
                print("[CALYXO-BLE] Found 0x2A37 Heart Rate Measurement Characteristic!")
                // Auto-subscribe to notifications
                peripheral.setNotifyValue(true, for: char)

                connectCall?.resolve([
                    "connected": true,
                    "id": peripheral.identifier.uuidString,
                    "name": peripheral.name ?? "Heart Rate Sensor",
                    "hasHeartRateService": true,
                    "isStreamingReady": true
                ])
                connectCall = nil
            }
        }
    }

    public func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        if let error = error {
            print("[CALYXO-BLE] Characteristic update error: \(error.localizedDescription)")
            return
        }

        if characteristic.uuid == CalyxoBLEPlugin.heartRateMeasurementUUID {
            guard let data = characteristic.value, data.count > 0 else { return }

            // Standard Bluetooth SIG Heart Rate Measurement Parsing (0x2A37)
            let flags = data[0]
            let is16Bit = (flags & 0x01) == 1
            var offset = 1
            var bpm = 0

            if is16Bit && data.count >= offset + 2 {
                let u16 = data.subdata(in: offset..<offset+2).withUnsafeBytes { $0.load(as: UInt16.self) }
                bpm = Int(CFSwapInt16LittleToHost(u16))
                offset += 2
            } else if data.count >= offset + 1 {
                bpm = Int(data[offset])
                offset += 1
            }

            // Energy Expended check (Bit 3)
            if (flags & 0x08) != 0 && data.count >= offset + 2 {
                offset += 2
            }

            // RR-Intervals check (Bit 4)
            var rrIntervalMs: Int? = nil
            if (flags & 0x10) != 0 && data.count >= offset + 2 {
                let rawRR = data.subdata(in: offset..<offset+2).withUnsafeBytes { $0.load(as: UInt16.self) }
                let rrVal = Double(CFSwapInt16LittleToHost(rawRR))
                // Unit is 1/1024 seconds
                rrIntervalMs = Int((rrVal / 1024.0) * 1000.0)
            }

            if bpm > 0 {
                let payload: [String: Any] = [
                    "deviceId": peripheral.identifier.uuidString,
                    "deviceName": peripheral.name ?? "Bluetooth Heart Rate Sensor",
                    "bpm": bpm,
                    "rrIntervalMs": rrIntervalMs ?? 0,
                    "timestamp": Date().timeIntervalSince1970 * 1000,
                    "live": true
                ]
                self.notifyListeners("bleHeartRateData", data: payload)
            }
        }
    }

    // MARK: - Helpers

    private func stringForState(_ state: CBManagerState) -> String {
        switch state {
        case .unknown: return "unknown"
        case .resetting: return "resetting"
        case .unsupported: return "unsupported"
        case .unauthorized: return "unauthorized"
        case .poweredOff: return "poweredOff"
        case .poweredOn: return "poweredOn"
        @unknown default: return "unknown"
        }
    }
}
