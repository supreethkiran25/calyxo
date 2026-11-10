/**
 * Calyxo Canonical User Intelligence Profile Engine
 *
 * Defines the canonical single-source-of-truth structure for user personalization.
 * Bridges onboarding, AI Health Twin, AI Workout Coach, AI Meal Planner, Recovery,
 * Wearable telemetry, and Smart Reminders.
 */

export const ONBOARDING_DRAFT_STORAGE_KEY = 'calyxo_onboarding_draft';

const ACTIVITY_MAP = {
  mostly_sitting: 1.2,
  somewhat_active: 1.375,
  active: 1.55,
  very_active: 1.725
};

const GOAL_MAP = {
  lose_body_fat: 'lose',
  build_muscle: 'gains',
  get_stronger: 'gains',
  maintain_physique: 'maintain',
  improve_fitness: 'maintain',
  improve_endurance: 'maintain',
  improve_overall_health: 'maintain',
  improve_sleep_recovery: 'maintain',
  prepare_sport_event: 'gains',
  not_sure_yet: 'maintain',
  // already-flat values
  lose: 'lose',
  gains: 'gains',
  maintain: 'maintain'
};

const COACH_MAP = {
  supportive: 'motivational',
  friendly: 'motivational',
  minimal: 'motivational',
  direct: 'motivational',
  data_driven: 'scientific',
  tough_love: 'strict',
  // already-flat values
  motivational: 'motivational',
  gym_bro: 'gym_bro',
  scientific: 'scientific',
  strict: 'strict'
};

const normalizeDuration = (duration) => {
  if (!duration) return '45_60';
  if (duration === '45_60_min') return '45_60';
  return duration;
};

