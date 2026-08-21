import React, { useState } from 'react';
import { X, Check, Minus, Plus, Utensils, Sun, SunMedium, Moon, Coffee } from 'lucide-react';
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
    { id: 'breakfast', label: 'Breakfast', icon: Sun },
    { id: 'lunch', label: 'Lunch', icon: SunMedium },
    { id: 'dinner', label: 'Dinner', icon: Moon },
    { id: 'snacks', label: 'Snacks', icon: Coffee }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Dialog / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-surface border border-card-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 z-10 max-h-[92dvh] overflow-y-auto pb-safe">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto mb-1 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
              {food.category || 'Portion Customizer'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
              {food.displayName || food.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--input)] text-muted hover:text-foreground transition-colors cursor-pointer border-none shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Slot Destination Selection */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">Log to Meal</span>
          <div className="grid grid-cols-4 gap-1.5">
            {MEAL_SLOT_OPTIONS.map(slot => {
              const SlotIcon = slot.icon;
              const isSelected = mealSlot === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setMealSlot(slot.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-acid-green text-accent-foreground border-acid-green shadow-xs'
                      : 'bg-[var(--input)] border-card-border text-muted hover:text-foreground'
                  }`}
                >
                  <SlotIcon className="w-3.5 h-3.5" />
                  <span className="truncate">{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Portion Controls Card */}
        <div className="p-4 rounded-2xl bg-[var(--input)] border border-card-border space-y-3">
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
              <span className="text-[10px] uppercase font-bold text-muted mb-1 block">Quantity</span>
              <div className="flex items-center bg-surface border border-card-border rounded-xl overflow-hidden h-10">
                <button
                  type="button"
                  onClick={() => handleStepQty(-1)}
                  className="px-3 h-full text-muted hover:text-foreground hover:bg-[var(--input)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-transparent text-foreground text-center font-bold text-sm focus:outline-none"
                  aria-label="Quantity"
                />
                <button
                  type="button"
                  onClick={() => handleStepQty(1)}
                  className="px-3 h-full text-muted hover:text-foreground hover:bg-[var(--input)] transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Serving Unit Dropdown */}
            <div>
              <span className="text-[10px] uppercase font-bold text-muted mb-1 block">Unit</span>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="w-full bg-surface text-foreground border border-card-border px-3 h-10 rounded-xl text-xs font-bold focus:outline-none focus:border-acid-green cursor-pointer"
              >
                <option value="piece">Pieces</option>
                <option value="bowl">Bowls</option>
                <option value="grams">Grams (g)</option>
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
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer border shrink-0 ${
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

        {/* Live Macro Breakdown Panel */}
        <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted uppercase">Energy</span>
            <span className="text-base font-extrabold text-foreground">{calcCalories} kcal</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-card-border">
            <div className="bg-[var(--input)] p-2 rounded-xl border border-card-border">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">Protein</span>
              <span className="text-xs font-bold text-foreground">{calcProtein}g</span>
            </div>
            <div className="bg-[var(--input)] p-2 rounded-xl border border-card-border">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">Carbs</span>
              <span className="text-xs font-bold text-foreground">{calcCarbs}g</span>
            </div>
            <div className="bg-[var(--input)] p-2 rounded-xl border border-card-border">
              <span className="text-[10px] font-mono uppercase text-rose-400 block font-bold">Fat</span>
              <span className="text-xs font-bold text-foreground">{calcFat}g</span>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-acid-green hover:bg-acid-green/90 text-accent-foreground font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border-none active:scale-[0.99]"
        >
          <Check className="w-4 h-4" />
          {isSubmitting ? 'Logging...' : `Log to ${mealSlot.toUpperCase()}`}
        </button>

      </div>
    </div>
  );
}
