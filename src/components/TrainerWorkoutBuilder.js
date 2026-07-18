import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Trash2, Save, X, Settings2, Clock, Zap } from 'lucide-react';

export default function TrainerWorkoutBuilder({ user }) {
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Strength');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState('45');
  const [exercises, setExercises] = useState([]);
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  // Exercise Form State
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('3');
  const [exReps, setExReps] = useState('10');
  const [exWeight, setExWeight] = useState('');
  const [exRest, setExRest] = useState('60');
  const [exNotes, setExNotes] = useState('');

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!exName) return;
    
    setExercises([...exercises, {
      id: Date.now().toString(),
      name: exName,
      sets: exSets,
      reps: exReps,
      weight: exWeight,
      rest: exRest,
      notes: exNotes
    }]);

    setExName(''); setExSets('3'); setExReps('10'); setExWeight(''); setExRest('60'); setExNotes('');
    setIsAddingExercise(false);
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleSaveTemplate = () => {
    if (!workoutName) return alert("Workout needs a name");
    if (exercises.length === 0) return alert("Add at least one exercise");
    
    // In a real app, this would push to Supabase
    alert(`Workout Template "${workoutName}" saved successfully!`);
    
    // Reset form
    setWorkoutName('');
    setDescription('');
    setExercises([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Workout Builder</h1>
          <p className="text-muted text-sm">Create and manage workout templates for your clients.</p>
        </div>
        <button 
          onClick={handleSaveTemplate}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
        >
          <Save className="w-4 h-4" /> Save Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Meta Data */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-card-border p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">Workout Details</h3>
            
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Workout Name</label>
              <input 
                type="text" 
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g. Upper Body Power" 
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Focus on progressive overload..." 
                rows={3}
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-xs shadow-inner">
                  <option>Strength</option>
                  <option>Hypertrophy</option>
                  <option>Cardio</option>
                  <option>HIIT</option>
                  <option>Mobility</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-xs shadow-inner">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Elite</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Duration (Mins)</label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Exercise List */}
        <div className="lg:col-span-2 space-y-4">
          
          {exercises.length === 0 ? (
            <div className="bg-surface/50 border border-dashed border-card-border rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full">
              <Dumbbell className="w-12 h-12 text-muted mb-4 opacity-50" />
              <h3 className="font-bold text-foreground mb-1">No Exercises Added</h3>
              <p className="text-xs text-muted max-w-sm mb-6">Build your workout by adding exercises, defining sets, reps, and rest periods.</p>
              <button 
                onClick={() => setIsAddingExercise(true)}
                className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 border-none cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Add First Exercise
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1 mb-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Exercise Flow</h3>
                <button 
                  onClick={() => setIsAddingExercise(true)}
                  className="text-blue-500 font-bold text-xs flex items-center gap-1 bg-transparent border-none cursor-pointer hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Exercise
                </button>
              </div>
              
              {exercises.map((ex, index) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={ex.id} className="bg-surface border border-card-border rounded-xl p-4 flex gap-4 items-start relative group">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground">{ex.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-background border border-card-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-muted">{ex.sets} Sets</span>
                          <span className="bg-background border border-card-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-muted">{ex.reps} Reps</span>
                          {ex.weight && <span className="bg-background border border-card-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-muted">{ex.weight}</span>}
                          <span className="bg-background border border-card-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.rest}s rest</span>
                        </div>
                      </div>
                      <button onClick={() => removeExercise(ex.id)} className="text-muted hover:text-destructive p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {ex.notes && <p className="text-xs text-muted mt-3 italic border-l-2 border-blue-500/30 pl-2">{ex.notes}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Add Exercise Modal */}
      {isAddingExercise && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-bg w-full max-w-lg rounded-3xl border border-card-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-card-border pb-4">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2"><Dumbbell className="w-5 h-5 text-blue-500" /> Add Exercise</h2>
              <button onClick={() => setIsAddingExercise(false)} className="text-muted hover:text-foreground cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Exercise Name</label>
                <input 
                  type="text" 
                  required
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  placeholder="e.g. Barbell Squat"
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Sets</label>
                  <input type="number" required value={exSets} onChange={(e) => setExSets(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-center shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Reps/Time</label>
                  <input type="text" required value={exReps} onChange={(e) => setExReps(e.target.value)} placeholder="10 or 60s" className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-center shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Target Wgt</label>
                  <input type="text" value={exWeight} onChange={(e) => setExWeight(e.target.value)} placeholder="e.g. 50kg" className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-center shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Rest (Sec)</label>
                  <input type="number" value={exRest} onChange={(e) => setExRest(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-center shadow-inner" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Trainer Notes / Instructions</label>
                <textarea 
                  value={exNotes}
                  onChange={(e) => setExNotes(e.target.value)}
                  placeholder="Keep back straight, drive through heels..."
                  rows={2}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner resize-none"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-card-border">
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl cursor-pointer border-none shadow-lg shadow-blue-500/20">
                  Add to Workout
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
