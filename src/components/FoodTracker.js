import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, X, Utensils, Sparkles, Star, Zap,
  Calendar, ChevronLeft, ChevronRight, History, SlidersHorizontal
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
  getCurrentUserIdSync 
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

  const remainingProtein = Math.max(0, targetProt - totalProt);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-3 sm:px-4 pt-3">
      {/* ─── TOP DATE & GREETING BAR ─── */}
      <div className="flex items-center justify-between gap-2 border-b border-card-border pb-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-accent block truncate">
            Calyxo Nutrition OS
          </span>
          <h1 className="text-sm sm:text-lg font-black text-foreground tracking-tight truncate">
            {greetingText}
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

      {/* ─── HERO: TODAY'S NUTRITIONAL STATE ─── */}
      <div className="rounded-3xl bg-surface border border-card-border p-5 sm:p-6 overflow-hidden shadow-card space-y-6 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Energy Ring Gauge */}
          <div className="flex items-center justify-center shrink-0">
            <EnergyRing
              consumed={totalCals}
              target={targetCals}
              size={190}
              strokeWidth={14}
            />
          </div>

          {/* Macro Progress Tracks */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MacroPillTrack
              label="Protein"
              consumed={totalProt}
              target={targetProt}
              unit="g"
              color="#16A34A"
              secondaryColor="#059669"
            />
            <MacroPillTrack
              label="Carbs"
              consumed={totalCarbs}
              target={targetCarbs}
              unit="g"
              color="#0284C7"
              secondaryColor="#2563EB"
            />
            <MacroPillTrack
              label="Fat"
              consumed={totalFat}
              target={targetFat}
              unit="g"
              color="#D97706"
              secondaryColor="#DC2626"
            />
          </div>
        </div>

        {/* Primary Action Row: + Add Food & AI Advice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-card-border pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab(activeSubTab === 'timeline' ? 'ai_planner' : 'timeline')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                activeSubTab === 'ai_planner'
                  ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                  : 'bg-surface-subtle border-card-border text-secondary hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {activeSubTab === 'ai_planner' ? 'View Daily Stream' : 'AI Meal Planner'}
              </span>
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsContextSheetOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-accent/20 transition-all cursor-pointer border-none"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Food to Day</span>
          </motion.button>
        </div>
      </div>

      {/* ─── MAIN CONTENT: TIMELINE OR AI PLANNER ─── */}
      {activeSubTab === 'timeline' ? (
        <div className="space-y-6">
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
