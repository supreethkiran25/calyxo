import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Apple, ScanLine, Image as ImageIcon, Users, MessageSquare, TrendingUp, Target, X } from 'lucide-react';

export default function QuickActionsSheet({ isOpen, onClose, onAction }) {
  if (!isOpen) return null;

  const actions = [
    { id: 'log_workout', label: 'Log Workout', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'log_meal', label: 'Log Meal', icon: Apple, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'scan_food', label: 'Scan Food', icon: ScanLine, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'create_post', label: 'Create Post', icon: ImageIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'create_club', label: 'Create Club', icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'start_chat', label: 'Start AI Chat', icon: MessageSquare, color: 'text-[var(--color-acid-green)]', bg: 'bg-[var(--color-acid-green)]/10' },
    { id: 'progress_photo', label: 'Upload Progress', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'start_challenge', label: 'Start Challenge', icon: Target, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const handleAction = (id) => {
    onAction(id);
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
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Sheet / Modal */}
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full sm:max-w-md bg-surface border-t sm:border border-card-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Mobile pull handle */}
          <div className="w-12 h-1.5 bg-card-border rounded-full mx-auto mb-6 sm:hidden" />
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-foreground">Create</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 gap-y-6 gap-x-2 pb-safe">
            {actions.map(action => (
              <button 
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="flex flex-col items-center gap-2 group outline-none"
              >
                <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center border border-transparent group-hover:border-card-border transition-all group-active:scale-95`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-[10px] font-bold text-muted group-hover:text-foreground text-center leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
