import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Plus } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useStore } from '../../store/useStore';
import { saveWaterIntake } from '../../lib/dbService';

export default function WaterLoggerModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const user = useStore(state => state.user);
  const waterIntake = useStore(state => state.waterIntake);
  const addWaterIntakeStore = useStore(state => state.addWaterIntake);
  const setWaterIntake = useStore(state => state.setWaterIntake);

  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (activeWorkflow !== 'log_water') return null;

  const handleLogWater = async (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) return;
    setLoading(true);
    const userId = user?.uid || user?.id;
    const prevWater = useStore.getState().waterIntake;
    addWaterIntakeStore(amount);
    const next = useStore.getState().waterIntake;
    try {
      if (userId) {
        await saveWaterIntake(userId, next);
      }
      closeWorkflow();
    } catch (err) {
      console.error("Failed to save water intake:", err);
      setWaterIntake(prevWater); // Rollback
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
              <Droplets className="w-5 h-5 text-cyan-500" /> Log Hydration
            </h2>
            <button onClick={closeWorkflow} className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors border-none cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <span className="text-muted text-xs uppercase tracking-wider font-bold">Today's Intake</span>
              <div className="text-4xl font-black text-foreground mt-1 flex items-center justify-center gap-1.5">
                <span className="text-cyan-500">{waterIntake}</span>
                <span className="text-base text-muted font-bold">ml</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[250, 500, 750].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleLogWater(amount)}
                  disabled={loading}
                  className="py-4 border border-card-border rounded-2xl bg-[var(--input)] hover:border-cyan-500/50 hover:bg-cyan-500/5 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-foreground outline-none flex flex-col items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4 text-cyan-500" />
                  <span>{amount} ml</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Custom Volume (ml)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 350"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 bg-[var(--input)] text-foreground border border-card-border px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 text-sm outline-none"
                />
                <button
                  onClick={() => handleLogWater(Number(customAmount))}
                  disabled={loading || !customAmount}
                  className="px-6 rounded-xl bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer border-none active:scale-95 transition-transform disabled:opacity-50"
                >
                  Log
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
