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
   * Helper to retrieve admin-granted subscription override for the given user/profile
   */
  static getAdminGrantedOverride(userProfile = {}, user = {}) {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('calyxo_admin_granted_subscriptions');
      if (!raw) return null;
      const grants = JSON.parse(raw);
      if (!grants || typeof grants !== 'object') return null;

      const uid = user?.uid || user?.id || userProfile?.id;
      const email = (user?.email || userProfile?.email || '').toLowerCase().trim();

      return (uid && grants[uid]) || (email && grants[email]) || null;
    } catch (e) {
      return null;
    }
  }

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

    // Check admin-granted override (from Admin CRM manual grants / revokes)
    const adminGrant = this.getAdminGrantedOverride(userProfile, user);
    if (adminGrant) {
      const isRevoked = adminGrant.plan === 'FREE' || adminGrant.status === 'Revoked';
      if (isRevoked) {
        return {
          state: SUBSCRIPTION_STATES.EXPIRED,
          tier: SUBSCRIPTION_TIERS.FREE,
          isActive: false,
          isSubscribed: false,
          expiresAt: adminGrant.expiryDate || null,
          planName: 'Free Tier'
        };
      }

      const grantExpStr = adminGrant.expiryDate;
      if (grantExpStr) {
        const grantExpDate = new Date(grantExpStr);
        if (grantExpDate < new Date()) {
          return {
            state: SUBSCRIPTION_STATES.EXPIRED,
            tier: SUBSCRIPTION_TIERS.FREE,
            isActive: false,
            isSubscribed: false,
            expiresAt: grantExpStr,
            planName: 'Expired'
          };
        }
      }

      const grantPlan = (adminGrant.plan || 'HIGH').toUpperCase();
      const normalizedTier = (grantPlan === 'HIGH' || grantPlan === 'ULTRA' || grantPlan === 'HIGH_ANNUAL')
        ? SUBSCRIPTION_TIERS.HIGH
        : SUBSCRIPTION_TIERS.MEDIUM;

      return {
        state: SUBSCRIPTION_STATES.ACTIVE,
        tier: normalizedTier,
        isActive: true,
        isSubscribed: true,
        expiresAt: grantExpStr || null,
        planName: normalizedTier === SUBSCRIPTION_TIERS.HIGH ? 'Calyxo Ultra' : 'Calyxo Pro'
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

  /**
   * Return canonical subscription timeline with verified dates (Zero date fabrication)
   * Includes exact days/hours countdown and 5-day expiry warning triggers
   */
  static getSubscriptionTimeline(userProfile = {}, user = {}) {
    const status = this.getSubscriptionStatus(userProfile, user);
    const adminGrant = this.getAdminGrantedOverride(userProfile, user);
    const isCancelled = Boolean(userProfile?.is_cancelled || userProfile?.isCancelled);
    const isAutoRenew = userProfile?.auto_renew !== false && userProfile?.autoRenew !== false && !isCancelled && !adminGrant;
    
    // Derive accurate start and expiry dates
    let startedAt = adminGrant?.grantedAt || userProfile?.subscription_created_at || userProfile?.subscriptionCreatedAt || userProfile?.created_at || null;
    let expiresAt = adminGrant?.expiryDate || userProfile?.subscriptionExpiresAt || userProfile?.subscription_expiry || userProfile?.expiryDate || userProfile?.subscriptionPeriodEnd || userProfile?.subscription_period_end || status.expiresAt || null;

    // If active plan has no explicit expiry, compute from start date (default 30 days monthly, 365 annual)
    if (status.isActive && status.tier !== SUBSCRIPTION_TIERS.FREE && !expiresAt) {
      const baseStart = startedAt ? new Date(startedAt) : new Date();
      const isAnnual = String(adminGrant?.plan || userProfile?.subscriptionPlan || '').toUpperCase().includes('ANNUAL');
      const targetExp = new Date(baseStart);
      targetExp.setDate(targetExp.getDate() + (isAnnual ? 365 : 30));
      expiresAt = targetExp.toISOString();
    }

    const nextBillingDate = userProfile?.next_billing_date || userProfile?.nextBillingDate || (isAutoRenew ? expiresAt : null);

    // Calculate countdown
    let daysRemaining = 0;
    let hoursRemaining = 0;
    let isExpiringSoon = false;
    let isExpired = false;
    let countdownString = 'Free Tier';

    if (expiresAt && status.tier !== SUBSCRIPTION_TIERS.FREE) {
      const now = Date.now();
      const expTime = new Date(expiresAt).getTime();
      const diffMs = expTime - now;

      if (diffMs > 0) {
        daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (daysRemaining > 1) {
          countdownString = `${daysRemaining} days left`;
        } else if (daysRemaining === 1) {
          countdownString = `1 day, ${hoursRemaining}h left`;
        } else {
          countdownString = `${hoursRemaining}h remaining`;
        }

        // 5-day expiry warning flag
        if (daysRemaining <= 5) {
          isExpiringSoon = true;
        }
      } else {
        isExpired = true;
        const daysPast = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        countdownString = daysPast === 0 ? 'Expired today' : `Expired ${daysPast}d ago`;
      }
    } else if (status.tier === SUBSCRIPTION_TIERS.FREE) {
      countdownString = 'Forever Free';
    }

    let timelineLabel = null;
    let timelineDate = null;

    if (isExpired || status.state === SUBSCRIPTION_STATES.EXPIRED) {
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

    return {
      planName: status.planName,
      status: isExpired ? SUBSCRIPTION_STATES.EXPIRED : status.state,
      tier: isExpired ? SUBSCRIPTION_TIERS.FREE : status.tier,
      isActive: isExpired ? false : status.isActive,
      isSubscribed: isExpired ? false : status.isSubscribed,
      isCancelled,
      startedAt,
      nextBillingDate: isCancelled ? null : nextBillingDate,
      expiresAt,
      daysRemaining,
      hoursRemaining,
      isExpiringSoon,
      isExpired,
      countdownString,
      timelineLabel,
      timelineDate
    };
  }

  /**
   * Check for 5-day expiration and fire warning notification
   */
  static checkAndSendExpiryAlert(userProfile, user, notifyFn) {
    const timeline = this.getSubscriptionTimeline(userProfile, user);
    if (!timeline.isExpiringSoon || !timeline.daysRemaining) return false;

    const cacheKey = `calyxo_expiry_notif_${userProfile?.id || user?.id || 'me'}_d${timeline.daysRemaining}`;
    if (typeof window !== 'undefined' && localStorage.getItem(cacheKey)) {
      return false; // Already alerted for this remaining-day count
    }

    const message = `⚠️ Your Calyxo ${timeline.planName} plan expires in ${timeline.daysRemaining} days. Renew now to avoid losing AI Coach & health telemetry access!`;
    
    if (typeof notifyFn === 'function') {
      notifyFn(message);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, new Date().toISOString());
      
      // Also register system notification
      try {
        const notifs = JSON.parse(localStorage.getItem('calyxo_system_notifications') || '[]');
        notifs.unshift({
          id: `expiry_notif_${Date.now()}`,
          title: 'Subscription Expiring Soon',
          message,
          type: 'warning',
          created_at: new Date().toISOString(),
          read: false
        });
        localStorage.setItem('calyxo_system_notifications', JSON.stringify(notifs.slice(0, 50)));
      } catch (e) {}
    }

    return true;
  }
}

export const subscriptionManager = SubscriptionManager;
export default SubscriptionManager;
