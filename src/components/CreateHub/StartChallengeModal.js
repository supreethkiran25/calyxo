import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Save, Calendar, Activity } from 'lucide-react';
import useCreateHubStore from '../../store/useCreateHubStore';
import { getCurrentUserId } from '../../lib/dbService';

export default function StartChallengeModal() {
  const { activeWorkflow, closeWorkflow } = useCreateHubStore();
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('7');
  const [isSaving, setIsSaving] = useState(false);

  if (activeWorkflow !== 'start_challenge') return null;

  const handleSave = async () => {
    if (!title || !goal) return;
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      closeWorkflow();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeWorkflow} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" /> Start Challenge
            </h2>
            <button onClick={closeWorkflow} className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Challenge Name</label>
              <input type="text" placeholder="e.g. 30 Days of Code... wait no, 30 Days of Cardio" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Numeric Goal (e.g. Distance/Time)</label>
              <input type="text" placeholder="e.g. 50 miles or 10,000 steps/day" value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Duration (Days)</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500">
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-card-border">
            <button onClick={handleSave} disabled={isSaving || !title || !goal} className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Launch Challenge
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
