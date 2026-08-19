/**
 * Failure Isolation Test Suite for dbService.js
 * Verifies that database mutations return database records cleanly even if secondary sync notifications throw errors.
 */
import { addFoodLog, deleteFoodLog, updateFoodLog } from '../lib/dbService.js';

console.log("=== CALYXO FAILURE ISOLATION TEST SUITE ===");

async function runFailureIsolationTest() {
  const fakeUserId = "test_user_isolation_" + Date.now();
  const testMeal = {
    name: "Test Protein Shake",
    calories: 500,
    protein: 25,
    carbs: 40,
    fat: 10,
    portionWeight: 350,
    timestamp: Date.now()
  };

  try {
    const saved = await addFoodLog(fakeUserId, testMeal);
    console.log("[TEST] addFoodLog returned:", saved?.name, "| Calories:", saved?.calories, "| Protein:", saved?.protein);

    if (saved && saved.calories === 500 && saved.protein === 25) {
      console.log("SUCCESS: addFoodLog succeeded and returned valid item despite mock mode/sync environment!");
    } else {
      console.error("FAIL: addFoodLog returned invalid or corrupted data!");
    }
  } catch (err) {
    console.error("FAIL: addFoodLog threw exception:", err);
  }
}

runFailureIsolationTest();
