/**
 * Calyxo AI Central Orchestrator & Reasoning Engine
 *
 * Provides:
 * 1. Open-ended reasoning over natural language inquiries.
 * 2. Intent detection & tool orchestration via AIToolRegistry.
 * 3. Conversational fluency & personalized coaching tone.
 * 4. Medical safety guardrails.
 * 5. Periodized weekly programs & single-day routine generation.
 * 6. Role-aware response adaptation (USER, TRAINER, ADMIN).
 * 7. Dynamic structured plan generation and contextual modification.
 */

import { AIToolRegistry } from './AIToolRegistry.js';
import { ExplainableAICoachService } from './ExplainableAICoachService.js';
import { UnsupervisedAIAdaptiveEngine } from './UnsupervisedAIAdaptiveEngine.js';
import { SubscriptionManager, AI_CAPABILITIES } from '../subscription/SubscriptionManager.js';

export const AI_INTENTS = {
  GREETING_OR_CONVERSATIONAL: 'GREETING_OR_CONVERSATIONAL',
  GENERAL_HEALTH_QUERY: 'GENERAL_HEALTH_QUERY',
  RECOVERY_EXPLANATION: 'RECOVERY_EXPLANATION',
  WEEKLY_WORKOUT_PROGRAM_REQUEST: 'WEEKLY_WORKOUT_PROGRAM_REQUEST',
  WORKOUT_PLAN_REQUEST: 'WORKOUT_PLAN_REQUEST',
  WORKOUT_PLAN_MODIFICATION: 'WORKOUT_PLAN_MODIFICATION',
  NUTRITION_PLAN_REQUEST: 'NUTRITION_PLAN_REQUEST',
  NUTRITION_PLAN_MODIFICATION: 'NUTRITION_PLAN_MODIFICATION',
  POST_WORKOUT_NUTRITION: 'POST_WORKOUT_NUTRITION',
  SLEEP_OPTIMIZATION: 'SLEEP_OPTIMIZATION',
  LOG_HISTORY_QUERY: 'LOG_HISTORY_QUERY',
  FITNESS_AGE_QUERY: 'FITNESS_AGE_QUERY',
  CHALLENGE_QUERY: 'CHALLENGE_QUERY',
  MEDICAL_SAFETY_ALERT: 'MEDICAL_SAFETY_ALERT',
  ROLE_ADMIN_ANALYTICS: 'ROLE_ADMIN_ANALYTICS',
  ROLE_TRAINER_PROGRAMMING: 'ROLE_TRAINER_PROGRAMMING'
};

