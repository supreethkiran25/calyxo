
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  getWorkoutLogs,
  addWorkoutLog,
  updateWorkoutLog,
  deleteWorkoutLog,
  saveEcosystemState,
  getUserAssignments,
  getUserWorkoutSplits,
  saveUserWorkoutSplits
} from '../lib/dbService';
import { supabase } from '../lib/supabaseClient';

import { useEcosystemStore } from '../store/useEcosystemStore';
import useQuickActionsStore from '../store/useQuickActionsStore';
import LiveWorkoutSessionModal from './modals/LiveWorkoutSessionModal';
import LiveWorkoutDashboard from './liveWorkout/LiveWorkoutDashboard.jsx';
import ChallengeModule from './workout/ChallengeModule';
import AIWorkoutCoachCard from './workout/AIWorkoutCoachCard.jsx';
import PremiumFeatureModal from './modals/PremiumFeatureModal.jsx';
import {
  Plus, Dumbbell, Clock, Edit3, X, Check, Search, Trophy, Activity, Move,
  PersonStanding, Target, User, Crosshair, Heart, Share2, ChevronLeft, ChevronRight,
  Calendar, Trash2, Edit2, Play, ChevronUp, ChevronDown, Zap, BarChart2, Flame, Award, Sparkles
} from 'lucide-react';

const globalImageCache = new Map();
const activeFetches = new Set();
import { motion, AnimatePresence } from 'framer-motion';
import { scheduleExactNotification, cancelNotification, triggerOSNotification } from '../services/notificationService';
import LiveActivityManager from '../services/LiveActivityManager';
import { saveActiveRest, loadActiveRest, clearActiveRest } from '../services/restTimerPersistence';

import { searchAndRankExercises, loadExercisesData, getCachedExercises, getExerciseImage, getDistinctFallback } from '../utils/exerciseSearch';
import { getTodayDateString, formatDateToLocalString, getLocalDayOfWeekIndex, isSameLocalDate } from '../utils/dateUtils';
import { calculateWorkoutCaloriesBurned } from '../utils/workoutUtils';

const ExerciseImage = ({ src, alt, category, muscleGroup, className = "w-full h-full object-cover" }) => {
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (src && typeof src === 'string' && src.trim().length > 0 && !src.includes('unsplash.com')) return src;
    return getExerciseImage({ name: alt, category, target: muscleGroup, body_part: muscleGroup });
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (src && typeof src === 'string' && src.trim().length > 0 && !src.includes('unsplash.com')) {
      setCurrentSrc(src);
      setHasError(false);
      return;
    }

    const initial = getExerciseImage({ name: alt, category, target: muscleGroup, body_part: muscleGroup });
    setCurrentSrc(initial);
    setHasError(!initial);

    loadExercisesData().then(() => {
      if (isMounted) {
        const resolved = getExerciseImage({ name: alt, category, target: muscleGroup, body_part: muscleGroup });
        setCurrentSrc(resolved);
        setHasError(!resolved);
      }
    });

    return () => { isMounted = false; };
  }, [src, alt, category, muscleGroup]);

  if (hasError || !currentSrc || typeof currentSrc !== 'string' || currentSrc.includes('unsplash.com')) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-surface via-card-bg to-black flex flex-col items-center justify-center p-3 text-center border border-card-border/40 relative overflow-hidden select-none">
        <div className="w-10 h-10 rounded-2xl bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-acid-green mb-1.5 shadow-inner">
          <Dumbbell className="w-5 h-5 text-acid-green" />
        </div>
        <span className="text-[11px] font-black text-foreground uppercase tracking-wider truncate max-w-full px-1">
          {alt || 'Exercise Visual'}
        </span>
        <span className="text-[8px] text-acid-green font-bold uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-full bg-acid-green/10 border border-acid-green/20">
          {muscleGroup || category || 'Strength'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || 'Exercise'}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

const INITIAL_WORKOUT_SPLITS = [
  {
    dayName: "Monday",
    workout: {
      type: "Push Day (Chest, Shoulders & Triceps)",
      desc: "Upper body pushing mechanics. Focuses on hypertrophy and strength.",
      exercises: [
        { name: "Incline Dumbbell Bench Press", details: "4 sets × 8-10 reps. Focus on slow control." },
        { name: "Overhead Barbell Press", details: "3 sets × 8 reps. Core tight, neutral neck." },
        { name: "Tricep Parallel Dips", details: "3 sets × 12 reps. Keep chest leaned forward." }
      ]
    }
  },
  {
    dayName: "Tuesday",
    workout: {
      type: "Pull Day (Back, Biceps & Rear Delts)",
      desc: "Upper body pulling. Prioritize progressive overload and clean squeeze.",
      exercises: [
        { name: "Weighted Pull-ups / Lat Pulldown", details: "4 sets × 8-10 reps. Full stretch at top." },
        { name: "Bent Over Barbell Rows", details: "4 sets × 8 reps. Keep spine neutral." },
        { name: "Dumbbell Alternate Bicep Curls", details: "3 sets × 12 reps per arm." }
      ]
    }
  },
  {
    dayName: "Wednesday",
    workout: {
      type: "Leg Day (Quads, Hamstrings & Calves)",
      desc: "Lower body strength and conditioning. Compound movements for maximum activation.",
      exercises: [
        { name: "Barbell Back Squats", details: "4 sets × 6-8 reps. Target deep parallel depth." },
        { name: "Romanian Deadlifts (RDLs)", details: "4 sets × 10 reps. Feel hamstring stretch." },
        { name: "Standing Calf Raises", details: "4 sets × 15 reps. Peak hold for 2 seconds." }
      ]
    }
  },
  {
    dayName: "Thursday",
    workout: {
      type: "Active Recovery & Core Conditioning",
      desc: "Low intensity core stabilization and active aerobic recovery.",
      exercises: [
        { name: "Plank Hold", details: "3 sets × 60 seconds. Core and glutes fully braced." },
        { name: "Hanging Knee / Leg Raises", details: "3 sets × 15 reps. Slow leg descent." },
        { name: "Steady-state Incline Walk", details: "30 mins. Keep heart rate around 125 BPM." }
      ]
    }
  },
  {
    dayName: "Friday",
    workout: {
      type: "Upper Body Hypertrophy",
      desc: "Shoulder width, back density, and arm pump volume routine.",
      exercises: [
        { name: "Dumbbell Lateral Shoulder Raises", details: "4 sets × 15 reps. Control descent." },
        { name: "Seated Dumbbell Shoulder Press", details: "4 sets × 10 reps. Avoid elbow flare." },
        { name: "Hammer Curls & Skullcrushers", details: "3 sets × 12 reps. Volume pump superset." }
      ]
    }
  },
  {
    dayName: "Saturday",
    workout: {
      type: "Lower Body & Power Day",
      desc: "Explosive mechanics, glute activation, and calves conditioning.",
      exercises: [
        { name: "Barbell Hip Thrusts", details: "4 sets × 10 reps. Hold contraction for 1 sec." },
        { name: "Heavy Leg Press", details: "3 sets × 10 reps. Focus on deep leg flex." },
        { name: "Standing Calf Raises", details: "3 sets × 20 reps. Perform quick full extensions." }
      ]
    }
  },
  {
    dayName: "Sunday",
    workout: {
      type: "Rest & Active Mobilization",
      desc: "Hydration, active stretching, and parasympathetic system recovery.",
      exercises: [
        { name: "Full Body Static Stretching", details: "15 minutes. Focus on lower back and hips." },
        { name: "Deep Breathing / Meditation", details: "10 minutes. Calms nervous system." }
      ]
    }
  }
];

const FallbackIcon = ({ category, muscleGroup, className }) => {
  if (muscleGroup) {
    const mg = muscleGroup.toLowerCase();
    if (mg.includes('chest')) return <Target className={className} />;
    if (mg.includes('back')) return <Move className={className} />;
    if (mg.includes('leg')) return <PersonStanding className={className} />;
    if (mg.includes('shoulder') || mg.includes('neck')) return <User className={className} />;
    if (mg.includes('arm')) return <Crosshair className={className} />;
    if (mg.includes('waist') || mg.includes('core')) return <Activity className={className} />;
  }
  switch (category) {
    case 'Cardio': return <Activity className={className} />;
    case 'Hypertrophy': return <Move className={className} />;
    case 'Strength':
    default: return <Dumbbell className={className} />;
  }
};


