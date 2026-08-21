/**
 * Calyxo Canonical Subscription & Entitlements Manager
 *
 * Provides single source of truth for user subscription state, tier capabilities,
 * feature gating, and AI access rate limits across Web, iOS, and Android.
 */

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
        expiresAt: null,
        planName: 'Calyxo Admin OS'
      };
    }

    if (isTrainer) {
      return {
        state: SUBSCRIPTION_STATES.ACTIVE,
        tier: SUBSCRIPTION_TIERS.TRAINER,
        isActive: true,
        isSubscribed: true,
        expiresAt: null,
        planName: 'Calyxo Trainer Suite'
      };
    }

    const plan = (userProfile?.subscriptionPlan || userProfile?.subscription_plan || userProfile?.activePass || 'FREE').toUpperCase();
    const isSubscribed = Boolean(userProfile?.isSubscribed || userProfile?.is_subscribed);
    const expiryStr = userProfile?.subscriptionExpiresAt || userProfile?.subscription_expiry || userProfile?.expiryDate || userProfile?.subscriptionPeriodEnd || userProfile?.subscription_period_end;

    if (expiryStr) {
      const expiryDate = new Date(expiryStr);
      if (expiryDate < new Date()) {
        return {
          state: SUBSCRIPTION_STATES.EXPIRED,
          tier: SUBSCRIPTION_TIERS.FREE,
          isActive: false,
          isSubscribed: false,
          expiresAt: expiryStr,
          planName: 'Expired'
        };
      }
    }

    if (isSubscribed || plan === 'HIGH' || plan === 'MEDIUM' || plan === 'PRO' || plan === 'ULTRA' || plan === 'HIGH_ANNUAL') {
      const normalizedTier = (plan === 'HIGH' || plan === 'ULTRA' || plan === 'HIGH_ANNUAL') ? SUBSCRIPTION_TIERS.HIGH : SUBSCRIPTION_TIERS.MEDIUM;
      return {
        state: SUBSCRIPTION_STATES.ACTIVE,
        tier: normalizedTier,
        isActive: true,
        isSubscribed: true,
        expiresAt: expiryStr || null,
        planName: normalizedTier === SUBSCRIPTION_TIERS.HIGH ? 'Calyxo Ultra' : 'Calyxo Pro'
      };
    }

    return {
      state: SUBSCRIPTION_STATES.NOT_SUBSCRIBED,
      tier: SUBSCRIPTION_TIERS.FREE,
      isActive: false,
      isSubscribed: false,
      expiresAt: null,
      planName: 'Free Tier'
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
}

export const subscriptionManager = SubscriptionManager;
export default SubscriptionManager;
