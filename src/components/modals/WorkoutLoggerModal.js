import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Dumbbell, Clock, Flame, Save, RefreshCw, Search, Trash2 } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { searchAndRankExercises, isFuzzyMatch, loadExercisesData, getCachedExercises, getExerciseImage, getDistinctFallback } from '../../utils/exerciseSearch';
import { addWorkoutLog, getCurrentUserId } from '../../lib/dbService';
import { calculateWorkoutCaloriesBurned } from '../../utils/workoutUtils';
import { formatDateToLocalString } from '../../utils/dateUtils';

const createInitialSets = (count = 3, defaultReps = 10, defaultWeight = 0) => {
  const numSets = Math.max(1, Number(count) || 3);
  return Array.from({ length: numSets }, (_, i) => ({
    id: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
    reps: defaultReps,
    weight: defaultWeight
  }));
};


const ModalExerciseImage = ({ item, className = "w-11 h-11 rounded-lg object-cover border border-card-border shrink-0 bg-black/30" }) => {
  const [imgSrc, setImgSrc] = useState(() => getExerciseImage(item));

  useEffect(() => {
    let isMounted = true;
    if (item?.gif_url || item?.image) {
      setImgSrc(item.gif_url || item.image);
      return;
    }

    setImgSrc(getExerciseImage(item));
    loadExercisesData().then(() => {
      if (isMounted) {
        setImgSrc(getExerciseImage(item));
      }
    });

    return () => { isMounted = false; };
  }, [item]);

  return (
    <img 
      src={imgSrc} 
      alt={item?.name || 'Exercise'} 
      className={className}
      onError={() => {
        setImgSrc(getDistinctFallback(item?.name));
      }}
    />
  );
};



const POPULAR_ROUTINES = [
  "Push Day (Chest, Shoulders & Triceps)",
  "Pull Day (Back, Biceps & Rear Delts)",
  "Leg Day (Quads, Hamstrings & Calves)",
  "Upper Body Power Routine",
  "Full Body HIIT & Conditioning"
];

