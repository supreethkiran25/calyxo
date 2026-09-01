# CALYXO — PHASE 10 PRODUCTION CUTOVER & RELEASE BASELINE

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Phase**: Phase 10 — Production Cutover & Deployment Staging Baseline  
**Date**: August 28, 2026  
**Status**: **100% PASS (604 / 604 Assertions Passing)**  

---

## 1. Regression Suite Verification

```text
1. node tests/security.test.mjs                               --> 14 / 14 PASS (100%)
2. node src/utils/rc3MasterProductionTestRunner.js             --> 286 / 286 PASS (100%)
3. node src/utils/smartReminderTestRunner.js                  --> 29 / 29 PASS (100%)
4. node src/utils/muscleAnalyticsTestRunner.js                --> 35 / 35 PASS (100%)
5. node src/utils/paymentProductionTestRunner.js              --> 39 / 39 PASS (100%)
6. node src/utils/dateUtilsTestRunner.js                      --> 15 / 15 PASS (100%)
7. node src/utils/themeContrastTestRunner.js                  --> 17 / 17 PASS (100%)
8. node src/utils/syncConflictTestRunner.js                   --> 15 / 15 PASS (100%)
9. node src/utils/nativeFoundationTestRunner.js               --> 16 / 16 PASS (100%)
10. node src/utils/nativeHealthIntegrationTestRunner.js        --> 17 / 17 PASS (100%)
11. node src/utils/nativeBLEStateMachineTestRunner.js          --> 24 / 24 PASS (100%)
12. node src/utils/nativeProductParityTestRunner.js           --> 22 / 22 PASS (100%)
13. node src/utils/nativeWorkoutEngineTestRunner.js           --> 23 / 23 PASS (100%)
14. node src/utils/nativeNutritionEngineTestRunner.js         --> 19 / 19 PASS (100%)
15. node src/utils/nativeAITruthfulnessTestRunner.js          --> 19 / 19 PASS (100%)
16. node src/utils/nativeProductionHardeningTestRunner.js     --> 14 / 14 PASS (100%)
17. npx eslint --quiet                                        --> 0 errors, 0 warnings
18. npm run build                                             --> Vite 6.4.3 clean bundle (12.16s)
```

---

## 2. Release Configuration Baseline

### iOS Release Target
- App Target: `Calyxo`
- Bundle Identifier: `com.calyxo.app`
- Minimum iOS Version: `iOS 16.0+`
- Swift Version: `5.9+` (Swift Concurrency & Async/Await)
- Capabilities: HealthKit, CoreMotion, CoreBluetooth, App Groups (`group.com.calyxo.app`), Background Modes (BLE central, Audio/processing), Push Notifications

### Android Release Target
- Package / Application ID: `com.calyxo.app`
- Min SDK: `26` (Android 8.0 Oreo)
- Target SDK: `34` (Android 14)
- Compile SDK: `34`
- Capabilities: Health Connect Client, WorkManager, BluetoothGatt, EncryptedSharedPreferences

### Backend & API Contracts
- Supabase Project Ref: `nwcatvlfoayzrwatvyrf`
- Primary Identity: `auth.users.id` (1:1 mapping across Web, iOS, and Android)
- Protected Endpoints: `/api/create-order`, `/api/verify-payment`, `/api/gemini`
