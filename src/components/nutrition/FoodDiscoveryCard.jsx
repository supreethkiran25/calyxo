import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Star, Sparkles, Scale } from 'lucide-react';

export default function FoodDiscoveryCard({
  food,
  onQuickAdd,
  onOpenPortionModal,
  isFavorite,
  onToggleFavorite,
  badgeText
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const displayName = food.displayName || food.name;
  const cals = food.calsPer100g !== undefined ? food.calsPer100g : (food.calories || 0);
  const prot = food.protPer100g !== undefined ? food.protPer100g : (food.protein || 0);
  const carbs = food.carbsPer100g !== undefined ? food.carbsPer100g : (food.carbs || 0);
  const fat = food.fatPer100g !== undefined ? food.fatPer100g : (food.fat || 0);

  // Is Veg vs Non-Veg determination
  const isNonVeg = (food.category || '').toLowerCase().includes('non-veg') ||
                   (food.category || '').toLowerCase().includes('meat') ||
                   (food.category || '').toLowerCase().includes('chicken') ||
                   (food.category || '').toLowerCase().includes('fish') ||
                   food.name.toLowerCase().includes('chicken') ||
                   food.name.toLowerCase().includes('fish') ||
                   food.name.toLowerCase().includes('mutton') ||
                   food.pref === 'nonveg';

  const isEgg = food.name.toLowerCase().includes('egg') || food.pref === 'egg';

  const handleAddClick = async (e) => {
    e.stopPropagation();
    if (isAdding || justAdded) return;
    setIsAdding(true);
    await onQuickAdd(food);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(food);
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpenPortionModal && onOpenPortionModal(food)}
      className="relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-surface/90 border border-card-border/80 hover:border-acid-green/40 transition-all shadow-md hover:shadow-xl cursor-pointer group min-w-[200px] max-w-[240px] sm:min-w-[220px] shrink-0"
    >
      {/* Top Bar: Diet Icon, Benefit Badge & Star */}
      <div>
        <div className="flex items-center justify-between mb-2">
          {/* Veg/Non-Veg symbol */}
          <div className="flex items-center gap-1.5">
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
              isNonVeg 
                ? 'border-red-500 bg-red-500/10' 
                : isEgg 
                  ? 'border-amber-500 bg-amber-500/10' 
                  : 'border-emerald-500 bg-emerald-500/10'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isNonVeg 
                  ? 'bg-red-500' 
                  : isEgg 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
              }`} />
            </div>

            {badgeText ? (
              <span className="text-[8px] font-black uppercase tracking-wider bg-acid-green/10 text-acid-green border border-acid-green/20 px-1.5 py-0.5 rounded">
                {badgeText}
              </span>
            ) : food.category ? (
              <span className="text-[8px] font-bold uppercase tracking-wider text-muted truncate max-w-[100px]">
                {food.category}
              </span>
            ) : null}
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="p-1 text-muted hover:text-yellow-400 transition-colors bg-transparent border-none cursor-pointer"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
          </button>
        </div>

        {/* Food Title */}
        <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-acid-green transition-colors line-clamp-2 leading-snug">
          {displayName}
        </h4>

        {/* Benefit Tag if available */}
        {food.benefitTag && (
          <span className="inline-block mt-1 text-[9px] text-muted font-medium line-clamp-1">
            {food.benefitTag}
          </span>
        )}
      </div>

      {/* Bottom Area: Macro Badges & Add Button */}
      <div className="mt-3 pt-2.5 border-t border-card-border/60">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-foreground">
              {Math.round(cals)} <span className="text-[9px] text-muted font-bold">kcal</span>
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted mt-0.5">
              <span className="text-cyan-400 font-extrabold">{prot}g P</span>
              <span>·</span>
              <span className="text-amber-400 font-extrabold">{carbs}g C</span>
              <span>·</span>
              <span className="text-rose-400 font-extrabold">{fat}g F</span>
            </div>
          </div>

          {/* Quick 1-Tap Add Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            onClick={handleAddClick}
            disabled={isAdding}
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer border-none shadow-md ${
              justAdded
                ? 'bg-emerald-500 text-black'
                : 'bg-acid-green/15 text-acid-green hover:bg-acid-green hover:text-accent-foreground border border-acid-green/30'
            }`}
            title="1-Tap Quick Log"
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
