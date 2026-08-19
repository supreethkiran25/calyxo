import { ALL_CALYXO_FOODS, HAND_CURATED_FOODS, searchCalyxoFoods } from './calyxoFoodDatabase';

// ============================================================================
// CALYXO NUTRITION ENGINE — STRUCTURED TAXONOMY & AUDIT UTILITIES
// Product-led, editorial taxonomy without emojis or decorative clutter.
// ============================================================================

export const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', timeRange: '05:00 - 11:00', desc: 'High-protein starters & complex carbs' },
  { id: 'lunch', label: 'Lunch', timeRange: '11:00 - 16:00', desc: 'Balanced macronutrient mid-day meals' },
  { id: 'dinner', label: 'Dinner', timeRange: '19:00 - 05:00', desc: 'Lean proteins & low glycemic recovery' },
  { id: 'snacks', label: 'Snacks', timeRange: '16:00 - 19:00', desc: 'Mid-afternoon fuel & nutrient density' },
  { id: 'beverages', label: 'Beverages', timeRange: 'All Day', desc: 'Electrolytes, shakes & teas' },
  { id: 'desserts', label: 'Desserts', timeRange: 'All Day', desc: 'Controlled glycemic treats' }
];

export const DIETARY_PREFERENCES = [
  { id: 'all', label: 'All Diets' },
  { id: 'veg', label: 'Vegetarian' },
  { id: 'nonveg', label: 'Non-Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'egg', label: 'Egg-Based' },
  { id: 'dairy', label: 'Dairy-Rich' }
];

export const REGIONAL_REGISTRY = [
  { id: 'south-indian', label: 'South Indian', cuisine: 'Dosa, Idli, Sambar, Upma' },
  { id: 'north-indian', label: 'North Indian', cuisine: 'Roti, Dal, Paneer, Chole' },
  { id: 'karnataka', label: 'Karnataka', cuisine: 'Bisi Bele Bath, Ragi Mudde' },
  { id: 'andhra', label: 'Andhra & Telangana', cuisine: 'Pesarattu, Biryani, Curries' },
  { id: 'kerala', label: 'Kerala', cuisine: 'Appam, Fish Curry, Avial' },
  { id: 'tamil-nadu', label: 'Tamil Nadu', cuisine: 'Pongal, Chettinad, Rasam' },
  { id: 'odisha', label: 'Odisha & East', cuisine: 'Dalma, Chhena, Mustard Fish' },
  { id: 'international', label: 'International', cuisine: 'Mediterranean, Asian, Continental' }
];

export const FITNESS_OBJECTIVES = [
  {
    id: 'high-protein',
    label: 'High Protein',
    criteria: '≥ 15g protein per serving',
    rationale: 'Stimulates muscle protein synthesis and promotes thermogenic satiety.'
  },
  {
    id: 'weight-loss',
    label: 'Weight Loss & Deficit',
    criteria: '< 300 kcal per serving',
    rationale: 'High micronutrient density with low caloric load to sustain a steady deficit.'
  },
  {
    id: 'muscle-gain',
    label: 'Muscle Hypertrophy',
    criteria: 'Calorie & protein dense',
    rationale: 'Sustained glycogen repletion paired with complete amino acid profiles.'
  },
  {
    id: 'high-fiber',
    label: 'High Fiber',
    criteria: '≥ 4g dietary fiber',
    rationale: 'Stabilizes postprandial glucose absorption and supports microbiome integrity.'
  },
  {
    id: 'heart-healthy',
    label: 'Cardiovascular Health',
    criteria: 'Low sodium & unsaturated fats',
    rationale: 'Optimized lipid profile with mono/polyunsaturated fatty acids.'
  },
  {
    id: 'low-calorie',
    label: 'Low Calorie',
    criteria: '< 150 kcal per serving',
    rationale: 'Volume-dense foods providing high satiety per unit of energy.'
  }
];

export const PROTEIN_DIRECTORY = [
  { id: 'chicken', label: 'Chicken Breast', proteinPer100g: 31.0, calsPer100g: 165, fatPer100g: 3.6, category: 'Poultry' },
  { id: 'eggs', label: 'Whole Eggs & Whites', proteinPer100g: 12.6, calsPer100g: 155, fatPer100g: 10.6, category: 'Eggs' },
  { id: 'fish', label: 'Fish & Salmon', proteinPer100g: 22.0, calsPer100g: 140, fatPer100g: 4.5, category: 'Seafood' },
  { id: 'paneer', label: 'Cottage Cheese / Paneer', proteinPer100g: 18.3, calsPer100g: 296, fatPer100g: 22.8, category: 'Dairy' },
  { id: 'tofu-soya', label: 'Tofu & Soya Chunks', proteinPer100g: 52.0, calsPer100g: 345, fatPer100g: 0.5, category: 'Plant' },
  { id: 'whey', label: 'Whey Isolate', proteinPer100g: 78.0, calsPer100g: 390, fatPer100g: 4.0, category: 'Supplement' },
  { id: 'greek-yogurt', label: 'Greek Yogurt', proteinPer100g: 10.0, calsPer100g: 73, fatPer100g: 1.5, category: 'Dairy' },
  { id: 'lentils', label: 'Yellow Dal & Legumes', proteinPer100g: 6.0, calsPer100g: 110, fatPer100g: 3.0, category: 'Legumes' }
];

export const EDITORIAL_TRENDING = [
  {
    id: 'trend-grilled-chicken-breast',
    name: 'Grilled Chicken Breast',
    displayName: 'Grilled Chicken Breast (Boneless, Lean)',
    category: 'Poultry',
    pref: 'nonveg',
    mealSlot: 'dinner',
    region: 'international',
    goals: ['high-protein', 'weight-loss', 'muscle-gain'],
    servingSize: '100g fillet',
    pieceWeight: 100,
    unitType: 'grams',
    calories: 165,
    calsPer100g: 165,
    protein: 31.0,
    protPer100g: 31.0,
    carbs: 0.0,
    carbsPer100g: 0.0,
    fat: 3.6,
    fatPer100g: 3.6,
    benefit: '31g Complete Lean Protein · Zero Net Carbs'
  },
  {
    id: 'trend-steamed-white-rice',
    name: 'Steamed White Rice',
    displayName: 'Steamed White Rice (Cooked)',
    category: 'Grains',
    pref: 'vegan',
    mealSlot: 'lunch',
    region: 'south-indian',
    goals: ['muscle-gain'],
    servingSize: '200g (1 bowl)',
    pieceWeight: 200,
    unitType: 'bowl',
    calories: 260,
    calsPer100g: 130,
    protein: 5.4,
    protPer100g: 2.7,
    carbs: 56.0,
    carbsPer100g: 28.0,
    fat: 0.6,
    fatPer100g: 0.3,
    benefit: 'Easily Digestible Clean Carbohydrate Base'
  },
  {
    id: 'trend-steamed-idli',
    name: 'Steamed Idli',
    displayName: 'Steamed Idli (2 Pieces with Sambar)',
    category: 'South Indian',
    pref: 'vegan',
    mealSlot: 'breakfast',
    region: 'south-indian',
    goals: ['weight-loss', 'heart-healthy', 'high-fiber'],
    servingSize: '100g (2 pieces)',
    pieceWeight: 50,
    unitType: 'piece',
    calories: 140,
    calsPer100g: 140,
    protein: 4.8,
    protPer100g: 4.8,
    carbs: 28.0,
    carbsPer100g: 28.0,
    fat: 0.8,
    fatPer100g: 0.8,
    benefit: 'Fermented Rice & Lentil Probiotic Base'
  },
  {
    id: 'trend-roti-phulka',
    name: 'Roti / Phulka',
    displayName: 'Whole Wheat Roti / Phulka (1 Piece)',
    category: 'Breads',
    pref: 'vegan',
    mealSlot: 'lunch',
    region: 'north-indian',
    goals: ['high-fiber', 'weight-loss'],
    servingSize: '35g (1 piece)',
    pieceWeight: 35,
    unitType: 'piece',
    calories: 85,
    calsPer100g: 242,
    protein: 3.0,
    protPer100g: 8.5,
    carbs: 18.0,
    carbsPer100g: 51.0,
    fat: 0.8,
    fatPer100g: 2.3,
    benefit: '100% Whole Wheat Complex Fiber'
  },
  {
    id: 'trend-boiled-egg',
    name: 'Whole Boiled Egg',
    displayName: 'Whole Boiled Egg (Large)',
    category: 'Eggs',
    pref: 'egg',
    mealSlot: 'breakfast',
    region: 'international',
    goals: ['high-protein', 'weight-loss'],
    servingSize: '50g (1 egg)',
    pieceWeight: 50,
    unitType: 'piece',
    calories: 78,
    calsPer100g: 155,
    protein: 6.3,
    protPer100g: 12.6,
    carbs: 0.6,
    carbsPer100g: 1.1,
    fat: 5.3,
    fatPer100g: 10.6,
    benefit: 'Bioavailable Choline & Amino Acid Profile'
  },
  {
    id: 'trend-dal-tadka',
    name: 'Dal Tadka',
    displayName: 'Yellow Dal Tadka (Home-style)',
    category: 'Lentils',
    pref: 'vegan',
    mealSlot: 'lunch',
    region: 'north-indian',
    goals: ['high-fiber', 'heart-healthy'],
    servingSize: '150g (1 bowl)',
    pieceWeight: 150,
    unitType: 'bowl',
    calories: 165,
    calsPer100g: 110,
    protein: 9.0,
    protPer100g: 6.0,
    carbs: 22.5,
    carbsPer100g: 15.0,
    fat: 4.5,
    fatPer100g: 3.0,
    benefit: 'Plant-Based Protein & Soluble Dietary Fiber'
  },
  {
    id: 'trend-paneer-raw',
    name: 'Raw Paneer',
    displayName: 'Fresh Cottage Cheese / Paneer (100g)',
    category: 'Dairy',
    pref: 'veg',
    mealSlot: 'dinner',
    region: 'north-indian',
    goals: ['high-protein', 'muscle-gain'],
    servingSize: '100g portion',
    pieceWeight: 100,
    unitType: 'grams',
    calories: 296,
    calsPer100g: 296,
    protein: 18.3,
    protPer100g: 18.3,
    carbs: 1.2,
    carbsPer100g: 1.2,
    fat: 22.8,
    fatPer100g: 22.8,
    benefit: 'Slow-Digesting Casein Protein for Night Recovery'
  },
  {
    id: 'trend-rolled-oats',
    name: 'Rolled Oats',
    displayName: 'Rolled Oats (Raw / Dry, 40g)',
    category: 'Breakfast Grains',
    pref: 'vegan',
    mealSlot: 'breakfast',
    region: 'international',
    goals: ['high-fiber', 'heart-healthy', 'high-protein'],
    servingSize: '40g dry',
    pieceWeight: 40,
    unitType: 'grams',
    calories: 155,
    calsPer100g: 389,
    protein: 6.8,
    protPer100g: 16.9,
    carbs: 26.5,
    carbsPer100g: 66.3,
    fat: 2.8,
    fatPer100g: 6.9,
    benefit: 'Beta-Glucan Fiber for Lipid & Insulin Regulation'
  }
];

// Determine meal slot from timestamp
export function getMealSlotFromTime(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 19) return 'snacks';
  return 'dinner';
}

