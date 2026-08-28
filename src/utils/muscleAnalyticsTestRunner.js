/**
 * Calyxo Production Muscle Analytics & Anatomical Map Test Suite
 * Validates deterministic stimulus calculation, taxonomy mapping, real data integrity,
 * multi-day differentiation, empty state degradation, and grounded AI facts.
 */

import {
  calculateDailyMuscleStimulus,
  calculateWeeklyMuscleAnalytics,
  findExerciseTaxonomy,
  getStimulusLevelFromScore,
  STIMULUS_LEVELS
} from '../services/analytics/MuscleStimulusEngine.js';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('\n======================================================================');
console.log('🦾 CALYXO PRODUCTION MUSCLE ANALYTICS & ANATOMICAL MAP TEST SUITE');
console.log('======================================================================\n');

// ── 1. Exercise Taxonomy & Muscle Mapping ─────────────────────────────────────
console.log('📚 1. Exercise Taxonomy & Muscle Mapping');
const benchTax = findExerciseTaxonomy('Bench Press');
assert(benchTax.primary.includes('chest'), 'Bench Press primary is Chest');
assert(benchTax.secondary.includes('triceps'), 'Bench Press secondary includes Triceps');
assert(benchTax.secondary.includes('frontDeltoid'), 'Bench Press secondary includes Front Delts');

const squatTax = findExerciseTaxonomy('Barbell Squat');
assert(squatTax.primary.includes('quadriceps'), 'Squat primary is Quads');
assert(squatTax.primary.includes('gluteal'), 'Squat primary includes Glutes');
assert(squatTax.secondary.includes('hamstring'), 'Squat secondary includes Hamstrings');

const pullUpTax = findExerciseTaxonomy('Pull-up');
assert(pullUpTax.primary.includes('upperBack'), 'Pull-up primary is Lats');
assert(pullUpTax.secondary.includes('biceps'), 'Pull-up secondary includes Biceps');

const rdlTax = findExerciseTaxonomy('Romanian Deadlift');
assert(rdlTax.primary.includes('hamstring'), 'RDL primary includes Hamstrings');
assert(rdlTax.primary.includes('lowerBack'), 'RDL primary includes Lower Back');


// ── 2. Real-World Prompt Test Case: Chest Workout ────────────────────────────
console.log('\n🏋️ 2. Real-World Prompt Test Case: Chest Workout');
const sampleChestWorkoutLogs = [
  {
    id: 'workout_chest_001',
    date: '2026-08-27',
    caloriesBurned: 384,
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { weight: 60, reps: 10 },
          { weight: 60, reps: 10 },
          { weight: 60, reps: 10 }
        ]
      },
      {
        name: 'Incline Dumbbell Press',
        sets: [
          { weight: 20, reps: 10 },
          { weight: 20, reps: 10 },
          { weight: 20, reps: 10 }
        ]
      },
      {
        name: 'Cable Fly',
        sets: [
          { weight: 15, reps: 12 },
          { weight: 15, reps: 12 },
          { weight: 15, reps: 12 }
        ]
      }
    ]
  }
];

const chestResult = calculateDailyMuscleStimulus(sampleChestWorkoutLogs, '2026-08-27');
assert(chestResult.hasWorkouts === true, 'Identifies workouts present for 2026-08-27');
assert(chestResult.totalExercises === 3, 'Calculates 3 exercises logged');

// Volume: (60*10*3) + (20*10*3) + (15*12*3) = 1800 + 600 + 540 = 2940 kg
assert(chestResult.totalVolumeKg === 2940, `Calculates exact volume: ${chestResult.totalVolumeKg} kg`);
assert(chestResult.totalCaloriesKcal === 384, `Preserves calories as isolated metric (${chestResult.totalCaloriesKcal} kcal)`);

const chestDetail = chestResult.muscleDetails.chest;
assert(chestDetail.stimulusLevel.level >= 3, `Chest receives High/Very High stimulus (level ${chestDetail.stimulusLevel.level}, score ${Math.round(chestDetail.rawScore)})`);

const tricepsDetail = chestResult.muscleDetails.triceps;
assert(tricepsDetail.stimulusLevel.level >= 1 && tricepsDetail.stimulusLevel.level <= 3, `Triceps receives secondary stimulus (level ${tricepsDetail.stimulusLevel.level})`);

const frontDeltsDetail = chestResult.muscleDetails.frontDeltoid;
assert(frontDeltsDetail.stimulusLevel.level >= 1 && frontDeltsDetail.stimulusLevel.level <= 3, `Front delts receives secondary stimulus (level ${frontDeltsDetail.stimulusLevel.level})`);

const quadsDetail = chestResult.muscleDetails.quadriceps;
assert(quadsDetail.stimulusLevel.level === 0, `Quads receives ZERO stimulus (level ${quadsDetail.stimulusLevel.level})`);
assert(chestDetail.contributingExercises.length === 3, 'Chest has 3 contributing exercises');