export default function WorkoutLogger({ onNotification }) {
  const user = useStore(state => state.user);
  const workoutLogs = useStore(state => state.workoutLogs);
  const setWorkoutLogs = useStore(state => state.setWorkoutLogs);
  const addWorkoutLogStore = useStore(state => state.addWorkoutLog);
  const updateWorkoutLogStore = useStore(state => state.updateWorkoutLog);
  const deleteWorkoutLogStore = useStore(state => state.deleteWorkoutLog);
  const userId = user?.uid || user?.id;
  const ecoStore = useEcosystemStore();

  const [exercisesData, setExercisesData] = useState(() => getCachedExercises());
  const [challengeFilter, setChallengeFilter] = useState('ALL');

  useEffect(() => {
    loadExercisesData().then(data => {
      if (data && Array.isArray(data)) {
        setExercisesData(data);
      }
    });
  }, []);

  // Date Calendar History State
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());

  const selectedDateWorkoutLogs = useMemo(() => {
    return workoutLogs.filter(x => isSameLocalDate(x.timestamp, selectedDate));
  }, [workoutLogs, selectedDate]);

  const handlePrevDate = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateToLocalString(d));
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateToLocalString(d));
  };

  const handleTodayDate = () => {
    setSelectedDate(getTodayDateString());
  };

  const formatDisplayDate = (dateStr) => {
    const todayStr = getTodayDateString();
    if (dateStr === todayStr) return "Today";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [activeSubTab, setActiveSubTab] = useState('logger');
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('AI Workout Coach');
  const [challengeInputs, setChallengeInputs] = useState({});

  const totalVolumeKg = useMemo(() => {
    return workoutLogs.reduce((acc, log) => {
      const sets = Number(log.sets) || 1;
      const reps = Number(log.reps) || 1;
      const weight = Number(log.weight) || 0;
      return acc + (sets * reps * weight);
    }, 0);
  }, [workoutLogs]);

  const totalSetsLogged = useMemo(() => {
    return workoutLogs.reduce((acc, log) => acc + (Number(log.sets) || 1), 0);
  }, [workoutLogs]);

  const totalCaloriesBurned = useMemo(() => {
    return workoutLogs.reduce((acc, log) => acc + (Number(log.caloriesBurned) || 0), 0);
  }, [workoutLogs]);

  const personalRecords = useMemo(() => {
    const prMap = {};
    workoutLogs.forEach(log => {
      const name = log.name;
      const weight = Number(log.weight) || 0;
      if (weight > 0) {
        if (!prMap[name] || weight > prMap[name].weight) {
          prMap[name] = {
            name,
            weight,
            reps: log.reps || 1,
            sets: log.sets || 1,
            category: log.category || 'Strength',
            date: log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Recent'
          };
        }
      }
    });
    return Object.values(prMap).sort((a, b) => b.weight - a.weight).slice(0, 6);
  }, [workoutLogs]);

  const categoryBreakdown = useMemo(() => {
    const counts = { Strength: 0, Hypertrophy: 0, Cardio: 0, Endurance: 0 };
    workoutLogs.forEach(log => {
      const cat = log.category || 'Strength';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = workoutLogs.length || 1;
    return Object.entries(counts).map(([cat, count]) => ({
      category: cat,
      count,
      pct: Math.round((count / total) * 100)
    }));
  }, [workoutLogs]);

  const [imageTick, setImageTick] = useState(0);

  const fetchImageForExercise = async (name) => {
    if (globalImageCache.has(name) || activeFetches.has(name)) return;
    activeFetches.add(name);
    try {
      const res = await fetch(`https://wger.de/api/v2/exercise/?name__icontains=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const exId = data.results[0].id;
          const imgRes = await fetch(`https://wger.de/api/v2/exerciseimage/?exercise=${exId}`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData.results && imgData.results.length > 0) {
              globalImageCache.set(name, imgData.results[0].image);
              setImageTick(t => t + 1);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.warn("wger image fetch failed for", name, err);
    }
    globalImageCache.set(name, null);
    setImageTick(t => t + 1);
  };

  // Autocomplete search states
  const [exQuery, setExQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Form Fields
  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState('Strength');
  const [exImage, setExImage] = useState(null);
  const [exSets, setExSets] = useState('');
  const [exReps, setExReps] = useState('');
  const [exWeight, setExWeight] = useState('');
  const [exDuration, setExDuration] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit Log State
  const [editingLog, setEditingLog] = useState(null);

  // Weekly Planner states (Persistent via localStorage)
  const [activeDay, setActiveDay] = useState(getLocalDayOfWeekIndex);

  // Automatic 24-Hour Midnight Rollover Effect
  useEffect(() => {
    const updateTimeState = () => {
      const currentToday = getTodayDateString();
      setSelectedDate(prev => {
        // If prev date was yesterday, auto-advance to today's date
        const yesterday = getTodayDateString(new Date(Date.now() - 86400000));
        if (prev === yesterday) return currentToday;
        return prev;
      });
    };

    updateTimeState();
    const timer = setInterval(updateTimeState, 60000);
    return () => clearInterval(timer);
  }, []);
  const [splits, setSplits] = useState(() => {
    try {
      const saved = localStorage.getItem('calyxo_user_workout_splits');
      return saved ? JSON.parse(saved) : INITIAL_WORKOUT_SPLITS;
    } catch (e) {
      return INITIAL_WORKOUT_SPLITS;
    }
  });
  const [editingSplit, setEditingSplit] = useState(false);
  const [editingSplitDayIdx, setEditingSplitDayIdx] = useState(null);
  const [editRoutineFields, setEditRoutineFields] = useState({ type: '', desc: '', exercises: [] });
  const [activeSplitEditIdx, setActiveSplitEditIdx] = useState(null);
  const [splitEditSuggestions, setSplitEditSuggestions] = useState([]);

  // Load Cloud Workout Splits from Supabase & Subscribe to Realtime Cross-Device Sync
  useEffect(() => {
    let isMounted = true;
    const uid = user?.uid || user?.id;

    const loadCloudSplits = async () => {
      if (!uid) return;
      const cloudSplits = await getUserWorkoutSplits(uid);
      if (isMounted && Array.isArray(cloudSplits) && cloudSplits.length === 7) {
        setSplits(cloudSplits);
      }
    };

    loadCloudSplits();

    if (uid) {
      const channel = supabase
        .channel(`workout_splits_realtime_${uid}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'users_metrics', filter: `id=eq.${uid}_profile` },
          () => {
            loadCloudSplits();
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Subscribe to real-time AI workout plan injections
  useEffect(() => {
    const handleSplitsUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length === 7) {
        setSplits(e.detail);
      }
    };
    window.addEventListener('calyxo:workout_splits_updated', handleSplitsUpdate);
    return () => window.removeEventListener('calyxo:workout_splits_updated', handleSplitsUpdate);
  }, []);

  // Live Guided Workout Session Modal State
  const activeWorkflow = useQuickActionsStore(state => state.activeWorkflow);
  const closeWorkflow = useQuickActionsStore(state => state.closeWorkflow);
  const [showLiveSessionModal, setShowLiveSessionModal] = useState(false);
  const [liveSessionRoutine, setLiveSessionRoutine] = useState(null);

  useEffect(() => {
    if (activeWorkflow === 'start_live_session') {
      setLiveSessionRoutine(splits[activeDay]);
      setShowLiveSessionModal(true);
      closeWorkflow();
    }
  }, [activeWorkflow, splits, activeDay, closeWorkflow]);

  // Exercise Library States
  const [libQuery, setLibQuery] = useState('');
  const [libBodyPart, setLibBodyPart] = useState('all');
  const [libTarget, setLibTarget] = useState('all');
  const [libEquipment, setLibEquipment] = useState('all');
  const [libCategory, setLibCategory] = useState('all');
  const [libOnlyFavorites, setLibOnlyFavorites] = useState(false);
  const [libLimit, setLibLimit] = useState(24);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    loadExercisesData();
  }, []);

  const handleOpenExerciseDetail = (ex) => {
    if (!ex) return;
    const exercisesData = getCachedExercises();
    const match = exercisesData.find(x => (x.name || '').toLowerCase().trim() === (ex.name || '').toLowerCase().trim());
    const resolvedImage = getExerciseImage(ex);

    if (match) {
      setSelectedExercise({
        ...match,
        image: match.gif_url || match.image || resolvedImage,
        gif_url: match.gif_url || match.image || resolvedImage
      });
    } else {
      setSelectedExercise({
        id: ex.id || Date.now(),
        name: ex.name,
        category: ex.category || 'Strength',
        target: ex.target || ex.body_part || ex.muscleGroup || 'Full Body',
        body_part: ex.body_part || ex.target || ex.muscleGroup || 'General',
        equipment: ex.equipment || 'Free Weights',
        caloriesEstimate: ex.caloriesEstimate || 8,
        difficulty: ex.difficulty || 'intermediate',
        image: resolvedImage,
        gif_url: resolvedImage,
        instruction_steps: ex.instruction_steps || ex.instructions || [
          "Position yourself with posture tall and core braced.",
          "Perform movement with controlled cadence through full range of motion.",
          "Exhale at apex of contraction and slowly return to starting position."
        ]
      });
    }
  };

  useEffect(() => {
    selectedDateWorkoutLogs.forEach(log => {
      if (!log.image && !globalImageCache.has(log.name)) {
        fetchImageForExercise(log.name);
      }
    });
    splits[activeDay]?.workout?.exercises?.forEach(ex => {
      if (!ex.image && !globalImageCache.has(ex.name)) {
        fetchImageForExercise(ex.name);
      }
    });
  }, [selectedDateWorkoutLogs, splits, activeDay]);

  const [selectedSoreness, setSelectedSoreness] = useState(5);
  const [selectedFatigue, setSelectedFatigue] = useState(5);

  const handleSaveRecovery = async () => {
    const recoveryScore = Math.round(100 - (selectedSoreness * 5 + selectedFatigue * 5));
    const nextHealth = {
      ...(ecoStore.healthLogs || {}),
      soreness: selectedSoreness,
      fatigue: selectedFatigue,
      recovery: recoveryScore
    };

    const prevHealth = ecoStore.healthLogs;
    const prevScore = ecoStore.fitnessScore;

    ecoStore.updateFitnessScore({ dailyScore: Math.max(50, Math.min(100, recoveryScore)) });
    ecoStore.syncEcosystemState({ healthLogs: nextHealth });
    try {
      await saveEcosystemState(userId, useEcosystemStore.getState());
      if (onNotification) onNotification("Recovery metrics logged successfully!");
    } catch (err) {
      console.error("Save recovery log failed", err);
      ecoStore.syncEcosystemState({ healthLogs: prevHealth });
      if (prevScore) ecoStore.updateFitnessScore(prevScore);
      if (onNotification) onNotification("Failed to save recovery metrics. Please try again.");
    }
  };

  const [assignedPlans, setAssignedPlans] = useState([]);

  // Rest Timer States & Logic
  const [restSecondsLeft, setRestSecondsLeft] = useState(null);
  const [restDuration, setRestDuration] = useState(60);
  const restEndTimeRef = useRef(null);

  const sendBrowserNotification = (title, body) => {
    triggerOSNotification(title, body, '/user/dashboard');
  };

  const triggerTimerCompletion = () => {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("AudioContext chime failed", e);
    }
    sendBrowserNotification("Rest Time Finished! 💪", "Rest period complete! Time to start your next set.");
    if (onNotification) onNotification("Rest time complete! Set starts now.");
    // Clear persisted rest state now that it has completed
    clearActiveRest();
    LiveActivityManager.endRestTimer();
  };


  useEffect(() => {
    let interval = null;
    let timeout = null;

    if (restSecondsLeft !== null && restSecondsLeft > 0) {
      if (!restEndTimeRef.current) {
        restEndTimeRef.current = Date.now() + restSecondsLeft * 1000;
      }
      const remainingMs = Math.max(0, restEndTimeRef.current - Date.now());

      timeout = setTimeout(() => {
        triggerTimerCompletion();
        setRestSecondsLeft(null);
        restEndTimeRef.current = null;
      }, remainingMs);

      interval = setInterval(() => {
        const leftSecs = Math.max(0, Math.ceil((restEndTimeRef.current - Date.now()) / 1000));
        setRestSecondsLeft(leftSecs);
      }, 1000);

      const handleVisibilityChange = () => {
        if (!document.hidden && restEndTimeRef.current) {
          const leftSecs = Math.max(0, Math.ceil((restEndTimeRef.current - Date.now()) / 1000));
          setRestSecondsLeft(leftSecs);
          if (leftSecs <= 0) {
            if (timeout) clearTimeout(timeout);
            triggerTimerCompletion();
            setRestSecondsLeft(null);
            restEndTimeRef.current = null;
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
  }, [restSecondsLeft, onNotification]);

  const handleStartRestTimer = async (secs = restDuration, { workoutId = 'workout', exerciseName = '', setNumber = 1 } = {}) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cancel previous rest notification before scheduling a new one
    const prevRest = await loadActiveRest();
    if (prevRest?.notificationId) {
      await cancelNotification(prevRest.notificationId);
    }

    // Unique deterministic notification ID — prevents collisions across consecutive rests
    const safeName = (exerciseName || 'exercise').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
    const notifId = `calyxo.rest.${workoutId}.${safeName}.${setNumber}.${Date.now()}`;

    restEndTimeRef.current = Date.now() + secs * 1000;
    setRestSecondsLeft(secs);

    // Persist rest state with ISO timestamps so it survives force-kill
    await saveActiveRest({
      workoutId,
      exerciseName,
      setNumber,
      durationSeconds: secs,
      notificationId: notifId
    });

    scheduleExactNotification({
      id: notifId,
      title: 'Rest Time Finished! 💪',
      body: exerciseName ? `Rest complete! ${exerciseName} — Set ${setNumber + 1} starts now.` : 'Rest period complete! Time to start your next set.',
      delayMs: secs * 1000,
      tag: 'workout-rest-timer',
      // Deep-link metadata so notification tap opens the workout screen
      type: 'rest_completed',
      workoutId,
      exerciseName,
      setNumber
    });

    LiveActivityManager.startRestTimer(secs);
  };

  // Ensure Workout section opens strictly in IDLE state on mount
  useEffect(() => {
    const checkRestTimer = async () => {
      const restState = await loadActiveRest();

      if (restState && restState.remainingSeconds > 0 && restState.restEndDate) {
        const endMs = new Date(restState.restEndDate).getTime();
        const now = Date.now();
        if (endMs > now) {
          const remaining = Math.ceil((endMs - now) / 1000);
          restEndTimeRef.current = endMs;
          setRestSecondsLeft(remaining);
          LiveActivityManager.reconcileAfterLaunch({ ...restState, remainingSeconds: remaining });
          return;
        }
      }

      // No active ongoing rest — stay completely IDLE
      clearActiveRest();
      LiveActivityManager.endLiveActivity();
    };
    checkRestTimer();
  }, []); // once on mount

  // Hydrate Initial Workout state & Trainer Assignments
  useEffect(() => {
    if (!userId) return;
    const fetchWorkouts = async () => {
      try {
        const data = await getWorkoutLogs(userId);
        // Non-regression guard: only overwrite with empty if store is already empty
        if (data && (data.length > 0 || useStore.getState().workoutLogs.length === 0)) {
          setWorkoutLogs(data);
        }
        const assigns = await getUserAssignments(userId);
        if (assigns && assigns.length > 0) {
          const workoutPlans = assigns.filter(a => a.type === 'workout_plan');
          setAssignedPlans(workoutPlans);
        }
      } catch (err) {
        console.error("Error loading workouts log or assignments", err);
        if (onNotification) onNotification("Failed to load workout logs. Please reload.");
      }
    };
    fetchWorkouts();
  }, [userId, setWorkoutLogs, onNotification]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const matches = searchAndRankExercises(val, exercisesData)
      .map(x => ({
        id: x.id,
        name: x.name,
        category: x.category || "Strength",
        muscleGroup: x.muscle_group || x.body_part,
        image: x.image,
        gif_url: x.gif_url,
        instructions: x.instructions,
        instruction_steps: x.instruction_steps,
        equipment: x.equipment,
        target: x.target,
        body_part: x.body_part,
        caloriesEstimate: x.caloriesEstimate,
        difficulty: x.difficulty
      }));

    setSearchResults(matches.slice(0, 10));
    setShowDropdown(true);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(exQuery);
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [exQuery]);

  const selectExercise = (ex) => {
    setExName(ex.name);
    setExCategory(ex.category || 'Strength');
    setExImage(ex.image || null);
    setExQuery(ex.name);
    setShowDropdown(false);
  };

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!exName.trim() || exName.length > 50) {
      if (onNotification) onNotification("Workout exercise name must be under 50 characters.");
      setLoading(false);
      return;
    }

    const sets = exSets && Number(exSets) > 0 ? Number(exSets) : 3;
    const reps = exReps && Number(exReps) > 0 ? Number(exReps) : 10;
    const weight = exWeight ? Number(exWeight) : 0;
    const duration = exCategory === 'Cardio' ? (exDuration && Number(exDuration) > 0 ? Number(exDuration) : 20) : 0;

    if (exCategory === 'Cardio') {
      if (isNaN(duration) || duration < 1 || duration > 480) {
        if (onNotification) onNotification("Cardio duration must be between 1 and 480 minutes.");
        setLoading(false);
        return;
      }
    } else {
      if (isNaN(sets) || sets < 1 || sets > 100) {
        if (onNotification) onNotification("Workout sets must be between 1 and 100.");
        setLoading(false);
        return;
      }
      if (isNaN(reps) || reps < 1 || reps > 500) {
        if (onNotification) onNotification("Workout reps must be between 1 and 500.");
        setLoading(false);
        return;
      }
      if (isNaN(weight) || weight < 0 || weight > 2000) {
        if (onNotification) onNotification("Workout weight must be between 0 and 2000.");
        setLoading(false);
        return;
      }
    }

    // Set selected Date timestamp if not today
    let logTimestamp = Date.now();
    const todayStr = getTodayDateString();
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const workoutItem = {
      id: 'w_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      name: exName.trim(),
      category: exCategory,
      image: exImage,
      sets: exCategory === 'Cardio' ? 0 : sets,
      reps: exCategory === 'Cardio' ? 0 : reps,
      weight: exCategory === 'Cardio' ? 0 : weight,
      duration: exCategory === 'Cardio' ? duration : 0,
      timestamp: logTimestamp
    };
    workoutItem.caloriesBurned = calculateWorkoutCaloriesBurned(workoutItem);

    try {
      const saved = await addWorkoutLog(userId, workoutItem);
      addWorkoutLogStore(saved || workoutItem);
    } catch (err) {
      console.warn("Failed to log workout to database, applying local store update", err);
      addWorkoutLogStore(workoutItem);
    } finally {
      setExName('');
      setExImage(null);
      setExSets('');
      setExReps('');
      setExWeight('');
      setExDuration('');
      if (onNotification) onNotification(`Logged exercise: ${workoutItem.name}`);
      handleStartRestTimer(restDuration, { workoutId: workoutItem.id, exerciseName: workoutItem.name, setNumber: 1 });
      setLoading(false);
    }
  };

  // Edit Workout History Log
  const handleSaveEditedWorkoutLog = async () => {
    if (!editingLog) return;
    const updatedData = {
      ...editingLog,
      name: editingLog.name,
      category: editingLog.category,
      sets: Number(editingLog.sets) || 0,
      reps: Number(editingLog.reps) || 0,
      weight: Number(editingLog.weight) || 0,
      duration: Number(editingLog.duration) || 0
    };
    updatedData.caloriesBurned = calculateWorkoutCaloriesBurned(updatedData);

    try {
      const updated = await updateWorkoutLog(userId, editingLog.id, updatedData);
      updateWorkoutLogStore(updated || updatedData);
    } catch (err) {
      console.warn("Failed to edit workout log in DB, updating local store", err);
      updateWorkoutLogStore(updatedData);
    } finally {
      setEditingLog(null);
      if (onNotification) onNotification("Workout entry updated!");
    }
  };

  // Delete Workout History Log
  const handleDeleteWorkoutLog = async (logId) => {
    try {
      await deleteWorkoutLog(userId, logId);
      deleteWorkoutLogStore(logId);
    } catch (err) {
      console.warn("Failed to delete workout log in DB, removing locally", err);
      deleteWorkoutLogStore(logId);
    } finally {
      if (onNotification) onNotification("Workout log deleted.");
    }
  };

  // Weekly Splits editing & persistence
  const parseDetailsToStats = (detailsStr, exCategory = 'Strength') => {
    let sets = 3;
    let reps = 10;
    let duration = 0;
    let category = exCategory;

    if (detailsStr) {
      const setsMatch = detailsStr.match(/(\d+)\s*sets?/i);
      if (setsMatch) sets = parseInt(setsMatch[1], 10);

      const repsMatch = detailsStr.match(/(\d+)(?:-(\d+))?\s*reps?/i);
      if (repsMatch) {
        if (repsMatch[2]) {
          reps = Math.round((parseInt(repsMatch[1], 10) + parseInt(repsMatch[2], 10)) / 2);
        } else {
          reps = parseInt(repsMatch[1], 10);
        }
      }

      const secMatch = detailsStr.match(/(\d+)\s*(?:sec|seconds)/i);
      const minMatch = detailsStr.match(/(\d+)\s*(?:min|mins|minutes)/i);
      if (secMatch || minMatch) {
        category = 'Cardio';
        if (minMatch) duration = parseInt(minMatch[1], 10);
        else if (secMatch) duration = Math.ceil(parseInt(secMatch[1], 10) / 60);
      }
    }

    return { sets, reps, duration, category };
  };

  const handleLogSplitExercise = async (ex) => {
    if (!ex || !ex.name) return;
    const parsed = parseDetailsToStats(ex.details);
    let logTimestamp = Date.now();
    const todayStr = getTodayDateString();
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const workoutItem = {
      id: 'w_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      name: ex.name.trim(),
      category: parsed.category,
      image: ex.image || globalImageCache.get(ex.name) || null,
      sets: parsed.category === 'Cardio' ? 0 : parsed.sets,
      reps: parsed.category === 'Cardio' ? 0 : parsed.reps,
      weight: 0,
      duration: parsed.duration,
      timestamp: logTimestamp
    };
    workoutItem.caloriesBurned = calculateWorkoutCaloriesBurned(workoutItem);

    try {
      const saved = await addWorkoutLog(userId, workoutItem);
      addWorkoutLogStore(saved || workoutItem);
    } catch (err) {
      console.warn("Error logging split exercise to DB, adding to local store", err);
      addWorkoutLogStore(workoutItem);
    } finally {
      if (onNotification) onNotification(`Logged ${ex.name} to ${formatDisplayDate(selectedDate)}!`);
      
      // Start/Update Dynamic Island Live Activity
      await LiveActivityManager.startLiveActivity({
        title: 'Calyxo Workout',
        workoutName: splits[activeDay]?.workout?.type || 'Workout Session',
        exerciseName: ex.name.trim(),
        currentSet: 1,
        totalSets: parsed.sets || 3,
        currentReps: parsed.reps || 10,
        isResting: true,
        restDurationSeconds: restDuration,
        caloriesBurned: workoutItem.caloriesBurned || 0
      });

      handleStartRestTimer(restDuration, { workoutId: workoutItem.id, exerciseName: ex.name.trim(), setNumber: 1 });
    }
  };

  const handleLogFullDaySplit = async () => {
    const currentSplit = splits[activeDay]?.workout;
    if (!currentSplit || !currentSplit.exercises || currentSplit.exercises.length === 0) return;
    setLoading(true);

    let logTimestamp = Date.now();
    const todayStr = getTodayDateString();
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const itemsToLog = currentSplit.exercises.map(ex => {
      const parsed = parseDetailsToStats(ex.details);
      const workoutItem = {
        id: 'w_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
        name: ex.name.trim(),
        category: parsed.category,
        image: ex.image || globalImageCache.get(ex.name) || null,
        sets: parsed.category === 'Cardio' ? 0 : parsed.sets,
        reps: parsed.category === 'Cardio' ? 0 : parsed.reps,
        weight: 0,
        duration: parsed.duration,
        timestamp: logTimestamp
      };
      workoutItem.caloriesBurned = calculateWorkoutCaloriesBurned(workoutItem);
      return workoutItem;
    });

    try {
      const promises = itemsToLog.map(item => addWorkoutLog(userId, item));
      const savedLogs = await Promise.all(promises);
      savedLogs.forEach((saved, idx) => {
        addWorkoutLogStore(saved || itemsToLog[idx]);
      });
    } catch (err) {
      console.warn("Error logging full day split to DB, syncing local store", err);
      itemsToLog.forEach(item => addWorkoutLogStore(item));
    } finally {
      if (onNotification) onNotification(`Logged ${splits[activeDay].dayName}'s ${currentSplit.type} session!`);
      handleStartRestTimer(restDuration, { workoutId: `split_${activeDay}_${Date.now()}`, exerciseName: splits[activeDay]?.workout?.type || 'Split', setNumber: 1 });
      setLoading(false);
    }
  };

  const handleMarkChallengeCompleted = async (challenge) => {
    let estBurned = 250;
    const nameLower = challenge.name.toLowerCase();

    if (nameLower.includes('10,000') || nameLower.includes('10k')) {
      estBurned = 420;
    } else if (nameLower.includes('5,000') || nameLower.includes('walk')) {
      estBurned = 220;
    } else if (nameLower.includes('surya') || nameLower.includes('namaskar')) {
      estBurned = 140;
    } else if (nameLower.includes('100,000') || nameLower.includes('100k')) {
      estBurned = 600;
    } else if (nameLower.includes('pushup') || nameLower.includes('push-up')) {
      estBurned = 280;
    } else if (nameLower.includes('bodyweight') || nameLower.includes('home')) {
      estBurned = 120;
    } else if (nameLower.includes('gym')) {
      estBurned = 350;
    }

    if (challenge.id) {
      ecoStore.updateChallengeProgress(challenge.id, challenge.targetVal || 1);
      ecoStore.joinChallenge(challenge);
    }

    let logTimestamp = Date.now();
    const todayStr = getTodayDateString();
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const workoutItem = {
      id: 'w_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      name: challenge.name.trim(),
      category: nameLower.includes('steps') || nameLower.includes('walk') || nameLower.includes('surya') ? 'Cardio' : 'Strength',
      sets: 1,
      reps: challenge.targetVal || 1,
      weight: 0,
      duration: 30,
      caloriesBurned: estBurned,
      timestamp: logTimestamp
    };

    try {
      const saved = await addWorkoutLog(userId, workoutItem);
      addWorkoutLogStore(saved || workoutItem);
    } catch (err) {
      console.warn("Error logging completed challenge to DB, updating local store", err);
      addWorkoutLogStore(workoutItem);
    } finally {
      ecoStore.addXP(200);
      ecoStore.updateStreaks({ workoutStreak: (ecoStore.streaks?.workoutStreak || 0) + 1 });
      if (onNotification) {
        onNotification(`🎉 Marked "${challenge.name}" as DONE! Logged +${estBurned} kcal burned (-${estBurned} net calories today). +200 XP earned!`);
      }
    }
  };

  const handleStartEditSplit = (dayIdxToEdit) => {
    let targetIdx = activeDay;
    if (typeof dayIdxToEdit === 'number' && Number.isInteger(dayIdxToEdit) && dayIdxToEdit >= 0 && dayIdxToEdit <= 6) {
      targetIdx = dayIdxToEdit;
    }
    const activeSplit = splits[targetIdx]?.workout;
    if (!activeSplit) return;

    setEditingSplitDayIdx(targetIdx);
    setEditRoutineFields({
      type: activeSplit.type || '',
      desc: activeSplit.desc || '',
      exercises: activeSplit.exercises ? activeSplit.exercises.map(x => ({ ...x })) : []
    });
    setEditingSplit(true);
    setActiveSplitEditIdx(null);
    setSplitEditSuggestions([]);
  };

  const handleAddExerciseToSplit = () => {
    setEditRoutineFields({
      ...editRoutineFields,
      exercises: [
        ...editRoutineFields.exercises,
        { name: "New Exercise", details: "3 sets × 10 reps" }
      ]
    });
  };

  const handleRemoveExerciseFromSplit = (index) => {
    setEditRoutineFields({
      ...editRoutineFields,
      exercises: editRoutineFields.exercises.filter((_, i) => i !== index)
    });
    if (activeSplitEditIdx === index) {
      setActiveSplitEditIdx(null);
      setSplitEditSuggestions([]);
    }
  };

  const handleMoveExerciseUp = (index) => {
    if (index <= 0) return;
    const nextEx = [...editRoutineFields.exercises];
    const temp = nextEx[index];
    nextEx[index] = nextEx[index - 1];
    nextEx[index - 1] = temp;
    setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
    if (activeSplitEditIdx === index) setActiveSplitEditIdx(index - 1);
    else if (activeSplitEditIdx === index - 1) setActiveSplitEditIdx(index);
  };

  const handleMoveExerciseDown = (index) => {
    if (index >= editRoutineFields.exercises.length - 1) return;
    const nextEx = [...editRoutineFields.exercises];
    const temp = nextEx[index];
    nextEx[index] = nextEx[index + 1];
    nextEx[index + 1] = temp;
    setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
    if (activeSplitEditIdx === index) setActiveSplitEditIdx(index + 1);
    else if (activeSplitEditIdx === index + 1) setActiveSplitEditIdx(index);
  };

  const handleSplitExNameChange = (index, value) => {
    const nextEx = [...editRoutineFields.exercises];
    nextEx[index].name = value;
    setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });

    if (!value || value.trim().length < 2) {
      setSplitEditSuggestions([]);
      setActiveSplitEditIdx(null);
    } else {
      const matches = searchAndRankExercises(value, exercisesData);
      setSplitEditSuggestions(matches.slice(0, 8));
      setActiveSplitEditIdx(index);
    }
  };

  const selectSplitExSuggestion = (index, item) => {
    const nextEx = [...editRoutineFields.exercises];
    nextEx[index].name = item.name;
    nextEx[index].gif_url = item.gif_url || item.image;
    nextEx[index].image = item.image || item.gif_url;
    nextEx[index].target = item.target || item.body_part;
    nextEx[index].id = item.id;
    if (!nextEx[index].details || nextEx[index].details === "New Exercise") {
      nextEx[index].details = "3 sets × 10 reps";
    }
    setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
    setActiveSplitEditIdx(null);
    setSplitEditSuggestions([]);
  };

  const handleSaveSplitEdit = async () => {
    const targetIdx = (editingSplitDayIdx !== null && typeof editingSplitDayIdx === 'number' && editingSplitDayIdx >= 0 && editingSplitDayIdx <= 6)
      ? editingSplitDayIdx
      : activeDay;

    const updatedSplits = [...splits];
    if (updatedSplits[targetIdx]) {
      updatedSplits[targetIdx] = {
        ...updatedSplits[targetIdx],
        workout: {
          type: editRoutineFields.type,
          desc: editRoutineFields.desc,
          exercises: editRoutineFields.exercises.map(x => ({ ...x }))
        }
      };
      setSplits(updatedSplits);
      const uid = user?.uid || user?.id;
      await saveUserWorkoutSplits(uid, updatedSplits);
    }
    setEditingSplit(false);
    setEditingSplitDayIdx(null);
    setActiveSplitEditIdx(null);
    setSplitEditSuggestions([]);
    if (onNotification) onNotification(`Saved ${splits[targetIdx]?.dayName || ''}'s workout split to cloud!`);
  };

  const favoriteExercises = useStore(state => state.favoriteExercises || []);
  const toggleFavoriteExercise = useStore(state => state.toggleFavoriteExercise);

  const uniqueBodyParts = useMemo(() => {
    return Array.from(new Set((exercisesData || []).map(e => e.body_part))).filter(Boolean);
  }, [exercisesData]);

  const uniqueTargets = useMemo(() => {
    return Array.from(new Set((exercisesData || []).map(e => e.target))).filter(Boolean);
  }, [exercisesData]);

  const uniqueEquipments = useMemo(() => {
    return Array.from(new Set((exercisesData || []).map(e => e.equipment))).filter(Boolean);
  }, [exercisesData]);

  const filteredExercises = useMemo(() => {
    const baseList = libQuery.trim() ? searchAndRankExercises(libQuery, exercisesData) : exercisesData;
    return baseList.filter(ex => {
      const matchesBodyPart = libBodyPart === 'all' || (ex.body_part || '').toLowerCase() === libBodyPart.toLowerCase();
      const matchesTarget = libTarget === 'all' || (ex.target || '').toLowerCase() === libTarget.toLowerCase();
      const matchesEquipment = libEquipment === 'all' || (ex.equipment || '').toLowerCase() === libEquipment.toLowerCase();
      const matchesCategory = libCategory === 'all' || (ex.category || '').toLowerCase() === libCategory.toLowerCase();
      const matchesFavorites = !libOnlyFavorites || favoriteExercises.includes(ex.id);

      return matchesBodyPart && matchesTarget && matchesEquipment && matchesCategory && matchesFavorites;
    });
  }, [libQuery, libBodyPart, libTarget, libEquipment, libCategory, libOnlyFavorites, favoriteExercises]);

  const inputStyle = "w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner";

  return (
    <div className="space-y-6">

      {/* Flagship Live Activity / Live Workout Experience Card */}
      <LiveWorkoutDashboard
        onStartWorkout={() => {
          setLiveSessionRoutine(splits[activeDay]);
          setShowLiveSessionModal(true);
        }}
        onOpenActiveModal={() => {
          setLiveSessionRoutine(splits[activeDay]);
          setShowLiveSessionModal(true);
        }}
        splits={splits}
        activeDay={activeDay}
      />

      {/* Sub tabs nav */}
      <div className="flex flex-col gap-3 border-b border-card-border pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight">Workouts Log</h1>
            <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 hidden sm:block">Register weight sets, reps, and track active fitness targets</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLiveSessionRoutine(splits[activeDay]);
                setShowLiveSessionModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-acid-green text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-md shadow-acid-green/20"
              title="Start interactive guided live workout session"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Live Session</span>
            </button>

            <button
              onClick={handleLogFullDaySplit}
              disabled={loading || !splits[activeDay]?.workout?.exercises?.length}
              className="px-3.5 py-2 rounded-xl bg-surface border border-card-border text-foreground hover:border-acid-green text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Quick Log all exercises for today's routine split"
            >
              <Play className="w-3.5 h-3.5 text-acid-green fill-current" />
              <span>Quick Log Today</span>
            </button>
          </div>
        </div>

        <div className="bg-surface border border-card-border p-1 rounded-xl flex gap-0.5 w-full overflow-x-auto scrollbar-none">
          {[
            { id: 'logger', label: 'Logger' },
            { id: 'ai_coach', label: 'AI Coach' },
            { id: 'library', label: 'Library' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'challenges', label: 'Challenges' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-1 text-center shrink-0 ${activeSubTab === tab.id
                  ? 'bg-acid-green text-accent-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >

          {/* AI WORKOUT COACH TAB VIEW */}
          {activeSubTab === 'ai_coach' && (
            <div className="space-y-6">
              <AIWorkoutCoachCard
                userProfile={userProfile}
                historicalWorkoutLogs={workoutLogs}
                recoveryScore={82}
                onStartSession={(routine) => {
                  setLiveSessionRoutine(routine);
                  setShowLiveSessionModal(true);
                }}
                onOpenUpgradeModal={(feature) => {
                  setPremiumFeatureName(feature);
                  setPremiumModalOpen(true);
                }}
              />
            </div>
          )}

          {/* LOGGER TAB VIEW */}
          {activeSubTab === 'logger' && (
            <div className="space-y-6">

              {/* DATE SELECTION CALENDAR BAR */}
              <div className="glass border border-card-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-acid-green" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Workout Date History</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevDate}
                    className="p-1.5 rounded-lg bg-surface border border-card-border hover:border-acid-green text-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="relative flex items-center bg-[var(--input)] border border-card-border px-3 py-1.5 rounded-xl">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                    />
                    <span className="ml-2 text-[10px] font-extrabold text-acid-green uppercase">
                      ({formatDisplayDate(selectedDate)})
                    </span>
                  </div>

                  <button
                    onClick={handleNextDate}
                    className="p-1.5 rounded-lg bg-surface border border-card-border hover:border-acid-green text-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleTodayDate}
                    className="px-2.5 py-1.5 rounded-xl bg-acid-green text-accent-foreground text-[10px] font-black uppercase tracking-wider cursor-pointer border-none"
                  >
                    Today
                  </button>
                </div>
              </div>





              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Form columns */}
                <div className="space-y-6">
                  <section className="glass rounded-2xl p-6">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Log Exercise Sets</h2>
                    <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Select items and specify targets ({formatDisplayDate(selectedDate)})</p>

                    <form onSubmit={handleWorkoutSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search Autocomplete */}
                        <div ref={dropdownRef} className="relative flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Search exercise database</label>
                          <div className="relative flex items-center">
                            <Search className="absolute left-3 w-4 h-4 text-muted" />
                            <input
                              type="text"
                              value={exQuery}
                              onChange={(e) => {
                                setExQuery(e.target.value);
                                setExName(e.target.value);
                              }}
                              placeholder="Bench press, squat, pullup..."
                              className="w-full bg-[var(--input)] border border-card-border focus:border-acid-green rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none shadow-inner"
                            />
                          </div>

                          {exName && exName !== exQuery && (
                            <div className="text-[9px] text-acid-green font-bold uppercase mt-1">
                              Selected: {exName}
                            </div>
                          )}

                          <AnimatePresence>
                            {showDropdown && searchResults.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-[calc(100%+8px)] left-0 w-full bg-surface border border-card-border z-50 rounded-2xl max-h-56 overflow-y-auto shadow-2xl"
                                style={{ backgroundColor: 'var(--secondary, #12121A)', opacity: 1 }}
                              >
                                {searchResults.map((item, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => selectExercise(item)}
                                    className="px-4 py-2.5 border-b border-card-border last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-acid-green hover:text-accent-foreground transition-colors gap-3"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        onClick={(e) => { e.stopPropagation(); handleOpenExerciseDetail(item); }}
                                        className="w-10 h-10 rounded-md bg-surface/50 border border-card-border/50 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                        title="Click to view GIF"
                                      >
                                        <ExerciseImage src={item.gif_url || item.image || globalImageCache.get(item.name)} alt={item.name} category={item.category} muscleGroup={item.muscleGroup} />
                                      </div>
                                      <span className="text-xs font-semibold truncate">{item.name}</span>
                                    </div>
                                    <span className="text-[9px] opacity-75 shrink-0">{item.category}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex flex-col space-y-1 md:col-span-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider mb-1">Category</label>
                          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none shrink-0 w-full">
                            {[
                              { id: 'Strength', label: 'Strength' },
                              { id: 'Cardio', label: 'Cardio / HIIT' },
                              { id: 'Hypertrophy', label: 'Hypertrophy' }
                            ].map((cat) => (
                              <button
                                type="button"
                                key={cat.id}
                                onClick={() => setExCategory(cat.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${exCategory === cat.id
                                    ? 'bg-acid-green text-accent-foreground border-acid-green shadow-sm'
                                    : 'bg-[var(--input)] border-card-border text-muted hover:text-foreground'
                                  }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-muted font-bold uppercase tracking-wider text-center">Sets</label>
                          <input
                            type="number"
                            value={exSets}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setExSets(e.target.value.replace(/^0+(?=\d)/, ''))}
                            placeholder="4"
                            className="bg-[var(--input)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                            disabled={exCategory === "Cardio"}
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-muted font-bold uppercase tracking-wider text-center">Reps</label>
                          <input
                            type="number"
                            value={exReps}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setExReps(e.target.value.replace(/^0+(?=\d)/, ''))}
                            placeholder="10"
                            className="bg-[var(--input)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                            disabled={exCategory === "Cardio"}
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-muted font-bold uppercase tracking-wider text-center">Weight</label>
                          <input
                            type="number"
                            value={exWeight}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setExWeight(e.target.value.replace(/^0+(?=\d)/, ''))}
                            placeholder="kg"
                            className="bg-[var(--input)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                            disabled={exCategory === "Cardio"}
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[8px] text-muted font-bold uppercase tracking-wider text-center">Mins</label>
                          <input
                            type="number"
                            value={exDuration}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setExDuration(e.target.value.replace(/^0+(?=\d)/, ''))}
                            placeholder="mins"
                            className="bg-[var(--input)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                            disabled={exCategory !== "Cardio"}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !exName}
                        className="w-full bg-foreground text-[var(--background)] font-bold text-xs py-3 rounded-xl cursor-pointer hover:bg-acid-green hover:text-accent-foreground hover:shadow-[0_0_12px_rgba(204,255,0,0.15)] transition-all disabled:opacity-50 border-none"
                      >
                        {loading ? "Logging..." : "Log Workout Session"}
                      </button>
                    </form>
                  </section>

                  {/* Logged Workouts timeline logs list */}
                  <section className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Logged Workouts History</h2>
                      <span className="text-[10px] font-bold text-acid-green">{selectedDateWorkoutLogs.length} Sessions Logged</span>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {selectedDateWorkoutLogs && selectedDateWorkoutLogs.length > 0 ? (
                        selectedDateWorkoutLogs.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-surface/50 border border-card-border px-4 py-3 rounded-xl gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                onClick={() => handleOpenExerciseDetail(item)}
                                className="w-9 h-9 rounded border border-card-border/50 bg-black/20 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                title="Click photo to view GIF animation"
                              >
                                <ExerciseImage src={item.image || globalImageCache.get(item.name)} alt={item.name} category={item.category} muscleGroup={item.muscleGroup} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-foreground truncate hover:text-acid-green cursor-pointer" onClick={() => handleOpenExerciseDetail(item)}>{item.name}</span>
                                <span className="text-[9px] text-muted mt-0.5 font-medium truncate">Category: {item.category}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-xs font-bold text-acid-green text-right">
                                {item.category === "Cardio" ? (
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.duration} Mins</span>
                                ) : (
                                  `${item.sets} Sets × ${item.reps} Reps (${item.weight}kg)`
                                )}
                              </div>

                              <button
                                onClick={() => setEditingLog({ ...item })}
                                className="p-1 rounded text-muted hover:text-acid-green transition-colors cursor-pointer border-none bg-transparent"
                                title="Edit Log"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteWorkoutLog(item.id)}
                                className="p-1 rounded text-muted hover:text-destructive transition-colors cursor-pointer border-none bg-transparent"
                                title="Delete Log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-xs text-muted py-8 font-medium">
                          No workouts logged on {formatDisplayDate(selectedDate)}.
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column: Weekly Splits */}
                <div className="space-y-6 pb-32 sm:pb-24">
                  <section className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Weekly Splits Template Planner</h2>
                      <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider bg-acid-green/10 px-2 py-0.5 rounded border border-acid-green/20">Editable & Saved</span>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
                      {splits.map((day, idx) => {
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveDay(idx);
                              setEditingSplit(false);
                              setEditingSplitDayIdx(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-colors flex items-center gap-1 ${activeDay === idx
                                ? 'bg-acid-green text-accent-foreground border-acid-green'
                                : 'bg-surface border-card-border text-muted hover:text-foreground'
                              }`}
                          >
                            <span>{day.dayName.substring(0, 3)}</span>
                            {idx === getLocalDayOfWeekIndex() && (
                              <span className={`w-1.5 h-1.5 rounded-full ${activeDay === idx ? 'bg-black' : 'bg-acid-green'}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {editingSplit ? (
                      <div className="space-y-3 p-4 bg-surface border border-card-border rounded-xl">
                        <div className="flex items-center justify-between pb-2 border-b border-card-border/60">
                          <span className="text-xs font-black text-acid-green uppercase tracking-wider">
                            Editing {splits[editingSplitDayIdx !== null ? editingSplitDayIdx : activeDay]?.dayName}'s Split
                          </span>
                          <span className="text-[9px] text-muted font-bold uppercase tracking-wider bg-acid-green/10 px-2 py-0.5 rounded border border-acid-green/20">
                            Cloud Synced
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Routine Split Name</label>
                          <input type="text" value={editRoutineFields.type} onChange={(e) => setEditRoutineFields({ ...editRoutineFields, type: e.target.value })} className={inputStyle} placeholder="e.g. Push Day (Chest, Shoulders & Triceps)" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Description</label>
                          <input type="text" value={editRoutineFields.desc} onChange={(e) => setEditRoutineFields({ ...editRoutineFields, desc: e.target.value })} className={inputStyle} placeholder="Short description of routine focus" />
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Recommended Exercises (Logger Database Suggestions)</span>
                          </div>
                          {editRoutineFields.exercises.map((ex, i) => (
                            <div key={i} className="relative flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-card-bg/30 p-2.5 rounded-2xl border border-card-border/60 shadow-inner">
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="w-6 h-6 rounded-full bg-surface border border-card-border flex items-center justify-center text-[10px] font-black text-acid-green shrink-0 shadow-sm" title={`Step ${i + 1}`}>
                                  {i + 1}
                                </span>

                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveExerciseUp(i)}
                                    disabled={i === 0}
                                    className="p-0.5 text-muted hover:text-acid-green disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer bg-none border-none transition-colors"
                                    title="Move Exercise Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveExerciseDown(i)}
                                    disabled={i === editRoutineFields.exercises.length - 1}
                                    className="p-0.5 text-muted hover:text-acid-green disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer bg-none border-none transition-colors"
                                    title="Move Exercise Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="relative flex-1 min-w-0">
                                <input
                                  type="text"
                                  value={ex.name}
                                  onChange={(e) => handleSplitExNameChange(i, e.target.value)}
                                  placeholder="Search exercise name (e.g. Incline Bench)..."
                                  className={inputStyle}
                                />

                                {/* Logger Database Suggestions Dropdown with Image Previews */}
                                <AnimatePresence>
                                  {activeSplitEditIdx === i && splitEditSuggestions.length > 0 && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0 }}
                                      className="absolute top-full left-0 right-0 sm:right-auto w-full sm:w-[360px] max-w-full mt-1 bg-surface border border-card-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-56 sm:max-h-64 overflow-y-auto overscroll-contain"
                                      style={{ backgroundColor: 'var(--secondary, #12121A)', opacity: 1 }}
                                    >
                                      <div className="px-3 py-1.5 bg-surface/90 border-b border-card-border text-[8.5px] font-black uppercase tracking-wider text-muted flex justify-between">
                                        <span>Database Matches (With Image Previews)</span>
                                        <span className="text-acid-green">Select to Fill</span>
                                      </div>
                                      {splitEditSuggestions.map((item, idx) => (
                                        <div
                                          key={idx}
                                          onClick={() => selectSplitExSuggestion(i, item)}
                                          className="px-3 py-2.5 border-b border-card-border/40 last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-acid-green hover:text-black transition-colors gap-3 group/item"
                                        >
                                          <div className="flex items-center gap-3 min-w-0">
                                            <div
                                              onClick={(e) => { e.stopPropagation(); handleOpenExerciseDetail(item); }}
                                              className="w-10 h-10 rounded-lg bg-surface/60 border border-card-border/50 flex items-center justify-center shrink-0 overflow-hidden bg-black/40 cursor-pointer hover:scale-105 transition-transform"
                                              title="Click photo to preview exercise GIF"
                                            >
                                              <ExerciseImage
                                                src={item.gif_url || item.image || globalImageCache.get(item.name)}
                                                item={item}
                                                alt={item.name}
                                                category={item.category}
                                                muscleGroup={item.target || item.body_part}
                                              />
                                            </div>
                                            <div className="flex flex-col min-w-0 text-left">
                                              <span className="text-xs font-bold truncate group-hover/item:text-black">{item.name}</span>
                                              <span className="text-[9px] text-muted group-hover/item:text-black/80 font-medium truncate">{item.target || item.body_part || item.category}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={ex.details}
                                  onChange={(e) => {
                                    const nextEx = [...editRoutineFields.exercises];
                                    nextEx[i].details = e.target.value;
                                    setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
                                  }}
                                  placeholder="e.g. 4 sets × 10 reps"
                                  className={`${inputStyle} w-full sm:w-40`}
                                />

                                <button
                                  type="button"
                                  onClick={() => handleRemoveExerciseFromSplit(i)}
                                  className="p-1.5 text-muted hover:text-destructive transition-colors cursor-pointer shrink-0 border-none bg-none"
                                  title="Remove Exercise"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Add Exercise Button (Exclusively at the bottom as requested) */}
                        <button
                          type="button"
                          onClick={handleAddExerciseToSplit}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-acid-green/50 hover:border-acid-green bg-acid-green/10 hover:bg-acid-green/20 text-acid-green text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] my-3 shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-acid-green" /> Add Exercise
                        </button>

                        <div className="flex justify-end gap-2 pt-3 border-t border-card-border">
                          <button onClick={() => { setEditingSplit(false); setEditingSplitDayIdx(null); }} className="text-[10px] text-muted py-2 px-3 bg-surface border border-card-border rounded-xl flex items-center gap-1 cursor-pointer hover:text-foreground"><X className="w-3.5 h-3.5" /> Cancel</button>
                          <button onClick={handleSaveSplitEdit} className="text-[10px] text-accent-foreground bg-acid-green py-2 px-4 rounded-xl font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer border-none shadow-md shadow-acid-green/20 hover:brightness-110"><Check className="w-3.5 h-3.5" /> Save Split</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider">Routine Split Type</span>
                            {activeDay === getLocalDayOfWeekIndex() && (
                              <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-acid-green/20 text-acid-green border border-acid-green/30">Today</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setLiveSessionRoutine(splits[activeDay]);
                                setShowLiveSessionModal(true);
                              }}
                              disabled={!splits[activeDay]?.workout?.exercises?.length}
                              className="px-3.5 py-1.5 rounded-xl bg-acid-green text-black font-black text-[10px] uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-md shadow-acid-green/20 disabled:opacity-50"
                              title={`Start interactive guided live workout session for ${splits[activeDay]?.dayName}`}
                            >
                              <Zap className="w-3.5 h-3.5 fill-current" />
                              Start Live Session
                            </button>
                            <button
                              onClick={handleLogFullDaySplit}
                              disabled={loading || !splits[activeDay]?.workout?.exercises?.length}
                              className="px-3 py-1.5 rounded-xl bg-surface border border-card-border text-foreground text-[10px] font-black uppercase tracking-wider hover:border-acid-green active:scale-95 transition-all border-none cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              title={`Quick Log all ${splits[activeDay]?.dayName}'s exercises`}
                            >
                              <Play className="w-3 h-3 fill-current text-acid-green" />
                              Quick Log
                            </button>
                            <button
                              onClick={() => handleStartEditSplit(activeDay)}
                              className="text-[9px] text-muted hover:text-foreground cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider bg-transparent border-none py-1.5 px-2 rounded-xl hover:bg-surface"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit Split
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xs font-bold text-foreground">{splits[activeDay]?.workout?.type}</h3>
                        <p className="text-[10.5px] text-muted mt-1 leading-relaxed">{splits[activeDay]?.workout?.desc}</p>

                        <div className="mt-4 border-t border-card-border pt-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Exercises Recommended (Tap photo for GIF):</span>
                            <span className="text-[9px] text-acid-green font-bold uppercase">Click + Log to record</span>
                          </div>

                          {splits[activeDay]?.workout?.exercises?.map((ex, i) => (
                            <div key={i} className="flex justify-between items-center text-xs gap-3 p-2 rounded-xl hover:bg-surface/40 transition-colors border border-transparent hover:border-card-border/50">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-surface border border-card-border/80 flex items-center justify-center text-[9.5px] font-black text-muted shrink-0" title={`Sequence #${i + 1}`}>
                                  {i + 1}
                                </span>
                                <div
                                  onClick={() => handleOpenExerciseDetail(ex)}
                                  className="w-9 h-9 rounded-lg border border-card-border/50 bg-black/20 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                  title="Click to view GIF animation"
                                >
                                  <ExerciseImage src={ex.image || globalImageCache.get(ex.name)} item={ex} alt={ex.name} category={ex.category || 'Strength'} muscleGroup={ex.muscleGroup} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-foreground truncate cursor-pointer hover:text-acid-green" onClick={() => handleOpenExerciseDetail(ex)}>{ex.name}</span>
                                  <span className="text-muted text-[10px] truncate">{ex.details}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleLogSplitExercise(ex)}
                                className="px-2.5 py-1.5 rounded-lg bg-surface border border-card-border hover:border-acid-green hover:bg-acid-green/15 text-acid-green font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer border-none shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
                                title={`Log ${ex.name}`}
                              >
                                <Plus className="w-3 h-3" /> Log
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* LIBRARY TAB VIEW */}
          {activeSubTab === 'library' && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-3.5 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={libQuery}
                      onChange={(e) => {
                        setLibQuery(e.target.value);
                        setLibLimit(24);
                      }}
                      placeholder="Search exercises by name, muscle, equipment..."
                      className="w-full bg-[var(--input)] border border-card-border focus:border-acid-green rounded-xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none shadow-inner"
                    />
                    {libQuery && (
                      <button
                        onClick={() => { setLibQuery(''); setLibLimit(24); }}
                        className="absolute right-3 text-xs text-muted hover:text-foreground cursor-pointer bg-transparent border-none"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-card-border/50">
                  <select
                    value={libBodyPart}
                    onChange={(e) => { setLibBodyPart(e.target.value); setLibLimit(24); }}
                    className="bg-[var(--input)] text-foreground border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Body Parts</option>
                    {uniqueBodyParts.map(bp => (
                      <option key={bp} value={bp}>{bp}</option>
                    ))}
                  </select>

                  <select
                    value={libTarget}
                    onChange={(e) => { setLibTarget(e.target.value); setLibLimit(24); }}
                    className="bg-[var(--input)] text-foreground border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Target Muscles</option>
                    {uniqueTargets.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <select
                    value={libEquipment}
                    onChange={(e) => { setLibEquipment(e.target.value); setLibLimit(24); }}
                    className="bg-[var(--input)] text-foreground border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Equipment</option>
                    {uniqueEquipments.map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setLibOnlyFavorites(!libOnlyFavorites)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${libOnlyFavorites
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-surface border-card-border text-muted hover:text-foreground'
                      }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${libOnlyFavorites ? 'fill-rose-400' : ''}`} />
                    Favorites ({favoriteExercises.length})
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredExercises.slice(0, libLimit).map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleOpenExerciseDetail(ex)}
                    className="glass border border-card-border rounded-2xl p-4 flex flex-col justify-between hover:border-acid-green/40 transition-all cursor-pointer group shadow-sm relative overflow-hidden"
                  >
                    <div className="relative w-full h-40 bg-black/40 rounded-xl overflow-hidden mb-3 border border-card-border/50">
                      <ExerciseImage
                        src={ex.gif_url || ex.image}
                        alt={ex.name}
                        category={ex.category}
                        muscleGroup={ex.target || ex.body_part}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-black uppercase text-acid-green tracking-wider">
                        GIF
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-foreground group-hover:text-acid-green transition-colors truncate">
                        {ex.name}
                      </h3>
                      <p className="text-[10px] text-muted font-medium mt-0.5">
                        Target: <span className="text-foreground">{ex.target}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-card-border/40 text-[9px] font-bold text-muted uppercase">
                      <span>{ex.equipment}</span>
                      <span className="text-acid-green">View GIF →</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredExercises.length > libLimit && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setLibLimit(prev => prev + 24)}
                    className="px-6 py-3 bg-surface border border-card-border hover:border-acid-green rounded-xl text-xs font-black uppercase tracking-wider text-foreground cursor-pointer transition-colors"
                  >
                    Load More Exercises ({filteredExercises.length - libLimit} remaining)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS TAB VIEW */}
          {activeSubTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass p-4 rounded-2xl border border-card-border shadow-md">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider">Total Volume</span>
                    <Dumbbell className="w-4 h-4 text-acid-green" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-foreground">{totalVolumeKg.toLocaleString()} <span className="text-xs text-acid-green font-bold">kg</span></div>
                  <p className="text-[9.5px] text-muted mt-1">Cumulative weight moved</p>
                </div>

                <div className="glass p-4 rounded-2xl border border-card-border shadow-md">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider">Total Sets</span>
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-foreground">{totalSetsLogged}</div>
                  <p className="text-[9.5px] text-muted mt-1">Completed exercise sets</p>
                </div>

                <div className="glass p-4 rounded-2xl border border-card-border shadow-md">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider">Workouts Logged</span>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-foreground">{workoutLogs.length}</div>
                  <p className="text-[9.5px] text-muted mt-1">Recorded training sessions</p>
                </div>

                <div className="glass p-4 rounded-2xl border border-card-border shadow-md">
                  <div className="flex items-center justify-between text-muted mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider">Est. Burned</span>
                    <Flame className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-foreground">{totalCaloriesBurned.toLocaleString()} <span className="text-xs text-red-400 font-bold">kcal</span></div>
                  <p className="text-[9.5px] text-muted mt-1">Active energy expenditure</p>
                </div>
              </div>

              {/* Personal Records & Category Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Records */}
                <div className="glass p-5 rounded-2xl border border-card-border shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-card-border pb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Personal Records (PRs)</h3>
                    </div>
                    <span className="text-[10px] font-bold text-acid-green uppercase">{personalRecords.length} Max Records</span>
                  </div>

                  {personalRecords.length > 0 ? (
                    <div className="space-y-2.5">
                      {personalRecords.map((pr, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-card-border/60 hover:border-acid-green/40 transition-colors">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">{pr.name}</span>
                            <span className="text-[10px] text-muted font-medium block">{pr.sets} sets × {pr.reps} reps • {pr.date}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-acid-green">{pr.weight} kg</span>
                            <span className="text-[9px] text-muted block uppercase font-extrabold">{pr.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted text-xs space-y-2">
                      <Dumbbell className="w-8 h-8 mx-auto text-muted/40" />
                      <p>No Personal Records recorded yet. Start logging workouts with weights to view your PR highlights!</p>
                    </div>
                  )}
                </div>

                {/* Training Discipline Breakdown */}
                <div className="glass p-5 rounded-2xl border border-card-border shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-card-border pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-acid-green" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Training Category Breakdown</h3>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {categoryBreakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-foreground">{item.category}</span>
                          <span className="text-acid-green">{item.count} logs ({item.pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-black/40 border border-card-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-acid-green/80 to-acid-green rounded-full transition-all duration-500"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHALLENGES TAB VIEW */}
          {activeSubTab === 'challenges' && (
            <ChallengeModule onNotification={onNotification} />
          )}

        </motion.div>
      </AnimatePresence>

      {/* EDIT WORKOUT LOG MODAL */}
      <AnimatePresence>
        {editingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingLog(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface border border-card-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10">
              <div className="flex justify-between items-center border-b border-card-border pb-3">
                <h3 className="text-sm font-black uppercase text-foreground">Edit Workout Log</h3>
                <button onClick={() => setEditingLog(null)} className="p-1 text-muted hover:text-foreground cursor-pointer bg-none border-none"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-muted uppercase block mb-1">Exercise Name</label>
                  <input type="text" value={editingLog.name} onChange={(e) => setEditingLog({ ...editingLog, name: e.target.value })} className={inputStyle} />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-muted uppercase block mb-1">Category</label>
                  <select value={editingLog.category} onChange={(e) => setEditingLog({ ...editingLog, category: e.target.value })} className={inputStyle}>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio / HIIT</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                  </select>
                </div>

                {editingLog.category === 'Cardio' ? (
                  <div>
                    <label className="text-[9px] font-bold text-muted uppercase block mb-1">Duration (Mins)</label>
                    <input type="number" value={editingLog.duration} onChange={(e) => setEditingLog({ ...editingLog, duration: Number(e.target.value) })} className={inputStyle} />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-muted uppercase block mb-1">Sets</label>
                      <input type="number" value={editingLog.sets} onChange={(e) => setEditingLog({ ...editingLog, sets: Number(e.target.value) })} className={inputStyle} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted uppercase block mb-1">Reps</label>
                      <input type="number" value={editingLog.reps} onChange={(e) => setEditingLog({ ...editingLog, reps: Number(e.target.value) })} className={inputStyle} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted uppercase block mb-1">Weight (kg)</label>
                      <input type="number" value={editingLog.weight} onChange={(e) => setEditingLog({ ...editingLog, weight: Number(e.target.value) })} className={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                <button onClick={() => setEditingLog(null)} className="px-4 py-2 bg-surface border border-card-border rounded-xl text-xs font-bold text-muted cursor-pointer">Cancel</button>
                <button onClick={handleSaveEditedWorkoutLog} className="px-4 py-2 bg-acid-green text-accent-foreground font-bold text-xs rounded-xl cursor-pointer border-none shadow-sm">Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXERCISE DETAIL & GIF MODAL */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-surface border border-card-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-64 md:h-80 bg-black flex items-center justify-center overflow-hidden border-b border-card-border">
                <ExerciseImage
                  src={selectedExercise.gif_url || selectedExercise.image}
                  alt={`${selectedExercise.name} Animation`}
                  category={selectedExercise.category}
                  muscleGroup={selectedExercise.target || selectedExercise.body_part}
                  className="w-full h-full object-contain"
                />

                <button
                  onClick={() => toggleFavoriteExercise(selectedExercise.id)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                >
                  <Heart className={`w-4 h-4 ${favoriteExercises.includes(selectedExercise.id) ? 'text-destructive fill-destructive' : 'text-white'}`} />
                </button>

                <button
                  onClick={() => setSelectedExercise(null)}
                  className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[calc(100vh-24rem)] overflow-y-auto">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-wide leading-tight">
                      {selectedExercise.name}
                    </h2>
                    <span className="text-[9px] font-extrabold text-acid-green uppercase tracking-widest mt-1 block">
                      Targeting {selectedExercise.target || selectedExercise.muscle_group} ({selectedExercise.body_part})
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0 bg-acid-green/10 text-acid-green border-acid-green/30">
                    {selectedExercise.difficulty || 'Intermediate'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-card-border/40">
                  <div className="bg-surface/50 border border-card-border/60 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-muted">
                    Equipment: <span className="text-foreground">{selectedExercise.equipment || 'Free Weights'}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border/60 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-muted">
                    Burn Est: <span className="text-acid-green">{selectedExercise.caloriesEstimate || 8} kcal/min</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Instructions</h3>
                  <ol className="space-y-2 list-decimal list-inside pr-2">
                    {selectedExercise.instruction_steps && selectedExercise.instruction_steps.map((step, idx) => (
                      <li key={idx} className="text-xs text-muted leading-relaxed pl-1 align-top">
                        <span className="text-foreground pl-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="bg-surface/80 border-t border-card-border p-4 flex gap-3 justify-end items-center">
                <button
                  onClick={() => {
                    setExName(selectedExercise.name);
                    setExCategory(selectedExercise.category || 'Strength');
                    setExImage(selectedExercise.image || null);
                    setSelectedExercise(null);
                    setActiveSubTab('logger');
                    if (onNotification) onNotification(`${selectedExercise.name} loaded into Logger!`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-acid-green text-accent-foreground font-black text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all shadow-md hover:shadow-[0_0_12px_rgba(204,255,0,0.15)] border-none"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Log This Exercise</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE GUIDED WORKOUT SESSION MODAL */}
      <LiveWorkoutSessionModal
        isOpen={showLiveSessionModal}
        onClose={() => setShowLiveSessionModal(false)}
        routine={liveSessionRoutine}
        onNotification={onNotification}
      />

      {/* PREMIUM UPGRADE MODAL */}
      <PremiumFeatureModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        featureName={premiumFeatureName}
      />
    </div>
  );
}