// In-memory filter engine for multi-attribute matching
export function getFilteredDiscoveryFoods({
  dietaryFilter = 'all',
  mealSlotFilter = null,
  regionFilter = null,
  goalFilter = null,
  searchQuery = '',
  limit = 24
} = {}) {
  // If search query is present, search dataset first
  if (searchQuery && searchQuery.trim().length >= 2) {
    const rawMatches = searchCalyxoFoods(searchQuery, limit * 2);
    return rawMatches.filter(food => matchesFilters(food, { dietaryFilter, mealSlotFilter, regionFilter, goalFilter })).slice(0, limit);
  }

  // Combine curated datasets
  const allCurated = [...EDITORIAL_TRENDING, ...HAND_CURATED_FOODS];
  const seen = new Set();
  const uniqueCurated = [];
  for (const f of allCurated) {
    const key = (f.displayName || f.name).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCurated.push(f);
    }
  }

  // Apply filters
  let results = uniqueCurated.filter(food => matchesFilters(food, { dietaryFilter, mealSlotFilter, regionFilter, goalFilter }));

  // If fewer than 8 results, supplement from 11k dataset
  if (results.length < 8) {
    for (const food of ALL_CALYXO_FOODS) {
      const key = (food.displayName || food.name).toLowerCase();
      if (seen.has(key)) continue;
      if (matchesFilters(food, { dietaryFilter, mealSlotFilter, regionFilter, goalFilter })) {
        seen.add(key);
        results.push(food);
        if (results.length >= limit) break;
      }
    }
  }

  return results.slice(0, limit);
}

