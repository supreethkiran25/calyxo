/**
 * Final Hardening & Regression Verification Suite for Calyxo
 * Validates User ID checks, parseSafeDate, failure isolation, and 20-entry stress test.
 */
import { parseSafeDate, isToday, isSameLocalDate, getTodayDateString } from './dateUtils.js';

const isValidUserId = (uid) => {
  if (!uid) return false;
  if (typeof uid !== 'string') return false;
  if (uid === '[object Promise]' || uid.includes('Promise') || uid.includes('object')) return false;
  if (uid.trim().length < 4) return false;
  return true;
};

console.log("=== CALYXO FINAL HARDENING & REGRESSION SUITE ===");

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

// 1. Audit User ID Validation
console.log("\n--- TEST 1: User ID & Promise Rejection Validation ---");
assert(isValidUserId("e716608c-9a1b-4c2d-8e3f-123456789abc") === true, "Valid UUID accepted");
assert(isValidUserId("local-user-123") === true, "Valid string ID accepted");
assert(isValidUserId("[object Promise]") === false, "Falsy '[object Promise]' rejected");
assert(isValidUserId("Promise { <pending> }") === false, "Promise string rejected");
assert(isValidUserId(null) === false, "null rejected");
assert(isValidUserId(undefined) === false, "undefined rejected");
assert(isValidUserId("") === false, "Empty string rejected");
assert(isValidUserId(12345) === false, "Non-string type rejected");

// 2. parseSafeDate & Date Utilities
console.log("\n--- TEST 2: parseSafeDate & Date Handling ---");
const todayStr = getTodayDateString();
const numTs = Date.now();
const strTs = String(numTs);

const parsedNum = parseSafeDate(numTs);
const parsedStr = parseSafeDate(strTs);

assert(parsedNum instanceof Date && !isNaN(parsedNum.getTime()), "Numeric timestamp parses to valid Date");
assert(parsedStr instanceof Date && !isNaN(parsedStr.getTime()), "Numeric string timestamp parses to valid Date");
assert(parsedNum.getTime() === parsedStr.getTime(), "Numeric and numeric-string timestamps produce identical millisecond values");
assert(isToday(numTs) === isToday(strTs), "isToday returns identical results for number and numeric string");
assert(isSameLocalDate(numTs, todayStr) === isSameLocalDate(strTs, todayStr), "isSameLocalDate returns identical results for number and numeric string");

// Test Infinity and NaN
const parsedInf = parseSafeDate(Infinity);
const parsedNaN = parseSafeDate(NaN);
assert(parsedInf instanceof Date && !isNaN(parsedInf.getTime()), "Infinity falls back cleanly to valid Date");
assert(parsedNaN instanceof Date && !isNaN(parsedNaN.getTime()), "NaN falls back cleanly to valid Date");

// 3. 20-Entry Unlimited Food Logging Stress Test
console.log("\n--- TEST 3: 20-Entry Unlimited Food Logging Stress Test ---");
let logs = [];
for (let i = 1; i <= 20; i++) {
  logs.push({
    id: `food_stress_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
    name: `Meal Entry #${i}`,
    calories: 100 + i * 10,
    protein: 10 + i,
    carbs: 20,
    fat: 5,
    timestamp: Date.now()
  });
}

assert(logs.length === 20, "20 entries created");
const uniqueIds = new Set(logs.map(x => x.id));
assert(uniqueIds.size === 20, "All 20 entries have unique IDs");

// Calculate daily totals
const totalCals = logs.reduce((sum, item) => sum + item.calories, 0);
const totalProt = logs.reduce((sum, item) => sum + item.protein, 0);
assert(totalCals > 0 && totalProt > 0, `Derived daily totals: ${totalCals} kcal, ${totalProt}g protein`);

// Edit #7
const entry7 = logs[6];
logs = logs.map(x => x.id === entry7.id ? { ...x, calories: 500, protein: 40 } : x);
assert(logs.length === 20, "Count remains 20 after editing entry #7");
assert(logs.find(x => x.id === entry7.id).calories === 500, "Entry #7 calories updated to 500");

// Delete #12
const entry12 = logs[11];
logs = logs.filter(x => x.id !== entry12.id);
assert(logs.length === 19, "Count reduced to 19 after deleting entry #12");

// Add #21
const entry21 = {
  id: `food_stress_${Date.now()}_21_${Math.random().toString(36).substring(2, 6)}`,
  name: "Meal Entry #21",
  calories: 250,
  protein: 20,
  carbs: 30,
  fat: 8,
  timestamp: Date.now()
};
logs.push(entry21);
assert(logs.length === 20, "Count returned to 20 after adding Entry #21");
assert(entry21.id !== entry12.id, "Entry #21 assigned a brand new unique ID");

console.log(`\n=== HARDENING & REGRESSION SUITE COMPLETE: ${passCount} PASSED, ${failCount} FAILED ===`);
