import React from 'react';
import { Plus, Trash2, Edit2, Clock, Utensils } from 'lucide-react';
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
    { id: 'breakfast', label: 'Breakfast', timeRange: '05:00 - 11:00' },
    { id: 'lunch', label: 'Lunch', timeRange: '11:00 - 16:00' },
    { id: 'dinner', label: 'Dinner', timeRange: '19:00 - 05:00' },
    { id: 'snacks', label: 'Snacks', timeRange: '16:00 - 19:00' }
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

  const hasAnyLogs = foodLogs.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">Chronological Timeline</span>
          <h2 className="text-base font-bold text-foreground">
            Daily Meal Breakdown ({foodLogs.length} logged)
          </h2>
        </div>
        <span className="text-xs font-mono font-medium text-muted">
          {formatDisplayDate(selectedDate)}
        </span>
      </div>

      {!hasAnyLogs ? (
        <div className="p-8 text-center bg-surface border border-dashed border-card-border rounded-2xl space-y-2">
          <Utensils className="w-8 h-8 text-muted mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-foreground">No Meals Logged for this Date</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Use the discovery shelves below or tap quick add on any everyday staple to log your intake.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {SLOTS.map(slot => {
            const slotItems = groupedLogs[slot.id] || [];
            const slotCals = slotItems.reduce((acc, it) => acc + (Number(it.calories) || 0), 0);
            const slotProt = slotItems.reduce((acc, it) => acc + (Number(it.protein) || 0), 0);
            const slotCarbs = slotItems.reduce((acc, it) => acc + (Number(it.carbs) || 0), 0);
            const slotFat = slotItems.reduce((acc, it) => acc + (Number(it.fat) || 0), 0);

            return (
              <div
                key={slot.id}
                className={`p-4 sm:p-5 rounded-2xl bg-surface border transition-all ${
                  slotItems.length > 0 ? 'border-card-border shadow-sm' : 'border-card-border/60 opacity-85'
                }`}
              >
                {/* Slot Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-card-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                      {slot.label}
                    </h3>
                    <span className="text-[10px] font-mono text-muted">
                      ({slot.timeRange})
                    </span>
                  </div>

                  {/* Subtotals & Quick Add Button */}
                  <div className="flex items-center gap-3">
                    {slotItems.length > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-foreground">{slotCals} kcal</span>
                        <div className="flex items-center gap-1 text-[9px] font-mono text-muted">
                          <span className="text-cyan-400 font-bold">{Math.round(slotProt * 10) / 10}g P</span>
                          <span>·</span>
                          <span className="text-amber-400 font-bold">{Math.round(slotCarbs * 10) / 10}g C</span>
                          <span>·</span>
                          <span className="text-rose-400 font-bold">{Math.round(slotFat * 10) / 10}g F</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenSlotAdd && onOpenSlotAdd(slot.id)}
                      className="px-2.5 py-1 bg-[var(--input)] hover:bg-acid-green hover:text-accent-foreground text-foreground text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer border border-card-border flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>

                {/* Slot Items List */}
                {slotItems.length === 0 ? (
                  <div className="py-3 text-center text-xs text-muted font-medium">
                    No foods recorded for {slot.label.toLowerCase()}
                  </div>
                ) : (
                  <div className="divide-y divide-card-border/60 pt-1">
                    {slotItems.map((item, idx) => {
                      const logDate = item.timestamp ? new Date(item.timestamp) : new Date();
                      const timeStr = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isAudited = activeMacroAudit === 'protein' ? (Number(item.protein) >= 15) :
                                        activeMacroAudit === 'carbs' ? (Number(item.carbs) >= 25) :
                                        activeMacroAudit === 'fat' ? (Number(item.fat) >= 10) : false;

                      return (
                        <div
                          key={item.id || idx}
                          className={`py-2.5 flex items-center justify-between gap-3 transition-colors ${
                            isAudited ? 'bg-acid-green/5 px-2 rounded-lg' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-muted bg-[var(--input)] px-1.5 py-0.5 rounded">
                                {timeStr}
                              </span>
                              <span className="text-xs font-bold text-foreground truncate">
                                {item.name}
                              </span>
                              {item.portionWeight && (
                                <span className="text-[10px] font-mono text-muted">
                                  ({item.portionWeight}g)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-mono text-muted mt-0.5">
                              <span className="font-bold text-foreground">{item.calories} kcal</span>
                              <span>·</span>
                              <span className="text-cyan-400 font-bold">{item.protein}g P</span>
                              <span>·</span>
                              <span className="text-amber-400 font-bold">{item.carbs}g C</span>
                              <span>·</span>
                              <span className="text-rose-400 font-bold">{item.fat}g F</span>
                            </div>
                          </div>

                          {/* Item Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onEditFoodLog(item)}
                              className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-[var(--input)] transition-colors cursor-pointer border-none bg-transparent"
                              title="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteFoodLog(item.id)}
                              className="p-1.5 text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                              title="Delete item"
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
            );
          })}
        </div>
      )}
    </section>
  );
}
