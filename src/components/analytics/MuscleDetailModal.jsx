import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Dumbbell, Activity, ShieldCheck, Flame, CheckCircle, 
  Plus, Sparkles, Zap, ChevronRight, Play 
} from 'lucide-react';
import { STIMULUS_LEVELS } from '../../services/analytics/MuscleStimulusEngine';
import useQuickActionsStore from '../../store/useQuickActionsStore';

export const RECOMMENDED_MUSCLE_EXERCISES = {
  abs: {
    role: 'Trunk Flexion, Core Stabilization & Spinal Protection',
    exercises: [
      { name: 'Hanging Leg Raise', type: 'Core / Strength', equipment: 'Pull-up Bar' },
      { name: 'Cable Crunch', type: 'Weighted Core', equipment: 'Cable Machine' },
      { name: 'Plank', type: 'Isometric Stability', equipment: 'Bodyweight' },
      { name: 'Crunches', type: 'Bodyweight Hypertrophy', equipment: 'Floor' },
      { name: 'Ab Wheel Rollout', type: 'Core Anti-Extension', equipment: 'Ab Wheel' }
    ]
  },
  obliques: {
    role: 'Lateral Flexion, Torso Rotation & Anti-Rotation',
    exercises: [
      { name: 'Russian Twist', type: 'Rotational Core', equipment: 'Bodyweight / Plate' },
      { name: 'Side Plank', type: 'Isometric Stability', equipment: 'Bodyweight' },
      { name: 'Cable Woodchopper', type: 'Rotational Power', equipment: 'Cable Machine' }
    ]
  },
  serratus: {
    role: 'Scapular Protraction & Overhead Stability',
    exercises: [
      { name: 'Push-Up Plus', type: 'Scapular Protraction', equipment: 'Bodyweight' },
      { name: 'Dumbbell Pullover', type: 'Serratus Stretch', equipment: 'Dumbbell' }
    ]
  },
  chest: {
    role: 'Horizontal Pressing, Shoulder Flexion & Adduction',
    exercises: [
      { name: 'Bench Press', type: 'Compound Strength', equipment: 'Barbell' },
      { name: 'Incline Dumbbell Press', type: 'Upper Chest Hypertrophy', equipment: 'Dumbbells' },
      { name: 'Cable Fly', type: 'Chest Isolation', equipment: 'Cable Machine' },
      { name: 'Push-Up', type: 'Bodyweight Conditioning', equipment: 'Bodyweight' },
      { name: 'Dips', type: 'Compound Press', equipment: 'Parallel Bars' }
    ]
  },
  upperBack: {
    role: 'Scapular Retraction, Horizontal & Vertical Pulling',
    exercises: [
      { name: 'Lat Pulldown', type: 'Vertical Pull', equipment: 'Cable Machine' },
      { name: 'Barbell Row', type: 'Compound Pull', equipment: 'Barbell' },
      { name: 'Pull-Up', type: 'Bodyweight Pull', equipment: 'Pull-up Bar' },
      { name: 'Seated Cable Row', type: 'Horizontal Pull', equipment: 'Cable Machine' }
    ]
  },
  lowerBack: {
    role: 'Spinal Extension & Posterior Chain Stabilization',
    exercises: [
      { name: 'Romanian Deadlift', type: 'Posterior Chain', equipment: 'Barbell / Dumbbells' },
      { name: 'Deadlift', type: 'Full Body Compound', equipment: 'Barbell' },
      { name: 'Hyperextensions', type: 'Spinal Extension', equipment: 'Bench' }
    ]
  },
  deltoids: {
    role: 'Arm Abduction, Overhead Pressing & Shoulder Stability',
    exercises: [
      { name: 'Overhead Press', type: 'Vertical Press', equipment: 'Barbell' },
      { name: 'Lateral Raise', type: 'Side Delt Isolation', equipment: 'Dumbbells' },
      { name: 'Face Pull', type: 'Rear Delt & Posture', equipment: 'Cable / Rope' },
      { name: 'Incline Dumbbell Press', type: 'Front Delt / Upper Chest', equipment: 'Dumbbells' }
    ]
  },
  frontDeltoid: {
    role: 'Shoulder Flexion & Anterior Arm Elevation',
    exercises: [
      { name: 'Military Press', type: 'Overhead Press', equipment: 'Barbell' },
      { name: 'Incline Bench Press', type: 'Compound Press', equipment: 'Barbell' },
      { name: 'Front Dumbbell Raise', type: 'Isolation', equipment: 'Dumbbells' }
    ]
  },
  rearDeltoid: {
    role: 'Shoulder Horizontal Abduction & External Rotation',
    exercises: [
      { name: 'Face Pull', type: 'Rear Delt / Upper Back', equipment: 'Cable Machine' },
      { name: 'Rear Delt Fly', type: 'Isolation', equipment: 'Dumbbells / Cable' },
      { name: 'Barbell Row', type: 'Compound Pull', equipment: 'Barbell' }
    ]
  },
  biceps: {
    role: 'Elbow Flexion, Forearm Supination & Arm Pulling',
    exercises: [
      { name: 'Barbell Bicep Curl', type: 'Hypertrophy', equipment: 'Barbell' },
      { name: 'Hammer Curl', type: 'Brachialis & Grip', equipment: 'Dumbbells' },
      { name: 'Incline Dumbbell Curl', type: 'Long Head Stretch', equipment: 'Dumbbells' },
      { name: 'Chin-Up', type: 'Compound Pull', equipment: 'Pull-up Bar' }
    ]
  },
  triceps: {
    role: 'Elbow Extension & Lockout Pushing Power',
    exercises: [
      { name: 'Tricep Pushdown', type: 'Isolation', equipment: 'Cable Machine' },
      { name: 'Skull Crusher', type: 'Long Head Triceps', equipment: 'EZ Bar / Dumbbells' },
      { name: 'Dips', type: 'Compound Press', equipment: 'Parallel Bars' },
      { name: 'Close-Grip Bench Press', type: 'Compound Strength', equipment: 'Barbell' }
    ]
  },
  quadriceps: {
    role: 'Knee Extension, Squatting Power & Leg Drive',
    exercises: [
      { name: 'Barbell Squat', type: 'Foundational Compound', equipment: 'Barbell' },
      { name: 'Leg Press', type: 'High-Volume Hypertrophy', equipment: 'Machine' },
      { name: 'Leg Extension', type: 'Quad Isolation', equipment: 'Machine' },
      { name: 'Lunges', type: 'Unilateral Stability', equipment: 'Dumbbells' }
    ]
  },
  hamstring: {
    role: 'Knee Flexion & Hip Extension',
    exercises: [
      { name: 'Romanian Deadlift', type: 'Hip Hinge / Stretch', equipment: 'Barbell' },
      { name: 'Leg Curl', type: 'Knee Flexion Isolation', equipment: 'Machine' },
      { name: 'Deadlift', type: 'Full Body Compound', equipment: 'Barbell' }
    ]
  },
  gluteal: {
    role: 'Hip Extension, Abduction & Rotational Pelvic Drive',
    exercises: [
      { name: 'Barbell Hip Thrust', type: 'Glute Isolation & Power', equipment: 'Barbell' },
      { name: 'Squat', type: 'Compound Movement', equipment: 'Barbell' },
      { name: 'Romanian Deadlift', type: 'Posterior Chain', equipment: 'Barbell' },
      { name: 'Cable Glute Kickback', type: 'Glute Isolation', equipment: 'Cable' }
    ]
  },
  calves: {
    role: 'Plantar Flexion, Ankle Stability & Sprint Propulsion',
    exercises: [
      { name: 'Standing Calf Raise', type: 'Gastrocnemius Focus', equipment: 'Machine / Dumbbell' },
      { name: 'Seated Calf Raise', type: 'Soleus Focus', equipment: 'Machine' }
    ]
  },
  forearm: {
    role: 'Wrist Flexion/Extension & Maximum Grip Strength',
    exercises: [
      { name: 'Farmer\'s Walk', type: 'Isometric Grip', equipment: 'Dumbbells / Trap Bar' },
      { name: 'Wrist Curl', type: 'Forearm Flexion', equipment: 'Barbell / Dumbbell' },
      { name: 'Hammer Curl', type: 'Brachioradialis Focus', equipment: 'Dumbbells' }
    ]
  },
  trapezius: {
    role: 'Scapular Elevation & Neck / Upper Back Stability',
    exercises: [
      { name: 'Barbell Shrug', type: 'Upper Trap Hypertrophy', equipment: 'Barbell' },
      { name: 'Dumbbell Shrug', type: 'Isolation', equipment: 'Dumbbells' },
      { name: 'Face Pull', type: 'Middle & Lower Traps', equipment: 'Cable Machine' }
    ]
  }
};