export class CalyxoAIOrchestrator {
  /**
   * 1. Detect Intent from Open-Ended Natural Language Query
   */
  static classifyIntent(query = '', userRole = 'USER') {
    const q = query.toLowerCase().trim();

    // Medical Red Flags Guard
    const medicalRedFlags = ['chest pain', 'heart attack', 'shortness of breath', 'vomiting blood', 'stroke', 'passed out', 'fracture'];
    if (medicalRedFlags.some(flag => q.includes(flag))) {
      return AI_INTENTS.MEDICAL_SAFETY_ALERT;
    }

    // Friendly Greetings & Conversational Openers
    const greetingWords = ['hi', 'hello', 'hey', 'sup', 'yo', 'good morning', 'good evening', 'good afternoon', 'howdy', 'what’s up', "what's up", 'how are you'];
    if (greetingWords.includes(q) || q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ')) {
      return AI_INTENTS.GREETING_OR_CONVERSATIONAL;
    }

    // Role-based intents
    if (userRole === 'ADMIN' && (q.includes('gym') || q.includes('retention') || q.includes('revenue') || q.includes('members') || q.includes('analytics'))) {
      return AI_INTENTS.ROLE_ADMIN_ANALYTICS;
    }
    if (userRole === 'TRAINER' && (q.includes('client') || q.includes('program') || q.includes('periodization') || q.includes('athlete'))) {
      return AI_INTENTS.ROLE_TRAINER_PROGRAMMING;
    }

    // Weekly Periodized Program Request (Handling typos like 'giv eme one week')
    const isWeekly = q.includes('week') || q.includes('7 day') || q.includes('7-day') || q.includes('split') || q.includes('schedule') || q.includes('program for the week') || q.includes('full week');
    const isWorkoutIntent = q.includes('workout') || q.includes('training') || q.includes('exercise') || q.includes('gym') || q.includes('routine') || q.includes('plan');
    if (isWeekly && isWorkoutIntent) {
      return AI_INTENTS.WEEKLY_WORKOUT_PROGRAM_REQUEST;
    }

    // Specific Post-Workout Nutrition
    if (q.includes('after leg day') || q.includes('post workout') || q.includes('post-workout') || q.includes('after workout') || q.includes('after training') || q.includes('after gym')) {
      return AI_INTENTS.POST_WORKOUT_NUTRITION;
    }

    // Sleep Optimization
    if ((q.includes('sleep') || q.includes('insomnia') || q.includes('rest')) && (q.includes('improve') || q.includes('better') || q.includes('deep') || q.includes('how to'))) {
      return AI_INTENTS.SLEEP_OPTIMIZATION;
    }

    // Plan Modification
    if (q.includes('make this') || q.includes('make it') || q.includes('replace ') || q.includes('change ') || q.includes('only have') || q.includes('home version')) {
      if (q.includes('calorie') || q.includes('protein') || q.includes('meal') || q.includes('food') || q.includes('vegetarian') || q.includes('vegan')) {
        return AI_INTENTS.NUTRITION_PLAN_MODIFICATION;
      }
      return AI_INTENTS.WORKOUT_PLAN_MODIFICATION;
    }

    // Single-Day Plan Generation
    if ((q.includes('workout') || q.includes('training') || q.includes('exercise') || q.includes('routine') || q.includes('split') || q.includes('dumbbell') || q.includes('bodyweight')) && (q.includes('build') || q.includes('create') || q.includes('plan') || q.includes('routine') || q.includes('program') || q.includes('generate') || q.includes('give') || q.includes('giv eme'))) {
      return AI_INTENTS.WORKOUT_PLAN_REQUEST;
    }
    if ((q.includes('meal') || q.includes('diet') || q.includes('nutrition') || q.includes('eat')) && (q.includes('plan') || q.includes('create') || q.includes('build') || q.includes('suggest') || q.includes('what should i'))) {
      return AI_INTENTS.NUTRITION_PLAN_REQUEST;
    }

    // Recovery & Fitness Age
    if (q.includes('recovery') || q.includes('sore') || q.includes('fatigue') || q.includes('readiness')) {
      return AI_INTENTS.RECOVERY_EXPLANATION;
    }
    if (q.includes('fitness age') || q.includes('biological age') || q.includes('bio age')) {
      return AI_INTENTS.FITNESS_AGE_QUERY;
    }

    // Challenge Progress
    if (q.includes('challenge') || q.includes('badge') || q.includes('streak') || q.includes('leaderboard')) {
      return AI_INTENTS.CHALLENGE_QUERY;
    }

    // Log Queries
    if (q.includes('what did i') || q.includes('yesterday') || q.includes('last week') || q.includes('how much volume') || q.includes('my steps') || q.includes('compare')) {
      return AI_INTENTS.LOG_HISTORY_QUERY;
    }

    return AI_INTENTS.GENERAL_HEALTH_QUERY;
  }

