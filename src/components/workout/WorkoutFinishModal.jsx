import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Dumbbell, Clock, Sparkles, CheckCircle2, Bot, Award, ArrowRight } from 'lucide-react';
import { Button } from '../../design-system/components/UIPrimitives';

export default function WorkoutFinishModal({
  isOpen,
  workoutSummary,
  onClose,
  onViewSummary
}) {
  if (!isOpen || !workoutSummary) return null;

  const {
    title = 'Workout Complete',
    durationMinutes = 45,
    totalVolumeKg = 0,
    exerciseCount = 5,
    prs = [],
    xpEarned = 95,
    bestPerformance = null,
    aiSummary = null
  } = workoutSummary;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 shadow-2xl text-center space-y-6 overflow-hidden relative"
        >
          {/* Subtle Ambient Background Flare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

          {/* Trophy & Badge */}
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center mb-2 shadow-lg shadow-accent/20">
              <Trophy className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-accent font-mono">
              WORKOUT COMPLETE
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight mt-0.5">
              {title}
            </h2>
          </div>

          {/* 4 Metrics Readout */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-surface-elevated border border-card-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Duration</span>
              <span className="text-xl font-black text-foreground font-mono">{durationMinutes} min</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-elevated border border-card-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Total Volume</span>
              <span className="text-xl font-black text-accent font-mono">{totalVolumeKg.toLocaleString()} kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-elevated border border-card-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Exercises</span>
              <span className="text-xl font-black text-foreground font-mono">{exerciseCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-surface-elevated border border-card-border/60">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">XP Awarded</span>
              <span className="text-xl font-black text-amber-400 font-mono">+{xpEarned} XP</span>
            </div>
          </div>

          {/* PRs Achievement Banner if any */}
          {prs && prs.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block">
                  {prs.length} New Personal {prs.length === 1 ? 'Record' : 'Records'} 🔥
                </span>
                <p className="text-xs font-bold text-foreground truncate">
                  {prs.map(p => `${p.exerciseName} (${p.value})`).join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Best Performance Highlight */}
          {bestPerformance && (
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-card-border text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-accent font-mono block">
                BEST PERFORMANCE
              </span>
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>{bestPerformance.exerciseName}</span>
                <span className="text-accent font-mono">{bestPerformance.highlight}</span>
              </div>
            </div>
          )}

          {/* AI Analysis & Recovery Suggestion */}
          <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-card-border/70 text-left space-y-2">
            <div className="flex items-center gap-1.5 text-accent text-xs font-black uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>Calyxo Post-Workout Review</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aiSummary || `Great intensity! You completed ${exerciseCount} movements with clean execution. Prioritize high-protein recovery nutrition and 7–8 hours of restful sleep tonight.`}
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              fullWidth={true}
              size="lg"
              onClick={onClose}
            >
              Done & Save Workout
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
