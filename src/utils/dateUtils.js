/**
 * Utility functions for 24-hour (1 full day) log cycle and date comparisons.
 */

/**
 * Checks if a given timestamp or date string is within the current calendar day.
 * @param {number|string|Date} timestamp 
 * @returns {boolean}
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Checks if a given timestamp is within the last 24 hours (86,400,000 ms).
 * @param {number|string|Date} timestamp 
 * @returns {boolean}
 */
export const isWithin24Hours = (timestamp) => {
  if (!timestamp) return false;
  const d = new Date(timestamp).getTime();
  if (isNaN(d)) return false;
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  return now - d < TWENTY_FOUR_HOURS && now - d >= 0;
};

/**
 * Returns today's formatted date string (YYYY-MM-DD) for consistency.
 * @returns {string}
 */
export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Filters an array of log items to only those logged today (within current 24h cycle).
 * @param {Array} logs 
 * @returns {Array}
 */
export const filterLogsForToday = (logs = []) => {
  if (!Array.isArray(logs)) return [];
  return logs.filter((log) => isToday(log.timestamp || log.created_at || log.date));
};