function resolveMuscleKey(muscle) {
  if (!muscle) return 'abs';
  const name = String(muscle.name || muscle.muscleKey || muscle.id || '').toLowerCase();
  if (name.includes('ab') || name.includes('core')) return 'abs';
  if (name.includes('oblique')) return 'obliques';
  if (name.includes('chest') || name.includes('pec')) return 'chest';
  if (name.includes('upper back') || name.includes('lat') || name.includes('rhomboid')) return 'upperBack';
  if (name.includes('lower back') || name.includes('erector')) return 'lowerBack';
  if (name.includes('front delt')) return 'frontDeltoid';
  if (name.includes('rear delt')) return 'rearDeltoid';
  if (name.includes('delt') || name.includes('shoulder')) return 'deltoids';
  if (name.includes('bicep')) return 'biceps';
  if (name.includes('tricep')) return 'triceps';
  if (name.includes('quad')) return 'quadriceps';
  if (name.includes('hamstring')) return 'hamstring';
  if (name.includes('glute')) return 'gluteal';
  if (name.includes('calf') || name.includes('calves')) return 'calves';
  if (name.includes('forearm')) return 'forearm';
  if (name.includes('trap')) return 'trapezius';
  if (name.includes('serratus')) return 'serratus';
  return 'abs';
}