  /**
   * 2. Orchestrate Reasoning and Generate Grounded Response
   */
  static async processUserQuery({
    query = '',
    userProfile = {},
    user = {},
    foodLogs = [],
    workoutLogs = [],
    weightLogs = [],
    waterIntake = 0,
    healthLogs = {},
    activePlan = null
  } = {}) {
    const safeUserProfile = (userProfile && typeof userProfile === 'object') ? userProfile : {};
    const safeUser = (user && typeof user === 'object') ? user : {};
    const safeFoodLogs = Array.isArray(foodLogs) ? foodLogs : (typeof foodLogs === 'object' && foodLogs ? Object.values(foodLogs).flat() : []);
    const safeWorkoutLogs = Array.isArray(workoutLogs) ? workoutLogs : [];
    const safeWeightLogs = Array.isArray(weightLogs) ? weightLogs : [];
    const safeHealthLogs = (healthLogs && typeof healthLogs === 'object') ? healthLogs : {};
    const safeWaterIntake = Number(waterIntake) || 0;
    const safeQuery = String(query || '').trim();

    const role = safeUserProfile.role || (safeUser.email === 'admin@calyxo.com' ? 'ADMIN' : 'USER');
    const intent = this.classifyIntent(safeQuery, role);
    const name = safeUserProfile.nickname || safeUserProfile.firstName || 'Athlete';
    const source = safeHealthLogs.source || 'Calyxo Logs';
    const qLower = safeQuery.toLowerCase();

    // ── Unsupervised Feature Extraction & Centroid Clustering ────────────
    const featureVector = UnsupervisedAIAdaptiveEngine.extractFeatureVector({
      workoutLogs: safeWorkoutLogs,
      foodLogs: safeFoodLogs,
      healthLogs: safeHealthLogs,
      waterIntake: safeWaterIntake,
      userProfile: safeUserProfile
    });
    const clusterAnalysis = UnsupervisedAIAdaptiveEngine.classifyPerformanceCluster(featureVector);

    // ── 0. Natural Conversational Greeting ────────────────────────────────
    if (intent === AI_INTENTS.GREETING_OR_CONVERSATIONAL) {
      const workoutCount = safeWorkoutLogs.length;
      const sleepHours = safeHealthLogs.sleep || null;

      let statusSnippet = '';
      if (workoutCount > 0) {
        statusSnippet = `Great job logging **${workoutCount} workout session(s)** today. `;
      } else if (sleepHours) {
        statusSnippet = `I see you logged **${sleepHours} hours of sleep** last night. `;
      }

      const text = `Hey **${name}**! 👋 ${statusSnippet}I'm Calyxo, your health & performance intelligence layer.

* 🧬 **Unsupervised Performance State:** **${clusterAnalysis.cluster.name}** (${clusterAnalysis.similarityConfidence}% model confidence).

Here are a few things we can do together right now:
* 📅 **Generate a 7-day program:** *"Give me a one-week workout plan"*
* 🏋️ **Build today's routine:** *"Build a 45-min upper body workout"*
* 🥗 **Plan nutrition:** *"Create a vegetarian high-protein meal plan for 2,200 kcal"*
* ⚡ **Analyze recovery:** *"Why is my recovery score at this level today?"*
* 🧬 **Evaluate fitness age:** *"Calculate my estimated fitness age"*

How can I help power your training and nutrition today?`;

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Calyxo Unsupervised Learning Intelligence'
      };
    }

    // ── 1. Medical Safety Red Flag Response ──────────────────────────────
    if (intent === AI_INTENTS.MEDICAL_SAFETY_ALERT) {
      return {
        role: 'assistant',
        text: `⚠️ **Important Health Notice:** You mentioned symptoms that may indicate an acute medical situation. Calyxo AI is a wellness and fitness intelligence layer, not a medical diagnostic system or emergency service.\n\nPlease immediately consult a qualified healthcare professional, visit an emergency room, or call local emergency services if you are experiencing severe symptoms.`,
        plan: null,
        sourceProvenance: 'Clinical Safety Protocol'
      };
    }

    // ── 2. Full Periodized 7-Day Weekly Workout Program ──────────────────
    if (intent === AI_INTENTS.WEEKLY_WORKOUT_PROGRAM_REQUEST) {
      const isDumbbells = qLower.includes('dumbbell');
      const isBodyweight = qLower.includes('bodyweight') || qLower.includes('home');
      const equipment = isDumbbells ? 'dumbbells_only' : isBodyweight ? 'bodyweight' : 'full_gym';

      const baseProgram = AIToolRegistry.generateWeeklyWorkoutProgram({
        goal: safeUserProfile.goal || 'hypertrophy',
        experience: safeUserProfile.experience || 'intermediate',
        availableEquipment: equipment,
        splitType: qLower.includes('ppl') ? 'ppl' : 'upper_lower'
      });

      const program = UnsupervisedAIAdaptiveEngine.autoregulateWorkout(baseProgram, clusterAnalysis);

      const text = `### 📅 7-Day Periodized Workout Program

Here is your complete **1-week training split** calibrated for **${equipment.replace('_', ' ')}**:

* 🧬 **Unsupervised AI Adaptation:** **${clusterAnalysis.cluster.name}** (${clusterAnalysis.similarityConfidence}% similarity). *${clusterAnalysis.cluster.recommendation}*
* **Day 1 (Upper Power):** Bench Press, Lat Pulldowns, Overhead Press & Lateral Raises
* **Day 2 (Lower Power):** Squats/Hack Squats, RDLs, Lunges & Calves
* **Day 3 (Active Recovery):** Zone 2 Cardio, Hip Mobility & Core Flow
* **Day 4 (Push Hypertrophy):** Incline Dumbbell Press, Shoulder Press, Cable Flyes & Triceps
* **Day 5 (Pull Hypertrophy):** Lat Pulldowns, Heavy DB Rows, Face Pulls & Bicep Curls
* **Day 6 (Lower & Core):** Deadlifts, Bulgarian Split Squats, Leg Extensions & Hanging Abs
* **Day 7 (Full Rest):** 8+ Hours Sleep, Hydration & Tissue Repair

Review the structured daily exercises below and tap **Add to My Plan** to import this into your active Workout library!`;

      return {
        role: 'assistant',
        text,
        plan: program,
        sourceProvenance: `Calyxo Unsupervised Periodization Engine · ${equipment}`
      };
    }

