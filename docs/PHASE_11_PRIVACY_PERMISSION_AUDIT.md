# CALYXO — PHASE 11 PRIVACY & PERMISSION AUDIT

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 11 — Privacy Disclosures & Runtime Permission Audit  
**Date**: August 28, 2026  

---

## 1. Runtime Permissions Audit

### iOS Privacy & Entitlements
- `NSHealthShareUsageDescription`: Explains read access for steps, sleep, and active energy.
- `NSHealthUpdateUsageDescription`: Explains write access for completed workouts.
- `NSBluetoothAlwaysUsageDescription`: Explains BLE connection to heart rate sensors.
- `NSMotionUsageDescription`: Explains pedometer and cadence tracking.

### Android Privacy & Permissions
- `androidx.health.connect.client`: Health Connect aggregate queries.
- `android.permission.BODY_SENSORS`: Real-time optical HR tracking.
- `android.permission.BLUETOOTH_SCAN` & `BLUETOOTH_CONNECT`: BLE discovery and streaming.
- `android.permission.POST_NOTIFICATIONS`: Smart reminder notifications.
