# CALYXO — PHASE 9 DEVICE TESTBED & PARITY BASELINE

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Phase**: Phase 9 — Physical Device Testbed, Native Parity & Production Hardening  
**Date**: August 28, 2026  
**Status**: **100% PASS (590 / 590 Assertions Passing)**  

---

## 1. Pre-Change Regression Suite Verification

```text
1. node tests/security.test.mjs                        --> 14 / 14 PASS (100%)
2. node src/utils/rc3MasterProductionTestRunner.js      --> 286 / 286 PASS (100%)
3. node src/utils/smartReminderTestRunner.js           --> 29 / 29 PASS (100%)
4. node src/utils/muscleAnalyticsTestRunner.js         --> 35 / 35 PASS (100%)
5. node src/utils/paymentProductionTestRunner.js       --> 39 / 39 PASS (100%)
6. node src/utils/dateUtilsTestRunner.js               --> 15 / 15 PASS (100%)
7. node src/utils/themeContrastTestRunner.js           --> 17 / 17 PASS (100%)
8. node src/utils/syncConflictTestRunner.js            --> 15 / 15 PASS (100%)
9. node src/utils/nativeFoundationTestRunner.js        --> 16 / 16 PASS (100%)
10. node src/utils/nativeHealthIntegrationTestRunner.js --> 17 / 17 PASS (100%)
11. node src/utils/nativeBLEStateMachineTestRunner.js   --> 24 / 24 PASS (100%)
12. node src/utils/nativeProductParityTestRunner.js    --> 22 / 22 PASS (100%)
13. node src/utils/nativeWorkoutEngineTestRunner.js    --> 23 / 23 PASS (100%)
14. node src/utils/nativeNutritionEngineTestRunner.js  --> 19 / 19 PASS (100%)
15. node src/utils/nativeAITruthfulnessTestRunner.js   --> 19 / 19 PASS (100%)
16. npx eslint --quiet                                 --> 0 errors, 0 warnings
17. npm run build                                      --> Vite 6.4.3 clean bundle (11.64s)
```

---

## 2. Native Capabilities & Subsystem Inventory

### iOS Capabilities
- Target: `ios/App/App/NativeFoundation/`
- Frameworks: `HealthKit`, `CoreMotion`, `CoreBluetooth`, `WatchConnectivity`, `ActivityKit`, `WidgetKit`, `SwiftUI`
- Deep-Link URL Scheme: `calyxo://auth/callback`
- Entitlements: HealthKit Read/Share, App Groups (`group.com.calyxo.app`), Background Modes (Audio/Processing/BLE Central)

### Android Capabilities
- Target: `android/app/src/main/java/com/calyxo/app/`
- Frameworks: `androidx.health.connect.client`, `BluetoothLeScanner`, `WorkManager`, `Room`, `Jetpack Compose`
- Permissions: `android.permission.BODY_SENSORS`, `android.permission.BLUETOOTH_SCAN`, `android.permission.BLUETOOTH_CONNECT`, `android.permission.POST_NOTIFICATIONS`
- Deep-Link Intent Filter: `calyxo://auth/callback`
