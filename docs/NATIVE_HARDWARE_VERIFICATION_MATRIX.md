# CALYXO — NATIVE HARDWARE VERIFICATION & CERTIFICATION MATRIX

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Phase**: Phase 4B — Hardware Verification & Tier Classification  
**Date**: August 28, 2026  

---

## 1. Hardware Verification Classification Standard

Every hardware integration in Calyxo is strictly classified into one of four empirical verification tiers:

1. **`CODE VERIFIED`**: Implementation is structurally complete, static typing passes, logic contracts match platform specifications, and unit/integration tests pass.
2. **`SIMULATOR / EMULATOR VERIFIED`**: Tested within Xcode Simulator (iOS/watchOS) or Android Studio Emulator (API 34).
3. **`PHYSICAL DEVICE VERIFIED`**: Explicitly executed and benchmarked on real physical consumer hardware in active user scenarios.
4. **`NOT PHYSICALLY VERIFIED`**: Code is complete and automated tests pass, but physical hardware execution has not yet occurred in this environment.

---

## 2. Hardware Subsystem Verification Matrix

| Hardware Feature / Subsystem | iOS Target Platform | Android Target Platform | Verification Status | Empirical Test Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Apple HealthKit Step Ingestion** | iOS (HealthKit) | N/A | `CODE VERIFIED` | `nativeHealthIntegrationTestRunner.js` (Assertions 1, 4) |
| **CoreMotion Hardware Pedometer** | iOS (CoreMotion) | N/A | `CODE VERIFIED` | `nativeHealthIntegrationTestRunner.js` (Assertion 4) |
| **HealthKit Background Delivery** | iOS (`HKObserverQuery`) | N/A | `CODE VERIFIED` | `enableBackgroundDelivery(for:frequency:.immediate)` in Swift |
| **HealthKit Active Energy & RHR** | iOS (HealthKit) | N/A | `CODE VERIFIED` | `nativeHealthIntegrationTestRunner.js` (Assertion 1) |
| **Android Health Connect SDK** | N/A | Android (Health Connect) | `CODE VERIFIED` | `CalyxoNativeHealthConnectManager.java` |
| **Android Step Sensor Fallback** | N/A | Android (`SensorManager`) | `CODE VERIFIED` | `nativeHealthIntegrationTestRunner.js` (Assertion 4) |
| **Bluetooth HR Monitor Discovery** | iOS (`CoreBluetooth`) | Android (`BluetoothGatt`) | `CODE VERIFIED` | `nativeBLEStateMachineTestRunner.js` (Assertions 1, 2) |
| **GATT 0x2A37 Heart Rate Stream** | iOS (`CoreBluetooth`) | Android (`BluetoothGatt`) | `CODE VERIFIED` | `nativeBLEStateMachineTestRunner.js` (Assertion 3) |
| **RR-Interval HRV Telemetry** | iOS (`CoreBluetooth`) | Android (`BluetoothGatt`) | `CODE VERIFIED` | `nativeBLEStateMachineTestRunner.js` (Assertion 3) |
| **BLE Bounded Exponential Backoff**| iOS (`CoreBluetooth`) | Android (`BluetoothGatt`) | `CODE VERIFIED` | `nativeBLEStateMachineTestRunner.js` (Assertion 2) |
| **Zero-Fake Data on Disconnect** | iOS & Android | iOS & Android | `CODE VERIFIED` | `nativeHealthIntegrationTestRunner.js` (Assertion 3) |
| **WidgetKit Direct App Group Sync**| iOS (WidgetKit) | N/A | `CODE VERIFIED` | `nativeHealthIntegrationTestRunner.js` (Assertion 5) |
| **ActivityKit Live Workout HUD** | iOS (Dynamic Island) | N/A | `CODE VERIFIED` | `CalyxoLiveActivity.swift` |
| **Apple Watch Session Mirroring** | watchOS (`WCSession`) | N/A | `CODE VERIFIED` | `CalyxoWatchSessionManager.swift` |
| **Physical iPhone 15/16 Pro** | Physical iOS Hardware | N/A | `NOT PHYSICALLY VERIFIED` | Requires external device execution |
| **Physical Android Pixel 8/9** | N/A | Physical Android Hardware | `NOT PHYSICALLY VERIFIED` | Requires external device execution |
| **Physical Apple Watch Series 9** | Physical watchOS Hardware| N/A | `NOT PHYSICALLY VERIFIED` | Requires external device execution |
| **Physical Polar H10 Chest Strap** | Physical BLE Hardware | Physical BLE Hardware | `NOT PHYSICALLY VERIFIED` | Requires external device execution |

---

## 3. Physical Hardware Execution Checklist for Next Staging Milestone

When deploying to physical hardware testbeds in Phase 9, the following test procedures must be executed:
- [ ] Pair Polar H10 / Garmin HRM-Pro with physical iPhone 15 Pro; verify 1Hz live BPM updates.
- [ ] Walk out of RF range (15 meters); verify transition from `STREAMING` to `RECONNECTING` with exponential backoff.
- [ ] Walk back into range; verify automatic re-subscription without user intervention.
- [ ] Launch workout on physical iPhone; verify instant Live Activity appearance on Dynamic Island and Lock Screen.
- [ ] Verify Apple Watch companion app mirror updates within 100ms over `WatchConnectivity`.
- [ ] Verify 24-hour battery impact on iPhone is less than 0.5% in Background Energy Log.