export const DEFAULT_USER_INTELLIGENCE_PROFILE = {
  identity: {
    fullName: '',
    firstName: '',
    nickname: '',
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
    duration: '45_60', // 'under_20' | '20_30' | '30_45' | '45_60' | '60_plus'
    environment: 'commercial_gym',
    equipment: ['dumbbells', 'barbells', 'machines', 'cable_machines'],
    preferredStyles: ['strength', 'hypertrophy']
  },
  nutrition: {
    diet: 'non_vegetarian',
    cuisines: [],
    mealBehavior: 'mix_of_both',
    nutritionPriority: 'high_protein',
    allergies: ['none'],
    cookingStyle: 'mostly_home',
    budget: 'moderate',
    mealSchedule: {
      breakfast: true,
      lunch: true,
      dinner: true,
      snacks: false
    }
  },
  lifestyle: {
    activityLevel: 'somewhat_active',
    workStyle: 'desk_based',
    sleepDuration: '7_8h',
    sleepConsistency: 'mostly_consistent',
    stressLevel: 'moderate'
  },
  schedule: {
    wakeTime: '06:30',
    breakfastTime: '08:30',
    lunchTime: '13:00',
    snackTime: '17:00',
    workoutTime: '18:30',
    dinnerTime: '20:30',
    sleepTime: '23:00'
  },
  limitations: {
    restrictions: ['none'],
    protectedAreas: []
  },
  devices: {
    appleHealth: false,
    appleWatch: false,
    boat: false,
    garmin: false,
    fitbit: false,
    healthConnect: false,
    bleHeartRate: false,
    bleBloodPressure: false,
    bluetoothWatch: false,
    deviceName: null
  },
  coaching: {
    personality: 'direct',
    verbosity: 'quick_explanation',
    accountability: 'moderate',
    reminderStyle: 'motivational'
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
  onboarded: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const draftKeyFor = (userId) => (
  userId ? `${ONBOARDING_DRAFT_STORAGE_KEY}_${userId}` : ONBOARDING_DRAFT_STORAGE_KEY
);

export class UserIntelligenceProfile {
  /**
   * Deep sanitize and validate a profile payload (nested canonical shape)
   */
  static sanitize(raw = {}) {
    if (!raw || typeof raw !== 'object') {
      return { ...DEFAULT_USER_INTELLIGENCE_PROFILE };
    }

    const rawFullName = raw.identity?.fullName || raw.fullName || raw.name || '';
    const rawFirstName = raw.identity?.firstName || raw.firstName || (rawFullName ? rawFullName.trim().split(' ')[0] : '') || '';
    const rawNickname = raw.identity?.nickname || raw.nickname || rawFirstName || '';
    const completed = Boolean(raw.onboardingCompleted || raw.onboarded);

    return {
      identity: {
        fullName: rawFullName,
        firstName: rawFirstName,
        nickname: rawNickname,
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
        duration: normalizeDuration(raw.training?.duration || '45_60'),
        environment: raw.training?.environment || 'commercial_gym',
        equipment: Array.isArray(raw.training?.equipment) ? raw.training.equipment : ['dumbbells', 'barbells', 'machines'],
        preferredStyles: Array.isArray(raw.training?.preferredStyles) ? raw.training.preferredStyles : ['strength', 'hypertrophy']
      },
      nutrition: {
        diet: raw.nutrition?.diet || (Array.isArray(raw.dietPreferences) ? raw.dietPreferences[0] : (raw.dietPreference || raw.diet)) || 'non_vegetarian',
        cuisines: Array.isArray(raw.nutrition?.cuisines) ? raw.nutrition.cuisines : (Array.isArray(raw.cuisines) ? raw.cuisines : []),
        mealBehavior: raw.nutrition?.mealBehavior || 'mix_of_both',
        nutritionPriority: raw.nutrition?.nutritionPriority || 'high_protein',
        allergies: Array.isArray(raw.nutrition?.allergies) ? raw.nutrition.allergies : (typeof raw.allergies === 'string' && raw.allergies ? raw.allergies.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(raw.allergies) ? raw.allergies : ['none'])),
        cookingStyle: raw.nutrition?.cookingStyle || 'mostly_home',
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
      schedule: {
        wakeTime: raw.schedule?.wakeTime || '06:30',
        breakfastTime: raw.schedule?.breakfastTime || '08:30',
        lunchTime: raw.schedule?.lunchTime || '13:00',
        snackTime: raw.schedule?.snackTime || '17:00',
        workoutTime: raw.schedule?.workoutTime || '18:30',
        dinnerTime: raw.schedule?.dinnerTime || '20:30',
        sleepTime: raw.schedule?.sleepTime || '23:00'
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
        bleBloodPressure: Boolean(raw.devices?.bleBloodPressure),
        bluetoothWatch: Boolean(raw.devices?.bluetoothWatch),
        deviceName: raw.devices?.deviceName || null
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
      onboardingCompleted: completed,
      onboarded: completed,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Nested sanitize + flat Dashboard/Profile/dbService compatibility fields
   */
  static toCompatibleProfile(raw = {}, extras = {}) {
    const nested = this.sanitize({ ...raw, ...extras });
    const primaryGoal = nested.goals.primaryGoal;
    const flatGoal = GOAL_MAP[primaryGoal] || 'maintain';
    const coachPersonality = COACH_MAP[nested.coaching.personality] || 'motivational';
    const allergies = Array.isArray(nested.nutrition.allergies)
      ? nested.nutrition.allergies.join(', ')
      : (nested.nutrition.allergies || '');

    return {
      ...nested,
      ...extras,
      onboarded: true,
      onboardingCompleted: true,
      role: extras.role || 'user',
      name: nested.identity.fullName,
      fullName: nested.identity.fullName,
      displayName: nested.identity.fullName,
      firstName: nested.identity.firstName,
      nickname: nested.identity.nickname,
      weight: nested.identity.weight,
      height: nested.identity.height,
      age: nested.identity.age,
      dob: nested.identity.dob,
      gender: nested.identity.sex,
      goal: flatGoal,
      goalWeight: nested.goals.targetWeight ?? nested.identity.targetWeight ?? nested.identity.weight,
      experience: nested.training.experience,
      fitnessLevel: nested.training.experience,
      activity: ACTIVITY_MAP[nested.lifestyle.activityLevel] ?? 1.55,
      units: extras.units || raw.units || 'metric',
      coachPersonality,
      responseLength: nested.coaching.verbosity,
      coachingStyle: nested.coaching.personality,
      dietPreference: nested.nutrition.diet,
      diet: nested.nutrition.diet,
      dietPreferences: [nested.nutrition.diet],
      cuisines: nested.nutrition.cuisines || [],
      allergies,
      nutritionPriority: nested.nutrition.nutritionPriority,
      schedule: nested.schedule
    };
  }

  static draftStorageKey(userId) {
    return draftKeyFor(userId);
  }

  static saveLocalDraft(draft, userId = null) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(draftKeyFor(userId), JSON.stringify({
        ...draft,
        savedAt: Date.now()
      }));
    } catch (e) {
      console.warn('[UserIntelligenceProfile] Failed to save draft:', e);
    }
  }

  static getLocalDraft(userId = null) {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const key = draftKeyFor(userId);
      let data = localStorage.getItem(key);
      // Migrate legacy unscoped draft once
      if (!data && userId) {
        data = localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
        if (data) {
          localStorage.setItem(key, data);
          localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
        }
      }
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed.savedAt && Date.now() - parsed.savedAt > 14 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  static clearLocalDraft(userId = null) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.removeItem(draftKeyFor(userId));
      localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
    } catch (e) {}
  }

  static formatForAIContext(profile = {}) {
    const p = this.sanitize(profile);
    return `### ATHLETE INTELLIGENCE PROFILE
- **Identity:** ${p.identity.age}y old, ${p.identity.sex}, ${p.identity.height}cm, ${p.identity.weight}kg${p.identity.targetWeight ? ` (Target: ${p.identity.targetWeight}kg)` : ''}
- **Primary Goal:** ${p.goals.primaryGoal.replace(/_/g, ' ')} | Priority: ${p.goals.primaryPriority.replace(/_/g, ' ')}
- **Training Frequency:** ${p.training.frequency.replace(/_/g, ' ')} | Session Duration: ${p.training.duration.replace(/_/g, ' ')}
- **Training Environment:** ${p.training.environment.replace(/_/g, ' ')}
- **Equipment Access:** ${p.training.equipment.join(', ') || 'Bodyweight'}
- **Protected Areas / Limitations:** ${p.limitations.protectedAreas.length > 0 ? p.limitations.protectedAreas.join(', ') : 'None'}
- **Nutrition:** Diet: ${p.nutrition.diet} | Cuisines: ${(p.nutrition.cuisines || []).join(', ') || 'Any'} | Focus: ${p.nutrition.nutritionPriority.replace(/_/g, ' ')}
- **Lifestyle & Sleep:** Activity: ${p.lifestyle.activityLevel} | Sleep: ${p.lifestyle.sleepDuration} (${p.lifestyle.sleepConsistency}) | Stress: ${p.lifestyle.stressLevel}
- **Coaching Preference:** Style: ${p.coaching.personality} | Detail: ${p.coaching.verbosity} | Tone: ${p.coaching.reminderStyle}
${p.story.rawText ? `- **Athlete's Personal Story:** "${p.story.rawText}"` : ''}`;
  }

  static formatForWorkoutEngine(profile = {}) {
    const p = this.sanitize(profile);
    const durationMap = {
      under_20: 15,
      '20_30': 25,
      '30_45': 35,
      '45_60': 45,
      '45_60_min': 45,
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
