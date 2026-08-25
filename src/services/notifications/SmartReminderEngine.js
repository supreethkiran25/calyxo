/**
 * Calyxo Smart User Logging Reminder Engine (Dynamic Intelligence & Cooldown System)
 *
 * Enforces:
 * 1. Context-Aware Evaluation based on user's real IANA timezone (Intl.DateTimeFormat).
 * 2. Absolute Theme Cooldown: Rolling 30-day history prevents repeating theme families or jokes.
 * 3. Semantic Deduplication: Shared theme families (e.g. COUCH_LAZINESS) block variants.
 * 4. User State Overrides: If user already logged water (>=250ml), completed workout, or hit steps -> REMINDER IS SUPPRESSED.
 * 5. Dynamic Zomato-Style Generation: Personalized, witty, punchy notifications generated from NotificationThemeLibrary.
 * 6. Multi-Platform Reliable Delivery: Integrates with Native iOS (Capacitor), Android, and Web Push Service Workers.
 * 7. State Invalidation: Immediately cancels pending OS notifications when the user completes the action.
 * 8. Notification Fatigue & Priority Management: P0 (Streak) > P1 (Water/Briefing) > P2 (Workout/Steps) > P3 (Marketing).
 * 9. Quiet Hours & Privacy Control: Respects user preferences and quiet hours.
 */

import { notificationManager, NOTIFICATION_CATEGORIES } from './CalyxoNotificationManager.js';
import {
  NOTIFICATION_THEMES,
  THEME_FAMILIES,
  filterAvailableThemes,
  pickThemeVariant
} from './NotificationThemeLibrary.js';

export const PRIVACY_LEVELS = {
  STANDARD: 'STANDARD',
  DETAILED: 'DETAILED',
  MINIMAL:  'MINIMAL'
};

export const NOTIFICATION_ANALYTICS_EVENTS = {
  SCHEDULED:  'SCHEDULED',
  SENT:       'SENT',
  DELIVERED:  'DELIVERED',
  OPENED:     'OPENED',
  DISMISSED:  'DISMISSED',
  SUPPRESSED: 'SUPPRESSED',
  CANCELLED:  'CANCELLED'
};

/**
 * Validates whether an entry qualifies as an authentic nutrition/meal log
 */
export function isQualifyingNutritionLog(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.action === 'VIEW_SCREEN') return false;

  const hasName = Boolean(entry.name || entry.food_name || entry.dish_name || entry.meal_type || entry.title);
  const hasNutrients = entry.calories !== undefined || entry.protein !== undefined || entry.carbs !== undefined || entry.fat !== undefined || entry.amount !== undefined;
  const hasTimestamp = Boolean(entry.timestamp || entry.created_at || entry.logged_at || entry.date);

  return Boolean(hasName && (hasNutrients || hasTimestamp));
}

/**
 * Validates whether an entry qualifies as an authentic workout log
 */
export function isQualifyingWorkoutLog(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.action === 'VIEW_SCREEN') return false;

  const hasName = Boolean(entry.name || entry.title || entry.workoutName || entry.type || entry.category);
  const hasActivity = entry.duration !== undefined || entry.calories !== undefined || entry.sets !== undefined || entry.exercises !== undefined;
  const hasTimestamp = Boolean(entry.timestamp || entry.created_at || entry.logged_at || entry.date);

  return Boolean(hasName && (hasActivity || hasTimestamp));
}

/**
 * Resolves local date string YYYY-MM-DD for a specific IANA timezone
 */
export function getLocalDateString(timestamp = Date.now(), timeZone = null) {
  const tz = timeZone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date(timestamp));
  } catch (e) {
    const d = new Date(timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/**
 * Resolves local hour, minute, and day of week (0=Sun, 1=Mon, ..., 6=Sat) in given timezone
 */
export function getLocalTimeParts(timestamp = Date.now(), timeZone = null) {
  const tz = timeZone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date(timestamp));
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

    const d = new Date(timestamp);
    // Approximate local day of week using formatted date
    const localDateStr = getLocalDateString(timestamp, tz);
    const localD = new Date(localDateStr + 'T12:00:00Z');
    const dayOfWeek = localD.getUTCDay();

    return { hour, minute, dayOfWeek, timeZone: tz };
  } catch (e) {
    const d = new Date(timestamp);
    return { hour: d.getHours(), minute: d.getMinutes(), dayOfWeek: d.getDay(), timeZone: 'UTC' };
  }
}

/**
 * Resolves local hour and minute from a schedule time string 'HH:MM'
 */
export function parseScheduleTime(timeStr, defH, defM) {
  if (!timeStr || typeof timeStr !== 'string') return { hour: defH, minute: defM };
  const parts = timeStr.split(':');
  if (parts.length < 2) return { hour: defH, minute: defM };
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return {
    hour: isNaN(h) ? defH : Math.min(23, Math.max(0, h)),
    minute: isNaN(m) ? defM : Math.min(59, Math.max(0, m))
  };
}

/**
 * Checks if current local time falls within configured Quiet Hours
 */
export function isWithinQuietHours({ localHour, quietHoursStart = 22, quietHoursEnd = 7 }) {
  if (quietHoursStart === quietHoursEnd) return false;
  if (quietHoursStart > quietHoursEnd) {
    return localHour >= quietHoursStart || localHour < quietHoursEnd;
  }
  return localHour >= quietHoursStart && localHour < quietHoursEnd;
}

/**
 * Base Reminder Rule Class
 */
export class BaseReminderRule {
  constructor({ id, name, category, defaultHour = 13, defaultMinute = 0, priority = 'P2' }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.defaultHour = defaultHour;
    this.defaultMinute = defaultMinute;
    this.priority = priority;
  }

  evaluate(context) {
    throw new Error('evaluate() must be implemented by rule subclass');
  }
}

/**
 * Morning Wake-Up & Daily Briefing Rule (Fires at user's configured wakeTime)
 */
