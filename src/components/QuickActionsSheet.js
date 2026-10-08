import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, Utensils, Droplets, Scale, Activity, TrendingUp } from 'lucide-react';
import useQuickActionsStore from '../store/useQuickActionsStore';

export default function QuickActionsSheet({ isOpen, onClose, onAction }) {
  const setActiveWorkflow = useQuickActionsStore((state) => state.setActiveWorkflow);

  if (!isOpen) return null;

  const primaryActions = [
    { 
      id: 'log_meal', 
      label: 'Log Meal', 
      desc: 'Track calories & macros',
      icon: Utensils, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10 border-emerald-500/20' 
    },
    { 
      id: 'log_workout', 
      label: 'Log Workout', 
      desc: 'Sets, reps & weights',
      icon: Dumbbell, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10 border-cyan-500/20' 
    },
    { 
      id: 'log_water', 
      label: 'Log Water', 
      desc: 'Quick hydration intake',
      icon: Droplets, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10 border-blue-500/20' 
    },
    { 
      id: 'update_weight', 
      label: 'Log Weight', 
      desc: 'Update body composition',
      icon: Scale, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10 border-amber-500/20' 
    },
  ];

  const secondaryActions = [
    { 
      id: 'anatomy_target', 
      label: 'Target Muscle', 
      desc: 'Interactive anatomy map',
      icon: Activity, 
      color: 'text-accent', 
      bg: 'bg-accent/10 border-accent/20' 
    },
    { 
      id: 'progress_photo', 
      label: 'Progress Photos', 
      desc: 'Visual timeline check-in',
      icon: TrendingUp, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10 border-purple-500/20' 
    },
  ];

  const handleAction = (id) => {
    setActiveWorkflow(id);
    if (onAction) onAction(id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Sheet / Modal */}
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="relative w-full sm:max-w-md bg-surface border-t sm:border border-card-border rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col focus:outline-none overflow-hidden pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto mb-4" />
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-card-border/60">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-foreground font-mono">
                QUICK ACTIONS
              </h2>
              <p className="text-[11px] text-muted font-medium mt-0.5">1-tap daily athletic logging</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-[var(--input)] hover:bg-surface-interactive border border-card-border text-muted hover:text-foreground active:scale-95 transition-all outline-none cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary 4-grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {primaryActions.map(action => (
              <button 
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="flex flex-col p-3.5 rounded-2xl bg-surface-elevated hover:bg-[var(--input)] border border-card-border hover:border-accent/40 transition-all duration-150 outline-none group text-left active:scale-[0.98] select-none cursor-pointer shadow-xs"
              >
                <div className={`w-9 h-9 rounded-xl ${action.bg} border flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shrink-0`}>
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <span className="text-xs font-black uppercase tracking-wide text-foreground group-hover:text-accent transition-colors">
                  {action.label}
                </span>
                <span className="text-[10px] text-muted font-medium mt-0.5 line-clamp-1">
                  {action.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Secondary 2-row */}
          <div className="grid grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-card-border/60">
            {secondaryActions.map(action => (
              <button 
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-elevated/70 hover:bg-[var(--input)] border border-card-border/70 hover:border-accent/30 transition-all outline-none group text-left active:scale-[0.98] cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-lg ${action.bg} border flex items-center justify-center shrink-0`}>
                  <action.icon className={`w-3.5 h-3.5 ${action.color}`} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-foreground group-hover:text-accent transition-colors block truncate">
                    {action.label}
                  </span>
                  <span className="text-[9px] text-muted block truncate font-mono">
                    {action.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
