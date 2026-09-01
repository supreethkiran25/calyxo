# CALYXO — PHASE 6 NATIVE WORKOUT ENGINE ARCHITECTURE SPECIFICATION

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 6 — Native Dual-Platform Workout Subsystem Architecture  
**Platforms Covered**: iOS (Swift / SwiftUI / ActivityKit), Android (Kotlin / Jetpack Compose / Java)  
**Date**: August 28, 2026  

---

## 1. Native Dual-Platform Workout Architecture

```mermaid
graph TD
    subgraph NativePresentation["1. Native Workout UI Layer"]
        iOSView["CalyxoNativeWorkoutView (SwiftUI)"]
        AndroidView["CalyxoNativeWorkoutScreen (Compose)"]
        RestHUD["Native Rest Timer HUD (+30s / Skip)"]
        LiveVolume["Live Volume & Set Stats Indicator"]
    end

    subgraph NativeEngines["2. Native Workout Engines"]
        iOSEngine["CalyxoNativeWorkoutEngine.swift"]
        AndroidEngine["CalyxoNativeWorkoutEngine.java"]
        TimestampTimer["Absolute-Timestamp Rest Clock"]
        VolumeCalculator["Total Tonnage Accumulator"]
    end

    subgraph HardwareWearable["3. Hardware, Wearable & OS Integrations"]
        DynamicIsland["ActivityKit Live Activity (Dynamic Island)"]
        WatchSession["WatchConnectivity (WCSession to Apple Watch)"]
        BLECentral["CalyxoNativeBluetoothManager (Live Heart Rate 0x180D)"]
        Haptics["Native CoreHaptics / Vibrator Feedback"]
    end

    subgraph SupabaseSync["4. Supabase Data Layer & Outbox"]
        PostgREST["POST /rest/v1/workout_logs"]
        LocalOutbox["Local SQLite Outbox (Offline Resilience)"]
        PostgreSQL["Supabase public.workout_logs (PostgreSQL)"]
    end

    iOSView --> iOSEngine
    AndroidView --> AndroidEngine
    iOSView --> RestHUD
    iOSView --> LiveVolume

    iOSEngine --> TimestampTimer
    iOSEngine --> VolumeCalculator
    AndroidEngine --> TimestampTimer
    AndroidEngine --> VolumeCalculator

    iOSEngine --> DynamicIsland
    iOSEngine --> WatchSession
    iOSEngine --> BLECentral
    iOSEngine --> Haptics

    iOSEngine --> PostgREST
    AndroidEngine --> PostgREST
    PostgREST --> LocalOutbox
    PostgREST --> PostgreSQL
```

---

## 2. Dynamic Island & Apple Watch Live Set Mirroring

When an athlete taps "Done" on a set:
1. `completeSet(exerciseId, setId)` computes the new total volume.
2. `startRestTimer(seconds: 90)` sets an absolute target timestamp `Date() + 90s`.
3. `CalyxoWatchSessionManager.shared.sendWorkoutState()` broadcasts the active exercise name, set number, and countdown to the Apple Watch.
4. `CalyxoLiveActivity.swift` displays the active rest countdown on the iPhone Lock Screen and Dynamic Island.
5. Even if iOS suspends background execution, the rest timer calculates remaining time upon resume using the wall-clock delta without drift.
