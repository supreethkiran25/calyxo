# CALYXO — PHASE 7 NATIVE NUTRITION ARCHITECTURE SPECIFICATION

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 7 — Native Dual-Platform Nutrition Subsystem Architecture  
**Platforms Covered**: iOS (Swift / SwiftUI), Android (Kotlin / Jetpack Compose / Java)  
**Date**: August 28, 2026  

---

## 1. Native Dual-Platform Nutrition Architecture

```mermaid
graph TD
    subgraph NativePresentation["1. Native Nutrition UI Layer"]
        iOSNutrition["CalyxoNativeNutritionView (SwiftUI)"]
        AndroidNutrition["CalyxoNativeNutritionScreen (Compose)"]
        EnergyCard["Macro Energy Target & Progress Card"]
        SearchSheet["Interactive Food Search & Portion Sheet"]
        Timeline["Daily Meals Timeline & Deletion"]
    end

    subgraph NativeEngines["2. Native Nutrition Engines"]
        iOSEngine["CalyxoNativeNutritionEngine.swift"]
        AndroidEngine["CalyxoNativeNutritionEngine.java"]
        CuratedDB["Pre-Indexed Curated Food Database"]
        MacroCalculator["Portion & Macro Scaling Engine"]
    end

    subgraph SupabasePersistence["3. Data Persistence & Outbox"]
        PostgREST["POST /rest/v1/food_logs"]
        LocalOutbox["Local SQLite Outbox (Offline Queue)"]
        PostgreSQL["Supabase public.food_logs (PostgreSQL)"]
    end

    iOSNutrition --> iOSEngine
    AndroidNutrition --> AndroidEngine
    iOSNutrition --> EnergyCard
    iOSNutrition --> SearchSheet
    iOSNutrition --> Timeline

    iOSEngine --> CuratedDB
    iOSEngine --> MacroCalculator
    AndroidEngine --> CuratedDB
    AndroidEngine --> MacroCalculator

    iOSEngine --> PostgREST
    AndroidEngine --> PostgREST
    PostgREST --> LocalOutbox
    PostgREST --> PostgreSQL
```
