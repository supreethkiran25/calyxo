import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import {
  NutritionLoggingReminderRule,
  WorkoutLoggingReminderRule,
  isQualifyingNutritionLog,
  getLocalDateString,
  getLocalTimeParts,
  PRIVACY_LEVELS
} from '../../src/services/notifications/SmartReminderEngine.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || 'BJEqrp7IotPHK2FR8qvgATPii4lV3KY3jirYWe1b6X9vRdY6rwbsnyCQiOR2J4VUHuP-eWLfX4cHAmhFqnWSBWs';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '3AASSWF8bDu3EJG5_GHSbBozW_OvI--jfYlJoJyUByg';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@calyxo.app';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {}

/**
 * Serverless Cron / Webhook handler to evaluate smart user reminders
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const nutritionRule = new NutritionLoggingReminderRule();
  const workoutRule = new WorkoutLoggingReminderRule();

  try {
    // 1. Fetch active push subscriptions grouped by user
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription, updated_at');

    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({ message: 'No active push subscriptions to evaluate', processed: 0 });
    }

    // Group subscriptions by user_id
    const userMap = new Map();
    subscriptions.forEach((sub) => {
      if (!userMap.has(sub.user_id)) userMap.set(sub.user_id, []);
      userMap.get(sub.user_id).push(sub);
    });

    const now = Date.now();
    let sentCount = 0;
    let suppressedCount = 0;
    const summary = [];

    for (const [userId, userSubs] of userMap.entries()) {
      // 2. Fetch User Profile to get configured TimeZone and Preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, timezone, notification_preferences, current_streak, privacy_level')
        .eq('id', userId)
        .maybeSingle();

      const userTimeZone = profile?.timezone || 'UTC';
      const localDate = getLocalDateString(now, userTimeZone);
      const preferences = profile?.notification_preferences || { dailyLoggingReminders: true };
      const privacyLevel = profile?.privacy_level || PRIVACY_LEVELS.STANDARD;

      // 3. Fetch user's nutrition logs for today (local date)
      const { data: todayMeals } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${localDate}T00:00:00Z`);

      // 4. Fetch already sent delivery logs for deduplication
      const { data: existingLogs } = await supabase
        .from('notification_delivery_logs')
        .select('dedupe_key')
        .eq('user_id', userId)
        .eq('date', localDate);

      const deliveredKeys = new Set((existingLogs || []).map((l) => l.dedupe_key));

      // 5. Evaluate Nutrition Logging Rule
      const decision = nutritionRule.evaluate({
        userId,
        timeZone: userTimeZone,
        currentTimestamp: now,
        todayNutritionLogs: todayMeals || [],
        streak: profile?.current_streak || 0,
        privacyLevel,
        preferences,
        deliveredDedupeKeys: deliveredKeys
      });

      if (decision.shouldSend) {
        const payload = JSON.stringify({
          title: decision.title,
          body: decision.body,
          url: decision.deepLink,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: decision.dedupeKey,
          data: decision.extraData
        });

        // Broadcast to user's registered push endpoints
        for (const sub of userSubs) {
          try {
            await webpush.sendNotification(sub.subscription, payload);
            sentCount++;
          } catch (pushErr) {
            console.warn(`[Smart Reminders] Delivery error for user ${userId}:`, pushErr.message);
          }
        }

        // Record delivery log in database for deduplication
        await supabase.from('notification_delivery_logs').insert({
          user_id: userId,
          date: localDate,
          dedupe_key: decision.dedupeKey,
          rule_id: nutritionRule.id,
          sent_at: new Date().toISOString()
        });

        summary.push({ userId, status: 'SENT', rule: nutritionRule.id, dedupeKey: decision.dedupeKey });
      } else {
        suppressedCount++;
        summary.push({ userId, status: 'SUPPRESSED', reason: decision.reason });
      }
    }

    return res.status(200).json({
      success: true,
      sentCount,
      suppressedCount,
      evaluatedUsers: userMap.size,
      summary
    });
  } catch (err) {
    console.error('[Smart Reminders Error]:', err);
    return res.status(500).json({ error: err.message });
  }
}
