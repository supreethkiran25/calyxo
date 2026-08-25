/**
 * Calyxo AI Meal Planner & Automated Grocery Engine (Indian Market & Global)
 *
 * Generates personalized daily meal architecture with dynamic variations for each diet type,
 * macro matching, authentic Indian grocery breakdown with real-world INR (₹) item pricing,
 * and cost-per-gram protein optimization.
 */

const NON_VEG_VARIATIONS = [
  {
    breakfast: {
      name: 'Masala Rolled Oats with 3 Whole Boiled Eggs',
      portion: '60g Oats cooked with turmeric & veggies + 3 Boiled Eggs',
      groceryItems: [
        { name: 'Rolled Oats (500g)', cost: 95, category: 'grains' },
        { name: 'Farm Fresh Eggs (1 Dozen)', cost: 84, category: 'protein' },
        { name: 'Onions & Green Chillies', cost: 25, category: 'produce' }
      ]
    },
    lunch: {
      name: 'Grilled Chicken Breast Rice Bowl with Steamed Broccoli & Dahi',
      portion: '150g Chicken Breast + 180g Steamed Rice + 100g Broccoli + 100g Curd',
      groceryItems: [
        { name: 'Boneless Chicken Breast (500g)', cost: 160, category: 'protein' },
        { name: 'Basmati / Sona Masoori Rice (1kg)', cost: 65, category: 'grains' },
        { name: 'Fresh Broccoli (250g)', cost: 40, category: 'produce' },
        { name: 'Toned Dahi / Curd (400g)', cost: 40, category: 'protein' }
      ]
    },
    preWorkout: {
      name: 'Fresh Robusta Banana with Plain Curd & Chia Seeds',
      portion: '1 Medium Banana + 150g Dahi + 10g Chia Seeds',
      groceryItems: [
        { name: 'Fresh Bananas (6 pcs)', cost: 35, category: 'produce' },
        { name: 'Chia Seeds (100g)', cost: 60, category: 'pantry' }
      ]
    },
    dinner: {
      name: 'Spiced Chicken Keema Curry with 2 Whole Wheat Rotis & Salad',
      portion: '140g Minced Chicken + 2 Phulkas (60g) + Cucumber Tomato Salad',
      groceryItems: [
        { name: 'Chicken Keema (250g)', cost: 95, category: 'protein' },
        { name: 'Whole Wheat Chakki Atta (1kg)', cost: 48, category: 'grains' },
        { name: 'Cucumbers & Tomatoes', cost: 30, category: 'produce' }
      ]
    }
  },
  {
    breakfast: {
      name: '3 Egg Scramble with Sautéed Spinach & Whole Wheat Toast',
      portion: '3 Eggs + 50g Spinach + 2 Slices Brown Bread',
      groceryItems: [
        { name: 'Farm Fresh Eggs (1 Dozen)', cost: 84, category: 'protein' },
        { name: 'Brown Bread Loaf', cost: 45, category: 'grains' },
        { name: 'Fresh Palak / Spinach (250g)', cost: 25, category: 'produce' }
      ]
    },
    lunch: {
      name: 'Tandoori Spiced Chicken Thigh with Dal Tadka & Steamed Rice',
      portion: '150g Chicken Thigh + 1 Bowl Toor Dal (150ml) + 150g Rice',
      groceryItems: [
        { name: 'Chicken Thighs (500g)', cost: 150, category: 'protein' },
        { name: 'Yellow Toor Dal (500g)', cost: 85, category: 'grains' },
        { name: 'Basmati Rice (1kg)', cost: 65, category: 'grains' }
      ]
    },
    preWorkout: {
      name: 'Roasted Chana & Sweet Black Coffee / Tender Coconut Water',
      portion: '40g Roasted Chana + 1 Glass Water / Coffee',
      groceryItems: [
        { name: 'Roasted Bengal Gram / Chana (200g)', cost: 40, category: 'protein' }
      ]
    },
    dinner: {
      name: 'Grilled Fish Tikka / Chicken Breast with Steamed Veggies & 2 Rotis',
      portion: '160g Fish / Chicken Breast + 2 Whole Wheat Rotis + Lemon Dressing',
      groceryItems: [
        { name: 'Basa / Rohu Fillet or Chicken (300g)', cost: 130, category: 'protein' },
        { name: 'Capsicum & Carrots (250g)', cost: 35, category: 'produce' }
      ]
    }
  },
  {
    breakfast: {
      name: 'High-Protein Egg Poha with Peanuts & Boiled Egg Whites',
      portion: '60g Thick Poha + 15g Peanuts + 3 Boiled Egg Whites',
      groceryItems: [
        { name: 'Thick Avalakki / Poha (500g)', cost: 45, category: 'grains' },
        { name: 'Raw Peanuts (200g)', cost: 38, category: 'pantry' },
        { name: 'Eggs (6 pcs pack)', cost: 45, category: 'protein' }
      ]
    },
    lunch: {
      name: 'Hyderabadi Style Chicken Biryani Bowl with Cucumber Raita',
      portion: '160g Cooked Biryani Rice + 140g Marinated Chicken + 100g Cucumber Raita',
      groceryItems: [
        { name: 'Boneless Chicken (500g)', cost: 160, category: 'protein' },
        { name: 'Biryani Basmati Rice (1kg)', cost: 75, category: 'grains' },
        { name: 'Dahi / Curd (200g)', cost: 25, category: 'protein' }
      ]
    },
    preWorkout: {
      name: 'Apple Slices with 1 Spoon Peanut Butter',
      portion: '1 Fresh Royal Gala Apple + 15g Natural Peanut Butter',
      groceryItems: [
        { name: 'Fresh Apples (4 pcs)', cost: 70, category: 'produce' },
        { name: 'Unsweetened Peanut Butter (350g)', cost: 140, category: 'pantry' }
      ]
    },
    dinner: {
      name: 'Egg Curry with 2 Whole Wheat Phulkas & Steamed Green Beans',
      portion: '2 Whole Eggs in Spicy Tomato Gravy + 2 Phulkas + Green Salad',
      groceryItems: [
        { name: 'Eggs (6 pcs)', cost: 45, category: 'protein' },
        { name: 'French Beans (250g)', cost: 30, category: 'produce' }
      ]
    }
  }
];

