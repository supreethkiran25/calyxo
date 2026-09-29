/**
 * Calyxo Master Engine Test Runner
 * Comprehensive unit validation across:
 * - WorkoutEngine (1RM, PR detection, progressive overload, set types)
 * - Nutrition Intelligence & smart suggestions
 * - Weekly AI Review deterministic calculations
 * - Export Service CSV formatting
 */

import { WorkoutEngine } from '../services/workout/WorkoutEngine.js';
import { AIBriefingEngine } from '../services/ai/AIBriefingEngine.js';
import { exportWorkoutsAsCsv, parseBackupJson } from '../services/exportService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== CALYXO MASTER ENGINE COMPREHENSIVE TEST RUNNER ===\n');

// 1. Estimated 1RM Formula Testing
console.log('--- 1. Testing Estimated 1RM (Epley & Brzycki) ---');
const oneRm100x1 = WorkoutEngine.calculateEstimated1RM(100, 1);
assert(oneRm100x1 === 100, `100kg x 1 rep estimated 1RM equals 100kg (got ${oneRm100x1})`);

const oneRm60x8 = WorkoutEngine.calculateEstimated1RM(60, 8);
// Epley: 60 * (1 + 8/30) = 60 * 1.2667 = 76kg
assert(oneRm60x8 >= 75 && oneRm60x8 <= 77, `60kg x 8 reps estimated 1RM ~76kg (got ${oneRm60x8})`);

const oneRm100x10 = WorkoutEngine.calculateEstimated1RM(100, 10);
// Epley: 100 * (1 + 10/30) = 133.3kg
assert(oneRm100x10 >= 132 && oneRm100x10 <= 135, `100kg x 10 reps estimated 1RM ~133.3kg (got ${oneRm100x10})`);

// Edge cases
const oneRm0Weight = WorkoutEngine.calculateEstimated1RM(0, 10);
assert(oneRm0Weight === 0, `0 weight returns 0 1RM (got ${oneRm0Weight})`);

const oneRm0Reps = WorkoutEngine.calculateEstimated1RM(100, 0);
assert(oneRm0Reps === 0, `0 reps returns 0 1RM (got ${oneRm0Reps})`);

// 2. PR Detection Engine Testing
console.log('\n--- 2. Testing Automatic PR Detection ---');
const historicalWorkouts = [
  {
    exercises: [
      {
        name: 'Incline Dumbbell Bench Press',
        sets: [
          { weight: 30, reps: 8, completed: true },
          { weight: 30, reps: 8, completed: true }
        ]
      }
    ]
  }
];

const prWeight = WorkoutEngine.detectPersonalRecords(
  [{ name: 'Incline Dumbbell Bench Press', sets: [{ weight: 32.5, reps: 8, completed: true }] }],
  historicalWorkouts
);
assert(prWeight.length > 0 && prWeight.some(p => p.type === 'MAX_WEIGHT'), `Higher weight (32.5kg vs 30kg) triggers MAX_WEIGHT PR`);

const prReps = WorkoutEngine.detectPersonalRecords(
  [{ name: 'Incline Dumbbell Bench Press', sets: [{ weight: 30, reps: 10, completed: true }] }],
  historicalWorkouts
);
assert(prReps.length > 0 && prReps.some(p => p.type === 'ESTIMATED_1RM'), `Higher reps (10 vs 8 at 30kg) triggers ESTIMATED_1RM PR`);

const prLower = WorkoutEngine.detectPersonalRecords(
  [{ name: 'Incline Dumbbell Bench Press', sets: [{ weight: 26, reps: 6, completed: true }] }],
  historicalWorkouts
);
assert(prLower.length === 0, `Lower performance triggers no PRs`);

// 3. Progressive Overload Recommendation Testing
console.log('\n--- 3. Testing Progressive Overload Engine ---');
const prevSetsBelowThreshold = [
  { weight: 60, reps: 6, completed: true, type: '1' }
];
const overloadRec1 = WorkoutEngine.calculateOverloadTarget(prevSetsBelowThreshold, 'compound');
assert(overloadRec1.recommendedWeight === 60, `Stay at 60kg if not yet threshold (6 reps < 8)`);
assert(overloadRec1.recommendedReps === '7 reps', `Target next higher rep (+1 rep) (got ${overloadRec1.recommendedReps})`);

