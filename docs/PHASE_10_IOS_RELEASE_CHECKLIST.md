# CALYXO — PHASE 10 iOS APP STORE RELEASE STAGING CHECKLIST

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Target**: iOS App Store & TestFlight Distribution  
**Bundle ID**: `com.calyxo.app`  
**Date**: August 28, 2026  

---

## 1. Code Signing & Provisioning

- [ ] **Apple Developer Team**: Associated with production organization account.
- [ ] **Distribution Certificate**: Valid Apple Distribution Certificate generated in Apple Developer Portal.
- [ ] **App Store Provisioning Profile**: Generated with `com.calyxo.app` and matching App Group `group.com.calyxo.app`.
- [ ] **Signing Status**: `BLOCKED — HUMAN ACTION REQUIRED` (Certificates & signing keys must be installed in Xcode keychain).

---

## 2. Entitlements & Capabilities

- [x] **HealthKit**:
  - `com.apple.developer.healthkit`: Enabled
  - `com.apple.developer.healthkit.access`: Read & Write authorized
- [x] **App Groups**:
  - `group.com.calyxo.app`: Enables WidgetKit & Dynamic Island shared container access
- [x] **Background Modes**:
  - `bluetooth-central`: Background BLE heart rate monitoring
  - `processing`: Background HealthKit observer queries
  - `remote-notification`: APNs push notifications
- [x] **ActivityKit**:
  - `NSSupportsLiveActivities`: Enabled for workout rest timer Live Activity

---

## 3. Mandatory Info.plist Privacy Descriptions

- [x] `NSHealthShareUsageDescription`: "Calyxo uses HealthKit to read your daily steps, active energy, and sleep duration to calculate your readiness score."
- [x] `NSHealthUpdateUsageDescription`: "Calyxo syncs completed workouts and active calories back to Apple Health."
- [x] `NSBluetoothAlwaysUsageDescription`: "Calyxo connects directly to Bluetooth heart-rate monitors to capture real-time biometric telemetry during workouts."
- [x] `NSMotionUsageDescription`: "Calyxo accesses motion data to track workout cadence and step count."

---

## 4. Deep-Link & URL Schemes

- [x] **Custom URL Scheme**: `calyxo://`
- [x] **Auth Callback**: `calyxo://auth/callback`
