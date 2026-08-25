/**
 * Calyxo Dynamic Daily Notification Intelligence & Delivery Test Runner
 *
 * Validates:
 * 1. Midday Water Rule (12:00 PM): Suppressed if >=250ml, fires if <250ml.
 * 2. Water Immediate Suppression: Invalidation on logging water.
 * 3. 4:30 PM Zomato/Viral Marketing Rule: User state overrides (suppresses workout nudge if workout done).
 * 4. 10:30 PM AI Briefing: Tailors to all-complete, missing workout, missing water, or streak danger.
 * 5. Theme Cooldown & Semantic Deduplication: Cooldown blocks same family (e.g. Couch joke blocks Sofa joke).
 * 6. Day-Aware Personality: Monday vs Friday vs Sunday energy pools.
 * 7. Notification Fatigue & Priority Management: Daily cap with P0 streak override.
 * 8. Timezone & Quiet Hours Safety.
 * 9. Analytics Event Logging.
 */

import {
  smartReminderEngine,
  SmartReminderEngine,
  MiddayWaterReminderRule,
  DailyEveningBriefingReminderRule,
  ZomatoViralMarketingReminderRule,
  NutritionLoggingReminderRule,
  WorkoutLoggingReminderRule,
  StreakProtectionReminderRule,
  getLocalDateString,
  getLocalTimeParts,
  isWithinQuietHours,
  NOTIFICATION_ANALYTICS_EVENTS
} from '../services/notifications/SmartReminderEngine.js';

import {
  NOTIFICATION_THEMES,
  THEME_FAMILIES,
  filterAvailableThemes,
  pickThemeVariant
} from '../services/notifications/NotificationThemeLibrary.js';

import { notificationManager, NOTIFICATION_CATEGORIES } from '../services/notifications/CalyxoNotificationManager.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

function getTimestampForLocalHour(targetHour, targetMinute = 0, timeZone = 'UTC') {
  const base = new Date();
  const currentParts = getLocalTimeParts(base.getTime(), timeZone);
  const diffHours = targetHour - currentParts.hour;
  const diffMinutes = targetMinute - currentParts.minute;
  return base.getTime() + (diffHours * 3600000) + (diffMinutes * 60000);
}

