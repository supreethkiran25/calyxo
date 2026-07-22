"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { 
  getWorkoutLogs, 
  addWorkoutLog, 
  updateWorkoutLog, 
  deleteWorkoutLog, 
  saveEcosystemState, 
  getUserAssignments 
} from '../lib/dbService';

import { useEcosystemStore } from '../store/useEcosystemStore';
import { 
  Plus, Dumbbell, Clock, Edit3, X, Check, Search, Trophy, Activity, Move, 
  PersonStanding, Target, User, Crosshair, Heart, Share2, ChevronLeft, ChevronRight, 
  Calendar, Trash2, Edit2, Play
} from 'lucide-react';

const globalImageCache = new Map();
const activeFetches = new Set();
import { motion, AnimatePresence } from 'framer-motion';

import exercisesData from '../lib/exercises.json';

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
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  // Date Calendar History State
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const isDateSelected = (timestamp, dateStr) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return false;
    const dStr = d.toISOString().split('T')[0];
    return dStr === dateStr;
  };

  const selectedDateWorkoutLogs = workoutLogs.filter(x => isDateSelected(x.timestamp, selectedDate));

  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleTodayDate = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) return "Today";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [activeSubTab, setActiveSubTab] = useState('logger');

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
  const [activeDay, setActiveDay] = useState(0);
  const [splits, setSplits] = useState(() => {
    try {
      const saved = localStorage.getItem('calyxo_user_workout_splits');
      return saved ? JSON.parse(saved) : INITIAL_WORKOUT_SPLITS;
    } catch (e) {
      return INITIAL_WORKOUT_SPLITS;
    }
  });
  const [editingSplit, setEditingSplit] = useState(false);
  const [editRoutineFields, setEditRoutineFields] = useState({ type: '', desc: '', exercises: [] });

  // Exercise Library States
  const [libQuery, setLibQuery] = useState('');
  const [libBodyPart, setLibBodyPart] = useState('all');
  const [libTarget, setLibTarget] = useState('all');
  const [libEquipment, setLibEquipment] = useState('all');
  const [libCategory, setLibCategory] = useState('all');
  const [libOnlyFavorites, setLibOnlyFavorites] = useState(false);
  const [libLimit, setLibLimit] = useState(24);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const handleOpenExerciseDetail = (ex) => {
    const match = exercisesData.find(x => x.name.toLowerCase() === (ex.name || '').toLowerCase());
    if (match) {
      setSelectedExercise(match);
    } else {
      setSelectedExercise({
        id: ex.id || Date.now(),
        name: ex.name,
        category: ex.category || 'Strength',
        target: ex.target || ex.muscleGroup || 'Full Body',
        body_part: ex.body_part || ex.muscleGroup || 'General',
        equipment: ex.equipment || 'Free Weights',
        caloriesEstimate: ex.caloriesEstimate || 8,
        difficulty: ex.difficulty || 'intermediate',
        image: ex.image,
        gif_url: ex.gif_url || ex.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        instruction_steps: ex.instruction_steps || [
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
      if (onNotification) onNotification("Recovery metrics logged successfully! 🧘");
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
  const timerRef = useRef(null);

  useEffect(() => {
    if (restSecondsLeft !== null && restSecondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setRestSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (restSecondsLeft === 0) {
      triggerTimerCompletion();
      setRestSecondsLeft(null);
    }
    return () => clearTimeout(timerRef.current);
  }, [restSecondsLeft]);

  const triggerTimerCompletion = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
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
    if (onNotification) onNotification("Rest time complete! Set starts now. 💪");
  };

  const handleStartRestTimer = (secs = restDuration) => {
    setRestSecondsLeft(secs);
  };

  // Hydrate Initial Workout state & Trainer Assignments
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!userId) return;
      try {
        const data = await getWorkoutLogs(userId);
        setWorkoutLogs(data || []);
        
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
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const matches = exercisesData
      .filter(x => 
        x.name.toLowerCase().includes(val.toLowerCase()) ||
        (x.body_part || '').toLowerCase().includes(val.toLowerCase()) ||
        (x.target || '').toLowerCase().includes(val.toLowerCase())
      )
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

    setSearchResults(matches.slice(0, 8));
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
    setExQuery('');
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

    const sets = exSets ? Number(exSets) : 0;
    const reps = exReps ? Number(exReps) : 0;
    const weight = exWeight ? Number(exWeight) : 0;
    const duration = exDuration ? Number(exDuration) : 0;

    if (exCategory === 'Cardio') {
      if (isNaN(duration) || duration < 1 || duration > 480) {
        if (onNotification) onNotification("Cardio duration must be between 1 and 480 minutes.");
        setLoading(false);
        return;
      }
    } else {
      if (isNaN(sets) || sets < 1 || sets > 20) {
        if (onNotification) onNotification("Workout sets must be between 1 and 20.");
        setLoading(false);
        return;
      }
      if (isNaN(reps) || reps < 1 || reps > 200) {
        if (onNotification) onNotification("Workout reps must be between 1 and 200.");
        setLoading(false);
        return;
      }
      if (isNaN(weight) || weight < 0 || weight > 1000) {
        if (onNotification) onNotification("Workout weight must be between 0 and 1000.");
        setLoading(false);
        return;
      }
    }

    // Set selected Date timestamp if not today
    let logTimestamp = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) {
      logTimestamp = new Date(selectedDate + "T12:00:00").getTime();
    }

    const workoutItem = {
      name: exName.trim(),
      category: exCategory,
      image: exImage,
      sets: exCategory === 'Cardio' ? 0 : sets,
      reps: exCategory === 'Cardio' ? 0 : reps,
      weight: exCategory === 'Cardio' ? 0 : weight,
      duration: exCategory === 'Cardio' ? duration : 0,
      timestamp: logTimestamp
    };

    try {
      const saved = await addWorkoutLog(userId, workoutItem);
      addWorkoutLogStore(saved);
      
      setExName('');
      setExImage(null);
      setExSets('');
      setExReps('');
      setExWeight('');
      setExDuration('');
      if (onNotification) onNotification(`Logged exercise: ${workoutItem.name} 🏋️`);
      handleStartRestTimer();
    } catch (err) {
      console.error("Failed to log workout to database", err);
      if (onNotification) onNotification("Failed to log workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit Workout History Log
  const handleSaveEditedWorkoutLog = async () => {
    if (!editingLog) return;
    try {
      const updated = await updateWorkoutLog(userId, editingLog.id, {
        name: editingLog.name,
        category: editingLog.category,
        sets: Number(editingLog.sets) || 0,
        reps: Number(editingLog.reps) || 0,
        weight: Number(editingLog.weight) || 0,
        duration: Number(editingLog.duration) || 0
      });
      updateWorkoutLogStore(updated);
      setEditingLog(null);
      if (onNotification) onNotification("Workout entry updated! ✏️");
    } catch (err) {
      console.error("Failed to edit workout log", err);
      if (onNotification) onNotification("Failed to edit workout log.");
    }
  };

  // Delete Workout History Log
  const handleDeleteWorkoutLog = async (logId) => {
    try {
      await deleteWorkoutLog(userId, logId);
      deleteWorkoutLogStore(logId);
      if (onNotification) onNotification("Workout log deleted.");
    } catch (err) {
      console.error("Failed to delete workout log", err);
      if (onNotification) onNotification("Failed to delete workout log.");
    }
  };

  // Weekly Splits editing & persistence
  const handleStartEditSplit = () => {
    const activeSplit = splits[activeDay].workout;
    setEditRoutineFields({
      type: activeSplit.type,
      desc: activeSplit.desc,
      exercises: activeSplit.exercises.map(x => ({ ...x }))
    });
    setEditingSplit(true);
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
  };

  const handleSaveSplitEdit = () => {
    const updatedSplits = [...splits];
    updatedSplits[activeDay].workout = {
      type: editRoutineFields.type,
      desc: editRoutineFields.desc,
      exercises: editRoutineFields.exercises.map(x => ({ ...x }))
    };
    setSplits(updatedSplits);
    try {
      localStorage.setItem('calyxo_user_workout_splits', JSON.stringify(updatedSplits));
    } catch (e) {
      console.error("Failed to save splits to localStorage", e);
    }
    setEditingSplit(false);
    if (onNotification) onNotification("Suggested workout split updated & saved!");
  };

  const favoriteExercises = useStore(state => state.favoriteExercises || []);
  const toggleFavoriteExercise = useStore(state => state.toggleFavoriteExercise);

  const filteredExercises = exercisesData.filter(ex => {
    const matchesSearch = !libQuery.trim() || 
      ex.name.toLowerCase().includes(libQuery.toLowerCase()) ||
      (ex.body_part || '').toLowerCase().includes(libQuery.toLowerCase()) ||
      (ex.target || '').toLowerCase().includes(libQuery.toLowerCase()) ||
      (ex.equipment || '').toLowerCase().includes(libQuery.toLowerCase()) ||
      (ex.category || '').toLowerCase().includes(libQuery.toLowerCase());

    const matchesBodyPart = libBodyPart === 'all' || ex.body_part === libBodyPart;
    const matchesTarget = libTarget === 'all' || ex.target === libTarget;
    const matchesEquipment = libEquipment === 'all' || ex.equipment === libEquipment;
    const matchesCategory = libCategory === 'all' || ex.category === libCategory;
    const matchesFavorites = !libOnlyFavorites || favoriteExercises.includes(ex.id);

    return matchesSearch && matchesBodyPart && matchesTarget && matchesEquipment && matchesCategory && matchesFavorites;
  });

  const inputStyle = "w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner";

  return (
    <div className="space-y-6">
      
      {/* Sub tabs nav */}
      <div className="flex flex-col gap-3 border-b border-card-border pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight">Workouts Log</h1>
            <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 hidden sm:block">Register weight sets, reps, and track active fitness targets</p>
          </div>
        </div>

        <div className="bg-surface border border-card-border p-1 rounded-xl flex gap-0.5 w-full overflow-x-auto scrollbar-none">
          {[
            { id: 'logger', label: 'Logger' },
            { id: 'library', label: 'Library' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'challenges', label: 'Challenges' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex-1 text-center shrink-0 ${
                activeSubTab === tab.id
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
                                      {item.gif_url || item.image || globalImageCache.get(item.name) ? (
                                        <img src={item.gif_url || item.image || globalImageCache.get(item.name)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                      ) : null}
                                      <FallbackIcon category={item.category} muscleGroup={item.muscleGroup} className="w-4 h-4 text-muted" />
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
                              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
                                exCategory === cat.id
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
                              {item.image || globalImageCache.get(item.name) ? (
                                <img src={item.image || globalImageCache.get(item.name)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                              ) : null}
                              <FallbackIcon category={item.category} muscleGroup={item.muscleGroup} className="w-4 h-4 text-muted" />
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
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Weekly Splits Template Planner</h2>
                    <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider bg-acid-green/10 px-2 py-0.5 rounded border border-acid-green/20">Editable & Saved</span>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
                    {splits.map((day, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setActiveDay(idx);
                          setEditingSplit(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                          activeDay === idx 
                            ? 'bg-acid-green text-accent-foreground border-acid-green' 
                            : 'bg-surface border-card-border text-muted hover:text-foreground'
                        }`}
                      >
                        {day.dayName.substring(0, 3)}
                      </button>
                    ))}
                  </div>

                  {editingSplit ? (
                    <div className="space-y-3 p-4 bg-surface border border-card-border rounded-xl">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Routine Split</label>
                        <input type="text" value={editRoutineFields.type} onChange={(e) => setEditRoutineFields({ ...editRoutineFields, type: e.target.value })} className={inputStyle} />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Description</label>
                        <input type="text" value={editRoutineFields.desc} onChange={(e) => setEditRoutineFields({ ...editRoutineFields, desc: e.target.value })} className={inputStyle} />
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Recommended Exercises</span>
                          <button onClick={handleAddExerciseToSplit} className="text-[9px] text-acid-green font-bold uppercase flex items-center gap-1 cursor-pointer bg-none border-none">
                            <Plus className="w-3 h-3" /> Add Exercise
                          </button>
                        </div>
                        {editRoutineFields.exercises.map((ex, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <input type="text" value={ex.name} onChange={(e) => {
                              const nextEx = [...editRoutineFields.exercises];
                              nextEx[i].name = e.target.value;
                              setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
                            }} placeholder="Name" className={inputStyle} />
                            <input type="text" value={ex.details} onChange={(e) => {
                              const nextEx = [...editRoutineFields.exercises];
                              nextEx[i].details = e.target.value;
                              setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
                            }} placeholder="Sets/Reps" className="bg-[var(--input)] border border-card-border rounded-xl px-2.5 py-1.5 text-xs text-foreground w-28 focus:outline-none" />
                            <button onClick={() => handleRemoveExerciseFromSplit(i)} className="text-destructive p-1 cursor-pointer bg-none border-none">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                        <button onClick={() => setEditingSplit(false)} className="text-[10px] text-muted py-1.5 px-3 bg-surface border border-card-border rounded-lg flex items-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" /> Cancel</button>
                        <button onClick={handleSaveSplitEdit} className="text-[10px] text-accent-foreground bg-acid-green py-1.5 px-4 rounded-lg font-bold flex items-center gap-1 cursor-pointer border-none"><Check className="w-3.5 h-3.5" /> Save Split</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider">Routine Split Type</span>
                        <button onClick={handleStartEditSplit} className="text-[9px] text-muted hover:text-foreground cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider bg-transparent border-none">
                          <Edit3 className="w-3 h-3" />
                          Edit Split
                        </button>
                      </div>
                      <h3 className="text-xs font-bold text-foreground">{splits[activeDay]?.workout?.type}</h3>
                      <p className="text-[10.5px] text-muted mt-1 leading-relaxed">{splits[activeDay]?.workout?.desc}</p>
                      
                      <div className="mt-4 border-t border-card-border pt-3 space-y-3">
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Exercises Recommended (Tap photo for GIF):</span>
                        {splits[activeDay]?.workout?.exercises?.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center text-xs gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                onClick={() => handleOpenExerciseDetail(ex)}
                                className="w-8 h-8 rounded border border-card-border/50 bg-black/20 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                title="Click to view GIF animation"
                              >
                                {ex.image || globalImageCache.get(ex.name) ? (
                                  <img src={ex.image || globalImageCache.get(ex.name)} alt={ex.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                ) : null}
                                <FallbackIcon category={ex.category || 'Strength'} muscleGroup={ex.muscleGroup} className="w-4 h-4 text-muted" />
                              </div>
                              <span className="font-semibold text-foreground truncate cursor-pointer hover:text-acid-green" onClick={() => handleOpenExerciseDetail(ex)}>{ex.name}</span>
                            </div>
                            <span className="text-muted text-[11px] shrink-0 text-right max-w-[120px] sm:max-w-[160px] md:max-w-none">{ex.details}</span>
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
                    {Array.from(new Set(exercisesData.map(e => e.body_part))).filter(Boolean).map(bp => (
                      <option key={bp} value={bp}>{bp}</option>
                    ))}
                  </select>

                  <select 
                    value={libTarget} 
                    onChange={(e) => { setLibTarget(e.target.value); setLibLimit(24); }}
                    className="bg-[var(--input)] text-foreground border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Target Muscles</option>
                    {Array.from(new Set(exercisesData.map(e => e.target))).filter(Boolean).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <select 
                    value={libEquipment} 
                    onChange={(e) => { setLibEquipment(e.target.value); setLibLimit(24); }}
                    className="bg-[var(--input)] text-foreground border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Equipment</option>
                    {Array.from(new Set(exercisesData.map(e => e.equipment))).filter(Boolean).map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setLibOnlyFavorites(!libOnlyFavorites)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      libOnlyFavorites 
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
                      <img 
                        src={ex.gif_url || ex.image} 
                        alt={ex.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = ex.image;
                        }}
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
                <img 
                  src={selectedExercise.gif_url || selectedExercise.image} 
                  alt={`${selectedExercise.name} Animation`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = selectedExercise.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
                  }}
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

    </div>
  );
}