export class MorningWakeBriefingRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'morning_wake_briefing',
      name: 'Morning Wake-Up & Daily Briefing',
      category: NOTIFICATION_CATEGORIES.BRIEFING,
      defaultHour: 6,
      defaultMinute: 30,
      priority: 'P1'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      userName = 'Athlete',
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.BRIEFING] === false) {
      return { shouldSend: false, reason: 'Morning briefing disabled in user preferences', dedupeKey };
    }

    const wakeTime = parseScheduleTime(schedule.wakeTime, this.defaultHour, this.defaultMinute);
    const wakeMins = wakeTime.hour * 60 + wakeTime.minute;
    const currentMins = hour * 60 + minute;
    if (currentMins < wakeMins || currentMins > wakeMins + 90) {
      return { shouldSend: false, reason: `Outside morning wake-up briefing window (${wakeTime.hour}:${String(wakeTime.minute).padStart(2, '0')})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: `🌅 Morning AI Briefing • ${userName}`,
      body: `⚡ Recovery & sleep intel summarized. Check your point-by-point directives for today!`,
      deepLink: '/user/dashboard',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'DASHBOARD' }
    };
  }
}

/**
 * Breakfast Logging Reminder Rule (Fires at user's configured breakfastTime)
 */
export class BreakfastLoggingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'breakfast_logging_reminder',
      name: 'Breakfast Logging Check',
      category: NOTIFICATION_CATEGORIES.NUTRITION,
      defaultHour: 8,
      defaultMinute: 30,
      priority: 'P1'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      todayNutritionLogs = context.todayNutritionLogs || context.foodLogs || [],
      userName = 'Athlete',
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.NUTRITION] === false) {
      return { shouldSend: false, reason: 'Nutrition reminders disabled in preferences', dedupeKey };
    }

    const bTime = parseScheduleTime(schedule.breakfastTime, this.defaultHour, this.defaultMinute);
    const bMins = bTime.hour * 60 + bTime.minute;
    const currentMins = hour * 60 + minute;
    if (currentMins < bMins || currentMins > bMins + 120) {
      return { shouldSend: false, reason: `Outside breakfast reminder window (${bTime.hour}:${String(bTime.minute).padStart(2, '0')})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasBreakfast = todayNutritionLogs.some(log => (log.meal_type || log.mealType) === 'breakfast');
    if (hasBreakfast) {
      return { shouldSend: false, reason: 'Breakfast already logged today', dedupeKey };
    }

    const breakfastThemes = [
      {
        title: `Aloo Paratha or Protein Oats? 🍳`,
        body: `No judgment from us ${userName}, just log your breakfast macros before the chai gets cold!`
      },
      {
        title: `Breakfast unlogged? 🥞 Metabolism is waiting!`,
        body: `Log your morning fuel now to kickstart energy and protein synthesis, ${userName}.`
      },
      {
        title: `Subah ka nashta logged hai kya? ☕`,
        body: `Hey ${userName}, 10 seconds to track your breakfast and keep your nutrition ring roaring!`
      },
      {
        title: `Breakfast Fuel Check 🍳`,
        body: `Log your breakfast macros to start the day with clean energy, ${userName}.`
      }
    ];
    const chosenTheme = breakfastThemes[(new Date().getDay() + (userName.length || 0)) % breakfastThemes.length];

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: chosenTheme.title,
      body: chosenTheme.body,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * Lunch Nutrition Logging Reminder Rule (Schedule-aware: lunchTime)
 */
export class NutritionLoggingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'nutrition_logging_reminder',
      name: 'Daily Lunch Nutrition Reminder',
      category: NOTIFICATION_CATEGORIES.NUTRITION,
      defaultHour: 13,
      defaultMinute: 0,
      priority: 'P1'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      todayNutritionLogs = context.todayNutritionLogs || context.foodLogs || [],
      streak = 0,
      privacyLevel = PRIVACY_LEVELS.STANDARD,
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set(),
      blockedFamilies = new Set(),
      blockedThemeIds = new Set(),
      blockedTitles = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute, dayOfWeek } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.NUTRITION] === false) {
      return { shouldSend: false, reason: 'Nutrition reminders disabled in user preferences', dedupeKey };
    }

    if (preferences.quietHoursEnabled && isWithinQuietHours({
      localHour: hour,
      quietHoursStart: preferences.quietHoursStart ?? 22,
      quietHoursEnd: preferences.quietHoursEnd ?? 7
    })) {
      return { shouldSend: false, reason: 'Suppressed by user quiet hours', dedupeKey };
    }

    const targetTime = parseScheduleTime(schedule.lunchTime, this.defaultHour, this.defaultMinute);
    const targetMins = targetTime.hour * 60 + targetTime.minute;
    const currentMins = hour * 60 + minute;
    if (currentMins < targetMins || currentMins > targetMins + 120) {
      return { shouldSend: false, reason: `Outside lunch reminder window (current local hour: ${hour})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasLoggedMeal = todayNutritionLogs.some(isQualifyingNutritionLog);
    if (hasLoggedMeal) {
      return { shouldSend: false, reason: 'User has already logged a qualifying meal today', dedupeKey };
    }

    let title = "Did you log lunch today? 🥗";
    let body = "Take 30 seconds to track your midday meal and hit your daily macro target.";

    if (privacyLevel === PRIVACY_LEVELS.MINIMAL) {
      body = "Don't forget to log today's meal.";
    } else if (streak > 1) {
      body = `Keep your ${streak}-day logging streak alive! Track your meal to stay on schedule.`;
    } else {
      const available = filterAvailableThemes({
        category: 'NUTRITION',
        dayOfWeek,
        blockedFamilies,
        blockedThemeIds
      });
      if (available.length > 0) {
        const selectedTheme = available[Math.abs((userId.length + dayOfWeek) % available.length)];
        const variant = pickThemeVariant(selectedTheme, `${userId}_${localDate}_nutrition`);
        title = variant.title;
        body = variant.body;
        return {
          shouldSend: true,
          dedupeKey,
          category: this.category,
          title,
          body,
          deepLink: '/user/nutrition',
          date: localDate,
          timeZone,
          themeId: selectedTheme.id,
          themeFamily: selectedTheme.family,
          tone: selectedTheme.tone,
          hookType: selectedTheme.hookType,
          ctaType: selectedTheme.ctaType,
          priority: this.priority,
          extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
        };
      }
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title,
      body,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * Snack / Pre-Workout Fuel Reminder Rule (Fires at user's configured snackTime)
 */
export class SnackLoggingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'snack_logging_reminder',
      name: 'Pre-Workout Snack Reminder',
      category: NOTIFICATION_CATEGORIES.NUTRITION,
      defaultHour: 17,
      defaultMinute: 0,
      priority: 'P2'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      todayNutritionLogs = context.todayNutritionLogs || context.foodLogs || [],
      userName = 'Athlete',
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.NUTRITION] === false) {
      return { shouldSend: false, reason: 'Nutrition reminders disabled in preferences', dedupeKey };
    }

    const sTime = parseScheduleTime(schedule.snackTime, this.defaultHour, this.defaultMinute);
    const sMins = sTime.hour * 60 + sTime.minute;
    const currentMins = hour * 60 + minute;
    if (currentMins < sMins || currentMins > sMins + 90) {
      return { shouldSend: false, reason: `Outside snack reminder window (${sTime.hour}:${String(sTime.minute).padStart(2, '0')})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasSnack = todayNutritionLogs.some(log => (log.meal_type || log.mealType) === 'snack');
    if (hasSnack) {
      return { shouldSend: false, reason: 'Snack already logged today', dedupeKey };
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: `Mid-Afternoon Fuel ☕`,
      body: `Keep your energy high before workout, ${userName}. Track your afternoon snack.`,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * Workout Logging Reminder Rule (Schedule-aware: workoutTime)
 */
export class WorkoutLoggingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'workout_logging_reminder',
      name: 'Scheduled Workout Reminder',
      category: NOTIFICATION_CATEGORIES.WORKOUT,
      defaultHour: 19,
      defaultMinute: 0,
      priority: 'P2'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      todayWorkoutLogs = context.workoutLogs || [],
      streak = 0,
      privacyLevel = PRIVACY_LEVELS.STANDARD,
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set(),
      blockedFamilies = new Set(),
      blockedThemeIds = new Set(),
      blockedTitles = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute, dayOfWeek } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.WORKOUT] === false) {
      return { shouldSend: false, reason: 'Workout reminders disabled in preferences', dedupeKey };
    }

    if (preferences.quietHoursEnabled && isWithinQuietHours({
      localHour: hour,
      quietHoursStart: preferences.quietHoursStart ?? 22,
      quietHoursEnd: preferences.quietHoursEnd ?? 7
    })) {
      return { shouldSend: false, reason: 'Suppressed by user quiet hours', dedupeKey };
    }

    const targetTime = parseScheduleTime(schedule.workoutTime, this.defaultHour, this.defaultMinute);
    const targetMins = targetTime.hour * 60 + targetTime.minute;
    const currentMins = hour * 60 + minute;
    if (currentMins < targetMins || currentMins > targetMins + 120) {
      return { shouldSend: false, reason: `Outside workout reminder window (current hour: ${hour})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasLoggedWorkout = todayWorkoutLogs.some(isQualifyingWorkoutLog);
    if (hasLoggedWorkout) {
      return { shouldSend: false, reason: 'User has already completed a workout today', dedupeKey };
    }

    let title = "Time to crush your workout! 🏋️";
    let body = "Hit your sets, close your activity rings, and log your session in Calyxo.";

    if (privacyLevel === PRIVACY_LEVELS.MINIMAL) {
      body = "Don't forget to log your workout.";
    } else {
      const available = filterAvailableThemes({
        category: 'WORKOUT',
        dayOfWeek,
        blockedFamilies,
        blockedThemeIds,
        blockedTitles,
        isWorkoutDone: false
      });
      if (available.length > 0) {
        const selectedTheme = available[Math.abs((userId.length + dayOfWeek + 1) % available.length)];
        const variant = pickThemeVariant(selectedTheme, `${userId}_${localDate}_workout`);
        title = variant.title;
        body = variant.body;
        return {
          shouldSend: true,
          dedupeKey,
          category: this.category,
          title,
          body,
          deepLink: '/user/workout',
          date: localDate,
          timeZone,
          themeId: selectedTheme.id,
          themeFamily: selectedTheme.family,
          tone: selectedTheme.tone,
          hookType: selectedTheme.hookType,
          ctaType: selectedTheme.ctaType,
          priority: this.priority,
          extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'WORKOUT' }
        };
      }
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title,
      body,
      deepLink: '/user/workout',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'WORKOUT' }
    };
  }
}

/**
 * Dinner Logging Reminder Rule (Fires at user's configured dinnerTime)
 */
export class DinnerLoggingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'dinner_logging_reminder',
      name: 'Dinner Macro Logging Check',
      category: NOTIFICATION_CATEGORIES.NUTRITION,
      defaultHour: 20,
      defaultMinute: 30,
      priority: 'P1'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      todayNutritionLogs = context.todayNutritionLogs || context.foodLogs || [],
      userName = 'Athlete',
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.NUTRITION] === false) {
      return { shouldSend: false, reason: 'Nutrition reminders disabled', dedupeKey };
    }

    const dTime = parseScheduleTime(schedule.dinnerTime, this.defaultHour, this.defaultMinute);
    const dMins = dTime.hour * 60 + dTime.minute;
    const currentMins = hour * 60 + minute;
    if (currentMins < dMins || currentMins > dMins + 120) {
      return { shouldSend: false, reason: `Outside dinner reminder window (${dTime.hour}:${String(dTime.minute).padStart(2, '0')})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasDinner = todayNutritionLogs.some(log => (log.meal_type || log.mealType) === 'dinner');
    if (hasDinner) {
      return { shouldSend: false, reason: 'Dinner already logged today', dedupeKey };
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: `Dinner Macro Check 🍽️`,
      body: `Finish strong today! Log your dinner to close your daily protein and calorie rings, ${userName}.`,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * 12:00 PM Midday Water Logging Reminder Rule
 */
export class MiddayWaterReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'midday_water_reminder',
      name: 'Daily 12:00 PM Midday Water Reminder',
      category: NOTIFICATION_CATEGORIES.HYDRATION,
      defaultHour: 12,
      defaultMinute: 0,
      priority: 'P1'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      waterIntake = 0,
      waterTarget = 3000,
      preferences = {},
      deliveredDedupeKeys = new Set(),
      blockedFamilies = new Set(),
      blockedThemeIds = new Set(),
      blockedTitles = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute, dayOfWeek } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.HYDRATION] === false) {
      return { shouldSend: false, reason: 'Hydration reminders disabled in preferences', dedupeKey };
    }

    if (preferences.quietHoursEnabled && isWithinQuietHours({
      localHour: hour,
      quietHoursStart: preferences.quietHoursStart ?? 22,
      quietHoursEnd: preferences.quietHoursEnd ?? 7
    })) {
      return { shouldSend: false, reason: 'Suppressed by user quiet hours', dedupeKey };
    }

    const currentMins = hour * 60 + minute;
    // Active window: 11:30 AM to 1:30 PM (690 - 810 mins)
    if (currentMins < 690 || currentMins > 810) {
      return { shouldSend: false, reason: `Outside 12:00 PM midday water window (current hour: ${hour})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    // If user has already logged any meaningful water (>= 250ml) before 12pm, suppress completely!
    if (waterIntake >= 250) {
      return { shouldSend: false, reason: 'User has already logged water today', dedupeKey };
    }

    let title = "Your water bottle is crying! 💧👀";
    let body = "It's past 12:00 PM and you haven't logged any water yet! Take a big gulp, save your hydration streak in 1 tap.";

    const available = filterAvailableThemes({
      category: 'HYDRATION',
      dayOfWeek,
      blockedFamilies,
      blockedThemeIds,
      blockedTitles,
      isWaterDone: false
    });

    let selectedTheme = null;
    if (available.length > 0) {
      selectedTheme = available[Math.abs((userId.length + dayOfWeek) % available.length)];
      const variant = pickThemeVariant(selectedTheme, `${userId}_${localDate}_water`);
      title = variant.title;
      body = variant.body;
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title,
      body,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      themeId: selectedTheme?.id,
      themeFamily: selectedTheme?.family,
      tone: selectedTheme?.tone,
      hookType: selectedTheme?.hookType,
      ctaType: selectedTheme?.ctaType,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * 4:30 PM Zomato-Style Witty & Viral Engagement Reminder Rule
 */
export class ZomatoViralMarketingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'viral_marketing_reminder',
      name: 'Viral Zomato-Style Engagement Reminder',
      category: NOTIFICATION_CATEGORIES.MARKETING || 'MARKETING',
      defaultHour: 16,
      defaultMinute: 30,
      priority: 'P3'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      todayWorkoutLogs = context.workoutLogs || [],
      preferences = {},
      deliveredDedupeKeys = new Set(),
      blockedFamilies = new Set(),
      blockedThemeIds = new Set(),
      blockedTitles = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute, dayOfWeek } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.MARKETING] === false) {
      return { shouldSend: false, reason: 'Marketing & engagement reminders disabled in preferences', dedupeKey };
    }

    if (preferences.quietHoursEnabled && isWithinQuietHours({
      localHour: hour,
      quietHoursStart: preferences.quietHoursStart ?? 22,
      quietHoursEnd: preferences.quietHoursEnd ?? 7
    })) {
      return { shouldSend: false, reason: 'Suppressed by user quiet hours', dedupeKey };
    }

    const currentMins = hour * 60 + minute;
    // Active Window: 4:30 PM to 6:30 PM (990 - 1110 mins)
    if (currentMins < 990 || currentMins > 1110) {
      return { shouldSend: false, reason: 'Outside 4:30 PM afternoon viral engagement window', dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasWorkoutDone = todayWorkoutLogs.some(isQualifyingWorkoutLog);

    // Filter available themes with strict day awareness and cooldown
    const available = filterAvailableThemes({
      category: 'ENGAGEMENT',
      dayOfWeek,
      blockedFamilies,
      blockedThemeIds,
      blockedTitles,
      isWorkoutDone: hasWorkoutDone
    });

    if (available.length === 0) {
      return { shouldSend: false, reason: 'No fresh un-cooled themes available for current window', dedupeKey };
    }

    const selectedTheme = available[Math.abs((userId.length + dayOfWeek + 3) % available.length)];
    const variant = pickThemeVariant(selectedTheme, `${userId}_${localDate}_viral`);

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: variant.title,
      body: variant.body,
      deepLink: '/user/dashboard',
      date: localDate,
      timeZone,
      themeId: selectedTheme.id,
      themeFamily: selectedTheme.family,
      tone: selectedTheme.tone,
      hookType: selectedTheme.hookType,
      ctaType: selectedTheme.ctaType,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'DASHBOARD' }
    };
  }
}

/**
 * 10:30 PM Daily Evening Briefing Reminder Rule
 */
export class DailyEveningBriefingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'daily_evening_briefing_reminder',
      name: 'Daily 10:30 PM Nightly AI Briefing',
      category: NOTIFICATION_CATEGORIES.BRIEFING || 'BRIEFING',
      defaultHour: 22,
      defaultMinute: 30,
      priority: 'P1'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      streak = 1,
      foodLogs = context.todayNutritionLogs || [],
      workoutLogs = context.todayWorkoutLogs || [],
      waterIntake = 0,
      stepCount = 0,
      stepGoal = 10000,
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set(),
      blockedFamilies = new Set(),
      blockedThemeIds = new Set(),
      blockedTitles = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false) {
      return { shouldSend: false, reason: 'Daily briefing disabled in preferences', dedupeKey };
    }

    if (preferences.quietHoursEnabled && isWithinQuietHours({
      localHour: hour,
      quietHoursStart: preferences.quietHoursStart ?? 22,
      quietHoursEnd: preferences.quietHoursEnd ?? 7
    })) {
      return { shouldSend: false, reason: 'Suppressed by user quiet hours', dedupeKey };
    }

    const sleepTime = parseScheduleTime(schedule.sleepTime, 23, 0);
    const targetHour = (sleepTime.hour - 1 + 24) % 24;
    const targetMinute = 30;

    if (hour < targetHour || (hour === targetHour && minute < targetMinute)) {
      return { shouldSend: false, reason: `Too early for evening briefing (target: ${targetHour}:${targetMinute})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasFood = foodLogs.some(isQualifyingNutritionLog);
    const hasWorkout = workoutLogs.some(isQualifyingWorkoutLog);
    const hasWater = waterIntake >= 250;
    const hasLoggedAnything = hasFood || hasWorkout || hasWater || stepCount > 0;
    const isAllComplete = hasFood && hasWorkout && hasWater;

    let targetThemeId = 'briefing_nothing_logged_rescue';
    let priority = 'P0';

    if (isAllComplete) {
      targetThemeId = 'briefing_elite_day_celebration';
      priority = 'P1';
    } else if (!hasWorkout && hasFood) {
      targetThemeId = 'briefing_missing_workout_rescue';
      priority = 'P0';
    } else if (!hasWater && hasFood) {
      targetThemeId = 'briefing_missing_water_rescue';
      priority = 'P1';
    } else if (hasLoggedAnything) {
      targetThemeId = 'briefing_elite_day_celebration';
      priority = 'P1';
    } else {
      targetThemeId = 'briefing_nothing_logged_rescue';
      priority = 'P0';
    }

    const theme = NOTIFICATION_THEMES.find(t => t.id === targetThemeId) || NOTIFICATION_THEMES.find(t => t.categories.includes('BRIEFING'));
    const variant = pickThemeVariant(theme, `${userId}_${localDate}_briefing`);

    let body = variant.body;
    if (hasLoggedAnything && !body.includes('streak')) {
      body = `Day complete! 🔥 Your ${streak}-day streak is secured. Tap to view your full nutrition, calories, and tomorrow's AI plan.`;
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: variant.title,
      body,
      deepLink: '/user/dashboard',
      date: localDate,
      timeZone,
      themeId: theme?.id,
      themeFamily: theme?.family,
      tone: theme?.tone,
      hookType: theme?.hookType,
      ctaType: theme?.ctaType,
      priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'DASHBOARD' }
    };
  }
}

