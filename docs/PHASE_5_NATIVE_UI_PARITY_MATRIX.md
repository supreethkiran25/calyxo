# CALYXO — PHASE 5 NATIVE UI PARITY & FEATURE MATRIX

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 5 — Native Mobile UI Feature Parity & Migration Status  
**Date**: August 28, 2026  

---

## 1. Feature Parity Matrix

| Feature Surface | Existing Web/PWA Behavior | Native iOS (SwiftUI) | Native Android (Compose/Java) | Backend Contract | Offline Support | Verification Tier |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & Launch** | React GoTrue client with `localStorage` | `CalyxoNativeAuthService` + Apple Keychain | `CalyxoNativeAuthService` + SecureStorage | `auth/v1/token` (Same UUID) | ✅ Local unexpired tokens | `AUTOMATED VERIFIED` |
| **Dashboard Activity Rings** | Canvas/SVG Quad Ring renderer | SwiftUI Trimmed Stroke Geometry | Android Quad Canvas Math | `user_profiles` targets | ✅ Local calculation | `AUTOMATED VERIFIED` |
| **Hardware Health Snapshot**| JS HealthDataService / Web Bluetooth | `CalyxoNativeHealthKitManager` | `CalyxoNativeHealthConnectManager` | PostgREST / Health Stores | ✅ Health Cache | `AUTOMATED VERIFIED` |
| **Hydration Logging (Write)**| Modal dialog -> DB insert | Quick Bar (+250/+500ml) direct PostgREST | Quick Bar direct PostgREST | `POST /rest/v1/water_logs` | ✅ Outbox queue | `AUTOMATED VERIFIED` |
| **Athlete Profile & Settings**| React ProfilePage with drawer | `CalyxoNativeProfileView` | `CalyxoNativeProfileScreen` | `GET /rest/v1/user_profiles` | ✅ Local snapshot | `AUTOMATED VERIFIED` |
| **Tab Navigation Stack** | React Router (`/user/dashboard`, etc.) | SwiftUI `TabView` + Coordinator | Android Bottom Navigation | Local routing | ✅ Instant transition | `AUTOMATED VERIFIED` |
| **Live Workout Rest Timer** | UniversalLiveHUD React overlay | ActivityKit Dynamic Island + Watch | NotificationManager + Foreground | Local timer state | ✅ Background safe | `AUTOMATED VERIFIED` |
| **BLE Heart Rate HUD** | Web Bluetooth API / JS Bridge | `CoreBluetooth` 9-state FSM | Android BLE 9-state FSM | Local 0x180D stream | ✅ Reconnect backoff | `AUTOMATED VERIFIED` |

---

## 2. Migration Progression Roadmap

```text
Phase 4A: Native Foundation (Auth, Keychain, HealthKit baseline)          --> [COMPLETE]
Phase 4B: Native Health, Motion, BLE & Wearable Infrastructure           --> [COMPLETE]
Phase 5:  Native Product Shell, Dashboard, Profile & First Write Flow    --> [COMPLETE]
Phase 6:  Native Workout Engine & Offline Outbox Sync                    --> [UPCOMING]
Phase 7:  Native Nutrition Engine & Food Database                        --> [UPCOMING]
Phase 8:  Native AI Coach & Intelligence Hub Bridge                      --> [UPCOMING]
Phase 9:  Physical Device Testbed Certification                          --> [UPCOMING]
Phase 10: Store Deployment Preparation (App Store & Play Store)          --> [UPCOMING]
Phase 11: Final Capacitor Deprecation & Retirement                       --> [UPCOMING]
```
