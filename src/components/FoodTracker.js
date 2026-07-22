"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  getFoodLogs, 
  addFoodLog, 
  updateFoodLog, 
  deleteFoodLog, 
  saveEcosystemState, 
  saveUserProfile, 
  getUserAssignments 
} from '../lib/dbService';
import { searchFood } from '../services/foodService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { INDIAN_FOODS } from '../lib/indianFoods';
import { 
  Plus, Search, BookOpen, Trash2, Sparkles, Check, X, ShieldAlert, 
  ShoppingBag, Star, ChevronLeft, ChevronRight, Calendar, Edit2, Pencil 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const addFoodLogStore = useStore(state => state.addFoodLog);
  const updateFoodLogStore = useStore(state => state.updateFoodLog);
  const deleteFoodLogStore = useStore(state => state.deleteFoodLog);
  const userProfile = useStore(state => state.userProfile);
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  // Date Calendar History State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const isDateSelected = (timestamp, dateStr) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return false;
    const dStr = d.toISOString().split('T')[0];
    return dStr === dateStr;
  };

  const selectedDateFoodLogs = foodLogs.filter(x => isDateSelected(x.timestamp, selectedDate));

  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleTodayDate = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) return "Today";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const totalConsumedCals = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
  const totalConsumedProt = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.protein) || 0), 0);
  const totalConsumedCarbs = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.carbs) || 0), 0);
  const totalConsumedFat = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.fat) || 0), 0);

  const targetCals = userProfile?.calorieGoal || userProfile?.dailyCalories || 2000;
  const rawWkg = userProfile?.units === 'imperial' ? ((userProfile?.weight || 154) / 2.20462) : (userProfile?.weight || 70);
  const targetProt = userProfile?.protein || userProfile?.proteinTarget || Math.round(rawWkg * 2.0);
  const targetCarbs = userProfile?.carbs || userProfile?.targetMacros?.carbs || Math.round((targetCals * 0.5) / 4);
  const targetFat = userProfile?.fat || userProfile?.targetMacros?.fat || Math.round((targetCals * 0.25) / 9);

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

  // Editing Food Log State
  const [editingFoodLog, setEditingFoodLog] = useState(null);

  const updateUserProfile = useStore(state => state.updateUserProfile);

  const toggleFavorite = async (e, food) => {
    e.stopPropagation();
    const favorites = Array.isArray(userProfile.favoriteFoods) ? userProfile.favoriteFoods : [];
    const isFav = favorites.some(x => x.name.toLowerCase() === food.name.toLowerCase());
    let nextFavorites = [];
    if (isFav) {
      nextFavorites = favorites.filter(x => x.name.toLowerCase() !== food.name.toLowerCase());
    } else {
      nextFavorites = [...favorites, {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || 0,
        sugar: food.sugar || 0,
        sodium: food.sodium || 0
      }];
    }
    const updated = { ...userProfile, favoriteFoods: nextFavorites };
    const prev = userProfile;
    updateUserProfile(updated);
    if (userId) {
      try {
        await saveUserProfile(userId, updated);
        if (onNotification) onNotification(isFav ? `Removed ${food.name} from favorites` : `Added ${food.name} to favorites ⭐`);
      } catch (err) {
        console.error("Toggle favorite save failed", err);
        updateUserProfile(prev);
        if (onNotification) onNotification("Failed to update favorites. Please try again.");
      }
    }
  };

  const recentFoods = useMemo(() => {
    const seen = new Set();
    const recents = [];
    for (const log of [...foodLogs]) {
      const key = log.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        recents.push(log);
        if (recents.length >= 6) break;
      }
    }
    return recents;
  }, [foodLogs]);

  // Log portion state
  const [analysedFood, setAnalysedFood] = useState(null);
  const [portion, setPortion] = useState(100);

  // Navigation Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState('diary');

  // Weekly planner state (Persistent via localStorage)
  const [activeDay, setActiveDay] = useState(0);
  const [activePlanDay, setActivePlanDay] = useState(0);
  const [weeklyPlanner, setWeeklyPlanner] = useState(() => {
    try {
      const saved = localStorage.getItem('calyxo_user_diet_splits');
      return saved ? JSON.parse(saved) : INITIAL_DIET_PLANNER;
    } catch (e) {
      return INITIAL_DIET_PLANNER;
    }
  });
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  const [editMealFields, setEditMealFields] = useState({ category: '', name: '', desc: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Grocery List State
  const [groceryList, setGroceryList] = useState([]);
  const [generatingGrocery, setGeneratingGrocery] = useState(false);
  const [assignedMealPlans, setAssignedMealPlans] = useState([]);

  // Hydrate Initial Food state & Trainer Assignments
  useEffect(() => {
    const fetchFood = async () => {
      if (!userId) return;
      try {
        const data = await getFoodLogs(userId);
        setFoodLogs(data || []);
        
        const assigns = await getUserAssignments(userId);
        if (assigns && assigns.length > 0) {
          const mealPlans = assigns.filter(a => a.type === 'meal_plan');
          setAssignedMealPlans(mealPlans);
        }
      } catch (err) {
        console.error("Error loading food log or assignments", err);
        if (onNotification) onNotification("Failed to load food logs. Please reload.");
      }
    };
    fetchFood();
  }, [userId, setFoodLogs, onNotification]);

  // Handle Search autocomplete
  useEffect(() => {
    if (!queryVal.trim() || queryVal.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      const q = queryVal.toLowerCase().trim();
      const localMatches = INDIAN_FOODS.filter(f => f.name.toLowerCase().includes(q)).map(f => ({ ...f, isLocal: true }));
      const catalogMatches = FOODS_CATALOG.filter(f => f.name.toLowerCase().includes(q)).map(f => ({ ...f, isLocal: false, category: 'Catalog' }));

      let externalMatches = [];
      try {
        const res = await searchFood(q);
        if (res && res.length > 0) {
          externalMatches = res.map(f => ({
            name: f.name,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            fiber: f.fiber || 0,
            sugar: f.sugar || 0,
            sodium: f.sodium || 0,
            category: 'USDA',
            isLocal: false
          }));
        }
      } catch (e) {
        console.warn("External food search error", e);
      }

      const combined = [...localMatches, ...catalogMatches, ...externalMatches];
      setSearchResults(combined.slice(0, 10));
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [queryVal]);

  const selectFood = (food) => {
    setAnalysedFood(food);
    setPortion(100);
    setShowDropdown(false);
    setQueryVal(food.name);
  };

  const logFoodItem = async () => {
    if (!analysedFood) return;
    const ratio = portion / 100;
    
    let logTimestamp = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const logEntry = {
      name: analysedFood.name,
      calories: Math.round(analysedFood.calories * ratio),
      protein: Number((analysedFood.protein * ratio).toFixed(1)),
      carbs: Number((analysedFood.carbs * ratio).toFixed(1)),
      fat: Number((analysedFood.fat * ratio).toFixed(1)),
      portionWeight: portion,
      timestamp: logTimestamp
    };

    try {
      const saved = await addFoodLog(userId, logEntry);
      addFoodLogStore(saved);
      setAnalysedFood(null);
      setQueryVal('');
      if (onNotification) onNotification(`Logged ${logEntry.portionWeight}g of ${logEntry.name}! 🥗`);
    } catch (err) {
      console.error("Error logging food", err);
      if (onNotification) onNotification("Failed to log food. Please try again.");
    }
  };

  const handleSaveEditedFoodLog = async () => {
    if (!editingFoodLog) return;
    try {
      const updated = await updateFoodLog(userId, editingFoodLog.id, {
        name: editingFoodLog.name,
        calories: Number(editingFoodLog.calories) || 0,
        protein: Number(editingFoodLog.protein) || 0,
        carbs: Number(editingFoodLog.carbs) || 0,
        fat: Number(editingFoodLog.fat) || 0,
        portionWeight: Number(editingFoodLog.portionWeight) || 100
      });
      updateFoodLogStore(updated);
      setEditingFoodLog(null);
      if (onNotification) onNotification("Food log entry updated! ✏️");
    } catch (err) {
      console.error("Failed to edit food log", err);
      if (onNotification) onNotification("Failed to edit food log.");
    }
  };

  const handleDeleteMeal = async (logId) => {
    try {
      await deleteFoodLog(userId, logId);
      deleteFoodLogStore(logId);
      if (onNotification) onNotification("Food log deleted.");
    } catch (err) {
      console.error("Failed to delete food log", err);
      if (onNotification) onNotification("Failed to delete food log.");
    }
  };

  const handleCustomFoodSubmit = (e) => {
    e.preventDefault();
    if (!cfName || !cfCals) return;
    const foodObj = {
      name: cfName.trim(),
      calories: Number(cfCals) || 0,
      protein: Number(cfProt) || 0,
      carbs: Number(cfCarb) || 0,
      fat: Number(cfFat) || 0,
      category: 'Custom'
    };
    selectFood(foodObj);
    setShowCustomFood(false);
    setCfName(''); setCfCals(''); setCfProt(''); setCfCarb(''); setCfFat('');
  };

  const handleLogSuggestedMeal = async (meal) => {
    let logTimestamp = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const logEntry = {
      name: meal.name,
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fat: Number(meal.fat) || 0,
      portionWeight: 100,
      timestamp: logTimestamp
    };

    try {
      const saved = await addFoodLog(userId, logEntry);
      addFoodLogStore(saved);
      if (onNotification) onNotification(`Logged ${meal.name} to diary! 🥗`);
    } catch (err) {
      console.error("Failed logging suggested meal", err);
    }
  };

  const handleStartEditMeal = (idx, meal) => {
    setEditingMealIndex(idx);
    setEditMealFields({ ...meal });
  };

  const handleAddMealToSplit = () => {
    const updatedPlanner = [...weeklyPlanner];
    updatedPlanner[activeDay].diet.push({
      category: "Snack",
      name: "New Custom Meal",
      desc: "Healthy balanced portion",
      calories: 250,
      protein: 20,
      carbs: 25,
      fat: 8
    });
    setWeeklyPlanner(updatedPlanner);
    try {
      localStorage.setItem('calyxo_user_diet_splits', JSON.stringify(updatedPlanner));
    } catch (e) {
      console.error("Failed saving diet splits", e);
    }
    if (onNotification) onNotification("Added new meal to diet split.");
  };

  const handleDeleteMealFromSplit = (idx) => {
    const updatedPlanner = [...weeklyPlanner];
    updatedPlanner[activeDay].diet.splice(idx, 1);
    setWeeklyPlanner(updatedPlanner);
    try {
      localStorage.setItem('calyxo_user_diet_splits', JSON.stringify(updatedPlanner));
    } catch (e) {
      console.error("Failed saving diet splits", e);
    }
    if (onNotification) onNotification("Deleted meal from diet split.");
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
    try {
      localStorage.setItem('calyxo_user_diet_splits', JSON.stringify(updatedPlanner));
    } catch (e) {
      console.error("Failed saving diet splits", e);
    }
    setEditingMealIndex(null);
    if (onNotification) onNotification("Suggested meal item updated & saved!");
  };

  const inputStyle = "w-full bg-[var(--input)] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner";

  return (
    <div className="space-y-6">
      
      {/* Sub navigation Tabs */}
      <div className="flex flex-col gap-3 border-b border-card-border pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight">Nutrition Center</h1>
            <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 hidden sm:block">Track diets, food history logs, and meal compilation lists</p>
          </div>
        </div>

        <div className="bg-surface border border-card-border p-1 rounded-xl flex gap-0.5 overflow-x-auto w-full sm:w-auto sm:max-w-[65%] shrink-0 scrollbar-none">
          {[
            { id: 'diary', label: 'Food Diary' },
            { id: 'planner', label: 'Meal Planner' },
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
            <div className="space-y-6">

              {/* DATE SELECTION CALENDAR BAR */}
              <div className="glass border border-card-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-acid-green" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Nutrition Date History</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrevDate}
                    className="p-1.5 rounded-lg bg-surface border border-card-border hover:border-acid-green text-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex items-center bg-[var(--input)] border border-card-border px-3 py-1.5 rounded-xl">
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                    />
                    <span className="ml-2 text-[10px] font-extrabold text-acid-green uppercase">
                      ({formatDisplayDate(selectedDate)})
                    </span>
                  </div>

                  <button 
                    onClick={handleNextDate}
                    className="p-1.5 rounded-lg bg-surface border border-card-border hover:border-acid-green text-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={handleTodayDate}
                    className="px-2.5 py-1.5 rounded-xl bg-acid-green text-accent-foreground text-[10px] font-black uppercase tracking-wider cursor-pointer border-none"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* ASSIGNED TRAINER MEAL PLANS */}
              {assignedMealPlans && assignedMealPlans.length > 0 && (
                <section className="glass border-acid-green/30 border rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-acid-green/10 text-acid-green rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Assigned Coach Meal Plan</h2>
                        <p className="text-[10px] text-muted font-bold">Prescribed directly by your nutritionist/coach</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-acid-green text-accent-foreground px-2.5 py-1 rounded-lg">Active Plan</span>
                  </div>

                  {assignedMealPlans.map((plan, pIdx) => (
                    <div key={pIdx} className="bg-surface/80 border border-card-border p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-foreground">{plan.title}</h3>
                          {plan.content?.notes && (
                            <p className="text-xs text-muted mt-0.5">{plan.content.notes}</p>
                          )}
                        </div>
                        {plan.content?.targetCalories && (
                          <span className="text-[10px] font-bold text-acid-green bg-acid-green/10 px-2 py-0.5 rounded border border-acid-green/20">
                            Target: {plan.content.targetCalories} kcal
                          </span>
                        )}
                      </div>

                      {plan.content?.meals && plan.content.meals.length > 0 && (
                        <div className="space-y-3 border-t border-card-border pt-3">
                          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Prescribed Meals</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {plan.content.meals.map((m, mIdx) => (
                              <div key={mIdx} className="bg-card-bg border border-card-border p-3 rounded-lg space-y-1">
                                <span className="text-xs font-bold text-foreground block">{m.name}</span>
                                {m.items && m.items.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {m.items.map((it, iIdx) => (
                                      <div key={iIdx} className="text-[10px] text-muted flex justify-between">
                                        <span>• {it.name}</span>
                                        <span className="font-semibold text-foreground">{it.calories} kcal</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted italic">No custom items specified</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Log meal search column */}
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6 relative">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Search Foods & Log</h2>
                  <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Select items to track macros ({formatDisplayDate(selectedDate)})</p>

                  <div ref={dropdownRef} className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 w-5 h-5 text-muted" />
                      <input 
                        type="text"
                        value={queryVal}
                        onChange={(e) => setQueryVal(e.target.value)}
                        onFocus={() => {
                          if (searchResults.length > 0 && queryVal.trim().length >= 2) {
                            setShowDropdown(true);
                          }
                        }}
                        placeholder="Search oats, chicken breast, paneer..."
                        className="w-full bg-[var(--input-bg)] border border-card-border focus:border-acid-green rounded-2xl pl-12 pr-5 py-3.5 text-sm text-foreground focus:outline-none shadow-inner"
                        autoComplete="off"
                      />
                    </div>

                    <AnimatePresence>
                      {showDropdown && searchResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface border border-card-border z-50 rounded-2xl max-h-64 overflow-y-auto shadow-2xl"
                          style={{ backgroundColor: 'var(--secondary, #12121A)', opacity: 1 }}
                        >
                          {searchResults.map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => selectFood(item)}
                              className="px-5 py-3.5 border-b border-card-border last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-acid-green/10 transition-colors group"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                                  {item.name}
                                  {item.isLocal && (
                                    <span className="text-[8px] bg-acid-green/10 text-acid-green border border-acid-green/20 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wide">
                                      {item.category || "Local"}
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-muted font-bold mt-0.5">
                                  P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] opacity-75 text-acid-green font-bold whitespace-nowrap">{item.calories} kcal/100g</span>
                                
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavorite(e, item)}
                                  className="p-1 rounded-lg text-muted hover:text-yellow-500 cursor-pointer transition-colors"
                                  title="Toggle Favorite"
                                >
                                  <Star 
                                    className={`w-3.5 h-3.5 ${
                                      (Array.isArray(userProfile.favoriteFoods) ? userProfile.favoriteFoods : []).some(x => x.name.toLowerCase() === item.name.toLowerCase()) 
                                        ? 'text-yellow-500 fill-current' 
                                        : 'text-muted'
                                    }`} 
                                  />
                                </button>
                              </div>
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
                          <input type="text" value={cfName} onChange={(e) => setCfName(e.target.value)} placeholder="e.g. Home Paneer Curry" className={inputStyle} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Calories (kcal/100g)</label>
                          <input type="number" value={cfCals} onChange={(e) => setCfCals(e.target.value)} placeholder="e.g. 240" className={inputStyle} required />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Protein (g)</label>
                          <input type="number" step="0.1" value={cfProt} onChange={(e) => setCfProt(e.target.value)} className={inputStyle} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Carbs (g)</label>
                          <input type="number" step="0.1" value={cfCarb} onChange={(e) => setCfCarb(e.target.value)} className={inputStyle} required />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Fats (g)</label>
                          <input type="number" step="0.1" value={cfFat} onChange={(e) => setCfFat(e.target.value)} className={inputStyle} required />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="submit" className="bg-acid-green text-accent-foreground font-bold text-xs py-2 px-4 rounded-xl cursor-pointer border-none shadow-sm">Save & Log Item</button>
                      </div>
                    </form>
                  </motion.section>
                )}

                {/* Selected Food details & portions log */}
                {analysedFood && (() => {
                  const ratio = portion / 100;
                  const scaledCals = Math.round(analysedFood.calories * ratio);
                  const scaledProt = Number((analysedFood.protein * ratio).toFixed(1));
                  const scaledCarbs = Number((analysedFood.carbs * ratio).toFixed(1));
                  const scaledFat = Number((analysedFood.fat * ratio).toFixed(1));

                  return (
                    <motion.section 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass border-acid-green/20 border rounded-2xl p-6 space-y-5"
                    >
                      <div className="flex flex-col items-center justify-center p-4 border-b border-card-border">
                        <h3 className="text-sm font-bold text-foreground text-center">{portion}g {analysedFood.name}</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[9px] text-muted uppercase font-bold tracking-wider mb-2 block">Nutrition (scaled to {portion}g)</span>
                          <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-muted font-bold">Calories</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledCals} kcal</div>
                            </div>
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-acid-green font-bold">Protein</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledProt}g</div>
                            </div>
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-orange font-bold">Carbs</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledCarbs}g</div>
                            </div>
                            <div className="bg-surface border border-card-border py-2 rounded-lg">
                              <div className="text-[8px] text-red font-bold">Fats</div>
                              <div className="font-bold text-foreground mt-0.5">{scaledFat}g</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-3">
                          <div className="flex flex-col space-y-1 flex-1">
                            <label className="text-[9px] text-muted uppercase font-bold tracking-wider">Portion (g)</label>
                            <input type="number" value={portion} onChange={(e) => setPortion(Number(e.target.value))} className={inputStyle} />
                          </div>
                          <button onClick={logFoodItem} className="bg-acid-green text-accent-foreground font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer h-10 sm:h-[36px] flex items-center justify-center border-none shadow-sm">Log Meal</button>
                        </div>
                      </div>
                    </motion.section>
                  );
                })()}
              </div>

              {/* Right Column: Macro Progress & Logged Intake Timeline */}
              <div className="space-y-6">
                {/* Daily Macro Targets Card */}
                <section className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Macro Targets ({formatDisplayDate(selectedDate)})</h2>
                    <span className="text-[10px] font-bold text-acid-green bg-acid-green/10 px-2 py-0.5 rounded-full border border-acid-green/20">
                      {totalConsumedCals} / {targetCals} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface border border-card-border p-3 rounded-xl flex flex-col">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider">Protein</span>
                      <span className="text-sm font-black text-acid-green mt-1">{totalConsumedProt.toFixed(0)} / {targetProt}g</span>
                      <div className="w-full bg-card-border h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-acid-green h-full rounded-full" style={{ width: `${Math.min(100, (totalConsumedProt / (targetProt || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="bg-surface border border-card-border p-3 rounded-xl flex flex-col">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider">Carbs</span>
                      <span className="text-sm font-black text-amber-500 mt-1">{totalConsumedCarbs.toFixed(0)} / {targetCarbs}g</span>
                      <div className="w-full bg-card-border h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalConsumedCarbs / (targetCarbs || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="bg-surface border border-card-border p-3 rounded-xl flex flex-col">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider">Fats</span>
                      <span className="text-sm font-black text-rose-500 mt-1">{totalConsumedFat.toFixed(0)} / {targetFat}g</span>
                      <div className="w-full bg-card-border h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (totalConsumedFat / (targetFat || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Logged Intake History</h2>
                    <span className="text-[10px] font-bold text-acid-green">{selectedDateFoodLogs.length} Meals Logged</span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {selectedDateFoodLogs && selectedDateFoodLogs.length > 0 ? (
                      selectedDateFoodLogs.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-surface/50 border border-card-border px-4 py-3 rounded-xl">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{item.name} <span className="text-[9px] text-muted font-medium">({item.portionWeight || 100}g)</span></span>
                            <span className="text-[9px] text-muted mt-0.5">P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-acid-green">+{item.calories} kcal</span>
                            
                            <button 
                              onClick={() => setEditingFoodLog({ ...item })} 
                              className="text-muted hover:text-acid-green cursor-pointer p-1 border-none bg-transparent"
                              title="Edit Food Log"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => handleDeleteMeal(item.id || item.timestamp)} 
                              className="text-muted hover:text-destructive cursor-pointer p-1 border-none bg-transparent"
                              title="Delete Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-muted py-12 font-medium">
                        No food logs registered on {formatDisplayDate(selectedDate)}.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
            </div>
          )}

          {/* MEAL PLANNER SUB-TAB */}
          {activeSubTab === 'planner' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Daily Meal Scheduler */}
              <section className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Weekly Diet Planner Templates</h2>
                  <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider bg-acid-green/10 px-2 py-0.5 rounded border border-acid-green/20">Editable & Saved</span>
                </div>
                
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

                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-muted font-bold uppercase">Meals for {weeklyPlanner[activeDay].dayName}</span>
                  <button onClick={handleAddMealToSplit} className="text-[10px] text-acid-green font-bold uppercase flex items-center gap-1 cursor-pointer bg-none border-none">
                    <Plus className="w-3.5 h-3.5" /> Add Meal
                  </button>
                </div>

                <div className="space-y-4">
                  {weeklyPlanner[activeDay].diet.map((meal, idx) => (
                    <div key={idx} className="border-b border-card-border last:border-b-0 pb-3.5 last:pb-0">
                      {editingMealIndex === idx ? (
                        <div className="space-y-3 p-3 bg-surface border border-card-border rounded-xl">
                          <input type="text" value={editMealFields.name} onChange={(e) => setEditMealFields({ ...editMealFields, name: e.target.value })} className={inputStyle} placeholder="Meal name" />
                          <input type="text" value={editMealFields.desc} onChange={(e) => setEditMealFields({ ...editMealFields, desc: e.target.value })} className={inputStyle} placeholder="Description" />
                          
                          <div className="grid grid-cols-4 gap-2 text-center text-[9px] text-muted font-bold">
                            <div>Kcal<input type="number" value={editMealFields.calories} onChange={(e) => setEditMealFields({ ...editMealFields, calories: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>P(g)<input type="number" value={editMealFields.protein} onChange={(e) => setEditMealFields({ ...editMealFields, protein: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>C(g)<input type="number" value={editMealFields.carbs} onChange={(e) => setEditMealFields({ ...editMealFields, carbs: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                            <div>F(g)<input type="number" value={editMealFields.fat} onChange={(e) => setEditMealFields({ ...editMealFields, fat: e.target.value })} className="w-full bg-[var(--input)] text-center rounded py-1 border border-card-border text-foreground text-xs" /></div>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <button onClick={() => handleDeleteMealFromSplit(idx)} className="text-[10px] text-destructive flex items-center gap-1 cursor-pointer bg-none border-none">
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>

                            <div className="flex gap-2">
                              <button onClick={() => setEditingMealIndex(null)} className="text-[10px] text-muted py-1 px-3 bg-surface border border-card-border rounded-lg flex items-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" /> Cancel</button>
                              <button onClick={() => handleSaveMealEdit(idx)} className="text-[10px] text-accent-foreground bg-acid-green py-1 px-3 rounded-lg font-bold flex items-center gap-1 cursor-pointer border-none"><Check className="w-3.5 h-3.5" /> Save</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-acid-green font-bold uppercase">{meal.category}</span>
                              <h4 onClick={() => handleStartEditMeal(idx, meal)} className="text-xs font-bold text-foreground border-b border-dashed border-muted cursor-pointer hover:text-acid-green flex items-center gap-1">
                                {meal.name} <Pencil className="w-3 h-3 text-muted" />
                              </h4>
                            </div>
                            <p className="text-[10px] text-muted mt-1 leading-relaxed">{meal.desc}</p>
                            <span className="text-[9px] text-muted font-bold mt-1 block">
                              {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                            </span>
                          </div>
                          
                          <button onClick={() => handleLogSuggestedMeal(meal)} className="w-7 h-7 rounded-full bg-acid-green/10 border border-acid-green/20 hover:bg-acid-green hover:text-accent-foreground flex items-center justify-center cursor-pointer transition-colors text-acid-green font-bold text-xs" title="Log to Diary">
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

          {/* GROCERY LIST SUB-TAB */}
          {activeSubTab === 'grocery' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <section className="glass rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-acid-green" />
                    Smart Grocery List
                  </h2>
                </div>
                <p className="text-muted text-[10px] uppercase font-bold tracking-wider">Compiles all ingredients needed for your weekly meal split</p>

                <div className="space-y-2">
                  {["Oats & Quinoa", "Chicken Breast & Salmon", "Paneer & Greek Yogurt", "Berries & Avocado", "Eggs & Nuts"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface border border-card-border rounded-xl">
                      <input type="checkbox" className="accent-acid-green cursor-pointer" />
                      <span className="text-xs font-bold text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* EDIT FOOD LOG MODAL */}
      <AnimatePresence>
        {editingFoodLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingFoodLog(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10">
              <div className="flex justify-between items-center border-b border-card-border pb-3">
                <h3 className="text-sm font-black uppercase text-foreground">Edit Food Log</h3>
                <button onClick={() => setEditingFoodLog(null)} className="p-1 text-muted hover:text-foreground cursor-pointer bg-none border-none"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase block mb-1">Food Name</label>
                  <input type="text" value={editingFoodLog.name} onChange={(e) => setEditingFoodLog({ ...editingFoodLog, name: e.target.value })} className={inputStyle} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-muted uppercase block mb-1">Calories (kcal)</label>
                    <input type="number" value={editingFoodLog.calories} onChange={(e) => setEditingFoodLog({ ...editingFoodLog, calories: Number(e.target.value) })} className={inputStyle} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted uppercase block mb-1">Portion (g)</label>
                    <input type="number" value={editingFoodLog.portionWeight || 100} onChange={(e) => setEditingFoodLog({ ...editingFoodLog, portionWeight: Number(e.target.value) })} className={inputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-muted uppercase block mb-1">Protein (g)</label>
                    <input type="number" step="0.1" value={editingFoodLog.protein} onChange={(e) => setEditingFoodLog({ ...editingFoodLog, protein: Number(e.target.value) })} className={inputStyle} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted uppercase block mb-1">Carbs (g)</label>
                    <input type="number" step="0.1" value={editingFoodLog.carbs} onChange={(e) => setEditingFoodLog({ ...editingFoodLog, carbs: Number(e.target.value) })} className={inputStyle} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted uppercase block mb-1">Fat (g)</label>
                    <input type="number" step="0.1" value={editingFoodLog.fat} onChange={(e) => setEditingFoodLog({ ...editingFoodLog, fat: Number(e.target.value) })} className={inputStyle} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                <button onClick={() => setEditingFoodLog(null)} className="px-4 py-2 bg-surface border border-card-border rounded-xl text-xs font-bold text-muted cursor-pointer">Cancel</button>
                <button onClick={handleSaveEditedFoodLog} className="px-4 py-2 bg-acid-green text-accent-foreground font-bold text-xs rounded-xl cursor-pointer border-none shadow-sm">Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