/**
 * 8:30 PM Streak Protection Reminder Rule
 */
export class StreakProtectionReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'streak_protection_reminder',
      name: 'Daily Streak Protection Reminder',
      category: NOTIFICATION_CATEGORIES.STREAK || 'STREAK',
      defaultHour: 20,
      defaultMinute: 30,
      priority: 'P0'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      streak = 1,
      foodLogs = context.todayNutritionLogs || [],
      workoutLogs = context.todayWorkoutLogs || [],
      waterIntake = 0,
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour, minute } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.STREAK] === false) {
      return { shouldSend: false, reason: 'Streak reminders disabled in preferences', dedupeKey };
    }

    const sleepTime = parseScheduleTime(schedule.sleepTime, 23, 0);
    const targetHour = Math.max(19, sleepTime.hour - 2);
    const targetMinute = 30;

    if (hour < targetHour || (hour === targetHour && minute < targetMinute)) {
      return { shouldSend: false, reason: `Too early for streak protection reminder (target: ${targetHour}:${targetMinute})`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    const hasLoggedAnything = foodLogs.some(isQualifyingNutritionLog) || workoutLogs.some(isQualifyingWorkoutLog) || waterIntake > 0;
    if (hasLoggedAnything) {
      return { shouldSend: false, reason: 'User has already logged today, streak is safe', dedupeKey };
    }

    const theme = NOTIFICATION_THEMES.find(t => t.id === 'streak_midnight_alarm') || NOTIFICATION_THEMES.find(t => t.categories.includes('STREAK'));
    const variant = pickThemeVariant(theme, `${userId}_${localDate}_streak`);

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: variant.title,
      body: variant.body,
      deepLink: '/user/dashboard',
      date: localDate,
      timeZone,
      themeId: theme?.id,
      themeFamily: theme?.family,
      tone: theme?.tone,
      hookType: theme?.hookType,
      ctaType: theme?.ctaType,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'DASHBOARD' }
    };
  }
}

