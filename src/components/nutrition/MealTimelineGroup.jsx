import React from 'react';
import { Plus, Trash2, Edit2, Clock, Utensils, Sun, SunMedium, Moon, Coffee } from 'lucide-react';
import { getMealSlotFromTime } from '../../lib/calyxoFoodDiscoveryData';

export default function MealTimelineGroup({
  foodLogs,
  selectedDate,
  formatDisplayDate,
  onEditFoodLog,
  onDeleteFoodLog,
  onOpenSlotAdd,
  activeMacroAudit
}) {
  const SLOTS = [
    { id: 'breakfast', label: 'Breakfast', icon: Sun, timeRange: 'Morning' },
    { id: 'lunch', label: 'Lunch', icon: SunMedium, timeRange: 'Mid-day' },
    { id: 'dinner', label: 'Dinner', icon: Moon, timeRange: 'Evening' },
    { id: 'snacks', label: 'Snacks', icon: Coffee, timeRange: 'Anytime' }
  ];

  // Group logs into their respective slots
  const groupedLogs = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  };

  foodLogs.forEach(log => {
    const slotKey = log.mealSlot || getMealSlotFromTime(log.timestamp);
    if (groupedLogs[slotKey]) {
      groupedLogs[slotKey].push(log);
    } else {
      groupedLogs.snacks.push(log);
    }
  });

  const totalLoggedCount = foodLogs.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
            Daily Meal Diary
          </h2>
          <p className="text-[11px] font-mono text-muted">
            {totalLoggedCount === 0 ? 'No meals logged yet' : `${totalLoggedCount} ${totalLoggedCount === 1 ? 'item' : 'items'} recorded`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {SLOTS.map(slot => {
          const slotItems = groupedLogs[slot.id] || [];
          const slotCals = slotItems.reduce((acc, it) => acc + (Number(it.calories) || 0), 0);
          const slotProt = slotItems.reduce((acc, it) => acc + (Number(it.protein) || 0), 0);
          const slotCarbs = slotItems.reduce((acc, it) => acc + (Number(it.carbs) || 0), 0);
          const slotFat = slotItems.reduce((acc, it) => acc + (Number(it.fat) || 0), 0);
          const SlotIcon = slot.icon;

          return (
            <div
              key={slot.id}
              className={`p-4 sm:p-5 rounded-2xl bg-surface border transition-all flex flex-col justify-between ${
                slotItems.length > 0
                  ? 'border-card-border shadow-xs'
                  : 'border-card-border/60 hover:border-card-border'
              }`}
            >
              {/* Slot Header */}
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-card-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--input)] border border-card-border flex items-center justify-center text-foreground shrink-0">
                      <SlotIcon className="w-3.5 h-3.5 text-acid-green" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        {slot.label}
                      </h3>
                      <span className="text-[10px] font-mono text-muted">
                        {slot.timeRange}
                      </span>
                    </div>
                  </div>

                  {/* Subtotal & Add Button */}
                  <div className="flex items-center gap-2">
                    {slotItems.length > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground block">
                          {slotCals} kcal
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-mono text-muted">
                          <span className="text-cyan-400 font-semibold">{Math.round(slotProt * 10) / 10}g P</span>
                          <span>·</span>
                          <span className="text-amber-400 font-semibold">{Math.round(slotCarbs * 10) / 10}g C</span>
                          <span>·</span>
                          <span className="text-rose-400 font-semibold">{Math.round(slotFat * 10) / 10}g F</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenSlotAdd && onOpenSlotAdd(slot.id)}
                      className="px-2.5 py-1.5 bg-[var(--input)] hover:bg-acid-green hover:text-accent-foreground text-foreground text-xs font-bold rounded-lg transition-colors cursor-pointer border border-card-border flex items-center gap-1 active:scale-95 shadow-xs"
                      title={`Add food to ${slot.label}`}
                      aria-label={`Add food to ${slot.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>

                {/* Slot Items List */}
                {slotItems.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onOpenSlotAdd && onOpenSlotAdd(slot.id)}
                    className="w-full my-3 py-4 border border-dashed border-card-border/80 hover:border-acid-green/60 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-muted hover:text-foreground transition-all cursor-pointer bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5 text-acid-green" />
                    <span>Log {slot.label}</span>
                  </button>
                ) : (
                  <div className="divide-y divide-card-border/60 pt-1">
                    {slotItems.map((item, idx) => {
                      const isAudited = activeMacroAudit === 'protein' ? (Number(item.protein) >= 15) :
                                        activeMacroAudit === 'carbs' ? (Number(item.carbs) >= 25) :
                                        activeMacroAudit === 'fat' ? (Number(item.fat) >= 10) : false;

                      return (
                        <div
                          key={item.id || idx}
                          className={`py-2.5 flex items-center justify-between gap-2.5 transition-colors ${
                            isAudited ? 'bg-acid-green/10 -mx-1 px-2 rounded-lg' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground truncate">
                                {item.name}
                              </span>
                              {item.portionWeight && (
                                <span className="text-[10px] font-mono text-muted shrink-0">
                                  · {item.portionWeight}g
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted mt-0.5">
                              <span className="font-bold text-foreground">{item.calories} kcal</span>
                              <span>·</span>
                              <span className="text-cyan-400 font-semibold">{item.protein}g P</span>
                              <span>·</span>
                              <span className="text-amber-400 font-semibold">{item.carbs}g C</span>
                              <span>·</span>
                              <span className="text-rose-400 font-semibold">{item.fat}g F</span>
                            </div>
                          </div>

                          {/* Item Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onEditFoodLog(item)}
                              className="p-2 text-muted hover:text-foreground rounded-lg hover:bg-[var(--input)] transition-colors cursor-pointer border-none bg-transparent"
                              title="Edit item"
                              aria-label="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteFoodLog(item.id)}
                              className="p-2 text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                              title="Delete item"
                              aria-label="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
