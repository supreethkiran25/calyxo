/**
 * Calyxo Canonical User Intelligence Profile Engine
 * 
 * Defines the canonical single-source-of-truth structure for user personalization.
 * Bridges onboarding, AI Health Twin, AI Workout Coach, AI Meal Planner, Recovery,
 * Wearable telemetry, and Smart Reminders.
 */

export const ONBOARDING_DRAFT_STORAGE_KEY = 'calyxo_onboarding_draft';

export const DEFAULT_USER_INTELLIGENCE_PROFILE = {
  identity: {
    age: 25,
    dob: '2001-01-01',
    sex: 'male', // 'male' | 'female' | 'other'
    height: 175, // cm
    weight: 70,  // kg
    targetWeight: null,
    waist: null,
    bodyFat: null
  },
  goals: {
    primaryGoal: 'build_muscle',
    secondaryGoals: [],
    primaryPriority: 'body_composition',
    targetWeight: null
  },
  training: {
    experience: 'intermediate',
    frequency: '3_4_days', // 'never' | '1_2_days' | '3_4_days' | '5_plus_days'
    duration: '45_60_min', // 'under_20' | '20_30' | '30_45' | '45_60' | '60_plus'
    environment: 'commercial_gym', // 'commercial_gym' | 'home_gym' | 'home_bodyweight' | 'outdoor' | 'running' | 'sports' | 'mixed'
    equipment: ['dumbbells', 'barbells', 'machines', 'cable_machines'],
    preferredStyles: ['strength', 'hypertrophy']
  },
  nutrition: {
    diet: 'non_vegetarian', // 'vegetarian' | 'vegan' | 'eggetarian' | 'non_vegetarian' | 'pescatarian' | 'other'
    cuisines: ['Indian', 'Western'],
    mealBehavior: 'mix_of_both', // 'mostly_home' | 'mostly_outside' | 'mix_of_both'
    nutritionPriority: 'high_protein', // 'fat_loss' | 'muscle_gain' | 'high_protein' | 'better_energy' | 'better_food_quality' | 'better_digestion' | 'balanced'
    budget: 'moderate',
    mealSchedule: {
      breakfast: true,
      lunch: true,
      dinner: true,
      snacks: false
    }
  },
  lifestyle: {
    activityLevel: 'somewhat_active', // 'mostly_sitting' | 'somewhat_active' | 'active' | 'very_active'
    workStyle: 'desk_based', // 'desk_based' | 'standing' | 'physical' | 'mixed'
    sleepDuration: '7_8h', // 'under_5h' | '5_6h' | '6_7h' | '7_8h' | '8h_plus'
    sleepConsistency: 'mostly_consistent', // 'very_consistent' | 'mostly_consistent' | 'changes_often' | 'highly_irregular'
    stressLevel: 'moderate' // 'low' | 'moderate' | 'high' | 'very_high'
  },
  limitations: {
    restrictions: ['none'],
    protectedAreas: [] // 'shoulder' | 'back' | 'knee' | 'hip' | 'ankle' | 'wrist' | 'other'
  },
  devices: {
    appleHealth: false,
    appleWatch: false,
    boat: false,
    garmin: false,
    fitbit: false,
    healthConnect: false,
    bleHeartRate: false,
    bleBloodPressure: false
  },
  coaching: {
    personality: 'direct', // 'supportive' | 'direct' | 'tough_love' | 'data_driven' | 'friendly' | 'minimal'
    verbosity: 'quick_explanation', // 'just_tell_me' | 'quick_explanation' | 'explain_numbers' | 'full_analysis'
    accountability: 'moderate', // 'none' | 'light' | 'moderate' | 'high'
    reminderStyle: 'motivational' // 'gentle' | 'direct' | 'motivational' | 'only_important'
  },
  story: {
    rawText: '',
    extractedContext: {},
    confidence: 1.0
  },
  permissions: {
    health: 'notDetermined',
    bluetooth: 'notDetermined',
    notifications: 'notDetermined'
  },
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export class UserIntelligenceProfile {
  /**
   * Deep sanitize and validate a profile payload
   */
  static sanitize(raw = {}) {
    if (!raw || typeof raw !== 'object') {
      return { ...DEFAULT_USER_INTELLIGENCE_PROFILE };
    }

    return {
      identity: {
        age: Number(raw.identity?.age || raw.age) || 25,
        dob: raw.identity?.dob || raw.dob || '2001-01-01',
        sex: raw.identity?.sex || raw.gender || 'male',
        height: Number(raw.identity?.height || raw.height) || 175,
        weight: Number(raw.identity?.weight || raw.weight) || 70,
        targetWeight: raw.identity?.targetWeight !== undefined ? raw.identity?.targetWeight : (raw.goalWeight !== undefined ? raw.goalWeight : null),
        waist: raw.identity?.waist !== undefined ? raw.identity?.waist : (raw.waist !== undefined ? raw.waist : null),
        bodyFat: raw.identity?.bodyFat !== undefined ? raw.identity?.bodyFat : (raw.bodyFat !== undefined ? raw.bodyFat : null)
      },
      goals: {
        primaryGoal: raw.goals?.primaryGoal || raw.goal || 'build_muscle',
        secondaryGoals: Array.isArray(raw.goals?.secondaryGoals) ? raw.goals.secondaryGoals : [],
        primaryPriority: raw.goals?.primaryPriority || 'body_composition',
        targetWeight: raw.goals?.targetWeight || raw.goalWeight || null
      },
      training: {
        experience: raw.training?.experience || raw.experience || 'intermediate',
        frequency: raw.training?.frequency || '3_4_days',
        duration: raw.training?.duration || '45_60_min',
        environment: raw.training?.environment || 'commercial_gym',
        equipment: Array.isArray(raw.training?.equipment) ? raw.training.equipment : ['dumbbells', 'barbells', 'machines'],
        preferredStyles: Array.isArray(raw.training?.preferredStyles) ? raw.training.preferredStyles : ['strength', 'hypertrophy']
      },
      nutrition: {
        diet: raw.nutrition?.diet || (Array.isArray(raw.dietPreferences) ? raw.dietPreferences[0] : 'non_vegetarian') || 'non_vegetarian',
        cuisines: Array.isArray(raw.nutrition?.cuisines) ? raw.nutrition.cuisines : ['Indian', 'Western'],
        mealBehavior: raw.nutrition?.mealBehavior || 'mix_of_both',
        nutritionPriority: raw.nutrition?.nutritionPriority || 'high_protein',
        budget: raw.nutrition?.budget || 'moderate',
        mealSchedule: raw.nutrition?.mealSchedule || { breakfast: true, lunch: true, dinner: true, snacks: false }
      },
      lifestyle: {
        activityLevel: raw.lifestyle?.activityLevel || 'somewhat_active',
        workStyle: raw.lifestyle?.workStyle || 'desk_based',
        sleepDuration: raw.lifestyle?.sleepDuration || '7_8h',
        sleepConsistency: raw.lifestyle?.sleepConsistency || 'mostly_consistent',
        stressLevel: raw.lifestyle?.stressLevel || 'moderate'
      },
      limitations: {
        restrictions: Array.isArray(raw.limitations?.restrictions) ? raw.limitations.restrictions : ['none'],
        protectedAreas: Array.isArray(raw.limitations?.protectedAreas) ? raw.limitations.protectedAreas : []
      },
      devices: {
        appleHealth: Boolean(raw.devices?.appleHealth),
        appleWatch: Boolean(raw.devices?.appleWatch),
        boat: Boolean(raw.devices?.boat),
        garmin: Boolean(raw.devices?.garmin),
        fitbit: Boolean(raw.devices?.fitbit),
        healthConnect: Boolean(raw.devices?.healthConnect),
        bleHeartRate: Boolean(raw.devices?.bleHeartRate),
        bleBloodPressure: Boolean(raw.devices?.bleBloodPressure)
      },
      coaching: {
        personality: raw.coaching?.personality || raw.coachPersonality || 'direct',
        verbosity: raw.coaching?.verbosity || raw.responseLength || 'quick_explanation',
        accountability: raw.coaching?.accountability || 'moderate',
        reminderStyle: raw.coaching?.reminderStyle || 'motivational'
      },
      story: {
        rawText: raw.story?.rawText || '',
        extractedContext: raw.story?.extractedContext || {},
        confidence: Number(raw.story?.confidence) || 1.0
      },
      permissions: {
        health: raw.permissions?.health || 'notDetermined',
        bluetooth: raw.permissions?.bluetooth || 'notDetermined',
        notifications: raw.permissions?.notifications || 'notDetermined'
      },
      onboardingCompleted: Boolean(raw.onboardingCompleted || raw.onboarded),
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Save progressive onboarding draft to localStorage
   */
  static saveLocalDraft(draft) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify({
        ...draft,
        savedAt: Date.now()
      }));
    } catch (e) {
      console.warn('[UserIntelligenceProfile] Failed to save draft:', e);
    }
  }

  /**
   * Read progressive onboarding draft from localStorage
   */
  static getLocalDraft() {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const data = localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Discard drafts older than 14 days
      if (parsed.savedAt && Date.now() - parsed.savedAt > 14 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clear local draft upon successful onboarding completion
   */
  static clearLocalDraft() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
    } catch (e) {}
  }

  /**
   * Build structured AI Context string for Calyxo AI Orchestrator & Gemini
   */
  static formatForAIContext(profile = {}) {
    const p = this.sanitize(profile);
    return `### ATHLETE INTELLIGENCE PROFILE
- **Identity:** ${p.identity.age}y old, ${p.identity.sex}, ${p.identity.height}cm, ${p.identity.weight}kg${p.identity.targetWeight ? ` (Target: ${p.identity.targetWeight}kg)` : ''}
- **Primary Goal:** ${p.goals.primaryGoal.replace(/_/g, ' ')} | Priority: ${p.goals.primaryPriority.replace(/_/g, ' ')}
- **Training Frequency:** ${p.training.frequency.replace(/_/g, ' ')} | Session Duration: ${p.training.duration.replace(/_/g, ' ')}
- **Training Environment:** ${p.training.environment.replace(/_/g, ' ')}
- **Equipment Access:** ${p.training.equipment.join(', ') || 'Bodyweight'}
- **Protected Areas / Limitations:** ${p.limitations.protectedAreas.length > 0 ? p.limitations.protectedAreas.join(', ') : 'None'}
- **Nutrition:** Diet: ${p.nutrition.diet} | Cuisines: ${p.nutrition.cuisines.join(', ')} | Focus: ${p.nutrition.nutritionPriority.replace(/_/g, ' ')}
- **Lifestyle & Sleep:** Activity: ${p.lifestyle.activityLevel} | Sleep: ${p.lifestyle.sleepDuration} (${p.lifestyle.sleepConsistency}) | Stress: ${p.lifestyle.stressLevel}
- **Coaching Preference:** Style: ${p.coaching.personality} | Detail: ${p.coaching.verbosity} | Tone: ${p.coaching.reminderStyle}
${p.story.rawText ? `- **Athlete's Personal Story:** "${p.story.rawText}"` : ''}`;
  }

  /**
   * Format constraints for Workout Generator
   */
  static formatForWorkoutEngine(profile = {}) {
    const p = this.sanitize(profile);
    const durationMap = {
      under_20: 15,
      '20_30': 25,
      '30_45': 35,
      '45_60': 45,
      '60_plus': 60
    };

    return {
      experience: p.training.experience,
      frequency: p.training.frequency,
      durationMinutes: durationMap[p.training.duration] || 45,
      environment: p.training.environment,
      equipment: p.training.equipment,
      preferredStyles: p.training.preferredStyles,
      protectedAreas: p.limitations.protectedAreas
    };
  }

  /**
   * Format dietary parameters for Macro & Nutrition Planner
   */
  static formatForNutritionEngine(profile = {}) {
    const p = this.sanitize(profile);
    return {
      diet: p.nutrition.diet,
      cuisines: p.nutrition.cuisines,
      mealBehavior: p.nutrition.mealBehavior,
      nutritionPriority: p.nutrition.nutritionPriority,
      mealSchedule: p.nutrition.mealSchedule,
      weightKg: p.identity.weight,
      heightCm: p.identity.height,
      age: p.identity.age,
      sex: p.identity.sex,
      goal: p.goals.primaryGoal
    };
  }
}
