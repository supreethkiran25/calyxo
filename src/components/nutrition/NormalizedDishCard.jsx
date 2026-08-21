import React, { useState } from 'react';
import { Plus, Check, Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function NormalizedDishCard({
  dish,
  onQuickAdd,
  onOpenPortionDrawer,
  isFavorite,
  onToggleFavorite,
  currentMealSlot = 'lunch'
}) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(dish.defaultVariantIndex || 0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const variations = dish.variations || [];
  const activeVariant = variations[selectedVariantIndex] || variations[0] || {};

  const cals100 = activeVariant.calsPer100g !== undefined ? activeVariant.calsPer100g : (activeVariant.calories || 0);
  const prot100 = activeVariant.protPer100g !== undefined ? activeVariant.protPer100g : (activeVariant.protein || 0);
  const carbs100 = activeVariant.carbsPer100g !== undefined ? activeVariant.carbsPer100g : (activeVariant.carbs || 0);
  const fat100 = activeVariant.fatPer100g !== undefined ? activeVariant.fatPer100g : (activeVariant.fat || 0);

  const pieceWeight = activeVariant.pieceWeight || 100;
  const factor = pieceWeight / 100;
  const servingCals = Math.round(cals100 * factor);
  const servingProt = Math.round(prot100 * factor * 10) / 10;
  const servingCarbs = Math.round(carbs100 * factor * 10) / 10;
  const servingFat = Math.round(fat100 * factor * 10) / 10;

  // Dietary type
  const isNonVeg = dish.dietType === 'nonveg';
  const isEgg = dish.dietType === 'egg';
  const isVegan = dish.dietType === 'vegan';

  const dietTag = isNonVeg ? 'NON-VEG' : isEgg ? 'EGG' : isVegan ? 'VEGAN' : 'VEG';
  const dietColor = isNonVeg ? 'bg-red-500' : isEgg ? 'bg-amber-500' : 'bg-emerald-500';

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isAdding || justAdded) return;
    setIsAdding(true);
    await onQuickAdd({
      ...activeVariant,
      name: activeVariant.originalName || dish.coreName,
      displayName: activeVariant.originalName || dish.coreName
    }, currentMealSlot);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(activeVariant);
  };

  return (
    <div
      onClick={() => onOpenPortionDrawer && onOpenPortionDrawer({ ...activeVariant, name: activeVariant.originalName || dish.coreName, displayName: activeVariant.originalName || dish.coreName })}
      className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-card-border hover:border-foreground/30 transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-sm"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-full ${dietColor} shrink-0`} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted">
              {dietTag}
            </span>
            <span className="text-[9px] font-mono text-muted">·</span>
            <span className="text-[9px] font-mono uppercase text-muted truncate">
              {dish.category || 'Standard'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleFavorite}
              className="p-1 text-muted hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle Favorite"
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
            </button>
          </div>
        </div>

        {/* Core Dish Title */}
        <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-acid-green transition-colors leading-snug line-clamp-1">
          {dish.coreName}
        </h3>

        {/* Active Variation / Portion Pill */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-mono font-semibold text-foreground bg-[var(--input)] px-1.5 py-0.5 rounded border border-card-border/50 truncate max-w-[160px]">
            {activeVariant.variationLabel || 'Standard'}
          </span>
          <span className="text-[10px] font-mono text-muted shrink-0">
            ({pieceWeight}g)
          </span>
        </div>

        {/* Quick Variation Selector Pills (if multiple) */}
        {variations.length > 1 && (
          <div className="flex flex-wrap items-center gap-1 pt-2" onClick={(e) => e.stopPropagation()}>
            {variations.slice(0, 3).map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedVariantIndex(idx)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors cursor-pointer border truncate max-w-[100px] ${
                  selectedVariantIndex === idx
                    ? 'bg-foreground text-background border-foreground font-bold shadow-xs'
                    : 'bg-[var(--input)] border-card-border text-muted hover:text-foreground'
                }`}
              >
                {v.variationLabel}
              </button>
            ))}

            {variations.length > 3 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-acid-green bg-[var(--input)] border border-card-border hover:underline cursor-pointer"
              >
                {isExpanded ? 'Less' : `+${variations.length - 3}`}
              </button>
            )}
          </div>
        )}

        {/* Expanded Variation List */}
        {isExpanded && variations.length > 3 && (
          <div
            className="mt-2 p-1.5 rounded-xl bg-[var(--input)] border border-card-border max-h-32 overflow-y-auto space-y-1 scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            {variations.map((v, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedVariantIndex(idx)}
                className={`p-1 rounded-lg flex items-center justify-between text-[10px] cursor-pointer transition-colors ${
                  selectedVariantIndex === idx
                    ? 'bg-surface text-foreground font-bold border border-foreground/30'
                    : 'text-muted hover:text-foreground hover:bg-surface/50'
                }`}
              >
                <span className="truncate max-w-[130px]">{v.variationLabel}</span>
                <span className="font-mono text-[9px]">{v.calsPer100g || v.calories} kcal</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nutrition Metrics & Action Button */}
      <div className="mt-3 pt-2.5 border-t border-card-border flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-foreground">{servingCals}</span>
            <span className="text-[10px] font-mono text-muted">kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted mt-0.5">
            <span className="text-cyan-400 font-semibold">{servingProt}g P</span>
            <span>·</span>
            <span className="text-amber-400 font-semibold">{servingCarbs}g C</span>
            <span>·</span>
            <span className="text-rose-400 font-semibold">{servingFat}g F</span>
          </div>
        </div>

        {/* 1-Click Quick Add Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className={`px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold text-xs transition-all cursor-pointer border-none shrink-0 active:scale-95 shadow-xs ${
            justAdded
              ? 'bg-emerald-500 text-black'
              : 'bg-[var(--input)] text-foreground hover:bg-acid-green hover:text-accent-foreground border border-card-border'
          }`}
          title={`Log to ${currentMealSlot.toUpperCase()}`}
          aria-label={`Log to ${currentMealSlot.toUpperCase()}`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