/**
 * Hydration Intake Target Reminder Rule
 */
export class HydrationReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'hydration_logging_reminder',
      name: 'Hydration Intake Reminder',
      category: NOTIFICATION_CATEGORIES.HYDRATION,
      defaultHour: 15,
      defaultMinute: 0,
      priority: 'P2'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      waterIntake = 0,
      waterTarget = 3000,
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.HYDRATION] === false) {
      return { shouldSend: false, reason: 'Hydration reminders disabled', dedupeKey };
    }

    if (hour < this.defaultHour) {
      return { shouldSend: false, reason: 'Too early for afternoon hydration check', dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    if (waterIntake >= waterTarget) {
      return { shouldSend: false, reason: 'Daily water target already reached', dedupeKey };
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: 'Hydration Check 💧',
      body: `You are at ${waterIntake}ml of your ${waterTarget}ml target. Grab a fresh glass of water!`,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * 24/7 Anytime Viral Marketing & Engagement Reminder Rule
 */
export class AnytimeViralMarketingRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'anytime_viral_marketing',
      name: '24/7 Anytime Viral Marketing & Engagement Hook',
      category: NOTIFICATION_CATEGORIES.MARKETING,
      defaultHour: 0,
      defaultMinute: 0,
      priority: 'P3'
    });
  }

  evaluate(context = {}) {
    return { shouldSend: false, reason: 'Anytime marketing rule disabled to prevent notification fatigue', dedupeKey: 'anytime_viral_marketing_disabled' };
  }
}

/**
 * Dynamic Anytime Hydration Gap Intelligence Rule
 * Calculates real-time water deficit and prompts whenever user falls behind progress pace.
 */
