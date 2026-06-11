"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { addFoodLog, deleteFoodLog, getFoodLogs } from '../lib/dbService';
import { Search, Plus, Trash2, ShieldAlert, Sparkles, BookOpen, Edit3, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCAL_FOODS_DB = [
  { name: "Organic Oatmeal", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 1.0, sodium: 2, category: "carb" },
  { name: "Sous-Vide Chicken Breast", calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0, sugar: 0.0, sodium: 74, category: "protein" },
  { name: "Fresh Banana", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1, category: "carb" },
  { name: "Organic Large Egg", calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0.0, sugar: 1.1, sodium: 124, category: "protein" },
  { name: "Steamed White Rice", calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1, category: "carb" },
  { name: "Baked Sweet Potato", calories: 86, protein: 1.6, carbs: 20.0, fat: 0.1, fiber: 3.0, sugar: 4.2, sodium: 55, category: "carb" },
  { name: "Fresh Avocado", calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0, fiber: 6.7, sugar: 0.7, sodium: 7, category: "fat" },
  { name: "Atlantic Salmon Fillet", calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0, fiber: 0.0, sugar: 0.0, sodium: 59, category: "protein" },
  { name: "Steamed Broccoli", calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, category: "carb" },
  { name: "Greek Yogurt (0% Fat)", calories: 59, protein: 10.0, carbs: 3.6, fat: 0.4, fiber: 0.0, sugar: 3.2, sodium: 36, category: "protein" },
  { name: "Whole Wheat Roti", calories: 264, protein: 9.0, carbs: 54.0, fat: 1.5, fiber: 7.0, sugar: 0.4, sodium: 5, category: "carb" },
  { name: "Moong Dal Tadka", calories: 136, protein: 8.5, carbs: 20.5, fat: 2.2, fiber: 4.5, sugar: 0.2, sodium: 280, category: "protein" },
  { name: "Paneer Butter Masala", calories: 229, protein: 9.2, carbs: 8.5, fat: 18.0, fiber: 1.2, sugar: 4.0, sodium: 450, category: "fat" },
  { name: "Palak Paneer", calories: 142, protein: 8.0, carbs: 6.0, fat: 10.0, fiber: 2.5, sugar: 1.5, sodium: 380, category: "fat" },
  { name: "Chicken Biryani", calories: 163, protein: 11.5, carbs: 19.0, fat: 4.5, fiber: 1.5, sugar: 0.8, sodium: 410, category: "carb" },
  { name: "Steamed Idli (2 pieces)", calories: 112, protein: 3.2, carbs: 23.5, fat: 0.3, fiber: 1.6, sugar: 0.2, sodium: 180, category: "carb" },
  { name: "Roasted Chana (Bengal Gram)", calories: 364, protein: 18.6, carbs: 58.0, fat: 5.5, fiber: 16.8, sugar: 1.0, sodium: 24, category: "protein" },
  { name: "Salted Potato Chips", calories: 536, protein: 7.0, carbs: 53.0, fat: 35.0, fiber: 4.8, sugar: 0.5, sodium: 620, category: "junk" },
  { name: "Cheese Pizza Slice", calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0, fiber: 2.3, sugar: 3.6, sodium: 556, category: "junk" },
  { name: "Coca-Cola Soda", calories: 38, protein: 0.0, carbs: 10.0, fat: 0.0, fiber: 0.0, sugar: 10.0, sodium: 4, category: "junk" }
];

const INITIAL_WEEKLY_PLANNER = [
  {
    dayName: "Monday",
    diet: [
      { category: "Breakfast", name: "High-Protein Oats Kheer", desc: "Rolled oats with skimmed milk, protein isolate, and honey.", calories: 380, protein: 30, carbs: 45, fat: 8 },
      { category: "Lunch", name: "Tandoori Chicken Salad & Rice", desc: "Tandoori breast chunks with salad and 1 cup brown rice.", calories: 520, protein: 42, carbs: 55, fat: 12 },
      { category: "Dinner", name: "Paneer & Spinach Curry", desc: "Low-fat paneer cooked in spinach, with two wheat rotis.", calories: 450, protein: 25, carbs: 48, fat: 14 }
    ]
  },
  {
    dayName: "Tuesday",
    diet: [
      { category: "Breakfast", name: "Masala Oats & Egg Whites", desc: "Spicy oats with veggies and 4 scrambled whites.", calories: 340, protein: 28, carbs: 38, fat: 6 },
      { category: "Lunch", name: "Chicken Keema Matar", desc: "Lean minced chicken breast cooked with peas and 1 cup quinoa.", calories: 490, protein: 38, carbs: 45, fat: 11 },
      { category: "Dinner", name: "Soya Chunks Bhurji & Roti", desc: "Minced soya granules scramble, served with multigrain roti.", calories: 410, protein: 32, carbs: 50, fat: 9 }
    ]
  },
  {
    dayName: "Wednesday",
    diet: [
      { category: "Breakfast", name: "Oats & Paneer Cheela", desc: "Savoury pancakes made of ground oats, yogurt, and paneer.", calories: 390, protein: 24, carbs: 42, fat: 10 },
      { category: "Lunch", name: "Chicken Tikka Skewers & Moong Dal", desc: "Grill chicken breast tikka chunks with yellow dal.", calories: 480, protein: 45, carbs: 35, fat: 12 },
      { category: "Dinner", name: "Fish Curry & Brown Rice", desc: "Home-cooked mustard fish curry, served with brown rice.", calories: 430, protein: 34, carbs: 46, fat: 10 }
    ]
  },
  {
    dayName: "Thursday",
    diet: [
      { category: "Breakfast", name: "Oats Berry Shake", desc: "Oats, protein, strawberry, milk, blended.", calories: 420, protein: 35, carbs: 48, fat: 9 },
      { category: "Lunch", name: "Paneer Bhurji & Daal Palak", desc: "Scrambled paneer with lentils and a wheat roti.", calories: 460, protein: 28, carbs: 40, fat: 15 },
      { category: "Dinner", name: "Chicken Curry (Low Oil) & Roti", desc: "Light chicken breast curry, with two wheats roti.", calories: 510, protein: 40, carbs: 48, fat: 13 }
    ]
  },
  {
    dayName: "Friday",
    diet: [
      { category: "Breakfast", name: "Savory Masala Oats Upma", desc: "Oats upma with carrots, peas, and green chilies.", calories: 320, protein: 12, carbs: 44, fat: 8 },
      { category: "Lunch", name: "Egg Bhurji & Brown Rice", desc: "Indian-style scrambled eggs, with 1 cup brown rice.", calories: 430, protein: 22, carbs: 48, fat: 11 },
      { category: "Dinner", name: "Grilled Chicken & Veggies", desc: "Grill breast served with stir-fry broccoli and veggies.", calories: 460, protein: 42, carbs: 18, fat: 14 }
    ]
  },
  {
    dayName: "Saturday",
    diet: [
      { category: "Breakfast", name: "Oats Banana Protein Pancake", desc: "Pancake from oats flour, banana, egg whites, protein.", calories: 410, protein: 32, carbs: 54, fat: 7 },
      { category: "Lunch", name: "Soya Biryani & Raita", desc: "Protein rice cooked with soya granules, with mint raita.", calories: 480, protein: 30, carbs: 62, fat: 9 },
      { category: "Dinner", name: "Tandoori Platter Grill", desc: "Chicken tikka and paneer cubes grilled on skewers.", calories: 530, protein: 48, carbs: 12, fat: 18 }
    ]
  },
  {
    dayName: "Sunday",
    diet: [
      { category: "Breakfast", name: "Indian Oats Idli", desc: "Steamed idlis made from powdered oats, served with chutney.", calories: 290, protein: 14, carbs: 40, fat: 4 },
      { category: "Lunch", name: "Chicken Keema Paratha", desc: "Stuffed chicken paratha, tawa baked with minimal ghee.", calories: 450, protein: 34, carbs: 48, fat: 12 },
      { category: "Dinner", name: "Moong Daal Tadka & Sabji", desc: "Lentils tadka with cumin, dry sabji, and one wheat roti.", calories: 360, protein: 18, carbs: 48, fat: 8 }
    ]
  }
];

export default function FoodTracker({ onNotification }) {
  const { user, foodLogs, setFoodLogs, userProfile } = useStore();
  const userId = user?.uid;

  // Search autocomplete states
  const [queryVal, setQueryVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Selected state
  const [analysedFood, setAnalysedFood] = useState(null);
  const [portion, setPortion] = useState(100);
  const [showCustomFood, setShowCustomFood] = useState(false);

  // Custom Form fields
  const [cfName, setCfName] = useState('');
  const [cfCal, setCfCal] = useState('');
  const [cfProt, setCfProt] = useState('');
  const [cfCarb, setCfCarb] = useState('');
  const [cfFat, setCfFat] = useState('');
  const [cfFiber, setCfFiber] = useState('0');
  const [cfSugar, setCfSugar] = useState('0');
  const [cfSodium, setCfSodium] = useState('0');

  // Weekly Planner states
  const [activeDay, setActiveDay] = useState(0);
  const [weeklyPlanner, setWeeklyPlanner] = useState(INITIAL_WEEKLY_PLANNER);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [editMealFields, setEditMealFields] = useState({ name: '', desc: '', calories: '', protein: '', carbs: '', fat: '' });

  // Load User Logs once
  useEffect(() => {
    const fetchFoods = async () => {
      if (!userId) return;
      const data = await getFoodLogs(userId);
      setFoodLogs(data || []);
    };
    fetchFoods();
  }, [userId, setFoodLogs]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced query logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(queryVal);
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [queryVal]);

  const handleSearch = async (val) => {
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const locals = LOCAL_FOODS_DB.filter(x => x.name.toLowerCase().includes(val.toLowerCase()));
    let apiResults = [];

    try {
      const response = await fetch(`/api/food?q=${encodeURIComponent(val)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          apiResults = data.products
            .filter(p => p.product_name && p.nutriments && p.nutriments["energy-kcal_100g"])
            .map(p => ({
              name: p.product_name + (p.brands ? ` (${p.brands})` : ""),
              calories: Math.round(p.nutriments["energy-kcal_100g"]),
              protein: parseFloat(p.nutriments["proteins_100g"] || 0),
              carbs: parseFloat(p.nutriments["carbohydrates_100g"] || 0),
              fat: parseFloat(p.nutriments["fat_100g"] || 0),
              fiber: parseFloat(p.nutriments["fiber_100g"] || 0),
              sugar: parseFloat(p.nutriments["sugars_100g"] || 0),
              sodium: Math.round(parseFloat(p.nutriments["sodium_100g"] || 0) * 1000)
            }));
        }
      }
    } catch (err) {
      console.warn("OpenFoodFacts offline, falling back to local list", err);
    }

    setSearchResults([...locals, ...apiResults].slice(0, 8));
    setShowDropdown(true);
  };

  const selectFood = (food) => {
    setAnalysedFood(food);
    setPortion(100);
    setShowDropdown(false);
    setQueryVal('');
  };

  // Estimate user biometrics parameters for compatibility
  const userGoal = userProfile?.goal || 'lose';
  const units = userProfile?.units || 'metric';
  const weightVal = userProfile?.weight || 70;
  const heightVal = userProfile?.height || 175;
  const isImperial = units === 'imperial';
  const weightKg = isImperial ? weightVal / 2.20462 : weightVal;
  const heightCm = isImperial ? heightVal * 2.54 : heightVal;
  const heightMeters = heightCm / 100;
  const userBmi = heightMeters > 0 ? Number((weightKg / (heightMeters * heightMeters)).toFixed(1)) : 22.0;

  // Compatibility Score Calculator
  const calculateCompatibility = (food) => {
    if (!food) return { score: 100, rating: "Recommended", reason: "" };
    
    let score = 100;
    let reasons = [];

    if (food.calories > 350) {
      score -= 15;
      reasons.push("dense calories");
    }
    
    if (userGoal === "lose") {
      if (food.carbs > 35 && food.protein < 5) {
        score -= 20;
        reasons.push("high carbs with low protein");
      }
      if (food.fat > 12) {
        score -= 15;
        reasons.push("elevated fat counts");
      }
    } else if (userGoal === "gains") {
      if (food.protein >= 20) {
        score += 10;
      } else if (food.protein < 3) {
        score -= 15;
        reasons.push("low structural protein concentration");
      }
    }

    if (userBmi >= 28 && food.calories > 300) {
      score -= 15;
      reasons.push("high caloric weight");
    }

    if ((food.sugar || 0) > 15) {
      score -= 15;
      reasons.push("high sugar content");
    }
    if ((food.sodium || 0) > 500) {
      score -= 10;
      reasons.push("elevated sodium level");
    }
    if ((food.fiber || 0) > 4) {
      score += 10;
    }

    score = Math.max(0, Math.min(score, 100));
    
    let rating = "Highly Recommended";
    if (score < 55) {
      rating = "Caution: Avoid / Minimize";
    } else if (score >= 55 && score < 85) {
      rating = "Moderately Suitable";
    }

    let summaryText = `Calyxo calculated compatibility of ${score}%. `;
    if (reasons.length > 0) {
      summaryText += `Observe caution due to: ${reasons.join(", and ")}.`;
    } else {
      summaryText += `Matches your physical biometrics structure perfectly.`;
    }

    return { score, rating, reason: summaryText };
  };

  const logFoodItem = async () => {
    if (!analysedFood) return;

    const multiplier = portion / 100;
    const logItem = {
      name: analysedFood.name,
      calories: Math.round(analysedFood.calories * multiplier),
      protein: parseFloat((analysedFood.protein * multiplier).toFixed(1)),
      carbs: parseFloat((analysedFood.carbs * multiplier).toFixed(1)),
      fat: parseFloat((analysedFood.fat * multiplier).toFixed(1)),
      fiber: parseFloat(((analysedFood.fiber || 0) * multiplier).toFixed(1)),
      sugar: parseFloat(((analysedFood.sugar || 0) * multiplier).toFixed(1)),
      sodium: Math.round((analysedFood.sodium || 0) * multiplier),
      portionWeight: portion
    };

    const saved = await addFoodLog(userId, logItem);
    setFoodLogs([saved, ...foodLogs]);
    setAnalysedFood(null);
    if (onNotification) onNotification(`Logged: ${logItem.name} (+${logItem.calories} kcal)`);
  };

  const handleCustomFoodSubmit = async (e) => {
    e.preventDefault();
    const calories = Math.round(parseFloat(cfCal) || 0);
    const protein = parseFloat(parseFloat(cfProt || 0).toFixed(1));
    const carbs = parseFloat(parseFloat(cfCarb || 0).toFixed(1));
    const fat = parseFloat(parseFloat(cfFat || 0).toFixed(1));
    const fiber = parseFloat(parseFloat(cfFiber || 0).toFixed(1));
    const sugar = parseFloat(parseFloat(cfSugar || 0).toFixed(1));
    const sodium = Math.round(parseFloat(cfSodium || 0));

    const customLog = {
      name: cfName,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      portionWeight: 100
    };

    const saved = await addFoodLog(userId, customLog);
    setFoodLogs([saved, ...foodLogs]);
    setShowCustomFood(false);
    setCfName('');
    setCfCal('');
    setCfProt('');
    setCfCarb('');
    setCfFat('');
    setCfFiber('0');
    setCfSugar('0');
    setCfSodium('0');

    if (onNotification) onNotification(`Logged Custom Food: ${cfName}`);
  };

  const handleDeleteMeal = async (id) => {
    if (window.confirm("Remove log timeline entry?")) {
      await deleteFoodLog(userId, id);
      setFoodLogs(foodLogs.filter(x => x.id !== id && x.timestamp !== id));
      if (onNotification) onNotification("Timeline record deleted.");
    }
  };

  const handleLogSuggestedMeal = async (meal) => {
    const logItem = {
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber || 2.0,
      sugar: meal.sugar || 1.5,
      sodium: meal.sodium || 180,
      portionWeight: 100
    };

    const saved = await addFoodLog(userId, logItem);
    setFoodLogs([saved, ...foodLogs]);
    if (onNotification) onNotification(`Logged recommendation: ${meal.name}`);
  };

  const handleStartEditMeal = (idx, meal) => {
    setEditingMealIndex(idx);
    setEditMealFields({ ...meal });
  };

  const handleSaveMealEdit = (idx) => {
    const updatedPlanner = [...weeklyPlanner];
    updatedPlanner[activeDay].diet[idx] = {
      category: editMealFields.category,
      name: editMealFields.name,
      desc: editMealFields.desc,
      calories: Number(editMealFields.calories) || 0,
      protein: Number(editMealFields.protein) || 0,
      carbs: Number(editMealFields.carbs) || 0,
      fat: Number(editMealFields.fat) || 0
    };
    setWeeklyPlanner(updatedPlanner);
    setEditingMealIndex(null);
    if (onNotification) onNotification("Suggested planner item updated.");
  };

  const compat = calculateCompatibility(analysedFood);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-24">
      {/* Left Column: Search & Custom Logging */}
      <div className="space-y-6 w-full">
        {/* 1. Search Interface */}
        <section className="glass rounded-2xl p-6 relative">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-1">Food Diary</h2>
          <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Search foods, log meals, and see nutrition details</p>

          <div ref={dropdownRef} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-muted" />
              <input 
                type="text"
                value={queryVal}
                onChange={(e) => setQueryVal(e.target.value)}
                placeholder="Search foods — oats, chicken, roti..."
                className="w-full bg-[var(--input-bg)] border border-card-border focus:border-acid-green rounded-full pl-12 pr-5 py-3 text-sm text-foreground focus:outline-none shadow-inner"
              />
            </div>

            <AnimatePresence>
              {showDropdown && searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-[calc(100%+8px)] left-0 w-full glass rounded-xl border border-card-border z-30 max-h-60 overflow-y-auto shadow-2xl"
                >
                  {searchResults.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => selectFood(item)}
                      className="px-5 py-3.5 border-b border-card-border last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-acid-green/10 transition-colors"
                    >
                      <span className="text-xs font-semibold">{item.name}</span>
                      <span className="text-[10px] opacity-75 text-acid-green">{item.calories} kcal / 100g</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end mt-3">
            <button 
              onClick={() => setShowCustomFood(!showCustomFood)}
              className="text-[10px] text-acid-green hover:text-foreground cursor-pointer font-extrabold uppercase tracking-wider flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {showCustomFood ? "Cancel Custom Food" : "Create Custom Food"}
            </button>
          </div>
        </section>

        {/* 2. Custom Food Creator */}
        {showCustomFood && (
          <motion.section 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border-acid-green/30 border rounded-2xl p-6"
          >
            <h3 className="text-xs font-extrabold text-acid-green mb-4 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Create Custom Food Item
            </h3>
            <form onSubmit={handleCustomFoodSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Food Name</label>
                  <input 
                    type="text" 
                    value={cfName}
                    onChange={(e) => setCfName(e.target.value)}
                    placeholder="e.g. Grandma's Samosa"
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Calories (kcal/100g)</label>
                  <input 
                    type="number" 
                    value={cfCal}
                    onChange={(e) => setCfCal(e.target.value)}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Protein (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={cfProt}
                    onChange={(e) => setCfProt(e.target.value)}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Carbs (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={cfCarb}
                    onChange={(e) => setCfCarb(e.target.value)}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Fats (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={cfFat}
                    onChange={(e) => setCfFat(e.target.value)}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-card-border pt-3">
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Fiber (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={cfFiber}
                    onChange={(e) => setCfFiber(e.target.value)}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none shadow-inner"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Sugar (g)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={cfSugar}
                    onChange={(e) => setCfSugar(e.target.value)}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none shadow-inner"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Sodium (mg)</label>
                  <input 
                    type="number" 
                    value={cfSodium}
                    onChange={(e) => setCfSodium(e.target.value)}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCustomFood(false)}
                  className="text-xs font-semibold px-4 py-2 border border-card-border rounded-xl hover:bg-surface text-foreground cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-acid-green text-black font-bold text-xs py-2 px-4 rounded-xl hover:shadow-[0_0_12px_rgba(204,255,0,0.5)] cursor-pointer border-none"
                >
                  Save & Log Item
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {/* 3. Analysis Card */}
        {analysedFood && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border-acid-green/20 border rounded-2xl p-6 space-y-5"
          >
            <div className="flex flex-col items-center justify-center p-4 border-b border-card-border">
              <div className="w-24 h-24 rounded-full border-2 border-acid-green flex flex-col items-center justify-center shadow-[0_0_15px_rgba(181,242,61,0.2)]">
                <span className="text-2xl font-black text-foreground">{compat.score}%</span>
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider">Score</span>
              </div>
              <h3 className="text-md font-bold text-foreground mt-3 text-center">{analysedFood.name}</h3>
              <span className="text-[9px] font-bold text-acid-green px-2.5 py-0.5 rounded-full border border-acid-green/30 bg-acid-green/5 mt-2 uppercase tracking-wide">
                {compat.rating}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[9px] text-muted uppercase font-bold tracking-wider mb-2">Nutrition (per 100g)</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-muted">Calories</div><div className="font-bold text-foreground">{analysedFood.calories}</div></div>
                  <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-acid-green">Protein</div><div className="font-bold text-foreground">{analysedFood.protein}g</div></div>
                  <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-orange">Carbs</div><div className="font-bold text-foreground">{analysedFood.carbs}g</div></div>
                  <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-red-500">Fats</div><div className="font-bold text-foreground">{analysedFood.fat}g</div></div>
                </div>
              </div>

              <div>
                <h4 className="text-[9px] text-muted uppercase font-bold tracking-wider mb-2">Micronutrients (per 100g)</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-acid-green">Fiber</div><div className="font-bold text-foreground">{(analysedFood.fiber || 0).toFixed(1)}g</div></div>
                  <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-muted">Sugars</div><div className="font-bold text-foreground">{(analysedFood.sugar || 0).toFixed(1)}g</div></div>
                  <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-muted">Sodium</div><div className="font-bold text-foreground">{Math.round(analysedFood.sodium || 0)}mg</div></div>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-[9px] text-muted uppercase font-bold tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-acid-green" />
                  Calyxo Analysis
                </h4>
                <p className="text-foreground text-xs leading-relaxed font-medium">{compat.reason}</p>
              </div>

              <div className="flex gap-3 items-end pt-3">
                <div className="flex flex-col space-y-1 flex-1">
                  <label className="text-[10px] text-muted uppercase font-bold tracking-wider">Portion (g)</label>
                  <input 
                    type="number" 
                    value={portion} 
                    onChange={(e) => setPortion(Number(e.target.value))}
                    className="bg-[var(--input-bg)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                  />
                </div>
                <button 
                  onClick={logFoodItem}
                  className="bg-acid-green text-black font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer hover:shadow-[0_0_12px_rgba(181,242,61,0.4)] transition-all h-[36px] flex items-center justify-center border-none"
                >
                  Log Meal
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      {/* Right Column: Timeline & Weekly Planner */}
      <div className="space-y-6 w-full">
        {/* 4. Timeline Logs */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4">Logged Intake Timeline</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {foodLogs && foodLogs.length > 0 ? (
              foodLogs.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface/50 border border-card-border px-4 py-3 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{item.name} <span className="text-[9px] text-muted font-medium">({item.portionWeight}g)</span></span>
                    <span className="text-[9px] text-muted mt-0.5">P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g | Fiber: {item.fiber || 0}g</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-acid-green">+{item.calories} kcal</span>
                    <button 
                      onClick={() => handleDeleteMeal(item.id || item.timestamp)}
                      className="text-muted hover:text-red-500 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-muted py-8 font-medium">
                No food logs registered today. Start logging metrics above.
              </div>
            )}
          </div>
        </section>

        {/* 5. Weekly Diet Template Scheduler */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-acid-green" />
            Weekly Diet Planner
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
            {weeklyPlanner.map((day, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setActiveDay(idx);
                  setEditingMealIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                  activeDay === idx 
                    ? 'bg-acid-green text-black border-acid-green shadow-md shadow-acid-green/10' 
                    : 'bg-surface border-card-border text-muted hover:text-foreground'
                }`}
              >
                {day.dayName.substring(0, 3)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {weeklyPlanner[activeDay].diet.map((meal, idx) => (
              <div key={idx} className="border-b border-card-border last:border-b-0 pb-3 last:pb-0">
                {editingMealIndex === idx ? (
                  // Edit Form fields
                  <div className="space-y-3 p-3 bg-surface border border-card-border rounded-xl">
                    <input 
                      type="text" 
                      value={editMealFields.name}
                      onChange={(e) => setEditMealFields({ ...editMealFields, name: e.target.value })}
                      className="w-full bg-[var(--input-bg)] border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                    <input 
                      type="text" 
                      value={editMealFields.desc}
                      onChange={(e) => setEditMealFields({ ...editMealFields, desc: e.target.value })}
                      className="w-full bg-[var(--input-bg)] border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-muted font-bold">
                      <div>Calories<input type="number" value={editMealFields.calories} onChange={(e) => setEditMealFields({ ...editMealFields, calories: e.target.value })} className="w-full bg-[var(--input-bg)] text-center rounded py-0.5 mt-1 border border-card-border text-foreground focus:outline-none" /></div>
                      <div>Prot<input type="number" value={editMealFields.protein} onChange={(e) => setEditMealFields({ ...editMealFields, protein: e.target.value })} className="w-full bg-[var(--input-bg)] text-center rounded py-0.5 mt-1 border border-card-border text-foreground focus:outline-none" /></div>
                      <div>Carbs<input type="number" value={editMealFields.carbs} onChange={(e) => setEditMealFields({ ...editMealFields, carbs: e.target.value })} className="w-full bg-[var(--input-bg)] text-center rounded py-0.5 mt-1 border border-card-border text-foreground focus:outline-none" /></div>
                      <div>Fat<input type="number" value={editMealFields.fat} onChange={(e) => setEditMealFields({ ...editMealFields, fat: e.target.value })} className="w-full bg-[var(--input-bg)] text-center rounded py-0.5 mt-1 border border-card-border text-foreground focus:outline-none" /></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setEditingMealIndex(null)} className="text-[10px] text-muted py-1 px-3 bg-surface border border-card-border rounded-lg flex items-center gap-1 cursor-pointer"><X className="w-3 h-3" /> Cancel</button>
                      <button onClick={() => handleSaveMealEdit(idx)} className="text-[10px] text-black bg-acid-green py-1 px-3 rounded-lg font-bold flex items-center gap-1 cursor-pointer border-none"><Check className="w-3 h-3" /> Save</button>
                    </div>
                  </div>
                ) : (
                  // Display layout
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-acid-green font-bold uppercase">{meal.category}</span>
                        <h4 
                          onClick={() => handleStartEditMeal(idx, meal)}
                          className="text-xs font-bold text-foreground border-b border-dashed border-muted cursor-pointer hover:text-acid-green flex items-center gap-1"
                        >
                          {meal.name}
                          <Edit3 className="w-3 h-3 opacity-50" />
                        </h4>
                      </div>
                      <p className="text-[10.5px] text-muted mt-1 leading-relaxed">{meal.desc}</p>
                      <span className="text-[9px] text-muted font-bold mt-1.5 block">
                        {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleLogSuggestedMeal(meal)}
                      className="w-7 h-7 rounded-full bg-acid-green/10 border border-acid-green/20 hover:bg-acid-green hover:text-black flex items-center justify-center cursor-pointer transition-colors text-acid-green font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
