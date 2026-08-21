/**
 * Calyxo Centralized Premium Entitlement Service
 *
 * Unified single source of truth for checking feature authorization,
 * subscription tier boundaries, expiration policies, and grace periods across
 * Web, iOS, and Android.
 */

import { SubscriptionManager, SUBSCRIPTION_STATES, SUBSCRIPTION_TIERS, AI_CAPABILITIES, FREE_MONTHLY_AI_LIMIT } from './SubscriptionManager.js';

export { SUBSCRIPTION_STATES, SUBSCRIPTION_TIERS, AI_CAPABILITIES, FREE_MONTHLY_AI_LIMIT };

export class PremiumEntitlementService {
  /**
   * Check if user is entitled to a specific capability or feature
   * @param {string} capability - from AI_CAPABILITIES
   * @param {object} userProfile
   * @param {object} user
   * @returns {boolean}
   */
  static isEntitled(capability, userProfile = {}, user = {}) {
    return SubscriptionManager.hasAICapability(capability, userProfile, user);
  }

  /**
   * Detailed entitlement check with reason and metadata
   * @param {string} capability
   * @param {object} userProfile
   * @param {object} user
   * @returns {{ entitled: boolean, tier: string, state: string, reason: string }}
   */
  static checkEntitlement(capability, userProfile = {}, user = {}) {
    const status = SubscriptionManager.getSubscriptionStatus(userProfile, user);
    const entitled = SubscriptionManager.hasAICapability(capability, userProfile, user);

    let reason = 'Entitled';
    if (!entitled) {
      if (status.state === SUBSCRIPTION_STATES.EXPIRED) {
        reason = 'Subscription expired. Please renew to access premium intelligence.';
      } else if (status.state === SUBSCRIPTION_STATES.NOT_SUBSCRIBED) {
        reason = 'Feature requires Calyxo Pro or Ultra subscription.';
      } else {
        reason = 'This capability requires a higher tier plan.';
      }
    }

    return {
      entitled,
      tier: status.tier,
      state: status.state,
      isActive: status.isActive,
      expiresAt: status.expiresAt,
      reason
    };
  }

  /**
   * Fast boolean check for whether user has active premium status
   * @param {object} userProfile
   * @param {object} user
   * @returns {boolean}
   */
  static isPremium(userProfile = {}, user = {}) {
    return SubscriptionManager.isPremium(userProfile, user);
  }

  /**
   * Returns full subscription summary
   * @param {object} userProfile
   * @param {object} user
   */
  static getSubscriptionSummary(userProfile = {}, user = {}) {
    return SubscriptionManager.getSubscriptionStatus(userProfile, user);
  }

  /**
   * Enforces grace period if payment was recent but webhook slightly delayed (e.g. 48h grace)
   * @param {object} userProfile
   * @param {number} gracePeriodHours
   * @returns {boolean}
   */
  static isInGracePeriod(userProfile = {}, gracePeriodHours = 48) {
    const lastPaymentDate = userProfile?.lastPaymentTimestamp || userProfile?.last_payment_at;
    if (!lastPaymentDate) return false;

    const ageMs = Date.now() - new Date(lastPaymentDate).getTime();
    return ageMs <= (gracePeriodHours * 3600 * 1000);
  }
}

export const premiumEntitlementService = PremiumEntitlementService;
export default PremiumEntitlementService;
