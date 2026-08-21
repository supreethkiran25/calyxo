/**
 * Calyxo AI Fair-Use & Monthly Quota Limiter
 *
 * Enforces canonical usage policies:
 * - Free Tier: 10 AI interactions per calendar month
 * - Premium Tier: Unlimited standard AI interactions with fair-use protections
 */

import { SubscriptionManager, FREE_MONTHLY_AI_LIMIT } from '../subscription/SubscriptionManager.js';

export class AIUsageLimiter {
  static getUsageKey(userId = 'guest') {
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    return `calyxo_ai_usage_${userId}_${currentMonth}`;
  }

  static getMonthlyUsageCount(userId = 'guest') {
    try {
      const key = this.getUsageKey(userId);
      const raw = localStorage.getItem(key);
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  static checkQuota(userProfile = {}, user = {}) {
    const isPremium = SubscriptionManager.isPremium(userProfile, user);
    const userId = user?.id || userProfile?.id || 'guest';
    const usedCount = this.getMonthlyUsageCount(userId);

    if (isPremium) {
      return {
        allowed: true,
        isPremium: true,
        limit: Infinity,
        used: usedCount,
        remaining: Infinity,
        reason: 'Unlimited Premium AI Active'
      };
    }

    const remaining = Math.max(0, FREE_MONTHLY_AI_LIMIT - usedCount);
    const allowed = remaining > 0;

    return {
      allowed,
      isPremium: false,
      limit: FREE_MONTHLY_AI_LIMIT,
      used: usedCount,
      remaining,
      reason: allowed 
        ? `${remaining} of ${FREE_MONTHLY_AI_LIMIT} free monthly AI interactions remaining`
        : `Free monthly AI limit reached (${FREE_MONTHLY_AI_LIMIT}/${FREE_MONTHLY_AI_LIMIT}). Upgrade to Calyxo Premium for unlimited AI.`
    };
  }

  static recordInteraction(userProfile = {}, user = {}) {
    const isPremium = SubscriptionManager.isPremium(userProfile, user);
    const userId = user?.id || userProfile?.id || 'guest';
    const key = this.getUsageKey(userId);
    const current = this.getMonthlyUsageCount(userId);
    
    try {
      localStorage.setItem(key, String(current + 1));
    } catch (e) {}

    return this.checkQuota(userProfile, user);
  }
}

export const aiUsageLimiter = AIUsageLimiter;
export default AIUsageLimiter;