function matchesFilters(food, { dietaryFilter, mealSlotFilter, regionFilter, goalFilter }) {
  const fName = (food.name || '').toLowerCase();
  const fCat = (food.category || '').toLowerCase();
  const cals = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
  const prot = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
  const carbs = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);

  // Dietary check
  if (dietaryFilter && dietaryFilter !== 'all') {
    if (dietaryFilter === 'veg') {
      const isNonVeg = fCat.includes('non-veg') || fCat.includes('meat') || fCat.includes('chicken') || fCat.includes('fish') || fCat.includes('egg') || fName.includes('chicken') || fName.includes('mutton') || fName.includes('fish') || fName.includes('egg') || food.pref === 'nonveg';
      if (isNonVeg) return false;
    }
    if (dietaryFilter === 'nonveg') {
      const isNonVeg = fCat.includes('non-veg') || fCat.includes('meat') || fCat.includes('chicken') || fCat.includes('fish') || fCat.includes('prawn') || fName.includes('chicken') || fName.includes('mutton') || fName.includes('fish') || fName.includes('prawn') || fName.includes('biryani') || food.pref === 'nonveg';
      if (!isNonVeg) return false;
    }
    if (dietaryFilter === 'vegan') {
      const isDairyOrMeat = fCat.includes('dairy') || fCat.includes('paneer') || fCat.includes('curd') || fCat.includes('milk') || fCat.includes('non-veg') || fName.includes('milk') || fName.includes('curd') || fName.includes('paneer') || fName.includes('chicken') || fName.includes('egg');
      if (isDairyOrMeat) return false;
    }
    if (dietaryFilter === 'egg') {
      const hasEgg = fName.includes('egg') || fName.includes('omelette') || fName.includes('bhurji') || fCat.includes('egg') || food.pref === 'egg';
      if (!hasEgg) return false;
    }
    if (dietaryFilter === 'dairy') {
      const isDairy = fName.includes('milk') || fName.includes('curd') || fName.includes('dahi') || fName.includes('yogurt') || fName.includes('paneer') || fName.includes('cheese') || fCat.includes('dairy');
      if (!isDairy) return false;
    }
  }

  // Meal slot check
  if (mealSlotFilter) {
    if (mealSlotFilter === 'breakfast') {
      const isBk = fCat.includes('breakfast') || fName.includes('idli') || fName.includes('dosa') || fName.includes('oats') || fName.includes('poha') || fName.includes('upma') || fName.includes('egg');
      if (!isBk && food.mealSlot !== 'breakfast') return false;
    }
    if (mealSlotFilter === 'lunch' || mealSlotFilter === 'dinner') {
      const isMain = fCat.includes('curry') || fCat.includes('rice') || fCat.includes('dal') || fCat.includes('roti') || fName.includes('curry') || fName.includes('rice') || fName.includes('dal') || fName.includes('paneer') || fName.includes('chicken');
      if (!isMain && food.mealSlot !== mealSlotFilter) return false;
    }
    if (mealSlotFilter === 'snacks') {
      const isSnack = fCat.includes('snack') || fCat.includes('salad') || fCat.includes('fruit') || fName.includes('nuts') || fName.includes('almond') || fName.includes('sandwich');
      if (!isSnack && food.mealSlot !== 'snacks') return false;
    }
  }

  // Region check
  if (regionFilter) {
    if (regionFilter === 'south-indian') {
      const isSouth = fCat.includes('south') || fName.includes('dosa') || fName.includes('idli') || fName.includes('sambar') || fName.includes('rasam') || fName.includes('upma') || food.region === 'south-indian';
      if (!isSouth) return false;
    }
    if (regionFilter === 'north-indian') {
      const isNorth = fCat.includes('north') || fName.includes('roti') || fName.includes('paneer') || fName.includes('dal') || fName.includes('chole') || food.region === 'north-indian';
      if (!isNorth) return false;
    }
  }

  // Goal check
  if (goalFilter) {
    if (goalFilter === 'high-protein' && prot < 10 && !(food.goals && food.goals.includes('high-protein'))) return false;
    if (goalFilter === 'weight-loss' && cals > 250) return false;
    if (goalFilter === 'muscle-gain' && prot < 8) return false;
    if (goalFilter === 'low-calorie' && cals > 150) return false;
  }

  return true;
}