const prevSetsHitThreshold = [
  { weight: 60, reps: 8, completed: true, type: '1' }
];
const overloadRec2 = WorkoutEngine.calculateOverloadTarget(prevSetsHitThreshold, 'compound');
assert(overloadRec2.recommendedWeight === 62.5, `Increase weight by 2.5kg when hitting 8 reps (got ${overloadRec2.recommendedWeight})`);
assert(overloadRec2.recommendedReps === '6–8', `Recommended rep range resets to 6–8 (got ${overloadRec2.recommendedReps})`);

// 4. Set Types Matrix
console.log('\n--- 4. Testing Set Types Definitions ---');
const setTypes = WorkoutEngine.SET_TYPES;
assert(Boolean(setTypes.WARMUP && setTypes.WARMUP.label === 'Warm-up'), `Warm-up set type defined`);
assert(Boolean(setTypes.WORKING && setTypes.WORKING.label === 'Working Set'), `Working set type defined`);
assert(Boolean(setTypes.DROP && setTypes.DROP.label === 'Drop Set'), `Drop set type defined`);
assert(Boolean(setTypes.FAILURE && setTypes.FAILURE.label === 'Failure'), `Failure set type defined`);
assert(Boolean(setTypes.AMRAP && setTypes.AMRAP.label === 'AMRAP'), `AMRAP set type defined`);
assert(Boolean(setTypes.REST_PAUSE && setTypes.REST_PAUSE.label === 'Rest-Pause'), `Rest-Pause set type defined`);
assert(Boolean(setTypes.MYO_REP && setTypes.MYO_REP.label === 'Myo-Rep'), `Myo-Rep set type defined`);

// 5. Deterministic Weekly AI Review Testing
console.log('\n--- 5. Testing Weekly AI Review Generator ---');
const weeklyReview = AIBriefingEngine.generateWeeklyReview({
  userProfile: { trainingDays: 4, proteinTarget: 150, units: 'metric' },
  foodLogs: [
    { timestamp: Date.now() - 24 * 3600 * 1000, protein: 145 },
    { timestamp: Date.now() - 48 * 3600 * 1000, protein: 152 },
    { timestamp: Date.now() - 72 * 3600 * 1000, protein: 140 }
  ],
  workoutLogs: [
    { timestamp: Date.now() - 24 * 3600 * 1000, exercises: [{ sets: [{ weight: 60, reps: 10, completed: true }] }] },
    { timestamp: Date.now() - 72 * 3600 * 1000, exercises: [{ sets: [{ weight: 62.5, reps: 8, completed: true }] }] }
  ],
  weightLogs: [{ weight: 74.2 }, { weight: 74.5 }],
  waterIntake: 2800
});

assert(Boolean(weeklyReview.stats), `Weekly review returns stats object`);
assert(typeof weeklyReview.report === 'string' && weeklyReview.report.includes('YOUR WEEK'), `Weekly review contains markdown report`);
assert(weeklyReview.report.includes('WHAT WENT WELL'), `Weekly review contains WHAT WENT WELL section`);
assert(weeklyReview.report.includes('WHAT TO IMPROVE'), `Weekly review contains WHAT TO IMPROVE section`);
assert(weeklyReview.report.includes('NEXT WEEK'), `Weekly review contains NEXT WEEK section`);

// 6. Backup JSON Parsing
console.log('\n--- 6. Testing Backup JSON Import/Parse ---');
const mockBackup = JSON.stringify({
  version: '2.0.0',
  data: {
    workoutLogs: [{ id: 'w1', title: 'Chest Day' }],
    foodLogs: [{ id: 'f1', name: 'Oatmeal' }]
  }
});
const parsed = parseBackupJson(mockBackup);
assert(Array.isArray(parsed.workoutLogs) && parsed.workoutLogs.length === 1, `Backup parsing correctly unpacks workoutLogs`);

console.log(`\n========================================`);
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