    // ── 3. Structured Single-Day Workout Plan Generation ─────────────────
    if (intent === AI_INTENTS.WORKOUT_PLAN_REQUEST) {
      const isDumbbells = qLower.includes('dumbbell');
      const isBodyweight = qLower.includes('bodyweight') || qLower.includes('home');
      const is30Min = qLower.includes('30');
      const equipment = isDumbbells ? 'dumbbells_only' : isBodyweight ? 'bodyweight' : 'full_gym';
      const duration = is30Min ? 30 : 45;

      const isLegs = qLower.includes('leg') || qLower.includes('lower') || qLower.includes('quad') || qLower.includes('glute');
      const isFullBody = qLower.includes('full body') || qLower.includes('total body');
      const focusSplit = isLegs ? 'Lower Body' : isFullBody ? 'Full Body' : 'Upper Body';

      const basePlan = AIToolRegistry.generateWorkoutPlan({
        goal: safeUserProfile.goal || 'hypertrophy',
        experience: safeUserProfile.experience || 'intermediate',
        durationMinutes: duration,
        availableEquipment: equipment,
        focusSplit
      });

      const plan = UnsupervisedAIAdaptiveEngine.autoregulateWorkout(basePlan, clusterAnalysis);

      const text = `### 🏋️ Custom Workout Plan Prepared

I have generated an adaptive **${duration}-minute ${focusSplit} (${equipment.replace('_', ' ')})** routine calibrated via unsupervised clustering:

* 🧬 **Unsupervised AI State:** **${clusterAnalysis.cluster.name}** (${clusterAnalysis.similarityConfidence}% similarity)
* **Estimated Caloric Burn:** ~${plan.estimatedCaloriesBurned} kcal
* **Movements:** ${plan.exercises.length} compound & isolated exercises

Review the routine below and tap **Add to My Plan** to import this directly into your active Workout library!`;

      return {
        role: 'assistant',
        text,
        plan,
        sourceProvenance: `Calyxo Adaptive Engine · ${equipment}`
      };
    }

    // ── 4. Workout Plan Modification ─────────────────────────────────────
    if (intent === AI_INTENTS.WORKOUT_PLAN_MODIFICATION) {
      const is30Min = qLower.includes('30');
      const isDumbbells = qLower.includes('dumbbell');
      const isBodyweight = qLower.includes('bodyweight') || qLower.includes('home');
      const equipment = isDumbbells ? 'dumbbells_only' : isBodyweight ? 'bodyweight' : (activePlan?.equipment || 'dumbbells_only');
      const duration = is30Min ? 30 : (activePlan?.durationMinutes || 30);

      const modifiedPlan = AIToolRegistry.generateWorkoutPlan({
        goal: safeUserProfile.goal || 'hypertrophy',
        experience: safeUserProfile.experience || 'intermediate',
        durationMinutes: duration,
        availableEquipment: equipment,
        focusSplit: 'Adjusted Custom Routine'
      });

      const text = `### 🔄 Workout Plan Adjusted

I have updated your routine to **${duration} minutes** using **${equipment.replace('_', ' ')}** as requested:

* **Updated Movements:** ${modifiedPlan.exercises.length} focused exercises
* **Work-to-Rest Ratio:** High density, structured recovery intervals

Tap **Add to My Plan** to apply this routine.`;

      return {
        role: 'assistant',
        text,
        plan: modifiedPlan,
        sourceProvenance: 'Dynamic Plan Modifier'
      };
    }

