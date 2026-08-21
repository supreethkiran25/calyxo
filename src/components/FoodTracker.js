
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, BookOpen, ShoppingBag, 
  X, Check, Edit2, Trash2, Clock, 
  History, Sparkles, Star, Utensils, Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { 
  getFoodLogs, 
  addFoodLog, 
  updateFoodLog, 
  deleteFoodLog, 
  saveUserProfile, 
  getCurrentUserIdSync 
} from '../lib/dbService';
import { 
  ALL_CALYXO_FOODS, 
  searchCalyxoFoods 
} from '../lib/indianFoods';
import { 
  EDITORIAL_TRENDING, 
  getMealSlotFromTime 
} from '../lib/calyxoFoodDiscoveryData';
import { 
  buildNormalizedDatabase, 
  getNormalizedDishes 
} from '../lib/calyxoFoodNormalizer';
import { getTodayDateString, formatDateToLocalString, isSameLocalDate } from '../utils/dateUtils';
import MacroAnalyticsBar from './nutrition/MacroAnalyticsBar';
import NormalizedDishCard from './nutrition/NormalizedDishCard';
import PrecisionPortionDrawer from './nutrition/PrecisionPortionDrawer';
import MealTimelineGroup from './nutrition/MealTimelineGroup';
import AIMealPlannerCard from './nutrition/AIMealPlannerCard';
import PremiumFeatureModal from './modals/PremiumFeatureModal';
import smartReminderEngine from '../services/notifications/SmartReminderEngine';

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
      { category: "Lunch", name: "Tuna Salad Bowl", desc: "Canned tuna over mixed greens, cucumbers, tomatoes, lemon dressing", calories: 350, protein: 34, carbs: 12, fat: 16 },
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

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Foods', icon: null },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'frequent', label: 'Frequent', icon: Zap },
  { id: 'high-protein', label: 'High Protein', icon: null },
  { id: 'veg', label: 'Veg', icon: null },
  { id: 'nonveg', label: 'Non-Veg', icon: null },
  { id: 'egg', label: 'Egg', icon: null },
  { id: 'snacks', label: 'Snacks', icon: null },
  { id: 'south-indian', label: 'South Indian', icon: null },
  { id: 'north-indian', label: 'North Indian', icon: null }
];

