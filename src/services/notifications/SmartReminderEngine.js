/**
 * Calyxo Smart User Logging Reminder Engine
 *
 * Rules:
 * 1. Evaluates user activity based on the user's real IANA timezone (e.g. Asia/Kolkata, America/New_York).
 * 2. 1:00 PM Nutrition Rule: If no qualifying meal/food log exists for the current local day, sends a friendly reminder.
 * 3. Never sends reminders if a qualifying log already exists.
 * 4. Deterministic deduplication: Exactly ONE reminder per user/date (`nutrition_logging_reminder_<userId>_<localDate>`).
 * 5. Automatic suppression: When a user logs a meal, pending reminders for that day are immediately cancelled.
 * 6. Quiet Hours & Privacy Modes: Respects user preferences and quiet hours (STANDARD, DETAILED, MINIMAL).
 * 7. Extensible architecture: Supports Nutrition, Workout, Hydration, Recovery, and Challenge rules.
 */

import { notificationManager, NOTIFICATION_CATEGORIES } from './CalyxoNotificationManager.js';

export const PRIVACY_LEVELS = {
  STANDARD: 'STANDARD',
  DETAILED: 'DETAILED',
  MINIMAL: 'MINIMAL'
};

export const NOTIFICATION_ANALYTICS_EVENTS = {
  SCHEDULED: 'SCHEDULED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  OPENED: 'OPENED',
  DISMISSED: 'DISMISSED',
  SUPPRESSED: 'SUPPRESSED',
  CANCELLED: 'CANCELLED'
};

/**
 * Validates whether an event qualifies as an authentic nutrition/meal log
 */
export function isQualifyingNutritionLog(entry) {
  if (!entry || typeof entry !== 'object') return false;

  // Real food log must have an identifier, food name or meal category, and non-empty nutrients or timestamp
  const hasName = Boolean(entry.name || entry.food_name || entry.dish_name || entry.meal_type || entry.title);
  const hasCaloriesOrMacros = entry.calories !== undefined || entry.protein !== undefined || entry.carbs !== undefined || entry.fat !== undefined || entry.amount !== undefined;
  const hasTimestamp = Boolean(entry.timestamp || entry.created_at || entry.logged_at || entry.date);

  return Boolean(hasName && (hasCaloriesOrMacros || hasTimestamp));
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
 * Resolves the current local hour [0-23] and minute [0-59] in a given timezone
 */
export function getLocalTimeParts(timestamp = Date.now(), timeZone = null) {
  const tz = timeZone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date(timestamp));
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return { hour, minute, timeZone: tz };
  } catch (e) {
    const d = new Date(timestamp);
    return { hour: d.getHours(), minute: d.getMinutes(), timeZone: 'UTC' };
  }
}

/**
 * Checks if current local time falls within configured Quiet Hours
 */
export function isWithinQuietHours({ localHour, quietHoursStart = 22, quietHoursEnd = 7 }) {
  if (quietHoursStart === quietHoursEnd) return false;
  if (quietHoursStart > quietHoursEnd) {
    // Overnight quiet hours (e.g. 22:00 to 07:00)
    return localHour >= quietHoursStart || localHour < quietHoursEnd;
  }
  return localHour >= quietHoursStart && localHour < quietHoursEnd;
}

/**
 * Base Reminder Rule Class
 */
export class BaseReminderRule {
  constructor({ id, name, category, defaultHour = 13, defaultMinute = 0 }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.defaultHour = defaultHour;
    this.defaultMinute = defaultMinute;
  }

  evaluate(context) {
    throw new Error('evaluate() must be implemented by rule subclass');
  }
}

/**
 * 1:00 PM Smart Nutrition Logging Reminder Rule
 */
export class NutritionLoggingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'nutrition_logging_reminder',
      name: 'Daily 1:00 PM Nutrition Logging Reminder',
      category: NOTIFICATION_CATEGORIES.NUTRITION,
      defaultHour: 13,
      defaultMinute: 0
    });
  }

  evaluate({
    userId = 'user_default',
    timeZone = 'UTC',
    currentTimestamp = Date.now(),
    todayNutritionLogs = [],
    streak = 0,
    hasNutritionGoal = true,
    privacyLevel = PRIVACY_LEVELS.STANDARD,
    preferences = {},
    deliveredDedupeKeys = new Set()
  }) {
    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    // 1. Preference check
    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.NUTRITION] === false) {
      return { shouldSend: false, reason: 'Nutrition reminders disabled in user preferences', dedupeKey };
    }

    // 2. Quiet Hours check
    if (preferences.quietHoursEnabled && isWithinQuietHours({ localHour: hour, ...preferences })) {
      return { shouldSend: false, reason: 'Current time is within quiet hours', dedupeKey };
    }

    // 3. Time Gate check: 1:00 PM (hour >= 13)
    if (hour < this.defaultHour) {
      return { shouldSend: false, reason: `Too early for 1:00 PM reminder (current local hour: ${hour})`, dedupeKey };
    }

    // 4. Check if already delivered today (Deduplication)
    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today (idempotent)', dedupeKey };
    }

    // 5. Check if user already logged a qualifying meal today
    const hasQualifyingLog = (todayNutritionLogs || []).some(isQualifyingNutritionLog);
    if (hasQualifyingLog) {
      return { shouldSend: false, reason: 'User has already logged a qualifying meal today', dedupeKey };
    }

    // 6. Build Personalized, Privacy-Safe Messaging
    let title = 'Calyxo Nutrition 🍽️';
    let body = "Hey! 👋 Haven't logged anything today yet. Take a moment to log your meal to keep your daily progress on track.";

    if (privacyLevel === PRIVACY_LEVELS.MINIMAL) {
      title = 'Calyxo';
      body = "Don't forget to log today's meal.";
    } else if (streak > 2) {
      body = `Your ${streak}-day logging streak is waiting for you! 🔥 Take a quick moment to log your meal.`;
    } else if (!hasNutritionGoal) {
      body = "Hey! 👋 Don't forget to log your first meal today to stay consistent.";
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
      extraData: {
        type: this.id,
        date: localDate,
        dedupeKey,
        targetScreen: 'NUTRITION'
      }
    };
  }
}

