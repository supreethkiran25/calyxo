"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { getWorkoutLogs, addWorkoutLog, saveEcosystemState } from '../lib/dbService';

import { useEcosystemStore } from '../store/useEcosystemStore';
import { Plus, Dumbbell, Clock, Edit3, X, Check, Search, Trophy, Activity, Move, PersonStanding, Target, User, Crosshair, Heart, Share2 } from 'lucide-react';

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
  
  // Helper to check if a timestamp is today (12am to 12am)
  const isToday = (timestamp) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const todaysWorkoutLogs = workoutLogs.filter(x => isToday(x.timestamp));

  const setWorkoutLogs = useStore(state => state.setWorkoutLogs);
  const addWorkoutLogStore = useStore(state => state.addWorkoutLog);
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

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

  // Weekly Planner states
  const [activeDay, setActiveDay] = useState(0);
  const [splits, setSplits] = useState(INITIAL_WORKOUT_SPLITS);
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

  useEffect(() => {
    todaysWorkoutLogs.forEach(log => {
      if (!log.image && !globalImageCache.has(log.name)) {
        fetchImageForExercise(log.name);
      }
    });
    splits[activeDay].workout.exercises.forEach(ex => {
      if (!ex.image && !globalImageCache.has(ex.name)) {
        fetchImageForExercise(ex.name);
      }
    });
  }, [todaysWorkoutLogs, splits, activeDay]);

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
      // Revert store state
      ecoStore.syncEcosystemState({ healthLogs: prevHealth });
      if (prevScore) ecoStore.updateFitnessScore(prevScore);
      if (onNotification) onNotification("Failed to save recovery metrics. Please try again.");
    }
  };

  // Hydrate Initial Workout state
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!userId) return;
      try {
        const data = await getWorkoutLogs(userId);
        setWorkoutLogs(data || []);
      } catch (err) {
        console.error("Error loading workouts log", err);
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

  // wger API Search Debouncer (kept for local search trigger)
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

    // Bounds Validations
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

    const workoutItem = {
      name: exName.trim(),
      category: exCategory,
      image: exImage,
      sets: exCategory === 'Cardio' ? 0 : sets,
      reps: exCategory === 'Cardio' ? 0 : reps,
      weight: exCategory === 'Cardio' ? 0 : weight,
      duration: exCategory === 'Cardio' ? duration : 0
    };

    try {
      const saved = await addWorkoutLog(userId, workoutItem);
      addWorkoutLogStore(saved);
      
      // Publishing removed
      // Clear form
      setExName('');
      setExImage(null);
      setExSets('');
      setExReps('');
      setExWeight('');
      setExDuration('');
      if (onNotification) onNotification(`Logged exercise: ${workoutItem.name} 🏋️`);
    } catch (err) {
      console.error("Failed to log workout to database", err);
      if (onNotification) onNotification("Failed to log workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditSplit = () => {
    const activeSplit = splits[activeDay].workout;
    setEditRoutineFields({
      type: activeSplit.type,
      desc: activeSplit.desc,
      exercises: activeSplit.exercises.map(x => ({ ...x }))
    });
    setEditingSplit(true);
  };

  const handleSaveSplitEdit = () => {
    const updatedSplits = [...splits];
    updatedSplits[activeDay].workout = {
      type: editRoutineFields.type,
      desc: editRoutineFields.desc,
      exercises: editRoutineFields.exercises.map(x => ({ ...x }))
    };
    setSplits(updatedSplits);
    setEditingSplit(false);
    if (onNotification) onNotification("Suggested workout split updated.");
  };

  const favoriteExercises = useStore(state => state.favoriteExercises || []);
  const toggleFavoriteExercise = useStore(state => state.toggleFavoriteExercise);
  const recentlyViewedExercises = useStore(state => state.recentlyViewedExercises || []);
  const addRecentlyViewedExercise = useStore(state => state.addRecentlyViewedExercise);

  // Derive unique categories for select list
  const uniqueBodyParts = Array.from(new Set(exercisesData.map(e => e.body_part))).filter(Boolean).sort();
  const uniqueTargets = Array.from(new Set(exercisesData.map(e => e.target))).filter(Boolean).sort();
  const uniqueEquipments = Array.from(new Set(exercisesData.map(e => e.equipment))).filter(Boolean).sort();
  const uniqueCategories = Array.from(new Set(exercisesData.map(e => e.category))).filter(Boolean).sort();

  // Filter exercises
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
    const matchesFavorite = !libOnlyFavorites || favoriteExercises.includes(ex.id);

    return matchesSearch && matchesBodyPart && matchesTarget && matchesEquipment && matchesCategory && matchesFavorite;
  });

  const visibleExercises = filteredExercises.slice(0, libLimit);

  const inputStyle = "w-full bg-[var(--input)] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner";

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Form columns */}
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Log Exercise Sets</h2>
                  <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Select items and specify targets</p>

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
                              className="absolute top-[calc(100%+8px)] left-0 w-full glass rounded-xl border border-card-border z-30 max-h-48 overflow-y-auto shadow-2xl"
                            >
                              {searchResults.map((item, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => selectExercise(item)}
                                  className="px-4 py-2.5 border-b border-card-border last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-acid-green hover:text-accent-foreground transition-colors gap-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-md bg-surface/50 border border-card-border/50 flex items-center justify-center shrink-0 overflow-hidden">
                                      {item.image || globalImageCache.get(item.name) ? (
                                        <img src={item.image || globalImageCache.get(item.name)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                      ) : null}
                                      <FallbackIcon category={item.category} muscleGroup={item.muscleGroup || LOCAL_EXERCISES.find(l => l.name === item.name)?.muscleGroup} className={`w-4 h-4 text-muted ${(item.image || globalImageCache.get(item.name)) ? 'hidden' : ''}`} />
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
                          onChange={(e) => setExSets(e.target.value)}
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
                          onChange={(e) => setExReps(e.target.value)}
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
                          onChange={(e) => setExWeight(e.target.value)}
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
                          onChange={(e) => setExDuration(e.target.value)}
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
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Logged Workouts History</h2>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {todaysWorkoutLogs && todaysWorkoutLogs.length > 0 ? (
                      todaysWorkoutLogs.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-surface/50 border border-card-border px-4 py-3 rounded-xl gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded border border-card-border/50 bg-black/20 flex items-center justify-center shrink-0 overflow-hidden">
                              {item.image || globalImageCache.get(item.name) ? (
                                <img src={item.image || globalImageCache.get(item.name)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                              ) : null}
                              <FallbackIcon category={item.category} muscleGroup={item.muscleGroup || exercisesData.find(l => l.name === item.name)?.muscle_group || exercisesData.find(l => l.name === item.name)?.body_part} className={`w-4 h-4 text-muted ${(item.image || globalImageCache.get(item.name)) ? 'hidden' : ''}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                              <span className="text-[9px] text-muted mt-0.5 font-medium truncate">Category: {item.category}</span>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-acid-green shrink-0">
                            {item.category === "Cardio" ? (
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.duration} Mins</span>
                            ) : (
                              `${item.sets} Sets × ${item.reps} Reps (${item.weight}kg)`
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-muted py-8 font-medium">
                        No workouts logged today.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Suggested Splits */}
              <div className="space-y-6">
                <section className="glass rounded-2xl p-6">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Weekly Splits Template Planner</h2>
                  
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
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Recommended Exercises</span>
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
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                        <button onClick={() => setEditingSplit(false)} className="text-[10px] text-muted py-1.5 px-3 bg-surface border border-card-border rounded-lg flex items-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" /> Cancel</button>
                        <button onClick={handleSaveSplitEdit} className="text-[10px] text-accent-foreground bg-acid-green py-1.5 px-4 rounded-lg font-bold flex items-center gap-1 cursor-pointer border-none"><Check className="w-3.5 h-3.5" /> Save</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider">Routine Split Type</span>
                        <button onClick={handleStartEditSplit} className="text-[9px] text-muted hover:text-foreground cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider bg-transparent border-none">
                          <Edit3 className="w-3 h-3" />
                          Edit Routine
                        </button>
                      </div>
                      <h3 className="text-xs font-bold text-foreground">{splits[activeDay].workout.type}</h3>
                      <p className="text-[10.5px] text-muted mt-1 leading-relaxed">{splits[activeDay].workout.desc}</p>
                      
                      <div className="mt-4 border-t border-card-border pt-3 space-y-3">
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Exercises Recommended:</span>
                        {splits[activeDay].workout.exercises.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center text-xs gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded border border-card-border/50 bg-black/20 flex items-center justify-center shrink-0 overflow-hidden">
                                {ex.image || globalImageCache.get(ex.name) ? (
                                  <img src={ex.image || globalImageCache.get(ex.name)} alt={ex.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                ) : null}
                                <FallbackIcon category={ex.category || 'Strength'} muscleGroup={ex.muscleGroup || exercisesData.find(l => l.name === ex.name)?.muscle_group || exercisesData.find(l => l.name === ex.name)?.body_part} className={`w-4 h-4 text-muted ${(ex.image || globalImageCache.get(ex.name)) ? 'hidden' : ''}`} />
                              </div>
                              <span className="font-semibold text-foreground truncate">{ex.name}</span>
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
          )}

          {/* LIBRARY TAB VIEW */}
          {activeSubTab === 'library' && (
            <div className="space-y-6">
              {/* Search & Toggle row */}
              <div className="glass rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-3.5 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={libQuery}
                      onChange={(e) => {
                        setLibQuery(e.target.value);
                        setLibLimit(24); // reset limit on search
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
                  <button
                    onClick={() => {
                      setLibOnlyFavorites(prev => !prev);
                      setLibLimit(24);
                    }}
                    className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      libOnlyFavorites
                        ? 'bg-acid-green text-accent-foreground border-acid-green'
                        : 'bg-surface border-card-border text-muted hover:text-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${libOnlyFavorites ? 'fill-current' : ''}`} />
                    <span>Favorites {favoriteExercises.length > 0 ? `(${favoriteExercises.length})` : ''}</span>
                  </button>
                </div>

                {/* Filters grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Body Part</label>
                    <select
                      value={libBodyPart}
                      onChange={(e) => { setLibBodyPart(e.target.value); setLibLimit(24); }}
                      className="bg-[var(--input)] border border-card-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-acid-green cursor-pointer"
                    >
                      <option value="all">All Body Parts</option>
                      {uniqueBodyParts.map(bp => (
                        <option key={bp} value={bp}>{bp.charAt(0).toUpperCase() + bp.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Target Muscle</label>
                    <select
                      value={libTarget}
                      onChange={(e) => { setLibTarget(e.target.value); setLibLimit(24); }}
                      className="bg-[var(--input)] border border-card-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-acid-green cursor-pointer"
                    >
                      <option value="all">All Muscles</option>
                      {uniqueTargets.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Equipment</label>
                    <select
                      value={libEquipment}
                      onChange={(e) => { setLibEquipment(e.target.value); setLibLimit(24); }}
                      className="bg-[var(--input)] border border-card-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-acid-green cursor-pointer"
                    >
                      <option value="all">All Equipment</option>
                      {uniqueEquipments.map(eq => (
                        <option key={eq} value={eq}>{eq.charAt(0).toUpperCase() + eq.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Category</label>
                    <select
                      value={libCategory}
                      onChange={(e) => { setLibCategory(e.target.value); setLibLimit(24); }}
                      className="bg-[var(--input)] border border-card-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-acid-green cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {uniqueCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Exercises Grid */}
              {visibleExercises.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleExercises.map((ex) => {
                    const isFav = favoriteExercises.includes(ex.id);
                    return (
                      <div
                        key={ex.id}
                        onClick={() => {
                          setSelectedExercise(ex);
                          addRecentlyViewedExercise(ex.id);
                        }}
                        className="bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer hover:border-acid-green hover:shadow-[0_0_12px_rgba(204,255,0,0.1)] transition-all flex flex-col justify-between h-56 relative group overflow-hidden"
                      >
                        <div className="w-full h-32 rounded-lg overflow-hidden border border-card-border/50 bg-black/25 flex items-center justify-center relative">
                          <img
                            src={ex.image}
                            alt={ex.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden absolute inset-0 flex items-center justify-center bg-black/20 text-muted">
                            <FallbackIcon category={ex.category} muscleGroup={ex.muscle_group || ex.body_part} className="w-6 h-6" />
                          </div>

                          {/* Difficulty indicator badge */}
                          <span className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                            ex.difficulty === 'beginner' 
                              ? 'bg-success/20 text-success border-success/30' 
                              : ex.difficulty === 'intermediate'
                              ? 'bg-warning/20 text-warning border-warning/30'
                              : 'bg-destructive/20 text-destructive border-destructive/30'
                          }`}>
                            {ex.difficulty}
                          </span>

                          {/* Favorite toggle button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteExercise(ex.id);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 border border-white/10 flex items-center justify-center text-white cursor-pointer transition-colors active:scale-95"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-destructive fill-destructive' : 'text-white'}`} />
                          </button>
                        </div>

                        <div className="mt-2.5 flex-1 flex flex-col justify-between">
                          <h3 className="text-xs font-black text-foreground leading-tight line-clamp-2 uppercase tracking-wide">
                            {ex.name}
                          </h3>
                          <div className="text-[8px] text-muted font-bold uppercase tracking-widest mt-1 flex justify-between items-center border-t border-card-border/30 pt-1.5">
                            <span>{ex.target}</span>
                            <span className="text-acid-green">{ex.equipment}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 glass rounded-2xl">
                  <Dumbbell className="w-8 h-8 mx-auto text-muted mb-2 animate-pulse" />
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block">No exercises match your filters</span>
                  <button 
                    onClick={() => {
                      setLibQuery('');
                      setLibBodyPart('all');
                      setLibTarget('all');
                      setLibEquipment('all');
                      setLibCategory('all');
                      setLibOnlyFavorites(false);
                      setLibLimit(24);
                    }}
                    className="mt-4 text-[10px] uppercase font-black tracking-wider text-acid-green hover:underline cursor-pointer bg-transparent border-none"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* Load More Button */}
              {filteredExercises.length > visibleExercises.length && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setLibLimit(prev => prev + 24)}
                    className="px-6 py-3 rounded-xl border border-card-border bg-surface hover:border-acid-green hover:text-foreground text-muted text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(204,255,0,0.1)] active:scale-[0.98]"
                  >
                    Load More Exercises ({filteredExercises.length - visibleExercises.length} Remaining)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHALLENGES TAB VIEW */}
          {activeSubTab === 'challenges' && (
            <div className="max-w-xl mx-auto">
              <section className="glass rounded-2xl p-6">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 text-acid-green" />
                  Active Arena Targets
                </h2>
                <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-5">Join global milestones and trace conditioning milestones</p>

                <div className="space-y-4">
                  {ecoStore.activeChallenges?.map((challenge) => {
                    const hasStarted = challenge.progress > 0 || challenge.completed;
                    const percent = Math.min(100, Math.round((challenge.progress / challenge.targetVal) * 100));
                    
                    return (
                      <div key={challenge.id} className="bg-surface border border-card-border p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{challenge.name}</h4>
                            <p className="text-[10px] text-muted font-medium mt-0.5">{challenge.target}</p>
                          </div>
                          {challenge.completed ? (
                            <span className="text-[9px] font-bold text-acid-green bg-acid-green/10 border border-acid-green/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Completed 🎉
                            </span>
                          ) : !hasStarted ? (
                            <button
                               onClick={async () => {
                                 ecoStore.updateChallengeProgress(challenge.id, 1);
                                 try {
                                   await saveEcosystemState(userId, useEcosystemStore.getState());
                                   if (onNotification) onNotification(`Joined Challenge: ${challenge.name}! 🚀`);
                                 } catch (err) {
                                   console.error("Join challenge error", err);
                                   if (onNotification) onNotification("Failed to join challenge. Please try again.");
                                 }
                               }}
                               className="text-[9px] font-extrabold text-accent-foreground bg-acid-green hover:shadow-md px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer border-none"
                             >
                              Join
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-acid-green">
                              {percent}%
                            </span>
                          )}
                        </div>

                        {hasStarted && (
                          <div className="space-y-2">
                            <div className="w-full bg-[var(--input)] rounded-full h-1.5 overflow-hidden border border-card-border">
                              <div 
                                className="bg-acid-green h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-muted">
                              <span>Progress: <strong className="text-foreground">{challenge.progress}</strong> / {challenge.targetVal} {challenge.unit}</span>
                              
                              {!challenge.completed && (
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="number"
                                    placeholder="+ amount"
                                    id={`input-${challenge.id}`}
                                    className="w-16 bg-[var(--input)] border border-card-border rounded px-1.5 py-0.5 text-center text-xs text-foreground focus:outline-none focus:border-acid-green"
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter') {
                                        const val = Number(e.target.value);
                                        if (val > 0) {
                                          ecoStore.updateChallengeProgress(challenge.id, val);
                                          try {
                                            await saveEcosystemState(userId, useEcosystemStore.getState());
                                            const nextState = useEcosystemStore.getState();
                                            const updated = nextState.activeChallenges.find(c => c.id === challenge.id);
                                            if (updated?.completed) {
                                              ecoStore.unlockAchievement('first_workout');
                                              try {
                                                await saveEcosystemState(userId, useEcosystemStore.getState());
                                              } catch (e) {}
                                              if (onNotification) onNotification(`Challenge Completed: ${challenge.name}! 🏆`);
                                            } else {
                                              if (onNotification) onNotification(`Logged progress: +${val} to ${challenge.name}`);
                                            }
                                            e.target.value = '';
                                          } catch (err) {
                                            console.error("Save challenge progress error", err);
                                            ecoStore.updateChallengeProgress(challenge.id, -val); // Revert
                                            if (onNotification) onNotification("Failed to log progress. Please try again.");
                                          }
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={async () => {
                                      const inputEl = document.getElementById(`input-${challenge.id}`);
                                      const val = Number(inputEl?.value);
                                      if (val > 0) {
                                        ecoStore.updateChallengeProgress(challenge.id, val);
                                        try {
                                          await saveEcosystemState(userId, useEcosystemStore.getState());
                                          const nextState = useEcosystemStore.getState();
                                          const updated = nextState.activeChallenges.find(c => c.id === challenge.id);
                                          if (updated?.completed) {
                                            ecoStore.unlockAchievement('first_workout');
                                            try {
                                              await saveEcosystemState(userId, useEcosystemStore.getState());
                                            } catch (e) {}
                                            if (onNotification) onNotification(`Challenge Completed: ${challenge.name}! 🏆`);
                                          } else {
                                            if (onNotification) onNotification(`Logged progress: +${val} to ${challenge.name}`);
                                          }
                                          if (inputEl) inputEl.value = '';
                                        } catch (err) {
                                          console.error("Save challenge progress click error", err);
                                          ecoStore.updateChallengeProgress(challenge.id, -val); // Revert
                                          if (onNotification) onNotification("Failed to log progress. Please try again.");
                                        }
                                      }
                                    }}
                                    className="bg-surface border border-card-border hover:border-acid-green text-foreground px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeSubTab === 'analytics' && (
            (() => {
              // 1. Calculate PRs
              const prMap = {};
              workoutLogs.forEach(log => {
                if (log.category === 'Strength' && log.weight) {
                  const name = log.name.trim();
                  const weight = Number(log.weight);
                  if (!prMap[name] || weight > prMap[name]) {
                    prMap[name] = weight;
                  }
                }
              });

              // 2. Calculate Volume
              const totalVolume = workoutLogs.reduce((acc, log) => {
                if (log.category === 'Strength' && log.sets && log.reps && log.weight) {
                  return acc + (Number(log.sets) * Number(log.reps) * Number(log.weight));
                }
                return acc;
              }, 0);

              const templates = [
                {
                  name: "Push Day Power",
                  exercises: [
                    { name: "Flat Bench Press", sets: 4, reps: 8, weight: 60, category: "Strength" },
                    { name: "Overhead Press", sets: 3, reps: 10, weight: 40, category: "Strength" }
                  ]
                },
                {
                  name: "Pull Day Hypertrophy",
                  exercises: [
                    { name: "Lat Pulldown", sets: 4, reps: 10, weight: 55, category: "Strength" },
                    { name: "Bicep Curls", sets: 3, reps: 12, weight: 12, category: "Strength" }
                  ]
                },
                {
                  name: "Leg Day Compound",
                  exercises: [
                    { name: "Barbell Back Squats", sets: 4, reps: 8, weight: 80, category: "Strength" },
                    { name: "Leg Press", sets: 3, reps: 10, weight: 120, category: "Strength" }
                  ]
                }
              ];

              const loadTemplate = (temp) => {
                const first = temp.exercises[0];
                setExName(first.name);
                setExSets(first.sets);
                setExReps(first.reps);
                setExWeight(first.weight);
                setExCategory(first.category);
                setActiveSubTab('logger');
                if (onNotification) onNotification(`Loaded template: ${temp.name}. Feel free to customize and save!`);
              };

              return (
                <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column: PRs & Volume */}
                    <div className="space-y-6">
                      {/* PRs Card */}
                      <div className="glass p-5 rounded-2xl border border-card-border shadow-md">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-4">
                          <Trophy className="w-4 h-4 text-yellow-500 fill-current" />
                          Personal Records (PRs)
                        </h3>
                        {Object.keys(prMap).length > 0 ? (
                          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                            {Object.entries(prMap).map(([name, weight]) => (
                              <div key={name} className="flex justify-between items-center bg-surface/50 border border-card-border p-3 rounded-xl">
                                <span className="text-xs font-semibold text-foreground">{name}</span>
                                <span className="text-xs font-black text-acid-green">{weight} kg</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted italic">Log strength exercises to establish your PR leaderboard.</p>
                        )}
                      </div>

                      {/* Volume Tracker */}
                      <div className="glass p-5 rounded-2xl border border-card-border shadow-md">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <Dumbbell className="w-4 h-4 text-acid-green" />
                          Weight Volume Tracked
                        </h3>
                        <p className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-4">Cumulative Training Volume</p>
                        <div className="bg-surface/50 border border-card-border p-4 rounded-xl text-center">
                          <span className="text-2xl font-black text-foreground block">{totalVolume.toLocaleString()} kg</span>
                          <span className="text-[9px] text-muted font-bold block mt-1 uppercase tracking-wider">Total sets × reps × weight lifted</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Templates & Recovery */}
                    <div className="space-y-6">
                      {/* Workout Templates */}
                      <div className="glass p-5 rounded-2xl border border-card-border shadow-md">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-4">
                          <Clock className="w-4 h-4 text-acid-green" />
                          Workout Templates
                        </h3>
                        <div className="space-y-3">
                          {templates.map(temp => (
                            <div key={temp.name} className="bg-surface/50 border border-card-border p-3 rounded-xl flex justify-between items-center">
                              <div>
                                <h4 className="text-xs font-bold text-foreground">{temp.name}</h4>
                                <p className="text-[9px] text-muted font-bold mt-0.5 uppercase tracking-wider">
                                  {temp.exercises.map(x => x.name).join(' · ')}
                                </p>
                              </div>
                              <button
                                onClick={() => loadTemplate(temp)}
                                className="bg-acid-green text-accent-foreground text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg cursor-pointer border-none"
                              >
                                Load
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recovery & Soreness Input */}
                      <div className="glass p-5 rounded-2xl border border-card-border shadow-md space-y-4">
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          🧘 Daily Recovery Status
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-muted font-bold uppercase tracking-wider">
                              <span>Muscle Soreness</span>
                              <span className="text-acid-green">{selectedSoreness}/10</span>
                            </div>
                            <input 
                              type="range" min="1" max="10" 
                              value={selectedSoreness} 
                              onChange={(e) => setSelectedSoreness(Number(e.target.value))}
                              className="w-full accent-acid-green cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-muted font-bold uppercase tracking-wider">
                              <span>Central Fatigue</span>
                              <span className="text-acid-green">{selectedFatigue}/10</span>
                            </div>
                            <input 
                              type="range" min="1" max="10" 
                              value={selectedFatigue} 
                              onChange={(e) => setSelectedFatigue(Number(e.target.value))}
                              className="w-full accent-acid-green cursor-pointer"
                            />
                          </div>

                          <button
                            onClick={handleSaveRecovery}
                            className="w-full bg-acid-green text-accent-foreground font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl cursor-pointer border-none shadow-sm mt-2"
                          >
                            Log Recovery Metrics
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()
          )}

        </motion.div>
      </AnimatePresence>

      {/* EXERCISE DETAIL MODAL */}
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
              {/* Header / Media Carousel Section */}
              <div className="relative w-full h-64 md:h-80 bg-black/45 flex items-center justify-center overflow-hidden border-b border-card-border">
                {/* Auto playing looping GIF */}
                <img 
                  src={selectedExercise.gif_url} 
                  alt={`${selectedExercise.name} Animation`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to static image if GIF fails to load
                    e.target.src = selectedExercise.image;
                  }}
                />

                {/* Favorite Button on top-right */}
                <button
                  onClick={() => toggleFavoriteExercise(selectedExercise.id)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                >
                  <Heart className={`w-4 h-4 ${favoriteExercises.includes(selectedExercise.id) ? 'text-destructive fill-destructive' : 'text-white'}`} />
                </button>

                {/* Close Button on top-left */}
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detail Content */}
              <div className="p-6 space-y-5 max-h-[calc(100vh-24rem)] overflow-y-auto">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-wide leading-tight">
                      {selectedExercise.name}
                    </h2>
                    <span className="text-[9px] font-extrabold text-acid-green uppercase tracking-widest mt-1 block">
                      Targeting {selectedExercise.target} ({selectedExercise.body_part})
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                    selectedExercise.difficulty === 'beginner' 
                      ? 'bg-success/20 text-success border-success/30' 
                      : selectedExercise.difficulty === 'intermediate'
                      ? 'bg-warning/20 text-warning border-warning/30'
                      : 'bg-destructive/20 text-destructive border-destructive/30'
                  }`}>
                    {selectedExercise.difficulty}
                  </span>
                </div>

                {/* Badges / Meta row */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-card-border/40">
                  <div className="bg-surface/50 border border-card-border/60 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-muted">
                    Equipment: <span className="text-foreground">{selectedExercise.equipment}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border/60 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-muted">
                    Muscle Group: <span className="text-foreground">{selectedExercise.muscle_group}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border/60 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-muted">
                    Burn Est: <span className="text-acid-green">{selectedExercise.caloriesEstimate} kcal/min</span>
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
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

                {/* Secondary Muscles involved */}
                {selectedExercise.secondary_muscles && selectedExercise.secondary_muscles.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-card-border/40">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-wider">Secondary Muscles Involved</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedExercise.secondary_muscles.map((mus) => (
                        <span key={mus} className="bg-black/20 border border-card-border/50 px-2 py-0.5 rounded text-[8px] font-bold text-muted uppercase">
                          {mus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="bg-surface/80 border-t border-card-border p-4 flex gap-3 justify-end items-center">
                <button
                  onClick={() => {
                    // Quick share mock trigger
                    if (navigator.share) {
                      navigator.share({
                        title: selectedExercise.name,
                        text: `Check out the ${selectedExercise.name} exercise on Calyxo!`,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(`Calyxo Exercise: ${selectedExercise.name} targeting ${selectedExercise.target}`);
                      if (onNotification) onNotification("Exercise details copied to clipboard!");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-card-border bg-surface hover:text-foreground text-muted text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => {
                    // Populate logger fields and close detail page
                    setExName(selectedExercise.name);
                    setExCategory(selectedExercise.category || 'Strength');
                    setExImage(selectedExercise.image || null);
                    setSelectedExercise(null);
                    setActiveSubTab('logger');
                    if (onNotification) onNotification(`${selectedExercise.name} loaded into Logger! specify sets and log.`);
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
