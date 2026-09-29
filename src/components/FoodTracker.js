import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, X, Utensils, Sparkles, Star, Zap,
  Calendar, ChevronLeft, ChevronRight, History, SlidersHorizontal, Droplets, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import useQuickActionsStore from '../store/useQuickActionsStore';
import { 
  addFoodLog, 
  updateFoodLog, 
  deleteFoodLog, 
  saveUserProfile, 
  getCurrentUserIdSync,
  saveWaterIntake
} from '../lib/dbService';
import { 
  ALL_CALYXO_FOODS, 
  searchCalyxoFoods 
} from '../lib/indianFoods';
import { 
  getMealSlotFromTime 
} from '../lib/calyxoFoodDiscoveryData';
import { 
  buildNormalizedDatabase, 
  getNormalizedDishes 
} from '../lib/calyxoFoodNormalizer';
import { getTodayDateString, formatDateToLocalString, isSameLocalDate } from '../utils/dateUtils';
import smartReminderEngine from '../services/notifications/SmartReminderEngine';
import CalendarDatePicker from './common/CalendarDatePicker';
import EnergyRing from '../design-system/components/EnergyRing';
import MacroPillTrack from '../design-system/components/MacroPillTrack';
import LivingMealTimeline from '../design-system/components/LivingMealTimeline';
import ContextualNutritionSheet from '../design-system/components/ContextualNutritionSheet';
import PrecisionPortionDrawer from './nutrition/PrecisionPortionDrawer';
import AIMealPlannerCard from './nutrition/AIMealPlannerCard';
import AIChatModal from './modals/AIChatModal';
import PremiumFeatureModal from './modals/PremiumFeatureModal.jsx';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Catalog' },
  { id: 'frequent', label: 'Staples' },
  { id: 'high_protein', label: 'High Protein' },
  { id: 'low_carb', label: 'Low Carb' },
  { id: 'indian', label: 'Indian' },
  { id: 'snacks', label: 'Snacks' }
];

