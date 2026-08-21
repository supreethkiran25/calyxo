/**
 * Calyxo Advanced Gamification & Social Competition Engine
 *
 * Rules:
 * 1. Rewards (XP, Badges, Levels) are strictly derived from verified user actions.
 * 2. Idempotency: prevents duplicate rewards for the same underlying event ID.
 * 3. Privacy-First Social Architecture: defaults to PRIVATE with optional FRIENDS/TEAM/PUBLIC scopes.
 */

export const GAMIFICATION_EVENTS = {
  WORKOUT_COMPLETED: 'WORKOUT_COMPLETED',
  SET_COMPLETED: 'SET_COMPLETED',
  HYDRATION_GOAL_MET: 'HYDRATION_GOAL_MET',
  MACRO_GOAL_MET: 'MACRO_GOAL_MET',
  STREAK_MILESTONE: 'STREAK_MILESTONE',
  RECOVERY_CHECKIN: 'RECOVERY_CHECKIN'
};

export const XP_REWARDS = {
  [GAMIFICATION_EVENTS.WORKOUT_COMPLETED]: 100,
  [GAMIFICATION_EVENTS.SET_COMPLETED]: 5,
  [GAMIFICATION_EVENTS.HYDRATION_GOAL_MET]: 50,
  [GAMIFICATION_EVENTS.MACRO_GOAL_MET]: 50,
  [GAMIFICATION_EVENTS.STREAK_MILESTONE]: 250,
  [GAMIFICATION_EVENTS.RECOVERY_CHECKIN]: 20
};

export const SOCIAL_PRIVACY_SCOPES = {
  PRIVATE: 'PRIVATE',
  FRIENDS: 'FRIENDS',
  TEAM: 'TEAM',
  PUBLIC: 'PUBLIC'
};
export const PRIVACY_SCOPES = SOCIAL_PRIVACY_SCOPES;

export class AdvancedGamificationEngine {
  constructor() {
    this.totalXp = 0;
    this.claimedEventIds = new Set();
    this.unlockedBadges = new Set();
    this.privacyScope = SOCIAL_PRIVACY_SCOPES.PRIVATE;
    this.restoreState();
  }

  restoreState() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('calyxo_gamification_state_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.totalXp = parsed.totalXp || 0;
          this.claimedEventIds = new Set(parsed.claimedEventIds || []);
          this.unlockedBadges = new Set(parsed.unlockedBadges || []);
          this.privacyScope = parsed.privacyScope || SOCIAL_PRIVACY_SCOPES.PRIVATE;
        }
      } catch (e) {}
    }
  }

  persistState() {
    if (typeof localStorage !== 'undefined') {
      try {
        const payload = {
          totalXp: this.totalXp,
          claimedEventIds: Array.from(this.claimedEventIds).slice(-500),
          unlockedBadges: Array.from(this.unlockedBadges),
          privacyScope: this.privacyScope
        };
        localStorage.setItem('calyxo_gamification_state_v1', JSON.stringify(payload));
      } catch (e) {}
    }
  }

  /**
   * Calculate User Level based on Quadratic XP progression
   * Level 1: 0 XP, Level 2: 100 XP, Level 3: 400 XP, Level 4: 900 XP...
   */
  getLevel() {
    return Math.floor(Math.sqrt(this.totalXp / 100)) + 1;
  }

  getXpForNextLevel() {
    const currentLvl = this.getLevel();
    const nextLvlXp = Math.pow(currentLvl, 2) * 100;
    const currentLvlBaseXp = Math.pow(currentLvl - 1, 2) * 100;
    const progressInLvl = this.totalXp - currentLvlBaseXp;
    const neededInLvl = nextLvlXp - currentLvlBaseXp;

    return {
      currentLevel: currentLvl,
      nextLevel: currentLvl + 1,
      totalXp: this.totalXp,
      progressInLvl,
      neededInLvl,
      percent: Math.min(100, Math.round((progressInLvl / neededInLvl) * 100))
    };
  }

  /**
   * Process a verified user action and award XP idempotently
   */
  awardEventXp(eventType, eventUniqueId) {
    if (!eventUniqueId || this.claimedEventIds.has(eventUniqueId)) {
      return { awarded: false, reason: 'Duplicate event already rewarded' };
    }

    const xp = XP_REWARDS[eventType] || 0;
    if (xp > 0) {
      this.claimedEventIds.add(eventUniqueId);
      this.totalXp += xp;
      this.persistState();
      return { awarded: true, xpAwarded: xp, newTotalXp: this.totalXp, levelInfo: this.getXpForNextLevel() };
    }

    return { awarded: false, reason: 'No XP configured for event' };
  }

  /**
   * Set Social Competition Privacy Scope
   */
  setPrivacyScope(scope) {
    if (Object.values(SOCIAL_PRIVACY_SCOPES).includes(scope)) {
      this.privacyScope = scope;
      this.persistState();
    }
  }

  getPrivacyScope() {
    return this.privacyScope;
  }

  getTotalXp() {
    return this.totalXp;
  }

  getTotalXP() {
    return this.totalXp;
  }

  awardXP(xp, eventType, eventUniqueId) {
    if (!eventUniqueId || this.claimedEventIds.has(eventUniqueId)) {
      return { success: false, duplicate: true, reason: 'Duplicate event already rewarded' };
    }
    this.claimedEventIds.add(eventUniqueId);
    this.totalXp += xp;
    this.persistState();
    return { success: true, newTotalXP: this.totalXp, levelInfo: this.getXpForNextLevel() };
  }

  resetState() {
    this.totalXp = 0;
    this.claimedEventIds.clear();
    this.unlockedBadges.clear();
    this.privacyScope = SOCIAL_PRIVACY_SCOPES.PRIVATE;
    this.persistState();
  }
}

export const gamificationEngine = new AdvancedGamificationEngine();
export const advancedGamificationEngine = gamificationEngine;
export default gamificationEngine;