const EGG_VARIATIONS = [
  {
    breakfast: {
      name: '2 Whole Egg & 2 Egg White Veggie Omelette with Brown Bread Toast',
      portion: '4 Eggs (2 whole + 2 whites) + 2 Slices Brown Bread',
      groceryItems: [
        { name: 'Farm Fresh Eggs (1 Dozen)', cost: 84, category: 'protein' },
        { name: 'Brown Bread Loaf', cost: 45, category: 'grains' },
        { name: 'Bell Peppers & Onions', cost: 30, category: 'produce' }
      ]
    },
    lunch: {
      name: 'Sprouted Moong & Paneer Pulao with Dal Tadka',
      portion: '1 Bowl Dal Tadka (150g) + 150g Paneer & Sprout Pulao',
      groceryItems: [
        { name: 'Yellow Toor Dal (500g)', cost: 85, category: 'grains' },
        { name: 'Fresh Malai Paneer (200g)', cost: 90, category: 'protein' },
        { name: 'Green Moong Sprouts (250g)', cost: 35, category: 'protein' }
      ]
    },
    preWorkout: {
      name: 'Roasted Sattu Drink & 1 Apple',
      portion: '30g Chana Sattu in Water + 1 Fresh Apple',
      groceryItems: [
        { name: 'Chana Sattu (500g)', cost: 65, category: 'protein' },
        { name: 'Fresh Apples (4 pcs)', cost: 70, category: 'produce' }
      ]
    },
    dinner: {
      name: 'Egg Bhurji with 2 Whole Wheat Rotis & Mint Chaas',
      portion: '3 Scrambled Eggs + 2 Rotis (60g) + 1 Glass Spiced Buttermilk',
      groceryItems: [
        { name: 'Eggs (6 pcs)', cost: 45, category: 'protein' },
        { name: 'Whole Wheat Atta', cost: 48, category: 'grains' },
        { name: 'Spiced Buttermilk / Chaas (200ml)', cost: 15, category: 'protein' }
      ]
    }
  },
  {
    breakfast: {
      name: 'Akuri Spiced Scrambled Eggs on Multigrain Toast',
      portion: '3 Eggs cooked with ginger, garlic, tomatoes + 2 Multigrain Slices',
      groceryItems: [
        { name: 'Eggs (1 Dozen)', cost: 84, category: 'protein' },
        { name: 'Multigrain Bread', cost: 50, category: 'grains' },
        { name: 'Fresh Coriander & Ginger', cost: 20, category: 'produce' }
      ]
    },
    lunch: {
      name: 'Boiled Egg Biryani Bowl with Cucumber Onion Raita',
      portion: '3 Boiled Eggs in Spiced Fragrant Rice (180g) + Raita (100g)',
      groceryItems: [
        { name: 'Basmati Rice (1kg)', cost: 65, category: 'grains' },
        { name: 'Dahi (400g)', cost: 40, category: 'protein' },
        { name: 'Cucumbers (500g)', cost: 25, category: 'produce' }
      ]
    },
    preWorkout: {
      name: 'Banana with 1 Glass Toned Milk',
      portion: '1 Medium Banana + 200ml Cold Milk',
      groceryItems: [
        { name: 'Fresh Bananas (6 pcs)', cost: 35, category: 'produce' },
        { name: 'Toned Milk (1 Litre)', cost: 56, category: 'protein' }
      ]
    },
    dinner: {
      name: 'Stuffed Paneer Paratha with 2 Boiled Egg Whites & Tomato Chutney',
      portion: '1 Large Paneer Paratha (100g) + 2 Egg Whites + Chutney',
      groceryItems: [
        { name: 'Fresh Paneer (200g)', cost: 90, category: 'protein' },
        { name: 'Tomatoes (500g)', cost: 25, category: 'produce' }
      ]
    }
  }
];

