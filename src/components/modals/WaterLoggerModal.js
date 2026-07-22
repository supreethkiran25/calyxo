import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Plus, Sparkles, RotateCcw } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useStore } from '../../store/useStore';
import { saveWaterIntake } from '../../lib/dbService';

export default function WaterLoggerModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const user = useStore(state => state.user);
  const waterIntake = useStore(state => state.waterIntake);
  const addWaterIntakeStore = useStore(state => state.addWaterIntake);
  const setWaterIntake = useStore(state => state.setWaterIntake);
  const resetWaterIntake = useStore(state => state.resetWaterIntake);

  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [pouring, setPouring] = useState(false);

  if (activeWorkflow !== 'log_water') return null;

  const targetGoal = 3000; // 3,000 ml daily hydration goal
  const fillPct = Math.min(100, Math.round((waterIntake / targetGoal) * 100));

  const playWaterChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("AudioContext chime error", e);
    }
  };

  const handleLogWater = async (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) return;
    playWaterChime();
    setLoading(true);
    setPouring(true);
    setTimeout(() => setPouring(false), 1200);

    const userId = user?.uid || user?.id;
    const prevWater = useStore.getState().waterIntake;
    addWaterIntakeStore(amount);
    const next = useStore.getState().waterIntake;
    
    try {
      if (userId) {
        await saveWaterIntake(userId, next);
      }
    } catch (err) {
      console.error("Failed to save water intake:", err);
      setWaterIntake(prevWater);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const userId = user?.uid || user?.id;
    resetWaterIntake();
    try {
      if (userId) {
        await saveWaterIntake(userId, 0);
      }
    } catch (err) {
      console.error("Failed resetting water", err);
    }
  };

  const getHydrationStatus = () => {
    if (fillPct >= 100) return { label: "Goal Reached! 🌊", color: "text-emerald-400" };
    if (fillPct >= 75) return { label: "Optimal Hydration 💧", color: "text-cyan-400" };
    if (fillPct >= 40) return { label: "Steady Hydration 🥛", color: "text-blue-400" };
    return { label: "Dehydrated - Keep Drinking! ⚠️", color: "text-amber-400" };
  };

  const status = getHydrationStatus();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-background/80 backdrop-blur-md" 
          onClick={closeWorkflow} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          className="relative w-full max-w-lg bg-surface border border-card-border rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-card-border mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Droplets className="w-6 h-6 text-cyan-400 animate-pulse" /> Hydration Tracker
            </h2>
            <button 
              onClick={closeWorkflow} 
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors border-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* REALISTIC ANIMATED WATER FILLING CONTAINER */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="relative w-32 h-64 rounded-3xl border-4 border-cyan-400/40 bg-black/40 backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col justify-end">
                
                {/* Glass reflections */}
                <div className="absolute top-0 left-2 w-2 h-full bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-full z-20 pointer-events-none" />
                <div className="absolute top-3 right-3 w-1.5 h-16 bg-white/20 rounded-full z-20 pointer-events-none" />

                {/* Measurement Ticks */}
                <div className="absolute left-2 right-2 top-0 bottom-0 flex flex-col justify-between py-4 z-20 pointer-events-none opacity-40">
                  {[3000, 2250, 1500, 750].map((mark) => (
                    <div key={mark} className="flex justify-between items-center text-[7px] font-mono text-cyan-200 font-bold border-t border-white/20 pt-0.5">
                      <span>{mark}ml</span>
                    </div>
                  ))}
                </div>

                {/* Pouring Stream Animation when adding */}
                <AnimatePresence>
                  {pouring && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "100%", opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-3 bg-cyan-300/80 z-30 shadow-[0_0_15px_#22d3ee] rounded-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* DYNAMIC WATER LIQUID FILL */}
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: `${fillPct}%` }}
                  transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-full relative overflow-hidden bg-gradient-to-t from-blue-700 via-cyan-500 to-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                  {/* Undulating Liquid Surface Waves */}
                  <div className="absolute -top-3 left-0 w-[200%] h-6 bg-cyan-300/50 rounded-[40%] animate-liquid-wave-1 pointer-events-none" />
                  <div className="absolute -top-2 left-0 w-[200%] h-6 bg-cyan-200/40 rounded-[35%] animate-liquid-wave-2 pointer-events-none" />

                  {/* Rising Water Bubbles */}
                  <div className="absolute bottom-2 left-4 w-2 h-2 rounded-full bg-white/60 animate-bubble-1" />
                  <div className="absolute bottom-1 left-12 w-3 h-3 rounded-full bg-white/70 animate-bubble-2" />
                  <div className="absolute bottom-4 right-6 w-2 h-2 rounded-full bg-white/60 animate-bubble-3" />
                </motion.div>

                {/* Inside Percentage Badge */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-black/60 border border-cyan-400/40 text-cyan-300 font-black text-sm backdrop-blur-md shadow-lg">
                    {fillPct}%
                  </div>
                </div>

              </div>

              {/* Status Badge */}
              <div className="mt-3 text-center">
                <span className={`text-[10px] font-black uppercase tracking-wider ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* CONTROLS & QUICK WATER ADD */}
            <div className="space-y-5">
              
              {/* Numerical readout */}
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl text-center shadow-inner">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Current Water Level</span>
                <div className="text-3xl font-black text-foreground flex items-center justify-center gap-1.5">
                  <span className="text-cyan-400">{waterIntake.toLocaleString()}</span>
                  <span className="text-xs text-muted font-bold">/ 3,000 ml</span>
                </div>
              </div>

              {/* Quick Add Presets Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Quick Fill Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { ml: 250, label: "Glass", icon: "🥛" },
                    { ml: 500, label: "Bottle", icon: "🍾" },
                    { ml: 750, label: "Sport Flask", icon: "🥤" },
                    { ml: 1000, label: "Jug (1L)", icon: "🫗" }
                  ].map(item => (
                    <button
                      key={item.ml}
                      onClick={() => handleLogWater(item.ml)}
                      disabled={loading}
                      className="py-3 px-2 border border-card-border rounded-xl bg-[var(--input)] hover:border-cyan-400/60 hover:bg-cyan-500/10 text-xs font-black transition-all active:scale-95 cursor-pointer text-foreground flex items-center justify-between gap-1 shadow-sm"
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-[10px] uppercase">{item.label}</span>
                      <span className="text-cyan-400 font-black">+{item.ml}ml</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-2">
                <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">Custom Volume (ml)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                    className="flex-1 bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 text-xs font-bold shadow-inner"
                  />
                  <button
                    onClick={() => {
                      handleLogWater(Number(customAmount));
                      setCustomAmount('');
                    }}
                    disabled={loading || !customAmount}
                    className="px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer border-none active:scale-95 transition-all disabled:opacity-50 shadow-md"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Reset button */}
              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleReset}
                  className="text-[10px] font-bold text-muted hover:text-destructive flex items-center gap-1 cursor-pointer bg-none border-none uppercase tracking-wider"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Daily Hydration
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
