/**
 * Calyxo Canonical Subscription & Entitlements Manager
 *
 * Provides single source of truth for user subscription state, tier capabilities,
 * feature gating, and AI access rate limits across Web, iOS, and Android.
 */

import { supabase } from '../../lib/supabaseClient';

export const SUBSCRIPTION_STATES = {
  NOT_SUBSCRIBED: 'NOT_SUBSCRIBED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRING: 'EXPIRING',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED'
};

export const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  TRAINER: 'TRAINER',
  ADMIN: 'ADMIN'
};

export const AI_CAPABILITIES = {
  // Free Preview Tier
  BASIC_INTELLIGENCE_PREVIEW: 'BASIC_INTELLIGENCE_PREVIEW',
  CORE_TRACKING: 'CORE_TRACKING',

  // Premium Intelligence Suite
  AI_MEAL_PLANNER: 'AI_MEAL_PLANNER',                     // 6. AI Nutrition Intelligence (Planner + Auto Grocery)
  ADVANCED_FOOD_INTELLIGENCE: 'ADVANCED_FOOD_INTELLIGENCE', // 7. Advanced Food Range Est + Quality + Gaps
  AI_WORKOUT_COACH: 'AI_WORKOUT_COACH',                   // 8. Adaptive Workout Coach + Progressive Overload
  ADVANCED_WEARABLE_INTELLIGENCE: 'ADVANCED_WEARABLE_INTELLIGENCE', // 10. Multi-Device Unified Health Model
  REALTIME_WORKOUT_INTELLIGENCE: 'REALTIME_WORKOUT_INTELLIGENCE',   // 11. Live HR Zone Coaching & Intensity Alert
  PERSONAL_HEALTH_REPORTS: 'PERSONAL_HEALTH_REPORTS',     // 13. Weekly Calyxo Report (Improvements & Gaps)
  DAILY_AI_BRIEFING: 'DAILY_AI_BRIEFING',                 // 14. Daily Morning AI Briefing & Focus
  UNLIMITED_AI: 'UNLIMITED_AI',                           // 17. Unlimited AI Interactions (Free = 10/month)
  
  // Legacy / Advanced Capabilities
  DYNAMIC_WORKOUT_PLANNING: 'DYNAMIC_WORKOUT_PLANNING',
  DYNAMIC_MEAL_PLANNING: 'DYNAMIC_MEAL_PLANNING',
  PLAN_MODIFICATION: 'PLAN_MODIFICATION',
  IN_APP_PLAN_INJECTION: 'IN_APP_PLAN_INJECTION',
  PREDICTIVE_INSIGHTS: 'PREDICTIVE_INSIGHTS',
  GROCERY_LIST_COMPILATION: 'GROCERY_LIST_COMPILATION',
  CLIENT_PROGRAMMING: 'CLIENT_PROGRAMMING',
  GYM_BUSINESS_INTELLIGENCE: 'GYM_BUSINESS_INTELLIGENCE'
};

// Free Tier: Core tracking, basic logging, basic wearable sync, basic Live Activity, 10 AI interactions/mo
const FREE_ENTITLEMENTS = [
  AI_CAPABILITIES.BASIC_INTELLIGENCE_PREVIEW,
  AI_CAPABILITIES.CORE_TRACKING
];

// Premium Tier (Medium / High / Trainer / Admin): Full AI & Advanced Intelligence Suite
const PREMIUM_ENTITLEMENTS = [
  AI_CAPABILITIES.BASIC_INTELLIGENCE_PREVIEW,
  AI_CAPABILITIES.CORE_TRACKING,
  AI_CAPABILITIES.AI_MEAL_PLANNER,
  AI_CAPABILITIES.ADVANCED_FOOD_INTELLIGENCE,
  AI_CAPABILITIES.AI_WORKOUT_COACH,
  AI_CAPABILITIES.ADVANCED_WEARABLE_INTELLIGENCE,
  AI_CAPABILITIES.REALTIME_WORKOUT_INTELLIGENCE,
  AI_CAPABILITIES.PERSONAL_HEALTH_REPORTS,
  AI_CAPABILITIES.DAILY_AI_BRIEFING,
  AI_CAPABILITIES.UNLIMITED_AI,
  AI_CAPABILITIES.DYNAMIC_WORKOUT_PLANNING,
  AI_CAPABILITIES.DYNAMIC_MEAL_PLANNING,
  AI_CAPABILITIES.PLAN_MODIFICATION,
  AI_CAPABILITIES.IN_APP_PLAN_INJECTION,
  AI_CAPABILITIES.PREDICTIVE_INSIGHTS,
  AI_CAPABILITIES.GROCERY_LIST_COMPILATION
];

