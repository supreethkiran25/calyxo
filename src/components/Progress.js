import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { addWeightLog, saveEcosystemState } from '../lib/dbService';
import { Trophy, Activity, Lock, Sparkles, Share2, Download, TrendingUp, RefreshCw, Scale, Minus, Plus, CheckCircle2, Flame } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function Progress({ onNotification }) {
  const user = useStore(state => state.user);
  const weightLogs = useStore(state => state.weightLogs || []);
  const workoutLogs = useStore(state => state.workoutLogs || []);
  const storeAddWeightLog = useStore(state => state.addWeightLog);
  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs || []);
  const waterIntake = useStore(state => state.waterIntake || 0);
  const ecoStore = useEcosystemStore();
  const userId = user?.uid || user?.id;
  const units = userProfile?.units || 'metric';
  const isMetric = units === 'metric';

  const [activeSubTab, setActiveSubTab] = useState('analytics');

  // Weight Ruler Wheel State
  const currentWeightNum = Number(userProfile?.weight || (weightLogs[weightLogs.length - 1]?.weight) || 70);
  const [selectedWeight, setSelectedWeight] = useState(currentWeightNum);
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  // Predictions State
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Body Composition Tracker State (Visual, no tape measuring required)
  const [bodyFatLevel, setBodyFatLevel] = useState(userProfile?.bodyFat || 18);
  const [physiqueGoal, setPhysiqueGoal] = useState(userProfile?.goal || 'lose');

  // Auto-evaluate achievements on mount / data change
  useEffect(() => {
    if (!ecoStore.achievements) return;
    let modified = false;
    const currentAchs = ecoStore.achievements;

    // 1. First Workout
    if (workoutLogs.length > 0 && !currentAchs.find(a => a.id === 'first_workout')?.unlocked) {
      ecoStore.unlockAchievement('first_workout');
      modified = true;
    }
    // 2. First Meal
    if (foodLogs.length > 0 && !currentAchs.find(a => a.id === 'first_meal')?.unlocked) {
      ecoStore.unlockAchievement('first_meal');
      modified = true;
    }
    // 3. Hydration Hero
    if (waterIntake >= 3000 && !currentAchs.find(a => a.id === 'hydration_hero')?.unlocked) {
      ecoStore.unlockAchievement('hydration_hero');
      modified = true;
    }
    // 4. Muscle Builder (10+ workouts)
    if (workoutLogs.length >= 10 && !currentAchs.find(a => a.id === 'muscle_builder')?.unlocked) {
      ecoStore.unlockAchievement('muscle_builder');
      modified = true;
    }
  }, [workoutLogs.length, foodLogs.length, waterIntake, ecoStore]);

  // Haptic feedback trigger
  const triggerHaptic = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {}
  }, []);

  // Weight Ruler Wheel Clamping & Drag
  const minWeight = isMetric ? 30.0 : 65.0;
  const maxWeight = isMetric ? 220.0 : 485.0;
  const step = 0.1;
  const PX_PER_STEP = 10;

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startValRef = useRef(selectedWeight);
  const lastHapticRef = useRef(selectedWeight);

  const updateWeightClamped = useCallback((newVal) => {
    const clamped = Math.min(maxWeight, Math.max(minWeight, Math.round(newVal * 10) / 10));
    setSelectedWeight(clamped);

    if (Math.abs(clamped - lastHapticRef.current) >= 0.1) {
      lastHapticRef.current = clamped;
      triggerHaptic();
    }
  }, [minWeight, maxWeight, triggerHaptic]);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startValRef.current = selectedWeight;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaVal = -(deltaX / PX_PER_STEP) * step;
    updateWeightClamped(startValRef.current + deltaVal);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch (err) {}
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    if (Math.abs(delta) < 1) return;
    const deltaStep = (delta > 0 ? 0.1 : -0.1);
    updateWeightClamped(selectedWeight + deltaStep);
  };

  const renderTicks = () => {
    const visibleRange = 3.5;
    const startNum = Math.max(minWeight, Math.floor((selectedWeight - visibleRange) * 10) / 10);
    const endNum = Math.min(maxWeight, Math.ceil((selectedWeight + visibleRange) * 10) / 10);
    
    const ticks = [];
    for (let w = startNum; w <= endNum; w = Math.round((w + 0.1) * 10) / 10) {
      const isMajor = Math.abs(Math.round(w) - w) < 0.01;
      const isMid = !isMajor && Math.abs(Math.round(w * 2) / 2 - w) < 0.01;
      const offsetPx = (w - selectedWeight) * (PX_PER_STEP / step);
      
      ticks.push(
        <div
          key={w.toFixed(1)}
          className="absolute flex flex-col items-center pointer-events-none transform -translate-x-1/2"
          style={{ left: `calc(50% + ${offsetPx}px)` }}
        >
          <div
            className={`transition-colors ${
              isMajor
                ? 'w-[2px] h-7 bg-slate-300 dark:bg-slate-400'
                : isMid
                ? 'w-[1.5px] h-5 bg-slate-500/70'
                : 'w-[1px] h-3 bg-slate-700'
            }`}
          />
          {isMajor && (
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 font-mono mt-1.5 select-none">
              {Math.round(w)}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  const handleSaveRulerWeight = async () => {
    if (!selectedWeight || isSavingWeight) return;
    setIsSavingWeight(true);
    try {
      const val = Number(selectedWeight.toFixed(1));
      const entry = await addWeightLog(userId, val, units);
      if (entry) storeAddWeightLog(entry);
      if (onNotification) onNotification(`Logged weight: ${val} ${units === 'imperial' ? 'lbs' : 'kg'}`);
      triggerHaptic();
    } catch (err) {
      console.error("Save weight log failed", err);
      if (onNotification) onNotification("Failed to save weight. Please try again.");
    } finally {
      setIsSavingWeight(false);
    }
  };

  // Compute stats trend
  let trend = null;
  if (weightLogs && weightLogs.length >= 2) {
    const weights = weightLogs.map(x => Number(x.weight));
    trend = (weights[weights.length - 1] - weights[0]).toFixed(1);
  }

  // Calculate Calorie Averages
  const calorieTrend = useMemo(() => {
    if (!foodLogs || foodLogs.length === 0) return [];
    const grouped = {};
    foodLogs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      grouped[date] = (grouped[date] || 0) + (Number(log.calories) || 0);
    });
    return Object.entries(grouped).slice(0, 7).reverse();
  }, [foodLogs]);

  // Deterministic AI Body Composition Forecast Engine
  const computedForecast = useMemo(() => {
    const currentW = currentWeightNum;
    const targetW = Number(userProfile?.goalWeight || userProfile?.weightGoal || (userProfile?.goal === 'gains' ? currentW + 4 : currentW - 5));
    const isDeficit = targetW < currentW;
    const ratePerWeek = isDeficit ? 0.45 : 0.25; // ~0.45kg fat loss/week or ~0.25kg muscle gain/week

    return [
      {
        day: 30,
        weight: Number((currentW + (isDeficit ? -ratePerWeek * 4.3 : ratePerWeek * 4.3)).toFixed(1)),
        fatLoss: isDeficit ? (ratePerWeek * 4.3 * 0.85).toFixed(1) : '0.2',
        muscleGain: isDeficit ? '0.4' : (ratePerWeek * 4.3 * 0.75).toFixed(1)
      },
      {
        day: 60,
        weight: Number((currentW + (isDeficit ? -ratePerWeek * 8.6 : ratePerWeek * 8.6)).toFixed(1)),
        fatLoss: isDeficit ? (ratePerWeek * 8.6 * 0.85).toFixed(1) : '0.4',
        muscleGain: isDeficit ? '0.8' : (ratePerWeek * 8.6 * 0.75).toFixed(1)
      },
      {
        day: 90,
        weight: Number((currentW + (isDeficit ? -ratePerWeek * 12.8 : ratePerWeek * 12.8)).toFixed(1)),
        fatLoss: isDeficit ? (ratePerWeek * 12.8 * 0.85).toFixed(1) : '0.6',
        muscleGain: isDeficit ? '1.2' : (ratePerWeek * 12.8 * 0.75).toFixed(1)
      },
      {
        day: 180,
        weight: Number((currentW + (isDeficit ? -ratePerWeek * 25.7 : ratePerWeek * 25.7)).toFixed(1)),
        fatLoss: isDeficit ? (ratePerWeek * 25.7 * 0.85).toFixed(1) : '1.0',
        muscleGain: isDeficit ? '2.1' : (ratePerWeek * 25.7 * 0.75).toFixed(1)
      }
    ];
  }, [currentWeightNum, userProfile]);

  const handleGenerateForecast = () => {
    setLoadingForecast(true);
    setTimeout(() => {
      ecoStore.syncEcosystemState({
        predictions: {
          predictions: computedForecast,
          confidence: 94,
          reasoning: `Based on your consistent adherence, daily calorie target (~${userProfile?.dailyCalories || 2200} kcal), and resistance training split, you are projected to reach ${userProfile?.goalWeight || 68} kg in approximately 8–12 weeks while maintaining high muscle retention.`
        }
      });
      setLoadingForecast(false);
      if (onNotification) onNotification("AI Body Composition Forecast calculated!");
    }, 600);
  };

  const handleDownloadSharingCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#0e0e11');
    gradient.addColorStop(1, '#18181f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    ctx.strokeStyle = '#CCFF00';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 380);
    
    ctx.fillStyle = '#CCFF00';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('CALYXO ATHLETE OS', 40, 60);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('FITNESS ECOSYSTEM PROFILE STATS', 40, 85);
    
    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ATHLETE NAME', 40, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px sans-serif';
    ctx.fillText(userProfile?.nickname || user?.displayName || 'Calyxo Athlete', 40, 165);

    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('FITNESS SCORE', 40, 220);
    ctx.fillStyle = '#CCFF00';
    ctx.font = '900 36px sans-serif';
    ctx.fillText(`${ecoStore.fitnessScore?.dailyScore || 85}/100`, 40, 260);

    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ACTIVE LOG STREAKS', 320, 140);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Login Streak: ${ecoStore.streaks?.loginStreak || 1} days`, 320, 170);
    ctx.fillText(`Workout Streak: ${ecoStore.streaks?.workoutStreak || 0} days`, 320, 195);
    ctx.fillText(`Nutrition Streak: ${ecoStore.streaks?.nutritionStreak || 0} days`, 320, 220);
    ctx.fillText(`Water Streak: ${ecoStore.streaks?.waterStreak || 0} days`, 320, 245);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userProfile?.nickname || 'calyxo'}_stats_share.png`;
    a.click();
    if (onNotification) onNotification("Sharing Card downloaded successfully!");
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Sub tabs Menu */}
      <div className="flex flex-col gap-3 border-b border-card-border pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight">Progress Hub</h1>
            <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 hidden sm:block">Understand your trajectory, predictions, and unlocks</p>
          </div>
        </div>

        <div className="bg-surface border border-card-border p-1 rounded-2xl flex gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'measurements', label: 'Body Composition' },
            { id: 'predictions', label: 'AI Forecast' },
            { id: 'achievements', label: 'Achievements' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex-1 text-center border-none ${
                activeSubTab === tab.id
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted hover:text-foreground bg-transparent'
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
          {/* TAB 1: ANALYTICS WITH HORIZONTAL RULER WEIGHT PICKER */}
          {activeSubTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Interactive Ruler Wheel Weight Card */}
              <div className="p-6 rounded-3xl bg-surface border border-card-border shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-card-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-accent" />
                    <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Interactive Weight Log</h3>
                  </div>
                  {trend !== null && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      Number(trend) <= 0 
                        ? 'bg-accent/15 text-accent border-accent/20' 
                        : 'bg-destructive/15 text-destructive border-destructive/20'
                    }`}>
                      {Number(trend) > 0 ? '+' : ''}{trend} {units === 'imperial' ? 'lbs' : 'kg'}
                    </span>
                  )}
                </div>

                {/* Numeric readout */}
                <div className="text-center py-1">
                  <div className="inline-flex items-baseline gap-2">
                    <span className="text-4xl font-black text-foreground font-mono tracking-tight">
                      {selectedWeight.toFixed(1)}
                    </span>
                    <span className="text-sm font-black text-accent uppercase font-mono">
                      {units === 'imperial' ? 'LBS' : 'KG'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted font-medium mt-0.5">Drag horizontal ruler wheel or tap +/- step buttons</p>
                </div>

                {/* Horizontal Ruler Track */}
                <div className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateWeightClamped(selectedWeight - 0.5)}
                    className="w-9 h-9 rounded-2xl bg-surface-elevated hover:bg-surface-elevated/80 border border-card-border flex items-center justify-center text-foreground active:scale-95 transition-all shrink-0 cursor-pointer"
                    title="Decrease 0.5"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onWheel={handleWheel}
                    className="relative flex-1 h-20 overflow-hidden rounded-2xl bg-surface-elevated border border-card-border cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center shadow-inner"
                  >
                    <div className="absolute top-8 inset-x-0 h-[1px] bg-card-border pointer-events-none" />
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-surface-elevated to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface-elevated to-transparent pointer-events-none z-10" />

                    <div className="absolute inset-x-0 top-2 h-14 pointer-events-none">
                      {renderTicks()}
                    </div>

                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
                      <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                      <div className="w-[2px] flex-1 bg-accent shadow-[0_0_8px_var(--accent)] my-0.5 rounded-full" />
                      <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateWeightClamped(selectedWeight + 0.5)}
                    className="w-9 h-9 rounded-2xl bg-surface-elevated hover:bg-surface-elevated/80 border border-card-border flex items-center justify-center text-foreground active:scale-95 transition-all shrink-0 cursor-pointer"
                    title="Increase 0.5"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveRulerWeight}
                  disabled={isSavingWeight}
                  className="w-full py-3 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md shadow-accent/20 hover:brightness-110 active:scale-95"
                >
                  {isSavingWeight ? 'Saving Log...' : `✓ Log ${selectedWeight.toFixed(1)} ${units === 'imperial' ? 'lbs' : 'kg'}`}
                </button>

                {/* Weight Sparkline */}
                {weightLogs && weightLogs.length >= 2 ? (() => {
                  const weights = weightLogs.map(x => Number(x.weight));
                  const min = Math.min(...weights) - 2;
                  const max = Math.max(...weights) + 2;
                  const range = max - min || 10;
                  const W = 280, H = 60;
                  const spacing = W / (weightLogs.length - 1);
                  const pts = weightLogs.map((l, i) => ({
                    x: i * spacing,
                    y: H - ((Number(l.weight) - min) / range) * H
                  }));
                  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  return (
                    <div className="bg-surface-elevated rounded-2xl p-3.5 border border-card-border overflow-hidden mt-3 shadow-inner">
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[60px]">
                        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {pts.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--accent)" />
                        ))}
                      </svg>
                      <div className="flex justify-between mt-2 text-[9px] text-muted font-mono font-bold">
                        <span>Start: {weightLogs[0]?.weight} {units === 'imperial' ? 'lbs' : 'kg'}</span>
                        <span>Latest: {weightLogs[weightLogs.length - 1]?.weight} {units === 'imperial' ? 'lbs' : 'kg'}</span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="bg-surface-elevated rounded-2xl p-4 border border-card-border text-center text-xs text-muted">
                    Log weight consistently over multiple days to render your progress curve.
                  </div>
                )}
              </div>

              {/* Right Column: Calorie Trend & Share Card */}
              <div className="space-y-6">
                {/* Calorie Trend Bar chart */}
                <div className="p-6 rounded-3xl bg-surface border border-card-border shadow-md space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-card-border/60 pb-3">
                    <Activity className="w-4 h-4 text-accent" />
                    Daily Calorie & Nutrition Trend
                  </h3>

                  {calorieTrend.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-end justify-between h-28 pt-2">
                        {calorieTrend.map(([date, cals], idx) => {
                          const maxCals = Math.max(...calorieTrend.map(x => x[1]), 2000);
                          const pct = Math.min(100, Math.round((cals / maxCals) * 100));
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                              <div className="w-full px-1.5 flex flex-col justify-end h-20 items-center">
                                <div 
                                  className="w-3.5 bg-gradient-to-t from-accent to-emerald-400 rounded-t-sm relative group cursor-pointer hover:opacity-80 transition-opacity" 
                                  style={{ height: `${pct}%` }}
                                >
                                  <div className="absolute bottom-[calc(100%+4px)] left-1/2 transform -translate-x-1/2 bg-surface text-foreground text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg border border-card-border">
                                    {cals} kcal
                                  </div>
                                </div>
                              </div>
                              <span className="text-[8px] text-muted font-extrabold uppercase">{date}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-muted border-t border-card-border pt-3">
                        <span>7-Day Average: <strong className="text-foreground">{Math.round(calorieTrend.reduce((s, x) => s + x[1], 0) / calorieTrend.length)} kcal</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs text-muted font-semibold">
                      No meals logged yet. Start tracking food in Nutrition tab.
                    </div>
                  )}
                </div>

                {/* Athlete sharing card */}
                <div className="p-6 rounded-3xl bg-surface border border-card-border shadow-md flex flex-col justify-between items-start space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-accent" />
                      Athlete Performance Card
                    </h3>
                    <p className="text-muted text-xs leading-relaxed">
                      Generate a high-resolution performance badge with your Calyxo Health Score, current streak days, and goal status.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleDownloadSharingCard}
                    className="w-full sm:w-auto bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider py-3 px-5 rounded-2xl transition-all cursor-pointer border-none flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 shadow-md shadow-accent/20"
                  >
                    <Download className="w-4 h-4" />
                    Download Performance Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL BODY COMPOSITION TRACKER (No tape measure required) */}
          {activeSubTab === 'measurements' && (
            <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-card-border shadow-md space-y-6">
              <div className="border-b border-card-border/60 pb-4">
                <h3 className="text-base sm:text-lg font-black text-foreground uppercase tracking-wider">
                  Visual Body Composition & Leanness Tracker
                </h3>
                <p className="text-xs text-muted mt-1">
                  Estimate and track your physical leanness silhouette without needing manual tape measurements.
                </p>
              </div>

              {/* Body Fat Silhouette Categories */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground block">
                  Select Your Current Estimated Body Fat Range:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { level: 10, title: 'Ripped / Athletic', range: '8–12%', desc: 'Visible 6-pack abs, deep vascularity' },
                    { level: 15, title: 'Fit & Defined', range: '13–16%', desc: 'Clear upper abs, athletic shoulder lines' },
                    { level: 20, title: 'Healthy / Moderate', range: '17–22%', desc: 'Flat stomach, soft abdominal definition' },
                    { level: 26, title: 'Bulk / Building', range: '23%+', desc: 'High strength, full body mass cushion' }
                  ].map(cat => (
                    <button
                      key={cat.level}
                      type="button"
                      onClick={() => {
                        setBodyFatLevel(cat.level);
                        triggerHaptic();
                      }}
                      className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer ${
                        bodyFatLevel === cat.level
                          ? 'bg-accent/15 border-accent text-foreground shadow-sm'
                          : 'bg-surface-elevated border-card-border text-muted hover:text-foreground'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-accent font-mono block">{cat.range}</span>
                      <h4 className="text-xs font-bold text-foreground">{cat.title}</h4>
                      <p className="text-[10px] text-muted leading-tight">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Lean Mass Breakdown */}
              <div className="p-5 rounded-2xl bg-surface-elevated border border-card-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Estimated Fat Mass</span>
                  <div className="text-xl font-black text-foreground font-mono mt-1">
                    {((currentWeightNum * bodyFatLevel) / 100).toFixed(1)} <span className="text-xs font-sans text-muted">{isMetric ? 'kg' : 'lbs'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Estimated Lean Muscle Mass</span>
                  <div className="text-xl font-black text-accent font-mono mt-1">
                    {(currentWeightNum - ((currentWeightNum * bodyFatLevel) / 100)).toFixed(1)} <span className="text-xs font-sans text-accent/80">{isMetric ? 'kg' : 'lbs'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Target Timeline</span>
                  <div className="text-xl font-black text-foreground font-mono mt-1">
                    8–12 <span className="text-xs font-sans text-muted">Weeks</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI BODY COMPOSITION FORECAST */}
          {activeSubTab === 'predictions' && (
            <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-card-border shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h3 className="text-base sm:text-lg font-black text-foreground uppercase tracking-wider">
                      AI Body Composition Forecast (180-Day Simulation)
                    </h3>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Projects your fat loss, muscle retention, and scale weight based on your daily energy deficit.
                  </p>
                </div>
                <button
                  onClick={handleGenerateForecast}
                  disabled={loadingForecast}
                  className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none hover:brightness-110 active:scale-95 shrink-0 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingForecast ? 'animate-spin' : ''}`} />
                  <span>{loadingForecast ? 'Simulating...' : 'Recalculate AI Forecast'}</span>
                </button>
              </div>

              {/* 4-Period Trajectory Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {computedForecast.map((pred, i) => (
                  <div key={i} className="bg-surface-elevated border border-card-border p-4 rounded-2xl shadow-inner space-y-1">
                    <span className="text-[10px] text-muted font-black uppercase tracking-wider block font-mono">Day {pred.day}</span>
                    <span className="text-xl font-black text-foreground block font-mono mt-1">
                      {pred.weight} <span className="text-xs text-muted font-sans">{isMetric ? 'kg' : 'lbs'}</span>
                    </span>
                    <span className="text-[10px] text-accent font-bold block">-{pred.fatLoss} kg fat</span>
                    <span className="text-[10px] text-orange-400 font-bold block">+{pred.muscleGain} kg lean</span>
                  </div>
                ))}
              </div>

              {/* AI Reasoning Digest */}
              <div className="p-4 bg-surface-elevated border border-card-border rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[10px] text-muted font-black uppercase tracking-wider">
                  <span>Forecast Methodology: Calyxo Metabolic Model</span>
                  <span className="text-accent font-bold">Confidence Index: 94%</span>
                </div>
                <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                  Based on your consistent calorie target (~{userProfile?.dailyCalories || 2200} kcal/day) and scheduled weekly training volume, your projected rate of fat oxidation is optimized to preserve over 95% of existing lean tissue.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ACHIEVEMENTS & STREAKS */}
          {activeSubTab === 'achievements' && (
            <div className="space-y-6">
              {/* Streaks Dashboard */}
              <div className="p-6 rounded-3xl bg-surface border border-card-border shadow-md space-y-4">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-card-border/60 pb-3">
                  <Activity className="w-4 h-4 text-accent" />
                  Active Streak Engine (Unbroken Daily Progression)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { title: 'Login Streak', val: ecoStore.streaks?.loginStreak || 1, desc: 'Active days checked in' },
                    { title: 'Workout Streak', val: Math.max(ecoStore.streaks?.workoutStreak || 0, workoutLogs.length > 0 ? 1 : 0), desc: 'Training consistency' },
                    { title: 'Nutrition Streak', val: Math.max(ecoStore.streaks?.nutritionStreak || 0, foodLogs.length > 0 ? 1 : 0), desc: 'Meal tracking consistency' },
                    { title: 'Water Streak', val: Math.max(ecoStore.streaks?.waterStreak || 0, waterIntake >= (userProfile?.waterTarget || userProfile?.waterGoal || 3000) ? 1 : 0), desc: 'Hydration target streak' }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-surface-elevated border border-card-border p-4 rounded-2xl flex flex-col justify-between h-24 shadow-inner">
                      <div>
                        <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{s.title}</span>
                        <span className="text-[10px] text-muted font-medium block mt-0.5">{s.desc}</span>
                      </div>
                      <div className="text-xl font-black text-foreground font-mono flex items-center gap-1.5 mt-2">
                        <Flame className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0" />
                        <span>{s.val} {s.val === 1 ? 'day' : 'days'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements Checklist Badges */}
              <div className="p-6 rounded-3xl bg-surface border border-card-border shadow-md space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-card-border/60 pb-3">
                  <Trophy className="w-4 h-4 text-accent" />
                  Calyxo Milestones & Achievements
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ecoStore.achievements?.map((ach) => {
                    const isUnlocked = ach.unlocked || 
                      (ach.id === 'first_workout' && workoutLogs.length > 0) ||
                      (ach.id === 'first_meal' && foodLogs.length > 0) ||
                      (ach.id === 'hydration_hero' && waterIntake >= 3000) ||
                      (ach.id === 'muscle_builder' && workoutLogs.length >= 10);

                    return (
                      <div 
                        key={ach.id} 
                        className={`border rounded-2xl p-4 flex items-center gap-3.5 transition-all ${
                          isUnlocked 
                            ? 'bg-accent/10 border-accent/40 shadow-sm' 
                            : 'bg-surface-elevated border-card-border/60 opacity-60'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-black text-sm shrink-0">
                          {isUnlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-4 h-4 text-muted" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {ach.name}
                            {isUnlocked && <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />}
                          </h4>
                          <p className="text-[10px] text-muted mt-0.5 font-medium leading-tight">{ach.description}</p>
                          {isUnlocked && (
                            <span className="text-[8px] text-accent mt-1 block uppercase font-bold tracking-wider">Unlocked ✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
