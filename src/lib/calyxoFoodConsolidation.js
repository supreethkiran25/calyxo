import { ALL_CALYXO_FOODS, HAND_CURATED_FOODS, searchCalyxoFoods } from './calyxoFoodDatabase.js';

// ============================================================================
// CALYXO FOOD CONSOLIDATION ENGINE
// Groups redundant and granular food records into unified parent families
// with selectable variations, complete macronutrients, and multi-criteria indexing.
// ============================================================================

export const CONSOLIDATED_FAMILIES = [
  {
    id: 'fam-dosa',
    familyName: 'Dosa Preparations',
    shortName: 'Dosa',
    category: 'South Indian Breakfast',
    dietType: 'veg',
    mealSlots: ['breakfast', 'dinner'],
    regions: ['south-indian', 'karnataka', 'tamil-nadu', 'andhra'],
    goals: ['weight-loss', 'diabetic-friendly'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Plain Dosa',
        displayName: 'Plain Dosa (Golden & Crispy)',
        servingSize: '100g (1 large)',
        pieceWeight: 100,
        unitType: 'piece',
        calsPer100g: 168,
        protPer100g: 3.8,
        carbsPer100g: 29.0,
        fatPer100g: 3.7,
        benefit: 'Fermented gut-friendly rice & lentil crepe'
      },
      {
        name: 'Masala Dosa',
        displayName: 'Masala Dosa (with Potato Masala)',
        servingSize: '120g (1 piece)',
        pieceWeight: 120,
        unitType: 'piece',
        calsPer100g: 208,
        protPer100g: 4.1,
        carbsPer100g: 35.0,
        fatPer100g: 5.8,
        benefit: 'Classic spiced potato filling with sustained carbs'
      },
      {
        name: 'Rava Dosa',
        displayName: 'Crispy Rava Dosa (Semolina Crepe)',
        servingSize: '110g (1 piece)',
        pieceWeight: 110,
        unitType: 'piece',
        calsPer100g: 185,
        protPer100g: 4.5,
        carbsPer100g: 32.0,
        fatPer100g: 4.2,
        benefit: 'Crisp semolina crepe with cumin and peppercorns'
      },
      {
        name: 'Onion Dosa',
        displayName: 'Onion Uttapam / Dosa',
        servingSize: '120g (1 piece)',
        pieceWeight: 120,
        unitType: 'piece',
        calsPer100g: 175,
        protPer100g: 4.0,
        carbsPer100g: 30.0,
        fatPer100g: 4.0,
        benefit: 'Topped with caramelized shallots and green chilies'
      },
      {
        name: 'Mysore Masala Dosa',
        displayName: 'Mysore Masala Dosa (Red Chutney Base)',
        servingSize: '130g (1 piece)',
        pieceWeight: 130,
        unitType: 'piece',
        calsPer100g: 220,
        protPer100g: 4.4,
        carbsPer100g: 34.0,
        fatPer100g: 7.0,
        benefit: 'Spicy garlic-red chili spread with rich potato stuffing'
      },
      {
        name: 'Pesarattu (Moong Dal Dosa)',
        displayName: 'Pesarattu (Whole Green Gram Dosa)',
        servingSize: '110g (1 piece)',
        pieceWeight: 110,
        unitType: 'piece',
        calsPer100g: 155,
        protPer100g: 8.2,
        carbsPer100g: 24.0,
        fatPer100g: 2.8,
        benefit: 'High-protein whole green moong batter from Andhra'
      }
    ]
  },
  {
    id: 'fam-chicken',
    familyName: 'Chicken Dishes',
    shortName: 'Chicken',
    category: 'Poultry & Meat',
    dietType: 'nonveg',
    mealSlots: ['lunch', 'dinner'],
    regions: ['north-indian', 'south-indian', 'andhra', 'international'],
    goals: ['high-protein', 'weight-loss', 'muscle-gain', 'keto'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Grilled Chicken Breast',
        displayName: 'Grilled Chicken Breast (Boneless, Lean)',
        servingSize: '100g fillet',
        pieceWeight: 100,
        unitType: 'grams',
        calsPer100g: 165,
        protPer100g: 31.0,
        carbsPer100g: 0.0,
        fatPer100g: 3.6,
        benefit: '31g pure bioavailable protein · Zero net carbs'
      },
      {
        name: 'Home-style Chicken Curry',
        displayName: 'Chicken Curry (Home-style Onion-Tomato Base)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 145,
        protPer100g: 14.5,
        carbsPer100g: 4.0,
        fatPer100g: 8.0,
        benefit: 'Lean protein in light turmeric, ginger & garlic gravy'
      },
      {
        name: 'Butter Chicken',
        displayName: 'Butter Chicken / Murgh Makhani',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 185,
        protPer100g: 12.5,
        carbsPer100g: 6.5,
        fatPer100g: 12.0,
        benefit: 'Tandoori roasted chicken in creamy tomato-cashew gravy'
      },
      {
        name: 'Chicken Tikka',
        displayName: 'Chicken Tikka (Tandoor Grilled Skewers)',
        servingSize: '120g (4 pieces)',
        pieceWeight: 120,
        unitType: 'grams',
        calsPer100g: 150,
        protPer100g: 22.0,
        carbsPer100g: 3.0,
        fatPer100g: 5.5,
        benefit: 'Smoky spiced yogurt marinade with high protein retention'
      },
      {
        name: 'Chettinad Chicken Curry',
        displayName: 'Chettinad Chicken (Black Pepper & Fennel)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 160,
        protPer100g: 15.0,
        carbsPer100g: 4.5,
        fatPer100g: 9.0,
        benefit: 'Roasted spice blend promoting thermogenic digestion'
      },
      {
        name: 'Chicken Biryani',
        displayName: 'Chicken Biryani (Dum Style with Rice)',
        servingSize: '250g (1 bowl)',
        pieceWeight: 250,
        unitType: 'bowl',
        calsPer100g: 140,
        protPer100g: 9.3,
        carbsPer100g: 16.0,
        fatPer100g: 4.6,
        benefit: 'Complete high-protein meal with basmati carbohydrates'
      }
    ]
  },
  {
    id: 'fam-rice',
    familyName: 'Rice & Cooked Grains',
    shortName: 'Rice',
    category: 'Grains & Cereals',
    dietType: 'vegan',
    mealSlots: ['lunch', 'dinner'],
    regions: ['south-indian', 'north-indian', 'karnataka', 'international'],
    goals: ['muscle-gain'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Steamed White Rice',
        displayName: 'Steamed White Rice (Cooked)',
        servingSize: '200g (1 bowl)',
        pieceWeight: 200,
        unitType: 'bowl',
        calsPer100g: 130,
        protPer100g: 2.7,
        carbsPer100g: 28.0,
        fatPer100g: 0.3,
        benefit: 'Fast-digesting clean glycogen repletion'
      },
      {
        name: 'Brown Rice',
        displayName: 'Brown Rice (Cooked, Unpolished)',
        servingSize: '200g (1 bowl)',
        pieceWeight: 200,
        unitType: 'bowl',
        calsPer100g: 111,
        protPer100g: 2.6,
        carbsPer100g: 23.0,
        fatPer100g: 0.9,
        benefit: 'Whole grain bran layer packed with magnesium & fiber'
      },
      {
        name: 'Curd Rice',
        displayName: 'Curd Rice / Dahi Chawal (Tempered)',
        servingSize: '200g (1 bowl)',
        pieceWeight: 200,
        unitType: 'bowl',
        calsPer100g: 145,
        protPer100g: 3.5,
        carbsPer100g: 20.0,
        fatPer100g: 5.5,
        benefit: 'Probiotic-rich cooling meal for gut homeostasis'
      },
      {
        name: 'Jeera Rice',
        displayName: 'Jeera Rice (Basmati with Cumin)',
        servingSize: '200g (1 bowl)',
        pieceWeight: 200,
        unitType: 'bowl',
        calsPer100g: 155,
        protPer100g: 2.8,
        carbsPer100g: 29.0,
        fatPer100g: 3.0,
        benefit: 'Lightly tempered basmati with digestive cumin seeds'
      },
      {
        name: 'Poha',
        displayName: 'Poha (Flattened Rice with Mustard & Peanuts)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 160,
        protPer100g: 3.2,
        carbsPer100g: 28.0,
        fatPer100g: 4.0,
        benefit: 'Iron-rich light breakfast grain tempered with turmeric'
      }
    ]
  },
  {
    id: 'fam-egg',
    familyName: 'Egg Preparations',
    shortName: 'Eggs',
    category: 'Eggs & Protein',
    dietType: 'egg',
    mealSlots: ['breakfast', 'dinner', 'snacks'],
    regions: ['international', 'north-indian', 'south-indian'],
    goals: ['high-protein', 'weight-loss', 'keto', 'muscle-gain'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Whole Boiled Egg',
        displayName: 'Whole Boiled Egg (Large)',
        servingSize: '50g (1 egg)',
        pieceWeight: 50,
        unitType: 'piece',
        calsPer100g: 155,
        protPer100g: 12.6,
        carbsPer100g: 1.1,
        fatPer100g: 10.6,
        benefit: 'Bioavailable choline, Vitamin D and complete amino acids'
      },
      {
        name: 'Egg Omelette',
        displayName: 'Egg Omelette (Plain / 2 Eggs)',
        servingSize: '100g (2 eggs)',
        pieceWeight: 100,
        unitType: 'piece',
        calsPer100g: 154,
        protPer100g: 11.0,
        carbsPer100g: 1.2,
        fatPer100g: 11.5,
        benefit: 'Pan-cooked eggs with essential lipid micronutrients'
      },
      {
        name: 'Scrambled Eggs (Bhurji)',
        displayName: 'Egg Bhurji (Indian Scramble with Onions & Peppers)',
        servingSize: '100g portion',
        pieceWeight: 100,
        unitType: 'bowl',
        calsPer100g: 140,
        protPer100g: 12.0,
        carbsPer100g: 2.0,
        fatPer100g: 9.5,
        benefit: 'High-protein scramble cooked with fresh herbs and tomatoes'
      },
      {
        name: 'Boiled Egg Whites',
        displayName: 'Egg White (Boiled, Fat-Free)',
        servingSize: '33g (1 white)',
        pieceWeight: 33,
        unitType: 'piece',
        calsPer100g: 52,
        protPer100g: 11.0,
        carbsPer100g: 0.7,
        fatPer100g: 0.2,
        benefit: 'Pure isolated albumin protein with virtually zero fats'
      },
      {
        name: 'Egg Curry',
        displayName: 'Egg Curry (2 Boiled Eggs in Spiced Gravy)',
        servingSize: '180g (1 bowl)',
        pieceWeight: 180,
        unitType: 'bowl',
        calsPer100g: 135,
        protPer100g: 8.5,
        carbsPer100g: 4.5,
        fatPer100g: 9.0,
        benefit: 'Hard-boiled eggs simmered in onion-tomato masala'
      }
    ]
  },
  {
    id: 'fam-paneer',
    familyName: 'Paneer & Cottage Cheese',
    shortName: 'Paneer',
    category: 'Dairy & Protein',
    dietType: 'veg',
    mealSlots: ['lunch', 'dinner'],
    regions: ['north-indian'],
    goals: ['high-protein', 'muscle-gain', 'keto'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Raw Paneer',
        displayName: 'Raw Paneer / Cottage Cheese',
        servingSize: '100g portion',
        pieceWeight: 100,
        unitType: 'grams',
        calsPer100g: 296,
        protPer100g: 18.3,
        carbsPer100g: 1.2,
        fatPer100g: 22.8,
        benefit: 'High in slow-digesting casein protein & dense calcium'
      },
      {
        name: 'Low-Fat Diet Paneer',
        displayName: 'Low-Fat / Diet Paneer (Skimmed Milk)',
        servingSize: '100g portion',
        pieceWeight: 100,
        unitType: 'grams',
        calsPer100g: 180,
        protPer100g: 24.0,
        carbsPer100g: 4.0,
        fatPer100g: 7.5,
        benefit: '24g protein with 65% less fat than standard paneer'
      },
      {
        name: 'Paneer Tikka',
        displayName: 'Paneer Tikka (Tandoori Grilled)',
        servingSize: '120g (4 cubes)',
        pieceWeight: 120,
        unitType: 'grams',
        calsPer100g: 220,
        protPer100g: 14.5,
        carbsPer100g: 5.0,
        fatPer100g: 16.0,
        benefit: 'Skewered paneer cubes marinated in yogurt and ajwain'
      },
      {
        name: 'Paneer Butter Masala',
        displayName: 'Paneer Butter Masala (Rich Curry)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 220,
        protPer100g: 9.3,
        carbsPer100g: 12.0,
        fatPer100g: 16.0,
        benefit: 'Rich cottage cheese curry with tomato and cashew gravy'
      },
      {
        name: 'Palak Paneer',
        displayName: 'Palak Paneer (Spinach & Cottage Cheese)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 160,
        protPer100g: 10.5,
        carbsPer100g: 5.0,
        fatPer100g: 11.0,
        benefit: 'Dense dietary iron, folate and vitamins from fresh spinach'
      }
    ]
  },
  {
    id: 'fam-dal',
    familyName: 'Dal & Legumes',
    shortName: 'Dal',
    category: 'Lentils & Pulses',
    dietType: 'vegan',
    mealSlots: ['lunch', 'dinner'],
    regions: ['north-indian', 'south-indian'],
    goals: ['high-fiber', 'heart-healthy', 'weight-loss'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Dal Tadka',
        displayName: 'Yellow Dal Tadka (Home-style)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 110,
        protPer100g: 6.0,
        carbsPer100g: 15.0,
        fatPer100g: 3.0,
        benefit: 'Split yellow pigeon peas with garlic & cumin tempering'
      },
      {
        name: 'South Indian Sambar',
        displayName: 'South Indian Sambar (Drumstick & Veggies)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 65,
        protPer100g: 3.2,
        carbsPer100g: 10.0,
        fatPer100g: 1.5,
        benefit: 'Low-calorie lentil broth rich in tamarind and antioxidants'
      },
      {
        name: 'Dal Makhani',
        displayName: 'Dal Makhani (Slow-Cooked Black Lentils)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 135,
        protPer100g: 5.0,
        carbsPer100g: 14.0,
        fatPer100g: 7.0,
        benefit: 'Whole black urad dal rich in complex carbohydrates'
      },
      {
        name: 'Chole / Chana Masala',
        displayName: 'Chole / Chickpeas Masala (1 Bowl)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 140,
        protPer100g: 6.5,
        carbsPer100g: 18.0,
        fatPer100g: 4.5,
        benefit: 'Garbanzo beans packed with prebiotic dietary fiber'
      },
      {
        name: 'Rajma Curry',
        displayName: 'Rajma / Red Kidney Beans Masala',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 130,
        protPer100g: 6.0,
        carbsPer100g: 19.0,
        fatPer100g: 3.5,
        benefit: 'High-fiber red kidney beans with slow-release carbs'
      }
    ]
  },
  {
    id: 'fam-roti',
    familyName: 'Rotis & Whole Breads',
    shortName: 'Roti',
    category: 'Indian Breads',
    dietType: 'vegan',
    mealSlots: ['lunch', 'dinner'],
    regions: ['north-indian', 'international'],
    goals: ['high-fiber', 'weight-loss'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Roti / Phulka',
        displayName: 'Roti / Phulka (100% Whole Wheat, No Oil)',
        servingSize: '35g (1 piece)',
        pieceWeight: 35,
        unitType: 'piece',
        calsPer100g: 242,
        protPer100g: 8.5,
        carbsPer100g: 51.0,
        fatPer100g: 2.3,
        benefit: 'Unleavened whole wheat flatbread baked on tawa'
      },
      {
        name: 'Chapati (with Light Oil)',
        displayName: 'Chapati (with 1/2 tsp Ghee/Oil)',
        servingSize: '40g (1 piece)',
        pieceWeight: 40,
        unitType: 'piece',
        calsPer100g: 275,
        protPer100g: 8.0,
        carbsPer100g: 48.0,
        fatPer100g: 6.5,
        benefit: 'Traditional wheat flatbread with healthy fat glaze'
      },
      {
        name: 'Whole Wheat Paratha',
        displayName: 'Plain Paratha (Pan-Toasted)',
        servingSize: '60g (1 piece)',
        pieceWeight: 60,
        unitType: 'piece',
        calsPer100g: 290,
        protPer100g: 7.0,
        carbsPer100g: 45.0,
        fatPer100g: 9.5,
        benefit: 'Layered whole wheat bread with sustained caloric density'
      },
      {
        name: 'Whole Wheat Brown Bread',
        displayName: 'Whole Wheat Bread (1 Slice)',
        servingSize: '30g (1 slice)',
        pieceWeight: 30,
        unitType: 'slice',
        calsPer100g: 245,
        protPer100g: 9.0,
        carbsPer100g: 44.0,
        fatPer100g: 3.5,
        benefit: 'Convenient fiber-rich sandwich base'
      }
    ]
  },
  {
    id: 'fam-oats',
    familyName: 'Oats & Whole Cereals',
    shortName: 'Oats',
    category: 'Breakfast Cereals',
    dietType: 'vegan',
    mealSlots: ['breakfast', 'snacks'],
    regions: ['international'],
    goals: ['high-fiber', 'heart-healthy', 'high-protein'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Rolled Oats (Raw)',
        displayName: 'Rolled Oats (Raw / Dry, 40g)',
        servingSize: '40g dry',
        pieceWeight: 40,
        unitType: 'grams',
        calsPer100g: 389,
        protPer100g: 16.9,
        carbsPer100g: 66.3,
        fatPer100g: 6.9,
        benefit: 'Rich in soluble beta-glucan fiber that lowers LDL cholesterol'
      },
      {
        name: 'Cooked Oatmeal in Milk',
        displayName: 'Cooked Oatmeal (in Cow Milk, 200g)',
        servingSize: '200g (1 bowl)',
        pieceWeight: 200,
        unitType: 'bowl',
        calsPer100g: 110,
        protPer100g: 5.0,
        carbsPer100g: 18.0,
        fatPer100g: 2.8,
        benefit: 'Warm, slow-digesting complex carbohydrate porridge'
      },
      {
        name: 'Oats Upma',
        displayName: 'Savory Oats Upma (with Veggies)',
        servingSize: '150g (1 bowl)',
        pieceWeight: 150,
        unitType: 'bowl',
        calsPer100g: 125,
        protPer100g: 4.2,
        carbsPer100g: 21.0,
        fatPer100g: 3.2,
        benefit: 'Indian spiced savory oats with mustard seeds and carrots'
      }
    ]
  },
  {
    id: 'fam-protein-supplements',
    familyName: 'Isolated Proteins & Dairy',
    shortName: 'Proteins',
    category: 'Fitness & Supplements',
    dietType: 'veg',
    mealSlots: ['breakfast', 'snacks', 'dinner'],
    regions: ['international'],
    goals: ['high-protein', 'muscle-gain', 'weight-loss'],
    defaultVariantIndex: 0,
    variations: [
      {
        name: 'Whey Protein Powder',
        displayName: 'Whey Protein Isolate (1 Scoop / 30g)',
        servingSize: '30g scoop',
        pieceWeight: 30,
        unitType: 'scoop',
        calsPer100g: 390,
        protPer100g: 78.0,
        carbsPer100g: 8.0,
        fatPer100g: 4.0,
        benefit: 'Fast-absorbing whey with 5.5g BCAAs per serving'
      },
      {
        name: 'Plain Greek Yogurt',
        displayName: 'Greek Yogurt (High Protein, Unsweetened)',
        servingSize: '150g (1 cup)',
        pieceWeight: 150,
        unitType: 'cup',
        calsPer100g: 73,
        protPer100g: 10.0,
        carbsPer100g: 4.0,
        fatPer100g: 1.5,
        benefit: 'Strained yogurt containing double the protein of standard curd'
      },
      {
        name: 'Soya Chunks',
        displayName: 'Soya Chunks / Meal-maker (Dry, 50g)',
        servingSize: '50g dry',
        pieceWeight: 50,
        unitType: 'grams',
        calsPer100g: 345,
        protPer100g: 52.0,
        carbsPer100g: 33.0,
        fatPer100g: 0.5,
        benefit: '52% pure plant protein from defatted soy flour'
      }
    ]
  }
];