const TIER_ENTITLEMENTS = {
  [SUBSCRIPTION_TIERS.FREE]: FREE_ENTITLEMENTS,
  [SUBSCRIPTION_TIERS.MEDIUM]: PREMIUM_ENTITLEMENTS,
  [SUBSCRIPTION_TIERS.HIGH]: PREMIUM_ENTITLEMENTS,
  [SUBSCRIPTION_TIERS.TRAINER]: [
    ...PREMIUM_ENTITLEMENTS,
    AI_CAPABILITIES.CLIENT_PROGRAMMING
  ],
  [SUBSCRIPTION_TIERS.ADMIN]: Object.values(AI_CAPABILITIES)
};

export const FREE_MONTHLY_AI_LIMIT = 10;

export const PLAN_DURATIONS_MS = {
  HIGH: 30 * 24 * 60 * 60 * 1000,         // 1 Month (30 days)
  MEDIUM: 30 * 24 * 60 * 60 * 1000,       // 1 Month (30 days)
  PRO: 30 * 24 * 60 * 60 * 1000,          // 1 Month (30 days)
  ULTRA: 30 * 24 * 60 * 60 * 1000,        // 1 Month (30 days)
  HIGH_ANNUAL: 365 * 24 * 60 * 60 * 1000, // 1 Year (365 days)
  ANNUAL: 365 * 24 * 60 * 60 * 1000
};

