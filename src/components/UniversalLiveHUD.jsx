import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Play, Pause, FastForward, Plus, Sparkles, X, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function UniversalLiveHUD() {
  const [liveData, setLiveData] = useState(null);
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail) {
        if (e.detail.isEnded) {
          setLiveData(null);
          setRemainingSecs(0);
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

  // Countdown loop for rest timer
  useEffect(() => {
    if (!liveData?.isResting || remainingSecs <= 0) return;

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
  }, [liveData?.isResting, remainingSecs]);

  if (!liveData) return null;

  const isResting = liveData.isResting && remainingSecs > 0;
  const mins = Math.floor(remainingSecs / 60);
  const secs = remainingSecs % 60;
  const timeFormatted = `${mins}:${secs < 10 ? `0${secs}` : secs}`;

  const handleOpenWorkout = () => {
    if (location.pathname !== '/user/workout') {
      navigate('/user/workout');
    }
    window.dispatchEvent(new CustomEvent('calyxo_open_active_workout'));
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: -60, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -60, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        aria-label="Active Workout HUD"
        className="fixed top-[calc(0.5rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[9990] w-[calc(100%-2rem)] max-w-sm"
      >
        <div 
          className="bg-black/90 text-white rounded-full sm:rounded-3xl border border-emerald-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-2xl px-3.5 py-2 transition-all duration-300 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Compact Bar (Notch & Punch-hole Camera Universal Pill) */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Dumbbell className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block leading-none">
                  {isResting ? 'REST COUNTDOWN' : `SET ${liveData.currentSet || 1} / ${liveData.totalSets || 3}`}
                </span>
                <span className="text-xs font-black text-white truncate block leading-tight mt-0.5">
                  {liveData.exerciseName || 'Active Exercise'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isResting ? (
                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {timeFormatted}
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">
                  {liveData.currentReps || 10} REPS
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Expanded Controls Drawer */}
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 mt-2 border-t border-white/10 space-y-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center text-[10px] text-gray-300 font-bold px-1">
                <span>Workout: <strong className="text-white">{liveData.workoutName || 'Active Session'}</strong></span>
                {liveData.caloriesBurned > 0 && (
                  <span className="text-amber-400">{liveData.caloriesBurned} kcal</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {isResting ? (
                  <button
                    onClick={() => setRemainingSecs(prev => prev + 30)}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer border border-white/15 active:scale-95 transition-all"
                  >
                    <Plus className="w-3 h-3" /> 30s More
                  </button>
                ) : (
                  <button
                    onClick={handleOpenWorkout}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer border border-white/15 active:scale-95 transition-all"
                  >
                    Log Set
                  </button>
                )}

                <button
                  onClick={handleOpenWorkout}
                  className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border-none"
                >
                  <Sparkles className="w-3 h-3" /> Focus Workout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
