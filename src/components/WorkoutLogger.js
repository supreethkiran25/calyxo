"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { getWorkoutLogs, addWorkoutLog, saveEcosystemState } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { Plus, Dumbbell, Clock, Edit3, X, Check, Search, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCAL_EXERCISES = [
  "Incline Dumbbell Press",
  "Barbell Back Squats",
  "Weighted Pull-ups",
  "Romanian Deadlifts (RDLs)",
  "Dumbbell Lateral Raises",
  "Overhead Press",
  "Bicep Curls",
  "Tricep Pushdowns",
  "Plank Hold",
  "Hanging Leg Raises",
  "Flat Bench Press",
  "Lat Pulldown",
  "Seated Cable Rows",
  "Leg Press"
];

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

export default function WorkoutLogger({ onNotification }) {
  const { user, workoutLogs, setWorkoutLogs } = useStore();
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  // Autocomplete / wger API Search states
  const [exQuery, setExQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Form Fields
  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState('Strength');
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

  // Hydrate Initial Workout state
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!userId) return;
      const data = await getWorkoutLogs(userId);
      setWorkoutLogs(data || []);
    };
    fetchWorkouts();
  }, [userId, setWorkoutLogs]);

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

  // wger API Search Debouncer
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(exQuery);
    }, 350);
    return () => clearTimeout(delayDebounce);
  }, [exQuery]);

  const handleSearch = async (val) => {
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const locals = LOCAL_EXERCISES.filter(x => x.toLowerCase().includes(val.toLowerCase())).map(x => ({
      name: x,
      category: "Strength"
    }));

    let apiResults = [];
    try {
      // Fetch from wger exercise DB autocomplete search
      const response = await fetch(`/api/workout?q=${encodeURIComponent(val)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          apiResults = data.suggestions.map(s => ({
            name: s.value,
            category: s.data.category || "Strength"
          }));
        } else if (data.results && data.results.length > 0) {
          apiResults = data.results.map(r => ({
            name: r.title,
            category: "Strength"
          }));
        }
      }
    } catch (err) {
      console.warn("wger API search failed, falling back to local catalog", err);
    }

    setSearchResults([...locals, ...apiResults].slice(0, 8));
    setShowDropdown(true);
  };

  const selectExercise = (ex) => {
    setExName(ex.name);
    setExCategory(ex.category || 'Strength');
    setExQuery('');
    setShowDropdown(false);
  };

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const workoutItem = {
      name: exName,
      category: exCategory,
      sets: exSets ? Number(exSets) : 0,
      reps: exReps ? Number(exReps) : 0,
      weight: exWeight ? Number(exWeight) : 0,
      duration: exDuration ? Number(exDuration) : 0
    };

    const saved = await addWorkoutLog(userId, workoutItem);
    setWorkoutLogs([saved, ...workoutLogs]);
    
    // Clear form
    setExName('');
    setExSets('');
    setExReps('');
    setExWeight('');
    setExDuration('');
    setLoading(false);

    if (onNotification) onNotification(`Logged exercise: ${workoutItem.name}`);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-24">
      {/* Left Column: Form Logger */}
      <div className="space-y-6 w-full">
        {/* 1. Workout Search & Logging Form */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-acid-green" />
            Workout Logger
          </h2>
          <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Record sets, reps, weights, and cardio durations</p>

          <form onSubmit={handleWorkoutSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Search Input Autocomplete */}
              <div ref={dropdownRef} className="relative flex flex-col space-y-1">
                <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Search Exercise Database (wger API)</label>
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
                    className="w-full bg-[var(--input-bg)] border border-card-border focus:border-acid-green rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none shadow-inner"
                  />
                </div>

                {/* Selected / Current Name Display */}
                {exName && exName !== exQuery && (
                  <div className="text-[10px] text-acid-green font-bold uppercase mt-1">
                    Active selection: {exName}
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
                          className="px-4 py-2.5 border-b border-card-border last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-acid-green hover:text-accent-foreground transition-colors"
                        >
                          <span className="text-xs font-semibold">{item.name}</span>
                          <span className="text-[9px] opacity-75">{item.category}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Category</label>
                <select
                  value={exCategory}
                  onChange={(e) => setExCategory(e.target.value)}
                  className="bg-[var(--input-bg)] border border-card-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-acid-green cursor-pointer"
                >
                  <option value="Strength" className="bg-[var(--card-bg)]">Strength</option>
                  <option value="Cardio" className="bg-[var(--card-bg)]">Cardio / HIIT</option>
                  <option value="Hypertrophy" className="bg-[var(--card-bg)]">Hypertrophy</option>
                </select>
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
                  className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
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
                  className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
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
                  className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
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
                  className="bg-[var(--input-bg)] border border-card-border rounded-xl px-2 py-2 text-center text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
                  disabled={exCategory !== "Cardio"}
                />
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !exName}
              className="w-full bg-foreground text-[var(--background)] font-bold text-xs py-3 rounded-xl cursor-pointer hover:bg-acid-green hover:text-accent-foreground hover:shadow-[0_0_12px_rgba(204,255,0,0.15)] transition-all disabled:opacity-50 border-none"
            >
              {loading ? "Logging..." : "Approve & Log Workout"}
            </motion.button>
          </form>
        </section>

        {/* Arena Challenges */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-acid-green" />
            Arena Challenges
          </h2>
          <p className="text-muted text-[10px] uppercase font-bold tracking-wider mb-4">Join active targets and track your physical conditioning progress</p>

          <div className="space-y-4">
            {ecoStore.activeChallenges?.map((challenge) => {
              const hasStarted = challenge.progress > 0 || challenge.completed;
              const percent = Math.min(100, Math.round((challenge.progress / challenge.targetVal) * 100));
              
              return (
                <div key={challenge.id} className="bg-surface/50 border border-card-border p-4 rounded-xl space-y-3">
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
                          await saveEcosystemState(userId, useEcosystemStore.getState());
                          if (onNotification) onNotification(`Joined Challenge: ${challenge.name}! 🚀`);
                        }}
                        className="text-[9px] font-extrabold text-accent-foreground bg-acid-green hover:shadow-[0_0_8px_rgba(204,255,0,0.2)] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer border-none"
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
                      {/* Progress bar */}
                      <div className="w-full bg-[var(--input-bg)] rounded-full h-1.5 overflow-hidden border border-card-border">
                        <div 
                          className="bg-acid-green h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-muted">
                        <span>Progress: <strong className="text-foreground">{challenge.progress}</strong> / {challenge.targetVal} {challenge.unit}</span>
                        
                        {!challenge.completed && (
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number"
                              placeholder="+ amount"
                              id={`input-${challenge.id}`}
                              className="w-16 bg-[var(--input-bg)] border border-card-border rounded px-1.5 py-0.5 text-center text-xs text-foreground focus:outline-none focus:border-acid-green"
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                  const val = Number(e.target.value);
                                  if (val > 0) {
                                    ecoStore.updateChallengeProgress(challenge.id, val);
                                    await saveEcosystemState(userId, useEcosystemStore.getState());
                                    
                                    const nextState = useEcosystemStore.getState();
                                    const updated = nextState.activeChallenges.find(c => c.id === challenge.id);
                                    if (updated?.completed) {
                                      ecoStore.unlockAchievement('first_workout');
                                      if (onNotification) onNotification(`Challenge Completed: ${challenge.name}! 🏆`);
                                    } else {
                                      if (onNotification) onNotification(`Logged progress: +${val} to ${challenge.name}`);
                                    }
                                    e.target.value = '';
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
                                  await saveEcosystemState(userId, useEcosystemStore.getState());
                                  
                                  const nextState = useEcosystemStore.getState();
                                  const updated = nextState.activeChallenges.find(c => c.id === challenge.id);
                                  if (updated?.completed) {
                                    ecoStore.unlockAchievement('first_workout');
                                    if (onNotification) onNotification(`Challenge Completed: ${challenge.name}! 🏆`);
                                  } else {
                                    if (onNotification) onNotification(`Logged progress: +${val} to ${challenge.name}`);
                                  }
                                  if (inputEl) inputEl.value = '';
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

      {/* Right Column: Timeline & Weekly Splits */}
      <div className="space-y-6 w-full">
        {/* 2. Logged Workouts Timeline */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4">Logged Workouts Timeline</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {workoutLogs && workoutLogs.length > 0 ? (
              workoutLogs.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface/50 border border-card-border px-4 py-3 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{item.name}</span>
                    <span className="text-[9px] text-muted mt-0.5 font-medium">Category: {item.category}</span>
                  </div>
                  <div className="text-xs font-bold text-acid-green">
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
                No exercise routines logged today.
              </div>
            )}
          </div>
        </section>

        {/* 3. Weekly Splits Planner */}
        <section className="glass rounded-2xl p-6">
          <div className="flex gap-2 overflow-x-auto pb-3 border-b border-card-border mb-4 scrollbar-none">
            {splits.map((day, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setActiveDay(idx);
                  setEditingSplit(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                  activeDay === idx 
                    ? 'bg-acid-green text-accent-foreground border-acid-green shadow-md shadow-acid-green/10' 
                    : 'bg-surface border-card-border text-muted hover:text-foreground'
                }`}
              >
                {day.dayName.substring(0, 3)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {editingSplit ? (
              // Edit split container
              <div className="space-y-3 p-4 bg-surface border border-card-border rounded-xl">
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Routine Type</label>
                  <input 
                    type="text" 
                    value={editRoutineFields.type}
                    onChange={(e) => setEditRoutineFields({ ...editRoutineFields, type: e.target.value })}
                    className="w-full bg-[var(--input-bg)] border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Description</label>
                  <input 
                    type="text" 
                    value={editRoutineFields.desc}
                    onChange={(e) => setEditRoutineFields({ ...editRoutineFields, desc: e.target.value })}
                    className="w-full bg-[var(--input-bg)] border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Recommended Exercises</span>
                  {editRoutineFields.exercises.map((ex, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={ex.name}
                        onChange={(e) => {
                          const nextEx = [...editRoutineFields.exercises];
                          nextEx[i].name = e.target.value;
                          setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
                        }}
                        placeholder="Ex Name"
                        className="bg-[var(--input-bg)] border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-foreground flex-1 focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={ex.details}
                        onChange={(e) => {
                          const nextEx = [...editRoutineFields.exercises];
                          nextEx[i].details = e.target.value;
                          setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
                        }}
                        placeholder="Sets / Reps"
                        className="bg-[var(--input-bg)] border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-foreground w-32 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                  <button onClick={() => setEditingSplit(false)} className="text-[10px] text-muted py-1.5 px-3 bg-surface border border-card-border rounded-lg flex items-center gap-1 cursor-pointer"><X className="w-3.5 h-3.5" /> Cancel</button>
                  <button onClick={handleSaveSplitEdit} className="text-[10px] text-accent-foreground bg-acid-green py-1.5 px-4 rounded-lg font-bold flex items-center gap-1 cursor-pointer border-none"><Check className="w-3.5 h-3.5" /> Save</button>
                </div>
              </div>
            ) : (
              // Display split layout
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-acid-green font-bold uppercase tracking-wider">Routine Split Type</span>
                  <button 
                    onClick={handleStartEditSplit}
                    className="text-[10px] text-muted hover:text-foreground cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Routine
                  </button>
                </div>
                <h3 className="text-sm font-bold text-foreground">{splits[activeDay].workout.type}</h3>
                <p className="text-[10.5px] text-muted mt-1 leading-relaxed">{splits[activeDay].workout.desc}</p>
                
                <div className="mt-4 border-t border-card-border pt-3 space-y-3">
                  <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Exercises Recommended:</span>
                  {splits[activeDay].workout.exercises.map((ex, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">{ex.name}</span>
                      <span className="text-muted text-[11px]">{ex.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
