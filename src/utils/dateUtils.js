/**
 * Utility functions for 24-hour (1 full day) log cycle, local region date formatting, and midnight auto-rollover.
 */

/**
 * Returns today's formatted local region date string (YYYY-MM-DD).
 * @param {Date} [d=new Date()]
 * @returns {string}
 */
export const getTodayDateString = (d = new Date()) => {
  const target = d instanceof Date && !isNaN(d.getTime()) ? d : new Date();
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converts any timestamp or date object into a local region date string (YYYY-MM-DD).
 * @param {number|string|Date} timestamp
 * @returns {string}
 */
export const formatDateToLocalString = (timestamp) => {
  if (!timestamp) return getTodayDateString();
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return getTodayDateString();
  return getTodayDateString(d);
};

/**
 * Returns the 0-indexed day of the week for local region time (Monday=0, Tuesday=1 ... Sunday=6).
 * @param {Date} [d=new Date()]
 * @returns {number}
 */
export const getLocalDayOfWeekIndex = (d = new Date()) => {
  const day = d.getDay(); // 0=Sunday, 1=Monday... 6=Saturday
  return (day + 6) % 7;
};

/**
 * Checks if a given timestamp or date string is within today's local region calendar day.
 * @param {number|string|Date} timestamp 
 * @returns {boolean}
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false;
  return formatDateToLocalString(timestamp) === getTodayDateString();
};

/**
 * Checks if a timestamp matches a target local region date string (YYYY-MM-DD).
 * @param {number|string|Date} timestamp
 * @param {string} dateStr
 * @returns {boolean}
 */
export const isSameLocalDate = (timestamp, dateStr) => {
  if (!timestamp || !dateStr) return false;
  return formatDateToLocalString(timestamp) === dateStr;
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
 * Filters an array of log items to only those logged today in the local region time.
 * @param {Array} logs 
 * @returns {Array}
 */
export const filterLogsForToday = (logs = []) => {
  if (!Array.isArray(logs)) return [];
  return logs.filter((log) => isToday(log.timestamp || log.created_at || log.date));
};
