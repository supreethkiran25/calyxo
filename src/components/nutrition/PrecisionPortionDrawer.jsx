import React, { useState } from 'react';
import { X, Check, Minus, Plus, Utensils } from 'lucide-react';
import { formatNutritionValue } from '../../utils/macroCalculator';

export default function PrecisionPortionDrawer({
  food,
  initialSlot = 'lunch',
  onClose,
  onLogMeal
}) {
  if (!food) return null;

  const defaultUnit = food.unitType || (food.pieceWeight ? 'piece' : 'grams');
  const [unitType, setUnitType] = useState(defaultUnit);
  const [quantity, setQuantity] = useState(1);
  const [mealSlot, setMealSlot] = useState(initialSlot || 'lunch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calsPer100 = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
  const protPer100 = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
  const carbsPer100 = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);
  const fatPer100 = food.fatPer100g !== undefined ? food.fatPer100g : (food.fat || 0);

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

  const handleStepQty = (delta) => {
    const current = parseFloat(quantity) || 1;
    const step = unitType === 'grams' ? 25 : 0.5;
    const nextVal = Math.max(step, current + delta * step);
    setQuantity(nextVal);
  };

  const handleQuickQty = (amt) => {
    setQuantity(amt);
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
      unitType: unitType,
      mealSlot: mealSlot
    });
    setIsSubmitting(false);
    onClose();
  };

  const MEAL_SLOT_OPTIONS = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snacks', label: 'Snacks' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-surface border border-card-border rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 z-10 max-h-[90dvh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-3.5">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted block">
              {food.category || 'Food Item'}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {food.displayName || food.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[var(--input)] text-muted hover:text-foreground transition-colors cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Slot Destination Selection */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">Meal Slot Target</span>
          <div className="grid grid-cols-4 gap-1.5">
            {MEAL_SLOT_OPTIONS.map(slot => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setMealSlot(slot.id)}
                className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer border ${
                  mealSlot === slot.id
                    ? 'bg-acid-green text-accent-foreground border-acid-green shadow-sm'
                    : 'bg-[var(--input)] border-card-border text-muted hover:text-foreground'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portion Controls */}
        <div className="p-4 rounded-xl bg-[var(--input)] border border-card-border space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-acid-green" /> Portion Eaten
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              ≈ {Math.round(totalWeightGrams)}g
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Stepper */}
            <div>
              <span className="text-[9px] uppercase font-bold text-muted mb-1 block">Quantity</span>
              <div className="flex items-center bg-surface border border-card-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleStepQty(-1)}
                  className="p-2 text-muted hover:text-foreground hover:bg-[var(--input)] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-transparent text-foreground text-center font-bold text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleStepQty(1)}
                  className="p-2 text-muted hover:text-foreground hover:bg-[var(--input)] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Serving Unit Dropdown */}
            <div>
              <span className="text-[9px] uppercase font-bold text-muted mb-1 block">Unit</span>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="w-full bg-surface text-foreground border border-card-border px-2 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-acid-green"
              >
                <option value="piece">Pieces</option>
                <option value="bowl">Bowls</option>
                <option value="grams">Grams</option>
                <option value="cup">Cups</option>
                <option value="scoop">Scoops</option>
                <option value="slice">Slices</option>
                <option value="tbsp">Tablespoons</option>
                <option value="tsp">Teaspoons</option>
              </select>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
            {(unitType === 'grams' ? [50, 100, 150, 200, 250, 300] : [0.5, 1, 1.5, 2, 3]).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickQty(amt)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                  parseFloat(quantity) === amt
                    ? 'bg-acid-green text-accent-foreground border-acid-green'
                    : 'bg-surface border-card-border text-muted hover:text-foreground'
                }`}
              >
                {amt}{unitType === 'grams' ? 'g' : 'x'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Macro Audit Panel */}
        <div className="p-4 rounded-xl bg-surface border border-card-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Energy</span>
            <span className="text-base font-extrabold text-foreground">{calcCalories} kcal</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-card-border">
            <div className="bg-[var(--input)] p-2 rounded-lg border border-card-border">
              <span className="text-[9px] font-mono uppercase text-cyan-400 block">Protein</span>
              <span className="text-xs font-bold text-foreground">{calcProtein}g</span>
            </div>
            <div className="bg-[var(--input)] p-2 rounded-lg border border-card-border">
              <span className="text-[9px] font-mono uppercase text-amber-400 block">Carbs</span>
              <span className="text-xs font-bold text-foreground">{calcCarbs}g</span>
            </div>
            <div className="bg-[var(--input)] p-2 rounded-lg border border-card-border">
              <span className="text-[9px] font-mono uppercase text-rose-400 block">Fat</span>
              <span className="text-xs font-bold text-foreground">{calcFat}g</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-acid-green hover:bg-acid-green/90 text-accent-foreground font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border-none"
        >
          <Check className="w-4 h-4" />
          {isSubmitting ? 'Logging...' : `Log to ${mealSlot.toUpperCase()}`}
        </button>

      </div>
    </div>
  );
}