export default function MuscleDetailModal({
  isOpen = false,
  onClose = () => {},
  muscle = null,
  date = null,
  onTrainMuscle = null
}) {
  if (!isOpen || !muscle) return null;

  const stimulusLevel = muscle.stimulusLevel || STIMULUS_LEVELS.NONE;
  const isTrained = stimulusLevel.level > 0 || (muscle.totalVolumeKg && muscle.totalVolumeKg > 0);
  const muscleKey = resolveMuscleKey(muscle);
  const muscleData = RECOMMENDED_MUSCLE_EXERCISES[muscleKey] || RECOMMENDED_MUSCLE_EXERCISES.abs;
  const muscleDisplayName = muscle.name || muscle.muscleKey || 'Muscle Group';

  const handleTrainMuscleAction = () => {
    onClose();
    if (onTrainMuscle) {
      onTrainMuscle(muscleDisplayName);
    } else {
      useQuickActionsStore.getState().setActiveWorkflow('log_workout', {
        muscle: muscleDisplayName,
        category: muscle.category || 'Strength',
        date: date
      });
    }
  };

  const handleLogSpecificExercise = (exerciseName) => {
    onClose();
    useQuickActionsStore.getState().setActiveWorkflow('log_workout', {
      exerciseName,
      muscle: muscleDisplayName,
      category: muscle.category || 'Strength',
      date: date
    });
  };

  if (typeof document === 'undefined') return null;

  const modalContent = (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Backdrop Tap to Close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Bottom Sheet Container */}
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg bg-surface border-t sm:border border-card-border rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col z-10 max-h-[88dvh] overflow-hidden mt-auto mb-0 sm:my-auto"
        >
          {/* Top Drag Indicator */}
          <div className="pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 bg-muted/40 rounded-full" />
          </div>

          {/* Pinned Sticky Header - Always visible with title and close button */}
          <div className="px-5 sm:px-6 py-3 border-b border-card-border/70 flex items-center justify-between gap-3 shrink-0 bg-surface/95 backdrop-blur-md">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: isTrained ? (stimulusLevel.color || '#22c55e') : 'var(--accent)' }}
                />
                <h2 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-wide truncate">
                  {muscleDisplayName}
                </h2>
              </div>
              <p className="text-[11px] text-muted font-medium capitalize flex items-center gap-1.5 mt-0.5">
                <span>Region: <strong className="text-foreground">{muscle.category || 'Core'}</strong></span>
                <span>•</span>
                <span>{date || 'Today'}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-[var(--input)] hover:bg-surface-interactive text-muted hover:text-foreground cursor-pointer transition-colors border border-card-border shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 overscroll-contain pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
            {/* Recovery & Readiness / Training Status Card */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isTrained 
                  ? 'bg-accent/10 border-accent/30' 
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block font-mono">
                  {isTrained ? 'Training Stimulus Level' : 'Muscle Readiness & Recovery'}
                </span>
                <span
                  className={`text-base sm:text-lg font-black uppercase tracking-wide flex items-center gap-1.5 ${
                    isTrained ? 'text-accent' : 'text-emerald-400'
                  }`}
                >
                  {isTrained ? (
                    <>
                      <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="truncate">{stimulusLevel.label} ({stimulusLevel.level || 1}/4)</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Recovered & Ready (100%)</span>
                    </>
                  )}
                </span>
                <p className="text-[11px] text-muted font-medium mt-0.5 line-clamp-2">
                  {isTrained 
                    ? 'Target stimulus recorded for today.'
                    : 'Fresh muscle group — optimal window to train and stimulate.'}
                </p>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-wider shrink-0 ${
                  isTrained 
                    ? 'bg-accent text-accent-foreground shadow-xs' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isTrained ? 'Stimulated' : 'Ready'}
              </div>
            </div>

            {/* Functional Anatomical Role */}
            {muscleData.role && (
              <div className="p-3 sm:p-3.5 rounded-2xl bg-surface-elevated/70 border border-card-border/80 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted block font-mono">Primary Function</span>
                  <p className="text-xs text-foreground font-semibold leading-relaxed mt-0.5">
                    {muscleData.role}
                  </p>
                </div>
              </div>
            )}

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-elevated border border-card-border text-center">
                <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase tracking-wider block font-mono">Volume</span>
                <span className="text-base sm:text-lg font-black text-accent mt-0.5 block font-mono">
                  {muscle.totalVolumeKg?.toLocaleString() || 0} <span className="text-[10px] font-bold text-muted">kg</span>
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-elevated border border-card-border text-center">
                <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase tracking-wider block font-mono">Total Sets</span>
                <span className="text-base sm:text-lg font-black text-foreground mt-0.5 block font-mono">
                  {muscle.totalSets || 0}
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-surface-elevated border border-card-border text-center">
                <span className="text-[9px] sm:text-[10px] text-muted font-bold uppercase tracking-wider block font-mono">Total Reps</span>
                <span className="text-base sm:text-lg font-black text-foreground mt-0.5 block font-mono">
                  {muscle.totalReps || 0}
                </span>
              </div>
            </div>

            {/* Contributing Exercises (If logged today) */}
            {muscle.contributingExercises && muscle.contributingExercises.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                  Completed Exercises Today ({muscle.contributingExercises.length})
                </h3>

                <div className="space-y-2">
                  {muscle.contributingExercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-surface-elevated border border-card-border/80 flex items-center justify-between gap-3"
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
              </div>
            )}

            {/* ── RECOMMENDED TARGET EXERCISES (Always actionable!) ── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Target Exercises for {muscleDisplayName}
                </h3>
                <span className="text-[10px] font-mono text-muted">1-Tap Quick Log</span>
              </div>

              <div className="space-y-2">
                {muscleData.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-surface-elevated hover:bg-[var(--input)] border border-card-border transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground group-hover:text-accent transition-colors block truncate">
                        {ex.name}
                      </span>
                      <span className="text-[10px] text-muted font-medium block font-mono mt-0.5">
                        {ex.type} • {ex.equipment}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLogSpecificExercise(ex.name)}
                      className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground font-black text-[11px] uppercase tracking-wider inline-flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none shadow-xs shrink-0"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Log</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleTrainMuscleAction}
                className="w-full py-3.5 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-widest transition-all cursor-pointer border-none shadow-lg shadow-accent/20 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-4 h-4" />
                <span>+ Train {muscleDisplayName} (Start Workout)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive text-muted hover:text-foreground font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-card-border"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