export class DynamicHydrationGapRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'dynamic_hydration_gap',
      name: 'Dynamic Hydration Gap Intelligence',
      category: NOTIFICATION_CATEGORIES.HYDRATION,
      defaultHour: 10,
      defaultMinute: 0,
      priority: 'P2'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      waterIntake = 0,
      waterTarget = 3000,
      schedule = {},
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour } = getLocalTimeParts(currentTimestamp, timeZone);
    const slot = Math.floor(hour / 3);
    const dedupeKey = `${this.id}_${userId}_${localDate}_slot${slot}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.HYDRATION] === false) {
      return { shouldSend: false, reason: 'Hydration reminders disabled', dedupeKey };
    }

    const wake = parseScheduleTime(schedule.wakeTime, 6, 30);
    const sleep = parseScheduleTime(schedule.sleepTime, 23, 0);

    if (hour < wake.hour || hour >= sleep.hour) {
      return { shouldSend: false, reason: 'Outside awake routine hours', dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Hydration check already delivered for this time slot', dedupeKey };
    }

    if (waterIntake >= waterTarget) {
      return { shouldSend: false, reason: 'Daily water target already reached (100%)', dedupeKey };
    }

    const awakeHoursTotal = Math.max(8, sleep.hour - wake.hour);
    const hoursAwake = Math.max(1, hour - wake.hour);
    const expectedIntake = Math.round((hoursAwake / awakeHoursTotal) * waterTarget);

    if (waterIntake >= expectedIntake - 200) {
      return { shouldSend: false, reason: 'Hydration is on track with daily progress pace', dedupeKey };
    }

    const remaining = Math.max(0, waterTarget - waterIntake);
    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: `Hydration Gap Alert 💧`,
      body: `You're at ${waterIntake.toLocaleString()}ml of your ${waterTarget.toLocaleString()}ml target (${remaining}ml remaining). Take a quick sip to close your ring!`,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * Dynamic Sedentary & Step Cadence Intelligence Rule
 * Calculates afternoon step progress against user's daily step goal.
 */
export class DynamicSedentaryStepPaceRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'dynamic_step_pace',
      name: 'Dynamic Step Cadence & Activity Nudge',
      category: NOTIFICATION_CATEGORIES.WORKOUT,
      defaultHour: 15,
      defaultMinute: 0,
      priority: 'P2'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      stepCount = 0,
      stepGoal = 10000,
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.WORKOUT] === false) {
      return { shouldSend: false, reason: 'Activity reminders disabled', dedupeKey };
    }

    if (hour < 14 || hour > 18) {
      return { shouldSend: false, reason: 'Outside afternoon activity window', dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Step pace reminder already delivered today', dedupeKey };
    }

    if (stepCount >= stepGoal * 0.7) {
      return { shouldSend: false, reason: 'Steps already at or near daily goal', dedupeKey };
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: `Step Pace Check 👟`,
      body: `You're at ${stepCount.toLocaleString()} / ${stepGoal.toLocaleString()} steps today. A quick 10-15 minute walk will boost your energy and close your ring!`,
      deepLink: '/user/workout',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'WORKOUT' }
    };
  }
}

/**
 * Post-Workout Protein Window Intelligence Rule
 * Reminds user to log their post-workout protein meal/shake in the anabolic recovery window.
 */
export class PostWorkoutProteinWindowRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'post_workout_protein_window',
      name: 'Post-Workout Protein & Recovery Window',
      category: NOTIFICATION_CATEGORIES.NUTRITION,
      defaultHour: 0,
      defaultMinute: 0,
      priority: 'P1'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      workoutLogs = context.todayWorkoutLogs || [],
      foodLogs = context.todayNutritionLogs || [],
      userName = 'Athlete',
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.NUTRITION] === false) {
      return { shouldSend: false, reason: 'Nutrition reminders disabled', dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Post-workout protein reminder already delivered today', dedupeKey };
    }

    const qualifyingWorkouts = workoutLogs.filter(isQualifyingWorkoutLog);
    if (qualifyingWorkouts.length === 0) {
      return { shouldSend: false, reason: 'No qualifying workout completed today', dedupeKey };
    }

    const latestWorkout = qualifyingWorkouts[qualifyingWorkouts.length - 1];
    const workoutTime = new Date(latestWorkout.timestamp || latestWorkout.created_at || latestWorkout.logged_at || currentTimestamp).getTime();
    const elapsedMinutes = (currentTimestamp - workoutTime) / (60 * 1000);

    if (elapsedMinutes < 10 || elapsedMinutes > 180) {
      return { shouldSend: false, reason: 'Outside the immediate post-workout recovery window', dedupeKey };
    }

    const hasPostWorkoutMeal = foodLogs.some(f => {
      const fTime = new Date(f.timestamp || f.created_at || f.logged_at || 0).getTime();
      return fTime >= workoutTime && (f.protein || 0) >= 15;
    });

    if (hasPostWorkoutMeal) {
      return { shouldSend: false, reason: 'Post-workout protein meal already logged', dedupeKey };
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: `Anabolic Recovery Window 💪🥩`,
      body: `Great session, ${userName}! Log your post-workout protein (aim for 25-40g) to repair muscle tissue and accelerate recovery.`,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

/**
 * Evening Macro Deficit Intelligence Rule
 * Provides smart suggestions before dinner if protein intake is significantly lagging.
 */
export class EveningMacroDeficitRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'evening_macro_deficit',
      name: 'Evening Macro Deficit Guidance',
      category: NOTIFICATION_CATEGORIES.NUTRITION,
      defaultHour: 19,
      defaultMinute: 0,
      priority: 'P2'
    });
  }

  evaluate(context = {}) {
    const {
      userId = 'user_default',
      timeZone = 'UTC',
      currentTimestamp = Date.now(),
      foodLogs = context.todayNutritionLogs || [],
      proteinTarget = 140,
      userName = 'Athlete',
      preferences = {},
      deliveredDedupeKeys = new Set()
    } = context;

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.NUTRITION] === false) {
      return { shouldSend: false, reason: 'Nutrition reminders disabled', dedupeKey };
    }

    if (hour < 18 || hour > 21) {
      return { shouldSend: false, reason: 'Outside evening macro review window', dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Evening macro guidance already delivered today', dedupeKey };
    }

    const totalProtein = (foodLogs || []).reduce((acc, item) => acc + (Number(item.protein) || 0), 0);
    const deficit = proteinTarget - totalProtein;

    if (deficit < 30) {
      return { shouldSend: false, reason: 'Protein target is already well met', dedupeKey };
    }

    return {
      shouldSend: true,
      dedupeKey,
      category: this.category,
      title: `Macro Target Opportunity 🎯`,
      body: `You have ${Math.round(deficit)}g of protein remaining to close your ring today, ${userName}. Power up your dinner with chicken, paneer, eggs, or lentils!`,
      deepLink: '/user/nutrition',
      date: localDate,
      timeZone,
      priority: this.priority,
      extraData: { type: this.id, date: localDate, dedupeKey, targetScreen: 'NUTRITION' }
    };
  }
}

export class SmartReminderEngine {
  constructor() {
    this.rules = [
      new MorningWakeBriefingRule(),
      new BreakfastLoggingReminderRule(),
      new NutritionLoggingReminderRule(),
      new SnackLoggingReminderRule(),
      new WorkoutLoggingReminderRule(),
      new DinnerLoggingReminderRule(),
      new DailyEveningBriefingReminderRule(),
      new DynamicHydrationGapRule(),
      new DynamicSedentaryStepPaceRule(),
      new PostWorkoutProteinWindowRule(),
      new EveningMacroDeficitRule(),
      new MiddayWaterReminderRule(),
      new HydrationReminderRule(),
      new StreakProtectionReminderRule(),
      new ZomatoViralMarketingReminderRule(),
      new AnytimeViralMarketingRule()
    ];
    this.deliveredKeys = new Set();
    this.history = []; // Rolling 30-day history of sent notifications
    this.analyticsLog = [];
    this.preferences = {
      dailyLoggingReminders: true,
      quietHoursEnabled: false,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      privacyLevel: PRIVACY_LEVELS.STANDARD,
      maxDailyNotifications: 12,
      [NOTIFICATION_CATEGORIES.NUTRITION]: true,
      [NOTIFICATION_CATEGORIES.WORKOUT]: true,
      [NOTIFICATION_CATEGORIES.HYDRATION]: true,
      [NOTIFICATION_CATEGORIES.RECOVERY]: true,
      [NOTIFICATION_CATEGORIES.CHALLENGE]: true,
      [NOTIFICATION_CATEGORIES.BRIEFING]: true,
      [NOTIFICATION_CATEGORIES.MARKETING]: true,
      [NOTIFICATION_CATEGORIES.STREAK]: true
    };
    this.restoreState();
  }