export default function WorkoutLoggerModal() {
  const { activeWorkflow, workflowData, closeWorkflow } = useQuickActionsStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  const addWorkoutLogStore = useStore(state => state.addWorkoutLog);
  const workoutNameInputRef = useRef(null);

  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [duration, setDuration] = useState(45);
  const [isSaving, setIsSaving] = useState(false);

  // Top search suggestions
  const [showTopDropdown, setShowTopDropdown] = useState(false);
  const [topSearchMatches, setTopSearchMatches] = useState([]);
  const topDropdownRef = useRef(null);

  // Exercise row autocomplete state
  const [activeExIdSearch, setActiveExIdSearch] = useState(null);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);

  useEffect(() => {
    loadExercisesData();
  }, []);

  useEffect(() => {
    if (activeWorkflow === 'log_workout') {
      if (workflowData?.exerciseName) {
        setExercises([{
          id: Date.now(),
          name: workflowData.exerciseName,
          setsList: createInitialSets(3, 10, 0),
          category: workflowData.category || 'Strength'
        }]);
        setWorkoutName(workflowData.muscle ? `${workflowData.muscle} Routine` : workflowData.exerciseName);
      } else if (workflowData?.muscle) {
        setWorkoutName(`${workflowData.muscle} Workout`);
        setExercises([{
          id: Date.now(),
          name: '',
          setsList: createInitialSets(3, 10, 0),
          category: 'Strength'
        }]);
      } else {
        setExercises([{
          id: Date.now(),
          name: '',
          setsList: createInitialSets(3, 10, 0),
          category: 'Strength'
        }]);
      }
    }
  }, [activeWorkflow, workflowData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topDropdownRef.current && !topDropdownRef.current.contains(e.target)) {
        setShowTopDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (activeWorkflow !== 'log_workout') return null;

  // Typo-tolerant multi-word search matching (handles "inclince" -> "incline")
  const matchExercise = (exItem, tokens) => {
    const words = `${exItem.name} ${exItem.body_part || ''} ${exItem.target || ''} ${exItem.equipment || ''} ${exItem.category || ''}`
      .toLowerCase()
      .split(/[\s\-_,()]+/);
      
    const fullText = words.join(' ');

    return tokens.every(token => {
      if (fullText.includes(token)) return true;
      return words.some(w => isFuzzyMatch(token, w));
    });
  };

  // Search in "SEARCH ROUTINE OR EXERCISE NAME" box
  const handleTopSearchChange = (val) => {
    setWorkoutName(val);
    const q = val.toLowerCase().trim();
    if (!q) {
      setTopSearchMatches([]);
      setShowTopDropdown(false);
      return;
    }

    const tokens = q.split(/\s+/).filter(Boolean);

    // Full Exercise Dataset matches with smart relevance ranking
    const exercisesData = getCachedExercises();
    const exMatches = searchAndRankExercises(val, exercisesData);

    const exMapped = exMatches.slice(0, 15).map(x => ({
      type: 'exercise',
      ...x
    }));

    // Routine matches (placed AFTER exercise matches so dataset items with GIFs appear at top!)
    const routineMatches = POPULAR_ROUTINES.filter(r =>
      tokens.every(token => {
        const rLower = r.toLowerCase();
        return rLower.includes(token) || rLower.split(/\s+/).some(w => isFuzzyMatch(token, w));
      })
    ).map(r => ({
      type: 'routine',
      name: r
    }));

    const combined = [...exMapped, ...routineMatches];
    setTopSearchMatches(combined);
    setShowTopDropdown(combined.length > 0);
  };

  const selectTopSearchMatch = (item) => {
    if (item.type === 'routine') {
      setWorkoutName(item.name);
    } else {
      setWorkoutName(prev => prev || item.name);
      setExercises(prev => {
        const newExItem = {
          id: Date.now(),
          name: item.name,
          setsList: createInitialSets(3, 10, 0),
          category: item.category || item.body_part || 'Strength',
          image: item.image,
          gif_url: item.gif_url,
          target: item.target,
          body_part: item.body_part,
          equipment: item.equipment
        };
        if (prev.length === 1 && !prev[0].name?.trim()) {
          return [newExItem];
        }
        return [...prev, newExItem];
      });
    }
    setShowTopDropdown(false);
  };

  const handleAddExercise = () => {
    const newId = Date.now();
    setExercises(prev => [
      ...prev,
      {
        id: newId,
        name: '',
        setsList: createInitialSets(3, 10, 0),
        category: 'Strength'
      }
    ]);
    setActiveExIdSearch(null);
    setExerciseSuggestions([]);
  };

  const handleAddSet = (exerciseId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const currentSets = ex.setsList || [];
      const lastSet = currentSets[currentSets.length - 1];
      const newSet = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        reps: lastSet ? (Number(lastSet.reps) || 10) : 10,
        weight: lastSet ? (Number(lastSet.weight) || 0) : 0
      };
      const updatedSets = [...currentSets, newSet];
      return {
        ...ex,
        setsList: updatedSets,
        sets: updatedSets.length
      };
    }));
  };

  const handleUpdateSet = (exerciseId, setId, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = (ex.setsList || []).map(s => {
        if (s.id !== setId) return s;
        return { ...s, [field]: value };
      });
      return {
        ...ex,
        setsList: updatedSets,
        sets: updatedSets.length
      };
    }));
  };

  const handleRemoveSet = (exerciseId, setId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const currentSets = ex.setsList || [];
      if (currentSets.length <= 1) return ex;
      const updatedSets = currentSets.filter(s => s.id !== setId);
      return {
        ...ex,
        setsList: updatedSets,
        sets: updatedSets.length
      };
    }));
  };

  // Search in Exercise row input
  const handleUpdateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    if (field === 'name') {
      const q = value.toLowerCase().trim();
      if (!q) {
        setExerciseSuggestions([]);
        setActiveExIdSearch(null);
      } else {
        const exercisesData = getCachedExercises();
        const matches = searchAndRankExercises(value, exercisesData);
        setExerciseSuggestions(matches.slice(0, 15));
        setActiveExIdSearch(id);
      }
    }
  };

  const selectExerciseSuggestion = (exId, suggestedEx) => {
    setExercises(exercises.map(ex => ex.id === exId ? {
      ...ex,
      name: suggestedEx.name,
      category: suggestedEx.category || suggestedEx.body_part || 'Strength',
      image: suggestedEx.image,
      gif_url: suggestedEx.gif_url,
      target: suggestedEx.target,
      body_part: suggestedEx.body_part,
      equipment: suggestedEx.equipment
    } : ex));
    setActiveExIdSearch(null);
    setExerciseSuggestions([]);
  };

  const handleRemoveExercise = (id) => {
    if (exercises.length <= 1) {
      setExercises([{
        id: Date.now(),
        name: '',
        setsList: createInitialSets(3, 10, 0),
        category: 'Strength'
      }]);
    } else {
      setExercises(exercises.filter(ex => ex.id !== id));
    }
    if (activeExIdSearch === id) {
      setActiveExIdSearch(null);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    let validExercises = exercises.filter(ex => ex.name && ex.name.trim().length > 0);
    
    // If no exercise row is filled, but top workoutName search box is filled, use workoutName as exercise
    if (validExercises.length === 0 && workoutName.trim().length > 0) {
      validExercises = [{
        id: Date.now(),
        name: workoutName.trim(),
        setsList: createInitialSets(3, 10, 0),
        category: 'Strength'
      }];
    }

    if (validExercises.length === 0) return;
    
    setIsSaving(true);
    
    try {
      const user = useStore.getState().user;
      const uid = user?.uid || user?.id || await getCurrentUserId();
      if (!uid) {
        throw new Error("User ID is missing or session expired.");
      }
      let logTimestamp = Date.now();
      if (workflowData?.date) {
        const parts = String(workflowData.date).split('-');
        if (parts.length === 3) {
          const targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
          if (!isNaN(targetDate.getTime())) {
            logTimestamp = targetDate.getTime();
          }
        }
      }

      const logPromises = validExercises.map(ex => {
        const rawSetsList = Array.isArray(ex.setsList) && ex.setsList.length > 0 
          ? ex.setsList 
          : createInitialSets(Number(ex.sets) || 3, Number(ex.reps) || 10, Number(ex.weight) || 0);
        
        const formattedSets = rawSetsList.map(s => ({
          reps: Math.max(1, Number(s.reps) || 0),
          weight: Math.max(0, Number(s.weight) || 0)
        }));

        const totalSets = formattedSets.length;
        const totalReps = formattedSets.reduce((sum, s) => sum + s.reps, 0);
        const avgReps = Math.round(totalReps / totalSets) || 10;
        const maxWeight = Math.max(...formattedSets.map(s => s.weight), 0);
        const totalVolume = formattedSets.reduce((sum, s) => sum + (s.reps * s.weight), 0);

        const workoutData = {
          name: ex.name.trim() || workoutName.trim() || "Workout Exercise",
          category: ex.category || ex.body_part || 'Strength',
          sets: totalSets,
          reps: avgReps,
          weight: maxWeight,
          volumeKg: totalVolume,
          setsList: formattedSets,
          exercises: [{
            name: ex.name.trim() || workoutName.trim() || "Workout Exercise",
            sets: formattedSets,
            setCount: totalSets,
            reps: avgReps,
            weight: maxWeight,
            category: ex.category || 'Strength'
          }],
          duration: Math.round(Number(duration) / validExercises.length) || 15,
          image: ex.image || null,
          gif_url: ex.gif_url || null,
          target: ex.target || null,
          body_part: ex.body_part || null,
          equipment: ex.equipment || null,
          timestamp: logTimestamp
        };
        workoutData.caloriesBurned = calculateWorkoutCaloriesBurned(workoutData);
        return addWorkoutLog(uid, workoutData);
      });

      const savedLogs = await Promise.all(logPromises);
      savedLogs.forEach(saved => {
        if (saved) addWorkoutLogStore(saved);
      });
      
      addXP(150);
      updateStreaks();
      
      setWorkoutName('');
      setExercises([]);
      closeWorkflow();
    } catch (error) {
      console.error("Error saving workout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-x-0 top-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none"
        style={{
          bottom: 'var(--keyboard-height, 0px)',
          transition: 'bottom 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-md pointer-events-auto"
          onClick={closeWorkflow}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-surface border border-card-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          style={{
            maxHeight: 'min(90dvh, calc(100dvh - var(--keyboard-height, 0px) - 16px))'
          }}
        >
          <div className="flex items-center justify-between mb-3 border-b border-card-border/60 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-acid-green" /> Log Workout Session
              </h2>
              <span className="text-[10px] font-mono font-bold text-acid-green uppercase tracking-wider">
                Logging for: {workflowData?.date ? formatDateToLocalString(workflowData.date) : 'Today'}
              </span>
            </div>
            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            data-keyboard-scroll="true"
            className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-6 modal-scroll-body"
            style={{
              paddingBottom: '24px'
            }}
          >
            
            {/* Top Search Input: Handles Typos (e.g. inclince -> incline) */}
            <div className="space-y-4">
              <div ref={topDropdownRef} className="relative">
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
                  Search Routine or Exercise Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    ref={workoutNameInputRef}
                    type="text" 
                    placeholder="Type exercise (e.g. Incline Dumbbell Press, Squat)..." 
                    value={workoutName}
                    onChange={(e) => handleTopSearchChange(e.target.value)}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner font-bold"
                  />
                </div>

                {/* Top Search Matches */}
                <AnimatePresence>
                  {showTopDropdown && topSearchMatches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-surface border border-card-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto"
                    >
                      <div className="px-3 py-1.5 bg-surface/80 border-b border-card-border text-[9px] font-black uppercase tracking-wider text-muted flex justify-between">
                        <span>Exercise Dataset Matches (Click to Add)</span>
                        <span className="text-blue-400">Library Previews</span>
                      </div>
                      {topSearchMatches.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectTopSearchMatch(item)}
                          className="px-3.5 py-2.5 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer flex justify-between items-center text-xs border-b border-card-border/40 last:border-b-0 group/item"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.type === 'exercise' ? (
                              <ModalExerciseImage item={item} />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 font-bold">
                                <Dumbbell className="w-5 h-5 text-blue-400" />
                              </div>
                            )}

                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground truncate group-hover/item:text-blue-400">{item.name}</span>
                              <span className="text-[9.5px] text-muted truncate font-medium">
                                {item.type === 'exercise' ? `Target: ${item.target || item.body_part || 'Full Body'} (${item.category || 'Strength'})` : 'Workout Routine'}
                              </span>
                            </div>
                          </div>

                          <span className="text-[9px] text-blue-500 font-extrabold uppercase shrink-0 ml-2 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                            {item.type === 'exercise' ? '+ Add' : 'Select'}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" /> Duration (min)
                  </label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/^0+(?=\d)/, '');
                      setDuration(clean === '' ? '' : Number(clean));
                    }}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" /> Est. Calories
                  </label>
                  <input 
                    type="number" 
                    disabled
                    value={Math.round(duration * 7.5)}
                    className="w-full bg-[var(--input)]/50 text-muted border border-card-border px-3 py-2 rounded-xl text-sm shadow-inner cursor-not-allowed font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Exercises</h3>
                <span className="text-[10px] text-muted font-bold">Search any exercise with image preview</span>
              </div>
              
              <div className="space-y-4">
                {exercises.map((ex, index) => (
                  <div key={ex.id} className="p-3.5 border border-card-border rounded-2xl bg-surface/50 space-y-3 relative group">
                    <button 
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="absolute right-3 top-3 p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer border-none z-10"
                      title={exercises.length > 1 ? "Remove Exercise" : "Clear Exercise"}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-2">
                        <ModalExerciseImage item={ex} className="w-12 h-12 rounded-xl object-cover border border-card-border shrink-0 bg-black/30 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <label className="text-[9px] font-bold text-muted uppercase block mb-1">
                            Exercise #{index + 1} Name {ex.target ? `• ${ex.target}` : ''}
                          </label>
                          <div className="relative flex items-center">
                            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted" />
                            <input 
                              type="text" 
                              placeholder="Type exercise name (e.g. 3/4 sit-up, Incline Bench, Squat)..." 
                              value={ex.name}
                              onChange={(e) => handleUpdateExercise(ex.id, 'name', e.target.value)}
                              className="w-full bg-[var(--input)] text-foreground border border-card-border pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold shadow-inner"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Exercise Row Suggestions Dropdown */}
                      <AnimatePresence>
                        {activeExIdSearch === ex.id && exerciseSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-surface border border-card-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                          >
                            <div className="px-3 py-1.5 bg-surface/80 border-b border-card-border text-[9px] font-black uppercase tracking-wider text-muted">
                              Exercise Library Matches (Image Preview)
                            </div>
                            {exerciseSuggestions.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => selectExerciseSuggestion(ex.id, item)}
                                className="px-3 py-2.5 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer flex justify-between items-center text-xs border-b border-card-border/40 last:border-b-0 group/item"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <ModalExerciseImage item={item} />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-foreground truncate group-hover/item:text-blue-400">{item.name}</span>
                                    <span className="text-[9.5px] text-muted truncate font-medium">
                                      Target: {item.target || item.body_part || 'Full Body'} ({item.category || 'Strength'})
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[9px] text-blue-500 font-extrabold uppercase shrink-0 ml-2 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md">
                                  Select
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Individual Sets Table */}
                    <div className="space-y-2 pt-3 border-t border-card-border/60">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted font-mono">
                            Logged Sets
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-[var(--input)] text-accent font-black font-mono border border-card-border/60">
                            {ex.setsList?.length || 0} {(ex.setsList?.length || 0) === 1 ? 'Set' : 'Sets'}
                          </span>
                        </div>
                        {(() => {
                          const vol = (ex.setsList || []).reduce((acc, s) => acc + ((Number(s.reps) || 0) * (Number(s.weight) || 0)), 0);
                          return vol > 0 ? (
                            <span className="text-[10px] font-mono font-bold text-accent">
                              {vol.toLocaleString()} kg volume
                            </span>
                          ) : null;
                        })()}
                      </div>

                      {/* Sets Table Header */}
                      <div className="grid grid-cols-12 gap-2 px-2.5 py-1.5 bg-surface-elevated/70 rounded-xl text-[9px] font-black uppercase tracking-wider text-muted font-mono">
                        <div className="col-span-2 text-center">Set</div>
                        <div className="col-span-4 text-center">Reps</div>
                        <div className="col-span-4 text-center">Weight (kg)</div>
                        <div className="col-span-2 text-center">Action</div>
                      </div>

                      {/* Sets Rows */}
                      <div className="space-y-1.5">
                        {(ex.setsList || []).map((setObj, setIdx) => (
                          <div 
                            key={setObj.id || setIdx} 
                            className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-xl bg-surface-elevated/40 border border-card-border/60 hover:border-card-border transition-colors"
                          >
                            {/* Set Number */}
                            <div className="col-span-2 flex justify-center">
                              <span className="w-7 h-7 rounded-lg bg-[var(--input)] text-foreground font-mono font-black text-xs flex items-center justify-center border border-card-border/80 shadow-xs">
                                {setIdx + 1}
                              </span>
                            </div>

                            {/* Reps */}
                            <div className="col-span-4">
                              <input 
                                type="number"
                                min="1"
                                value={setObj.reps === undefined ? '' : setObj.reps}
                                placeholder="10"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/^0+(?=\d)/, '');
                                  handleUpdateSet(ex.id, setObj.id, 'reps', clean === '' ? '' : Number(clean));
                                }}
                                className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs font-black text-center font-mono shadow-inner"
                              />
                            </div>

                            {/* Weight */}
                            <div className="col-span-4">
                              <input 
                                type="number"
                                min="0"
                                step="0.5"
                                value={setObj.weight === undefined ? '' : setObj.weight}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/^0+(?=\d)/, '');
                                  handleUpdateSet(ex.id, setObj.id, 'weight', clean === '' ? '' : Number(clean));
                                }}
                                className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs font-black text-center font-mono shadow-inner"
                              />
                            </div>

                            {/* Action */}
                            <div className="col-span-2 flex justify-center">
                              {(ex.setsList?.length || 0) > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSet(ex.id, setObj.id)}
                                  className="p-1.5 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-none bg-transparent"
                                  title="Delete set"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-muted/30 font-mono">—</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Set Button */}
                      <button
                        type="button"
                        onClick={() => handleAddSet(ex.id)}
                        className="w-full py-2 bg-surface-elevated/70 hover:bg-[var(--input)] text-muted hover:text-accent border border-dashed border-card-border hover:border-accent/40 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 active:scale-[0.99]"
                      >
                        <Plus className="w-3.5 h-3.5 text-accent stroke-[2.5]" />
                        <span>+ Add Set {(ex.setsList?.length || 0) + 1}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleAddExercise}
                className="w-full py-3 border border-dashed border-blue-500/50 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Another Exercise
              </button>
            </div>
            
          </div>
          
          <div className="pt-4 border-t border-card-border mt-2">
            <button 
              onClick={handleSave}
              disabled={isSaving || (!workoutName.trim() && exercises.filter(e => e.name && e.name.trim()).length === 0)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer border-none shadow-lg"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Workout Session Log
                </>
              )}
            </button>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