export class SubscriptionManager {
  /**
   * Determine Canonical Subscription State from User Profile & Subscription Record
   */
  static getSubscriptionStatus(userProfile = {}, user = {}) {
    const email = (user?.email || userProfile?.email || '').toLowerCase().trim();
    // Admin and trainer status must come from the database-synced role field — never from hardcoded emails
    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || user?.role === 'super_admin' || user?.isAdminSession === true;
    const isTrainer = userProfile?.role === 'trainer';

    if (isAdmin) {
      return {
        state: SUBSCRIPTION_STATES.ACTIVE,
        tier: SUBSCRIPTION_TIERS.ADMIN,
        isActive: true,
        isSubscribed: true,
        isExpired: false,
        expiresAt: null,
        daysRemaining: 9999,
        planName: 'Calyxo Admin OS',
        planDurationLabel: 'Lifetime Admin Access',
        expiryCountdown: 'Permanent Access'
      };
    }

    if (isTrainer) {
      return {
        state: SUBSCRIPTION_STATES.ACTIVE,
        tier: SUBSCRIPTION_TIERS.TRAINER,
        isActive: true,
        isSubscribed: true,
        isExpired: false,
        expiresAt: null,
        daysRemaining: 9999,
        planName: 'Calyxo Trainer Suite',
        planDurationLabel: 'Trainer License',
        expiryCountdown: 'Active License'
      };
    }

    const plan = (userProfile?.subscriptionPlan || userProfile?.subscription_plan || userProfile?.activePass || 'FREE').toUpperCase();
    const isPaidPlan = plan !== 'FREE' && plan !== 'DEFAULT';
    const isAnnual = plan === 'HIGH_ANNUAL' || plan === 'ANNUAL';
    const durationDays = isAnnual ? 365 : 30;
    const durationMs = durationDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    let expiryStr = userProfile?.subscriptionExpiresAt || userProfile?.subscription_expiry || userProfile?.subscriptionExpiry || userProfile?.expiryDate || userProfile?.subscriptionPeriodEnd || userProfile?.subscription_period_end || null;
    const baseDate = userProfile?.subscriptionDate || userProfile?.subscription_created_at || userProfile?.purchase_date || userProfile?.created_at || null;
    let baseTime = baseDate ? new Date(baseDate).getTime() : NaN;
    if (isNaN(baseTime)) baseTime = now;

    // If user has a paid plan but no expiry was saved, calculate from enrollment
    if (isPaidPlan && !expiryStr) {
      expiryStr = new Date(baseTime + durationMs).toISOString();
    }

    // MODEL RECONCILIATION: For a monthly plan, expiry date can never exceed 31 days in the future
    if (isPaidPlan && !isAnnual && expiryStr) {
      let expiryTime = new Date(expiryStr).getTime();
      if (!isNaN(expiryTime) && (expiryTime - now > 31 * 24 * 60 * 60 * 1000)) {
        const elapsed = Math.max(0, now - baseTime);
        const cycles = Math.floor(elapsed / durationMs);
        const currentCycleEnd = baseTime + (cycles + 1) * durationMs;
        expiryTime = currentCycleEnd > now ? currentCycleEnd : (now + durationMs);
        expiryStr = new Date(expiryTime).toISOString();
      }
    }

    let isExpired = false;
    let msRemaining = 0;
    let daysRemaining = null;
    let hoursRemaining = null;
    let minutesRemaining = null;
    let secondsRemaining = null;

    if (expiryStr) {
      const expiryTime = new Date(expiryStr).getTime();
      if (!isNaN(expiryTime)) {
        msRemaining = expiryTime - now;
        if (msRemaining <= 0) {
          isExpired = true;
          daysRemaining = 0;
          hoursRemaining = 0;
          minutesRemaining = 0;
          secondsRemaining = 0;
        } else {
          daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
          hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
          secondsRemaining = Math.floor((msRemaining % (1000 * 60)) / 1000);
        }
      }
    }

    const planDurationLabel = isAnnual ? '1 Year (365 Days)' : '1 Month (30 Days)';

    if (isExpired) {
      return {
        state: SUBSCRIPTION_STATES.EXPIRED,
        tier: SUBSCRIPTION_TIERS.FREE,
        isActive: false,
        isSubscribed: false,
        isExpired: true,
        expiresAt: expiryStr,
        msRemaining: 0,
        daysRemaining: 0,
        hoursRemaining: 0,
        minutesRemaining: 0,
        secondsRemaining: 0,
        isAnnual,
        durationDays,
        planName: 'Expired',
        originalPlan: plan,
        planDurationLabel,
        expiryFormatted: expiryStr ? new Date(expiryStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        expiryCountdown: 'Expired'
      };
    }

    if (isPaidPlan || Boolean(userProfile?.isSubscribed || userProfile?.is_subscribed)) {
      const normalizedTier = (plan === 'HIGH' || plan === 'ULTRA' || plan === 'HIGH_ANNUAL') ? SUBSCRIPTION_TIERS.HIGH : SUBSCRIPTION_TIERS.MEDIUM;
      const isExpiringSoon = daysRemaining !== null && daysRemaining <= 3;
      const expiryCountdown = daysRemaining !== null 
        ? (daysRemaining > 0 
            ? `${daysRemaining} days left` 
            : (hoursRemaining > 0 ? `${hoursRemaining} hours left` : `${minutesRemaining}m ${secondsRemaining}s left`)) 
        : null;

      return {
        state: isExpiringSoon ? SUBSCRIPTION_STATES.EXPIRING : SUBSCRIPTION_STATES.ACTIVE,
        tier: normalizedTier,
        isActive: true,
        isSubscribed: true,
        isExpired: false,
        expiresAt: expiryStr || null,
        msRemaining,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        secondsRemaining,
        isAnnual,
        durationDays,
        planName: normalizedTier === SUBSCRIPTION_TIERS.HIGH ? 'Calyxo Ultra' : 'Calyxo Pro',
        planDurationLabel,
        expiryFormatted: expiryStr ? new Date(expiryStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        expiryCountdown
      };
    }

    return {
      state: SUBSCRIPTION_STATES.NOT_SUBSCRIBED,
      tier: SUBSCRIPTION_TIERS.FREE,
      isActive: false,
      isSubscribed: false,
      isExpired: false,
      expiresAt: null,
      msRemaining: 0,
      daysRemaining: null,
      hoursRemaining: null,
      minutesRemaining: null,
      secondsRemaining: null,
      isAnnual: false,
      durationDays: 0,
      planName: 'Free Athlete',
      planDurationLabel: 'Forever Free',
      expiryCountdown: null
    };
  }

  /**
   * Check if User has entitlement for specific AI capability
   */
  static hasAICapability(capability, userProfile = {}, user = {}) {
    const status = this.getSubscriptionStatus(userProfile, user);
    const allowed = TIER_ENTITLEMENTS[status.tier] || TIER_ENTITLEMENTS[SUBSCRIPTION_TIERS.FREE];
    return allowed.includes(capability);
  }

  /**
   * Check if User is on any active Premium Tier
   */
  static isPremium(userProfile = {}, user = {}) {
    const status = this.getSubscriptionStatus(userProfile, user);
    return status.isActive && status.tier !== SUBSCRIPTION_TIERS.FREE;
  }

  /**
   * Return canonical subscription timeline with verified dates (Zero date fabrication)
   */
  static getSubscriptionTimeline(userProfile = {}, user = {}) {
    const status = this.getSubscriptionStatus(userProfile, user);
    const isCancelled = Boolean(userProfile?.is_cancelled || userProfile?.isCancelled);
    const isAutoRenew = userProfile?.auto_renew !== false && userProfile?.autoRenew !== false && !isCancelled;
    const startedAt = userProfile?.subscription_created_at || userProfile?.subscriptionCreatedAt || userProfile?.subscriptionDate || userProfile?.created_at || null;
    const expiresAt = status.expiresAt;
    const nextBillingDate = userProfile?.next_billing_date || userProfile?.nextBillingDate || (isAutoRenew ? expiresAt : null);

    let timelineLabel = null;
    let timelineDate = null;

    if (status.state === SUBSCRIPTION_STATES.EXPIRED) {
      timelineLabel = 'Expired';
      timelineDate = expiresAt;
    } else if (isCancelled && expiresAt) {
      timelineLabel = 'Active until';
      timelineDate = expiresAt;
    } else if (status.isActive && isAutoRenew && nextBillingDate) {
      timelineLabel = 'Next billing';
      timelineDate = nextBillingDate;
    } else if (status.isActive && expiresAt) {
      timelineLabel = 'Expires';
      timelineDate = expiresAt;
    }

    const displayTimelineLabel = status.state === SUBSCRIPTION_STATES.EXPIRED
      ? 'Expired on'
      : (status.state === SUBSCRIPTION_STATES.EXPIRING
        ? 'Expires in'
        : (isCancelled
          ? 'Active until'
          : (isAutoRenew && nextBillingDate ? 'Renews on' : 'Plan expires on')));

    return {
      planName: status.planName,
      status: status.state,
      tier: status.tier,
      isActive: status.isActive,
      isSubscribed: status.isSubscribed,
      isExpired: status.isExpired,
      isCancelled,
      startedAt,
      nextBillingDate: isCancelled ? null : nextBillingDate,
      expiresAt: status.expiresAt,
      msRemaining: status.msRemaining,
      daysRemaining: status.daysRemaining,
      hoursRemaining: status.hoursRemaining,
      minutesRemaining: status.minutesRemaining,
      secondsRemaining: status.secondsRemaining,
      isAnnual: status.isAnnual,
      durationDays: status.durationDays,
      expiryCountdown: status.expiryCountdown,
      expiryFormatted: status.expiryFormatted,
      planDurationLabel: status.planDurationLabel,
      displayTimelineLabel,
      timelineLabel,
      timelineDate
    };
  }

  /**
   * Authoritative Live Sync with Supabase / Razorpay subscriptions table
   */
  static async syncLiveSubscriptionStatus(userId, userEmail) {
    if (!userId && !userEmail) return null;
    try {
      let query = supabase.from('subscriptions').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('customer_email', userEmail.toLowerCase().trim());
      }
      const { data, error } = await query.order('created_at', { ascending: false }).limit(1);
      if (error) {
        console.warn('[SubscriptionManager] syncLiveSubscriptionStatus query error:', error);
        return null;
      }
      if (data && data.length > 0) {
        const sub = data[0];
        const statusUpper = (sub.status || '').toUpperCase();
        const isActive = statusUpper === 'ACTIVE' || statusUpper === 'CAPTURED';
        const rawPlan = (sub.plan || 'HIGH').toUpperCase();
        const isAnnual = rawPlan === 'HIGH_ANNUAL' || rawPlan === 'ANNUAL';
        const durationDays = isAnnual ? 365 : 30;
        const durationMs = durationDays * 24 * 60 * 60 * 1000;
        const nowMs = Date.now();

        let purchaseDateStr = sub.purchase_date || sub.current_period_start || sub.created_at || new Date().toISOString();
        let baseTime = new Date(purchaseDateStr).getTime();
        if (isNaN(baseTime)) baseTime = nowMs;

        let expiryDateStr = sub.expiry_date || sub.current_period_end;
        if (!expiryDateStr) {
          expiryDateStr = new Date(baseTime + durationMs).toISOString();
        } else {
          let parsedExpiry = new Date(expiryDateStr).getTime();
          if (!isAnnual && !isNaN(parsedExpiry) && (parsedExpiry - nowMs > 31 * 24 * 60 * 60 * 1000)) {
            const elapsed = Math.max(0, nowMs - baseTime);
            const cycles = Math.floor(elapsed / durationMs);
            const currentCycleEnd = baseTime + (cycles + 1) * durationMs;
            expiryDateStr = new Date(currentCycleEnd > nowMs ? currentCycleEnd : (nowMs + durationMs)).toISOString();
          }
        }

        return {
          plan: rawPlan,
          status: sub.status,
          isActive,
          isAnnual,
          durationDays,
          purchaseDate: purchaseDateStr,
          expiryDate: expiryDateStr,
          paymentId: sub.payment_id,
          amount: sub.amount,
          currency: sub.currency,
          paymentSource: sub.payment_source || sub.granted_by || 'Razorpay Gateway',
          grantedBy: sub.granted_by
        };
      }
      return null;
    } catch (err) {
      console.warn('[SubscriptionManager] Live sync exception:', err);
      return null;
    }
  }
}

export const subscriptionManager = SubscriptionManager;
export default SubscriptionManager;
