/**
 * Unit Test Verification Suite for dateUtils.js
 * Tests parseSafeDate(), isToday(), and isSameLocalDate() across all input formats.
 */
import { parseSafeDate, isToday, isSameLocalDate, getTodayDateString } from './dateUtils.js';

console.log("=== CALYXO DATE UTILS UNIT TEST SUITE ===");

const todayStr = getTodayDateString();
console.log(`[TEST] Target Today Local Date String: "${todayStr}"`);

const testCases = [
  { input: "1784022044000", desc: "Numeric string millisecond timestamp" },
  { input: 1784022044000, desc: "Numeric millisecond timestamp" },
  { input: "1784022044", desc: "Numeric string 10-digit second timestamp" },
  { input: 1784022044, desc: "Numeric 10-digit second timestamp" },
  { input: new Date().toISOString(), desc: "ISO string with Z offset" },
  { input: `${todayStr}T12:00:00+05:30`, desc: "ISO string with explicit timezone offset" },
  { input: todayStr, desc: "YYYY-MM-DD date string" },
  { input: `${todayStr} 14:30:00`, desc: "YYYY-MM-DD HH:mm:ss date string (Safari format)" },
  { input: new Date(), desc: "Native Date object" },
  { input: null, desc: "null" },
  { input: undefined, desc: "undefined" },
  { input: "invalid_random_string", desc: "Invalid string" },
  { input: NaN, desc: "NaN" },
  { input: Infinity, desc: "Infinity" }
];

let passCount = 0;
let failCount = 0;

testCases.forEach((tc, idx) => {
  try {
    const parsed = parseSafeDate(tc.input);
    const isValid = parsed instanceof Date && !isNaN(parsed.getTime());
    console.log(`Test #${idx + 1} (${tc.desc}): parsed = ${parsed.toISOString()} | Valid: ${isValid}`);
    if (isValid) {
      passCount++;
    } else {
      console.error(`FAIL: Test #${idx + 1} produced invalid date!`);
      failCount++;
    }
  } catch (err) {
    console.error(`FAIL: Test #${idx + 1} threw exception:`, err);
    failCount++;
  }
});

console.log("\n=== TESTING NUMERIC VS NUMERIC-STRING EQUIVALENCE ===");
const numTs = Date.now();
const strTs = String(numTs);

const parsedNum = parseSafeDate(numTs);
const parsedStr = parseSafeDate(strTs);

const isSameTime = parsedNum.getTime() === parsedStr.getTime();
console.log(`[TEST] parseSafeDate(${numTs}) === parseSafeDate("${strTs}"): ${isSameTime}`);
console.log(`[TEST] isToday(${numTs}) === isToday("${strTs}"): ${isToday(numTs) === isToday(strTs)}`);
console.log(`[TEST] isSameLocalDate(${numTs}, "${todayStr}") === isSameLocalDate("${strTs}", "${todayStr}"): ${isSameLocalDate(numTs, todayStr) === isSameLocalDate(strTs, todayStr)}`);

if (isSameTime && isToday(numTs) === isToday(strTs)) {
  console.log("SUCCESS: Numeric timestamp and numeric string timestamp produce IDENTICAL date results!");
  passCount++;
} else {
  console.error("FAIL: Discrepancy between numeric and numeric-string timestamp parsing!");
  failCount++;
}

console.log(`\n=== FINAL UNIT TEST RESULT: ${passCount} PASSED, ${failCount} FAILED ===`);
