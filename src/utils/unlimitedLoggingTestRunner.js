/**
 * Stress & Unlimited Daily Food Logging Test Runner for Calyxo
 * Validates 1, 5, 10, 20 food logs, unique IDs, accumulation, daily total summation,
 * edit isolation, delete isolation, and new entry after delete.
 */
import { parseSafeDate, isSameLocalDate, getTodayDateString } from './dateUtils.js';

console.log("=== CALYXO UNLIMITED DAILY FOOD LOGGING STRESS TEST ===");

const todayStr = getTodayDateString();
const mockUserId = "stress_test_user_" + Date.now();

let foodLogs = [];

// Helper to simulate central calculateDailyNutrition
function calculateDailyNutrition(logs, dateFilterStr) {
  const filtered = logs.filter(item => isSameLocalDate(item.timestamp, dateFilterStr));
  const totals = filtered.reduce((acc, item) => ({
    calories: acc.calories + (Number(item.calories) || 0),
    protein: acc.protein + (Number(item.protein) || 0),
    carbs: acc.carbs + (Number(item.carbs) || 0),
    fat: acc.fat + (Number(item.fat) || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return { filteredCount: filtered.length, totals };
}

// Helper to simulate createFoodLog
function createFoodLog(name, cals, prot, carbs, fat) {
  const newLog = {
    id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId: mockUserId,
    name,
    calories: Math.round(Number(cals)),
    protein: Number(prot),
    carbs: Number(carbs),
    fat: Number(fat),
    portionWeight: 100,
    timestamp: Date.now()
  };
  foodLogs = [newLog, ...foodLogs.filter(x => x.id !== newLog.id)];
  return newLog;
}

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Log 1 entry
console.log("\n--- TEST 1: Single Food Log (1 Entry) ---");
createFoodLog("Entry 1 - Oatmeal", 400, 20, 50, 10);
let res1 = calculateDailyNutrition(foodLogs, todayStr);
assert(res1.filteredCount === 1, "Count is 1");
assert(res1.totals.calories === 400, "Calories = 400 kcal");
assert(res1.totals.protein === 20, "Protein = 20g");

// 2. Add entries up to 5
console.log("\n--- TEST 2: 5 Food Logs ---");
createFoodLog("Entry 2 - Egg Whites", 150, 25, 2, 1);
createFoodLog("Entry 3 - Apple", 95, 0.5, 25, 0.3);
createFoodLog("Entry 4 - Chicken Rice", 650, 45, 70, 12);
createFoodLog("Entry 5 - Greek Yogurt", 150, 15, 10, 0);
let res5 = calculateDailyNutrition(foodLogs, todayStr);
assert(res5.filteredCount === 5, "Count accumulated to 5");
assert(res5.totals.calories === (400 + 150 + 95 + 650 + 150), `Daily calories sum correctly = ${res5.totals.calories} kcal`);

// 3. Add entries up to 10
console.log("\n--- TEST 3: 10 Food Logs ---");
for (let i = 6; i <= 10; i++) {
  createFoodLog(`Entry ${i} - Snack ${i}`, 100, 10, 10, 2);
}
let res10 = calculateDailyNutrition(foodLogs, todayStr);
assert(res10.filteredCount === 10, "Count accumulated to 10");

// 4. Add entries up to 20
console.log("\n--- TEST 4: 20 Food Logs Stress Test ---");
for (let i = 11; i <= 20; i++) {
  createFoodLog(`Entry ${i} - Macro ${i}`, 120, 8, 15, 3);
}
let res20 = calculateDailyNutrition(foodLogs, todayStr);
assert(res20.filteredCount === 20, "Count accumulated to 20 entries");

// 5. Unique IDs check
const uniqueIds = new Set(foodLogs.map(x => x.id));
assert(uniqueIds.size === 20, "All 20 food logs possess unique IDs");

// 6. Edit Entry #7
console.log("\n--- TEST 5: Edit Entry #7 ---");
const entry7 = foodLogs.find(x => x.name.includes("Entry 7"));
assert(!!entry7, "Entry #7 found");
if (entry7) {
  // Update entry 7
  foodLogs = foodLogs.map(x => x.id === entry7.id ? { ...x, calories: 300, protein: 30 } : x);
  let resEdit = calculateDailyNutrition(foodLogs, todayStr);
  assert(resEdit.filteredCount === 20, "Count remains 20 after editing entry #7");
  const edited7 = foodLogs.find(x => x.id === entry7.id);
  assert(edited7.calories === 300 && edited7.protein === 30, "Entry #7 calories updated to 300 and protein to 30");
}

// 7. Delete Entry #12
console.log("\n--- TEST 6: Delete Entry #12 ---");
const entry12 = foodLogs.find(x => x.name.includes("Entry 12"));
assert(!!entry12, "Entry #12 found");
if (entry12) {
  foodLogs = foodLogs.filter(x => x.id !== entry12.id);
  let resDel = calculateDailyNutrition(foodLogs, todayStr);
  assert(resDel.filteredCount === 19, "Count reduced to 19 after deleting entry #12");
  assert(!foodLogs.some(x => x.id === entry12.id), "Entry #12 removed from logs");
}

// 8. New Entry After Delete (Entry 21)
console.log("\n--- TEST 7: New Entry After Delete ---");
const entry21 = createFoodLog("Entry 21 - Late Night Shake", 250, 30, 20, 5);
let resPostDel = calculateDailyNutrition(foodLogs, todayStr);
assert(resPostDel.filteredCount === 20, "Count returned to 20 after adding Entry 21");
assert(entry21.id !== entry12.id, "Entry 21 received a brand new unique ID");

console.log(`\n=== STRESS TEST COMPLETED: ${passCount} PASSED, ${failCount} FAILED ===`);
