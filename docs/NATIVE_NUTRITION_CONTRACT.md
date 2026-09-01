# CALYXO — CANONICAL NATIVE NUTRITION DATA CONTRACT

**Platform**: Calyxo Unified Health Operating System (`CALYXOAPP`)  
**Specification Type**: Phase 7 — Canonical Dual-Platform Nutrition Domain Contract  
**Platforms Covered**: iOS (Swift / SwiftUI), Android (Kotlin / Jetpack Compose / Java)  
**Date**: August 28, 2026  

---

## 1. Canonical Food & Meal Entity Models

```text
struct FoodItem {
    let id: String                      // Canonical food ID (e.g. "grilled_chicken_breast")
    let name: String                    // Food display name
    let category: String                // Category: Poultry, Meat, Seafood, Dairy, Grain, Fruit, Veg
    let baseServingGrams: Double        // Default reference serving (typically 100.0g)
    let caloriesPer100g: Double         // Energy in kcal per 100g
    let proteinPer100g: Double          // Protein in grams per 100g
    let carbsPer100g: Double            // Carbohydrates in grams per 100g
    let fatPer100g: Double              // Fat in grams per 100g
}

struct LoggedFoodEntry {
    let id: UUID                        // Unique food log entry UUID
    let userId: UUID                    // Authenticated athlete UUID
    let name: String                    // Food display name
    let portionWeightGrams: Double      // Consumed portion in grams (>= 1.0)
    let calories: Int                   // Scaled total calories (kcal)
    let proteinGrams: Double            // Scaled total protein (g)
    let carbsGrams: Double              // Scaled total carbs (g)
    let fatGrams: Double                // Scaled total fat (g)
    let timestamp: Int64                // Milliseconds epoch timestamp
}

struct DailyMacroSummary {
    let totalCalories: Int
    let totalProteinGrams: Double
    let totalCarbsGrams: Double
    let totalFatGrams: Double
    let targetCalories: Int
    let targetProteinGrams: Double
    let targetCarbsGrams: Double
    let targetFatGrams: Double
    
    var remainingCalories: Int { max(0, targetCalories - totalCalories) }
    var remainingProtein: Double { max(0.0, targetProteinGrams - totalProteinGrams) }
    var remainingCarbs: Double { max(0.0, targetCarbsGrams - totalCarbsGrams) }
    var remainingFat: Double { max(0.0, targetFatGrams - totalFatGrams) }
}
```

---

## 2. Mathematical Scaling Formulas

Given a reference food item with values per 100g and a consumed portion $P$ (in grams):

$$\text{Scale Factor } S = \frac{P}{100.0}$$
$$\text{Calories} = \text{round}\left( \text{Calories}_{100\text{g}} \times S \right)$$
$$\text{Protein} = \text{round}\left( \text{Protein}_{100\text{g}} \times S \times 10 \right) / 10.0$$
$$\text{Carbs} = \text{round}\left( \text{Carbs}_{100\text{g}} \times S \times 10 \right) / 10.0$$
$$\text{Fat} = \text{round}\left( \text{Fat}_{100\text{g}} \times S \times 10 \right) / 10.0$$
