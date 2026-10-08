import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Dumbbell, Sparkles, User } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useStore } from '../../store/useStore';
import MuscleMapVisualizer from '../analytics/MuscleMapVisualizer';
import MuscleDetailModal from '../analytics/MuscleDetailModal';
import { 
  calculateDailyMuscleStimulus, 
  ANATOMICAL_MUSCLE_GROUPS, 
  STIMULUS_LEVELS 
} from '../../services/analytics/MuscleStimulusEngine';

const QUICK_MUSCLE_CHIPS = [
  { key: 'chest', label: 'Chest', category: 'push' },
  { key: 'abs', label: 'Abdominals', category: 'core' },
  { key: 'upperBack', label: 'Back & Lats', category: 'pull' },
  { key: 'deltoids', label: 'Shoulders', category: 'push' },
  { key: 'biceps', label: 'Biceps', category: 'pull' },
  { key: 'triceps', label: 'Triceps', category: 'push' },
  { key: 'quadriceps', label: 'Quadriceps', category: 'legs' },
  { key: 'hamstring', label: 'Hamstrings', category: 'legs' },
  { key: 'gluteal', label: 'Glutes', category: 'legs' }
];

export default function AnatomyTargetModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const workoutLogs = useStore(state => state.workoutLogs) || [];
  const userProfile = useStore(state => state.userProfile) || {};

  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const userGender = useMemo(() => {
    const raw = String(userProfile?.gender || userProfile?.sex || '').toLowerCase().trim();
    if (raw === 'female' || raw === 'f' || raw.includes('fem') || raw.includes('woman')) {
      return 'female';
    }
    return 'male';
  }, [userProfile]);

  const dailyAnalytics = useMemo(() => {
    return calculateDailyMuscleStimulus(workoutLogs, todayStr);
  }, [workoutLogs, todayStr]);

  if (activeWorkflow !== 'anatomy_target') return null;

  const handleSelectMuscle = (slug, detail) => {
    setSelectedMuscle(detail);
    setIsDetailOpen(true);
  };

  const handleChipSelect = (chip) => {
    const group = ANATOMICAL_MUSCLE_GROUPS[chip.key];
    const detail = dailyAnalytics.muscleDetails[chip.key] || {
      name: group?.name || chip.label,
      muscleKey: chip.key,
      category: chip.category,
      stimulusLevel: STIMULUS_LEVELS.NONE,
      totalVolumeKg: 0,
      totalSets: 0,
      totalReps: 0,
      contributingExercises: []
    };
    setSelectedMuscle(detail);
    setIsDetailOpen(true);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer"
          onClick={closeWorkflow}
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="relative w-full sm:max-w-xl bg-surface border border-card-border rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-card-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-foreground">
                    Target Muscle Anatomy
                  </h2>
                  <p className="text-xs text-muted font-medium">
                    Tap any body part to check stimulus and log target exercises
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] border border-card-border text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Muscle Selector Chips */}
          <div className="py-2.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {QUICK_MUSCLE_CHIPS.map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleChipSelect(chip)}
                className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-accent hover:text-accent-foreground text-foreground text-[11px] font-black uppercase tracking-wider border border-card-border whitespace-nowrap transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Main Visualizer Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-1">
            <MuscleMapVisualizer
              gender={userGender}
              slugColorMap={dailyAnalytics.slugColorMap}
              muscleDetails={dailyAnalytics.muscleDetails}
              onSelectMuscle={handleSelectMuscle}
            />
          </div>

          {/* Footer Instruction */}
          <div className="pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              1-Tap any body part for instant exercises
            </span>
            <button
              type="button"
              onClick={closeWorkflow}
              className="px-4 py-2 rounded-xl bg-surface-elevated text-foreground hover:bg-surface-interactive text-xs font-bold uppercase cursor-pointer border border-card-border transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>

        {/* Nested Detailed Modal */}
        <MuscleDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          muscle={selectedMuscle}
          date={todayStr}
        />
      </div>
    </AnimatePresence>
  );
}
