import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Activity, Plus, Sparkles, ChevronDown, Flame, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function UniversalLiveHUD() {
  const [liveData, setLiveData] = useState(null);
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail) {
        if (e.detail.isEnded) {
          setLiveData(null);
          setRemainingSecs(0);
          setElapsedSecs(0);
        } else {
          setLiveData(e.detail);
          if (e.detail.isResting && e.detail.restDurationSeconds) {
            setRemainingSecs(e.detail.restDurationSeconds);
          }
        }
      }
    };

    window.addEventListener('calyxo_live_activity_sync', handleSync);
    return () => window.removeEventListener('calyxo_live_activity_sync', handleSync);
  }, []);

  // Continuous Elapsed Workout Timer loop (ticks continuously for notchless / Android screens)
  useEffect(() => {
    if (!liveData || liveData.isPaused) return;

    const interval = setInterval(() => {
      setElapsedSecs(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [liveData, liveData?.isPaused]);

  // Countdown loop for rest timer
  useEffect(() => {
    if (!liveData?.isResting || remainingSecs <= 0 || liveData?.isPaused) return;

    const interval = setInterval(() => {
      setRemainingSecs((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [liveData?.isResting, liveData?.isPaused, remainingSecs]);

  if (!liveData) return null;

  const isResting = liveData.isResting && remainingSecs > 0;

  // Format Rest Time
  const restMins = Math.floor(remainingSecs / 60);
  const restRemaining = remainingSecs % 60;
  const restFormatted = `${restMins}:${restRemaining < 10 ? `0${restRemaining}` : restRemaining}`;

  // Format Elapsed Workout Time
  const elapsedMins = Math.floor(elapsedSecs / 60);
  const elapsedRemaining = elapsedSecs % 60;
  const elapsedFormatted = `${elapsedMins}:${elapsedRemaining < 10 ? `0${elapsedRemaining}` : elapsedRemaining}`;

  const handleOpenWorkout = () => {
    if (location.pathname !== '/user/workout') {
      navigate('/user/workout');
    }
    window.dispatchEvent(new CustomEvent('calyxo_open_active_workout'));
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: -60, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -60, opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        aria-label="Active Workout Dynamic Island HUD"
        className="fixed top-[calc(0.5rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[9990] w-[calc(100%-2rem)] max-w-sm"
      >
        {/* Continuous Animated Running Neon Beam Around Island */}
        <div className="relative p-[1.5px] rounded-full sm:rounded-3xl overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(16,185,129,0.3)]">
          
          {/* Animated 360° Conic Laser Runner Line */}
          <div 
            className={`absolute inset-[-100%] animate-[spin_4s_linear_infinite] ${
              isResting 
                ? 'bg-[conic-gradient(from_0deg,transparent_0_300deg,#00F0FF_340deg,#10B981_360deg)]'
                : 'bg-[conic-gradient(from_0deg,transparent_0_300deg,#10B981_340deg,#00F0FF_360deg)]'
            }`}
          />

          {/* Island Body Container */}
          <div 
            className="relative bg-[#070709]/95 text-white rounded-full sm:rounded-3xl border border-white/10 backdrop-blur-2xl px-3.5 py-2 transition-all duration-300 cursor-pointer select-none"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Compact Bar (Dynamic Island & Notchless Pill) */}
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Glowing Pulse Dot & Icon (No Hourglass!) */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                  isResting 
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                }`}>
                  {isResting ? (
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                    <Dumbbell className="w-3.5 h-3.5 animate-pulse" />
                  )}
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isResting ? 'text-cyan-400' : 'text-emerald-400'}`}>
                      {isResting ? 'REST INTERVAL' : `SET ${liveData.currentSet || 1} OF ${liveData.totalSets || 3}`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/40"></span>
                    <span className="text-[9px] font-mono text-gray-400 font-bold">
                      {liveData.currentReps || 10} REPS
                    </span>
                  </div>
                  <span className="text-xs font-black text-white truncate block leading-tight mt-1 font-sans">
                    {liveData.exerciseName || 'Active Exercise'}
                  </span>
                </div>
              </div>

              {/* Running Time (Ticks live on both notchless & dynamic island devices) */}
              <div className="flex items-center gap-2 shrink-0">
                {isResting ? (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-xs font-mono font-black">{restFormatted}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-mono font-black">{elapsedFormatted}</span>
                  </div>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded Dynamic Controls Drawer */}
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 mt-2.5 border-t border-white/10 space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Telemetry Bar */}
                <div className="flex justify-between items-center text-[10px] text-gray-300 font-bold px-1">
                  <span className="truncate max-w-[150px]">
                    Session: <strong className="text-white">{liveData.workoutName || 'Calyxo Routine'}</strong>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {liveData.caloriesBurned > 0 && (
                      <span className="text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {liveData.caloriesBurned} kcal
                      </span>
                    )}
                    {liveData.heartRate > 0 && (
                      <span className="text-red-400 flex items-center gap-0.5">
                        <Heart className="w-3 h-3" /> {liveData.heartRate} bpm
                      </span>
                    )}
                  </div>
                </div>

                {/* Running Progress Bar Beam */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isResting 
                        ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' 
                        : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-pulse'
                    }`}
                    style={{ width: isResting ? `${Math.min(100, (remainingSecs / 60) * 100)}%` : '100%' }}
                  />
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {isResting ? (
                    <button
                      onClick={() => setRemainingSecs(prev => prev + 30)}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer border border-white/15 active:scale-95 transition-all"
                    >
                      <Plus className="w-3 h-3" /> +30s Rest
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenWorkout}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer border border-white/15 active:scale-95 transition-all"
                    >
                      Log Next Set
                    </button>
                  )}

                  <button
                    onClick={handleOpenWorkout}
                    className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.4)] active:scale-95 transition-all border-none"
                  >
                    <Sparkles className="w-3 h-3" /> Focus View
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
