import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Dumbbell, Clock, Flame, Save, RefreshCw, Search } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { searchAndRankExercises, isFuzzyMatch, loadExercisesData, getCachedExercises, getExerciseImage, getDistinctFallback } from '../../utils/exerciseSearch';
import { addWorkoutLog, getCurrentUserId } from '../../lib/dbService';


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
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
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
      if (exercises.length === 0) {
        setExercises([{ id: Date.now(), name: '', sets: 3, reps: 10, weight: 0, category: 'Strength' }]);
      }
      if (workoutNameInputRef.current) {
        setTimeout(() => workoutNameInputRef.current?.focus(), 100);
      }
    }
  }, [activeWorkflow]);

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
          sets: 3,
          reps: 10,
          weight: 0,
          category: item.category || item.body_part || 'Strength',
          image: item.image,
          gif_url: item.gif_url,
          target: item.target,
          body_part: item.body_part,
          equipment: item.equipment
        };
        if (prev.length === 1 && !prev[0].name) {
          return [{ ...prev[0], ...newExItem }];
        }
        return [...prev, newExItem];
      });
    }
    setShowTopDropdown(false);
  };

  const handleAddExercise = () => {
    const newId = Date.now();
    setExercises([...exercises, { id: newId, name: '', sets: 3, reps: 10, weight: 0, category: 'Strength' }]);
    setActiveExIdSearch(null);
    setExerciseSuggestions([]);
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
    setExercises(exercises.filter(ex => ex.id !== id));
    if (activeExIdSearch === id) {
      setActiveExIdSearch(null);
    }
  };

  const handleSave = async () => {
    let validExercises = exercises.filter(ex => ex.name && ex.name.trim().length > 0);
    
    // If no exercise row is filled, but top workoutName search box is filled, use workoutName as exercise
    if (validExercises.length === 0 && workoutName.trim().length > 0) {
      validExercises = [{
        id: Date.now(),
        name: workoutName.trim(),
        sets: 3,
        reps: 10,
        weight: 0,
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
      const logPromises = validExercises.map(ex => {
        const workoutData = {
          name: ex.name.trim() || workoutName.trim() || "Workout Exercise",
          category: ex.category || ex.body_part || 'Strength',
          sets: Number(ex.sets) || 1,
          reps: Number(ex.reps) || 10,
          weight: Number(ex.weight) || 0,
          duration: Number(duration) || 30,
          image: ex.image || null,
          gif_url: ex.gif_url || null,
          target: ex.target || null,
          body_part: ex.body_part || null,
          equipment: ex.equipment || null,
          timestamp: Date.now()
        };
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={closeWorkflow}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          className="relative w-full max-w-2xl bg-surface border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" /> Log Workout Session
            </h2>
            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-6">
            
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
                    {exercises.length > 1 && (
                      <button 
                        onClick={() => handleRemoveExercise(ex.id)}
                        className="absolute right-3 top-3 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer border-none"
                        title="Remove Exercise"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
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
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-muted uppercase block mb-1">Sets</label>
                        <input 
                          type="number" 
                          value={ex.sets}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/^0+(?=\d)/, '');
                            handleUpdateExercise(ex.id, 'sets', clean);
                          }}
                          className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted uppercase block mb-1">Reps</label>
                        <input 
                          type="number" 
                          value={ex.reps}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/^0+(?=\d)/, '');
                            handleUpdateExercise(ex.id, 'reps', clean);
                          }}
                          className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted uppercase block mb-1">Weight (kg)</label>
                        <input 
                          type="number" 
                          value={ex.weight}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/^0+(?=\d)/, '');
                            handleUpdateExercise(ex.id, 'weight', clean);
                          }}
                          className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs font-bold text-center"
                        />
                      </div>
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