export default function FoodTracker({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs);
  const addFoodLogStore = useStore(state => state.addFoodLog);
  const updateFoodLogStore = useStore(state => state.updateFoodLog);
  const deleteFoodLogStore = useStore(state => state.deleteFoodLog);
  const openWorkflow = useQuickActionsStore(state => state.openWorkflow);

  const userId = user?.uid || user?.id || getCurrentUserIdSync();
  const userName = userProfile?.firstName || userProfile?.nickname || userProfile?.name || 'Athlete';

  // Date Navigation State
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const isToday = isSameLocalDate(selectedDate, getTodayDateString());

  // Search & Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState(null);
  const [editingFoodLog, setEditingFoodLog] = useState(null);

  // Modals & Contextual Sheet State
  const [isContextSheetOpen, setIsContextSheetOpen] = useState(false);
  const [targetSlotForAdd, setTargetSlotForAdd] = useState('Lunch');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('timeline'); // 'timeline' | 'ai_planner'
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('AI Meal Planner');

  // Macro Targets from Profile
  const targetCals = userProfile?.dailyCalories || userProfile?.calorieGoal || 2000;
  const targetProt = userProfile?.proteinTarget || userProfile?.protein || 140;
  const targetCarbs = userProfile?.carbsTarget || userProfile?.carbs || 220;
  const targetFat = userProfile?.fatTarget || userProfile?.fat || 60;
  const favoriteFoods = userProfile?.favoriteFoods || [];

  const waterIntake = useStore(state => state.waterIntake || 0);
  const addWaterIntake = useStore(state => state.addWaterIntake);
  const waterTarget = userProfile?.waterTarget || userProfile?.waterGoal || 3000;

  // Filter logs for active selected date
  const selectedDateFoodLogs = useMemo(() => {
    return foodLogs.filter(item => isSameLocalDate(item.timestamp, selectedDate));
  }, [foodLogs, selectedDate]);

  // Aggregate Totals for active selected date
  const { totalCals, totalProt, totalCarbs, totalFat } = useMemo(() => {
    let c = 0, p = 0, cb = 0, f = 0;
    selectedDateFoodLogs.forEach(item => {
      c += (Number(item.calories) || 0);
      p += (Number(item.protein) || 0);
      cb += (Number(item.carbs) || 0);
      f += (Number(item.fat) || 0);
    });
    return {
      totalCals: Math.round(c),
      totalProt: Math.round(p * 10) / 10,
      totalCarbs: Math.round(cb * 10) / 10,
      totalFat: Math.round(f * 10) / 10
    };
  }, [selectedDateFoodLogs]);

  const remainingCals = Math.max(0, targetCals - totalCals);
  const remainingProt = Math.max(0, Math.round(targetProt - totalProt));
  const remainingProtein = remainingProt;
  const remainingCarbs = Math.max(0, Math.round(targetCarbs - totalCarbs));
  const remainingFat = Math.max(0, Math.round(targetFat - totalFat));

  const dietPref = (userProfile?.dietPreference || userProfile?.diet || 'non-veg').toLowerCase();

  const smartSuggestions = useMemo(() => {
    const isVeg = dietPref.includes('veg') && !dietPref.includes('non');
    const isVegan = dietPref.includes('vegan');

    if (isVegan) {
      return [
        { name: 'Firm Tofu (Sautéed)', protein: 16, calories: 140, carbs: 4, fat: 8, pieceWeight: 150, unitType: 'grams' },
        { name: 'Soya Chunks', protein: 21, calories: 145, carbs: 13, fat: 0.5, pieceWeight: 40, unitType: 'grams' },
        { name: 'Plant Protein Shake', protein: 24, calories: 130, carbs: 3, fat: 2, pieceWeight: 35, unitType: 'scoop' },
        { name: 'Cooked Yellow Dal', protein: 12, calories: 170, carbs: 24, fat: 3, pieceWeight: 200, unitType: 'bowl' }
      ];
    } else if (isVeg) {
      return [
        { name: 'Low-Fat Paneer', protein: 18, calories: 180, carbs: 3, fat: 11, pieceWeight: 100, unitType: 'grams' },
        { name: 'Greek Yogurt / Curd', protein: 15, calories: 120, carbs: 6, fat: 2, pieceWeight: 170, unitType: 'grams' },
        { name: 'Whey Protein Shake', protein: 24, calories: 120, carbs: 2, fat: 1.5, pieceWeight: 32, unitType: 'scoop' },
        { name: 'Dal Tadka / Moong Dal', protein: 12, calories: 175, carbs: 25, fat: 3, pieceWeight: 200, unitType: 'bowl' },
        { name: 'Soya Chunks', protein: 21, calories: 145, carbs: 13, fat: 0.5, pieceWeight: 40, unitType: 'grams' }
      ];
    } else {
      return [
        { name: 'Grilled Chicken Breast', protein: 31, calories: 165, carbs: 0, fat: 3.5, pieceWeight: 120, unitType: 'grams' },
        { name: 'Boiled Eggs (2 whole)', protein: 12, calories: 140, carbs: 1, fat: 10, pieceWeight: 100, unitType: 'serving' },
        { name: 'Whey Protein Shake', protein: 24, calories: 120, carbs: 2, fat: 1.5, pieceWeight: 32, unitType: 'scoop' },
        { name: 'Greek Yogurt', protein: 15, calories: 120, carbs: 6, fat: 2, pieceWeight: 170, unitType: 'grams' },
        { name: 'Low-Fat Paneer', protein: 18, calories: 180, carbs: 3, fat: 11, pieceWeight: 100, unitType: 'grams' }
      ];
    }
  }, [dietPref]);

  const handleQuickWater = async (amount) => {
    addWaterIntake(amount);
    try {
      await saveWaterIntake(userId, waterIntake + amount);
    } catch (e) {
      console.warn("Water save error", e);
    }
    if (onNotification) onNotification(`+${amount}ml water logged!`);
  };

  // Dynamic Greeting based on hour
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${userName}`;
    if (hour < 17) return `Good afternoon, ${userName}`;
    return `Good evening, ${userName}`;
  }, [userName]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      if (activeCategory === 'frequent') return favoriteFoods;
      if (activeCategory === 'high_protein') {
        return ALL_CALYXO_FOODS.filter(x => (x.protein || x.protPer100g || 0) >= 15).slice(0, 30);
      }
      if (activeCategory === 'low_carb') {
        return ALL_CALYXO_FOODS.filter(x => (x.carbs || x.carbsPer100g || 0) <= 10).slice(0, 30);
      }
      if (activeCategory === 'indian') {
        return ALL_CALYXO_FOODS.filter(x => x.cuisine === 'Indian' || x.region === 'India').slice(0, 30);
      }
      if (activeCategory === 'snacks') {
        return ALL_CALYXO_FOODS.filter(x => x.category === 'Snacks' || x.mealSlot === 'Snacks').slice(0, 30);
      }
      return ALL_CALYXO_FOODS.slice(0, 24);
    }
    return searchCalyxoFoods(searchQuery).slice(0, 30);
  }, [searchQuery, activeCategory, favoriteFoods]);

  // Date Controls
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

  // Open Contextual Sheet or Logger Modal for a specific slot
  const handleOpenSlotAdd = (slot = 'Lunch') => {
    setTargetSlotForAdd(slot);
    openWorkflow('log_meal', { date: selectedDate, slot });
  };

  // Delete Meal
  const handleDeleteMeal = async (logId) => {
    if (!logId) return;
    try {
      await deleteFoodLog(userId, logId);
      deleteFoodLogStore(logId);
      if (onNotification) onNotification("Meal log removed.");
    } catch (err) {
      console.error("Delete meal failed", err);
      if (onNotification) onNotification("Failed to delete meal.");
    }
  };

  // Quick Add Item with Normalized Portion
  const handleQuickAddFood = async (food, slot = targetSlotForAdd) => {
    if (!userId) return;

    let logTimestamp = Date.now();
    if (!isToday) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        logTimestamp = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0).getTime();
      }
    }

    const defaultWeight = food.pieceWeight || 100;
    const factor = defaultWeight / 100;
    const cals100 = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
    const prot100 = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
    const carbs100 = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);
    const fat100 = food.fatPer100g !== undefined ? food.fatPer100g : (food.fat || 0);

    const logEntry = {
      userId,
      name: food.displayName || food.originalName || food.name,
      calories: Math.round(cals100 * factor),
      protein: Number((prot100 * factor).toFixed(1)),
      carbs: Number((carbs100 * factor).toFixed(1)),
      fat: Number((fat100 * factor).toFixed(1)),
      portionWeight: defaultWeight,
      unitType: food.unitType || 'grams',
      mealSlot: slot,
      category: slot,
      mealType: slot,
      timestamp: logTimestamp
    };

    try {
      const saved = await addFoodLog(userId, logEntry);
      addFoodLogStore(saved);
      smartReminderEngine.suppressDailyNutritionReminder(userId);
      if (onNotification) onNotification(`Logged ${logEntry.name} to ${slot}`);
    } catch (err) {
      console.error("Quick add failed", err);
      if (onNotification) onNotification("Failed to log food.");
    }
  };

  // Custom Portion Drawer Save
  const handleSaveCustomPortion = async (customLog) => {
    if (!userId) return;

    let logTimestamp = Date.now();
    if (!isToday) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        logTimestamp = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0).getTime();
      }
    }

    const logEntry = {
      ...customLog,
      userId,
      mealType: customLog.mealSlot || targetSlotForAdd,
      category: customLog.mealSlot || targetSlotForAdd,
      timestamp: logTimestamp
    };

    try {
      const saved = await addFoodLog(userId, logEntry);
      addFoodLogStore(saved);
      setSelectedFoodForPortion(null);
      smartReminderEngine.suppressDailyNutritionReminder(userId);
      if (onNotification) onNotification(`Logged ${logEntry.name} to ${logEntry.mealSlot}`);
    } catch (err) {
      console.error("Save portion error", err);
      if (onNotification) onNotification("Failed to log custom portion.");
    }
  };

  // Log planned meal from AI Meal Planner Card directly into food logs
  const handleLogPlannedMeal = async (plannedMeal) => {
    if (!userId) return;

    let logTimestamp = Date.now();
    if (!isToday) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        logTimestamp = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0).getTime();
      }
    }

    const slot = plannedMeal.mealSlot || 'Lunch';
    const logEntry = {
      userId,
      name: plannedMeal.name,
      calories: Math.round(Number(plannedMeal.calories) || 0),
      protein: Number((Number(plannedMeal.protein) || 0).toFixed(1)),
      carbs: Number((Number(plannedMeal.carbs) || 0).toFixed(1)),
      fat: Number((Number(plannedMeal.fat) || 0).toFixed(1)),
      portionWeight: 100,
      unitType: 'serving',
      mealSlot: slot,
      category: slot,
      mealType: slot,
      timestamp: logTimestamp
    };

    try {
      const saved = await addFoodLog(userId, logEntry);
      addFoodLogStore(saved);
      smartReminderEngine.suppressDailyNutritionReminder(userId);
      if (onNotification) onNotification(`Logged ${logEntry.name} (${logEntry.calories} kcal) to ${slot}`);
    } catch (err) {
      console.error("Log planned meal error", err);
      if (onNotification) onNotification("Failed to log meal.");
    }
  };

  const handleQuickAdd = handleQuickAddFood;
  const handleCustomFoodSubmit = handleSaveCustomPortion;

  const formatDisplayDate = (dateStr) => {
    const todayStr = getTodayDateString();
    if (dateStr === todayStr) return "Today";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-3 sm:px-4 pt-3">
      {/* ─── TOP DATE & GREETING BAR ─── */}
      <div className="flex items-center justify-between gap-2 border-b border-card-border pb-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400 block truncate">
            {isToday ? "Today's Nutrition" : `Nutrition · ${formatDisplayDate(selectedDate)}`}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
            Fuel & Macros
          </h1>
        </div>

        {/* Date Navigator Controls */}
        <div className="shrink-0">
          <CalendarDatePicker
            selectedDate={selectedDate}
            onSelectDate={(newDate) => setSelectedDate(newDate)}
          />
        </div>
      </div>

      {/* ─── HERO: TODAY'S NUTRITION (SECTION 15 REDESIGN) ─── */}
      <div className="rounded-3xl bg-surface border border-card-border p-6 sm:p-7 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-muted block">
              CALORIC INTAKE
            </span>
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-1">
              {totalCals.toLocaleString()} <span className="text-lg sm:text-xl text-muted font-normal">/ {targetCals.toLocaleString()} kcal</span>
            </div>
          </div>
          <div className="text-xs text-muted font-mono">
            {remainingCals > 0 ? `${remainingCals.toLocaleString()} kcal remaining` : 'Daily calorie target met'}
          </div>
        </div>

        {/* Continuous Segmented Macro Bar */}
        <div className="space-y-3">
          <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden flex border border-card-border/60">
            <div
              style={{ width: `${Math.min(100, Math.round((totalProt * 4 / Math.max(1, targetCals)) * 100))}%` }}
              className="bg-emerald-400 h-full transition-all duration-500"
              title={`Protein: ${totalProt}g`}
            />
            <div
              style={{ width: `${Math.min(100, Math.round((totalCarbs * 4 / Math.max(1, targetCals)) * 100))}%` }}
              className="bg-sky-400 h-full transition-all duration-500"
              title={`Carbs: ${totalCarbs}g`}
            />
            <div
              style={{ width: `${Math.min(100, Math.round((totalFat * 9 / Math.max(1, targetCals)) * 100))}%` }}
              className="bg-amber-400 h-full transition-all duration-500"
              title={`Fat: ${totalFat}g`}
            />
          </div>

          {/* Clean Three-Column Macro Readout (Section 15) */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-card-border/40">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">Protein</span>
              <span className="text-base sm:text-lg font-black text-foreground font-mono block mt-0.5">
                {Math.round(totalProt)} <span className="text-xs text-muted font-normal">/ {targetProt}g</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-card-border/40">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400 block">Carbs</span>
              <span className="text-base sm:text-lg font-black text-foreground font-mono block mt-0.5">
                {Math.round(totalCarbs)} <span className="text-xs text-muted font-normal">/ {targetCarbs}g</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-elevated/40 border border-card-border/40">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">Fat</span>
              <span className="text-base sm:text-lg font-black text-foreground font-mono block mt-0.5">
                {Math.round(totalFat)} <span className="text-xs text-muted font-normal">/ {targetFat}g</span>
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button: + LOG FOOD */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setIsContextSheetOpen(true)}
            className="flex-1 py-4 rounded-2xl bg-foreground text-background font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-emerald-400 hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] border-none"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Log Food</span>
          </button>

          <button
            onClick={() => setActiveSubTab(activeSubTab === 'timeline' ? 'ai_planner' : 'timeline')}
            className={`px-5 py-4 rounded-2xl border text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'ai_planner'
                ? 'bg-emerald-400 text-black border-emerald-400 shadow-sm'
                : 'bg-surface border-card-border text-foreground hover:border-card-border/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeSubTab === 'ai_planner' ? 'Timeline' : 'AI Plan'}</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT: TIMELINE OR AI PLANNER ─── */}
      {activeSubTab === 'timeline' ? (
        <div className="space-y-6">
          {/* ─── SECTION 34: NUTRITION INTELLIGENCE CARD ─── */}
          <div className="rounded-3xl bg-surface border border-card-border p-5 space-y-4 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/60 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-accent block">
                  Nutrition Intelligence
                </span>
                <h3 className="text-sm sm:text-base font-black text-foreground">
                  {remainingProt > 0 || remainingCals > 0 ? (
                    <span>
                      You need: <span className="text-accent">+{remainingProt}g protein</span>
                      {remainingCals > 0 && <span className="text-muted ml-2">· +{remainingCals} kcal</span>}
                    </span>
                  ) : (
                    <span className="text-accent flex items-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[3]" /> Daily Macro Targets Reached!
                    </span>
                  )}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-muted uppercase font-bold px-2.5 py-1 rounded-full bg-surface-elevated border border-card-border">
                Diet: {dietPref}
              </span>
            </div>

            {/* Smart Suggestions Chips */}
            {remainingProt > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Suggested high-protein sources to close your target:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {smartSuggestions.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl bg-surface-elevated border border-card-border/80 flex items-center justify-between gap-3 hover:border-accent/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-muted">
                          <span className="text-accent font-bold">+{item.protein}g P</span>
                          <span>·</span>
                          <span>{item.calories} kcal</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickAddFood(item, targetSlotForAdd)}
                        className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-wider border-none cursor-pointer hover:brightness-110 active:scale-95 shrink-0 shadow-xs"
                      >
                        + Log
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── SECTION 35: HYDRATION QUICK TRACKER ─── */}
          <div className="rounded-3xl bg-surface border border-card-border p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                  <Droplets className="w-4 h-4 fill-cyan-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 block">
                    Hydration
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-foreground font-mono">
                      {(waterIntake / 1000).toFixed(1)}L
                    </span>
                    <span className="text-xs text-muted font-mono">/ {(waterTarget / 1000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>

              {/* 6 Droplet Indicators */}
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const isFilled = (waterIntake / waterTarget) >= (idx + 1) / 6;
                  return (
                    <div 
                      key={idx}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isFilled 
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.5)]' 
                          : 'bg-surface-elevated border border-card-border text-muted/40'
                      }`}
                    >
                      <Droplets className={`w-3 h-3 ${isFilled ? 'fill-slate-950' : ''}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-2">
              {[250, 500, 750].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickWater(amt)}
                  className="flex-1 py-2.5 rounded-2xl bg-surface-elevated hover:bg-cyan-500/15 border border-card-border hover:border-cyan-500/30 text-xs font-mono font-bold text-foreground transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{amt}ml</span>
                </button>
              ))}
            </div>
          </div>

          {/* Living Daily Meals Timeline */}
          <LivingMealTimeline
            foodLogs={selectedDateFoodLogs}
            onOpenAddModal={handleOpenSlotAdd}
            onEditFoodLog={setEditingFoodLog}
            onDeleteFoodLog={handleDeleteMeal}
          />

          {/* ─── FAST STAPLES CATALOG & OMNI SEARCH ─── */}
          <section className="rounded-3xl bg-surface border border-card-border p-5 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-accent block">
                  Quick Catalog
                </span>
                <h3 className="text-sm sm:text-base font-black text-foreground">Search & Log Verified Foods</h3>
              </div>
              <span className="text-[10px] font-mono text-muted">
                Adding to <strong className="text-accent uppercase">{targetSlotForAdd}</strong>
              </span>
            </div>

            {/* Omni Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chicken, paneer, eggs, oats, dosa, rice..."
                className="w-full bg-surface-subtle text-foreground border border-card-border focus:border-accent rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                      : 'bg-surface-subtle border-card-border text-secondary hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Fast Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 max-h-96 overflow-y-auto pr-1">
              {searchResults.map((food, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-surface-subtle border border-card-border/70 hover:border-card-border transition-all flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {food.displayName || food.originalName || food.name}
                    </span>
                    <span className="text-[10px] font-mono text-secondary">
                      {food.calories || food.calsPer100g} kcal · P: {food.protein || food.protPer100g}g
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedFoodForPortion(food)}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-interactive text-secondary hover:text-foreground text-[10px] font-mono font-bold transition-colors cursor-pointer border border-card-border shadow-xs"
                      title="Adjust portion & grams"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddFood(food)}
                      className="px-2.5 py-1.5 rounded-lg bg-accent hover:brightness-110 text-accent-foreground text-[10px] font-black uppercase tracking-wider transition-transform active:scale-95 cursor-pointer border-none shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* AI Meal Planner & Diet Intelligence Tab */
        <AIMealPlannerCard
          userProfile={userProfile}
          onLogMeal={handleLogPlannedMeal}
          onNotification={onNotification}
          onOpenUpgradeModal={(feature) => {
            setPremiumFeatureName(feature || 'AI Meal Planner');
            setIsPremiumModalOpen(true);
          }}
        />
      )}

      {/* ─── CONTEXTUAL NUTRITION ACTION SHEET ─── */}
      <ContextualNutritionSheet
        isOpen={isContextSheetOpen}
        onClose={() => setIsContextSheetOpen(false)}
        remainingProtein={remainingProtein}
        onOpenAISuggestions={() => setIsAIChatOpen(true)}
        onSelectAction={(actionId) => {
          if (actionId === 'log_meal') {
            openWorkflow('log_meal', { date: selectedDate, slot: targetSlotForAdd });
          } else if (actionId === 'search_catalog') {
            window.scrollTo({ top: 600, behavior: 'smooth' });
          } else if (actionId === 'scan_food') {
            if (onNotification) onNotification("AI Food Scanner is launching camera lens...");
          } else if (actionId === 'macro_calc') {
            setIsAIChatOpen(true);
          }
        }}
      />

      {/* ─── PRECISION PORTION DRAWER ─── */}
      {selectedFoodForPortion && (
        <PrecisionPortionDrawer
          food={selectedFoodForPortion}
          isOpen={Boolean(selectedFoodForPortion)}
          onClose={() => setSelectedFoodForPortion(null)}
          onLogPortion={handleSaveCustomPortion}
          initialSlot={targetSlotForAdd}
        />
      )}

      {/* ─── AI CHAT MODAL ─── */}
      {isAIChatOpen && (
        <AIChatModal
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
          initialPrompt={remainingProtein > 0 ? `I have ${remainingProtein}g of protein remaining today. Can you suggest 3 quick high-protein dinner options?` : "Analyze today's nutrition"}
        />
      )}

      {/* ─── PREMIUM UPGRADE MODAL ─── */}
      <PremiumFeatureModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        featureName={premiumFeatureName}
      />
    </div>
  );
}
