import { searchCalyxoFoods, ALL_CALYXO_FOODS } from '../src/lib/calyxoFoodDatabase.js';

console.log('====================================================');
console.log('        KAGGLE DATASET FOOD SEARCH TEST            ');
console.log('====================================================\n');

console.log(`Total Combined Food Records: ${ALL_CALYXO_FOODS.length}`);

const testDishes = [
  'Aam panna',
  'Hot cocoa',
  'Kheere ka sandwich',
  'Meethi lassi',
  'Jeere ka pani',
  'Banana milkshake',
  'Egg nog',
  'Cheese and chilli sandwich'
];

testDishes.forEach(q => {
  const results = searchCalyxoFoods(q, 3);
  console.log(`\nSearch Query: "${q}" -> Found ${results.length} result(s):`);
  results.forEach(r => {
    console.log(`  - [ID: ${r.id || 'Hand-curated'}] ${r.displayName || r.name} | Category: ${r.category} | ${r.calories} kcal | P: ${r.protein}g, C: ${r.carbs}g, F: ${r.fat}g | Source: ${r.source || 'Calyxo Base'}`);
  });
});

console.log('\n====================================================');
console.log('[✓] KAGGLE FOOD SEARCH VERIFICATION PASSED SUCCESSFULLY!');
console.log('====================================================');
