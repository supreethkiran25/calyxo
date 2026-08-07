import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, Save, RefreshCw, Search, Sparkles, Scale, Utensils, Camera, Zap } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { addFoodLog, getCurrentUserId } from '../../lib/dbService';
import { INDIAN_FOODS, searchCalyxoFoods } from '../../lib/indianFoods';
import FoodScanner from '../scan/FoodScanner';

const FOODS_CATALOG = [
  { name: "Chicken Biryani", unitType: "bowl", pieceWeight: 200, calsPer100g: 140, protPer100g: 9.3, carbsPer100g: 16, fatPer100g: 4.6 },
  { name: "Masala Dosa", unitType: "piece", pieceWeight: 120, calsPer100g: 208, protPer100g: 4.1, carbsPer100g: 35, fatPer100g: 5.8 },
  { name: "Plain Dosa", unitType: "piece", pieceWeight: 100, calsPer100g: 168, protPer100g: 3.8, carbsPer100g: 29, fatPer100g: 3.7 },
  { name: "Roti / Chapati", unitType: "piece", pieceWeight: 35, calsPer100g: 242, protPer100g: 8.5, carbsPer100g: 51, fatPer100g: 2.3 },
  { name: "Scrambled Eggs", unitType: "piece", pieceWeight: 50, calsPer100g: 140, protPer100g: 12, carbsPer100g: 1, fatPer100g: 10 },
  { name: "Boiled Egg", unitType: "piece", pieceWeight: 50, calsPer100g: 155, protPer100g: 12.6, carbsPer100g: 1.1, fatPer100g: 10.6 },
  { name: "Oatmeal (cooked)", unitType: "bowl", pieceWeight: 200, calsPer100g: 75, protPer100g: 3, carbsPer100g: 13.5, fatPer100g: 1.5 },
  { name: "Rolled Oats (raw)", unitType: "grams", pieceWeight: 30, calsPer100g: 389, protPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9 },
  { name: "Steamed White Rice", unitType: "bowl", pieceWeight: 200, calsPer100g: 130, protPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { name: "Grilled Chicken Breast", unitType: "grams", pieceWeight: 100, calsPer100g: 165, protPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { name: "Paneer Tikka", unitType: "grams", pieceWeight: 100, calsPer100g: 280, protPer100g: 18, carbsPer100g: 4, fatPer100g: 22 },
  { name: "Greek Yogurt", unitType: "cup", pieceWeight: 150, calsPer100g: 76, protPer100g: 14, carbsPer100g: 5.3, fatPer100g: 0 },
  { name: "Whey Protein Shake", unitType: "scoop", pieceWeight: 30, calsPer100g: 400, protPer100g: 80, carbsPer100g: 10, fatPer100g: 5 },
  { name: "Almonds", unitType: "grams", pieceWeight: 28, calsPer100g: 579, protPer100g: 21, carbsPer100g: 22, fatPer100g: 50 }
];

export default function MealLoggerModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  const addFoodLogStore = useStore(state => state.addFoodLog);
  const inputRef = useRef(null);

  const [mealName, setMealName] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  
  // Serving quantity & portion unit state
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState('piece'); // 'grams' | 'piece' | 'bowl' | 'cup' | 'scoop' | 'tbsp' | 'tsp' | 'slice'

  // Calculated macros state
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (activeWorkflow === 'log_meal' && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeWorkflow]);

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

  // Handle live search input change
  const handleNameChange = (val) => {
    setMealName(val);
    if (!val || val.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const matches = searchCalyxoFoods(val).slice(0, 8);
    setSuggestions(matches);
    setShowDropdown(matches.length > 0);
  };

  // When user selects a item from the dataset dropdown
  const selectSuggestion = (item) => {
    setSelectedFood(item);
    setMealName(item.name);
    setUnitType(item.unitType || 'grams');
    setQuantity(1);
    setShowDropdown(false);
    recalculateMacros(item, 1, item.unitType || 'grams');
  };

  // Recalculate macros based on item base cals, quantity and chosen unit
  const recalculateMacros = (food, qty, uType) => {
    if (!food) return;

    let totalGrams = 100;
    if (uType === 'grams') {
      totalGrams = qty;
    } else if (uType === 'piece') {
      totalGrams = (food.pieceWeight || 50) * qty;
    } else if (uType === 'bowl') {
      totalGrams = (food.pieceWeight || 200) * qty;
    } else if (uType === 'cup') {
      totalGrams = (food.pieceWeight || 150) * qty;
    } else if (uType === 'scoop') {
      totalGrams = (food.pieceWeight || 30) * qty;
    } else if (uType === 'tbsp') {
      totalGrams = 15 * qty;
    } else if (uType === 'tsp') {
      totalGrams = 5 * qty;
    } else if (uType === 'slice') {
      totalGrams = 30 * qty;
    }

    const factor = totalGrams / 100;
    setCalories(Math.round(food.calsPer100g * factor));
    setProtein(parseFloat((food.protPer100g * factor).toFixed(1)));
    setCarbs(parseFloat((food.carbsPer100g * factor).toFixed(1)));
    setFat(parseFloat((food.fatPer100g * factor).toFixed(1)));
  };

  const handleQuantityChange = (newQty) => {
    const val = Math.max(0.1, parseFloat(newQty) || 0);
    setQuantity(val);
    if (selectedFood) {
      recalculateMacros(selectedFood, val, unitType);
    }
  };

  const handleUnitChange = (newUnit) => {
    setUnitType(newUnit);
    if (selectedFood) {
      recalculateMacros(selectedFood, quantity, newUnit);
    }
  };

  const handleSaveMeal = async () => {
    if (!mealName || !calories) return;

    setIsSaving(true);
    try {
      const uid = getCurrentUserId();
      const logEntry = {
        userId: uid,
        name: mealName,
        calories: parseInt(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        portionWeight: unitType === 'grams' ? quantity : (selectedFood?.pieceWeight ? selectedFood.pieceWeight * quantity : 100),
        unitType: unitType,
        timestamp: Date.now()
      };

      const savedItem = await addFoodLog(uid, logEntry);
      addFoodLogStore(savedItem);

      // Award XP for meal logging
      addXP(50);

      // Update nutrition streak
      updateStreaks({ nutritionStreak: (useEcosystemStore.getState().streaks.nutritionStreak || 0) + 1 });

      // Reset local fields
      setMealName('');
      setSelectedFood(null);
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      closeWorkflow();
    } catch (error) {
      console.error("Error saving meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeWorkflow}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-6">
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

              {/* AI Food Scan Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer border-none group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black tracking-wide uppercase">AI Photo Food Scan</p>
                    <p className="text-[10px] text-white/80 font-medium">Snap photo & auto-extract macros instantly</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-white/20 text-[10px] font-extrabold uppercase tracking-wider text-cyan-200 border border-white/20 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-300 animate-pulse" />
                  Scan
                </div>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-[1px] bg-card-border" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted">OR SEARCH MANUALLY</span>
                <div className="flex-1 h-[1px] bg-card-border" />
              </div>

              {/* Search Food Name */}
              <div ref={dropdownRef} className="relative">
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
                  Search Food (Dosa, Rice, Oats, Biryani, Roti, Eggs...)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="Type food name (e.g. Dosa, Biryani, Rice, Oats, Eggs)..." 
                    value={mealName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-green-500 text-sm shadow-inner font-bold"
                  />
                </div>

                {/* Matching Food Dataset Dropdown */}
                <AnimatePresence>
                  {showDropdown && suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-surface border border-card-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                    >
                      <div className="px-3 py-1.5 bg-surface/80 border-b border-card-border text-[9px] font-black uppercase tracking-wider text-muted flex justify-between">
                        <span>Matching Dataset Foods</span>
                        <span className="text-green-500">Tap to select portion</span>
                      </div>
                      {suggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => selectSuggestion(item)}
                          className="px-4 py-2.5 hover:bg-green-500/10 hover:text-green-500 cursor-pointer flex justify-between items-center text-xs border-b border-card-border/40 last:border-b-0"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground truncate">{item.name}</span>
                            <span className="text-[9px] text-muted font-medium">
                              Base: {item.calsPer100g} kcal/100g ({item.protPer100g}g P, {item.carbsPer100g}g C, {item.fatPer100g}g F)
                            </span>
                          </div>
                          <span className="text-[9px] text-green-500 font-extrabold uppercase shrink-0 ml-2 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md">
                            Select
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* PORTION SIZE & SERVING UNIT SELECTOR */}
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl space-y-3 shadow-inner">
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
                      min="0.1"
                      step="0.5"
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
                      <option value="piece">Pieces / Items (Rotis, Eggs, Dosa)</option>
                      <option value="bowl">Bowls (Biryani, Curry, Oats)</option>
                      <option value="grams">Grams (Exact weight)</option>
                      <option value="cup">Cups (Yogurt, Milk, Curd)</option>
                      <option value="scoop">Scoops (Protein powder)</option>
                      <option value="tbsp">Tablespoons (Oil, Peanut Butter)</option>
                      <option value="tsp">Teaspoon (Ghee, Butter)</option>
                      <option value="slice">Slices (Bread, Cheese)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CALORIES */}
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
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Protein (g)</span>
                  <input 
                    type="number" 
                    placeholder="20"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl text-xs font-mono text-center font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Carbs (g)</span>
                  <input 
                    type="number" 
                    placeholder="30"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl text-xs font-mono text-center font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Fat (g)</span>
                  <input 
                    type="number" 
                    placeholder="8"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl text-xs font-mono text-center font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveMeal}
              disabled={isSaving || !mealName || !calories}
              className="w-full mt-4 py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-none"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Food & Portion Log
                </>
              )}
            </button>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* AI Food Scanner Overlay */}
      {showScanner && (
        <FoodScanner
          onClose={() => setShowScanner(false)}
          onLogged={(loggedMeal) => {
            setShowScanner(false);
            closeWorkflow();
          }}
        />
      )}
    </>
  );
}