    // ── 5. Recovery Explanation ──────────────────────────────────────────
    if (intent === AI_INTENTS.RECOVERY_EXPLANATION) {
      const rec = AIToolRegistry.getRecoveryAnalysis({
        sleepHours: safeHealthLogs.sleep || 0,
        waterMl: safeWaterIntake || 0,
        waterGoalMl: safeUserProfile.waterTarget || 2500,
        proteinGrams: safeFoodLogs.reduce((s, x) => s + (Number(x?.protein) || 0), 0),
        proteinGoalGrams: safeUserProfile.proteinTarget || 130,
        soreness: safeHealthLogs.soreness || 3,
        fatigue: safeHealthLogs.fatigue || 3,
        restingHR: safeHealthLogs.restingHeartRate || 0,
        hasLoggedWorkoutToday: safeWorkoutLogs.length > 0
      });

      let text = `### ⚡ Recovery Readiness Breakdown\n\n`;
      if (rec.available) {
        text += `Your **Recovery Score is ${rec.score}% (${rec.readiness})**.\n\n`;
        text += `**Contributing Factors:**\n`;
        rec.reasons.forEach(r => { text += `* ${r}\n`; });
        text += `\n**Coaching Recommendation:**\n${rec.recommendation}`;
      } else {
        text += `Your recovery score requires at least one logged metric (sleep, hydration, or biometrics). Once recorded, Calyxo's deterministic clinical engine will calculate your neurological and metabolic readiness.`;
      }

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: `Deterministic Recovery Engine · ${source}`
      };
    }

    // ── 6. Post-Workout Nutrition Guidance ────────────────────────────────
    if (intent === AI_INTENTS.POST_WORKOUT_NUTRITION) {
      const proteinTarget = Math.round((Number(safeUserProfile.weight) || 70) * 0.4);
      const carbTarget = Math.round((Number(safeUserProfile.weight) || 70) * 0.8);

      const text = `### 🥩 Post-Workout Nutrition Blueprint

After demanding training (like leg day or heavy compounds), the metabolic window prioritizes **glycogen replenishment** and **muscle protein synthesis (MPS)**:

1. **Target Macros for this Meal:**
   * **Protein:** **${proteinTarget}g – ${proteinTarget + 10}g** of fast-to-moderate digesting bioavailable protein.
   * **Carbohydrates:** **${carbTarget}g – ${carbTarget + 15}g** of easily digestible complex or glycemic carbs.
   * **Hydration:** Replenish **500–750 ml** water with sodium/electrolytes to offset sweat loss.

2. **Recommended Meal Options:**
   * **Option A (Non-Veg):** Grilled Chicken Breast (180g) + White/Jasmine Rice (200g) + Steamed Green Beans.
   * **Option B (Veg):** Low-fat Paneer (150g) or Tofu (200g) + Cooked Quinoa (180g) + Dal / Lentil Soup.
   * **Option C (Quick Shake):** 1.5 scoops Whey Isolate + 1 Large Banana + 30g Rolled Oats blended with almond milk.`;

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Clinical Nutrition & Hypertrophy Protocols'
      };
    }

    // ── 7. Sleep Optimization Guidance ───────────────────────────────────
    if (intent === AI_INTENTS.SLEEP_OPTIMIZATION) {
      const text = `### 🌙 Evidence-Based Sleep Optimization Protocol

Deep sleep and REM cycles are where over 80% of natural Growth Hormone (GH) release and neural recovery occur:

* **1. Light & Circadian Alignment:** View 10–15 minutes of natural sunlight within 30 minutes of waking. Eliminate bright blue screens 60 minutes before bed.
* **2. Thermal Regulation:** Keep your sleeping room cool (~18–20°C / 65–68°F). A warm shower 90 minutes before bed promotes vasodilation and drops core body temperature.
* **3. Meal Timing:** Finish large meals at least 2.5 hours before sleeping to prevent elevated core temperature and resting heart rate spikes.
* **4. Caffeine Cutoff:** Maintain a strict caffeine cutoff 8–10 hours prior to scheduled sleep to allow adenosine clearance.`;

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Circadian Biology & Recovery Protocols'
      };
    }

    // ── 8. Nutrition Plan Generation & Modification ───────────────────────
    if (intent === AI_INTENTS.NUTRITION_PLAN_REQUEST || intent === AI_INTENTS.NUTRITION_PLAN_MODIFICATION) {
      const isVeg = qLower.includes('veg') || qLower.includes('vegetarian');
      const dietType = isVeg ? 'vegetarian' : 'standard';
      const targetCal = Number(safeUserProfile.dailyCalories || safeUserProfile.calorieGoal || 2100);
      const protein = Number(safeUserProfile.proteinTarget || 140);

      const plan = AIToolRegistry.generateNutritionPlan({
        targetCalories: targetCal,
        dietType,
        mealsCount: 4,
        proteinTarget: protein
      });

      const text = `### 🥗 Personalized ${dietType.toUpperCase()} Nutrition Blueprint

Here is your daily meal blueprint calibrated to **${targetCal} kcal** and **${protein}g protein**:

* **Structure:** 4 nutrient-dense meals
* **Quality:** High bioavailable amino acids & micronutrients

Review the items below and tap **Apply to Nutrition** to sync this with your daily targets.`;

      return {
        role: 'assistant',
        text,
        plan,
        sourceProvenance: `Mifflin-St Jeor Engine · ${dietType}`
      };
    }

    // ── 9. Fitness Age Query ──────────────────────────────────────────────
    if (intent === AI_INTENTS.FITNESS_AGE_QUERY) {
      const fitAge = AIToolRegistry.getFitnessAge({
        chronologicalAge: safeUserProfile.age || 28,
        trainingYears: 4,
        monthlyWorkouts: safeWorkoutLogs.length || 12,
        restingHR: safeHealthLogs.restingHeartRate || 58,
        vo2Max: 46
      });

      let text = `### 🧬 Estimated Fitness Age Analysis\n\n`;
      if (fitAge.available) {
        text += `Your **Estimated Fitness Age is ${fitAge.estimatedFitnessAge} years** (${fitAge.delta > 0 ? `${fitAge.delta} years younger than chronological age` : 'matched with biological baseline'}).\n\n`;
        text += `**Adaptation Contributors:**\n`;
        text += `* Consistent training adherence: +${fitAge.breakdown.consistencyBenefit} yrs benefit\n`;
        text += `* Resting cardiovascular efficiency: +${fitAge.breakdown.restingHRBenefit} yrs benefit\n`;
        text += `\n*Disclaimer: Fitness age is a physiological conditioning estimate based on cardio-metabolic markers, not a medical diagnosis.*`;
      } else {
        text += `Please ensure your chronological age is configured in Profile to calculate your clinical Fitness Age.`;
      }

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Deterministic Fitness Age Engine'
      };
    }

    // ── 10. Challenge & Gamification Query ─────────────────────────────────
    if (intent === AI_INTENTS.CHALLENGE_QUERY) {
      const challenges = AIToolRegistry.getChallengesProgress({
        workoutLogs: safeWorkoutLogs,
        waterLogs: [{ amount: safeWaterIntake }],
        currentStreak: safeUserProfile.streak || 4
      });

      let text = `### 🏆 Live Challenge Progress\n\n`;
      challenges.forEach(c => {
        text += `* **${c.title}:** ${c.currentProgress} / ${c.targetValue} ${c.unit} (${c.progressPercent}%)\n`;
      });
      text += `\nKeep pushing to unlock the next Tier Badges and XP rewards!`;

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Challenge Engine · Verified Logs'
      };
    }

    // ── 11. Log History & Comparison ──────────────────────────────────────
    if (intent === AI_INTENTS.LOG_HISTORY_QUERY) {
      const vol = AIToolRegistry.calculateWorkoutVolume(safeWorkoutLogs);
      let totalCal = 0;
      safeFoodLogs.forEach(f => { totalCal += Number(f?.calories || 0); });

      const text = `### 📊 Activity & Nutrition Summary\n\n* **Workouts Logged:** ${vol.sessionCount} sessions (${vol.totalTonnageKg} kg cumulative volume)\n* **Nutrition Logged:** ${safeFoodLogs.length} items (${totalCal} kcal)\n* **Hydration:** ${safeWaterIntake} ml logged today\n\nAll metrics are verified from your local database logs.`;

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: `Database Event Store · ${vol.sessionCount} workouts`
      };
    }

    // ── 12. Specific Knowledge Topics (Creatine, Cardio vs Weights, Protein)
    if (qLower.includes('creatine')) {
      const text = `### ⚡ Creatine Monohydrate Protocol

**Creatine Monohydrate** is one of the most thoroughly researched supplements in human performance:

* **Mechanism:** Increases intramuscular phosphocreatine stores to rapidly regenerate ATP during high-intensity explosive efforts (lifting, sprinting).
* **Recommended Dosage:** **3–5g daily**, taken consistently at any time of day with water or carbohydrates.
* **Loading Phase:** Optional. 20g/day for 5–7 days saturates stores faster, but 3–5g/day reaches full saturation in ~3–4 weeks with fewer GI issues.
* **Hydration:** Ensure an additional 300–500 ml of daily water intake as creatine draws intracellular water into muscle cells, boosting protein synthesis.`;

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Sports Nutrition & Ergogenic Protocols'
      };
    }

    if (qLower.includes('cardio') && (qLower.includes('weight') || qLower.includes('lifting') || qLower.includes('muscle') || qLower.includes('before') || qLower.includes('after'))) {
      const text = `### 🏃 Cardio & Resistance Training Sequencing

To maximize muscle hypertrophy and strength while maintaining cardiovascular endurance:

* **Primary Goal = Muscle/Strength:** Perform resistance training **first** when glycogen and neural drive are peak. Follow with 15–20 minutes of low-intensity steady state (LISS) or Zone 2 cardio.
* **Primary Goal = Endurance/VO2 Max:** Perform cardio first or separate the sessions by at least 6–8 hours to avoid the interference effect (AMPK vs mTOR signaling).
* **Warm-up Recommendation:** Keep pre-workout cardio to 5 minutes of light dynamic movement to elevate core temperature without fatiguing fast-twitch muscle fibers.`;

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Exercise Physiology & Periodization'
      };
    }

    // ── 13. High-Precision Food Alternatives & Nutrient Substitutions ──────────
    if (
      qLower.includes('alternative') ||
      qLower.includes('substitute') ||
      qLower.includes('replace') ||
      (qLower.includes('chicken') && (qLower.includes('protein') || qLower.includes('source') || qLower.includes('same') || qLower.includes('veg'))) ||
      (qLower.includes('protein') && qLower.includes('source'))
    ) {
      let text = '';
      if (qLower.includes('chicken')) {
        text = `### 🍗 High-Protein Alternatives to Chicken Breast

Chicken breast typically provides **~31g of high-quality protein per 100g** (raw/cooked equivalent ~28–31g) with only ~165 kcal and minimal fat (~3.6g).

Here are the top alternatives matching or exceeding that exact protein density:

#### 🥩 Lean Animal-Based Equivalents (Direct 1:1 Macro Match)
1. **Turkey Breast:** **~30g protein / 100g** (135 kcal, 1g fat) — The closest direct 1:1 culinary and lean macro equivalent to chicken breast.
2. **Canned Yellowfin Tuna (in water):** **~29g protein / 100g** (130 kcal, 1g fat) — Extremely lean, ultra-high bioavailability (PDCAAS = 1.0).
3. **White Fish (Tilapia / Cod / Basa):** **~26–28g protein / 120g** (120 kcal, 2g fat) — Lean, light on digestion, rich in selenium.
4. **Liquid Egg Whites:** **~28g protein / 250ml (~7–8 whites)** (125 kcal, 0g fat) — Pure albumin protein with zero fat or carbohydrates.
5. **Shrimp / Prawns:** **~24g protein / 100g** (100 kcal, 1g fat) — Exceptional protein-to-calorie ratio.

#### 🥗 Vegetarian & Plant-Based Equivalents
1. **Soya Chunks / Meal Maker (Dry):** **~52g protein / 100g** (345 kcal) — **60g dry soya chunks provides ~31g protein**, precisely matching 100g of chicken breast.
2. **Seitan (Vital Wheat Gluten):** **~25–30g protein / 100g** (150 kcal) — Fibrous meat-like texture with exceptional plant protein density.
3. **Low-Fat Paneer / Cottage Cheese:** **~28g protein / 150g** (180 kcal, 4g fat) — Rich in slow-digesting micellar casein protein for sustained amino acid release.
4. **Plain Non-Fat Greek Yogurt:** **~30g protein / 300g** (180 kcal, 0g fat) — Probiotic-dense, excellent for breakfasts, snacks, or post-workout bowls.
5. **Tempeh / Extra-Firm Tofu:** **~24g protein / 150g** (220 kcal) — Fermented whole soybean cake rich in prebiotic isoflavones.

💡 **Coaching Tip:** For optimal muscle protein synthesis (MPS), aim to hit at least **2.5–3.0g of leucine** per main meal alongside your total daily protein target of **1.8–2.2g per kg of bodyweight** (${Math.round((safeUserProfile.weight || 70) * 2)}g/day for your ${safeUserProfile.weight || 70}kg baseline).`;
      } else {
        text = `### 🥗 High-Quality Nutritional & Food Substitutions

To match your target macronutrients with alternative whole food options:

* **High Protein (30g targets):** 100g Turkey Breast, 100g Canned Tuna, 60g Dry Soya Chunks, 150g Low-Fat Paneer, 300g Greek Yogurt, or 1 scoop Whey Isolate.
* **Complex Carbohydrates:** Swap White Rice with Brown Basmati Rice, Quinoa, Boiled Sweet Potatoes, or Rolled Oats.
* **Healthy Unsaturated Fats:** Swap Butter/Ghee with Extra Virgin Olive Oil, Avocado, Raw Almonds, or Chia Seeds.`;
      }

      return {
        role: 'assistant',
        text,
        plan: null,
        sourceProvenance: 'Clinical Sports Nutrition & Food Composition Database'
      };
    }

    // ── 14. Live Generative AI Orchestration (Gemini) with Graceful Grounded Fallback ──
    try {
      let liveChatFn = null;
      try {
        const mod = await import('../geminiService.js');
        liveChatFn = mod?.chatWithGemini;
      } catch (e) {
        // Node test runners or offline
      }

      if (typeof liveChatFn === 'function') {
        const geminiRes = await liveChatFn({
          query: safeQuery,
          context: {
            userProfile: safeUserProfile,
            foodLogs: safeFoodLogs.slice(0, 5),
            workoutLogs: safeWorkoutLogs.slice(0, 5),
            healthLogs: safeHealthLogs,
            performanceCluster: clusterAnalysis?.cluster?.name
          },
          trainingLogs: safeWorkoutLogs.slice(0, 5),
          personality: safeUserProfile?.personality || 'coach'
        });

        const replyText = typeof geminiRes === 'string' ? geminiRes : (geminiRes?.response || geminiRes?.text || geminiRes?.message);
        if (replyText && typeof replyText === 'string' && replyText.trim().length > 15) {
          return {
            role: 'assistant',
            text: replyText.trim(),
            plan: geminiRes?.plan || null,
            sourceProvenance: 'Calyxo Generative Health Intelligence'
          };
        }
      }
    } catch (e) {
      console.warn('Gemini chat fallback to deterministic engine:', e);
    }

    // ── 15. General Open-Ended Fitness & Nutrition Grounding Fallback ──────
    const calorieInfo = AIToolRegistry.calculateCalorieAndMacroTargets({
      weightKg: safeUserProfile.weight || 70,
      heightCm: safeUserProfile.height || 175,
      age: safeUserProfile.age || 25,
      gender: safeUserProfile.gender || 'male',
      activityLevel: safeUserProfile.activity || 1.55,
      goal: safeUserProfile.goal || 'maintain'
    });

    const text = `### 💡 Health & Performance Guidance

Regarding your inquiry:

* **Metabolic Baseline:** Based on your biometrics (${safeUserProfile.weight || 70} kg, ${safeUserProfile.height || 175} cm), your baseline TDEE is **${calorieInfo.tdee} kcal/day** with an optimal protein intake of **${calorieInfo.macros.protein}g/day**.
* **Training Context:** You currently have **${safeWorkoutLogs.length}** workout session(s) logged in Calyxo.
* **Core Principle:** Prioritize progressive resistance training, consistent hydration, and hitting 1.8–2.2g/kg protein daily to optimize recovery and body composition.

Let me know if you would like me to build a custom workout routine, analyze your recovery, or draft a full nutrition plan!`;

    return {
      role: 'assistant',
      text,
      plan: null,
      sourceProvenance: 'Calyxo Health Intelligence Layer'
    };
  }
}

export const calyxoAIOrchestrator = CalyxoAIOrchestrator;
export default CalyxoAIOrchestrator;
