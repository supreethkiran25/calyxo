import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Barcode, Search, PlusCircle, X } from 'lucide-react';
import { MotionVariants } from '../motion/motionPresets';

export default function ContextualNutritionSheet({
  isOpen = false,
  onClose = () => {},
  onSelectAction = () => {},
  onOpenAISuggestions = () => {},
  remainingProtein = 0
}) {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'ai_snap',
      title: 'AI Food Photo Scan',
      desc: 'Instant meal recognition & macro breakdown via Gemini',
      icon: Camera,
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/20'
    },
    {
      id: 'barcode',
      title: 'Scan Barcode',
      desc: 'Lookup exact nutrition from packaged items',
      icon: Barcode,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      id: 'search',
      title: 'Search Food Database',
      desc: 'Browse 100k+ verified Indian & global foods',
      icon: Search,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      id: 'custom',
      title: 'Quick Add Custom Macro',
      desc: 'Directly enter calories, protein, carbs & fat',
      icon: PlusCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          variants={MotionVariants.backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Action Sheet Container */}
        <motion.div
          variants={MotionVariants.sheetBottom}
          initial="hidden"
          animate="visible"
          exit="exit"
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.y > 100 || velocity.y > 500) {
              onClose();
            }
          }}
          className="relative w-full max-w-lg bg-surface border-t border-x border-card-border rounded-t-3xl p-5 pb-8 shadow-2xl space-y-4 z-10 touch-pan-y"
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 rounded-full bg-card-border mx-auto cursor-grab active:cursor-grabbing" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-accent">
                Nutrition Actions
              </span>
              <h3 className="text-base font-black text-foreground">What would you like to add?</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-surface-subtle hover:bg-surface-interactive text-muted hover:text-foreground transition-colors cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Smart AI Prompt Ribbon (if protein is remaining) */}
          {remainingProtein > 0 && (
            <div 
              onClick={() => { onClose(); onOpenAISuggestions(); }}
              className="p-3 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-accent/15 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">
                  You have <strong className="text-accent">{remainingProtein}g protein</strong> left. Need dinner suggestions?
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-accent bg-accent/20 px-2 py-1 rounded-md shrink-0">
                View Ideas →
              </span>
            </div>
          )}

          {/* Action List */}
          <div className="grid grid-cols-1 gap-2.5">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onSelectAction(action.id);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-surface-subtle border border-card-border hover:border-card-border/80 hover:bg-surface-interactive transition-all flex items-center justify-between text-left cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.border} border flex items-center justify-center ${action.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-accent transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-[10px] text-muted">{action.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
