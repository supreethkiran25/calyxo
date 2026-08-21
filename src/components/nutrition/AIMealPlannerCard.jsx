import React, { useState } from 'react';
import { Sparkles, UtensilsCrossed, ShoppingBag, CheckCircle2, ChevronRight, RefreshCw, Flame, ArrowRight, Lock } from 'lucide-react';
import { AIMealPlannerEngine } from '../../services/ai/AIMealPlannerEngine.js';
import { AdvancedFoodIntelligenceEngine } from '../../services/ai/AdvancedFoodIntelligenceEngine.js';
import { SubscriptionManager, AI_CAPABILITIES } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function AIMealPlannerCard({
  userProfile = {},
  onOpenUpgradeModal,
  onLogMeal
}) {
  const isPremium = SubscriptionManager.isPremium(userProfile);
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'range_estimator' | 'grocery'
  const [dietType, setDietType] = useState('nonveg');
  const [goal, setGoal] = useState('muscle_gain');
  
  // Natural language range estimator state
  const [nlQuery, setNlQuery] = useState('2 masala dosas and one filter coffee');
  const [nlResult, setNlResult] = useState(() => 
    AdvancedFoodIntelligenceEngine.estimateNaturalLanguageMeal('2 masala dosas and one filter coffee')
  );

  // Meal plan state
  const [mealPlan, setMealPlan] = useState(() =>
    AIMealPlannerEngine.generateMealPlan({
      goal: 'muscle_gain',
      dietType: 'nonveg',
      targetCalories: Number(userProfile.dailyCalories || 2200),
      targetProtein: Number(userProfile.proteinTarget || 140)
    })
  );

  const handleRegeneratePlan = (newDiet = dietType, newGoal = goal) => {
    const plan = AIMealPlannerEngine.generateMealPlan({
      goal: newGoal,
      dietType: newDiet,
      targetCalories: Number(userProfile.dailyCalories || 2200),
      targetProtein: Number(userProfile.proteinTarget || 140)
    });
    setMealPlan(plan);
  };

  const handleEstimateNL = () => {
    if (!nlQuery.trim()) return;
    const res = AdvancedFoodIntelligenceEngine.estimateNaturalLanguageMeal(nlQuery);
    setNlResult(res);
  };

  return (
    <div className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> AI NUTRITION INTELLIGENCE
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal('AI Nutrition Intelligence')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Dynamic Meal Architecture & Intelligence
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Caloric range estimates, macro-matched Indian meal plans, and automated grocery lists.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'planner'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Meal Planner
          </button>
          <button
            onClick={() => setActiveTab('range_estimator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'range_estimator'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Range Estimator
          </button>
          <button
            onClick={() => setActiveTab('grocery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'grocery'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Grocery List
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: MEAL PLANNER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'planner' && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Diet:</span>
              {['nonveg', 'veg', 'egg'].map(d => (
                <button
                  key={d}
                  onClick={() => {
                    setDietType(d);
                    handleRegeneratePlan(d, goal);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                    dietType === d
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleRegeneratePlan(dietType, goal)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer border-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Day</span>
            </button>
          </div>

          {/* Planned Day Meals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(mealPlan.meals || {}).map(([slot, meal]) => (
              <div
                key={slot}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {slot.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {meal.cals} kcal · {meal.protein}g protein
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{meal.name}</h4>
                <p className="text-[11px] text-gray-400">{meal.portion}</p>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <span className="text-[10px] text-gray-500">Carbs: {meal.carbs}g · Fat: {meal.fat}g</span>
                  <button
                    onClick={() => {
                      if (!isPremium) {
                        onOpenUpgradeModal('AI Meal 1-Click Logging');
                        return;
                      }
                      if (onLogMeal) {
                        onLogMeal({
                          name: meal.name,
                          calories: meal.cals,
                          protein: meal.protein,
                          carbs: meal.carbs,
                          fat: meal.fat,
                          mealSlot: slot.toLowerCase().includes('break') ? 'breakfast' : slot.toLowerCase().includes('lunch') ? 'lunch' : slot.toLowerCase().includes('pre') ? 'snacks' : 'dinner'
                        });
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer bg-transparent border-none"
                  >
                    <span>Log to Diary</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Totals Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                TARGET TOTALS
              </span>
              <p className="text-xs text-gray-300">
                {mealPlan.totals.calories} kcal ({mealPlan.totals.protein}g Protein · {mealPlan.totals.carbs}g Carbs · {mealPlan.totals.fat}g Fat)
              </p>
            </div>

            <button
              onClick={() => setActiveTab('grocery')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 border-none shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Generate Grocery List</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: ADVANCED FOOD RANGE ESTIMATOR (Feature 7)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'range_estimator' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300">
              Natural Language Food Estimation (Honest Uncertainty Ranges)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nlQuery}
                onChange={e => setNlQuery(e.target.value)}
                placeholder="e.g. 2 masala dosas and one filter coffee"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                onClick={handleEstimateNL}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer border-none"
              >
                Estimate
              </button>
            </div>
          </div>

          {nlResult && nlResult.success && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    CALIBRATED MEAL ESTIMATE
                  </span>
                  <h4 className="text-2xl font-black text-white tracking-tight mt-0.5">
                    {nlResult.displayRange}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Protein: {nlResult.protein.min}–{nlResult.protein.max}g
                  </span>
                  <p className="text-[10px] text-gray-500">Carbs: {nlResult.carbs.min}–{nlResult.carbs.max}g · Fat: {nlResult.fat.min}–{nlResult.fat.max}g</p>
                </div>
              </div>

              {/* Matched Entities */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  Component Breakdown
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {nlResult.matchedEntities.map((ent, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <span className="text-xs text-white font-medium">{ent.count}x {ent.food}</span>
                      <span className="text-xs font-mono text-amber-400 font-bold">{ent.estimatedRange}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                {nlResult.note}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: AUTOMATED GROCERY LIST
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'grocery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">
              Categorized Ingredients for Tomorrow's Plan
            </span>
            <span className="text-[11px] text-gray-500 font-mono">
              Auto-Compiled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(mealPlan.groceryList || {}).map(([category, items]) => (
              <div key={category} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {category.replace(/([A-Z])/g, ' $1')}
                </span>
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
