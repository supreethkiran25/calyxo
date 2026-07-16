import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, Apple, ScanLine, TrendingUp, MessageSquare, Droplets, Scale } from 'lucide-react';
import useCreateHubStore from '../store/useCreateHubStore';

export default function QuickActionsSheet({ isOpen, onClose, onAction }) {
  const setActiveWorkflow = useCreateHubStore((state) => state.setActiveWorkflow);

  if (!isOpen) return null;

  const actions = [
    { id: 'log_workout', label: 'Log Workout', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10', section: 'Health' },
    { id: 'log_meal', label: 'Log Meal', icon: Apple, color: 'text-green-500', bg: 'bg-green-500/10', section: 'Health' },
    { id: 'scan_food', label: 'Scan Food', icon: ScanLine, color: 'text-orange-500', bg: 'bg-orange-500/10', section: 'Health' },
    { id: 'progress_photo', label: 'Upload Progress', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10', section: 'Health' },
    { id: 'log_water', label: 'Log Water', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10', section: 'Health' },
    { id: 'update_weight', label: 'Update Weight', icon: Scale, color: 'text-amber-500', bg: 'bg-amber-500/10', section: 'Health' },

    { id: 'start_chat', label: 'AI Coach Chat', icon: MessageSquare, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10', section: 'AI' }
  ];

  const sections = ['Health', 'AI'];

  const handleAction = (id) => {
    setActiveWorkflow(id);
    if (onAction) onAction(id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Sheet / Modal */}
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          dragElastic={{ top: 0.1, bottom: 0.8 }}
          onDragEnd={(e, info) => {
            if (info.offset.y > 100) {
              onClose();
            }
          }}
          className="relative w-full sm:max-w-xl bg-surface border-t sm:border border-card-border rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl flex flex-col focus:outline-none overflow-y-auto max-h-[90vh] pb-safe-inset"
        >
          {/* Mobile pull handle */}
          <div className="w-12 h-1.5 bg-card-border rounded-full mx-auto mb-6 sm:hidden cursor-row-resize active:bg-muted" />
          
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Quick Actions</h2>
              <p className="text-xs sm:text-sm text-muted mt-1">Start tracking or create something new.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-[var(--input)] border border-card-border text-muted hover:text-foreground active:scale-95 transition-all outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {sections.map(sectionName => {
              const secActions = actions.filter(a => a.section === sectionName);
              if (secActions.length === 0) return null;
              
              return (
                <div key={sectionName} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] border-b border-card-border/50 pb-1.5">
                    {sectionName}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {secActions.map(action => (
                      <button 
                        key={action.id}
                        onClick={() => handleAction(action.id)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-card-border hover:border-[var(--accent)]/40 hover:bg-[var(--input)] transition-all duration-200 outline-none group text-left min-h-[48px] active:scale-[0.98] select-none"
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <action.icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <span className="text-[11px] font-black text-foreground group-hover:text-[var(--accent)] transition-colors leading-tight">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
