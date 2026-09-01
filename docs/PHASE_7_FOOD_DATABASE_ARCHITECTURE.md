# CALYXO — PHASE 7 FOOD DATABASE ARCHITECTURE SPECIFICATION

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 7 — Native Food Database & Search Architecture  
**Platforms Covered**: iOS (Swift / SQLite FTS5 / SwiftData), Android (Room / SQLite FTS4)  
**Date**: August 28, 2026  

---

## 1. Native Food Search & Indexing Engine

To achieve instant sub-millisecond search performance on mobile devices without blowing up RAM:

```text
[Athlete Types: "chick"]
          │
          ▼
[Native Prefix & Fuzzy Tokenizer]
          │
          ▼
[Indexed SQLite FTS5 / In-Memory Dictionary]
          │
          ▼
[Ranked Matching Foods Array]
1. Chicken Breast (Raw) - 165 kcal / 31.0g P / 0.0g C / 3.6g F
2. Chicken Thigh (Cooked) - 209 kcal / 26.0g P / 0.0g C / 10.9g F
3. Chickpeas (Cooked) - 164 kcal / 8.9g P / 27.4g C / 2.6g F
```

---

## 2. Zero-Fake Food Data Enforcement

1. **Deterministic Micronutrient Lookups**: All food entries use certified USDA FoodData Central / calibrated standard nutritional profiles.
2. **Strict Scaling Rules**: Any fractional serving (e.g. 125.5g) is scaled mathematically with 1-decimal-place precision; no roundoff drift.
3. **Offline Ingestion**: Pre-indexed curated dataset embedded natively on-device, enabling 100% offline food lookup without network connectivity.
