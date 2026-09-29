import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Dumbbell, Play, Plus, Trophy, AlertTriangle, 
  Target, Activity, Flame, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../../design-system/components/UIPrimitives';
import { getExerciseImage } from '../../utils/exerciseSearch';

export default function ExerciseDetailModal({
  isOpen,
  onClose,
  exercise,
  onStartExercise = null,
  onAddToWorkout = null
}) {
  const workoutLogs = useStore(state => state.workoutLogs || []);

  // Compute User's PR Record for this specific exercise
  const userRecord = useMemo(() => {
    if (!exercise?.name) return null;
    const cleanTargetName = exercise.name.toLowerCase().trim();

    let maxWeight = 0;
    let maxWeightReps = 0;
    let maxEst1RM = 0;

    workoutLogs.forEach(w => {
      const exs = Array.isArray(w.exercises) ? w.exercises : [];
      exs.forEach(e => {
        const eName = (e.name || e.title || '').toLowerCase().trim();
        if (eName === cleanTargetName || cleanTargetName.includes(eName) || eName.includes(cleanTargetName)) {
          // Check sets
          const sets = Array.isArray(e.sets) ? e.sets : (Array.isArray(e.completedSets) ? e.completedSets : []);
          sets.forEach(s => {
            const wt = Number(s.weight || s.weightKg || 0);
            const reps = Number(s.reps || 0);
            if (wt > maxWeight) {
              maxWeight = wt;
              maxWeightReps = reps;
            }
            // Epley 1RM formula: weight * (1 + reps / 30)
            if (wt > 0 && reps > 0) {
              const est = Math.round(wt * (1 + (reps / 30)));
              if (est > maxEst1RM) maxEst1RM = est;
            }
          });
        }
      });
    });

    if (maxWeight > 0) {
      return {
        weight: maxWeight,
        reps: maxWeightReps,
        est1RM: maxEst1RM
      };
    }
    return null;
  }, [exercise, workoutLogs]);

  if (!isOpen || !exercise) return null;

  const imageUrl = getExerciseImage(exercise) || exercise.gif_url || exercise.image;

  // Normalize instructions
  const instructionsList = useMemo(() => {
    if (Array.isArray(exercise.instruction_steps) && exercise.instruction_steps.length > 0) {
      return exercise.instruction_steps;
    }
    if (exercise.instructions && typeof exercise.instructions === 'string') {
      return exercise.instructions
        .split(/(?:\r\n|\r|\n|\. )+/)
        .map(s => s.trim())
        .filter(s => s.length > 4);
    }
    return ['Maintain balanced control and full range of motion throughout each rep.'];
  }, [exercise]);

  // Derived common mistakes
  const commonMistakes = useMemo(() => {
    const name = (exercise.name || '').toLowerCase();
    const mistakes = [];
    if (name.includes('bench') || name.includes('press')) {
      mistakes.push('Excessive elbow flaring placing undue stress on the anterior deltoids');
      mistakes.push('Bouncing the barbell off the chest rather than pausing under controlled eccentric tension');
    } else if (name.includes('squat')) {
      mistakes.push('Knees caving inward (valgus collapse) during the concentric ascent');
      mistakes.push('Excessive forward torso lean shifting load onto the lumbar spine');
    } else if (name.includes('deadlift') || name.includes('row')) {
      mistakes.push('Rounding the lower lumbar spine instead of hinging with a braced core');
      mistakes.push('Yanking the weight aggressively off the floor rather than pulling the slack out first');
    } else if (name.includes('curl')) {
      mistakes.push('Swinging the torso to generate momentum rather than isolating the biceps');
    } else {
      mistakes.push('Rushing through the eccentric (lowering) phase and cutting range of motion short');
      mistakes.push('Using excessive momentum rather than controlled muscular contraction');
    }
    return mistakes;
  }, [exercise]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-full max-w-lg max-h-[90vh] bg-surface border border-card-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-card-border">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground font-mono">
              Exercise Details
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
            {/* Header / GIF Animation Preview */}
            <div className="w-full h-52 sm:h-64 rounded-2xl bg-black border border-card-border overflow-hidden flex items-center justify-center relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={exercise.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-accent">
                  <Dumbbell className="w-12 h-12" />
                  <span className="text-xs font-bold uppercase tracking-wider">Exercise Visual</span>
                </div>
              )}
            </div>

            {/* Title & Metadata Tags */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground capitalize tracking-tight">
                {exercise.name}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider border border-accent/20">
                  {exercise.target || exercise.body_part || 'Full Body'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-elevated text-foreground text-xs font-bold uppercase tracking-wider border border-card-border">
                  {exercise.equipment || 'Equipment'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-elevated text-muted-foreground text-xs font-bold uppercase tracking-wider border border-card-border">
                  {exercise.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>

            {/* Muscle Targeting: Primary & Secondary */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-elevated border border-card-border">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-accent font-mono block mb-1">
                  Primary Muscle
                </span>
                <span className="text-sm font-bold text-foreground capitalize">
                  {exercise.target || exercise.muscle_group || 'Target Zone'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono block mb-1">
                  Secondary
                </span>
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {Array.isArray(exercise.secondary_muscles) ? exercise.secondary_muscles.join(', ') : 'Stabilizers'}
                </span>
              </div>
            </div>

            {/* Personal Record (PR) Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface to-surface border border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block">
                    Your Personal Record
                  </span>
                  <div className="text-sm font-black text-foreground font-mono">
                    {userRecord
                      ? `${userRecord.weight} kg × ${userRecord.reps} reps • Est 1RM: ${userRecord.est1RM} kg`
                      : 'No previous logs recorded yet'}
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                How To Perform
              </h3>
              <ol className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed pl-4 list-decimal marker:text-accent marker:font-bold">
                {instructionsList.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Common Mistakes */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Common Mistakes
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-destructive font-bold">⚠</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-card-border bg-surface flex gap-2">
            {onAddToWorkout && (
              <Button
                variant="secondary"
                size="md"
                fullWidth={!onStartExercise}
                icon={Plus}
                onClick={() => {
                  onAddToWorkout(exercise);
                  onClose();
                }}
              >
                Add to Workout
              </Button>
            )}
            {onStartExercise && (
              <Button
                variant="primary"
                size="md"
                fullWidth={true}
                icon={Play}
                onClick={() => {
                  onStartExercise(exercise);
                  onClose();
                }}
              >
                Start Exercise
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
