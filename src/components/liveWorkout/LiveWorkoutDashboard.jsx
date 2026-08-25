import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle2, Pause, FastForward, Clock, Dumbbell, 
  Flame, Heart, ChevronRight, Activity, ArrowRight, RotateCcw, Award 
} from 'lucide-react';
import { liveWorkoutEngine, WORKOUT_STATES } from '../../services/liveWorkout/LiveWorkoutStateMachine.js';
import { useStore } from '../../store/useStore.js';
import { useEcosystemStore } from '../../store/useEcosystemStore.js';

export default function LiveWorkoutDashboard({ onStartWorkout, onOpenActiveModal, splits = [], activeDay = 0 }) {
  const [engineState, setEngineState] = useState(() => liveWorkoutEngine.getStateSnapshot());
  const workoutLogs = useStore(state => state.workoutLogs || []);
  const ecoStore = useEcosystemStore();
  const bleHR = ecoStore.healthLogs?.heartRate || 0;
  const bleSource = ecoStore.healthLogs?.source || null;

  useEffect(() => {
    const unsub = liveWorkoutEngine.subscribe(snap => {
      setEngineState(snap);
    });

    const interval = setInterval(() => {
      setEngineState(liveWorkoutEngine.getStateSnapshot());
    }, 1000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const { state, session, remainingRestSeconds, elapsedWorkoutSeconds, isActive, isResting, isPaused } = engineState;

  // Format Elapsed Workout Time
  const elapsedMins = Math.floor(elapsedWorkoutSeconds / 60);
  const elapsedSecs = elapsedWorkoutSeconds % 60;
  const formattedElapsed = `${elapsedMins < 10 ? `0${elapsedMins}` : elapsedMins}:${elapsedSecs < 10 ? `0${elapsedSecs}` : elapsedSecs}`;

  // Format Rest Time
  const restMins = Math.floor(remainingRestSeconds / 60);
  const restSecs = remainingRestSeconds % 60;
  const formattedRest = `${restMins < 10 ? `0${restMins}` : restMins}:${restSecs < 10 ? `0${restSecs}` : restSecs}`;

  const currentEx = session?.exercises?.[session?.currentExerciseIndex] || null;
  const nextEx = session?.exercises?.[session?.currentExerciseIndex + 1] || null;

  // Recent 3 verified workout logs
  const recentWorkouts = workoutLogs.slice(0, 3);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ACTIVE WORKOUT TELEMETRY CARD
  // ─────────────────────────────────────────────────────────────────────────────
  if (isActive && session) {
    return (
      <div className="w-full bg-surface border border-card-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card relative overflow-hidden transition-all">
        {/* Subtle Ambient Pulse Background */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isResting ? 'bg-cyan-500' : isPaused ? 'bg-amber-500' : 'bg-accent'
        }`} />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full ${
              isResting ? 'bg-cyan-500 animate-ping' : isPaused ? 'bg-amber-500' : 'bg-accent animate-pulse'
            }`} />
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-foreground uppercase truncate">
              {session.workoutName || 'LIVE WORKOUT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider ${
              isResting 
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' 
                : isPaused 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                : 'bg-accent/15 border-accent/30 text-accent'
            }`}>
              {isResting ? 'RESTING' : isPaused ? 'PAUSED' : '● ACTIVE'}
            </span>
          </div>
        </div>

        {/* Main Exercise & Timer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 items-center">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-secondary uppercase font-mono">
              CURRENT MOVEMENT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight mt-0.5 truncate">
              {currentEx?.name || 'Exercise'}
            </h2>
            <p className="text-xs text-secondary font-medium mt-1">
              Set <strong className="text-foreground font-mono">{session.currentSetNumber}</strong> of <span className="font-mono">{session.totalSetsForCurrentEx}</span>
              {session.currentWeightKg > 0 ? ` • ${session.currentWeightKg} kg` : ''} 
              {session.currentReps > 0 ? ` • ${session.currentReps} reps` : ''}
            </p>
          </div>

          <div className="flex items-center justify-start sm:justify-end gap-3">
            {isResting ? (
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-mono">
                  REST TIMER
                </span>
                <span className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight animate-pulse">
                  {formattedRest}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">
                  ELAPSED TIME
                </span>
                <span className="text-3xl sm:text-4xl font-black text-foreground font-mono tracking-tight">
                  {formattedElapsed}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Segmented Set Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-secondary uppercase">
            <span>Movement Progress</span>
            <span>Set {session.currentSetNumber} / {session.totalSetsForCurrentEx}</span>
          </div>
          <div className="grid grid-flow-col auto-cols-fr gap-1.5 h-2 w-full">
            {Array.from({ length: session.totalSetsForCurrentEx || 1 }).map((_, idx) => {
              const isDone = idx + 1 < session.currentSetNumber;
              const isCurrent = idx + 1 === session.currentSetNumber;
              return (
                <div
                  key={idx}
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDone 
                      ? 'bg-accent' 
                      : isCurrent 
                      ? (isResting ? 'bg-cyan-500 animate-pulse' : 'bg-accent/80 animate-pulse') 
                      : 'bg-surface-subtle border border-card-border/60'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Next Exercise Preview & Real Telemetry Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-card-border/60 text-xs text-secondary">
          <div className="min-w-0">
            {nextEx ? (
              <span className="text-[11px] text-secondary truncate block">
                Up next: <strong className="text-foreground">{nextEx.name}</strong> ({nextEx.details})
              </span>
            ) : (
              <span className="text-[11px] text-muted">
                Final exercise in routine split
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {session.totalVolumeKg > 0 && (
              <span className="text-[11px] text-secondary font-mono">
                Vol: <strong className="text-foreground">{session.totalVolumeKg} kg</strong>
              </span>
            )}
            {bleHR > 0 ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[11px] text-red-500 flex items-center gap-1 font-bold">
                  <Heart className="w-3 h-3 fill-red-500 animate-pulse" /> LIVE {bleHR} BPM {bleSource ? `(${bleSource})` : ''}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-muted font-medium">HR Sensor Ready</span>
            )}
          </div>
        </div>

        {/* Tactile Control Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 pt-4 mt-4 border-t border-card-border/60">
          {isResting && (
            <button
              onClick={() => liveWorkoutEngine.skipRest()}
              className="px-3.5 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-none active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5 fill-current" />
              <span>Skip Rest</span>
            </button>
          )}

          <button
            onClick={() => liveWorkoutEngine.togglePause()}
            className="px-3.5 py-2.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive border border-card-border active:scale-95 text-foreground font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to cancel and discard this live workout session?")) {
                liveWorkoutEngine.cancelWorkout();
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 active:scale-95 text-red-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Discard</span>
          </button>

          <button
            onClick={onOpenActiveModal}
            className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground active:scale-95 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border-none"
          >
            <span>Open Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. IDLE STATE: Sleek Compact Live Launcher Bar
  // ─────────────────────────────────────────────────────────────────────────────
  const todayRoutine = splits[activeDay] || null;

  return (
    <div className="w-full bg-surface border border-card-border rounded-2xl p-3 sm:p-4 shadow-card flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
          <Dumbbell className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted"></span>
            <span className="text-[9.5px] font-black tracking-widest text-secondary uppercase font-mono truncate">
              {todayRoutine?.dayName || "Today"}: {todayRoutine?.workout?.type || "Workout Session"}
            </span>
          </div>
          <p className="text-xs font-black text-foreground truncate mt-0.5">
            {todayRoutine?.workout?.desc || "Strength & Hypertrophy"} · {todayRoutine?.workout?.exercises?.length || 6} exercises
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {todayRoutine && (
          <button
            onClick={() => {
              if (onOpenActiveModal) onOpenActiveModal();
            }}
            className="px-3.5 py-2 rounded-xl bg-accent hover:brightness-110 active:scale-95 text-accent-foreground font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent/20 border-none"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Live</span>
          </button>
        )}
      </div>
    </div>
  );
}
