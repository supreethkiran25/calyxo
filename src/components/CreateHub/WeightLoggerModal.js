import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale } from 'lucide-react';
import useCreateHubStore from '../../store/useCreateHubStore';
import { useStore } from '../../store/useStore';
import { addWeightLog, saveUserProfile } from '../../lib/dbService';

export default function WeightLoggerModal() {
  const { activeWorkflow, closeWorkflow } = useCreateHubStore();
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const addWeightLogStore = useStore(state => state.addWeightLog);
  const updateUserProfileStore = useStore(state => state.updateUserProfile);

  const [weightInput, setWeightInput] = useState(userProfile?.weight || '');
  const [units, setUnits] = useState(userProfile?.units || 'metric');
  const [loading, setLoading] = useState(false);

  if (activeWorkflow !== 'update_weight') return null;

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput) || weightInput <= 0) return;
    setLoading(true);
    const userId = user?.uid || user?.id;
    const weightVal = Number(weightInput);
    
    try {
      if (userId) {
        // 1. Add weight log entry to DB
        const entry = await addWeightLog(userId, weightVal, units);
        
        // 2. Add to Zustand store logs
        addWeightLogStore(entry);
        
        // 3. Update current weight in user profile DB & store
        const updatedProfile = { ...userProfile, weight: weightVal, units };
        await saveUserProfile(userId, updatedProfile);
        updateUserProfileStore({ weight: weightVal, units });
      }
      closeWorkflow();
    } catch (err) {
      console.error("Failed to save weight log:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeWorkflow} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-card-border mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-500" /> Update Weight
            </h2>
            <button onClick={closeWorkflow} className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors border-none cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleLogWeight} className="space-y-6">
            <div className="flex justify-between items-center bg-surface border border-card-border p-1 rounded-xl">
              {['metric', 'imperial'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnits(u)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all border-none ${
                    units === u ? 'bg-[var(--card)] text-foreground border border-card-border shadow' : 'text-muted bg-transparent'
                  }`}
                >
                  {u === 'metric' ? 'Metric (kg)' : 'Imperial (lbs)'}
                </button>
              ))}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Current Weight ({units === 'metric' ? 'kg' : 'lbs'})</label>
              <input
                type="number"
                step="0.1"
                placeholder={units === 'metric' ? 'e.g. 72.5' : 'e.g. 160.0'}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 text-sm outline-none"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !weightInput}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl cursor-pointer border-none active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Weight Log'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
