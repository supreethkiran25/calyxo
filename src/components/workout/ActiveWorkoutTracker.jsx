import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Check, Plus, Trash2, Clock, Dumbbell, MoreVertical, 
  RotateCcw, Sparkles, ChevronDown, ChevronUp, Copy, Trophy, X, ShieldAlert 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { addWorkoutLog } from '../../lib/dbService';
import { WorkoutEngine, SET_TYPES } from '../../services/workout/WorkoutEngine';
import WorkoutRestHUD from './WorkoutRestHUD';
import WorkoutFinishModal from './WorkoutFinishModal';
import ExerciseLibraryBrowser from './ExerciseLibraryBrowser';
import { Button, IconButton, Card } from '../../design-system/components/UIPrimitives';
import { getExerciseImage } from '../../utils/exerciseSearch';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export default function ActiveWorkoutTracker({
  initialRoutine = null,
  onClose = () => {},
  onNotification = () => {}
}) {
  const user = useStore(state => state.user);
  const workoutLogs = useStore(state => state.workoutLogs || []);
  const addWorkoutLogStore = useStore(state => state.addWorkoutLog);
  const userId = user?.uid || user?.id;

  // 1. Session State
  const [session, setSession] = useState(() => {
    // Attempt restore from saved crashed or backgrounded session
    const restored = WorkoutEngine.restoreActiveSession();
    if (restored && restored.exercises && restored.exercises.length > 0) {
      return restored;
    }
    return WorkoutEngine.createWorkoutSession({ routine: initialRoutine });
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const started = session?.startedAt || Date.now();
    return Math.max(0, Math.floor((Date.now() - started) / 1000));
  });

  // Rest Timer State
  const [restTimerState, setRestTimerState] = useState({
    active: false,
    durationSeconds: 90,
    nextExerciseName: '',
    nextTarget: ''
  });

  // Modal states
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState(null);

  const triggerHaptic = useCallback(async (style = ImpactStyle.Light) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style });
      }
    } catch (e) {}
  }, []);

  // Continuous Elapsed Workout Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous Auto-Save for Workout Crash/Kill Protection (Section 18)
  useEffect(() => {
    if (session && session.exercises && session.exercises.length > 0) {
      WorkoutEngine.saveActiveSession({
        ...session,
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60))
      });
    }
  }, [session, elapsedSeconds]);

  // Format Elapsed Time
  const elapsedFormatted = useMemo(() => {
    const hrs = Math.floor(elapsedSeconds / 3600);
    const mins = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
    }
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  }, [elapsedSeconds]);

  // Handle Set Completion
  const handleToggleSetComplete = (exIdx, setIdx) => {
    triggerHaptic(ImpactStyle.Medium);

    setSession(prev => {
      const newExercises = [...prev.exercises];
      const targetEx = { ...newExercises[exIdx] };
      const newSets = [...targetEx.sets];
      const targetSet = { ...newSets[setIdx] };

      const willBeCompleted = !targetSet.completed;
      targetSet.completed = willBeCompleted;
      targetSet.timestamp = willBeCompleted ? Date.now() : null;
      newSets[setIdx] = targetSet;
      targetEx.sets = newSets;
      newExercises[exIdx] = targetEx;

      // If completing, launch Rest Timer HUD
      if (willBeCompleted) {
        const nextSet = newSets[setIdx + 1];
        const nextEx = newExercises[exIdx + 1];
        const restSec = Number(targetSet.restSeconds || targetEx.restSeconds || 90);

        let nextName = targetEx.name;
        let nextTargetStr = nextSet ? `Set ${setIdx + 2} • ${targetSet.weight || 0}kg × ${targetSet.reps || 10}` : '';
        if (!nextSet && nextEx) {
          nextName = nextEx.name;
          nextTargetStr = `Next Movement • Set 1`;
        }

        setRestTimerState({
          active: true,
          durationSeconds: restSec,
          nextExerciseName: nextName,
          nextTarget: nextTargetStr
        });
      }

      return { ...prev, exercises: newExercises };
    });
  };

  // Modify Set Field (Weight / Reps / Type)
  const handleUpdateSet = (exIdx, setIdx, field, value) => {
    setSession(prev => {
      const newExercises = [...prev.exercises];
      const targetEx = { ...newExercises[exIdx] };
      const newSets = [...targetEx.sets];
      newSets[setIdx] = { ...newSets[setIdx], [field]: value };
      targetEx.sets = newSets;
      newExercises[exIdx] = targetEx;
      return { ...prev, exercises: newExercises };
    });
  };

  // Add a Set to an Exercise
  const handleAddSet = (exIdx) => {
    triggerHaptic(ImpactStyle.Light);
    setSession(prev => {
      const newExercises = [...prev.exercises];
      const targetEx = { ...newExercises[exIdx] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSetNumber = targetEx.sets.length + 1;

      targetEx.sets = [
        ...targetEx.sets,
        {
          id: `set_${exIdx}_${Date.now()}`,
          setNumber: newSetNumber,
          type: '1',
          weight: lastSet ? lastSet.weight : 0,
          reps: lastSet ? lastSet.reps : 10,
          rpe: 8,
          rir: 2,
          restSeconds: 90,
          completed: false,
          timestamp: null
        }
      ];

      newExercises[exIdx] = targetEx;
      return { ...prev, exercises: newExercises };
    });
  };

  // Remove a Set
  const handleDeleteSet = (exIdx, setIdx) => {
    triggerHaptic(ImpactStyle.Light);
    setSession(prev => {
      const newExercises = [...prev.exercises];
      const targetEx = { ...newExercises[exIdx] };
      targetEx.sets = targetEx.sets
        .filter((_, idx) => idx !== setIdx)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      newExercises[exIdx] = targetEx;
      return { ...prev, exercises: newExercises };
    });
  };

  // Copy Previous Performance for an exercise (Section 14)
  const handleCopyPrevious = (exIdx, previousSets) => {
    if (!previousSets || previousSets.length === 0) return;
    triggerHaptic(ImpactStyle.Medium);

    setSession(prev => {
      const newExercises = [...prev.exercises];
      const targetEx = { ...newExercises[exIdx] };

      targetEx.sets = previousSets.map((ps, idx) => ({
        id: `set_${exIdx}_${idx}_copied`,
        setNumber: idx + 1,
        type: ps.type || '1',
        weight: ps.weight,
        reps: ps.reps,
        rpe: ps.rpe || 8,
        rir: 2,
        restSeconds: 90,
        completed: false,
        timestamp: null
      }));

      newExercises[exIdx] = targetEx;
      return { ...prev, exercises: newExercises };
    });

    if (onNotification) onNotification(`Copied previous performance to ${session.exercises[exIdx]?.name}!`);
  };

  // Add Exercise from Catalog
  const handleAddExerciseFromLibrary = (exercise) => {
    triggerHaptic(ImpactStyle.Medium);
    const exIdx = session.exercises.length;
    const newEx = {
      id: `ex_${exIdx}_${Date.now()}`,
      name: exercise.name,
      target: exercise.target || exercise.body_part || 'Compound',
      equipment: exercise.equipment || 'Barbell',
      supersetGroup: null,
      restSeconds: 90,
      notes: '',
      sets: [
        { id: `set_${exIdx}_0`, setNumber: 1, type: 'W', weight: 0, reps: 10, completed: false, restSeconds: 90 },
        { id: `set_${exIdx}_1`, setNumber: 2, type: '1', weight: 0, reps: 10, completed: false, restSeconds: 90 },
        { id: `set_${exIdx}_2`, setNumber: 3, type: '1', weight: 0, reps: 10, completed: false, restSeconds: 90 }
      ]
    };

    setSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, newEx]
    }));
    setIsExercisePickerOpen(false);
  };

  // Remove Exercise
  const handleDeleteExercise = (exIdx) => {
    triggerHaptic(ImpactStyle.Light);
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== exIdx)
    }));
  };

  // Finish Workout Session
  const handleFinishWorkout = async () => {
    triggerHaptic(ImpactStyle.Heavy);

    // Calculate total volume
    let totalVolumeKg = 0;
    session.exercises.forEach(ex => {
      (ex.sets || []).forEach(s => {
        if (s.completed) {
          totalVolumeKg += (Number(s.weight || 0) * Number(s.reps || 0));
        }
      });
    });

    const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));
    const prsDetected = WorkoutEngine.detectPersonalRecords(session.exercises, workoutLogs);

    // Find best performance
    let bestPerf = null;
    if (prsDetected.length > 0) {
      bestPerf = {
        exerciseName: prsDetected[0].exerciseName,
        highlight: prsDetected[0].value
      };
    } else {
      const topEx = session.exercises[0];
      if (topEx) {
        bestPerf = { exerciseName: topEx.name, highlight: `${topEx.sets.filter(s => s.completed).length} completed sets` };
      }
    }

    const payload = {
      title: session.title || 'Workout Session',
      name: session.title || 'Workout Session',
      duration: durationMins,
      calories: Math.round(durationMins * 7.5),
      caloriesBurned: Math.round(durationMins * 7.5),
      totalVolumeKg,
      notes: session.notes || '',
      exercises: session.exercises,
      prs: prsDetected,
      timestamp: Date.now()
    };

    // Save to Database / Zustand
    if (userId) {
      const saved = await addWorkoutLog(userId, payload);
      if (saved) addWorkoutLogStore(saved);
    } else {
      addWorkoutLogStore(payload);
    }

    // Clear active session storage
    WorkoutEngine.clearActiveSession();

    // Prepare finish modal summary
    setWorkoutSummary({
      title: session.title,
      durationMinutes: durationMins,
      totalVolumeKg,
      exerciseCount: session.exercises.length,
      prs: prsDetected,
      xpEarned: 85 + (prsDetected.length * 20),
      bestPerformance: bestPerf,
      aiSummary: `Excellent session! You pushed through ${durationMins} minutes and lifted ${totalVolumeKg.toLocaleString()} kg total volume across ${session.exercises.length} movements.`
    });

    setFinishModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Header Row */}
      <header className="pt-[max(env(safe-area-inset-top,0px),0.75rem)] border-b border-card-border bg-surface/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm("Minimize active workout? The timer will keep running in the background without data loss.")) {
                onClose();
              }
            }}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer border-none"
            aria-label="Minimize"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {session.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span className="font-bold text-foreground">{elapsedFormatted}</span>
              <span>•</span>
              <span>{session.exercises.length} movements</span>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleFinishWorkout}
        >
          FINISH
        </Button>
      </header>

      {/* Main Exercises List */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28 scrollbar-hide">
        {session.exercises.map((ex, exIdx) => {
          const imgUrl = getExerciseImage(ex);
          const previousPerf = WorkoutEngine.getPreviousPerformance(ex.name, workoutLogs);
          const overloadAdvice = WorkoutEngine.calculateOverloadTarget(previousPerf?.sets, ex.category);

          return (
            <Card key={ex.id || exIdx} className="p-4 sm:p-5 space-y-4">
              {/* Exercise Header */}
              <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-black border border-card-border/80 overflow-hidden shrink-0 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt={ex.name} className="w-full h-full object-cover" />
                    ) : (
                      <Dumbbell className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-foreground capitalize truncate">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-muted-foreground capitalize font-mono">
                      {ex.target || 'Compound'} • {ex.equipment || 'Barbell'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {previousPerf && (
                    <button
                      type="button"
                      onClick={() => handleCopyPrevious(exIdx, previousPerf.sets)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-interactive text-xs font-bold text-foreground flex items-center gap-1.5 transition-all border border-card-border cursor-pointer active:scale-95"
                      title="Copy previous performance"
                    >
                      <Copy className="w-3.5 h-3.5 text-accent" />
                      <span className="hidden sm:inline">Copy Previous</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteExercise(exIdx)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer border-none bg-transparent"
                    title="Remove Exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Previous Performance Banner (Section 14) */}
              {previousPerf ? (
                <div className="p-2.5 rounded-xl bg-surface-elevated/70 border border-card-border/50 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground uppercase tracking-wider text-[10px]">
                      LAST SESSION:
                    </span>
                    <span>
                      {previousPerf.sets.map(s => `${s.weight}kg × ${s.reps}`).join(' • ')}
                    </span>
                  </div>
                  {overloadAdvice && (
                    <span className="text-[11px] text-accent font-semibold">
                      Target: {overloadAdvice.recommendedWeight > 0 ? `${overloadAdvice.recommendedWeight}kg` : ''} {overloadAdvice.recommendedReps}
                    </span>
                  )}
                </div>
              ) : null}

              {/* Set Table */}
              <div className="space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono px-2">
                  <div className="col-span-2 text-center">SET</div>
                  <div className="col-span-3 text-center">PREVIOUS</div>
                  <div className="col-span-3 text-center">KG</div>
                  <div className="col-span-2 text-center">REPS</div>
                  <div className="col-span-2 text-center">✓</div>
                </div>

                {/* Set Rows */}
                {ex.sets.map((set, setIdx) => {
                  const prevSet = previousPerf?.sets?.[setIdx];
                  const setTypeObj = SET_TYPES[Object.keys(SET_TYPES).find(k => SET_TYPES[k].id === set.type)] || SET_TYPES.WORKING;

                  return (
                    <div
                      key={set.id || setIdx}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border transition-all ${
                        set.completed
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-surface-elevated border-card-border/80'
                      }`}
                    >
                      {/* Set Number & Type Toggle */}
                      <div className="col-span-2 flex items-center justify-center">
                        <select
                          value={set.type}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'type', e.target.value)}
                          className="w-8 h-8 rounded-lg bg-surface border border-card-border text-xs font-black text-center font-mono text-foreground focus:outline-none cursor-pointer"
                        >
                          <option value="W">W</option>
                          <option value="1">1</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                          <option value="A">A</option>
                          <option value="RP">RP</option>
                          <option value="M">M</option>
                        </select>
                      </div>

                      {/* Previous Performance Readout */}
                      <div className="col-span-3 text-center text-xs font-mono text-muted-foreground truncate">
                        {prevSet ? `${prevSet.weight} × ${prevSet.reps}` : '—'}
                      </div>

                      {/* Weight (KG) Input with Steppers */}
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          inputMode="decimal"
                          value={set.weight || ''}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weight', e.target.value)}
                          placeholder="0"
                          className="w-16 min-h-[38px] rounded-xl bg-surface border border-card-border text-center text-sm font-black font-mono text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-2 flex items-center justify-center">
                        <input
                          type="number"
                          step="1"
                          inputMode="numeric"
                          value={set.reps || ''}
                          onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                          placeholder="10"
                          className="w-12 min-h-[38px] rounded-xl bg-surface border border-card-border text-center text-sm font-black font-mono text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>

                      {/* Checkmark Button */}
                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 border-none ${
                            set.completed
                              ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/30'
                              : 'bg-surface hover:bg-surface-elevated text-muted-foreground border border-card-border'
                          }`}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Set Button */}
              <button
                type="button"
                onClick={() => handleAddSet(exIdx)}
                className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-interactive border border-dashed border-card-border text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-accent" />
                <span>Add Set</span>
              </button>
            </Card>
          );
        })}

        {/* Add Exercise Primary Action */}
        <Button
          variant="secondary"
          fullWidth={true}
          size="lg"
          icon={Plus}
          onClick={() => setIsExercisePickerOpen(true)}
        >
          Add Exercise to Workout
        </Button>
      </main>

      {/* Floating Rest Timer HUD (Section 17) */}
      <WorkoutRestHUD
        isActive={restTimerState.active}
        durationSeconds={restTimerState.durationSeconds}
        nextExerciseName={restTimerState.nextExerciseName}
        nextTarget={restTimerState.nextTarget}
        onComplete={() => setRestTimerState(prev => ({ ...prev, active: false }))}
        onSkip={() => setRestTimerState(prev => ({ ...prev, active: false }))}
        onAddSeconds={(sec) => setRestTimerState(prev => ({ ...prev, durationSeconds: prev.durationSeconds + sec }))}
      />

      {/* Exercise Picker Modal */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-6">
          <div className="w-full max-w-2xl mx-auto flex-1 bg-surface border border-card-border rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-card-border mb-4">
              <h3 className="text-base font-black text-foreground uppercase tracking-wider">
                Select Exercise
              </h3>
              <button
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <ExerciseLibraryBrowser
                onAddToWorkout={handleAddExerciseFromLibrary}
                selectionMode={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Workout Finish Celebration Modal (Section 19) */}
      <WorkoutFinishModal
        isOpen={finishModalOpen}
        workoutSummary={workoutSummary}
        onClose={() => {
          setFinishModalOpen(false);
          onClose();
        }}
      />
    </div>
  );
}
