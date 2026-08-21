import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pause, Play, FastForward, X, ChevronDown, ChevronUp, Flame, Heart, Dumbbell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { liveWorkoutEngine, WORKOUT_STATES } from '../services/liveWorkout/LiveWorkoutStateMachine.js';

export default function UniversalLiveHUD() {
  const [engineState, setEngineState] = useState(() => liveWorkoutEngine.getStateSnapshot());
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = liveWorkoutEngine.subscribe(snap => {
      setEngineState(snap);
      if (!snap.isActive) {
        setIsDismissed(false);
        setIsExpanded(false);
      }
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

  if (!isActive || !session || isDismissed) return null;

  // Format Elapsed Workout Time (e.g. 08:42)
  const elapsedMins = Math.floor(elapsedWorkoutSeconds / 60);
  const elapsedSecs = elapsedWorkoutSeconds % 60;
  const formattedElapsed = `${elapsedMins < 10 ? `0${elapsedMins}` : elapsedMins}:${elapsedSecs < 10 ? `0${elapsedSecs}` : elapsedSecs}`;

  // Format Rest Time (e.g. 00:42)
  const restMins = Math.floor(remainingRestSeconds / 60);
  const restSecs = remainingRestSeconds % 60;
  const formattedRest = `${restMins < 10 ? `0${restMins}` : restMins}:${restSecs < 10 ? `0${restSecs}` : restSecs}`;

  const currentEx = session.exercises?.[session.currentExerciseIndex] || null;
  const nextEx = session.exercises?.[session.currentExerciseIndex + 1] || null;

  const handleOpenWorkout = () => {
    if (location.pathname !== '/user/workout') {
      navigate('/user/workout');
    }
    window.dispatchEvent(new CustomEvent('calyxo_open_active_workout'));
  };

  const handleCompleteSet = (e) => {
    e.stopPropagation();
    liveWorkoutEngine.logCurrentSet();
  };

  const handleSkipRest = (e) => {
    e.stopPropagation();
    liveWorkoutEngine.skipRest();
  };

  const handleTogglePause = (e) => {
    e.stopPropagation();
    liveWorkoutEngine.togglePause();
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: -60, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -60, opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        aria-label="Active Workout Dynamic Island HUD"
        className="fixed top-[calc(0.5rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[9990] w-[calc(100%-1.5rem)] max-w-md"
      >
        {/* Dynamic HUD Container */}
        <div 
          onClick={handleOpenWorkout}
          className={`relative bg-[#070709]/95 text-white rounded-2xl sm:rounded-3xl border border-white/10 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all select-none cursor-pointer overflow-hidden ${
            isResting ? 'border-cyan-500/30' : isPaused ? 'border-amber-500/30' : 'border-emerald-500/30'
          }`}
        >
          {/* Top Bar Row */}
          <div className="flex items-center justify-between gap-2.5">
            {/* Left: Indicator & Exercise Name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                isResting 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400' 
                  : isPaused
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400'
              }`}>
                <Dumbbell className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${
                    isResting ? 'text-cyan-400' : isPaused ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isResting ? 'REST INTERVAL' : `SET ${session.currentSetNumber} / ${session.totalSetsForCurrentEx}`}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/30"></span>
                  <span className="text-[9px] font-mono text-gray-400 font-bold truncate">
                    {session.workoutName || 'Workout'}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white truncate block mt-0.5">
                  {currentEx?.name || 'Exercise'}
                </h4>
              </div>
            </div>

            {/* Right: Timer & Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Live Timer Pill */}
              <div className={`px-2.5 py-1 rounded-lg border font-mono font-black text-xs flex items-center gap-1.5 ${
                isResting 
                  ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400' 
                  : isPaused
                  ? 'bg-amber-500/10 border-amber-400/40 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-400/40 text-emerald-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isResting ? 'bg-cyan-400 animate-ping' : isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`} />
                <span>{isResting ? formattedRest : formattedElapsed}</span>
              </div>

              {/* Action Buttons */}
              {isResting ? (
                <button
                  onClick={handleSkipRest}
                  className="w-7 h-7 rounded-full bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black flex items-center justify-center transition-all cursor-pointer border-none shadow-sm"
                  title="Skip Rest"
                  aria-label="Skip Rest"
                >
                  <FastForward className="w-3.5 h-3.5 fill-black" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteSet}
                  className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black flex items-center justify-center transition-all cursor-pointer border-none shadow-sm"
                  title="Log Set"
                  aria-label="Log Set"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              )}

              <button
                onClick={handleTogglePause}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border-none"
                title={isPaused ? "Resume" : "Pause"}
                aria-label={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-white ml-0.5" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
              </button>

              <button
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                title="Minimize HUD (Workout remains active)"
                aria-label="Dismiss HUD"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
