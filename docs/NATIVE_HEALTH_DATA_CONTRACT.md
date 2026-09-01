# CALYXO — NATIVE HEALTH DATA CONTRACT & NORMALIZATION SPECIFICATION

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 4B — Normalized Health Data & Sensor Arbitration Contract  
**Platforms Covered**: iOS (HealthKit & CoreMotion), Android (Health Connect & SensorManager)  
**Date**: August 28, 2026  

---

## 1. Unified Normalized Health Snapshot Model

```text
struct NativeHealthSnapshot {
    let timestamp: Date                 // ISO timestamp of snapshot generation
    let steps: Int                      // Daily cumulative step count (>= 0)
    let distanceKm: Double              // Daily cumulative distance in kilometers (>= 0.0)
    let activeCalories: Int             // Daily active energy burned in kilocalories (>= 0)
    let heartRateBpm: Int?              // Latest heart rate in BPM (null when disconnected/unavailable)
    let restingHeartRateBpm: Int?       // Daily resting heart rate in BPM (null if not measured)
    let hrvMs: Double?                  // Heart Rate Variability SDNN in milliseconds (null if not measured)
    let sleepHours: Double              // Sleep duration in hours (>= 0.0)
    let weightKg: Double                // Latest recorded body mass in kg (0.0 if not logged)
    let vo2Max: Double?                 // Cardiorespiratory fitness score (null if not recorded)
    let source: HealthSource            // Primary originating hardware source
    let permissionState: PermissionState// Granular OS permission state
    let freshness: DataFreshness        // LIVE (<1m), RECENT (<10m), STALE (<24h), UNAVAILABLE
}
```

---

## 2. Health Source Hierarchy & Precedence Rules

To prevent conflicting or duplicate double-counted steps and energy metrics, native clients enforce strict source precedence:

```
                                  HEALTH DATA REQUEST
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
             iOS Platform                                  Android Platform
                  │                                               │
    1. Primary: Apple HealthKit                     1. Primary: Android Health Connect
       (`HKStatisticsQuery.cumulativeSum`)             (`StepsRecord`, `ActiveCaloriesBurnedRecord`)
                  │                                               │
            [Unavailable / 0]                               [Unavailable / 0]
                  │                                               │
                  ▼                                               ▼
    2. Fallback: CoreMotion Pedometer               2. Fallback: Hardware SensorManager
       (`CMPedometer.queryPedometerData`)              (`Sensor.TYPE_STEP_COUNTER`)
                  │                                               │
            [Unavailable / 0]                               [Unavailable / 0]
                  │                                               │
                  ▼                                               ▼
    3. Terminal State: Zero Metrics                 3. Terminal State: Zero Metrics
       (Steps: 0, State: `NO_DATA`)                    (Steps: 0, State: `NO_DATA`)
```

---

## 3. Data Freshness Classification Contract

Every biometric reading is classified by its age delta from the current system clock:

| Freshness Level | Age Window | UI Semantic State | Action Trigger |
| :--- | :--- | :--- | :--- |
| **`LIVE`** | $< 60\text{ seconds}$ | Pulsing Green Badge | Active real-time display |
| **`RECENT`** | $1\text{ min} - 10\text{ mins}$ | Solid Green Badge | Normal authenticated display |
| **`STALE`** | $10\text{ mins} - 24\text{ hours}$| Subtle Grey Badge | Triggers background observer query |
| **`EXPIRED`** | $> 24\text{ hours}$ | Amber Stale Banner | Prompts user to sync device |
| **`UNAVAILABLE`** | Missing or disconnected | Dash (`--`) / `NO_DATA` | Hides graph; zero fake numbers |

---

## 4. Zero-Fake-Data Contract

Under **zero circumstances** does the Calyxo native health layer generate synthetic, simulated, randomized, or mock numbers in production code:

1. **Disconnected BLE Heart Rate**: If the peripheral disconnects, the stream immediately emits `nil` / `null`. It **never** falls back to 72 BPM.
2. **Missing Sleep Analysis**: If neither Apple Health nor nighttime phone inactivity detects sleep, `sleepHours` is `0.0` with state `NO_DATA`. It **never** invents an 8.0-hour baseline.
3. **Empty Step Count**: If the user has not moved or permissions are denied, `steps` is `0`. It **never** displays demo steps.

---

## 5. Direct WidgetKit & ActivityKit Integration

```
[Apple HealthKit Store] ──► [HKObserverQuery (Immediate)] ──► [HealthKitManager.swift]
                                                                      │
                                                                      ▼
                                                          [App Group UserDefaults]
                                                      (group.com.supreethkiran.calyxo)
                                                                      │
                                                                      ▼
                                                          [WidgetKit WidgetCenter]
                                                         `reloadAllTimelines()`
```

- Eliminates JavaScript bridge roundtrips.
- Home Screen and Lock Screen widgets update within seconds of Apple Watch health sync.
