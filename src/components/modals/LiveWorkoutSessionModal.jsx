import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, CheckCircle2, Droplets, Clock, Dumbbell, Sparkles, 
  RotateCcw, Volume2, ChevronRight, Award, Flame, Heart, AlertCircle
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getExerciseImage, getDistinctFallback } from '../../utils/exerciseSearch';
import { addWorkoutLog } from '../../lib/dbService';
import { calculateWorkoutCaloriesBurned } from '../../utils/workoutUtils';
import { scheduleExactNotification, cancelNotification } from '../../services/notificationService';

export default function LiveWorkoutSessionModal({ isOpen, onClose, routine, onNotification }) {
  const user = useStore(state => state.user);
  const addWorkoutLogStore = useStore(state => state.addWorkoutLog);
  const addWaterIntakeStore = useStore(state => state.addWaterIntake);

  const [sessionState, setSessionState] = useState('PREVIEW'); // PREVIEW | EXERCISING | REST_SET | REST_EXERCISE | COMPLETED
  const [exIndex, setExIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(1);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [completedLogs, setCompletedLogs] = useState([]);
  const [waterLoggedThisBreak, setWaterLoggedThisBreak] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  // Track active notification ID so we can cancel before scheduling a replacement
  const activeRestNotifIdRef = useRef(null);

  const exercises = routine?.workout?.exercises || [];
  const currentEx = exercises[exIndex] || null;

  // Helper to parse sets and reps from details string like "4 sets × 12 reps"
  const parsedStats = useMemo(() => {
    if (!currentEx?.details) return { totalSets: 4, targetReps: 10, category: 'Strength' };
    const str = currentEx.details.toLowerCase();
    
    let totalSets = 4;
    let targetReps = 10;
    let category = 'Strength';

    const setsMatch = str.match(/(\d+)\s*set/);
    if (setsMatch) totalSets = Math.min(20, Math.max(1, parseInt(setsMatch[1], 10)));

    const repsMatch = str.match(/(\d+)\s*rep/);
    if (repsMatch) targetReps = Math.min(200, Math.max(1, parseInt(repsMatch[1], 10)));

    if (str.includes('min') || str.includes('cardio') || str.includes('run')) category = 'Cardio';

    return { totalSets, targetReps, category };
  }, [currentEx]);

  // Reset inputs when changing exercise
  useEffect(() => {
    if (currentEx) {
      setRepsInput(String(parsedStats.targetReps || 10));
      setWeightInput('');
      setSetIndex(1);
    }
  }, [exIndex, currentEx, parsedStats]);

  // Push Notification & Sound Chime Helper
  const playAlertChime = (freq = 800) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq + 400, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio Context sound error", e);
    }
  };

  const restEndTimeRef = useRef(null);

  const sendBrowserNotification = (title, body) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(title, { 
            body, 
            icon: "/favicon.ico", 
            tag: "rest-timer",
            requireInteraction: true 
          });
        } catch (e) {
          console.warn("Browser notification failed", e);
        }
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(perm => {
          if (perm === "granted") {
            try {
              new Notification(title, { 
                body, 
                icon: "/favicon.ico", 
                tag: "rest-timer",
                requireInteraction: true 
              });
            } catch (e) {
              console.warn("Browser notification failed", e);
            }
          }
        });
      }
    }
  };

  // Background-Resilient Rest Timer Effect with Push Notifications
  useEffect(() => {
    let interval = null;
    let timeout = null;

    if (sessionState === 'REST_SET' || sessionState === 'REST_EXERCISE') {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      const handleTimerCompletion = () => {
        restEndTimeRef.current = null;
        playAlertChime(sessionState === 'REST_EXERCISE' ? 900 : 700);
        if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);

        if (sessionState === 'REST_SET') {
          sendBrowserNotification("Rest Time Finished! 💪", `Set rest complete! Time to start Set ${setIndex} of ${currentEx?.name || 'Exercise'}`);
          if (onNotification) onNotification(`Rest time complete! Start Set ${setIndex} of ${currentEx?.name || 'Exercise'}`);
          setSessionState('EXERCISING');
        } else if (sessionState === 'REST_EXERCISE') {
          sendBrowserNotification("Exercise Break Complete! 🏋️‍♂️", `Break over! Next exercise: ${exercises[exIndex + 1]?.name || 'Final Exercise'}`);
          if (onNotification) onNotification(`Exercise break complete! Starting ${exercises[exIndex + 1]?.name || 'Next Exercise'}`);
          setExIndex(idx => idx + 1);
          setWaterLoggedThisBreak(false);
          setSessionState('EXERCISING');
        }
      };

      const remainingMs = restEndTimeRef.current ? Math.max(0, restEndTimeRef.current - Date.now()) : timerSeconds * 1000;
      timeout = setTimeout(handleTimerCompletion, remainingMs);

      interval = setInterval(() => {
        if (restEndTimeRef.current) {
          const leftSecs = Math.max(0, Math.ceil((restEndTimeRef.current - Date.now()) / 1000));
          setTimerSeconds(leftSecs);
        }
      }, 1000);

      const handleVisibilityChange = () => {
        if (!document.hidden && restEndTimeRef.current) {
          const leftSecs = Math.max(0, Math.ceil((restEndTimeRef.current - Date.now()) / 1000));
          setTimerSeconds(leftSecs);
          if (leftSecs <= 0) {
            if (timeout) clearTimeout(timeout);
            handleTimerCompletion();
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      restEndTimeRef.current = null;
    }
  }, [sessionState, setIndex, currentEx, exIndex, exercises, onNotification]);

  if (!isOpen || !routine) return null;

  // Handlers
  const handleStartSession = () => {
    setSessionStartTime(Date.now());
    setExIndex(0);
    setSetIndex(1);
    setCompletedLogs([]);
    setSessionState('EXERCISING');
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleFinishSet = () => {
    const weightNum = parseFloat(weightInput) || 0;
    const repsNum = parseInt(repsInput, 10) || parsedStats.targetReps || 10;

    const logEntry = {
      name: currentEx.name,
      category: parsedStats.category,
      image: getExerciseImage(currentEx),
      sets: 1,
      reps: repsNum,
      weight: weightNum,
      duration: 0,
      timestamp: Date.now()
    };
    logEntry.caloriesBurned = calculateWorkoutCaloriesBurned(logEntry);

    setCompletedLogs(prev => [...prev, logEntry]);
    playAlertChime(600);

    if (setIndex < parsedStats.totalSets) {
      // Advance to next set with 1-min rest
      const nextSetIndex = setIndex + 1;
      setSetIndex(nextSetIndex);
      setTimerSeconds(60); // 1-minute set rest
      restEndTimeRef.current = Date.now() + 60 * 1000;
      setSessionState('REST_SET');

      // Cancel old notification before scheduling a new one
      if (activeRestNotifIdRef.current) {
        cancelNotification(activeRestNotifIdRef.current);
      }
      const notifId = `live-session-ex${exIndex}-set${nextSetIndex}-${Date.now()}`;
      activeRestNotifIdRef.current = notifId;
      scheduleExactNotification({
        id: notifId,
        title: "Rest Time Finished! 💪",
        body: `Set rest complete! Time to start Set ${nextSetIndex} of ${currentEx?.name || 'Exercise'}`,
        delayMs: 60 * 1000,
        tag: 'live-workout-rest',
        type: 'rest_completed',
        exerciseName: currentEx?.name || '',
        setNumber: nextSetIndex
      });
    } else {
      // All sets for this exercise finished
      if (exIndex < exercises.length - 1) {
        // Move to 2-min inter-exercise break & on-screen hydration card
        const nextExName = exercises[exIndex + 1]?.name || 'Next Exercise';
        setTimerSeconds(120); // 2-minute exercise break
        restEndTimeRef.current = Date.now() + 120 * 1000;
        setWaterLoggedThisBreak(false);
        setSessionState('REST_EXERCISE');

        // Cancel old notification before scheduling a new one
        if (activeRestNotifIdRef.current) {
          cancelNotification(activeRestNotifIdRef.current);
        }
        const notifId = `live-session-ex${exIndex + 1}-break-${Date.now()}`;
        activeRestNotifIdRef.current = notifId;
        scheduleExactNotification({
          id: notifId,
          title: "Exercise Break Complete! 🏋️‍♂️",
          body: `Break over! Next exercise: ${nextExName}`,
          delayMs: 120 * 1000,
          tag: 'live-workout-rest',
          type: 'rest_completed',
          exerciseName: nextExName,
          setNumber: 1
        });
      } else {
        // All exercises in routine completed!
        if (activeRestNotifIdRef.current) {
          cancelNotification(activeRestNotifIdRef.current);
          activeRestNotifIdRef.current = null;
        }
        setSessionState('COMPLETED');
        playAlertChime(1000);
      }
    }
  };

  const handleLogWaterInSession = () => {
    addWaterIntakeStore(250);
    setWaterLoggedThisBreak(true);
    playAlertChime(1100);
    if (onNotification) onNotification("Hydrated! +250ml added to your water log.");
  };

  const handleSaveCompletedSession = async () => {
    const userId = user?.uid || user?.id;
    try {
      if (userId && completedLogs.length > 0) {
        await Promise.all(completedLogs.map(item => addWorkoutLog(userId, item)));
      }
      completedLogs.forEach(item => addWorkoutLogStore(item));
      if (onNotification) onNotification(`Saved ${routine.dayName}'s Live Workout Session!`);
    } catch (err) {
      console.error("Failed to save live session logs", err);
    } finally {
      onClose();
    }
  };

  // Helper formatting for timer mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={sessionState === 'PREVIEW' ? onClose : undefined}
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-surface border border-card-border rounded-3xl p-5 sm:p-8 shadow-2xl z-10 overflow-hidden text-foreground my-auto"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-4 border-b border-card-border/60 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-acid-green animate-pulse" />
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
                Guided Live Workout Session
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-card-bg border border-card-border text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MODE 1: PREVIEW BEFORE START */}
          {sessionState === 'PREVIEW' && (
            <div className="space-y-6">
              <div className="bg-card-bg/40 p-4 rounded-2xl border border-card-border/60">
                <span className="text-[10px] font-black uppercase tracking-widest text-acid-green">{routine.dayName}'s Split Routine</span>
                <h3 className="text-lg font-black text-foreground mt-1">{routine.workout?.type}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{routine.workout?.desc}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted block">Exercise Order Sequence ({exercises.length} Total):</span>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-card-border/50 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-card-bg border border-card-border flex items-center justify-center text-[10px] font-black text-acid-green shrink-0">
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-black/40 border border-card-border/50">
                          <img src={getExerciseImage(ex)} alt={ex.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-foreground truncate">{ex.name}</span>
                      </div>
                      <span className="text-[10px] text-muted font-medium shrink-0">{ex.details}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartSession}
                className="w-full py-4 rounded-2xl bg-acid-green text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-acid-green/20 hover:brightness-110 active:scale-[0.98] transition-all border-none"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Live Workout Session Now
              </button>
            </div>
          )}

          {/* MODE 2: EXERCISING CURRENT SET */}
          {sessionState === 'EXERCISING' && currentEx && (
            <div className="space-y-6">
              {/* Progress Pill */}
              <div className="flex justify-between items-center text-xs font-bold text-muted border-b border-card-border/40 pb-3">
                <span>Exercise {exIndex + 1} of {exercises.length}</span>
                <span className="text-acid-green font-black">Set {setIndex} of {parsedStats.totalSets}</span>
              </div>

              {/* Current Exercise Visual Card */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-card-bg/40 p-4 rounded-2xl border border-card-border/70">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black/50 border border-card-border/80 shrink-0 shadow-md">
                  <img src={getExerciseImage(currentEx)} alt={currentEx.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col text-center sm:text-left min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-acid-green">{currentEx.target || currentEx.body_part || 'Target Workout'}</span>
                  <h3 className="text-base sm:text-lg font-black text-foreground capitalize mt-0.5 truncate">{currentEx.name}</h3>
                  <p className="text-xs text-muted mt-1 font-medium">{currentEx.details}</p>
                </div>
              </div>

              {/* Set Input Box */}
              <div className="grid grid-cols-2 gap-4 bg-surface p-4 rounded-2xl border border-card-border">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="0"
                    className="bg-[var(--input)] border border-card-border focus:border-acid-green text-foreground text-center font-bold text-lg py-2.5 rounded-xl outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted">Reps Performed</label>
                  <input
                    type="number"
                    value={repsInput}
                    onChange={(e) => setRepsInput(e.target.value)}
                    placeholder="10"
                    className="bg-[var(--input)] border border-card-border focus:border-acid-green text-foreground text-center font-bold text-lg py-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleFinishSet}
                className="w-full py-4 rounded-2xl bg-acid-green text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-acid-green/20 hover:brightness-110 active:scale-[0.98] transition-all border-none"
              >
                <CheckCircle2 className="w-5 h-5" />
                {setIndex < parsedStats.totalSets 
                  ? `Complete Set ${setIndex} (${60}s Rest Next)` 
                  : exIndex < exercises.length - 1 
                    ? `Finish Exercise & Take 2-Min Break` 
                    : `Finish Final Exercise`}
              </button>
            </div>
          )}

          {/* MODE 3: 1-MINUTE SET REST TIMER */}
          {sessionState === 'REST_SET' && (
            <div className="space-y-6 text-center py-4">
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-acid-green px-3 py-1 rounded-full bg-acid-green/10 border border-acid-green/30">
                  Set Rest Period
                </span>
                <h3 className="text-sm font-bold text-muted">Next up: Set {setIndex} of {parsedStats.totalSets} for {currentEx?.name}</h3>
              </div>

              {/* Timer Display Circle */}
              <div className="w-36 h-36 rounded-full border-4 border-acid-green/40 border-t-acid-green mx-auto flex flex-col items-center justify-center bg-card-bg/60 shadow-2xl animate-pulse">
                <Clock className="w-6 h-6 text-acid-green mb-1" />
                <span className="text-3xl font-black tracking-tight text-foreground font-mono">{formatTime(timerSeconds)}</span>
                <span className="text-[9px] uppercase font-bold text-muted mt-1">Resting...</span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setTimerSeconds(prev => prev + 30)}
                  className="px-4 py-2.5 rounded-xl bg-surface border border-card-border hover:border-foreground text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  +30s Rest
                </button>
                <button
                  onClick={() => { setTimerSeconds(0); setSessionState('EXERCISING'); }}
                  className="px-6 py-2.5 rounded-xl bg-acid-green text-black font-black uppercase tracking-wider text-xs cursor-pointer shadow-md shadow-acid-green/20 border-none hover:brightness-110"
                >
                  Skip Rest & Start Set {setIndex} →
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: 2-MINUTE EXERCISE BREAK + HYDRATION PUSH NOTIFICATION */}
          {sessionState === 'REST_EXERCISE' && (
            <div className="space-y-6 text-center py-2">
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-center gap-2 text-cyan-400 font-black uppercase text-xs tracking-wider">
                  <Droplets className="w-4 h-4 animate-bounce" />
                  <span>Hydration Push Notification</span>
                </div>
                <h3 className="text-base font-black text-foreground">
                  Do you need water? Go have a sip!
                </h3>
                <p className="text-xs text-muted">
                  Stay hydrated between intense exercise sets for peak muscle performance and endurance.
                </p>

                <div className="pt-1">
                  {!waterLoggedThisBreak ? (
                    <button
                      onClick={handleLogWaterInSession}
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border-none shadow-md shadow-cyan-500/20"
                    >
                      <Droplets className="w-4 h-4 fill-current" />
                      Drink Water (+250ml Logged)
                    </button>
                  ) : (
                    <div className="py-2.5 px-4 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 border border-cyan-500/40">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Hydrated! +250ml added to your water log
                    </div>
                  )}
                </div>
              </div>

              {/* 2-Min Exercise Break Timer Display */}
              <div className="w-32 h-32 rounded-full border-4 border-cyan-500/40 border-t-cyan-400 mx-auto flex flex-col items-center justify-center bg-card-bg/60 shadow-2xl">
                <span className="text-2xl font-black tracking-tight text-foreground font-mono">{formatTime(timerSeconds)}</span>
                <span className="text-[9px] uppercase font-bold text-muted mt-1">Exercise Break</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setTimerSeconds(0);
                    setExIndex(idx => idx + 1);
                    setWaterLoggedThisBreak(false);
                    setSessionState('EXERCISING');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-acid-green text-black font-black uppercase tracking-wider text-xs cursor-pointer shadow-lg shadow-acid-green/20 border-none hover:brightness-110 flex items-center justify-center gap-2"
                >
                  Start Next Exercise (#{exIndex + 2}: {exercises[exIndex + 1]?.name}) →
                </button>
              </div>
            </div>
          )}

          {/* MODE 5: SESSION COMPLETED CELEBRATION */}
          {sessionState === 'COMPLETED' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-acid-green/20 border-2 border-acid-green flex items-center justify-center mx-auto text-acid-green shadow-xl shadow-acid-green/20">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">Workout Session Complete!</h3>
                <p className="text-xs text-muted mt-1">Great job completing your live workout routine for {routine.dayName}!</p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-card-bg/40 p-4 rounded-2xl border border-card-border/60 text-center">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-acid-green">{completedLogs.length}</span>
                  <span className="text-[9px] uppercase font-bold text-muted">Sets Recorded</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-foreground">{exercises.length}</span>
                  <span className="text-[9px] uppercase font-bold text-muted">Exercises</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-cyan-400">
                    {completedLogs.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0)} kg
                  </span>
                  <span className="text-[9px] uppercase font-bold text-muted">Volume Lifted</span>
                </div>
              </div>

              <button
                onClick={handleSaveCompletedSession}
                className="w-full py-4 rounded-2xl bg-acid-green text-black font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-acid-green/20 hover:brightness-110 active:scale-[0.98] transition-all border-none"
              >
                <CheckCircle2 className="w-5 h-5" />
                Save Session & Complete
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