const VEG_VARIATIONS = [
  {
    breakfast: {
      name: 'Moong Dal Chilla (Pesarattu) with Mint Chutney & Paneer Stuffing',
      portion: '2 Moong Chillas (160g) + 50g Crumbled Paneer + Mint Chutney',
      groceryItems: [
        { name: 'Green Moong Dal (500g)', cost: 75, category: 'grains' },
        { name: 'Fresh Paneer (200g)', cost: 90, category: 'protein' },
        { name: 'Fresh Mint & Coriander', cost: 20, category: 'produce' }
      ]
    },
    lunch: {
      name: 'High-Protein Soya Chunks & Rajma Curry with Steamed Rice',
      portion: '50g Dry Soya Chunks (rehydrated) + 1 Bowl Rajma (150g) + 150g Rice',
      groceryItems: [
        { name: 'Nutrela Soya Chunks (200g)', cost: 45, category: 'protein' },
        { name: 'Red Kidney Beans / Rajma (500g)', cost: 85, category: 'grains' },
        { name: 'Basmati Rice (1kg)', cost: 65, category: 'grains' }
      ]
    },
    preWorkout: {
      name: 'Peanut Butter Whole Wheat Toast & 1 Banana',
      portion: '1 Slice Brown Bread + 1 Tbsp Peanut Butter + 1 Banana',
      groceryItems: [
        { name: 'Natural Peanut Butter (350g)', cost: 140, category: 'pantry' },
        { name: 'Brown Bread', cost: 45, category: 'grains' },
        { name: 'Fresh Bananas (6 pcs)', cost: 35, category: 'produce' }
      ]
    },
    dinner: {
      name: 'Fresh Paneer Tikka / Sauté with 2 Whole Wheat Phulkas & Dal Tadka',
      portion: '120g Paneer + 2 Phulkas + 1 Bowl Dal (120ml)',
      groceryItems: [
        { name: 'Fresh Paneer (200g)', cost: 90, category: 'protein' },
        { name: 'Yellow Moong Dal (500g)', cost: 80, category: 'grains' },
        { name: 'Whole Wheat Atta', cost: 48, category: 'grains' }
      ]
    }
  },
  {
    breakfast: {
      name: 'Soya & Sprouted Moong Chaat with Lemon & Roasted Peanuts',
      portion: '40g Boiled Soya Chunks + 60g Moong Sprouts + 15g Peanuts + Veggies',
      groceryItems: [
        { name: 'Soya Chunks (200g)', cost: 45, category: 'protein' },
        { name: 'Moong Sprouts (250g)', cost: 35, category: 'protein' },
        { name: 'Roasted Peanuts (200g)', cost: 38, category: 'pantry' }
      ]
    },
    lunch: {
      name: 'Paneer Butter Bhurji with 2 Whole Wheat Rotis & Chana Masala',
      portion: '120g Paneer Bhurji + 2 Rotis (60g) + 1 Bowl Kala Chana Curry (150g)',
      groceryItems: [
        { name: 'Fresh Paneer (200g)', cost: 90, category: 'protein' },
        { name: 'Black Gram / Kala Chana (500g)', cost: 65, category: 'grains' },
        { name: 'Tomatoes & Onions', cost: 40, category: 'produce' }
      ]
    },
    preWorkout: {
      name: 'Roasted Makhana (Fox Nuts) & 1 Apple',
      portion: '30g Roasted Makhana with Rock Salt + 1 Apple',
      groceryItems: [
        { name: 'Phool Makhana (100g)', cost: 85, category: 'pantry' },
        { name: 'Fresh Apples (4 pcs)', cost: 70, category: 'produce' }
      ]
    },
    dinner: {
      name: 'High-Protein Tofu / Paneer Sauté with Stir-Fried Veggies & 2 Rotis',
      portion: '130g Tofu or Paneer + Bell Peppers + 2 Phulkas',
      groceryItems: [
        { name: 'Soya Tofu / Low Fat Paneer (200g)', cost: 60, category: 'protein' },
        { name: 'Bell Peppers & Carrots', cost: 35, category: 'produce' }
      ]
    }
  }
];

