# CALYXO — PHASE 5 NATIVE PRODUCT ARCHITECTURE SPECIFICATION

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 5 — Native Product Shell & Architecture Blueprint  
**Architecture Layers**: Presentation (SwiftUI / Compose), Domain (Repositories), Data (Supabase PostgREST), Platform (HealthKit / Health Connect / BLE)  
**Date**: August 28, 2026  

---

## 1. Native Product Layer Diagram

```mermaid
graph TD
    subgraph PresentationLayer["1. Native Presentation Layer (SwiftUI / Compose)"]
        NavCoord["CalyxoNativeNavigationCoordinator"]
        DashView["CalyxoNativeDashboardView (Quad Rings + Health HUD)"]
        ProfView["CalyxoNativeProfileView (Athlete Biometrics & Tier)"]
        QuickHydrate["Quick Hydration Bar (+250ml / +500ml)"]
        DesignTokens["CalyxoDesignTokens (#050507, #CCFF00, Glass Cards)"]
    end

    subgraph DomainRepositories["2. Native Domain & Repository Layer"]
        UserRepo["UserProfileRepository"]
        WaterRepo["WaterRepository (Optimistic Write + Outbox)"]
        SubRepo["SubscriptionRepository"]
        HealthRepo["HealthRepository"]
    end

    subgraph NativePlatformEngines["3. Native Hardware & OS Engines"]
        HKManager["CalyxoNativeHealthKitManager (Apple HealthKit + CoreMotion)"]
        HCManager["CalyxoNativeHealthConnectManager (Health Connect + SensorManager)"]
        BLEManager["CalyxoNativeBluetoothManager (9-State FSM + 0x2A37 Parser)"]
        WatchManager["CalyxoWatchSessionManager (WatchConnectivity)"]
        KeychainStorage["CalyxoKeychainStorage / CalyxoSecureStorage"]
    end

    subgraph SupabaseBackend["4. Production Supabase Backend (PostgreSQL)"]
        GoTrue["/auth/v1/token (Same User UUIDs)"]
        PostgREST["/rest/v1/ (user_profiles, water_logs, subscriptions)"]
        RLS["Row Level Security (auth.uid() = id)"]
    end

    NavCoord --> DashView
    NavCoord --> ProfView
    DashView --> QuickHydrate
    DashView --> DesignTokens

    DashView --> UserRepo
    DashView --> WaterRepo
    DashView --> HealthRepo
    ProfView --> UserRepo
    ProfView --> SubRepo

    HealthRepo --> HKManager
    HealthRepo --> HCManager
    HealthRepo --> BLEManager
    UserRepo --> KeychainStorage

    UserRepo --> PostgREST
    WaterRepo --> PostgREST
    SubRepo --> PostgREST
    KeychainStorage --> GoTrue
    PostgREST --> RLS
```

---

## 2. First Native Write Operation Architecture (Water Logging)

```text
[Athlete Taps '+250ml']
          │
          ▼
[1. Optimistic Local State Update] ──► Dashboard UI reflects +250ml immediately
          │
          ▼
[2. Build PostgREST JSON Payload]
{
  "userId": "d3b07384-d113-40a1-8636-4076e01a8ef1",
  "amount_ml": 250,
  "logged_at": "2026-08-28T18:30:00Z"
}
          │
          ▼
[3. Authenticated HTTP POST /rest/v1/water_logs]
   Header: Authorization: Bearer <Supabase JWT>
   Header: apikey: <Supabase Anon Key>
          │
    ┌─────┴────────────────────────────────┐
    ▼                                      ▼
[Online Success: 201 Created]        [Network Failure / Offline]
Record committed to PostgreSQL       Payload queued into Local Outbox
                                     Automatic retry on network reconnect
```
