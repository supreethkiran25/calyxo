import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Check, Plus, Minus, Flame, Sparkles } from 'lucide-react';
import { formatNutritionValue } from '../../utils/macroCalculator';

export default function PortionCustomizerModal({
  food,
  onClose,
  onLogMeal
}) {
  if (!food) return null;

  const defaultUnit = food.unitType || (food.pieceWeight ? 'piece' : 'grams');
  const [unitType, setUnitType] = useState(defaultUnit);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Per 100g reference values
  const calsPer100 = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
  const protPer100 = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
  const carbsPer100 = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);
  const fatPer100 = food.fatPer100g !== undefined ? food.fatPer100g : (food.fat || 0);

  // Compute total weight in grams
  let totalWeightGrams = 100;
  const qVal = parseFloat(quantity) || 0;
  if (unitType === 'grams') {
    totalWeightGrams = qVal;
  } else {
    const perUnitWeight = food.pieceWeight || 100;
    totalWeightGrams = qVal * perUnitWeight;
  }

  const factor = totalWeightGrams / 100;
  const calcCalories = Math.round(calsPer100 * factor);
  const calcProtein = formatNutritionValue(protPer100 * factor);
  const calcCarbs = formatNutritionValue(carbsPer100 * factor);
  const calcFat = formatNutritionValue(fatPer100 * factor);

  const handleQuickQty = (amt) => {
    setQuantity(amt);
  };

  const handleStepQty = (delta) => {
    const current = parseFloat(quantity) || 1;
    const step = unitType === 'grams' ? 25 : 0.5;
    const nextVal = Math.max(step, current + delta * step);
    setQuantity(nextVal);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await onLogMeal({
      name: food.displayName || food.name,
      calories: calcCalories,
      protein: parseFloat(calcProtein) || 0,
      carbs: parseFloat(calcCarbs) || 0,
      fat: parseFloat(calcFat) || 0,
      portionWeight: Math.round(totalWeightGrams),
      unitType: unitType
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          className="relative w-full max-w-md bg-surface border border-card-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 z-10 max-h-[90dvh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3.5">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-acid-green">
                {food.category || 'Food Item'}
              </span>
              <h3 className="text-sm sm:text-base font-black text-foreground">
                {food.displayName || food.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Portion Stepper & Unit Selector */}
          <div className="bg-surface/50 border border-card-border p-4 rounded-2xl space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-acid-green" /> Portion Eaten
              </span>
              <span className="text-[10px] text-muted font-bold">≈ {Math.round(totalWeightGrams)}g</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Stepper Quantity */}
              <div>
                <span className="text-[9px] uppercase font-bold text-muted mb-1 block">Quantity</span>
                <div className="flex items-center bg-[var(--input)] border border-card-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleStepQty(-1)}
                    className="p-2 text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-transparent text-foreground text-center font-black text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleStepQty(1)}
                    className="p-2 text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Serving Unit */}
              <div>
                <span className="text-[9px] uppercase font-bold text-muted mb-1 block">Serving Unit</span>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-acid-green"
                >
                  <option value="piece">Pieces / Items</option>
                  <option value="bowl">Bowls (Rice/Curry/Dal)</option>
                  <option value="grams">Grams (Exact Weight)</option>
                  <option value="cup">Cups (Milk/Curd)</option>
                  <option value="scoop">Scoops (Protein)</option>
                  <option value="slice">Slices (Bread)</option>
                  <option value="tbsp">Tablespoons</option>
                  <option value="tsp">Teaspoons</option>
                </select>
              </div>
            </div>

            {/* Quick Quantity Chips */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
              {(unitType === 'grams' ? [50, 100, 150, 200, 250, 300] : [0.5, 1, 1.5, 2, 3]).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickQty(amt)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-colors cursor-pointer border ${
                    parseFloat(quantity) === amt
                      ? 'bg-acid-green text-accent-foreground border-acid-green shadow-sm'
                      : 'bg-[var(--input)] border-card-border text-muted hover:text-foreground'
                  }`}
                >
                  {amt}{unitType === 'grams' ? 'g' : 'x'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Macro Summary Card */}
          <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" /> Total Calories
              </span>
              <span className="text-lg font-black text-foreground">
                {calcCalories} <span className="text-xs text-muted font-bold">kcal</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-card-border/60">
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-xl">
                <span className="text-[9px] font-black uppercase text-cyan-400 block">Protein</span>
                <span className="text-xs font-black text-foreground">{calcProtein}g</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                <span className="text-[9px] font-black uppercase text-amber-400 block">Carbs</span>
                <span className="text-xs font-black text-foreground">{calcCarbs}g</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                <span className="text-[9px] font-black uppercase text-rose-400 block">Fat</span>
                <span className="text-xs font-black text-foreground">{calcFat}g</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-acid-green hover:bg-acid-green/90 text-accent-foreground font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-none"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Logging...' : `Log ${Math.round(totalWeightGrams)}g to Diary`}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