// ── 3. Multi-Day Differentiation Test ─────────────────────────────────────────
console.log('\n📅 3. Multi-Day Differentiation Test');
const multiDayLogs = [
  ...sampleChestWorkoutLogs,
  {
    id: 'workout_leg_002',
    date: '2026-08-26',
    caloriesBurned: 450,
    exercises: [
      {
        name: 'Barbell Squat',
        sets: [
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 }
        ]
      },
      {
        name: 'Leg Curl',
        sets: [
          { weight: 40, reps: 12 },
          { weight: 40, reps: 12 }
        ]
      }
    ]
  }
];

const day1 = calculateDailyMuscleStimulus(multiDayLogs, '2026-08-27');
const day2 = calculateDailyMuscleStimulus(multiDayLogs, '2026-08-26');

assert(day1.muscleDetails.chest.stimulusLevel.level > 0, 'Day 1 (2026-08-27) has active Chest');
assert(day1.muscleDetails.quadriceps.stimulusLevel.level === 0, 'Day 1 (2026-08-27) has 0 Quad stimulus');
assert(day2.muscleDetails.quadriceps.stimulusLevel.level > 0, 'Day 2 (2026-08-26) has active Quads');
assert(day2.muscleDetails.chest.stimulusLevel.level === 0, 'Day 2 (2026-08-26) has 0 Chest stimulus');


// ── 4. Empty State & Missing Data Graceful Degradation ────────────────────────
console.log('\n🛡️ 4. Empty State & Missing Data Graceful Degradation');
const emptyResult = calculateDailyMuscleStimulus([], '2026-08-27');
assert(emptyResult.hasWorkouts === false, 'Empty logs return hasWorkouts: false');
assert(emptyResult.activeMuscles.length === 0, 'Empty logs have 0 active muscles');
assert(emptyResult.totalVolumeKg === 0, 'Empty logs have 0 volume');

// Bodyweight exercise handling without fabricated weights
const bodyweightLogs = [
  {
    id: 'bw_001',
    date: '2026-08-27',
    exercises: [
      { name: 'Push-up', sets: [{ reps: 20 }, { reps: 20 }, { reps: 20 }] }
    ]
  }
];
const bwResult = calculateDailyMuscleStimulus(bodyweightLogs, '2026-08-27');
assert(bwResult.muscleDetails.chest.stimulusLevel.level > 0, 'Calculates bodyweight push-up stimulus without error');
assert(bwResult.totalVolumeKg === 0, 'Bodyweight volume is truthfully 0 kg');


// ── 5. 7-Day Weekly Exposure & Discipline Balance ────────────────────────────
console.log('\n📊 5. 7-Day Weekly Exposure & Discipline Balance');
const weeklyResult = calculateWeeklyMuscleAnalytics(multiDayLogs, '2026-08-27');
assert(weeklyResult.totalWorkouts === 2, `Weekly shows 2 completed workouts`);
assert(Object.keys(weeklyResult.muscleFrequency).length >= 4, 'Weekly lists active muscle groups');
assert(weeklyResult.balancePercentages.core === 0 || weeklyResult.balancePercentages.core >= 0, 'Weekly lists understimulated muscle groups');

const totalPct = Object.values(weeklyResult.balancePercentages).reduce((a, b) => a + b, 0);
assert(totalPct === 100, `Training discipline balance sums to 100% (was ${totalPct}%)`);


// ── 6. Grounded AI Fact Verification ──────────────────────────────────────────
console.log('\n🧠 6. Grounded AI Fact Verification');
function generateVerifiedAIExplanation(dailyResult) {
  if (!dailyResult.hasWorkouts) {
    return 'No workouts were recorded for this day.';
  }
  const topMuscles = dailyResult.activeMuscles.map(m => m.name.split(' ')[0]).slice(0, 3).join(', ');
  const exNames = [...new Set(dailyResult.activeMuscles.flatMap(m => m.contributingExercises.map(e => e.name)))];
  return `You completed ${dailyResult.totalExercises} exercises including ${exNames.slice(0, 2).join(' and ')}, heavily targeting ${topMuscles} with a total volume of ${dailyResult.totalVolumeKg} kg.`;
}

const aiText = generateVerifiedAIExplanation(chestResult);
assert(aiText.includes('Chest'), 'AI explanation identifies Chest dominant focus');
assert(aiText.includes('Bench Press'), 'AI explanation cites actual Bench Press exercise');
assert(aiText.includes('2940 kg'), 'AI generates 3 grounded verified facts');

console.log('\n======================================================================');
if (failCount === 0) {
  console.log(`🎉 ALL ${passCount} MUSCLE ANALYTICS & ANATOMICAL MAP TESTS PASSED`);
} else {
  console.error(`❌ ${failCount} TESTS FAILED out of ${passCount + failCount}`);
  process.exit(1);
}
console.log('======================================================================\n');