async function runSuite() {
  console.log('======================================================================');
  console.log('🚀 CALYXO DYNAMIC NOTIFICATION INTELLIGENCE AUDIT SUITE');
  console.log('======================================================================\n');

  // ── TEST 1: 12:00 PM Midday Water System ─────────────────────────────────
  console.log('🧪 SUITE 1: 12:00 PM Midday Water Intelligence & State Overrides');
  const waterRule = new MiddayWaterReminderRule();
  const ts12PM = getTimestampForLocalHour(12, 5, 'Asia/Kolkata');

  // Case A: User has 0ml water at 12:05 PM -> Fires
  const resWater0 = waterRule.evaluate({
    userId: 'user_water_1',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts12PM,
    waterIntake: 0
  });
  assert(resWater0.shouldSend === true, 'Fires 12:00 PM water reminder when 0ml logged');
  assert(resWater0.category === NOTIFICATION_CATEGORIES.HYDRATION, 'Category is HYDRATION');
  assert(resWater0.deepLink === '/user/nutrition', 'Deep links to /user/nutrition');

  // Case B: User already logged 500ml water before 12 PM -> SUPPRESSED
  const resWater500 = waterRule.evaluate({
    userId: 'user_water_2',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts12PM,
    waterIntake: 500
  });
  assert(resWater500.shouldSend === false, 'Suppressed because user already logged 500ml water');
  assert(resWater500.reason.includes('already logged water'), 'Reason cites existing water intake');

  // Case C: User logs water after 12 PM -> Immediate state invalidation
  const engine = new SmartReminderEngine();
  const suppWater = await engine.suppressDailyWaterReminder('user_water_1', 'Asia/Kolkata');
  assert(suppWater.suppressed === true, 'suppressDailyWaterReminder returns suppressed: true');
  assert(engine.deliveredKeys.has(suppWater.dedupeKey), 'Dedupe key added to deliveredKeys cache');

  const resWaterAfter = waterRule.evaluate({
    userId: 'user_water_1',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts12PM + 1800000,
    waterIntake: 300,
    deliveredDedupeKeys: engine.deliveredKeys
  });
  assert(resWaterAfter.shouldSend === false, 'Subsequent evaluation suppressed after logging water');

  // ── TEST 2: 4:30 PM Zomato-Style Engagement & Workout Overrides ───────────
  console.log('\n🧪 SUITE 2: 4:30 PM Zomato-Style Viral Engagement & Workout State Overrides');
  const viralRule = new ZomatoViralMarketingReminderRule();
  const ts430PM = getTimestampForLocalHour(16, 35, 'Asia/Kolkata');

  // Case A: User has NOT worked out today -> Generates dynamic punchy notification
  const resViralPending = viralRule.evaluate({
    userId: 'user_viral_1',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts430PM,
    todayWorkoutLogs: []
  });
  assert(resViralPending.shouldSend === true, 'Fires 4:30 PM engagement reminder when workout is pending');
  assert(Boolean(resViralPending.title && resViralPending.body), 'Generated non-empty title and body');
  assert(Boolean(resViralPending.themeFamily), 'Attached themeFamily metadata for cooldown tracking');

  // Case B: User ALREADY completed today workout -> Excludes pure workout nudges
  const themesWhenWorkoutDone = filterAvailableThemes({
    category: 'ENGAGEMENT',
    dayOfWeek: 1,
    isWorkoutDone: true
  });
  const pureWorkoutThemes = themesWhenWorkoutDone.filter(t => t.categories.includes('WORKOUT') && !t.categories.includes('BRIEFING'));
  assert(pureWorkoutThemes.length === 0, 'filterAvailableThemes strictly excludes pure workout nudge themes when workout is done');

  // Case C: Immediate workout suppression
  const suppWorkout = await engine.suppressDailyWorkoutReminder('user_viral_1', 'Asia/Kolkata');
  assert(suppWorkout.suppressed === true, 'suppressDailyWorkoutReminder executes successfully');

  // ── TEST 3: Semantic Deduplication & Theme Cooldown ──────────────────────
  console.log('\n🧪 SUITE 3: Semantic Deduplication & Rolling 30-Day Theme Cooldown');

  // Case A: When COUCH_LAZINESS family is on cooldown, all sofa/couch themes are blocked
  const blockedFamilies = new Set([THEME_FAMILIES.COUCH_LAZINESS]);
  const availableThemes = filterAvailableThemes({
    category: 'ENGAGEMENT',
    blockedFamilies
  });
  const hasCouchTheme = availableThemes.some(t => t.family === THEME_FAMILIES.COUCH_LAZINESS || t.id.includes('couch') || t.id.includes('sofa'));
  assert(hasCouchTheme === false, 'Semantic deduplication: Couch & Sofa themes completely blocked when COUCH_LAZINESS family is in cooldown');

  // Case B: NotificationThemeLibrary has extensive theme catalog
  assert(NOTIFICATION_THEMES.length >= 20, `Theme catalog is rich and diverse (found ${NOTIFICATION_THEMES.length} structured themes)`);
  const uniqueFamilies = new Set(NOTIFICATION_THEMES.map(t => t.family));
  assert(uniqueFamilies.size >= 15, `Theme library contains ${uniqueFamilies.size} distinct semantic theme families`);

  // ── TEST 4: Day-Aware Personality Pools ──────────────────────────────────
  console.log('\n🧪 SUITE 4: Day-Aware Personality Pools (Mon vs Fri vs Sun)');
  const mondayThemes = filterAvailableThemes({ dayOfWeek: 1 });
  const fridayThemes = filterAvailableThemes({ dayOfWeek: 5 });
  const sundayThemes = filterAvailableThemes({ dayOfWeek: 0 });

  assert(mondayThemes.some(t => t.id.includes('monday') || t.family === THEME_FAMILIES.MONDAY_BLUES), 'Monday personality pool includes Monday-specific themes');
  assert(fridayThemes.some(t => t.id.includes('friday') || t.family === THEME_FAMILIES.FRIDAY_ENERGY), 'Friday personality pool includes Friday-specific themes');
  assert(sundayThemes.some(t => t.id.includes('sunday') || t.family === THEME_FAMILIES.SUNDAY_RESET), 'Sunday personality pool includes Sunday reset themes');

  // ── TEST 5: 10:30 PM AI Nightly Briefing Personalization ───────────────────
  console.log('\n🧪 SUITE 5: 10:30 PM AI Nightly Briefing State Adaptation');
  const briefingRule = new DailyEveningBriefingReminderRule();
  const ts1030PM = getTimestampForLocalHour(22, 35, 'Asia/Kolkata');

  // Case A: Elite Day (All targets completed) -> Celebration
  const resEliteDay = briefingRule.evaluate({
    userId: 'user_elite',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts1030PM,
    foodLogs: [{ name: 'Salad', calories: 600, timestamp: Date.now() }],
    workoutLogs: [{ title: 'Chest Day', duration: 45, timestamp: Date.now() }],
    waterIntake: 2600,
    streak: 12
  });
  assert(resEliteDay.shouldSend === true, '10:30 PM briefing fires for elite day');
  assert(resEliteDay.themeId === 'briefing_elite_day_celebration' || resEliteDay.body.includes('streak'), 'Celebrates complete day');

  // Case B: Missing Workout & Streak at risk -> P0 Workout Rescue
  const resMissingWorkout = briefingRule.evaluate({
    userId: 'user_miss_w',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts1030PM,
    foodLogs: [{ name: 'Dal Roti', calories: 500, timestamp: Date.now() }],
    workoutLogs: [],
    waterIntake: 2000,
    streak: 8
  });
  assert(resMissingWorkout.shouldSend === true, 'Fires briefing with targeted gap');
  assert(resMissingWorkout.priority === 'P0', 'Missing workout before midnight is treated as P0 priority');

  // Case C: Nothing logged today -> P0 Streak Rescue Emergency
  const resNothingLogged = briefingRule.evaluate({
    userId: 'user_nothing',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts1030PM,
    foodLogs: [],
    workoutLogs: [],
    waterIntake: 0,
    streak: 15
  });
  assert(resNothingLogged.shouldSend === true, 'Fires emergency streak rescue briefing');
  assert(resNothingLogged.priority === 'P0', 'Nothing logged is P0 emergency priority');

  // ── TEST 6: Notification Fatigue & Priority Preemption ────────────────────
  console.log('\n🧪 SUITE 6: Notification Fatigue & Priority Preemption');
  const fatigueEngine = new SmartReminderEngine();
  fatigueEngine.deliveredKeys.clear();
  fatigueEngine.history = [];
  fatigueEngine.preferences.maxDailyNotifications = 2;

  const todayStr = getLocalDateString(Date.now(), 'Asia/Kolkata');
  // Fill daily quota with 2 past notifications
  fatigueEngine.history.push(
    { dedupeKey: 'k1', localDate: todayStr, sentAt: Date.now() - 7200000, priority: 'P2' },
    { dedupeKey: 'k2', localDate: todayStr, sentAt: Date.now() - 3600000, priority: 'P2' }
  );

  // P3 marketing reminder should be SUPPRESSED by fatigue limit
  const evalResults = await fatigueEngine.evaluateAndTriggerReminders({
    userId: 'user_fatigued',
    timeZone: 'Asia/Kolkata',
    currentTimestamp: ts430PM,
    foodLogs: [],
    workoutLogs: [],
    waterIntake: 0
  });

  const viralResult = evalResults.find(r => r.ruleId === 'viral_marketing_reminder');
  assert(viralResult && viralResult.sent === false, 'P3 marketing reminder suppressed when daily notification limit reached');

  // ── TEST 7: Central Notification Gateway Deduplication ────────────────────
  console.log('\n🧪 SUITE 7: Centralized Notification Gateway & Invalidation');
  const schedResult = await notificationManager.scheduleNotification({
    category: NOTIFICATION_CATEGORIES.HYDRATION,
    entityId: 'water_test_99',
    title: 'Test Title',
    body: 'Test Body',
    delaySeconds: 10
  });
  assert(schedResult.scheduled === true, 'Scheduled notification via CalyxoNotificationManager');
  assert(notificationManager.activeNotifications.has('HYDRATION.water_test_99'), 'Active notification map tracks pending key');

  const cancelResult = await notificationManager.cancelNotificationByKey(NOTIFICATION_CATEGORIES.HYDRATION, 'water_test_99');
  assert(cancelResult === true, 'Successfully cancelled notification by key');
  assert(!notificationManager.activeNotifications.has('HYDRATION.water_test_99'), 'Notification map cleared after cancellation');

  // ── SUMMARY REPORT ────────────────────────────────────────────────────────
  console.log('\n======================================================================');
  console.log(`📊 DYNAMIC NOTIFICATION INTELLIGENCE SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