export default function FoodTracker({ onNotification }) {
  const user = useStore(state => state.user);
  const foodLogs = useStore(state => state.foodLogs);
  const addFoodLogStore = useStore(state => state.addFoodLog);
  const updateFoodLogStore = useStore(state => state.updateFoodLog);
  const deleteFoodLogStore = useStore(state => state.deleteFoodLog);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const userId = user?.uid || user?.id || getCurrentUserIdSync();

  const searchInputRef = useRef(null);

  // Date State
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());

  useEffect(() => {
    const updateTimeState = () => {
      const currentToday = getTodayDateString();
      setSelectedDate(prev => {
        const yesterday = getTodayDateString(new Date(Date.now() - 86400000));
        if (prev === yesterday) return currentToday;
        return prev;
      });
    };
    updateTimeState();
    const timer = setInterval(updateTimeState, 60000);
    return () => clearInterval(timer);
  }, []);

  const selectedDateFoodLogs = foodLogs.filter(x => isSameLocalDate(x.timestamp, selectedDate));

  const handlePrevDate = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateToLocalString(d));
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateToLocalString(d));
  };

  const handleTodayDate = () => {
    setSelectedDate(getTodayDateString());
  };

  const formatDisplayDate = (dateStr) => {
    const todayStr = getTodayDateString();
    if (dateStr === todayStr) return "Today";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Macro Totals
  const totalCals = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
  const totalProt = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.protein) || 0), 0);
  const totalCarbs = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.carbs) || 0), 0);
  const totalFat = selectedDateFoodLogs.reduce((acc, item) => acc + (Number(item.fat) || 0), 0);

  const targetCals = userProfile?.calorieGoal || userProfile?.dailyCalories || 2000;
  const rawWkg = userProfile?.units === 'imperial' ? ((userProfile?.weight || 154) / 2.20462) : (userProfile?.weight || 70);
  const targetProt = userProfile?.protein || userProfile?.proteinTarget || Math.round(rawWkg * 2.0);
  const targetCarbs = userProfile?.carbs || userProfile?.targetMacros?.carbs || Math.round((targetCals * 0.5) / 4);
  const targetFat = userProfile?.fat || userProfile?.targetMacros?.fat || Math.round((targetCals * 0.25) / 9);

  // Active Macro Filter
  const [activeMacroAudit, setActiveMacroAudit] = useState(null);

  // Normalization Database Build
  useMemo(() => buildNormalizedDatabase(), []);

  // Filter & Search State
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const s = localStorage.getItem('calyxo_recent_food_searches');
      return s ? JSON.parse(s) : ['Fish Curry', 'Chicken Biryani', 'Dosa', 'Paneer', 'Eggs', 'Oats'];
    } catch (e) {
      return ['Fish Curry', 'Chicken Biryani', 'Dosa', 'Paneer', 'Eggs', 'Oats'];
    }
  });

  // Modal / Drawer State
  const [selectedPortionFood, setSelectedPortionFood] = useState(null);
  const [targetSlotForModal, setTargetSlotForModal] = useState('lunch');
  const [editingFoodLog, setEditingFoodLog] = useState(null);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('os'); // 'os' (Diary) | 'planner' | 'grocery'
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('AI Nutrition Intelligence');

  // Custom Food Form State
  const [cfName, setCfName] = useState('');
  const [cfCals, setCfCals] = useState('');
  const [cfProt, setCfProt] = useState('');
  const [cfCarb, setCfCarb] = useState('');
  const [cfFat, setCfFat] = useState('');

  // Weekly Planner State
  const [activeDay, setActiveDay] = useState(0);
  const [weeklyPlanner] = useState(() => {
    try {
      const saved = localStorage.getItem('calyxo_user_diet_splits');
      return saved ? JSON.parse(saved) : INITIAL_DIET_PLANNER;
    } catch (e) {
      return INITIAL_DIET_PLANNER;
    }
  });

  // Favorites
  const favoriteFoods = useMemo(() => {
    return Array.isArray(userProfile?.favoriteFoods) ? userProfile.favoriteFoods : [];
  }, [userProfile?.favoriteFoods]);

  // Frequently Consumed Foods
  const frequentlyConsumedFoods = useMemo(() => {
    const counts = {};
    for (const log of foodLogs) {
      const nameKey = (log.name || '').trim();
      if (!nameKey) continue;
      counts[nameKey] = (counts[nameKey] || 0) + 1;
    }

    const sortedNames = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 10);
    const seen = new Set();
    const result = [];

    for (const name of sortedNames) {
      const match = ALL_CALYXO_FOODS.find(f => (f.displayName || f.name).toLowerCase() === name.toLowerCase());
      if (match && !seen.has(match.name.toLowerCase())) {
        seen.add(match.name.toLowerCase());
        result.push(match);
      }
    }

    if (result.length < 6) {
      for (const st of EDITORIAL_TRENDING) {
        if (!seen.has(st.name.toLowerCase())) {
          seen.add(st.name.toLowerCase());
          result.push(st);
          if (result.length >= 6) break;
        }
      }
    }

    return result;
  }, [foodLogs]);

  // Query Normalized Dishes with Active Category Filters
  const normalizedDishes = useMemo(() => {
    if (activeCategory === 'favorites') {
      const favNames = new Set(favoriteFoods.map(f => (f.name || '').toLowerCase()));
      return getNormalizedDishes({
        searchQuery,
        limit: 30
      }).filter(dish => favNames.has(dish.coreName.toLowerCase()));
    }

    let dietType = 'all';
    let mealSlot = null;
    let region = null;
    let goal = null;

    if (activeCategory === 'veg' || activeCategory === 'nonveg' || activeCategory === 'egg') {
      dietType = activeCategory;
    } else if (activeCategory === 'snacks') {
      mealSlot = 'snacks';
    } else if (activeCategory === 'high-protein') {
      goal = 'high-protein';
    } else if (activeCategory === 'south-indian' || activeCategory === 'north-indian') {
      region = activeCategory;
    }

    return getNormalizedDishes({
      searchQuery,
      dietType,
      mealSlot,
      region,
      goal,
      limit: 32
    });
  }, [searchQuery, activeCategory, favoriteFoods]);

  // Search trigger & history caching
  const handlePerformSearch = (text) => {
    setSearchQuery(text);
    if (text.trim().length >= 2) {
      const nextRecent = [text.trim(), ...recentSearches.filter(s => s.toLowerCase() !== text.trim().toLowerCase())].slice(0, 6);
      setRecentSearches(nextRecent);
      try {
        localStorage.setItem('calyxo_recent_food_searches', JSON.stringify(nextRecent));
      } catch (e) {}
    }
  };

  // 1-Click Fast Add to Diary
  const handleQuickAdd = async (food, slot = 'lunch') => {
    let logTimestamp = Date.now();
    const todayStr = getTodayDateString();
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const defaultWeight = food.pieceWeight || 100;
    const factor = defaultWeight / 100;
    const cals100 = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
    const prot100 = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
    const carbs100 = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);
    const fat100 = food.fatPer100g !== undefined ? food.fatPer100g : (food.fat || 0);

    const targetSlot = slot || food.mealSlot || getMealSlotFromTime(logTimestamp);

    const logEntry = {
      name: food.displayName || food.originalName || food.name,
      calories: Math.round(cals100 * factor),
      protein: Number((prot100 * factor).toFixed(1)),
      carbs: Number((carbs100 * factor).toFixed(1)),
      fat: Number((fat100 * factor).toFixed(1)),
      portionWeight: defaultWeight,
      unitType: food.unitType || 'grams',
      mealSlot: targetSlot,
      timestamp: logTimestamp
    };

    try {
      const saved = await addFoodLog(userId, logEntry);
      addFoodLogStore(saved);
      smartReminderEngine.suppressDailyNutritionReminder(userId);
      if (onNotification) onNotification(`Logged ${logEntry.name} (${logEntry.portionWeight}g) to ${targetSlot.toUpperCase()}`);
    } catch (err) {
      console.error("Quick add error", err);
      if (onNotification) onNotification("Failed to log food.");
    }
  };

  // Custom portion log handler
  const handleLogCustomPortion = async (customLog) => {
    let logTimestamp = Date.now();
    const todayStr = getTodayDateString();
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const logEntry = {
      ...customLog,
      timestamp: logTimestamp
    };

    try {
      const saved = await addFoodLog(userId, logEntry);
      addFoodLogStore(saved);
      smartReminderEngine.suppressDailyNutritionReminder(userId);
      if (onNotification) onNotification(`Logged ${logEntry.name} (${logEntry.portionWeight}g) to ${logEntry.mealSlot.toUpperCase()}`);
    } catch (err) {
      console.error("Log portion error", err);
      if (onNotification) onNotification("Failed to log food.");
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (food) => {
    const foodName = food.displayName || food.originalName || food.name;
    const isFav = favoriteFoods.some(x => x.name.toLowerCase() === foodName.toLowerCase());
    let nextFavorites = [];
    if (isFav) {
      nextFavorites = favoriteFoods.filter(x => x.name.toLowerCase() !== foodName.toLowerCase());
    } else {
      nextFavorites = [...favoriteFoods, {
        name: foodName,
        calories: food.calories || food.calsPer100g || 0,
        protein: food.protein || food.protPer100g || 0,
        carbs: food.carbs || food.carbsPer100g || 0,
        fat: food.fat || food.fatPer100g || 0,
        pieceWeight: food.pieceWeight || 100,
        unitType: food.unitType || 'piece'
      }];
    }
    const updated = { ...userProfile, favoriteFoods: nextFavorites };
    updateUserProfile(updated);
    if (userId) {
      try {
        await saveUserProfile(userId, updated);
        if (onNotification) onNotification(isFav ? `Removed from favorites` : `Added to favorites`);
      } catch (e) {}
    }
  };

  // Delete food log
  const handleDeleteMeal = async (logId) => {
    try {
      await deleteFoodLog(userId, logId);
      deleteFoodLogStore(logId);
      if (onNotification) onNotification("Food log entry removed.");
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // Save edited food log
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
      if (onNotification) onNotification("Food log entry updated.");
    } catch (err) {
      console.error("Update error", err);
    }
  };

  // Custom food creator submission
  const handleCustomFoodSubmit = (e) => {
    e.preventDefault();
    if (!cfName || !cfCals) return;
    const foodObj = {
      name: cfName.trim(),
      displayName: cfName.trim(),
      calories: Number(cfCals) || 0,
      calsPer100g: Number(cfCals) || 0,
      protein: Number(cfProt) || 0,
      protPer100g: Number(cfProt) || 0,
      carbs: Number(cfCarb) || 0,
      carbsPer100g: Number(cfCarb) || 0,
      fat: Number(cfFat) || 0,
      fatPer100g: Number(cfFat) || 0,
      pieceWeight: 100,
      category: 'Custom'
    };
    handleQuickAdd(foodObj, targetSlotForModal);
    setShowCustomFood(false);
    setCfName(''); setCfCals(''); setCfProt(''); setCfCarb(''); setCfFat('');
  };

  const handleOpenSlotAdd = (slot) => {
    setTargetSlotForModal(slot);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-16 px-1 sm:px-0">
      
      {/* Top Header & Minimal View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border pb-3.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">Nutrition & Fuel</span>
          <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
            Nutrition Diary
          </h1>
        </div>

        {/* View Switcher & Quick Custom Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--input)] border border-card-border p-1 rounded-xl">
            {[
              { id: 'os', label: 'Diary' },
              { id: 'planner', label: 'Meal Plan' },
              { id: 'grocery', label: 'Grocery' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  activeSubTab === tab.id
                    ? 'bg-surface text-foreground shadow-xs'
                    : 'bg-transparent text-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowCustomFood(true)}
            className="px-3 py-1.5 bg-[var(--input)] hover:bg-acid-green hover:text-accent-foreground text-foreground rounded-xl border border-card-border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Create Custom Food"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Custom</span>
          </button>
        </div>
      </div>

      {/* DAILY MACRO ENERGY SUMMARY CARD */}
      <MacroAnalyticsBar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        formatDisplayDate={formatDisplayDate}
        handlePrevDate={handlePrevDate}
        handleNextDate={handleNextDate}
        handleTodayDate={handleTodayDate}
        totalCals={totalCals}
        targetCals={targetCals}
        totalProt={totalProt}
        targetProt={targetProt}
        totalCarbs={totalCarbs}
        targetCarbs={targetCarbs}
        totalFat={totalFat}
        targetFat={targetFat}
        activeMacroAudit={activeMacroAudit}
        setActiveMacroAudit={setActiveMacroAudit}
      />

      {/* DIARY VIEW */}
      {activeSubTab === 'os' && (
        <div className="space-y-6">
          
          {/* MEAL DIARY (Breakfast, Lunch, Dinner, Snacks) */}
          <MealTimelineGroup
            foodLogs={selectedDateFoodLogs}
            selectedDate={selectedDate}
            formatDisplayDate={formatDisplayDate}
            onEditFoodLog={setEditingFoodLog}
            onDeleteFoodLog={handleDeleteMeal}
            onOpenSlotAdd={handleOpenSlotAdd}
            activeMacroAudit={activeMacroAudit}
          />

          {/* OMNI SEARCH & CATEGORY FILTERS */}
          <section className="bg-surface border border-card-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">Food Catalog</span>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Quick Food Search & Add
                </h2>
              </div>
              <span className="text-[10px] font-mono text-muted">
                Logging to <strong className="text-acid-green uppercase">{targetSlotForModal}</strong>
              </span>
            </div>

            {/* Omni Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handlePerformSearch(searchQuery);
                  }
                }}
                placeholder="Search foods, dishes, ingredients (e.g. Eggs, Dosa, Chicken, Oats)..."
                className="w-full bg-[var(--input)] text-foreground border border-card-border focus:border-acid-green rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-muted/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer border-none bg-transparent"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Recent Searches (if no search query) */}
            {recentSearches.length > 0 && !searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted shrink-0 flex items-center gap-1">
                  <History className="w-3 h-3" /> Recent:
                </span>
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePerformSearch(term)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--input)] text-[10px] font-mono font-medium text-muted hover:text-foreground border border-card-border transition-colors cursor-pointer shrink-0"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}

            {/* Streamlined 1-Row Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
              {CATEGORY_FILTERS.map(cat => {
                const isSelected = activeCategory === cat.id;
                const CatIcon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-acid-green text-accent-foreground border-acid-green shadow-xs'
                        : 'bg-[var(--input)] border-card-border text-muted hover:text-foreground'
                    }`}
                  >
                    {CatIcon && <CatIcon className="w-3 h-3" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* FREQUENTLY CONSUMED FOODS (When in Frequent tab or default) */}
          {activeCategory === 'frequent' && frequentlyConsumedFoods.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  Your Frequent Staples ({frequentlyConsumedFoods.length})
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {frequentlyConsumedFoods.map((food, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-surface border border-card-border flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {food.displayName || food.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted">
                        {food.calories || food.calsPer100g} kcal · {food.pieceWeight || 100}g
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(food, targetSlotForModal)}
                      className="w-7 h-7 rounded-lg bg-[var(--input)] hover:bg-acid-green hover:text-accent-foreground text-foreground flex items-center justify-center font-bold text-xs cursor-pointer border border-card-border transition-colors shrink-0"
                      title="Add to Diary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* MATCHING FOOD CARDS GRID */}
          {activeCategory !== 'frequent' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  {searchQuery ? `Search Results (${normalizedDishes.length})` : `Popular Dishes & Staples (${normalizedDishes.length})`}
                </h3>
                <span className="text-[10px] font-mono text-muted">Tap to customize portion</span>
              </div>

              {normalizedDishes.length === 0 ? (
                <div className="p-8 text-center bg-surface border border-dashed border-card-border rounded-2xl space-y-2">
                  <Utensils className="w-8 h-8 text-muted mx-auto opacity-40" />
                  <h4 className="text-xs font-bold text-foreground">No dishes matching your filter</h4>
                  <p className="text-[11px] text-muted max-w-xs mx-auto">
                    Try searching for another dish name or create a custom food item.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCustomFood(true)}
                    className="mt-2 px-3 py-1.5 bg-acid-green text-accent-foreground text-xs font-bold rounded-lg cursor-pointer border-none inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Custom Food
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {normalizedDishes.map(dish => (
                    <NormalizedDishCard
                      key={dish.id}
                      dish={dish}
                      onQuickAdd={handleQuickAdd}
                      onOpenPortionDrawer={(food) => {
                        setSelectedPortionFood(food);
                      }}
                      isFavorite={favoriteFoods.some(x => x.name.toLowerCase() === dish.coreName.toLowerCase())}
                      onToggleFavorite={handleToggleFavorite}
                      currentMealSlot={targetSlotForModal}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      )}

      {/* DIET PLANNER TAB */}
      {activeSubTab === 'planner' && (
        <div className="space-y-6">
          <AIMealPlannerCard
            userProfile={userProfile}
            onOpenUpgradeModal={(feature) => {
              setPremiumFeatureName(feature);
              setPremiumModalOpen(true);
            }}
            onLogMeal={handleQuickAdd}
          />

          <section className="bg-surface border border-card-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="border-b border-card-border pb-3">
              <h2 className="text-sm sm:text-base font-bold text-foreground">Weekly Meal Plan</h2>
              <p className="text-[10px] font-mono text-muted">Pre-planned balanced meal templates</p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {weeklyPlanner.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveDay(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer border transition-colors shrink-0 ${
                    activeDay === idx
                      ? 'bg-acid-green text-accent-foreground border-acid-green shadow-xs'
                      : 'bg-[var(--input)] border-card-border text-muted hover:text-foreground'
                  }`}
                >
                  {day.dayName.substring(0, 3)}
                </button>
              ))}
            </div>

            {/* Day Meals List */}
            <div className="space-y-2.5 pt-1">
              {weeklyPlanner[activeDay].diet.map((meal, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[var(--input)] border border-card-border flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold uppercase text-acid-green block">{meal.category}</span>
                    <h4 className="text-xs font-bold text-foreground truncate">{meal.name}</h4>
                    <p className="text-[10px] text-muted mt-0.5 line-clamp-1">{meal.desc}</p>
                    <span className="text-[10px] font-mono text-muted mt-1 block">
                      {meal.calories} kcal · {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(meal, meal.category?.toLowerCase() || 'lunch')}
                    className="w-8 h-8 rounded-xl bg-surface hover:bg-acid-green hover:text-accent-foreground text-foreground flex items-center justify-center font-bold text-xs cursor-pointer border border-card-border transition-colors shrink-0 shadow-xs active:scale-95"
                    title="Log to Diary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SMART GROCERY TAB */}
      {activeSubTab === 'grocery' && (
        <div className="max-w-xl mx-auto space-y-5">
          <section className="bg-surface border border-card-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="border-b border-card-border pb-3">
              <h2 className="text-sm sm:text-base font-bold text-foreground">Smart Grocery Checklist</h2>
              <p className="text-[10px] font-mono text-muted">Weekly replenishment items for your nutrition goals</p>
            </div>

            <div className="space-y-2">
              {[
                "Rolled Oats & Chia Seeds", 
                "Chicken Breast & Lean Meat", 
                "Paneer & Greek Yogurt", 
                "Eggs & Soya Chunks", 
                "Brown Rice & Quinoa", 
                "Fresh Spinach, Avocado & Berries"
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-3 bg-[var(--input)] border border-card-border rounded-xl cursor-pointer hover:border-acid-green/40 transition-colors">
                  <input type="checkbox" className="accent-acid-green cursor-pointer w-4 h-4 rounded" />
                  <span className="text-xs font-semibold text-foreground">{item}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* PRECISION PORTION DRAWER MODAL */}
      {selectedPortionFood && (
        <PrecisionPortionDrawer
          food={selectedPortionFood}
          initialSlot={targetSlotForModal}
          onClose={() => setSelectedPortionFood(null)}
          onLogMeal={handleLogCustomPortion}
        />
      )}

      {/* CUSTOM FOOD CREATOR MODAL */}
      {showCustomFood && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCustomFood(false)} />
          <div className="relative bg-surface border border-card-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 z-10 pb-safe">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h3 className="text-sm font-bold uppercase text-foreground">Create Custom Food</h3>
              <button onClick={() => setShowCustomFood(false)} className="p-1 text-muted hover:text-foreground cursor-pointer bg-none border-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomFoodSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={cfName}
                  onChange={(e) => setCfName(e.target.value)}
                  placeholder="e.g. Homemade Protein Shake"
                  className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Calories (kcal per 100g / serving)</label>
                <input
                  type="number"
                  required
                  value={cfCals}
                  onChange={(e) => setCfCals(e.target.value)}
                  placeholder="250"
                  className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cfProt}
                    onChange={(e) => setCfProt(e.target.value)}
                    placeholder="20"
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cfCarb}
                    onChange={(e) => setCfCarb(e.target.value)}
                    placeholder="25"
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cfFat}
                    onChange={(e) => setCfFat(e.target.value)}
                    placeholder="5"
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setShowCustomFood(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-muted bg-[var(--input)] border border-card-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-acid-green text-accent-foreground font-bold text-xs uppercase tracking-wider cursor-pointer border-none shadow-xs active:scale-95"
                >
                  Save & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FOOD LOG MODAL */}
      {editingFoodLog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingFoodLog(null)} />
          <div className="relative bg-surface border border-card-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 z-10 pb-safe">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h3 className="text-sm font-bold uppercase text-foreground">Edit Logged Item</h3>
              <button onClick={() => setEditingFoodLog(null)} className="p-1 text-muted hover:text-foreground cursor-pointer bg-none border-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted block mb-1">Food Name</label>
                <input
                  type="text"
                  value={editingFoodLog.name}
                  onChange={(e) => setEditingFoodLog({ ...editingFoodLog, name: e.target.value })}
                  className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={editingFoodLog.calories}
                    onChange={(e) => setEditingFoodLog({ ...editingFoodLog, calories: Number(e.target.value) })}
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Portion (g)</label>
                  <input
                    type="number"
                    value={editingFoodLog.portionWeight || 100}
                    onChange={(e) => setEditingFoodLog({ ...editingFoodLog, portionWeight: Number(e.target.value) })}
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFoodLog.protein}
                    onChange={(e) => setEditingFoodLog({ ...editingFoodLog, protein: Number(e.target.value) })}
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFoodLog.carbs}
                    onChange={(e) => setEditingFoodLog({ ...editingFoodLog, carbs: Number(e.target.value) })}
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingFoodLog.fat}
                    onChange={(e) => setEditingFoodLog({ ...editingFoodLog, fat: Number(e.target.value) })}
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <button onClick={() => setEditingFoodLog(null)} className="px-3.5 py-1.5 bg-[var(--input)] border border-card-border rounded-xl text-xs font-semibold text-muted cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSaveEditedFoodLog} className="px-4 py-1.5 bg-acid-green text-accent-foreground font-bold text-xs rounded-xl cursor-pointer border-none shadow-xs active:scale-95">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM UPGRADE MODAL */}
      <PremiumFeatureModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        featureName={premiumFeatureName}
      />

    </div>
  );
}
