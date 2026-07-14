import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Dumbbell, Clock, Flame, Save, RefreshCw } from 'lucide-react';
import useCreateHubStore from '../../store/useCreateHubStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { addWorkoutLog, getCurrentUserId } from '../../lib/dbService';

export default function WorkoutLoggerModal() {
  const { activeWorkflow, closeWorkflow } = useCreateHubStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [duration, setDuration] = useState(45);
  const [isSaving, setIsSaving] = useState(false);

  if (activeWorkflow !== 'log_workout') return null;

  const handleAddExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', sets: 3, reps: 10, weight: 0 }]);
  };

  const handleUpdateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleRemoveExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = async () => {
    if (!workoutName || exercises.length === 0) return;
    
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("No user ID found.");
      return;
    }

    setIsSaving(true);
    
    try {
      const workoutData = {
        name: workoutName,
        duration,
        calories: Math.round(duration * 7.5),
        exercises
      };

      await addWorkoutLog(uid, workoutData);
      
      // Update ecosystem store
      addXP(150); // Award XP for logging workout
      updateStreaks();
      
      // Close modal
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
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-surface border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" /> Log Workout
            </h2>
            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Workout Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Upper Body Power" 
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration (min)
                  </label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" /> Est. Calories
                  </label>
                  <input 
                    type="number" 
                    disabled
                    value={Math.round(duration * 7.5)} // Rough estimation
                    className="w-full bg-[var(--input)]/50 text-muted border border-card-border px-3 py-2 rounded-xl text-sm shadow-inner cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Exercises</h3>
              </div>
              
              {exercises.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-card-border rounded-xl bg-surface/30">
                  <Dumbbell className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted font-medium">No exercises added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((ex, index) => (
                    <div key={ex.id} className="p-3 border border-card-border rounded-xl bg-surface/50 space-y-3 relative group">
                      <button 
                        onClick={() => handleRemoveExercise(ex.id)}
                        className="absolute right-2 top-2 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      <div>
                        <input 
                          type="text" 
                          placeholder="Exercise Name (e.g. Bench Press)" 
                          value={ex.name}
                          onChange={(e) => handleUpdateExercise(ex.id, 'name', e.target.value)}
                          className="w-full bg-transparent text-foreground border-b border-card-border/50 px-1 py-1 focus:outline-none focus:border-blue-500 text-sm font-bold"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-muted uppercase block mb-1">Sets</label>
                          <input 
                            type="number" 
                            value={ex.sets}
                            onChange={(e) => handleUpdateExercise(ex.id, 'sets', Number(e.target.value))}
                            className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted uppercase block mb-1">Reps</label>
                          <input 
                            type="number" 
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(ex.id, 'reps', Number(e.target.value))}
                            className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-muted uppercase block mb-1">Weight (lbs)</label>
                          <input 
                            type="number" 
                            value={ex.weight}
                            onChange={(e) => handleUpdateExercise(ex.id, 'weight', Number(e.target.value))}
                            className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={handleAddExercise}
                className="w-full py-2.5 border border-dashed border-blue-500/50 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Exercise
              </button>
            </div>
            
          </div>
          
          <div className="pt-4 border-t border-card-border mt-2">
            <button 
              onClick={handleSave}
              disabled={isSaving || !workoutName || exercises.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Workout
                </>
              )}
            </button>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
