/**
 * Universal Central Streak Engine for Calyxo
 * Pure Mathematical Reduction of Consecutive-Day Streaks:
 * - Login Streak: Consecutive days opening/logging into the app
 * - Workout Streak: Consecutive days with >= 1 completed workout
 * - Nutrition Streak: Consecutive days with >= 1 logged meal
 * - Water Streak: Consecutive days meeting daily hydration target
 */
import { getTodayDateString, parseSafeDate } from './dateUtils.js';

/**
 * Shifts a calendar date string (YYYY-MM-DD) by N days mathematically.
 * Handles month boundaries, leap years, and year rollovers accurately.
 * @param {string} dateStr - Format YYYY-MM-DD
 * @param {number} offsetDays - Integer (+1 for tomorrow, -1 for yesterday)
 * @returns {string} - Shifted YYYY-MM-DD
 */
export function shiftDays(dateStr, offsetDays = 0) {
  if (!dateStr || typeof dateStr !== 'string') dateStr = getTodayDateString();
  const parts = dateStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1] || 1;
  const d = parts[2] || 1;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + offsetDays);
  const resY = dt.getFullYear();
  const resM = String(dt.getMonth() + 1).padStart(2, '0');
  const resD = String(dt.getDate()).padStart(2, '0');
  return `${resY}-${resM}-${resD}`;
}

/**
 * Pure Mathematical Consecutive-Day Streak Algorithm.
 * 
 * Mathematical Definition:
 * Given a set of activity dates D and today's date T:
 * 1. If T in D: streak is consecutive days counting backward starting from T: T, T-1, T-2, ...
 * 2. If T not in D, but T-1 in D: streak is still active for today; count backward from T-1: T-1, T-2, ...
 * 3. If neither T nor T-1 in D: streak is 0 (broken).
 * 
 * @param {Array<number|string|Date|Object>} timestampsList 
 * @param {string} [todayStr=getTodayDateString()] 
 * @returns {number} Strict consecutive day streak count
 */
export function calculateConsecutiveDaysStreak(timestampsList = [], todayStr = getTodayDateString()) {
  if (!Array.isArray(timestampsList) || timestampsList.length === 0) return 0;

  // 1. Build distinct local date set up to today
  const dateSet = new Set();
  for (const item of timestampsList) {
    if (!item) continue;
    let dateStr = null;
    if (typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.trim())) {
      dateStr = item.trim();
    } else {
      const rawVal = typeof item === 'object' ? (item.timestamp || item.created_at || item.logged_at || item.date) : item;
      const d = parseSafeDate(rawVal);
      if (d && !isNaN(d.getTime())) {
        dateStr = getTodayDateString(d);
      }
    }
    if (dateStr && dateStr <= todayStr) {
      dateSet.add(dateStr);
    }
  }

  if (dateSet.size === 0) return 0;

  const yesterdayStr = shiftDays(todayStr, -1);

  let startOffset = 0;
  if (dateSet.has(todayStr)) {
    startOffset = 0;
  } else if (dateSet.has(yesterdayStr)) {
    startOffset = -1;
  } else {
    return 0; // Streak broken
  }

  let streak = 0;
  let offset = startOffset;
  while (true) {
    const targetDate = shiftDays(todayStr, offset);
    if (dateSet.has(targetDate)) {
      streak++;
      offset--;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates consecutive-day water streak based on achieving daily water target.
 * @param {Array<Object>} waterLogs 
 * @param {number} [waterTarget=2500] 
 * @param {string} [todayStr=getTodayDateString()] 
 * @returns {number}
 */
export function calculateWaterGoalStreak(waterLogs = [], waterTarget = 2500, todayStr = getTodayDateString()) {
  if (!Array.isArray(waterLogs) || waterLogs.length === 0) return 0;
  
  const dayTotals = new Map();
  waterLogs.forEach(w => {
    if (!w) return;
    const rawTs = w.timestamp || w.created_at || w.date;
    const d = parseSafeDate(rawTs);
    if (d && !isNaN(d.getTime())) {
      const dateKey = getTodayDateString(d);
      const amount = Number(w.amount || w.water || w.volume || 0);
      dayTotals.set(dateKey, (dayTotals.get(dateKey) || 0) + amount);
    }
  });

  const completedGoalDates = [];
  dayTotals.forEach((total, dateKey) => {
    if (total >= waterTarget) {
      completedGoalDates.push(dateKey);
    }
  });

  return calculateConsecutiveDaysStreak(completedGoalDates, todayStr);
}
