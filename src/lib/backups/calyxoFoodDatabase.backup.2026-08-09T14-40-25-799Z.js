import calyxo10kFoods from './calyxo10kFoods.json';

// Hand-curated Indian & International staples
export const HAND_CURATED_FOODS = [
  {
    name: "Roti",
    category: "North Indian Bread",
    servingSize: "100g (approx. 3-4 small rotis)",
    pieceWeight: 35,
    calories: 264,
    protein: 8.5,
    carbs: 52.0,
    fat: 2.5,
    fiber: 6.5,
    sugar: 0.5,
    sodium: 5,
    calsPer100g: 264,
    protPer100g: 8.5,
    carbsPer100g: 52.0,
    fatPer100g: 2.5,
    aliases: ["roti", "phulka", "chapati", "chapathi", "rotli", "wheat flatbread", "fulka"]
  },
  {
    name: "Chapati",
    category: "North Indian Bread",
    servingSize: "100g (approx. 3 medium chapatis)",
    pieceWeight: 35,
    calories: 264,
    protein: 8.5,
    carbs: 52.0,
    fat: 2.5,
    fiber: 6.5,
    sugar: 0.5,
    sodium: 120,
    calsPer100g: 264,
    protPer100g: 8.5,
    carbsPer100g: 52.0,
    fatPer100g: 2.5,
    aliases: ["chapati", "chapathi", "roti", "flatbread", "chappati"]
  },
  {
    name: "Chicken Biryani",
    category: "Indian Rice & Main Course",
    servingSize: "250g (1 bowl)",
    pieceWeight: 250,
    calories: 350,
    protein: 23.25,
    carbs: 40.0,
    fat: 11.5,
    fiber: 2.0,
    sugar: 1.0,
    sodium: 520,
    calsPer100g: 140,
    protPer100g: 9.3,
    carbsPer100g: 16,
    fatPer100g: 4.6,
    aliases: ["chicken biryani", "biryani", "dum biryani", "hyderabadi biryani"]
  },
  {
    name: "Masala Dosa",
    category: "South Indian Breakfast",
    servingSize: "150g (1 large dosa)",
    pieceWeight: 150,
    calories: 312,
    protein: 6.15,
    carbs: 52.5,
    fat: 8.7,
    fiber: 3.5,
    sugar: 1.2,
    sodium: 480,
    calsPer100g: 208,
    protPer100g: 4.1,
    carbsPer100g: 35,
    fatPer100g: 5.8,
    aliases: ["masala dosa", "dosa", "dosai", "crepe"]
  },
  {
    name: "Paneer Butter Masala",
    category: "North Indian Curry",
    servingSize: "200g (1 bowl)",
    pieceWeight: 200,
    calories: 360,
    protein: 14.0,
    carbs: 12.0,
    fat: 28.0,
    fiber: 2.5,
    sugar: 4.0,
    sodium: 620,
    calsPer100g: 180,
    protPer100g: 7.0,
    carbsPer100g: 6.0,
    fatPer100g: 14.0,
    aliases: ["paneer butter masala", "paneer makhani", "shahi paneer", "paneer curry"]
  },
  {
    name: "Idli",
    category: "South Indian Breakfast",
    servingSize: "100g (2 pieces)",
    pieceWeight: 50,
    calories: 132,
    protein: 4.5,
    carbs: 26.5,
    fat: 0.6,
    fiber: 1.8,
    sugar: 0.2,
    sodium: 220,
    calsPer100g: 132,
    protPer100g: 4.5,
    carbsPer100g: 26.5,
    fatPer100g: 0.6,
    aliases: ["idli", "idly", "steamed rice cake"]
  },
  {
    name: "Dal Tadka",
    category: "Indian Curry & Lentils",
    servingSize: "200g (1 bowl)",
    pieceWeight: 200,
    calories: 220,
    protein: 12.0,
    carbs: 30.0,
    fat: 6.0,
    fiber: 8.0,
    sugar: 1.5,
    sodium: 490,
    calsPer100g: 110,
    protPer100g: 6.0,
    carbsPer100g: 15.0,
    fatPer100g: 3.0,
    aliases: ["dal tadka", "yellow dal", "toor dal", "arhar dal", "dal fry"]
  }
];

// Unified 10,000+ Food Database
export const ALL_CALYXO_FOODS = [
  ...HAND_CURATED_FOODS,
  ...calyxo10kFoods
];

// For backwards compatibility across all components
export const INDIAN_FOODS = ALL_CALYXO_FOODS;

/**
 * Fast search utility across all 10,000+ foods with score ranking
 * @param {string} query Search input string
 * @param {number} limit Maximum results (default: 25)
 */
export function searchCalyxoFoods(query, limit = 25) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];

  const tokens = q.split(/\s+/);
  const scored = [];

  for (let i = 0; i < ALL_CALYXO_FOODS.length; i++) {
    const item = ALL_CALYXO_FOODS[i];
    const nameLower = (item.displayName || item.name).toLowerCase();
    const regionLower = (item.region || '').toLowerCase();
    const categoryLower = (item.category || '').toLowerCase();

    let score = 0;

    if (nameLower === q) {
      score += 200;
    } else if (nameLower.startsWith(q)) {
      score += 120;
    } else if (nameLower.includes(q)) {
      score += 80;
    } else if (regionLower.includes(q) || categoryLower.includes(q)) {
      score += 40;
    }

    // Token matching for multi-word queries (e.g. "butter chicken fried")
    if (tokens.length > 1) {
      let allMatch = true;
      for (const token of tokens) {
        if (!nameLower.includes(token) && !categoryLower.includes(token) && (!item.aliases || !item.aliases.some(a => a.includes(token)))) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) score += 60;
    }

    if (score > 0) {
      scored.push({ item, score });
      if (scored.length > limit * 6) break; // Optimization cap
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.item);
}
