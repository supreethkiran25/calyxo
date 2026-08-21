/**
 * Universal Central Streak Engine for Calyxo
 * Computes exact consecutive-day streaks from authoritative database log timestamps:
 * - Login Streak
 * - Workout Streak
 * - Nutrition Streak
 * - Water Streak
 */
import { getTodayDateString, parseSafeDate } from './dateUtils.js';

/**
 * Calculates consecutive-day streak from a list of log timestamps or date objects.
 * @param {Array<number|string|Date>} timestampsList 
 * @param {string} [todayStr=getTodayDateString()] 
 * @returns {number}
 */
export function calculateConsecutiveDaysStreak(timestampsList = [], todayStr = getTodayDateString()) {
  if (!Array.isArray(timestampsList) || timestampsList.length === 0) return 0;

  // Collect unique local date strings (YYYY-MM-DD)
  const dateSet = new Set();
  timestampsList.forEach(ts => {
    if (!ts) return;
    const d = parseSafeDate(ts);
    if (d && !isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateSet.add(`${year}-${month}-${day}`);
    }
  });

  const sortedDates = Array.from(dateSet).sort().reverse();
  if (sortedDates.length === 0) return 0;

  const today = parseSafeDate(todayStr + 'T00:00:00');
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Check if today or yesterday is present in sorted dates
  let curr = null;
  if (sortedDates.includes(todayStr)) {
    curr = new Date(today.getTime());
  } else if (sortedDates.includes(yesterdayStr)) {
    curr = new Date(yesterday.getTime());
  }

  if (!curr) return 0; // Streak broken if neither today nor yesterday has a log

  let streak = 0;
  while (true) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    const expectedStr = `${year}-${month}-${day}`;

    if (sortedDates.includes(expectedStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates consecutive-day water streak based on completing daily water target.
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
    const ts = w.timestamp || w.created_at || w.date;
    const d = parseSafeDate(ts);
    if (d && !isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
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
