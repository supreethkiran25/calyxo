import React, { useState } from 'react';
import { Plus, Check, Star } from 'lucide-react';

export default function ConsolidatedFoodCard({
  family,
  onQuickAdd,
  onOpenPortionDrawer,
  isFavorite,
  onToggleFavorite,
  currentMealSlot = 'lunch'
}) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(family.defaultVariantIndex || 0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const variations = family.variations || [];
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
  const dietType = family.dietType || (family.category || '').toLowerCase().includes('non-veg') ? 'nonveg' : 'veg';
  const isNonVeg = dietType === 'nonveg';
  const isEgg = dietType === 'egg';
  const isVegan = dietType === 'vegan';

  const dietTag = isNonVeg ? 'NON-VEG' : isEgg ? 'EGG' : isVegan ? 'VEGAN' : 'VEG';
  const dietColor = isNonVeg ? 'bg-red-500' : isEgg ? 'bg-amber-500' : 'bg-emerald-500';

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isAdding || justAdded) return;
    setIsAdding(true);
    await onQuickAdd({
      ...activeVariant,
      familyName: family.familyName
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
      onClick={() => onOpenPortionDrawer && onOpenPortionDrawer({ ...activeVariant, familyName: family.familyName })}
      className="p-4 rounded-xl bg-surface border border-card-border hover:border-foreground/30 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dietColor}`} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted">
              {dietTag}
            </span>
            <span className="text-[9px] font-mono text-muted">·</span>
            <span className="text-[9px] font-mono uppercase text-muted truncate max-w-[120px]">
              {family.category}
            </span>
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

        {/* Family Title */}
        <h3 className="text-sm font-bold text-foreground group-hover:text-acid-green transition-colors leading-snug">
          {activeVariant.displayName || activeVariant.name || family.familyName}
        </h3>

        {/* Variations Selector Tabs (if multiple variants exist) */}
        {variations.length > 1 && (
          <div className="flex items-center gap-1 pt-2 overflow-x-auto scrollbar-none" onClick={(e) => e.stopPropagation()}>
            {variations.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedVariantIndex(idx)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                  selectedVariantIndex === idx
                    ? 'bg-foreground text-background border-foreground font-bold shadow-xs'
                    : 'bg-[var(--input)] border-card-border/60 text-muted hover:text-foreground'
                }`}
              >
                {v.name.replace(family.shortName, '').trim() || v.name}
              </button>
            ))}
          </div>
        )}

        {/* Standard Serving Size Note */}
        <span className="text-[10px] font-mono text-muted block mt-2">
          Serving: {activeVariant.servingSize || `${pieceWeight}g`}
        </span>

        {/* Benefit Tag */}
        {activeVariant.benefit && (
          <p className="text-[10px] text-muted line-clamp-1 mt-0.5">
            {activeVariant.benefit}
          </p>
        )}
      </div>

      {/* Bottom Nutrition Metrics & Action Button */}
      <div className="mt-3 pt-2.5 border-t border-card-border flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-foreground">{servingCals}</span>
            <span className="text-[9px] font-mono text-muted">kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted mt-0.5">
            <span className="text-cyan-400 font-bold">{servingProt}g P</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">{servingCarbs}g C</span>
            <span>·</span>
            <span className="text-rose-400 font-bold">{servingFat}g F</span>
          </div>
        </div>

        {/* 1-Click Quick Add Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-bold text-xs transition-all cursor-pointer border-none shadow-xs ${
            justAdded
              ? 'bg-emerald-500 text-black'
              : 'bg-[var(--input)] text-foreground hover:bg-acid-green hover:text-accent-foreground border border-card-border'
          }`}
          title={`Log to ${currentMealSlot.toUpperCase()}`}
        >
          {justAdded ? (
            <>
              <Check className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold">Logged</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
