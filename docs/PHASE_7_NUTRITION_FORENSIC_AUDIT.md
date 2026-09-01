# CALYXO — PHASE 7 NUTRITION ENGINE FORENSIC AUDIT

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 7 — Nutrition Subsystem Forensic Architecture & Trace Audit  
**Date**: August 28, 2026  

---

## 1. Trace of Existing Nutrition Lifecycle

```text
1. Daily Target Calculation:
   - File: src/utils/macroCalculator.js
   - Formula: Mifflin-St Jeor BMR:
     • Male: (10 * wkg) + (6.25 * hcm) - (5 * age) + 5
     • Female: (10 * wkg) + (6.25 * hcm) - (5 * age) - 161
     • TDEE = BMR * activityMultiplier (1.2 to 1.9)
     • Calorie Target = TDEE - 500 (Loss) / TDEE + 350 (Gain)
     • Protein = wkg * 2.0g/kg (or 2.2g/kg for high protein)
     • Fat = 25% of calories / 9 cal/g
     • Carbs = (Calorie Target - (Protein * 4 + Fat * 9)) / 4 cal/g

2. Food Database & Search:
   - File: src/data/foodsData.js (~5.4MB comprehensive food dictionary)
   - Parameters: `name`, `calories` (kcal/100g), `protein` (g/100g), `carbs` (g/100g), `fat` (g/100g), `portionWeight` (g)

3. Meal Logging Flow:
   - User searches food -> selects portion quantity (e.g. 150g) -> scales macros:
     • Scaled Cal = (Cal/100g) * (portion / 100)
     • Scaled Protein = (Protein/100g) * (portion / 100)
     • Scaled Carbs = (Carbs/100g) * (portion / 100)
     • Scaled Fat = (Fat/100g) * (portion / 100)

4. Supabase Persistence:
   - File: src/lib/dbService.js -> addFoodLog(userId, item)
   - Table: `food_logs`
   - Fields: `id`, `userId`, `name`, `calories`, `protein`, `carbs`, `fat`, `portionWeight`, `timestamp`

5. Daily Aggregation & Target Comparison:
   - Sums all `food_logs` matching the active day (00:00:00 to 23:59:59 local).
   - Computes remaining calories, protein, carbs, and fat relative to athlete targets.
```

---

## 2. Supabase `food_logs` Schema Contract

```sql
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL DEFAULT 0,
    protein NUMERIC NOT NULL DEFAULT 0,
    carbs NUMERIC NOT NULL DEFAULT 0,
    fat NUMERIC NOT NULL DEFAULT 0,
    "portionWeight" NUMERIC NOT NULL DEFAULT 100,
    timestamp BIGINT NOT NULL
);
```
