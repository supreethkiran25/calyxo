import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, Activity, ShieldCheck, Flame, CheckCircle } from 'lucide-react';
import { STIMULUS_LEVELS } from '../../services/analytics/MuscleStimulusEngine';

export default function MuscleDetailModal({
  isOpen = false,
  onClose = () => {},
  muscle = null,
  date = null
}) {
  if (!isOpen || !muscle) return null;

  const stimulusLevel = muscle.stimulusLevel || STIMULUS_LEVELS.NONE;
  const isTrained = stimulusLevel.level > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
        
        {/* Backdrop Tap to Close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-surface border border-card-border rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 z-10 max-h-[88vh] overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-card-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: stimulusLevel.color || '#3f3f4c' }}
                />
                <h2 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-wide">
                  {muscle.name || muscle.muscleKey || 'Muscle Group'}
                </h2>
              </div>
              <p className="text-xs text-muted font-medium capitalize">
                Anatomical Region: <span className="text-foreground font-bold">{muscle.category || 'Core'}</span> · {date || 'Today'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-muted hover:text-foreground cursor-pointer transition-colors border-none"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stimulus Level Hero Card */}
          <div
            className="p-4 rounded-2xl border flex items-center justify-between"
            style={{
              borderColor: `${stimulusLevel.color}40`,
              backgroundColor: `${stimulusLevel.color}15`
            }}
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted block font-mono">
                Training Stimulus Level
              </span>
              <span
                className="text-xl font-black uppercase tracking-wide"
                style={{ color: stimulusLevel.color || '#ffffff' }}
              >
                {stimulusLevel.label} ({stimulusLevel.level}/4)
              </span>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-wider"
              style={{
                backgroundColor: stimulusLevel.color,
                color: '#000000'
              }}
            >
              {isTrained ? 'Stimulated' : 'Neutral'}
            </div>
          </div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-card-border">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block font-mono">Volume</span>
              <span className="text-lg font-black text-accent mt-0.5 block font-mono">
                {muscle.totalVolumeKg?.toLocaleString() || 0} <span className="text-xs font-bold">kg</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-card-border">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block font-mono">Total Sets</span>
              <span className="text-lg font-black text-foreground mt-0.5 block font-mono">
                {muscle.totalSets || 0}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-elevated border border-card-border">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block font-mono">Total Reps</span>
              <span className="text-lg font-black text-foreground mt-0.5 block font-mono">
                {muscle.totalReps || 0}
              </span>
            </div>
          </div>

          {/* Contributing Exercises List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5 font-mono">
              <Dumbbell className="w-3.5 h-3.5 text-accent" />
              Contributing Exercises ({muscle.contributingExercises?.length || 0})
            </h3>

            {muscle.contributingExercises && muscle.contributingExercises.length > 0 ? (
              <div className="space-y-2">
                {muscle.contributingExercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-elevated border border-card-border/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block truncate">
                        {ex.name}
                      </span>
                      <span className="text-[10px] text-muted font-medium block font-mono mt-0.5">
                        {ex.sets} sets · {ex.reps} reps {ex.volumeKg > 0 ? `· ${ex.volumeKg} kg volume` : ''}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase font-mono tracking-wider shrink-0 ${
                        ex.contribution === 'Primary'
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : 'bg-surface-subtle text-muted border border-card-border'
                      }`}
                    >
                      {ex.contribution}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border text-center">
                <p className="text-xs text-muted font-medium">
                  No direct exercises recorded for this muscle group on this date.
                </p>
              </div>
            )}
          </div>

          {/* Grounded Clinical Explanation */}
          {isTrained && (
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted leading-relaxed">
                Your <span className="font-bold text-foreground">{muscle.name}</span> received a{' '}
                <span className="font-bold text-foreground">{stimulusLevel.label.toLowerCase()} stimulus</span> based on the{' '}
                <span className="font-bold text-accent">{muscle.contributingExercises?.length || 0} exercises</span> and{' '}
                <span className="font-bold text-accent">{muscle.totalSets || 0} sets</span> you logged.
              </p>
            </div>
          )}

          {/* Close Action */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md shadow-accent/20 hover:brightness-110 active:scale-95"
          >
            Dismiss
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
