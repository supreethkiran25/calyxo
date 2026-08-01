import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, Save, RefreshCw, Search, Sparkles, Scale, Utensils } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { addFoodLog, getCurrentUserId } from '../../lib/dbService';
import { INDIAN_FOODS, searchCalyxoFoods } from '../../lib/indianFoods';

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
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute calculated total grams for current portion configuration
  const getComputedTotalGrams = () => {
    const q = Number(quantity) || 0;
    if (unitType === 'grams') return q;
    if (unitType === 'piece') return Math.round(q * (selectedFood?.pieceWeight || 50));
    if (unitType === 'bowl') return Math.round(q * 200);
    if (unitType === 'cup') return Math.round(q * 150);
    if (unitType === 'scoop') return Math.round(q * 30);
    if (unitType === 'tbsp') return Math.round(q * 15);
    if (unitType === 'tsp') return Math.round(q * 5);
    if (unitType === 'slice') return Math.round(q * 25);
    return Math.round(q * 100);
  };

  // Recalculate macros automatically whenever selected food, quantity, or unit type changes!
  useEffect(() => {
    if (!selectedFood) return;

    const totalGrams = getComputedTotalGrams();
    const cals100 = selectedFood.calsPer100g || 150;
    const p100 = selectedFood.protPer100g || 10;
    const c100 = selectedFood.carbsPer100g || 20;
    const f100 = selectedFood.fatPer100g || 5;

    const factor = totalGrams / 100;

    setCalories(Math.round(cals100 * factor));
    setProtein(Number((p100 * factor).toFixed(1)));
    setCarbs(Number((c100 * factor).toFixed(1)));
    setFat(Number((f100 * factor).toFixed(1)));
  }, [selectedFood, quantity, unitType]);

  const handleUnitTypeChange = (newUnit) => {
    if (newUnit === 'grams' && unitType !== 'grams') {
      const g = getComputedTotalGrams();
      setQuantity(g || 100);
    } else if (newUnit !== 'grams' && unitType === 'grams') {
      const g = Number(quantity) || 100;
      let q = 1;
      if (newUnit === 'piece') q = Number((g / (selectedFood?.pieceWeight || 50)).toFixed(1));
      else if (newUnit === 'bowl') q = Number((g / 200).toFixed(1));
      else if (newUnit === 'cup') q = Number((g / 150).toFixed(1));
      else if (newUnit === 'scoop') q = Number((g / 30).toFixed(1));
      else if (newUnit === 'tbsp') q = Number((g / 15).toFixed(1));
      else if (newUnit === 'tsp') q = Number((g / 5).toFixed(1));
      else if (newUnit === 'slice') q = Number((g / 25).toFixed(1));
      setQuantity(q || 1);
    }
    setUnitType(newUnit);
  };

  // Search food across INDIAN_FOODS dataset (1837 items) + FOODS_CATALOG
  const handleNameChange = (val) => {
    setMealName(val);
    const q = val.toLowerCase().trim();
    if (!q) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const matchedFoods = searchCalyxoFoods(q, 15);
    const indianMatches = matchedFoods.map(item => {
      const n = (item.displayName || item.name).toLowerCase();
      let defaultUnit = 'grams';
      let defaultQty = 100;
      let pw = item.pieceWeight || 100;

      if (n.includes('roti') || n.includes('chapati') || n.includes('phulka') || n.includes('naan') || n.includes('paratha')) {
        defaultUnit = 'piece';
        defaultQty = 1;
        pw = 35;
      } else if (n.includes('dosa')) {
        defaultUnit = 'piece';
        defaultQty = 1;
        pw = 100;
      } else if (n.includes('idli')) {
        defaultUnit = 'piece';
        defaultQty = 1;
        pw = 40;
      } else if (n.includes('egg')) {
        defaultUnit = 'piece';
        defaultQty = 1;
        pw = 50;
      } else if (n.includes('biryani') || n.includes('rice') || n.includes('dal') || n.includes('curry') || n.includes('pulao') || n.includes('khichdi')) {
        defaultUnit = 'bowl';
        defaultQty = 1;
        pw = 200;
      }

      return {
        name: item.displayName || item.name,
        category: item.category,
        servingSize: item.servingSize,
        unitType: defaultUnit,
        defaultQty,
        pieceWeight: pw,
        calsPer100g: item.calsPer100g || item.calories,
        protPer100g: item.protPer100g || item.protein,
        carbsPer100g: item.carbsPer100g || item.carbs,
        fatPer100g: item.fatPer100g || item.fat
      };
    });

    const catalogMatches = FOODS_CATALOG.filter(item =>
      item.name.toLowerCase().includes(q)
    ).map(item => ({
      name: item.name,
      category: 'Catalog',
      unitType: item.unitType || 'piece',
      defaultQty: 1,
      pieceWeight: item.pieceWeight || 50,
      calsPer100g: item.calsPer100g,
      protPer100g: item.protPer100g,
      carbsPer100g: item.carbsPer100g,
      fatPer100g: item.fatPer100g
    }));

    const merged = [...catalogMatches, ...indianMatches];
    const seen = new Set();
    const unique = [];
    for (const item of merged) {
      if (!seen.has(item.name.toLowerCase())) {
        seen.add(item.name.toLowerCase());
        unique.push(item);
      }
    }

    setSuggestions(unique.slice(0, 8));
    setShowDropdown(unique.length > 0);
  };

  const selectSuggestion = (food) => {
    setSelectedFood(food);
    setMealName(food.name);
    setUnitType(food.unitType || 'piece');
    setQuantity(food.defaultQty || 1);
    setShowDropdown(false);
  };

  if (activeWorkflow !== 'log_meal') return null;

  const handleSave = async () => {
    if (!mealName.trim()) return;
    
    const computedGrams = getComputedTotalGrams();
    let calVal = Number(calories);
    if (!calVal || calVal <= 0) {
      calVal = Math.round(computedGrams * 1.5) || 150;
    }
    
    setIsSaving(true);
    
    try {
      const user = useStore.getState().user;
      const uid = user?.uid || user?.id || await getCurrentUserId();
      if (!uid) {
        throw new Error("User ID is missing or session expired.");
      }

      const portionText = unitType === 'grams' 
        ? `${quantity}g` 
        : `${quantity} ${unitType}${quantity > 1 ? 's' : ''} (${computedGrams}g)`;

      const mealData = {
        name: `${mealName.trim()} (${portionText})`,
        calories: calVal,
        protein: Number(protein) || Math.round(calVal * 0.08) || 5,
        carbs: Number(carbs) || Math.round(calVal * 0.12) || 20,
        fat: Number(fat) || Math.round(calVal * 0.04) || 5,
        portionWeight: computedGrams,
        timestamp: Date.now()
      };

      const saved = await addFoodLog(uid, mealData);
      addFoodLogStore(saved || mealData);
      
      addXP(50);
      updateStreaks();
      
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
                  <label className="text-[9.5px] font-bold text-muted uppercase block mb-1">
                    {unitType === 'grams' ? 'Exact Grams (g)' : 'Quantity'}
                  </label>
                  <input 
                    type="number" 
                    min={unitType === 'grams' ? "1" : "0.1"}
                    step={unitType === 'grams' ? "5" : "0.5"}
                    placeholder={unitType === 'grams' ? "e.g. 150g" : "e.g. 1 or 1.5"}
                    value={quantity}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/^0+(?=\d)/, '');
                      setQuantity(clean);
                    }}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-green-500 text-sm font-black text-center shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-muted uppercase block mb-1">Serving Unit</label>
                  <select
                    value={unitType}
                    onChange={(e) => handleUnitTypeChange(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-green-500 text-xs font-bold"
                  >
                    <option value="grams">Grams (g) - e.g. 100g, 150g, 250g</option>
                    <option value="piece">Pieces / Items (Rotis, Chapatis, Eggs, Dosas)</option>
                    <option value="bowl">Bowl (approx 200g)</option>
                    <option value="cup">Cup (approx 150g)</option>
                    <option value="scoop">Scoop (approx 30g)</option>
                    <option value="tbsp">Tablespoon (approx 15g)</option>
                    <option value="tsp">Teaspoon (approx 5g)</option>
                    <option value="slice">Slice (approx 25g)</option>
                  </select>
                </div>
              </div>

              {/* LIVE AUTO-CALCULATED MACRO BADGE */}
              {selectedFood && (
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <span className="text-[10px] text-green-400 font-extrabold uppercase block tracking-wider">
                    Calculated Nutrition for {quantity} {unitType}{quantity > 1 ? 's' : ''} ({getComputedTotalGrams()}g total)
                  </span>
                  <div className="text-xs font-black text-foreground mt-0.5">
                    {calories} kcal | P: {protein}g | C: {carbs}g | F: {fat}g
                  </div>
                </div>
              )}
            </div>

            {/* Total Calories Display / Manual Edit */}
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1 block">Total Calories (kcal)</label>
              <input 
                type="number" 
                placeholder="Auto-calculated (e.g. 250)"
                value={calories}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setCalories(e.target.value.replace(/^0+(?=\d)/, ''))}
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-green-500 text-xl font-black shadow-inner"
              />
            </div>

            {/* Macros Breakdown */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-1">Protein (g)</label>
                <input 
                  type="number" 
                  placeholder="20"
                  value={protein}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setProtein(e.target.value.replace(/^0+(?=\d)/, ''))}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-lg focus:outline-none focus:border-green-500 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-1">Carbs (g)</label>
                <input 
                  type="number" 
                  placeholder="30"
                  value={carbs}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setCarbs(e.target.value.replace(/^0+(?=\d)/, ''))}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-lg focus:outline-none focus:border-green-500 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-1">Fat (g)</label>
                <input 
                  type="number" 
                  placeholder="8"
                  value={fat}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFat(e.target.value.replace(/^0+(?=\d)/, ''))}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-lg focus:outline-none focus:border-green-500 text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-card-border mt-4">
            <button 
              onClick={handleSave}
              disabled={isSaving || !mealName.trim()}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer border-none shadow-lg shadow-green-500/20"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving Meal Log...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Food & Portion Log
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
