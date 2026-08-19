import React, { useState } from 'react';
import { Plus, Check, Star } from 'lucide-react';

export default function ProductFoodCard({
  food,
  onQuickAdd,
  onOpenPortionDrawer,
  isFavorite,
  onToggleFavorite,
  badgeText,
  currentMealSlot = 'lunch'
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const displayName = food.displayName || food.name;
  const cals = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
  const prot = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
  const carbs = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);
  const fat = food.fatPer100g !== undefined ? food.fatPer100g : (food.fat || 0);

  // Determine dietary type
  const isNonVeg = (food.category || '').toLowerCase().includes('non-veg') ||
                   (food.category || '').toLowerCase().includes('meat') ||
                   (food.category || '').toLowerCase().includes('chicken') ||
                   (food.category || '').toLowerCase().includes('fish') ||
                   food.name.toLowerCase().includes('chicken') ||
                   food.name.toLowerCase().includes('fish') ||
                   food.pref === 'nonveg';

  const isEgg = food.name.toLowerCase().includes('egg') || food.pref === 'egg';
  const isVegan = food.pref === 'vegan';

  const dietTag = isNonVeg ? 'NON-VEG' : isEgg ? 'EGG' : isVegan ? 'VEGAN' : 'VEG';
  const dietColor = isNonVeg ? 'bg-red-500' : isEgg ? 'bg-amber-500' : 'bg-emerald-500';

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isAdding || justAdded) return;
    setIsAdding(true);
    await onQuickAdd(food, currentMealSlot);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(food);
  };

  return (
    <div
      onClick={() => onOpenPortionDrawer && onOpenPortionDrawer(food)}
      className="p-3.5 sm:p-4 rounded-xl bg-surface border border-card-border hover:border-foreground/30 transition-all cursor-pointer flex flex-col justify-between group shadow-sm min-w-[210px] max-w-[250px] shrink-0"
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dietColor}`} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted">
              {dietTag}
            </span>
            {badgeText && (
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-[var(--input)] text-foreground rounded">
                {badgeText}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleFavorite}
            className="p-1 text-muted hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-acid-green transition-colors line-clamp-2 leading-snug">
          {displayName}
        </h4>

        {/* Serving description */}
        <span className="text-[10px] font-mono text-muted block mt-1">
          {food.servingSize || `${food.pieceWeight || 100}g standard serving`}
        </span>
      </div>

      {/* Bottom Nutrition & Action */}
      <div className="mt-3 pt-2.5 border-t border-card-border">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-foreground">{Math.round(cals)}</span>
              <span className="text-[9px] font-mono text-muted">kcal</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted mt-0.5">
              <span className="text-cyan-400 font-bold">{prot}g P</span>
              <span>·</span>
              <span className="text-amber-400 font-bold">{carbs}g C</span>
              <span>·</span>
              <span className="text-rose-400 font-bold">{fat}g F</span>
            </div>
          </div>

          {/* Quick 1-Tap Log Button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding}
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer border-none shadow-sm ${
              justAdded
                ? 'bg-emerald-500 text-black'
                : 'bg-[var(--input)] text-foreground hover:bg-acid-green hover:text-accent-foreground border border-card-border'
            }`}
            title="Add to diary"
          >
            {justAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