// Query and filter consolidated families
export function getConsolidatedFoods({
  searchQuery = '',
  dietType = 'all',
  mealSlot = null,
  region = null,
  goal = null,
  limit = 20
} = {}) {
  const query = (searchQuery || '').toLowerCase().trim();

  // If user typed a search query, search both consolidated families and the 11k database
  if (query.length >= 2) {
    const matchedFamilies = CONSOLIDATED_FAMILIES.filter(fam => {
      const nameMatch = fam.familyName.toLowerCase().includes(query) || fam.shortName.toLowerCase().includes(query);
      const variantMatch = fam.variations.some(v => v.name.toLowerCase().includes(query) || v.displayName.toLowerCase().includes(query));
      const catMatch = fam.category.toLowerCase().includes(query);
      return nameMatch || variantMatch || catMatch;
    });

    // Also get raw database matches and wrap them cleanly
    const rawMatches = searchCalyxoFoods(query, limit * 2);
    const convertedRaw = [];
    const seenNames = new Set(matchedFamilies.map(f => f.shortName.toLowerCase()));

    for (const raw of rawMatches) {
      const rawTitle = raw.displayName || raw.name;
      if (seenNames.has(rawTitle.toLowerCase())) continue;
      seenNames.add(rawTitle.toLowerCase());

      convertedRaw.push({
        id: `raw-${raw.id || raw.name}`,
        familyName: rawTitle,
        shortName: rawTitle,
        category: raw.category || 'General Food',
        dietType: (raw.category || '').toLowerCase().includes('non-veg') ? 'nonveg' : 'veg',
        mealSlots: ['lunch', 'dinner'],
        regions: ['international'],
        goals: [],
        defaultVariantIndex: 0,
        variations: [
          {
            name: rawTitle,
            displayName: rawTitle,
            servingSize: raw.servingSize || '100g portion',
            pieceWeight: raw.pieceWeight || 100,
            unitType: raw.unitType || 'grams',
            calsPer100g: raw.calsPer100g !== undefined ? raw.calsPer100g : (raw.calories || 0),
            protPer100g: raw.protPer100g !== undefined ? raw.protPer100g : (raw.protein || 0),
            carbsPer100g: raw.carbsPer100g !== undefined ? raw.carbsPer100g : (raw.carbs || 0),
            fatPer100g: raw.fatPer100g !== undefined ? raw.fatPer100g : (raw.fat || 0),
            benefit: raw.category || 'Nutrition Database Entry'
          }
        ]
      });

      if (convertedRaw.length + matchedFamilies.length >= limit) break;
    }

    return [...matchedFamilies, ...convertedRaw].slice(0, limit);
  }

  // Filter consolidated families based on active taxonomy filters
  return CONSOLIDATED_FAMILIES.filter(fam => {
    if (dietType && dietType !== 'all') {
      if (dietType === 'veg' && fam.dietType === 'nonveg') return false;
      if (dietType === 'nonveg' && fam.dietType !== 'nonveg') return false;
      if (dietType === 'vegan' && fam.dietType !== 'vegan') return false;
      if (dietType === 'egg' && fam.dietType !== 'egg') return false;
    }
    if (mealSlot && !fam.mealSlots.includes(mealSlot)) return false;
    if (region && !fam.regions.includes(region)) return false;
    if (goal && !fam.goals.includes(goal)) return false;
    return true;
  }).slice(0, limit);
}
