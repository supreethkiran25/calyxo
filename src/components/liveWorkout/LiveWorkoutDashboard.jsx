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
      <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden transition-all">
        {/* Subtle Ambient Pulse Background */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none ${
          isResting ? 'bg-cyan-500/10' : isPaused ? 'bg-amber-500/10' : 'bg-emerald-500/10'
        }`} />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full ${
              isResting ? 'bg-cyan-400 animate-ping' : isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
            }`} />
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-white uppercase truncate">
              {session.workoutName || 'LIVE WORKOUT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider ${
              isResting 
                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300' 
                : isPaused 
                ? 'bg-amber-500/15 border-amber-400/40 text-amber-300' 
                : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
            }`}>
              {isResting ? 'RESTING' : isPaused ? 'PAUSED' : '● ACTIVE'}
            </span>
          </div>
        </div>

        {/* Main Exercise & Timer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 items-center">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              CURRENT MOVEMENT
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mt-0.5 truncate">
              {currentEx?.name || 'Exercise'}
            </h2>
            <p className="text-xs text-gray-300 font-medium mt-1">
              Set <strong className="text-white font-mono">{session.currentSetNumber}</strong> of <span className="font-mono">{session.totalSetsForCurrentEx}</span>
              {session.currentWeightKg > 0 ? ` • ${session.currentWeightKg} kg` : ''} 
              {session.currentReps > 0 ? ` • ${session.currentReps} reps` : ''}
            </p>
          </div>

          <div className="flex sm:justify-end items-center gap-4">
            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                {isResting ? 'REST TIME REMAINING' : 'SESSION TIME'}
              </span>
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                isResting ? 'text-cyan-400' : 'text-white'
              }`}>
                {isResting ? formattedRest : formattedElapsed}
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Set Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] font-bold text-gray-400">
            <span>SET PROGRESSION</span>
            <span className="font-mono">{session.completedSetsTotal} Sets Logged</span>
          </div>
          <div className="grid grid-flow-col auto-cols-fr gap-1.5 h-2 bg-white/5 p-0.5 rounded-full border border-white/10">
            {Array.from({ length: session.totalSetsForCurrentEx }).map((_, idx) => {
              const setNum = idx + 1;
              const isDone = setNum < session.currentSetNumber;
              const isCurrent = setNum === session.currentSetNumber;
              return (
                <div
                  key={idx}
                  className={`h-full rounded-full transition-all duration-300 ${
                    isDone 
                      ? 'bg-emerald-400' 
                      : isCurrent 
                      ? (isResting ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400/80 animate-pulse') 
                      : 'bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Next Exercise Preview & Real Telemetry Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-white/5 text-xs text-gray-300">
          <div className="min-w-0">
            {nextEx ? (
              <span className="text-[11px] text-gray-400 truncate block">
                Up next: <strong className="text-white">{nextEx.name}</strong> ({nextEx.details})
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">
                Final exercise in routine split
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {session.totalVolumeKg > 0 && (
              <span className="text-[11px] text-gray-300 font-mono">
                Vol: <strong className="text-white">{session.totalVolumeKg} kg</strong>
              </span>
            )}
            {bleHR > 0 ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[11px] text-red-400 flex items-center gap-1 font-bold">
                  <Heart className="w-3 h-3 fill-red-400 animate-pulse" /> LIVE {bleHR} BPM {bleSource ? `(${bleSource})` : ''}
                </span>
                {(() => {
                  const maxHR = 190;
                  const pct = Math.round((bleHR / maxHR) * 100);
                  const zone = pct >= 90 ? 5 : pct >= 80 ? 4 : pct >= 70 ? 3 : pct >= 60 ? 2 : 1;
                  const zoneAdvice = zone >= 5 
                    ? "Reduce intensity — HR is above today's recommended zone." 
                    : zone === 4 
                    ? "You're approaching your target intensity." 
                    : "Aerobic base zone active.";
                  return (
                    <div className="text-[10px] text-right">
                      <span className="text-amber-400 font-bold">Zone {zone}</span>
                      <span className="text-gray-400 font-mono ml-1.5">
                        {'█'.repeat(Math.min(10, Math.round(pct / 10)))}{'░'.repeat(Math.max(0, 10 - Math.round(pct / 10)))}
                      </span>
                      <p className="text-[9px] text-gray-400 italic mt-0.5">{zoneAdvice}</p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <span className="text-[10px] text-gray-500 font-medium">HR Sensor Ready</span>
            )}
          </div>
        </div>

        {/* Tactile Control Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 pt-4 mt-4 border-t border-white/10">
          {isResting ? (
            <button
              onClick={() => liveWorkoutEngine.skipRest()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20 border-none"
            >
              <FastForward className="w-4 h-4 fill-black" />
              <span>Skip Rest</span>
            </button>
          ) : (
            <button
              onClick={() => liveWorkoutEngine.logCurrentSet()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 border-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Set {session.currentSetNumber}</span>
            </button>
          )}

          <button
            onClick={() => liveWorkoutEngine.togglePause()}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onOpenActiveModal}
            className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. IDLE STATE: "Nothing is running right now"
  // ─────────────────────────────────────────────────────────────────────────────
  const todayRoutine = splits[activeDay] || null;

  return (
    <div className="w-full bg-[#0a0a0c] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            <span className="text-[10px] sm:text-xs font-black tracking-[0.15em] text-gray-400 uppercase">
              LIVE WORKOUT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Nothing is running right now.
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Start a workout when you're ready. All rest intervals and sets sync natively to Dynamic Island & Notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {todayRoutine && (
            <button
              onClick={() => {
                liveWorkoutEngine.startWorkout(todayRoutine);
                if (onOpenActiveModal) onOpenActiveModal();
              }}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 border-none shrink-0"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start {todayRoutine.dayName || 'Workout'}</span>
            </button>
          )}

          <button
            onClick={onStartWorkout}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>Select Split</span>
          </button>
        </div>
      </div>

      {/* Recent Sessions List */}
      {recentWorkouts.length > 0 && (
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
              RECENT SESSIONS
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Verified Logs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentWorkouts.map((w, idx) => {
              const dateStr = w.date || (w.created_at ? new Date(w.created_at).toLocaleDateString() : 'Recent');
              const setsCount = Array.isArray(w.sets) ? w.sets.length : (Number(w.sets) || 1);
              let tonnage = 0;
              if (Array.isArray(w.sets)) {
                w.sets.forEach(s => {
                  tonnage += (Number(s?.weight) || 0) * (Number(s?.reps) || 0);
                });
              } else {
                tonnage = (Number(w.weight) || 0) * (Number(w.reps) || 0) * (Number(w.sets) || 1);
              }

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>{dateStr}</span>
                      <span className="text-emerald-400 font-bold">{w.duration || 45} mins</span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-1 truncate">
                      {w.exerciseName || w.workoutName || 'Workout Session'}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2.5 mt-2 border-t border-white/5 font-mono">
                    <span>{setsCount} sets</span>
                    {tonnage > 0 && <span>{tonnage} kg vol</span>}
                    {w.caloriesBurned > 0 && <span className="text-orange-400">{w.caloriesBurned} kcal</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
