import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Utensils, ShoppingBag, CheckCircle2, RefreshCw, Calculator, DollarSign, Lock, AlertCircle, ArrowRight, IndianRupee } from 'lucide-react';
import { AIMealPlannerEngine } from '../../services/ai/AIMealPlannerEngine.js';
import { AdvancedFoodIntelligenceEngine } from '../../services/ai/AdvancedFoodIntelligenceEngine.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function AIMealPlannerCard({
  userProfile = {},
  onLogMeal = () => {},
  onOpenUpgradeModal = () => {}
}) {
  const isPremium = SubscriptionManager.isPremium(userProfile);
  const [activeTab, setActiveTab] = useState('planner'); // 'planner' | 'range_estimator' | 'grocery'
  const [dietType, setDietType] = useState(userProfile.dietPreference || 'nonveg');
  const [goal, setGoal] = useState(userProfile.goal || 'muscle_gain');
  const [budgetINR, setBudgetINR] = useState(350);

  // Natural Language range estimation query state
  const [nlQuery, setNlQuery] = useState('2 masala dosas and one filter coffee');
  const [nlResult, setNlResult] = useState(() => 
    AdvancedFoodIntelligenceEngine.estimateNaturalLanguageMeal('2 masala dosas and one filter coffee')
  );

  // Meal plan state
  const [mealPlan, setMealPlan] = useState(() =>
    AIMealPlannerEngine.generateMealPlan({
      goal: userProfile.goal || 'muscle_gain',
      dietType: userProfile.dietPreference || 'nonveg',
      targetCalories: Number(userProfile.dailyCalories || 2200),
      targetProtein: Number(userProfile.proteinTarget || 140),
      budgetInRupees: 350
    })
  );

  const [loggedSlots, setLoggedSlots] = useState({});
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegeneratePlan = (newDiet = dietType, newGoal = goal, currentBudget = budgetINR) => {
    setIsRegenerating(true);
    setTimeout(() => {
      const plan = AIMealPlannerEngine.generateMealPlan({
        goal: newGoal,
        dietType: newDiet,
        targetCalories: Number(userProfile.dailyCalories || 2200),
        targetProtein: Number(userProfile.proteinTarget || 140),
        budgetInRupees: currentBudget
      });
      setMealPlan(plan);
      setLoggedSlots({});
      setIsRegenerating(false);
    }, 200);
  };

  const handleEstimateNL = () => {
    if (!nlQuery.trim()) return;
    const res = AdvancedFoodIntelligenceEngine.estimateNaturalLanguageMeal(nlQuery);
    setNlResult(res);
  };

  return (
    <div className="w-full bg-surface border border-card-border rounded-3xl p-5 sm:p-7 shadow-card space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-accent uppercase flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-accent" /> AI NUTRITION & INDIAN MARKET MEALS
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal?.('AI Nutrition Intelligence')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
            Dynamic Meal Architecture & Budget Grocery
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Calorie estimates, macro-balanced Indian meal plans, and real-world INR (₹) grocery pricing.
          </p>
        </div>

        {/* Sub-tabs */}
        {isPremium && (
          <div className="flex items-center p-1 bg-surface-subtle border border-card-border/60 rounded-xl self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              Meal Planner
            </button>
            <button
              onClick={() => setActiveTab('range_estimator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'range_estimator'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              Range Estimator
            </button>
            <button
              onClick={() => setActiveTab('grocery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'grocery'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-secondary hover:text-foreground'
              }`}
            >
              Budget Grocery
            </button>
          </div>
        )}
      </div>

      {!isPremium ? (
        <div className="relative rounded-2xl overflow-hidden border border-lime-500/20 bg-gradient-to-b from-[#12121A] to-[#0A0A10] p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center mx-auto text-lime-400">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-base sm:text-lg font-black text-white">Unlock AI Nutrition & Grocery Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-generate nutrient-timed daily meal plans customized to your target calories ({userProfile?.dailyCalories || 2200} kcal), natural language dish estimation, and budget grocery lists with Indian market item costs.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenUpgradeModal?.('AI Nutrition Intelligence')}
              className="px-6 py-3 rounded-2xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#CCFF00]/15 cursor-pointer border-none"
            >
              ✨ Unlock with Calyxo High
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* TAB 1: MEAL PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-surface-subtle border border-card-border/60 rounded-2xl">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-secondary font-medium mr-1">Diet:</span>
              {[
                { id: 'nonveg', label: 'Non-Veg' },
                { id: 'veg', label: 'Vegetarian' },
                { id: 'egg', label: 'Eggitarian' }
              ].map(({ id: d, label }) => (
                <button
                  key={d}
                  onClick={() => {
                    setDietType(d);
                    handleRegeneratePlan(d, goal, budgetINR);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    dietType === d
                      ? 'bg-accent text-accent-foreground shadow-xs'
                      : 'text-secondary hover:text-foreground bg-surface border border-card-border'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleRegeneratePlan(dietType, goal, budgetINR)}
              className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-interactive active:scale-95 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-card-border shadow-xs shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-accent ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Day</span>
            </button>
          </div>

          {/* Planned Day Meals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.entries(mealPlan.meals || {}).map(([slot, meal]) => {
              const isLogged = Boolean(loggedSlots[slot]);
              const formattedSlot = slot.toLowerCase().includes('break') 
                ? 'Breakfast' 
                : slot.toLowerCase().includes('lunch') 
                ? 'Lunch' 
                : (slot.toLowerCase().includes('pre') || slot.toLowerCase().includes('snack')) 
                ? 'Snacks' 
                : 'Dinner';

              return (
                <div
                  key={slot}
                  className="p-4 rounded-2xl bg-surface-subtle border border-card-border hover:border-accent/40 transition-all space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-accent font-mono">
                      {slot.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {meal.cals} kcal · {meal.protein}g protein
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-foreground leading-snug">{meal.name}</h4>
                  <p className="text-[11px] text-secondary">{meal.portion}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-card-border/60">
                    <span className="text-[10px] text-muted">Carbs: {meal.carbs}g · Fat: {meal.fat}g</span>
                    <button
                      onClick={() => {
                        if (onLogMeal) {
                          onLogMeal({
                            name: meal.name,
                            calories: meal.cals,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            fat: meal.fat,
                            mealSlot: formattedSlot
                          });
                          setLoggedSlots(prev => ({ ...prev, [slot]: true }));
                        }
                      }}
                      className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none transition-colors ${
                        isLogged ? 'text-emerald-400 font-semibold' : 'text-accent hover:underline'
                      }`}
                    >
                      {isLogged ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Logged ✓</span>
                        </>
                      ) : (
                        <>
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Log to Diary</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Summary Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-subtle border border-card-border shadow-xs">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground">
                Total Planned: <span className="font-mono text-accent">{mealPlan.totals?.calories} kcal</span> ({mealPlan.totals?.protein}g Protein)
              </span>
              <p className="text-[11px] text-secondary">
                Estimated Day Grocery Value: ~₹{mealPlan.estimatedCostINR || 280} (₹{mealPlan.costPerGramProteinINR || '1.80'}/g protein)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onLogMeal && mealPlan.meals) {
                    Object.entries(mealPlan.meals).forEach(([slot, meal]) => {
                      const formattedSlot = slot.toLowerCase().includes('break') 
                        ? 'Breakfast' 
                        : slot.toLowerCase().includes('lunch') 
                        ? 'Lunch' 
                        : (slot.toLowerCase().includes('pre') || slot.toLowerCase().includes('snack')) 
                        ? 'Snacks' 
                        : 'Dinner';
                      onLogMeal({
                        name: meal.name,
                        calories: meal.cals,
                        protein: meal.protein,
                        carbs: meal.carbs,
                        fat: meal.fat,
                        mealSlot: formattedSlot
                      });
                    });
                    const allLogged = {};
                    Object.keys(mealPlan.meals).forEach(k => { allLogged[k] = true; });
                    setLoggedSlots(allLogged);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-interactive text-foreground font-bold text-xs border border-card-border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Log All 4 Meals</span>
              </button>

              <button
                onClick={() => setActiveTab('grocery')}
                className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent/20 border-none shrink-0 hover:brightness-110 active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Budget Grocery</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RANGE ESTIMATOR */}
      {activeTab === 'range_estimator' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">
              Natural Language Food Estimation (Honest Uncertainty Ranges)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nlQuery}
                onChange={e => setNlQuery(e.target.value)}
                placeholder="e.g. 2 masala dosas and one filter coffee"
                className="flex-1 px-4 py-3 bg-surface-subtle border border-card-border rounded-2xl text-xs sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-all"
              />
              <button
                onClick={handleEstimateNL}
                className="px-5 py-3 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer border-none shadow-md shadow-accent/20 hover:brightness-110 active:scale-95"
              >
                Estimate
              </button>
            </div>
          </div>

          {nlResult && nlResult.success && (
            <div className="p-5 rounded-2xl bg-surface-subtle border border-card-border space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/60 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent font-mono">
                    CALIBRATED MEAL ESTIMATE
                  </span>
                  <h4 className="text-2xl font-black text-foreground tracking-tight mt-0.5">
                    {nlResult.displayRange}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-accent">
                    Protein: {nlResult.protein.min}–{nlResult.protein.max}g
                  </span>
                  <p className="text-[10px] text-muted font-mono">Carbs: {nlResult.carbs.min}–{nlResult.carbs.max}g · Fat: {nlResult.fat.min}–{nlResult.fat.max}g</p>
                </div>
              </div>

              {/* Matched Entities */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-secondary uppercase tracking-wide">
                  Component Breakdown
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {nlResult.matchedEntities.map((ent, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface border border-card-border flex items-center justify-between shadow-xs">
                      <span className="text-xs text-foreground font-medium">{ent.count}x {ent.food}</span>
                      <span className="text-xs font-mono text-accent font-bold">{ent.estimatedRange}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-foreground font-medium">
                {nlResult.note}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    if (onLogMeal && nlResult) {
                      const avgCal = Math.round((nlResult.calories.min + nlResult.calories.max) / 2);
                      const avgProt = Number(((nlResult.protein.min + nlResult.protein.max) / 2).toFixed(1));
                      const avgCarbs = Number(((nlResult.carbs.min + nlResult.carbs.max) / 2).toFixed(1));
                      const avgFat = Number(((nlResult.fat.min + nlResult.fat.max) / 2).toFixed(1));
                      onLogMeal({
                        name: nlQuery || 'Estimated Meal',
                        calories: avgCal,
                        protein: avgProt,
                        carbs: avgCarbs,
                        fat: avgFat,
                        mealSlot: 'Lunch'
                      });
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent/20 border-none hover:brightness-110 active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Log Estimated Meal to Diary</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUTOMATED BUDGET GROCERY LIST (INDIAN RUPEES) */}
      {activeTab === 'grocery' && (
        <div className="space-y-5">
          {/* Budget Selector & Custom Rupee Input */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border flex flex-col gap-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
                  Indian Market Budget Target
                </span>
                <h4 className="text-sm font-bold text-foreground mt-0.5">
                  Custom Rupee Budget & Protein Optimizer
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-secondary font-medium">Your Budget:</span>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs font-bold text-accent font-mono">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={budgetINR}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setBudgetINR(val);
                      if (val >= 20) {
                        handleRegeneratePlan(dietType, goal, val);
                      }
                    }}
                    className="w-24 pl-6 pr-2 py-1.5 rounded-xl bg-surface border border-card-border focus:border-accent text-foreground text-xs font-mono font-bold focus:outline-none"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-card-border/40">
              <span className="text-[11px] text-muted font-medium mr-1">Quick Select:</span>
              {[50, 100, 200, 350, 500, 800].map(b => (
                <button
                  key={b}
                  onClick={() => {
                    setBudgetINR(b);
                    handleRegeneratePlan(dietType, goal, b);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    budgetINR === b
                      ? 'bg-accent text-accent-foreground shadow-xs'
                      : 'bg-surface border border-card-border text-secondary hover:text-foreground'
                  }`}
                >
                  ₹{b}
                </button>
              ))}
            </div>
          </div>

          {/* Grocery Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(mealPlan.groceryList || {}).map(([category, items]) => (
              <div key={category} className="p-4 rounded-2xl bg-surface-subtle border border-card-border space-y-2.5 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-accent font-mono">
                  {category.replace(/([A-Z])/g, ' $1')}
                </span>
                <div className="space-y-1.5">
                  {items.length === 0 ? (
                    <p className="text-[11px] text-muted italic">Allocated to higher-priority staples</p>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-secondary p-1.5 rounded-lg bg-surface/40 border border-card-border/40">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="text-foreground font-medium">{item.split('—')[0]}</span>
                        </div>
                        <span className="text-accent font-mono font-bold">{item.split('—')[1] || ''}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary & Protein Packed Banner */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-secondary font-medium">
                Spent: <strong className="text-foreground font-mono">₹{mealPlan.estimatedCostINR || budgetINR}</strong> of <span className="font-mono">₹{budgetINR}</span>
              </span>
              {mealPlan.totalProteinPackedG > 0 && (
                <span className="text-emerald-400 font-bold font-mono">
                  • {mealPlan.totalProteinPackedG}g Protein Packed
                </span>
              )}
            </div>
            <span className="text-accent font-bold font-mono">
              ~₹{mealPlan.costPerGramProteinINR || '1.20'}/g Protein
            </span>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
