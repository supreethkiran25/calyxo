import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, Save, RefreshCw, Search, Sparkles, Scale, Utensils } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { addFoodLog, getCurrentUserId } from '../../lib/dbService';
import { INDIAN_FOODS } from '../../lib/indianFoods';

const FOODS_CATALOG = [
  { name: "Chicken Biryani", unitType: "bowl", baseWeight: 300, calories: 420, protein: 28, carbs: 48, fat: 14 },
  { name: "Masala Dosa", unitType: "piece", baseWeight: 120, calories: 250, protein: 5, carbs: 42, fat: 7 },
  { name: "Plain Dosa", unitType: "piece", baseWeight: 100, calories: 168, protein: 3.8, carbs: 29, fat: 3.7 },
  { name: "Roti / Chapati", unitType: "piece", baseWeight: 35, calories: 85, protein: 3, carbs: 18, fat: 0.8 },
  { name: "Scrambled Eggs", unitType: "large egg", baseWeight: 50, calories: 70, protein: 6, carbs: 0.5, fat: 5 },
  { name: "Boiled Egg", unitType: "large egg", baseWeight: 50, calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { name: "Oatmeal (cooked)", unitType: "bowl", baseWeight: 200, calories: 150, protein: 6, carbs: 27, fat: 3 },
  { name: "Rolled Oats (raw)", unitType: "grams", baseWeight: 100, calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: "Steamed White Rice", unitType: "bowl", baseWeight: 150, calories: 195, protein: 4.3, carbs: 43, fat: 0.4 },
  { name: "Grilled Chicken Breast", unitType: "grams", baseWeight: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Paneer Tikka", unitType: "grams", baseWeight: 100, calories: 280, protein: 18, carbs: 4, fat: 22 },
  { name: "Greek Yogurt", unitType: "cup", baseWeight: 170, calories: 130, protein: 24, carbs: 9, fat: 0 },
  { name: "Whey Protein Shake", unitType: "scoop", baseWeight: 30, calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: "Almonds", unitType: "grams", baseWeight: 28, calories: 160, protein: 6, carbs: 6, fat: 14 }
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
  const [unitType, setUnitType] = useState('piece'); // 'piece' | 'bowl' | 'cup' | 'grams'

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

  // Recalculate macros automatically whenever selected food, quantity, or unit type changes!
  useEffect(() => {
    if (!selectedFood) return;

    let multiplier = Number(quantity) || 1;

    if (unitType === 'grams') {
      // Base values are stored per 100g in INDIAN_FOODS
      const baseGrams = selectedFood.baseWeight || 100;
      multiplier = (Number(quantity) || 100) / baseGrams;
    }

    const calcCals = Math.round((selectedFood.calories || 0) * multiplier);
    const calcProt = Number(((selectedFood.protein || 0) * multiplier).toFixed(1));
    const calcCarbs = Number(((selectedFood.carbs || 0) * multiplier).toFixed(1));
    const calcFat = Number(((selectedFood.fat || 0) * multiplier).toFixed(1));

    setCalories(calcCals);
    setProtein(calcProt);
    setCarbs(calcCarbs);
    setFat(calcFat);
  }, [selectedFood, quantity, unitType]);

  // Search food across INDIAN_FOODS dataset (1837 items) + FOODS_CATALOG
  const handleNameChange = (val) => {
    setMealName(val);
    const q = val.toLowerCase().trim();
    if (!q) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const indianMatches = INDIAN_FOODS.filter(item =>
      item.name.toLowerCase().includes(q) ||
      (item.aliases && item.aliases.some(a => a.toLowerCase().includes(q)))
    ).map(item => {
      // Determine probable serving type
      const n = item.name.toLowerCase();
      let defaultUnit = 'grams';
      let defaultQty = 100;
      let baseCals = item.calories;
      let baseP = item.protein;
      let baseC = item.carbs;
      let baseF = item.fat;

      if (n.includes('roti') || n.includes('chapati') || n.includes('phulka') || n.includes('naan') || n.includes('paratha')) {
        defaultUnit = 'piece';
        defaultQty = 1;
        // 1 roti is approx 35g -> ~85 kcal
        baseCals = Math.round(item.calories * 0.35);
        baseP = Number((item.protein * 0.35).toFixed(1));
        baseC = Number((item.carbs * 0.35).toFixed(1));
        baseF = Number((item.fat * 0.35).toFixed(1));
      } else if (n.includes('dosa') || n.includes('idli') || n.includes('vada') || n.includes('samosa') || n.includes('egg')) {
        defaultUnit = 'piece';
        defaultQty = 1;
        baseCals = Math.round(item.calories * 0.8); // approx 1 piece
        baseP = Number((item.protein * 0.8).toFixed(1));
        baseC = Number((item.carbs * 0.8).toFixed(1));
        baseF = Number((item.fat * 0.8).toFixed(1));
      } else if (n.includes('biryani') || n.includes('rice') || n.includes('dal') || n.includes('curry') || n.includes('pulao') || n.includes('khichdi')) {
        defaultUnit = 'bowl';
        defaultQty = 1;
        baseCals = Math.round(item.calories * 2); // 1 bowl is approx 200g
        baseP = Number((item.protein * 2).toFixed(1));
        baseC = Number((item.carbs * 2).toFixed(1));
        baseF = Number((item.fat * 2).toFixed(1));
      }

      return {
        name: item.name,
        category: item.category,
        servingSize: item.servingSize,
        unitType: defaultUnit,
        defaultQty,
        baseWeight: defaultUnit === 'grams' ? 100 : 1,
        calories: baseCals,
        protein: baseP,
        carbs: baseC,
        fat: baseF
      };
    });

    const catalogMatches = FOODS_CATALOG.filter(item =>
      item.name.toLowerCase().includes(q)
    ).map(item => ({
      name: item.name,
      category: 'Catalog',
      unitType: item.unitType || 'piece',
      defaultQty: 1,
      baseWeight: 1,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat
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
    const calVal = Number(calories) || 0;
    if (!mealName.trim() || calVal <= 0) return;
    
    const uid = await getCurrentUserId();
    setIsSaving(true);
    
    try {
      const portionText = `${quantity} ${unitType}${quantity > 1 ? 's' : ''}`;
      const mealData = {
        name: `${mealName.trim()} (${portionText})`,
        calories: calVal,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        portionWeight: unitType === 'grams' ? Number(quantity) : Math.round(Number(quantity) * 100),
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

          <div className="space-y-4">
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
                            Base: {item.calories} kcal ({item.protein}g P, {item.carbs}g C, {item.fat}g F)
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
                  <label className="text-[9.5px] font-bold text-muted uppercase block mb-1">Quantity</label>
                  <input 
                    type="number" 
                    min="0.1" 
                    step="0.5"
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
                    onChange={(e) => setUnitType(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-green-500 text-xs font-bold"
                  >
                    <option value="piece">Pieces / Rotis / Dosas</option>
                    <option value="bowl">Bowl (approx 200g)</option>
                    <option value="cup">Cup (approx 150g)</option>
                    <option value="grams">Grams (g)</option>
                  </select>
                </div>
              </div>

              {/* LIVE AUTO-CALCULATED MACRO BADGE */}
              {selectedFood && (
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <span className="text-[10px] text-green-400 font-extrabold uppercase block tracking-wider">
                    Calculated Nutrition for {quantity} {unitType}{quantity > 1 ? 's' : ''}
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

          <div className="pt-6 mt-4 border-t border-card-border">
            <button 
              onClick={handleSave}
              disabled={isSaving || !mealName.trim() || Number(calories) <= 0}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer border-none shadow-lg"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Log Meal & Portion
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
