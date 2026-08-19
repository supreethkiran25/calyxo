import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, Save, RefreshCw, Search, Sparkles, Scale, Utensils, Zap, Check } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { addFoodLog, getCurrentUserId, getCurrentUserIdSync } from '../../lib/dbService';
import { searchCalyxoFoods, POPULAR_STAPLES } from '../../lib/indianFoods';
import { formatNutritionValue } from '../../utils/macroCalculator';

export default function MealLoggerModal() {
  const { activeWorkflow, workflowData, closeWorkflow } = useQuickActionsStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  const user = useStore(state => state.user);
  const addFoodLogStore = useStore(state => state.addFoodLog);
  const inputRef = useRef(null);

  const [mealName, setMealName] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Serving quantity & portion unit state
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState('piece'); // 'grams' | 'piece' | 'bowl' | 'cup' | 'scoop' | 'tbsp' | 'tsp' | 'slice'

  // Calculated macros state
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle workflow opening and initial data
  useEffect(() => {
    if (activeWorkflow === 'log_meal') {
      setSavedSuccess(false);
      if (workflowData?.initialFood) {
        selectSuggestion(workflowData.initialFood);
      } else {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } else {
      // Reset state when closed
      setMealName('');
      setSelectedFood(null);
      setQuantity(1);
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setSuggestions([]);
      setShowDropdown(false);
      setSavedSuccess(false);
    }
  }, [activeWorkflow, workflowData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (activeWorkflow !== 'log_meal') return null;

  const handleNameChange = (name) => {
    setMealName(name);
    if (!name.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    
    const matches = searchCalyxoFoods(name, 12);
    setSuggestions(matches);
    setShowDropdown(matches.length > 0);
  };

  const selectSuggestion = (food) => {
    const displayName = food.displayName || food.name;
    setMealName(displayName);
    setSelectedFood(food);
    setShowDropdown(false);
    
    const targetUnit = food.unitType || 'piece';
    setUnitType(targetUnit);
    setQuantity(1);
    
    recalculateMacros(food, 1, targetUnit);
  };

  const recalculateMacros = (food, qty, unit) => {
    if (!food) return;
    
    let baseWeightInGrams = 100;
    const qVal = parseFloat(qty) || 0;
    
    if (unit === 'grams') {
      baseWeightInGrams = qVal;
    } else {
      const perUnitWeight = food.pieceWeight || 100;
      baseWeightInGrams = qVal * perUnitWeight;
    }

    const factor = baseWeightInGrams / 100;
    const calsPer100 = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
    const protPer100 = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
    const carbsPer100 = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);
    const fatPer100 = food.fatPer100g !== undefined ? food.fatPer100g : (food.fat || 0);
    
    setCalories(Math.round(calsPer100 * factor).toString());
    setProtein(formatNutritionValue(protPer100 * factor));
    setCarbs(formatNutritionValue(carbsPer100 * factor));
    setFat(formatNutritionValue(fatPer100 * factor));
  };

  const handleQuantityChange = (newQty) => {
    if (newQty === '' || newQty === null || newQty === undefined) {
      setQuantity('');
      if (selectedFood) {
        recalculateMacros(selectedFood, 0, unitType);
      }
      return;
    }
    const parsed = parseFloat(newQty);
    if (isNaN(parsed)) {
      setQuantity('');
      if (selectedFood) {
        recalculateMacros(selectedFood, 0, unitType);
      }
    } else {
      setQuantity(newQty);
      if (selectedFood) {
        recalculateMacros(selectedFood, Math.max(0, parsed), unitType);
      }
    }
  };

  const handleUnitChange = (newUnit) => {
    setUnitType(newUnit);
    if (selectedFood) {
      const qVal = parseFloat(quantity) || 0;
      recalculateMacros(selectedFood, qVal, newUnit);
    }
  };

  const handleSaveMeal = async () => {
    if (!mealName || !mealName.trim()) return;

    setIsSaving(true);
    try {
      const uid = user?.uid || user?.id || getCurrentUserIdSync() || (await getCurrentUserId());
      if (!uid) {
        console.warn("No active user ID found for meal logging");
        return;
      }

      const calsNum = calories !== '' && !isNaN(Number(calories))
        ? Math.round(Number(calories))
        : Math.round((Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fat) || 0) * 9);

      let portionWeightGrams = 100;
      if (unitType === 'grams') {
        portionWeightGrams = Math.round(Number(quantity) || 100);
      } else {
        const pieceWeight = selectedFood?.pieceWeight || 100;
        portionWeightGrams = Math.round(pieceWeight * (Number(quantity) || 1));
      }

      const logEntry = {
        userId: uid,
        name: mealName.trim(),
        calories: calsNum,
        protein: Math.round((parseFloat(protein) || 0) * 10) / 10,
        carbs: Math.round((parseFloat(carbs) || 0) * 10) / 10,
        fat: Math.round((parseFloat(fat) || 0) * 10) / 10,
        portionWeight: portionWeightGrams,
        unitType: unitType,
        timestamp: Date.now()
      };

      const savedItem = await addFoodLog(uid, logEntry);
      addFoodLogStore(savedItem);

      // Award XP for meal logging
      addXP(50);

      // Update nutrition streak
      updateStreaks({ nutritionStreak: (useEcosystemStore.getState().streaks.nutritionStreak || 0) + 1 });

      setSavedSuccess(true);
      setTimeout(() => {
        closeWorkflow();
      }, 500);
    } catch (error) {
      console.error("Error saving meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-safe">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={closeWorkflow}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-surface border border-card-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-500" /> Log Meal & Portion
            </h2>
            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {/* Search Food Name Input */}
            <div ref={dropdownRef} className="relative">
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Search 11,000+ Food Items</span>
                <span className="text-[10px] text-green-500 font-bold lowercase">rice, roti, eggs, chicken, oats...</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Type any food name (e.g. Rice, Biryani, Roti, Eggs, Oats)..." 
                  value={mealName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-9 py-2.5 rounded-xl focus:outline-none focus:border-green-500 text-sm shadow-inner font-bold placeholder:text-muted/60"
                />
                {mealName && (
                  <button
                    type="button"
                    onClick={() => { setMealName(''); setSuggestions([]); setShowDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer bg-transparent border-none p-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Matching Food Dataset Dropdown */}
              <AnimatePresence>
                {showDropdown && suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-card-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
                  >
                    <div className="px-3.5 py-1.5 bg-surface/90 border-b border-card-border text-[9px] font-black uppercase tracking-wider text-muted flex justify-between sticky top-0 backdrop-blur-md z-10">
                      <span>Matching Foods ({suggestions.length} results)</span>
                      <span className="text-green-500">Tap to Select</span>
                    </div>
                    {suggestions.map((item, idx) => {
                      const itemTitle = item.displayName || item.name;
                      const cals = item.calsPer100g !== undefined ? item.calsPer100g : (item.calories || 0);
                      const prot = item.protPer100g !== undefined ? item.protPer100g : (item.protein || 0);
                      const carbsVal = item.carbsPer100g !== undefined ? item.carbsPer100g : (item.carbs || 0);
                      const fatVal = item.fatPer100g !== undefined ? item.fatPer100g : (item.fat || 0);

                      return (
                        <div 
                          key={item.id || idx}
                          onClick={() => selectSuggestion(item)}
                          className="px-3.5 py-2.5 hover:bg-green-500/10 hover:border-green-500/20 cursor-pointer flex justify-between items-center text-xs border-b border-card-border/40 last:border-b-0 transition-colors group"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-bold text-foreground group-hover:text-green-400 truncate">
                              {itemTitle}
                            </span>
                            <span className="text-[10px] text-muted font-medium mt-0.5">
                              {Math.round(cals)} kcal/100g • <span className="text-blue-400 font-semibold">{prot}g P</span> • <span className="text-amber-400 font-semibold">{carbsVal}g C</span> • <span className="text-red-400 font-semibold">{fatVal}g F</span> {item.category ? `• ${item.category}` : ''}
                            </span>
                          </div>
                          <span className="text-[9px] text-green-500 font-extrabold uppercase shrink-0 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md group-hover:bg-green-500 group-hover:text-black transition-colors">
                            Select
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Popular Staples Chips (Shown when not typing or when quick adding) */}
            {!mealName.trim() && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-green-400" /> Popular Staples (1-Tap Select)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_STAPLES.map((staple) => (
                    <button
                      key={staple.id}
                      type="button"
                      onClick={() => selectSuggestion(staple)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface/70 border border-card-border text-[11px] font-bold text-foreground hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{staple.name}</span>
                      <span className="text-[9px] text-muted font-normal">({staple.calsPer100g} kcal)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* PORTION SIZE & SERVING UNIT SELECTOR */}
            <div className="bg-surface/60 border border-card-border p-4 rounded-2xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-green-500" /> Portion Eaten
                </label>
                <span className="text-[10px] text-muted font-bold">Auto-calculates macros</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted mb-1 block">Quantity</span>
                  <input 
                    type="number"
                    min="0"
                    step="any"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl text-sm font-black focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted mb-1 block">Serving Unit</span>
                  <select
                    value={unitType}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-green-500"
                  >
                    <option value="piece">Pieces / Items (Eggs, Roti, Dosa)</option>
                    <option value="bowl">Bowls (Rice, Biryani, Curry, Dal)</option>
                    <option value="grams">Grams (Exact weight)</option>
                    <option value="cup">Cups (Milk, Curd, Yogurt)</option>
                    <option value="scoop">Scoops (Protein powder)</option>
                    <option value="slice">Slices (Bread, Cheese)</option>
                    <option value="tbsp">Tablespoons (Peanut butter, Oil)</option>
                    <option value="tsp">Teaspoons (Ghee, Butter)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TOTAL CALORIES */}
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
                Total Calories (kcal)
              </label>
              <input 
                type="number" 
                placeholder="Auto-calculated (e.g. 250)" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-4 py-2.5 rounded-xl text-sm font-black focus:outline-none focus:border-green-500"
              />
            </div>

            {/* MACROS BREAKDOWN */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-blue-500/5 border border-blue-500/20 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Protein (g)</span>
                <input 
                  type="number" 
                  placeholder="20"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg text-xs font-mono text-center font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Carbs (g)</span>
                <input 
                  type="number" 
                  placeholder="30"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg text-xs font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Fat (g)</span>
                <input 
                  type="number" 
                  placeholder="8"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg text-xs font-mono text-center font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button 
            type="button"
            onClick={handleSaveMeal}
            disabled={isSaving || !mealName || !mealName.trim() || savedSuccess}
            className="w-full mt-4 py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-none"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" /> Logged Successfully!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Food & Portion Log
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