/**
 * 7:00 PM Smart Workout Logging Reminder Rule
 */
export class WorkoutLoggingReminderRule extends BaseReminderRule {
  constructor() {
    super({
      id: 'workout_logging_reminder',
      name: 'Daily 7:00 PM Workout Logging Reminder',
      category: NOTIFICATION_CATEGORIES.WORKOUT,
      defaultHour: 19,
      defaultMinute: 0
    });
  }

  evaluate({
    userId = 'user_default',
    timeZone = 'UTC',
    currentTimestamp = Date.now(),
    todayWorkoutLogs = [],
    workoutStreak = 0,
    privacyLevel = PRIVACY_LEVELS.STANDARD,
    preferences = {},
    deliveredDedupeKeys = new Set()
  }) {
    const localDate = getLocalDateString(currentTimestamp, timeZone);
    const { hour } = getLocalTimeParts(currentTimestamp, timeZone);
    const dedupeKey = `${this.id}_${userId}_${localDate}`;

    if (preferences.dailyLoggingReminders === false || preferences[NOTIFICATION_CATEGORIES.WORKOUT] === false) {
      return { shouldSend: false, reason: 'Workout reminders disabled in preferences', dedupeKey };
    }

    if (hour < this.defaultHour) {
      return { shouldSend: false, reason: `Too early for 7:00 PM workout reminder`, dedupeKey };
    }

    if (deliveredDedupeKeys.has(dedupeKey)) {
      return { shouldSend: false, reason: 'Already delivered today', dedupeKey };
    }

    if ((todayWorkoutLogs || []).length > 0) {
      return { shouldSend: false, reason: 'User has already logged a workout today', dedupeKey };
    }

    let title = 'Calyxo Workout 💪';
    let body = 'Evening check-in: Ready for today’s session or rest recovery log?';

    if (privacyLevel === PRIVACY_LEVELS.MINIMAL) {
      title = 'Calyxo';
      body = 'Check in on your daily fitness log.';
    } else if (workoutStreak > 1) {
      body = `Protect your ${workoutStreak}-day workout streak! Log today's training session.`;
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
      extraData: {
        type: this.id,
        date: localDate,
        dedupeKey,
        targetScreen: 'WORKOUT'
      }
    };
  }
}

/**
 * Smart Reminder Engine Central Coordinator
 */
export class SmartReminderEngine {
  constructor() {
    this.rules = [new NutritionLoggingReminderRule(), new WorkoutLoggingReminderRule()];
    this.deliveredKeys = new Set();
    this.analyticsLog = [];
    this.preferences = {
      dailyLoggingReminders: true,
      quietHoursEnabled: false,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      privacyLevel: PRIVACY_LEVELS.STANDARD,
      [NOTIFICATION_CATEGORIES.NUTRITION]: true,
      [NOTIFICATION_CATEGORIES.WORKOUT]: true,
      [NOTIFICATION_CATEGORIES.HYDRATION]: true,
      [NOTIFICATION_CATEGORIES.RECOVERY]: true,
      [NOTIFICATION_CATEGORIES.CHALLENGE]: true
    };
    this.restoreState();
  }

  restoreState() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('calyxo_smart_reminders_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.deliveredKeys = new Set(parsed.deliveredKeys || []);
          this.preferences = { ...this.preferences, ...(parsed.preferences || {}) };
        }
      } catch (e) {}
    }
  }

  persistState() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          'calyxo_smart_reminders_v1',
          JSON.stringify({
            deliveredKeys: Array.from(this.deliveredKeys).slice(-300),
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
    const decision = rule.evaluate({
      ...context,
      preferences: this.preferences,
      deliveredDedupeKeys: this.deliveredKeys
    });
    return decision.shouldSend;
  }

  /**
   * Run smart evaluation for a user across all active rules
   */
  async evaluateAndTriggerReminders(context) {
    const results = [];
    for (const rule of this.rules) {
      const decision = rule.evaluate({
        ...context,
        preferences: this.preferences,
        deliveredDedupeKeys: this.deliveredKeys
      });

      if (decision.shouldSend) {
        this.deliveredKeys.add(decision.dedupeKey);
        this.persistState();

        this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.SENT, decision.dedupeKey, {
          category: decision.category,
          deepLink: decision.deepLink
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
  async suppressDailyNutritionReminder(userId = 'user_default', timeZone = null) {
    const localDate = getLocalDateString(Date.now(), timeZone);
    const dedupeKey = `nutrition_logging_reminder_${userId}_${localDate}`;

    // Mark as delivered so it won't fire later today
    this.deliveredKeys.add(dedupeKey);
    this.persistState();

    // Cancel any pending notification
    await notificationManager.cancelNotificationByKey(NOTIFICATION_CATEGORIES.NUTRITION, dedupeKey);
    this.logAnalyticsEvent(NOTIFICATION_ANALYTICS_EVENTS.CANCELLED, dedupeKey, { reason: 'User logged meal before reminder' });

    return { suppressed: true, dedupeKey };
  }
}

export const smartReminderEngine = new SmartReminderEngine();
export default smartReminderEngine;
