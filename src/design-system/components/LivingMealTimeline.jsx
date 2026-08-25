import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudSun, Moon, Cookie, Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

const MEAL_SLOTS = [
  { id: 'Breakfast', label: 'Breakfast', timeRange: '8:00 AM - 10:30 AM', icon: Sun, color: '#16A34A', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'Lunch', label: 'Lunch', timeRange: '12:30 PM - 2:30 PM', icon: CloudSun, color: '#0284C7', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { id: 'Dinner', label: 'Dinner', timeRange: '7:30 PM - 9:30 PM', icon: Moon, color: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'Snacks', label: 'Snacks', timeRange: 'Anytime Fuel', icon: Cookie, color: '#D97706', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
];

export default function LivingMealTimeline({
  foodLogs = [],
  onOpenAddModal = () => {},
  onEditFoodLog = () => {},
  onDeleteFoodLog = () => {}
}) {
  const [expandedSlots, setExpandedSlots] = useState({
    Breakfast: true,
    Lunch: true,
    Dinner: true,
    Snacks: true
  });

  const toggleSlot = (slotId) => {
    setExpandedSlots(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  const getSlotLogs = (slotId) => {
    return foodLogs.filter(item => {
      const slot = item.mealSlot || item.category || item.mealType || 'Snacks';
      return slot.toLowerCase() === slotId.toLowerCase();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-secondary block">
            Living Daily Stream
          </span>
          <h3 className="text-sm sm:text-base font-black text-foreground">Today's Meals Timeline</h3>
        </div>
        <span className="text-[10px] font-mono text-muted">
          {foodLogs.length} item(s) logged
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
        {MEAL_SLOTS.map((slot) => {
          const Icon = slot.icon;
          const slotLogs = getSlotLogs(slot.id);
          const isExpanded = expandedSlots[slot.id];

          // Compute slot subtotal
          const slotCals = slotLogs.reduce((acc, x) => acc + (Number(x.calories) || 0), 0);
          const slotProt = Math.round(slotLogs.reduce((acc, x) => acc + (Number(x.protein) || 0), 0) * 10) / 10;
          const slotCarbs = Math.round(slotLogs.reduce((acc, x) => acc + (Number(x.carbs) || 0), 0) * 10) / 10;
          const slotFat = Math.round(slotLogs.reduce((acc, x) => acc + (Number(x.fat) || 0), 0) * 10) / 10;

          return (
            <div key={slot.id} className="relative">
              {/* Timeline Connector Node */}
              <div 
                className="absolute -left-[30px] top-3.5 w-4 h-4 rounded-full bg-background border-2 flex items-center justify-center shadow-xs"
                style={{ borderColor: slot.color }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: slot.color }} />
              </div>

              {/* Slot Card */}
              <div className="rounded-2xl bg-surface border border-card-border overflow-hidden shadow-xs">
                {/* Slot Header */}
                <div 
                  onClick={() => toggleSlot(slot.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${slot.bg} ${slot.border} border flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" style={{ color: slot.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{slot.label}</span>
                        {slotCals > 0 && (
                          <span className="text-[10px] font-mono font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                            {slotCals} kcal
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-muted">{slot.timeRange}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {slotLogs.length > 0 && (
                      <span className="text-[10px] text-secondary font-mono hidden sm:inline">
                        P: {slotProt}g · C: {slotCarbs}g · F: {slotFat}g
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                  </div>
                </div>

                {/* Slot Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-card-border/60 px-3.5 py-3 space-y-2.5 bg-surface-subtle/50"
                    >
                      {slotLogs.length > 0 ? (
                        <>
                          <div className="space-y-2">
                            {slotLogs.map((item, idx) => (
                              <div 
                                key={item.id || idx}
                                className="p-2.5 rounded-xl bg-surface border border-card-border flex items-center justify-between gap-2 shadow-xs"
                              >
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-foreground block truncate">{item.name}</span>
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-secondary mt-0.5">
                                    <span className="text-accent font-black">{item.calories} kcal</span>
                                    <span>•</span>
                                    <span>P: {item.protein}g</span>
                                    <span>C: {item.carbs}g</span>
                                    <span>F: {item.fat}g</span>
                                    {item.portionWeight && (
                                      <>
                                        <span>•</span>
                                        <span>{item.portionWeight}g</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onEditFoodLog(item); }}
                                    className="p-1.5 rounded-lg text-muted hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
                                    title="Edit meal"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteFoodLog(item.id); }}
                                    className="p-1.5 rounded-lg text-muted hover:text-rose-500 transition-colors cursor-pointer border-none bg-transparent"
                                    title="Delete meal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenAddModal(slot.id)}
                            className="w-full py-2 px-3 rounded-xl bg-surface hover:bg-surface-interactive text-foreground text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-dashed border-card-border"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add more to {slot.label}</span>
                          </button>
                        </>
                      ) : (
                        <div className="py-4 text-center space-y-2">
                          <p className="text-[11px] text-muted">Nothing logged yet for {slot.label.toLowerCase()}</p>
                          <button
                            type="button"
                            onClick={() => onOpenAddModal(slot.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-accent hover:text-accent-foreground text-foreground text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer border border-card-border active:scale-95 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Log {slot.label}</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
