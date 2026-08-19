import { searchCalyxoFoods, ALL_CALYXO_FOODS, HAND_CURATED_FOODS, POPULAR_STAPLES } from '../src/lib/calyxoFoodDatabase.js';

console.log('====================================================');
console.log('         CALYXO FOOD DATABASE VERIFICATION          ');
console.log('====================================================\n');

console.log(`Total ALL_CALYXO_FOODS count: ${ALL_CALYXO_FOODS.length}`);
console.log(`Hand-curated count: ${HAND_CURATED_FOODS.length}`);
console.log(`Popular staples count: ${POPULAR_STAPLES.length}`);

// Test critical staple and dataset queries
const testQueries = [
  'rice',
  'white rice',
  'brown rice',
  'boiled egg',
  'egg',
  'chicken breast',
  'chicken',
  'roti',
  'chapati',
  'dosa',
  'idli',
  'paneer',
  'milk',
  'curd',
  'oats',
  'banana',
  'apple',
  'protein',
  'whey',
  'bread',
  'peanut butter',
  'dal',
  'sambar',
  'biryani',
  'chole',
  'rajma',
  'aloo gobi',
  'fish curry',
  'samosa',
  'pav bhaji',
  'butter chicken',
  'momos'
];

let failedQueries = 0;

testQueries.forEach(q => {
  const results = searchCalyxoFoods(q, 4);
  console.log(`\nQuery: "${q}" -> Found ${results.length} results:`);
  if (results.length === 0) {
    console.error(`  [FAIL] No results returned for "${q}"!`);
    failedQueries++;
  } else {
    results.forEach(r => {
      const cals = r.calsPer100g !== undefined ? r.calsPer100g : (r.calories || 0);
      const prot = r.protPer100g !== undefined ? r.protPer100g : (r.protein || 0);
      const carbs = r.carbsPer100g !== undefined ? r.carbsPer100g : (r.carbs || 0);
      const fat = r.fatPer100g !== undefined ? r.fatPer100g : (r.fat || 0);
      console.log(`  - [${r.id || 'N/A'}] ${r.displayName || r.name} | ${Math.round(cals)} kcal/100g | P: ${prot}g, C: ${carbs}g, F: ${fat}g | Cat: ${r.category || 'General'}`);
    });
  }
});

console.log('\n====================================================');
if (failedQueries === 0) {
  console.log('[✓] ALL FOOD DATABASE & SEARCH VERIFICATIONS PASSED 100%!');
} else {
  console.log(`[✗] FAILED: ${failedQueries} queries had no results!`);
  process.exit(1);
}
console.log('====================================================');
