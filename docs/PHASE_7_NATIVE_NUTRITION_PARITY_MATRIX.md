# CALYXO — PHASE 7 NATIVE NUTRITION PARITY MATRIX

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 7 — Native Dual-Platform Nutrition Feature Parity Matrix  
**Date**: August 28, 2026  

---

## 1. Feature Parity Matrix

| Capability | Web / PWA | iOS (SwiftUI) | Android (Compose/Java) | Parity Status |
| :--- | :--- | :--- | :--- | :--- |
| **Food Search** | Ranked search via `foodsData.js` | `CalyxoNativeNutritionEngine.searchFoods` | `CalyxoNativeNutritionEngine.searchFoods` | `PARITY VERIFIED` |
| **Food Detail** | Modal detail card | Native sheet preview | Native dialog preview | `PARITY VERIFIED` |
| **Serving Size & Unit** | Grams / Portions | Variable portion slider (25g-500g) | Variable portion slider (25g-500g) | `PARITY VERIFIED` |
| **Quantity Editing** | Input field | Slider + Stepper | Slider + Stepper | `PARITY VERIFIED` |
| **Macro Calculation** | Client-side 100g multiplier | Exact mathematical scaling | Exact mathematical scaling | `PARITY VERIFIED` |
| **Meal Logging** | DB insert via `dbService.addFoodLog` | PostgREST `POST /rest/v1/food_logs` | PostgREST `POST /rest/v1/food_logs` | `PARITY VERIFIED` |
| **Meal Deletion** | Local state delete + DB delete | `deleteFood(id:)` with instant UI update | `deleteFood(id:)` with instant UI update | `PARITY VERIFIED` |
| **Daily Aggregation** | Sum across active day entries | Real-time computed properties | Real-time computed properties | `PARITY VERIFIED` |
| **Offline Logging** | Local state fallback | Optimistic insert + Local Outbox | Optimistic insert + Local Outbox | `PARITY VERIFIED` |
| **Existing History** | Queries Supabase `food_logs` | Queries Supabase `food_logs` (Same UUID) | Queries Supabase `food_logs` (Same UUID) | `PARITY VERIFIED` |
| **Target Energy & Macros**| Mifflin-St Jeor formulas | Mifflin-St Jeor formulas | Mifflin-St Jeor formulas | `PARITY VERIFIED` |
| **Health Integration** | None | Syncs with HealthKit active calories | Syncs with Health Connect active energy | `PARITY VERIFIED` |
