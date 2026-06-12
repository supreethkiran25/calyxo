"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { getFoodLogs, addFoodLog, deleteFoodLog, saveEcosystemState, fetchWithRetry } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { Plus, Search, BookOpen, Trash2, Camera, Sparkles, Check, X, ShieldAlert, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock DB suited recipes fallback
const FOODS_CATALOG = [
  { name: "Scrambled Eggs (2 large)", calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, sugar: 0, sodium: 180 },
  { name: "Oatmeal (cooked, 1 cup)", calories: 150, protein: 6, carbs: 27, fat: 3, fiber: 4, sugar: 1, sodium: 2 },
  { name: "Grilled Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  { name: "Brown Rice (cooked, 1 cup)", calories: 215, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0.5, sodium: 5 },
  { name: "Greek Yogurt (non-fat, 1 cup)", calories: 130, protein: 24, carbs: 9, fat: 0, fiber: 0, sugar: 9, sodium: 85 },
  { name: "Whey Protein Shake (1 scoop)", calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, sugar: 1, sodium: 50 },
  { name: "Whole Wheat Roti (1 piece)", calories: 85, protein: 3, carbs: 18, fat: 0.5, fiber: 2, sugar: 0, sodium: 1 },
  { name: "Paneer Tikka (100g)", calories: 280, protein: 18, carbs: 4, fat: 22, fiber: 0.5, sugar: 1, sodium: 450 },
  { name: "Mixed Green Salad (no dressing)", calories: 15, protein: 1, carbs: 3, fat: 0.2, fiber: 1.2, sugar: 1.5, sodium: 10 },
  { name: "Almonds (1 oz / 28g)", calories: 160, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1, sodium: 0 }
];

const INITIAL_DIET_PLANNER = [
  {
    dayName: "Monday",
    diet: [
      { category: "Breakfast", name: "Banana Protein Oats", desc: "Oats with whey protein, chia seeds, and half sliced banana", calories: 380, protein: 32, carbs: 48, fat: 6 },
      { category: "Lunch", name: "Chicken Quinoa Bowl", desc: "Grilled chicken, white quinoa, and steamed broccoli drizzled with olive oil", calories: 450, protein: 42, carbs: 36, fat: 14 },
      { category: "Dinner", name: "Baked Salmon & Greens", desc: "Salmon fillet with asparagus, spinach salad, and sweet potato", calories: 420, protein: 36, carbs: 28, fat: 18 }
    ]
  },
  {
    dayName: "Tuesday",
    diet: [
      { category: "Breakfast", name: "Egg White Veggie Omelet", desc: "Omelet made with egg whites, spinach, bell peppers, toast", calories: 290, protein: 24, carbs: 24, fat: 8 },
      { category: "Lunch", name: "Paneer Wrap", desc: "Low-fat paneer sautéed with peppers, rolled in a whole wheat wrap", calories: 410, protein: 20, carbs: 42, fat: 16 },
      { category: "Dinner", name: "Lean Turkey Stir-fry", desc: "Ground turkey cooked with green beans, mushrooms, and brown rice", calories: 460, protein: 38, carbs: 45, fat: 10 }
    ]
  },
  {
    dayName: "Wednesday",
    diet: [
      { category: "Breakfast", name: "Greek Yogurt Parfait", desc: "Plain non-fat yogurt topped with mixed berries, honey, almonds", calories: 280, protein: 26, carbs: 30, fat: 6 },
      { category: "Lunch", name: "Tuna Salad Salad", desc: "Canned tuna over mixed greens, cucumbers, tomatoes, lemon dressing", calories: 350, protein: 34, carbs: 12, fat: 16 },
      { category: "Dinner", name: "Lentil Soup & Tofu", desc: "Lentils stewed with carrots, served with baked tofu blocks", calories: 390, protein: 28, carbs: 48, fat: 8 }
    ]
  },
  {
    dayName: "Thursday",
    diet: [
      { category: "Breakfast", name: "Peanut Butter Toast", desc: "Ezekiel toast spread with organic peanut butter and hemp seeds", calories: 310, protein: 12, carbs: 28, fat: 16 },
      { category: "Lunch", name: "Chicken Salad Wrap", desc: "Shredded chicken breast mixed with light greek yogurt dressing in wrap", calories: 400, protein: 38, carbs: 32, fat: 12 },
      { category: "Dinner", name: "White Fish & Rice", desc: "Cod fish fillet baked with lemon pepper, served with jasmine rice and zucchini", calories: 360, protein: 32, carbs: 38, fat: 6 }
    ]
  },
  {
    dayName: "Friday",
    diet: [
      { category: "Breakfast", name: "Fruit & Protein Smoothie", desc: "Whey protein blended with spinach, frozen berries, almond milk", calories: 260, protein: 28, carbs: 22, fat: 4 },
      { category: "Lunch", name: "Hummus Veggie Plate", desc: "Hummus served with carrot sticks, cucumbers, falafel, whole wheat pita", calories: 430, protein: 16, carbs: 54, fat: 18 },
      { category: "Dinner", name: "Sirloin Steak & Potatoes", desc: "Lean sirloin steak with garlic mashed potatoes and sautéed mushrooms", calories: 510, protein: 44, carbs: 38, fat: 18 }
    ]
  },
  {
    dayName: "Saturday",
    diet: [
      { category: "Breakfast", name: "Protein Pancakes", desc: "Oat-based protein batter pancakes topped with fresh strawberries", calories: 340, protein: 25, carbs: 42, fat: 8 },
      { category: "Lunch", name: "Sautéed Shrimp Salad", desc: "Garlic shrimp tossed with romaine lettuce, avocados, tomatoes", calories: 380, protein: 32, carbs: 18, fat: 20 },
      { category: "Dinner", name: "Baked Chicken Meatballs", desc: "Chicken meatballs served over zucchini noodles and marinara sauce", calories: 350, protein: 36, carbs: 16, fat: 15 }
    ]
  },
  {
    dayName: "Sunday",
    diet: [
      { category: "Breakfast", name: "Avocado Egg Toast", desc: "Toast topped with mashed avocado, chili flakes, and two poached eggs", calories: 390, protein: 18, carbs: 26, fat: 22 },
      { category: "Lunch", name: "Vegetable Fried Rice", desc: "Fried brown rice with carrots, peas, egg, and firm tofu blocks", calories: 420, protein: 18, carbs: 56, fat: 12 },
      { category: "Dinner", name: "Diet Beef Burger", desc: "Lean beef patty on whole wheat bun with lettuce, tomatoes, low-fat cheese", calories: 480, protein: 38, carbs: 36, fat: 16 }
    ]
  }
];

export default function FoodTracker({ onNotification }) {
  const user = useStore(state => state.user);
  const foodLogs = useStore(state => state.foodLogs);
  const setFoodLogs = useStore(state => state.setFoodLogs);
  const userProfile = useStore(state => state.userProfile);
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  const [activeSubTab, setActiveSubTab] = useState('diary');

  // Search & custom logging
  const [queryVal, setQueryVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Custom Food Form
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [cfName, setCfName] = useState('');
  const [cfCals, setCfCals] = useState('');
  const [cfProt, setCfProt] = useState('');
  const [cfCarb, setCfCarb] = useState('');
  const [cfFat, setCfFat] = useState('');
  const [cfFiber, setCfFiber] = useState('');
  const [cfSugar, setCfSugar] = useState('');
  const [cfSodium, setCfSodium] = useState('');

  // Log portion state
  const [analysedFood, setAnalysedFood] = useState(null);
  const [portion, setPortion] = useState(100);

  // Meal Photo Scanner
  const [mealPhoto, setMealPhoto] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // Weekly planner
  const [activeDay, setActiveDay] = useState(0);
  const [weeklyPlanner, setWeeklyPlanner] = useState(INITIAL_DIET_PLANNER);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [editMealFields, setEditMealFields] = useState({ category: '', name: '', desc: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

  // AI Planner subtab day
  const [activePlanDay, setActivePlanDay] = useState(0);

  // Grocery Compiler State
  const [generatingGrocery, setGeneratingGrocery] = useState(false);
  const [groceryList, setGroceryList] = useState(null);

  // Load food logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!userId) return;
      const logs = await getFoodLogs(userId);
      setFoodLogs(logs || []);
    };
    fetchLogs();
  }, [userId, setFoodLogs]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search catalog
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(queryVal);
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [queryVal]);

  const handleSearch = async (val) => {
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    // Search local catalog first
    const locals = FOODS_CATALOG.filter(x => x.name.toLowerCase().includes(val.toLowerCase()));
    
    // Attempt search wger / openfoodfacts fallback proxy
    let apiResults = [];
    try {
      const response = await fetch(`/api/food?q=${encodeURIComponent(val)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          apiResults = data.results.map(r => ({
            name: r.product_name || r.name,
            calories: Math.round(r.calories || r.nutriments?.["energy-kcal_100g"] || 0),
            protein: r.protein || r.nutriments?.proteins_100g || 0,
            carbs: r.carbs || r.nutriments?.carbohydrates_100g || 0,
            fat: r.fat || r.nutriments?.fat_100g || 0,
            fiber: r.fiber || r.nutriments?.fiber_100g || 0,
            sugar: r.sugar || r.nutriments?.sugars_100g || 0,
            sodium: Math.round(r.sodium || (r.nutriments?.sodium_100g * 1000) || 0)
          }));
        }
      }
    } catch (err) {
      console.warn("OpenFoodFacts search failure, defaulting to local index", err);
    }
    
    setSearchResults([...locals, ...apiResults].slice(0, 8));
    setShowDropdown(true);
  };

  const selectFood = (food) => {
    setAnalysedFood(food);
    setPortion(100);
    setQueryVal('');
    setShowDropdown(false);
  };

  const logFoodItem = async () => {
    if (!analysedFood) return;
    const ratio = portion / 100;
    const logItem = {
      name: analysedFood.name,
      calories: Math.round(analysedFood.calories * ratio),
      protein: Number((analysedFood.protein * ratio).toFixed(1)),
      carbs: Number((analysedFood.carbs * ratio).toFixed(1)),
      fat: Number((analysedFood.fat * ratio).toFixed(1)),
      fiber: Number(((analysedFood.fiber || 0) * ratio).toFixed(1)),
      sugar: Number(((analysedFood.sugar || 0) * ratio).toFixed(1)),
      portionWeight: portion
    };

    const saved = await addFoodLog(userId, logItem);
    setFoodLogs([saved, ...foodLogs]);
    setAnalysedFood(null);
    if (onNotification) onNotification(`Logged ${logItem.name} to diary 🍽️`);
  };

  const handleCustomFoodSubmit = async (e) => {
    e.preventDefault();
    const logItem = {
      name: cfName,
      calories: Number(cfCals),
      protein: Number(cfProt),
      carbs: Number(cfCarb),
      fat: Number(cfFat),
      fiber: cfFiber ? Number(cfFiber) : 0,
      sugar: cfSugar ? Number(cfSugar) : 0,
      portionWeight: 100
    };

    const saved = await addFoodLog(userId, logItem);
    setFoodLogs([saved, ...foodLogs]);
    
    // Clear forms
    setCfName('');
    setCfCals('');
    setCfProt('');
    setCfCarb('');
    setCfFat('');
    setCfFiber('');
    setCfSugar('');
    setCfSodium('');
    setShowCustomFood(false);
    
    if (onNotification) onNotification(`Logged custom item: ${logItem.name}`);
  };

  const handleDeleteMeal = async (logId) => {
    await deleteFoodLog(userId, logId);
    setFoodLogs(foodLogs.filter(x => x.id !== logId && x.timestamp !== logId));
    if (onNotification) onNotification("Diary meal deleted.");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setMealPhoto(reader.result);
      setScanResult(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScanMeal = async () => {
    if (!mealPhoto) return;
    setScanning(true);
    setScanError(null);
    try {
      const response = await fetchWithRetry('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: mealPhoto, userGoal: userProfile?.goal })
      });
      if (response.ok) {
        const data = await response.json();
        setScanResult(data.scan || data);
      } else {
        throw new Error(`Server returned code ${response.status}`);
      }
    } catch (e) {
      console.error("Meal scan error", e);
      setScanError("Vision detection failed due to network or rate limits. Please try again or log manually.");
      if (onNotification) onNotification("API network failure. Please verify endpoints.");
    } finally {
      setScanning(false);
    }
  };

  const handleLogScanResult = async () => {
    if (!scanResult) return;
    const logItem = {
      name: scanResult.foodName,
      calories: scanResult.calories,
      protein: scanResult.protein,
      carbs: scanResult.carbs,
      fat: scanResult.fat,
      fiber: scanResult.fiber || 0,
      portionWeight: 100
    };
    const saved = await addFoodLog(userId, logItem);
    setFoodLogs([saved, ...foodLogs]);
    setMealPhoto(null);
    setScanResult(null);
    if (onNotification) onNotification(`Scanned meal logged: ${logItem.name}! 📸`);
  };

  const handleLogSuggestedMeal = async (meal) => {
    const logItem = {
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      portionWeight: 100
    };
    const saved = await addFoodLog(userId, logItem);
    setFoodLogs([saved, ...foodLogs]);
    if (onNotification) onNotification(`Logged suggestion: ${meal.name}`);
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

  const handleGenerateGrocery = async () => {
    if (!ecoStore.coachingPlan) return;
    setGeneratingGrocery(true);
    try {
      const res = await fetchWithRetry('/api/gemini/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program: ecoStore.coachingPlan })
      });
      if (res.ok) {
        const data = await res.json();
        setGroceryList(data.grocery);
        if (onNotification) onNotification("Smart Grocery checklist compiled! 🛒");
      }
    } catch (e) {
      console.error("Grocery compile error", e);
    } finally {
      setGeneratingGrocery(false);
    }
  };

  const calculateCompatibility = (food) => {
    if (!food || !userProfile) return { rating: "Suitable", score: 90, reason: "Matches standard metabolic thresholds." };
    let score = 95;
    const reasons = [];
    
    if (userProfile.dietPreferences?.includes("Vegetarian")) {
      const lowercaseName = food.name.toLowerCase();
      if (lowercaseName.includes("chicken") || lowercaseName.includes("beef") || lowercaseName.includes("salmon") || lowercaseName.includes("fish") || lowercaseName.includes("meat")) {
        score -= 50;
        reasons.push("Contains animal flesh violating Vegetarian preferences");
      }
    }
    if (userProfile.dietPreferences?.includes("Vegan")) {
      const lowercaseName = food.name.toLowerCase();
      if (lowercaseName.includes("egg") || lowercaseName.includes("milk") || lowercaseName.includes("yogurt") || lowercaseName.includes("paneer") || lowercaseName.includes("dairy")) {
        score -= 40;
        reasons.push("Contains dairy/egg metrics violating Vegan bounds");
      }
    }
    if (userProfile.dietPreferences?.includes("Keto")) {
      if (food.carbs > 15) {
        score -= 30;
        reasons.push("High carbohydrate densities violate ketogenic boundaries");
      }
    }

    let rating = "Highly Suitable";
    if (score < 50) rating = "Not Suitable";
    else if (score < 80) rating = "Moderately Suitable";

    return {
      rating,
      score,
      reason: reasons.length > 0 ? reasons.join(" · ") : "Completely matches fitness somatotype, allergies, and selected kitchen bounds."
    };
  };

  const compat = calculateCompatibility(analysedFood);
  const inputStyle = "w-full bg-[var(--input)] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner";

  return (
    <div className="space-y-6">
      
      {/* Sub navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-card-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black text-foreground uppercase tracking-wider">Nutrition Center</h1>
          <p className="text-xs text-muted font-medium mt-0.5">Track diets, logs, scanning and grocery compilation lists</p>
        </div>

        <div className="bg-surface border border-card-border p-1 rounded-xl flex gap-0.5 overflow-x-auto w-full sm:w-auto sm:max-w-[65%] shrink-0 scrollbar-none">
          {[
            { id: 'diary', label: 'Food Diary' },
            { id: 'planner', label: 'Meal Planner' },
            { id: 'scanner', label: 'Meal Scanner' },
            { id: 'grocery', label: 'Grocery List' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none text-center ${
                activeSubTab === tab.id
                  ? 'bg-acid-green text-accent-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          
          {/* FOOD DIARY SUB-TAB */}
          {activeSubTab === 'diary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Log meal search column */}
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6 relative">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Search Foods & Log</h2>
                  <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Select items to instantly track calorie macros</p>

                  <div ref={dropdownRef} className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 w-4 h-4 text-muted" />
                      <input 
                        type="text"
                        value={queryVal}
                        onChange={(e) => setQueryVal(e.target.value)}
                        placeholder="Search oats, chicken breast, paneer..."
                        className="w-full bg-[var(--input-bg)] border border-card-border focus:border-acid-green rounded-full pl-12 pr-5 py-3 text-xs text-foreground focus:outline-none shadow-inner"
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
                              <span className="text-[10px] opacity-75 text-acid-green font-bold">{item.calories} kcal / 100g</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-end mt-3">
                    <button 
                      onClick={() => setShowCustomFood(!showCustomFood)}
                      className="text-[10px] text-acid-green hover:text-foreground cursor-pointer font-extrabold uppercase tracking-wider flex items-center gap-1 bg-none border-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {showCustomFood ? "Cancel Custom Food" : "Create Custom Food"}
                    </button>
                  </div>
                </section>

                {/* Custom Food Form */}
                {showCustomFood && (
                  <motion.section 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass border-card-border border rounded-2xl p-6 space-y-4"
                  >
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Custom Food Creator</h3>
                    <form onSubmit={handleCustomFoodSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Food Title</label>
                          <input type="text" value={cfName} onChange={(e) => setCfName(e.target.value)} placeholder="e.g. Grandma's Meatloaf" className={inputClass} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Calories (kcal/100g)</label>
                          <input type="number" value={cfCals} onChange={(e) => setCfCals(e.target.value)} placeholder="e.g. 240" className={inputClass} required />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Protein (g)</label>
                          <input type="number" step="0.1" value={cfProt} onChange={(e) => setCfProt(e.target.value)} className={inputClass} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Carbs (g)</label>
                          <input type="number" step="0.1" value={cfCarb} onChange={(e) => setCfCarb(e.target.value)} className={inputClass} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Fats (g)</label>
                          <input type="number" step="0.1" value={cfFat} onChange={(e) => setCfFat(e.target.value)} className={inputClass} required />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="submit" className="bg-acid-green text-accent-foreground font-bold text-xs py-2 px-4 rounded-xl cursor-pointer border-none shadow-sm">Save & Log Item</button>
                      </div>
                    </form>
                  </motion.section>
                )}

                {/* Selected Food details & portions log */}
                {analysedFood && (
                  <motion.section 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass border-acid-green/20 border rounded-2xl p-6 space-y-5"
                  >
                    <div className="flex flex-col items-center justify-center p-4 border-b border-card-border">
                      <div className="w-20 h-20 rounded-full border-2 border-acid-green flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xl font-black text-foreground">{compat.score}%</span>
                        <span className="text-[8px] text-muted font-bold uppercase tracking-wider">Score</span>
                      </div>
                      <h3 className="text-xs font-bold text-foreground mt-3 text-center">{analysedFood.name}</h3>
                      <span className="text-[9px] font-bold text-acid-green px-2.5 py-0.5 rounded-full border border-acid-green/30 bg-acid-green/5 mt-2 uppercase tracking-wide">
                        {compat.rating}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] text-muted uppercase font-bold tracking-wider mb-2 block">Nutrition (per 100g)</span>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-muted">Calories</div><div className="font-bold text-foreground">{analysedFood.calories}</div></div>
                          <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-acid-green">Protein</div><div className="font-bold text-foreground">{analysedFood.protein}g</div></div>
                          <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-orange">Carbs</div><div className="font-bold text-foreground">{analysedFood.carbs}g</div></div>
                          <div className="bg-surface border border-card-border py-2 rounded-lg"><div className="text-[8px] text-red">Fats</div><div className="font-bold text-foreground">{analysedFood.fat}g</div></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-muted uppercase font-bold tracking-wider flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-acid-green" />
                          Calyxo Suitability Analysis
                        </span>
                        <p className="text-foreground text-xs leading-relaxed font-medium">{compat.reason}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-3">
                        <div className="flex flex-col space-y-1 flex-1">
                          <label className="text-[9px] text-muted uppercase font-bold tracking-wider">Portion (g)</label>
                          <input type="number" value={portion} onChange={(e) => setPortion(Number(e.target.value))} className={inputClass} />
                        </div>
                        <button onClick={logFoodItem} className="bg-acid-green text-accent-foreground font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer h-10 sm:h-[36px] flex items-center justify-center border-none shadow-sm">Log Meal</button>
                      </div>
                    </div>
                  </motion.section>
                )}
              </div>

              {/* Right Column: Logged Intake Timeline list */}
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Logged Intake Timeline</h2>
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {foodLogs && foodLogs.length > 0 ? (
                      foodLogs.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-surface/50 border border-card-border px-4 py-3 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{item.name} <span className="text-[9px] text-muted font-medium">({item.portionWeight}g)</span></span>
                            <span className="text-[9px] text-muted mt-0.5">P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-acid-green">+{item.calories} kcal</span>
                            <button onClick={() => handleDeleteMeal(item.id || item.timestamp)} className="text-muted hover:text-destructive cursor-pointer p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-muted py-12 font-medium">
                        No food logs registered today. Start logging items on the left!
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* MEAL PLANNER SUB-TAB */}
          {activeSubTab === 'planner' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Daily Meal Scheduler */}
              <section className="glass rounded-2xl p-6">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Weekly Diet Planner Templates</h2>
                
                <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
                  {weeklyPlanner.map((day, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setActiveDay(idx);
                        setEditingMealIndex(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                        activeDay === idx 
                          ? 'bg-acid-green text-accent-foreground border-acid-green' 
                          : 'bg-surface border-card-border text-muted hover:text-foreground'
                      }`}
                    >
                      {day.dayName.substring(0, 3)}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {weeklyPlanner[activeDay].diet.map((meal, idx) => (
                    <div key={idx} className="border-b border-card-border last:border-b-0 pb-3.5 last:pb-0">
                      {editingMealIndex === idx ? (
                        <div className="space-y-3 p-3 bg-surface border border-card-border rounded-xl">
                          <input type="text" value={editMealFields.name} onChange={(e) => setEditMealFields({ ...editMealFields, name: e.target.value })} className={inputClass} />
                          <input type="text" value={editMealFields.desc} onChange={(e) => setEditMealFields({ ...editMealFields, desc: e.target.value })} className={inputClass} />
                          
                          <div className="grid grid-cols-4 gap-2 text-center text-[9px] text-muted font-bold">
                            <div>Kcal<input type="number" value={editMealFields.calories} onChange={(e) => setEditMealFields({ ...editMealFields, calories: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>P(g)<input type="number" value={editMealFields.protein} onChange={(e) => setEditMealFields({ ...editMealFields, protein: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>C(g)<input type="number" value={editMealFields.carbs} onChange={(e) => setEditMealFields({ ...editMealFields, carbs: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>F(g)<input type="number" value={editMealFields.fat} onChange={(e) => setEditMealFields({ ...editMealFields, fat: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button onClick={() => setEditingMealIndex(null)} className="text-[10px] text-muted py-1 px-3 bg-surface border border-card-border rounded-lg flex items-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" /> Cancel</button>
                            <button onClick={() => handleSaveMealEdit(idx)} className="text-[10px] text-accent-foreground bg-acid-green py-1 px-3 rounded-lg font-bold flex items-center gap-1 cursor-pointer border-none"><Check className="w-3.5 h-3.5" /> Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-acid-green font-bold uppercase">{meal.category}</span>
                              <h4 onClick={() => handleStartEditMeal(idx, meal)} className="text-xs font-bold text-foreground border-b border-dashed border-muted cursor-pointer hover:text-acid-green flex items-center gap-1">
                                {meal.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-muted mt-1 leading-relaxed">{meal.desc}</p>
                            <span className="text-[9px] text-muted font-bold mt-1 block">
                              {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                            </span>
                          </div>
                          
                          <button onClick={() => handleLogSuggestedMeal(meal)} className="w-7 h-7 rounded-full bg-acid-green/10 border border-acid-green/20 hover:bg-acid-green hover:text-accent-foreground flex items-center justify-center cursor-pointer transition-colors text-acid-green font-bold text-xs">
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Generated Coaching meal planner */}
              <section className="glass rounded-2xl p-6 border border-acid-green/20">
                {ecoStore.coachingPlan ? (
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-acid-green" />
                      AI Weekly Suggested planner
                    </h2>
                    
                    <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
                      {ecoStore.coachingPlan.mealPlan?.map((day, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActivePlanDay(idx)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                            activePlanDay === idx 
                              ? 'bg-acid-green text-accent-foreground border-acid-green' 
                              : 'bg-surface border-card-border text-muted hover:text-foreground'
                          }`}
                        >
                          {day.dayName.substring(0, 3)}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {ecoStore.coachingPlan.mealPlan?.[activePlanDay]?.meals?.map((meal, idx) => (
                        <div key={idx} className="border-b border-card-border last:border-b-0 pb-3 last:pb-0 flex justify-between items-start">
                          <div className="flex-grow pr-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-acid-green font-bold uppercase">{meal.category}</span>
                              <h4 className="text-xs font-bold text-foreground">{meal.name}</h4>
                            </div>
                            <span className="text-[9px] text-muted font-bold mt-1 block">
                              {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                            </span>
                          </div>
                          
                          <button onClick={() => handleLogSuggestedMeal(meal)} className="w-7 h-7 rounded-full bg-acid-green/10 border border-acid-green/20 hover:bg-acid-green hover:text-accent-foreground flex items-center justify-center cursor-pointer transition-colors text-acid-green font-bold text-xs" title="Log to Diary">
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-surface/25 border border-dashed border-card-border rounded-2xl">
                    <Sparkles className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted font-bold uppercase tracking-wider">No active program setup</p>
                    <p className="text-[10px] text-muted font-medium mt-1">Configure targets in the AI Coach first to output customized recommendations.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* MEAL SCANNER SUB-TAB */}
          {activeSubTab === 'scanner' && (
            <div className="max-w-xl mx-auto">
              <section className="glass rounded-2xl p-6 relative space-y-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-acid-green" />
                  AI Meal Photo Scanner
                </h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-wider leading-relaxed">Upload or snap a photo of your food. Calyxo AI scans metrics, estimates calorie/weight proportions, and registers macronutrient data automatically.</p>

                <div className="border border-dashed border-card-border rounded-xl p-6 flex flex-col items-center justify-center bg-surface/50 h-56 relative overflow-hidden">
                  {mealPhoto ? (
                    <>
                      <img src={mealPhoto} className="object-cover w-full h-full" />
                      <button onClick={() => { setMealPhoto(null); setScanResult(null); setScanError(null); }} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 text-[8px] font-bold uppercase tracking-wider cursor-pointer">Clear</button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <Camera className="w-8 h-8 text-muted mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-foreground">Select Photo or Take Picture</span>
                      <span className="text-[10px] text-muted mt-1 uppercase font-bold">Supports JPG, PNG, WEBP</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {scanError && !scanResult && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-4 rounded-xl flex flex-col gap-2">
                    <p className="font-medium">{scanError}</p>
                    <button
                      onClick={handleScanMeal}
                      className="self-start text-[10px] uppercase font-bold tracking-wider underline cursor-pointer hover:text-foreground text-destructive"
                    >
                      Retry Scan
                    </button>
                  </div>
                )}

                {mealPhoto && !scanResult && (
                  <button
                    onClick={handleScanMeal}
                    disabled={scanning}
                    className="w-full bg-acid-green text-accent-foreground font-bold text-xs py-3 rounded-xl hover:shadow-md transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
                  >
                    {scanning ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                        Scanning image...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Scan Meal Photo
                      </>
                    )}
                  </button>
                )}

                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-acid-green/20 rounded-xl p-4 space-y-3 shadow-inner"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider">Vision AI Detection</span>
                        <h4 className="text-xs font-bold text-foreground mt-0.5">{scanResult.foodName}</h4>
                      </div>
                      <span className="text-xs font-bold text-acid-green">{scanResult.calories} kcal</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-[var(--card)] border border-card-border py-1.5 rounded-lg">
                        <div className="text-[8px] text-acid-green font-bold uppercase">Protein</div>
                        <div className="font-bold text-foreground mt-0.5">{scanResult.protein}g</div>
                      </div>
                      <div className="bg-[var(--card)] border border-card-border py-1.5 rounded-lg">
                        <div className="text-[8px] text-orange font-bold uppercase">Carbs</div>
                        <div className="font-bold text-foreground mt-0.5">{scanResult.carbs}g</div>
                      </div>
                      <div className="bg-[var(--card)] border border-card-border py-1.5 rounded-lg">
                        <div className="text-[8px] text-red font-bold uppercase">Fats</div>
                        <div className="font-bold text-foreground mt-0.5">{scanResult.fat}g</div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => {
                          setMealPhoto(null);
                          setScanResult(null);
                        }}
                        className="flex-1 text-[10px] font-bold uppercase tracking-wider py-2 border border-card-border rounded-xl hover:bg-surface text-foreground cursor-pointer transition-colors"
                      >
                        Discard
                      </button>
                      <button
                        onClick={handleLogScanResult}
                        className="flex-1 bg-acid-green text-accent-foreground font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer border-none shadow-sm"
                      >
                        Log to Diary
                      </button>
                    </div>
                  </motion.div>
                )}
              </section>
            </div>
          )}

          {/* GROCERY LIST SUB-TAB */}
          {activeSubTab === 'grocery' && (
            <div className="max-w-xl mx-auto">
              <section className="glass rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-card-border">
                  <div>
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-acid-green" />
                      Smart Grocery Checklist
                    </h2>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Compile items from AI suggested planner</p>
                  </div>
                  {ecoStore.coachingPlan && (
                    <button 
                      onClick={handleGenerateGrocery}
                      disabled={generatingGrocery}
                      className="py-1.5 px-3.5 rounded-lg border border-card-border bg-surface text-[10px] font-bold text-foreground hover:border-acid-green transition-all cursor-pointer disabled:opacity-50"
                    >
                      {generatingGrocery ? "Compiling..." : "Generate List"}
                    </button>
                  )}
                </div>

                {groceryList ? (
                  <div className="space-y-4">
                    {groceryList.map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="text-[10px] font-bold text-acid-green uppercase tracking-wider">{cat.name}</div>
                        <div className="bg-surface/50 border border-card-border p-3.5 rounded-xl space-y-1">
                          {cat.items?.map((item, iIdx) => (
                            <label key={iIdx} className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer py-1 select-none">
                              <input type="checkbox" className="rounded border-card-border text-acid-green focus:ring-acid-green bg-transparent accent-acid-green cursor-pointer" />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-surface/25 border border-dashed border-card-border rounded-2xl">
                    <ShoppingBag className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted font-bold uppercase tracking-wider">No grocery compiled</p>
                    <p className="text-[10px] text-muted font-medium mt-1">
                      {ecoStore.coachingPlan 
                        ? "Click 'Generate List' at the top to build a grocery checklist from your AI diet plan." 
                        : "Configure targets in the AI Coach first to unlock grocery compilers."}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
