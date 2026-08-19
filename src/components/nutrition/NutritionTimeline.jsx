import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Trash2, Edit2, Sparkles, Utensils } from 'lucide-react';

export default function NutritionTimeline({
  foodLogs,
  selectedDate,
  formatDisplayDate,
  onEditFoodLog,
  onDeleteFoodLog,
  activeMacroFilter
}) {
  if (!foodLogs || foodLogs.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-surface/40 border border-dashed border-card-border rounded-3xl space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-acid-green mx-auto">
          <Utensils className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            No Meals Logged for {formatDisplayDate(selectedDate)}
          </h3>
          <p className="text-xs text-muted font-medium mt-1 max-w-sm mx-auto">
            Browse our curated food carousels, regional specialties, or tap any quick-add staple below to start your day!
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-acid-green" /> Logged Intake Timeline ({foodLogs.length} items)
        </h2>
        <span className="text-[10px] font-bold text-muted uppercase">
          {formatDisplayDate(selectedDate)}
        </span>
      </div>

      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-card-border">
        {foodLogs.map((item, idx) => {
          const logDate = item.timestamp ? new Date(item.timestamp) : new Date();
          const timeStr = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isHighInFilteredMacro = activeMacroFilter === 'protein' ? (Number(item.protein) >= 15) :
                                       activeMacroFilter === 'carbs' ? (Number(item.carbs) >= 25) :
                                       activeMacroFilter === 'fat' ? (Number(item.fat) >= 10) : false;

          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                isHighInFilteredMacro
                  ? 'bg-acid-green/10 border-acid-green/40 shadow-lg'
                  : 'bg-surface/70 border-card-border/80 hover:border-card-border'
              }`}
            >
              {/* Timeline Bullet Node */}
              <div className={`absolute -left-[27px] w-3.5 h-3.5 rounded-full border-2 bg-surface ${
                isHighInFilteredMacro ? 'border-acid-green bg-acid-green' : 'border-card-border'
              }`} />

              {/* Item Info */}
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-muted uppercase bg-[var(--input)] px-2 py-0.5 rounded-md">
                    {timeStr}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-foreground truncate">
                    {item.name}
                  </h4>
                  {item.portionWeight && (
                    <span className="text-[10px] text-muted font-bold">
                      ({item.portionWeight}g)
                    </span>
                  )}
                </div>

                {/* Macro breakdown */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted mt-1">
                  <span className="text-foreground font-black">{item.calories} kcal</span>
                  <span>·</span>
                  <span className="text-cyan-400 font-extrabold">{item.protein}g P</span>
                  <span>·</span>
                  <span className="text-amber-400 font-extrabold">{item.carbs}g C</span>
                  <span>·</span>
                  <span className="text-rose-400 font-extrabold">{item.fat}g F</span>
                </div>
              </div>

              {/* Actions: Edit & Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onEditFoodLog(item)}
                  className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-[var(--input)] transition-colors cursor-pointer border-none bg-transparent"
                  title="Edit portion or macros"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteFoodLog(item.id)}
                  className="p-2 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                  title="Remove meal log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
