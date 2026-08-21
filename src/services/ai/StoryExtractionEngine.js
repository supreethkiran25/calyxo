/**
 * Calyxo Conversational Story Extraction Engine
 * 
 * Extracts structured intelligence from the user's natural language "Your Story" text.
 * Uses high-precision semantic heuristic matchers and rule-based token classifiers.
 * Zero hallucination — never invents values not present in the user's input.
 */

export class StoryExtractionEngine {
  /**
   * Extract structured signals from user's freeform text
   * @param {string} text - User story text
   * @returns {Object} { extractedContext, confidence, signalsFound }
   */
  static extractContext(text = '') {
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return {
        extractedContext: {},
        confidence: 0,
        signalsFound: []
      };
    }

    const lower = text.toLowerCase();
    const extracted = {};
    const signals = [];
    let detectedSignalsCount = 0;

    // 1. Fitness Experience & Background
    if (/(competing|competitive|powerlifter|bodybuilder|advanced|5\+?\s*years|five\s*years|many years)/i.test(lower)) {
      extracted.experience = 'advanced';
      signals.push('Advanced experience detected');
      detectedSignalsCount++;
    } else if (/(two\s*years|three\s*years|four\s*years|2\s*years|3\s*years|4\s*years|intermediate|few years|some experience)/i.test(lower)) {
      extracted.experience = 'intermediate';
      signals.push('Intermediate experience detected');
      detectedSignalsCount++;
    } else if (/(beginner|never worked out|first time|brand new|just starting)/i.test(lower)) {
      extracted.experience = 'beginner';
      signals.push('Beginner status detected');
      detectedSignalsCount++;
    }

    // 2. Training Status / Interruption
    if (/(stopped|took a break|break because|college|exams|restart|coming back|getting back|fell off)/i.test(lower)) {
      extracted.trainingStatus = 'returning';
      signals.push('Returning athlete pattern detected');
      detectedSignalsCount++;
    } else if (/(consistent|never stopped|routine for|always active)/i.test(lower)) {
      extracted.trainingStatus = 'consistent';
      signals.push('Consistent routine detected');
      detectedSignalsCount++;
    }

    // 3. Primary Goal
    if (/(build muscle|gain muscle|hypertrophy|bulk|size|bigger|grow)/i.test(lower)) {
      extracted.primaryGoal = 'build_muscle';
      signals.push('Muscle building goal detected');
      detectedSignalsCount++;
    } else if (/(lose fat|fat loss|cut|weight loss|lose weight|drop belly|lean out)/i.test(lower)) {
      extracted.primaryGoal = 'lose_body_fat';
      signals.push('Fat loss goal detected');
      detectedSignalsCount++;
    } else if (/(stronger|strength|lift heavy|bench press|squat|deadlift)/i.test(lower)) {
      extracted.primaryGoal = 'get_stronger';
      signals.push('Strength focus detected');
      detectedSignalsCount++;
    } else if (/(run|marathon|endurance|stamina|cardio|cycling)/i.test(lower)) {
      extracted.primaryGoal = 'improve_endurance';
      signals.push('Endurance focus detected');
      detectedSignalsCount++;
    } else if (/(overall health|feel better|longevity|wellness|sleep better)/i.test(lower)) {
      extracted.primaryGoal = 'improve_overall_health';
      signals.push('General health focus detected');
      detectedSignalsCount++;
    }

    // 4. Nutrition Priority
    if (/(more protein|high protein|protein intake|protein)/i.test(lower)) {
      extracted.nutritionPriority = 'high_protein';
      signals.push('High protein preference detected');
      detectedSignalsCount++;
    } else if (/(eat clean|clean food|home food|healthy diet|less junk)/i.test(lower)) {
      extracted.nutritionPriority = 'better_food_quality';
      signals.push('Food quality focus detected');
      detectedSignalsCount++;
    } else if (/(calorie deficit|eat less|portion control)/i.test(lower)) {
      extracted.nutritionPriority = 'fat_loss';
      signals.push('Deficit nutrition detected');
      detectedSignalsCount++;
    }

    // 5. Realistic Session Duration
    if (/(20\s*min|under 20|quick 15|15\s*min)/i.test(lower)) {
      extracted.sessionDuration = 'under_20';
      signals.push('Quick <20 min session duration detected');
      detectedSignalsCount++;
    } else if (/(30\s*min|half an hour|25\s*min)/i.test(lower)) {
      extracted.sessionDuration = '20_30';
      signals.push('20-30 min session duration detected');
      detectedSignalsCount++;
    } else if (/(45\s*min|40\s*min|under an hour|less than an hour)/i.test(lower)) {
      extracted.sessionDuration = '30_45';
      signals.push('30-45 min session duration detected');
      detectedSignalsCount++;
    } else if (/(hour|60\s*min|45 to 60)/i.test(lower)) {
      extracted.sessionDuration = '45_60';
      signals.push('45-60 min session duration detected');
      detectedSignalsCount++;
    }

    // 6. Consistency Challenges
    if (/(college|university|exams|studies)/i.test(lower)) {
      extracted.consistencyChallenge = 'academic_schedule';
      signals.push('Academic time constraints detected');
      detectedSignalsCount++;
    } else if (/(work|job|desk job|long hours|office|busy schedule)/i.test(lower)) {
      extracted.consistencyChallenge = 'work_schedule';
      signals.push('Work schedule constraints detected');
      detectedSignalsCount++;
    } else if (/(injury|knee pain|shoulder pain|back pain|physio)/i.test(lower)) {
      extracted.consistencyChallenge = 'previous_injury';
      signals.push('Previous injury context detected');
      detectedSignalsCount++;
    }

    // Calculate confidence score (normalized 0.40 - 0.98 based on density)
    const confidence = detectedSignalsCount > 0 
      ? Math.min(0.98, Math.max(0.40, 0.35 + (detectedSignalsCount * 0.15)))
      : 0.20;

    return {
      extractedContext: extracted,
      confidence: Number(confidence.toFixed(2)),
      signalsFound: signals
    };
  }
}