  restoreState() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('calyxo_smart_reminders_v2') || localStorage.getItem('calyxo_smart_reminders_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.deliveredKeys = new Set(parsed.deliveredKeys || []);
          this.history = Array.isArray(parsed.history) ? parsed.history : [];
          this.preferences = { ...this.preferences, ...(parsed.preferences || {}) };
        }
      } catch (e) {}
    }
  }

  persistState() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          'calyxo_smart_reminders_v2',
          JSON.stringify({
            deliveredKeys: Array.from(this.deliveredKeys).slice(-300),
            history: this.history.slice(-100),
            preferences: this.preferences
          })
        );
      } catch (e) {}
    }
  }

  setPreference(key, value) {
    this.preferences[key] = value;
    this.persistState();
  }

  getPreferences() {
    return { ...this.preferences };
  }

  /**
   * Get active theme cooldown sets (theme families and IDs active within rolling window)
   */
  getCooldownSets(cooldownDays = 30) {
    const cutoff = Date.now() - (cooldownDays * 86400000);
    const recent = this.history.filter(h => h.sentAt >= cutoff);

    const blockedFamilies = new Set(recent.map(h => h.themeFamily).filter(Boolean));
    const blockedThemeIds = new Set(recent.map(h => h.themeId).filter(Boolean));
    const blockedTitles = new Set(recent.map(h => h.title).filter(Boolean));

    return { blockedFamilies, blockedThemeIds,
      blockedTitles };
  }

  /**
   * Check daily fatigue count for user
   */
  getSentCountToday(localDate) {
    return this.history.filter(h => h.localDate === localDate).length;
  }

  logAnalyticsEvent(eventType, dedupeKey, metadata = {}) {
    const event = {
      eventType,
      dedupeKey,
      timestamp: Date.now(),
      ...metadata
    };
    this.analyticsLog.push(event);
    if (this.analyticsLog.length > 500) {
      this.analyticsLog.shift();
    }
    return event;
  }

  shouldSendReminder(ruleId, context = {}) {
    const rule = this.rules.find(r => r.id === ruleId || (ruleId.includes('nutrition') && r.id.includes('nutrition')) || (ruleId.includes('workout') && r.id.includes('workout')));
    if (!rule) return false;
    const { blockedFamilies, blockedThemeIds } = this.getCooldownSets();
    const decision = rule.evaluate({
      ...context,
      preferences: this.preferences,
      deliveredDedupeKeys: this.deliveredKeys,
      blockedFamilies,
      blockedThemeIds
    });
    return decision.shouldSend;
  }

  /**
   * Run smart evaluation for a user across all active rules
   */
  async evaluateAndTriggerReminders(context) {
    this.restoreState();
    const results = [];
    const localDate = getLocalDateString(context.currentTimestamp || Date.now(), context.timeZone);
    const { blockedFamilies, blockedThemeIds } = this.getCooldownSets();
    const sentToday = this.getSentCountToday(localDate);
    const maxDaily = Math.min(2, this.preferences.maxDailyNotifications || 2);

    // Enforce minimum gap between ANY two notifications: 4 hours
    const lastSentHistory = this.history.length > 0 ? this.history[this.history.length - 1] : null;
    const timeSinceLastSent = lastSentHistory ? (Date.now() - (lastSentHistory.sentAt || 0)) : Infinity;
    const MIN_NOTIFICATION_GAP_MS = 4 * 60 * 60 * 1000;

    // Target fulfillment and state-based guards: if user already fulfilled the goal, DO NOT nag!
    const waterVal = Number(context.waterIntake || 0);
    const waterGoal = Number(context.waterTarget || 3000);
    const isWaterFulfilled = waterVal >= waterGoal || waterVal >= 1500;
    const isNutritionFulfilled = (context.foodLogs || []).some(isQualifyingNutritionLog) || (context.foodLogs || []).length > 0;
    const isWorkoutFulfilled = (context.workoutLogs || []).some(isQualifyingWorkoutLog) || (context.workoutLogs || []).length > 0;

    for (const rule of this.rules) {
      // Early target-fulfillment suppression
      if (rule.category === NOTIFICATION_CATEGORIES.HYDRATION && isWaterFulfilled) {
        results.push({ ruleId: rule.id, sent: false, reason: 'Water target already met or sufficiently logged today', dedupeKey: rule.id });
        continue;
      }
      if (rule.category === NOTIFICATION_CATEGORIES.NUTRITION && isNutritionFulfilled) {
        results.push({ ruleId: rule.id, sent: false, reason: 'Nutrition already logged today', dedupeKey: rule.id });
        continue;
      }
      if (rule.category === NOTIFICATION_CATEGORIES.WORKOUT && isWorkoutFulfilled) {
        results.push({ ruleId: rule.id, sent: false, reason: 'Workout already completed today', dedupeKey: rule.id });
        continue;
      }

      // Hard Category Guard: Only 1 notification per category per day!
      const categorySentToday = this.history.some(h => h.localDate === localDate && h.category === rule.category);
      if (categorySentToday) {
        results.push({ ruleId: rule.id, sent: false, reason: `Category ${rule.category} already delivered today (1 per category limit)`, dedupeKey: rule.id });
        continue;
      }

      const decision = rule.evaluate({
        ...context,
        preferences: this.preferences,
        deliveredDedupeKeys: this.deliveredKeys,
        blockedFamilies,
        blockedThemeIds
      });

      if (decision.shouldSend) {
        // Double check against deliveredKeys
        if (this.deliveredKeys.has(decision.dedupeKey)) {
          results.push({ ruleId: rule.id, sent: false, reason: 'Already delivered today', dedupeKey: decision.dedupeKey });
          continue;
        }

        const isP0 = decision.priority === 'P0' || rule.priority === 'P0';

        // Fatigue Check: Max daily notifications limit (max 2/day)
        if (sentToday >= maxDaily && !isP0) {
          this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.SUPPRESSED, decision.dedupeKey, {
            reason: `Daily notification budget reached (${sentToday}/${maxDaily})`
          });
          results.push({ ruleId: rule.id, sent: false, reason: 'Daily notification limit reached (max 2/day)', dedupeKey: decision.dedupeKey });
          continue;
        }

        // Inter-notification cooldown: at least 4 hours between ANY notifications
        if (timeSinceLastSent < MIN_NOTIFICATION_GAP_MS && !isP0) {
          this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.SUPPRESSED, decision.dedupeKey, {
            reason: 'Minimum 4-hour spacing between notifications'
          });
          results.push({ ruleId: rule.id, sent: false, reason: 'Throttled: 4-hour gap between notifications', dedupeKey: decision.dedupeKey });
          continue;
        }

        // Lock delivery immediately in memory and storage
        this.deliveredKeys.add(decision.dedupeKey);
        const historyEntry = {
          dedupeKey: decision.dedupeKey,
          category: decision.category,
          themeId: decision.themeId || rule.id,
          themeFamily: decision.themeFamily || THEME_FAMILIES.SIDE_QUEST,
          title: decision.title,
          tone: decision.tone || 'playful',
          hookType: decision.hookType || 'challenge',
          ctaType: decision.ctaType || 'open_dashboard',
          sentAt: Date.now(),
          localDate
        };
        this.history.push(historyEntry);
        this.persistState();

        this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.SENT, decision.dedupeKey, {
          category: decision.category,
          deepLink: decision.deepLink,
          themeId: decision.themeId,
          themeFamily: decision.themeFamily
        });

        // Trigger native / web notification via centralized gateway
        await notificationManager.scheduleNotification({
          category: decision.category,
          entityId: decision.dedupeKey,
          title: decision.title,
          body: decision.body,
          deepLink: decision.deepLink,
          delaySeconds: 1,
          extraData: decision.extraData
        });

        results.push({ ruleId: rule.id, sent: true, dedupeKey: decision.dedupeKey });
        // CRITICAL: Stop immediately after dispatching the single highest-priority notification!
        break;
      } else {
        this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.SUPPRESSED, decision.dedupeKey, {
          reason: decision.reason
        });
        results.push({ ruleId: rule.id, sent: false, reason: decision.reason, dedupeKey: decision.dedupeKey });
      }
    }
    return results;
  }

  /**
   * Suppresses/Cancels today's nutrition reminder when a user logs a meal
   */

  /**
   * Evaluates and schedules all upcoming daily notification milestones directly with the OS
   * (UNUserNotificationCenter on iOS, Native Notification Channel on Android)
   * so they fire with zero delay even if the app is killed or suspended.
   */
  async scheduleDailyPlan(context = {}) {
    const {
      userId = 'user_default',
      timeZone = getUserTimezone ? getUserTimezone() : 'Asia/Kolkata',
      currentTimestamp = Date.now(),
      foodLogs = [],
      workoutLogs = [],
      waterIntake = 0,
      streak = 1,
      userName = 'Athlete',
      preferences = {},
      schedule = {}
    } = context;

    // Helper to parse 'HH:MM' string to integers
    const parseTime = (timeStr, defH, defM) => {
      if (!timeStr || typeof timeStr !== 'string') return { hour: defH, minute: defM };
      const parts = timeStr.split(':');
      if (parts.length < 2) return { hour: defH, minute: defM };
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      return {
        hour: isNaN(h) ? defH : Math.min(23, Math.max(0, h)),
        minute: isNaN(m) ? defM : Math.min(59, Math.max(0, m))
      };
    };

    const wake = parseTime(schedule.wakeTime, 6, 30);
    const breakfast = parseTime(schedule.breakfastTime, 8, 30);
    const lunch = parseTime(schedule.lunchTime, 13, 0);
    const snack = parseTime(schedule.snackTime, 17, 0);
    const workout = parseTime(schedule.workoutTime, 18, 30);
    const dinner = parseTime(schedule.dinnerTime, 20, 30);
    const sleep = parseTime(schedule.sleepTime, 23, 0);

    const milestones = [
      // 1. Morning Briefing & Wakeup
      {
        id: 'morning_wake_briefing',
        category: NOTIFICATION_CATEGORIES.BRIEFING,
        targetHour: wake.hour,
        targetMinute: wake.minute,
        isSuppressed: () => false,
        generateCopy: (dow) => {
          const themes = [
            { title: `Good morning, ${userName}! 🌅`, body: `Time to wake up before your alarm files a complaint. Drink 500ml water and conquer today!` },
            { title: `Beds are comfy, but gains are outside 🏃‍♂️`, body: `Wake up ${userName}! Hydrate and review today's workout & nutrition plan.` },
            { title: `Sun's up, ${userName}! ☀️`, body: `Your metabolic engine is ready to fire. Let's make today count!` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/dashboard'
      },
      // 2. Breakfast Logging Check
      {
        id: 'breakfast_logging_reminder',
        category: NOTIFICATION_CATEGORIES.NUTRITION,
        targetHour: breakfast.hour,
        targetMinute: breakfast.minute,
        isSuppressed: () => (foodLogs || []).some(log => (log.meal_type || log.mealType) === 'breakfast'),
        generateCopy: (dow) => {
          const themes = [
            { title: `Aloo Paratha or Protein Oats? 🍳`, body: `No judgment from us ${userName}, just log your breakfast macros before the chai gets cold!` },
            { title: `Breakfast unlogged? 🥞 Metabolism waiting!`, body: `Log your morning fuel to kickstart protein synthesis, ${userName}.` },
            { title: `Subah ka nashta logged hai kya? ☕`, body: `Hey ${userName}, 10 seconds to track your breakfast and keep your nutrition ring roaring!` },
            { title: `Breakfast Fuel Check 🍳`, body: `Log your breakfast macros to start the day with clean energy, ${userName}.` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/nutrition'
      },
      // 3. Mid-Morning Hydration Nudge
      {
        id: 'midmorning_water_reminder',
        category: NOTIFICATION_CATEGORIES.HYDRATION,
        targetHour: Math.min(lunch.hour - 1, 11),
        targetMinute: 30,
        isSuppressed: () => Number(waterIntake) >= 500,
        generateCopy: (dow) => {
          const themes = [
            { title: `Your water bottle is looking at you judgmentally 💧👀`, body: `It sat on your desk since 9 AM doing zero work. Give it purpose, ${userName}. Drink up!` },
            { title: `0ml water so far? Buffer speed: 480p 🧠💧`, body: `Hydrate now, ${userName}! Upgrade your afternoon cognitive clarity to 4K ultra HD.` },
            { title: `Hydration Check 💧`, body: `Hey ${userName}, take a sip! Log a fresh glass of water to keep your hydration ring moving.` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/nutrition'
      },
      // 4. Lunch Nutrition Reminder (at user's lunch time)
      {
        id: 'nutrition_logging_reminder',
        category: NOTIFICATION_CATEGORIES.NUTRITION,
        targetHour: lunch.hour,
        targetMinute: lunch.minute,
        isSuppressed: () => (foodLogs || []).some(isQualifyingNutritionLog),
        generateCopy: (dow) => {
          const themes = [
            { title: `Biryani, salad, or dal chawal? 🥗🍛`, body: `Whatever's on your plate ${userName}, log it now to keep your daily macro targets locked in!` },
            { title: `Fuel Check: Log Your Lunch ⚡️`, body: `Don't let hidden calories slow you down. A quick 10-second log keeps your streak clean.` },
            { title: `Lunch Logged = Goals Crushed 🎯`, body: `Keep your ${streak > 0 ? streak + '-day streak' : 'nutrition'} strong, ${userName}! What did you eat for lunch?` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/nutrition'
      },
      // 5. Afternoon Hydration Dip Reminder
      {
        id: 'afternoon_water_reminder',
        category: NOTIFICATION_CATEGORIES.HYDRATION,
        targetHour: Math.min(snack.hour - 1, 15),
        targetMinute: 30,
        isSuppressed: () => Number(waterIntake) >= 1500,
        generateCopy: (dow) => {
          const themes = [
            { title: `Afternoon Slump Defense 🌊`, body: `Brain cells run on water. Hydrate now before your workout, ${userName}!` },
            { title: `Hydration Level: Desert Mode 🏜️💧`, body: `Drink 300ml water right now to defeat 3 PM brain fog, ${userName}.` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/dashboard'
      },
      // 5. Afternoon Step & Stand Reminder
      {
        id: 'afternoon_movement_reminder',
        category: NOTIFICATION_CATEGORIES.WORKOUT,
        targetHour: (lunch.hour + 2) % 24,
        targetMinute: 30,
        isSuppressed: () => stepsToday >= 6000,
        generateCopy: (dow) => {
          const themes = [
            { title: `Post-lunch slump breaker! 🚶‍♂️`, body: `Take a brisk 5-minute walk to aid digestion and boost focus, ${userName}.` },
            { title: `Desk worker stand & stretch! 🧘‍♂️`, body: `Reset your spine and posture with a quick 3-minute movement break, ${userName}.` },
            { title: `Keep your step count moving! 👟`, body: `A quick lap around the floor adds 500 easy steps towards your goal, ${userName}.` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/workout'
      },
      // 6. Pre-Workout Motivation
      {
        id: 'pre_workout_nudge',
        category: NOTIFICATION_CATEGORIES.WORKOUT,
        targetHour: (workout.hour - 1 + 24) % 24,
        targetMinute: 30,
        isSuppressed: () => Boolean(workoutCompletedToday),
        generateCopy: (dow) => {
          const themes = [
            { title: `Workout window opening soon! 🏋️‍♂️`, body: `Prep your hydration and get ready to crush today's session, ${userName}.` },
            { title: `Gains loading in 60 mins... ⏳`, body: `Today's adaptive training routine is primed. Let's make it count, ${userName}!` },
            { title: `Time to show up for yourself! 💪`, body: `30-45 minutes of focus today builds the body you want tomorrow, ${userName}.` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/workout'
      },
      // 7. Post-Workout Logging & Recovery Check
      {
        id: 'post_workout_log_check',
        category: NOTIFICATION_CATEGORIES.WORKOUT,
        targetHour: (workout.hour + 1) % 24,
        targetMinute: 15,
        isSuppressed: () => Boolean(workoutCompletedToday),
        generateCopy: (dow) => {
          const themes = [
            { title: `How was today's training? 🏅`, body: `Log your workout sets & volume to keep your progressive overload streak alive, ${userName}!` },
            { title: `Session complete? Log it! 📝`, body: `Track your exercises so your AI coach can autoregulate tomorrow's recovery, ${userName}.` },
            { title: `Don't leave volume unrecorded! 📊`, body: `Log your reps and weights now while they are fresh, ${userName}.` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/workout'
      },
      // 8. Dinner Logging Check
      {
        id: 'dinner_logging_reminder',
        category: NOTIFICATION_CATEGORIES.NUTRITION,
        targetHour: dinner.hour,
        targetMinute: dinner.minute,
        isSuppressed: () => false,
        generateCopy: (dow) => {
          const themes = [
            { title: `Dinner logging time! 🍲`, body: `Wrap up your daily food log and review your final macro targets, ${userName}.` },
            { title: `Finish strong today! 🎯`, body: `Log dinner to see if you hit your daily protein and calorie goals, ${userName}.` },
            { title: `Closing time for the kitchen! 🥘`, body: `Track your final meal of the day and review your daily nutrition score, ${userName}.` }
          ];
          return themes[dow % themes.length];
        },
        deepLink: '/user/nutrition'
      },
      // 9. Nightly AI Briefing (30 mins before sleep)
      {
        id: 'nightly_ai_briefing',
        category: NOTIFICATION_CATEGORIES.BRIEFING,
        targetHour: (sleep.hour - 1 + 24) % 24,
        targetMinute: 30,
        isSuppressed: () => false,
        generateCopy: (dow) => ({
          title: `✨ Daily Executive Health Briefing • ${userName}`,
          body: `🌙 Recovery score, daily summary, and tomorrow's focus are ready. Tap to view.`
        }),
        deepLink: '/user/dashboard'
      }
    ];

    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour: currentHour, minute: currentMinute, dayOfWeek } = getLocalTimeParts(currentTimestamp, timeZone);

    const planScheduledKey = `calyxo_daily_plan_scheduled_${userId}_${localDate}`;
    if (this.deliveredKeys.has(planScheduledKey)) {
      return; // Already pre-scheduled today's daily milestones, avoid re-adding every 15 minutes
    }
    this.deliveredKeys.add(planScheduledKey);
    this.persistState();

    for (const milestone of milestones) {
      if (preferences[milestone.category] === false || preferences.dailyLoggingReminders === false) {
        continue;
      }

      if (milestone.isSuppressed()) {
        continue;
      }

      const dedupeKey = `${milestone.id}_${userId}_${localDate}`;
      if (this.deliveredKeys.has(dedupeKey)) {
        continue;
      }

      const nowInMinutes = currentHour * 60 + currentMinute;
      const targetInMinutes = milestone.targetHour * 60 + milestone.targetMinute;

      const delayMinutes = targetInMinutes - nowInMinutes;
      // Only pre-schedule milestones that are at least 15 minutes in the future today
      if (delayMinutes < 15) {
        continue;
      }

      const delaySeconds = delayMinutes * 60;
      const copy = milestone.generateCopy(dayOfWeek);

      await notificationManager.scheduleNotification({
        category: milestone.category,
        entityId: dedupeKey,
        title: copy.title,
        body: copy.body,
        deepLink: milestone.deepLink,
        delaySeconds,
        extraData: { dedupeKey, milestoneId: milestone.id }
      });
    }
  }

  async suppressDailyNutritionReminder(userId = 'user_default', timeZone = null) {
    const localDate = getLocalDateString(Date.now(), timeZone);
    const keysToCancel = [
      `nutrition_logging_reminder_${userId}_${localDate}`,
      `breakfast_logging_reminder_${userId}_${localDate}`,
      `snack_logging_reminder_${userId}_${localDate}`,
      `dinner_logging_reminder_${userId}_${localDate}`,
      `evening_macro_deficit_${userId}_${localDate}`,
      `post_workout_protein_window_${userId}_${localDate}`
    ];

    for (const k of keysToCancel) {
      this.deliveredKeys.add(k);
      await notificationManager.cancelNotificationByKey(NOTIFICATION_CATEGORIES.NUTRITION, k);
    }
    await notificationManager.cancelCategory(NOTIFICATION_CATEGORIES.NUTRITION);
    this.persistState();
    this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.CANCELLED, `nutrition_group_${userId}_${localDate}`, { reason: 'User logged meal before reminder' });

    return { suppressed: true };
  }

  /**
   * Suppresses/Cancels today's midday water reminder when user logs water
   */
  async suppressDailyWaterReminder(userId = 'user_default', timeZone = null) {
    const localDate = getLocalDateString(Date.now(), timeZone);
    const keysToCancel = [
      `midday_water_reminder_${userId}_${localDate}`,
      `afternoon_water_reminder_${userId}_${localDate}`,
      `hydration_logging_reminder_${userId}_${localDate}`,
      `dynamic_hydration_gap_${userId}_${localDate}`
    ];

    for (const k of keysToCancel) {
      this.deliveredKeys.add(k);
      await notificationManager.cancelNotificationByKey(NOTIFICATION_CATEGORIES.HYDRATION, k);
    }
    await notificationManager.cancelCategory(NOTIFICATION_CATEGORIES.HYDRATION);
    this.persistState();
    this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.CANCELLED, `water_group_${userId}_${localDate}`, { reason: 'User logged water before reminder' });

    return { suppressed: true };
  }

  /**
   * Suppresses/Cancels today's workout reminder when user completes/logs a workout
   */
  async suppressDailyWorkoutReminder(userId = 'user_default', timeZone = null) {
    const localDate = getLocalDateString(Date.now(), timeZone);
    const keysToCancel = [
      `workout_logging_reminder_${userId}_${localDate}`,
      `pre_workout_nudge_${userId}_${localDate}`,
      `afternoon_movement_reminder_${userId}_${localDate}`
    ];

    for (const k of keysToCancel) {
      this.deliveredKeys.add(k);
      await notificationManager.cancelNotificationByKey(NOTIFICATION_CATEGORIES.WORKOUT, k);
    }
    await notificationManager.cancelCategory(NOTIFICATION_CATEGORIES.WORKOUT);
    this.persistState();
    this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.CANCELLED, `workout_group_${userId}_${localDate}`, { reason: 'User logged workout before reminder' });

    return { suppressed: true };
  }
}

export const smartReminderEngine = new SmartReminderEngine();
export default smartReminderEngine;