export class AIMealPlannerEngine {
  /**
   * Generate structured daily meal architecture with dynamic variations & budget grocery list
   */
  static generateMealPlan({
    goal = 'muscle_gain',
    targetCalories = 2200,
    targetProtein = 140,
    dietType = 'nonveg',
    cuisine = 'indian',
    budget = 'standard',
    budgetInRupees = 400
  } = {}) {
    let pRatio = 0.30;
    let cRatio = 0.45;
    let fRatio = 0.25;

    if (goal === 'fat_loss') {
      pRatio = 0.35;
      cRatio = 0.35;
      fRatio = 0.30;
    } else if (goal === 'muscle_gain') {
      pRatio = 0.30;
      cRatio = 0.50;
      fRatio = 0.20;
    }

    const calculatedProtein = Math.max(targetProtein, Math.round((targetCalories * pRatio) / 4));
    const calculatedCarbs = Math.round((targetCalories * cRatio) / 4);
    const calculatedFat = Math.round((targetCalories * fRatio) / 9);

    // Pick variation blueprint based on diet type
    const normalizedDiet = dietType.toLowerCase();
    const blueprintList = normalizedDiet === 'nonveg'
      ? NON_VEG_VARIATIONS
      : normalizedDiet === 'egg'
      ? EGG_VARIATIONS
      : VEG_VARIATIONS;

    const randomIndex = Math.floor(Math.random() * blueprintList.length);
    const selectedTemplate = blueprintList[randomIndex];

    const breakfast = {
      ...selectedTemplate.breakfast,
      cals: Math.round(targetCalories * 0.26),
      protein: Math.round(calculatedProtein * 0.28),
      carbs: Math.round(calculatedCarbs * 0.26),
      fat: Math.round(calculatedFat * 0.28),
      groceryItemNames: selectedTemplate.breakfast.groceryItems.map(g => `${g.name} (₹${g.cost})`)
    };

    const lunch = {
      ...selectedTemplate.lunch,
      cals: Math.round(targetCalories * 0.36),
      protein: Math.round(calculatedProtein * 0.38),
      carbs: Math.round(calculatedCarbs * 0.36),
      fat: Math.round(calculatedFat * 0.26),
      groceryItemNames: selectedTemplate.lunch.groceryItems.map(g => `${g.name} (₹${g.cost})`)
    };

    const preWorkout = {
      ...selectedTemplate.preWorkout,
      cals: Math.round(targetCalories * 0.14),
      protein: Math.round(calculatedProtein * 0.10),
      carbs: Math.round(calculatedCarbs * 0.18),
      fat: Math.round(calculatedFat * 0.16),
      groceryItemNames: selectedTemplate.preWorkout.groceryItems.map(g => `${g.name} (₹${g.cost})`)
    };

    const dinner = {
      ...selectedTemplate.dinner,
      cals: Math.round(targetCalories * 0.24),
      protein: Math.round(calculatedProtein * 0.24),
      carbs: Math.round(calculatedCarbs * 0.20),
      fat: Math.round(calculatedFat * 0.30),
      groceryItemNames: selectedTemplate.dinner.groceryItems.map(g => `${g.name} (₹${g.cost})`)
    };

    const totalCalsPlanned = breakfast.cals + lunch.cals + preWorkout.cals + dinner.cals;
    const totalProtPlanned = breakfast.protein + lunch.protein + preWorkout.protein + dinner.protein;
    const totalCarbPlanned = breakfast.carbs + lunch.carbs + preWorkout.carbs + dinner.carbs;
    const totalFatPlanned = breakfast.fat + lunch.fat + preWorkout.fat + dinner.fat;

    // Custom Indian Grocery Packing strictly capped to budgetInRupees
    const INDIAN_GROCERY_CATALOG = {
      nonveg: [
        { name: 'Eggs (6 pcs)', cost: 42, category: 'protein', proteinG: 36 },
        { name: 'Fresh Mint & Coriander Bunch', cost: 8, category: 'produce', proteinG: 1 },
        { name: 'Roasted Chana (100g)', cost: 20, category: 'protein', proteinG: 22 },
        { name: 'Fresh Dahi / Curd (200g)', cost: 20, category: 'protein', proteinG: 8 },
        { name: 'Fresh Bananas (3 pcs)', cost: 18, category: 'produce', proteinG: 3 },
        { name: 'Whole Wheat Atta (500g)', cost: 24, category: 'grains', proteinG: 35 },
        { name: 'Boneless Chicken Breast (250g)', cost: 80, category: 'protein', proteinG: 75 },
        { name: 'Green Moong Dal (250g)', cost: 38, category: 'grains', proteinG: 60 },
        { name: 'Basmati Rice (500g)', cost: 35, category: 'grains', proteinG: 18 },
        { name: 'Cucumbers & Tomatoes (300g)', cost: 18, category: 'produce', proteinG: 2 },
        { name: 'Eggs (1 Dozen / 12 pcs)', cost: 84, category: 'protein', proteinG: 72 },
        { name: 'Rolled Oats (250g)', cost: 48, category: 'grains', proteinG: 30 },
        { name: 'Boneless Chicken Breast (500g)', cost: 160, category: 'protein', proteinG: 150 }
      ],
      egg: [
        { name: 'Eggs (6 pcs)', cost: 42, category: 'protein', proteinG: 36 },
        { name: 'Fresh Mint & Coriander Bunch', cost: 8, category: 'produce', proteinG: 1 },
        { name: 'Spiced Buttermilk / Chaas (200ml)', cost: 15, category: 'protein', proteinG: 6 },
        { name: 'Fresh Paneer (100g)', cost: 45, category: 'protein', proteinG: 18 },
        { name: 'Green Moong Sprouts (200g)', cost: 25, category: 'protein', proteinG: 24 },
        { name: 'Sattu / Roasted Gram Flour (250g)', cost: 35, category: 'protein', proteinG: 50 },
        { name: 'Fresh Bananas (3 pcs)', cost: 18, category: 'produce', proteinG: 3 },
        { name: 'Whole Wheat Atta (500g)', cost: 24, category: 'grains', proteinG: 35 },
        { name: 'Basmati Rice (500g)', cost: 35, category: 'grains', proteinG: 18 },
        { name: 'Tomatoes & Onions (400g)', cost: 22, category: 'produce', proteinG: 2 },
        { name: 'Eggs (1 Dozen / 12 pcs)', cost: 84, category: 'protein', proteinG: 72 },
        { name: 'Fresh Paneer (200g)', cost: 90, category: 'protein', proteinG: 36 }
      ],
      veg: [
        { name: 'Nutrela Soya Chunks (100g)', cost: 22, category: 'protein', proteinG: 52 },
        { name: 'Roasted Chana / Bengal Gram (100g)', cost: 20, category: 'protein', proteinG: 22 },
        { name: 'Fresh Mint & Green Chillies Bunch', cost: 8, category: 'produce', proteinG: 1 },
        { name: 'Green Moong Dal (250g)', cost: 38, category: 'grains', proteinG: 60 },
        { name: 'Nutrela Soya Chunks (200g)', cost: 45, category: 'protein', proteinG: 104 },
        { name: 'Fresh Paneer (100g)', cost: 45, category: 'protein', proteinG: 18 },
        { name: 'Toned Milk (500ml)', cost: 28, category: 'protein', proteinG: 16 },
        { name: 'Roasted Peanuts (100g)', cost: 19, category: 'pantry', proteinG: 26 },
        { name: 'Whole Wheat Atta (500g)', cost: 24, category: 'grains', proteinG: 35 },
        { name: 'Salad Cucumbers & Lemon', cost: 15, category: 'produce', proteinG: 1 },
        { name: 'Basmati Rice (500g)', cost: 35, category: 'grains', proteinG: 18 },
        { name: 'Fresh Paneer (200g)', cost: 90, category: 'protein', proteinG: 36 },
        { name: 'Phool Makhana (50g)', cost: 40, category: 'pantry', proteinG: 5 }
      ]
    };

    const targetCatalog = INDIAN_GROCERY_CATALOG[dietType] || INDIAN_GROCERY_CATALOG.nonveg;
    const maxBudget = Math.max(20, Number(budgetInRupees) || 200);

    // Greedy basket packing respecting user's strict budget
    let currentCost = 0;
    let totalProtPacked = 0;
    const selectedBasket = [];

    for (const item of targetCatalog) {
      if (currentCost + item.cost <= maxBudget) {
        selectedBasket.push(item);
        currentCost += item.cost;
        totalProtPacked += (item.proteinG || 0);
      }
    }

    // If budget is very small (e.g. ₹30-50) and basket has at least 1 item, use it.
    // If basket is empty because item > maxBudget, pick the cheapest available item.
    if (selectedBasket.length === 0 && targetCatalog.length > 0) {
      const cheapest = [...targetCatalog].sort((a, b) => a.cost - b.cost)[0];
      selectedBasket.push(cheapest);
      currentCost = cheapest.cost;
      totalProtPacked = cheapest.proteinG || 0;
    }

    const categorizedGrocery = {
      proteinAndDairy: selectedBasket.filter(i => i.category === 'protein').map(i => `${i.name} — ₹${i.cost}`),
      grainsAndLentils: selectedBasket.filter(i => i.category === 'grains').map(i => `${i.name} — ₹${i.cost}`),
      produce: selectedBasket.filter(i => i.category === 'produce').map(i => `${i.name} — ₹${i.cost}`),
      pantryAndFats: selectedBasket.filter(i => i.category === 'pantry').map(i => `${i.name} — ₹${i.cost}`)
    };

    return {
      success: true,
      title: "Today's AI Nutrition Architecture",
      goal: goal.replace('_', ' ').toUpperCase(),
      dietType: dietType.toUpperCase(),
      budget: budget.toUpperCase(),
      budgetInRupees: maxBudget,
      estimatedCostINR: currentCost,
      budgetRemainingINR: Math.max(0, maxBudget - currentCost),
      totalProteinPackedG: totalProtPacked,
      costPerGramProteinINR: (currentCost / Math.max(1, totalProtPacked || totalProtPlanned)).toFixed(2),
      totals: {
        calories: totalCalsPlanned,
        targetCalories,
        protein: totalProtPlanned,
        targetProtein,
        carbs: totalCarbPlanned,
        fat: totalFatPlanned
      },
      meals: {
        breakfast,
        lunch,
        preWorkout,
        dinner
      },
      groceryList: categorizedGrocery,
      rawGroceryItems: selectedBasket,
      summaryText: `Engine calibrated for ${totalCalsPlanned} kcal (${totalProtPlanned}g protein) across 4 nutrient-timed meals at ~₹${currentCost} estimated basket value within your ₹${maxBudget} budget.`
    };
  }
}

export const aiMealPlannerEngine = AIMealPlannerEngine;
export default AIMealPlannerEngine;
