"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { addWeightLog, saveEcosystemState, fetchWithRetry } from '../lib/dbService';
import { Trophy, Activity, Lock, Camera, Sparkles, Share2, Download, Image as ImageIcon, TrendingUp, RefreshCw, Award } from 'lucide-react';

export default function Progress({ onNotification }) {
  const user = useStore(state => state.user);
  const weightLogs = useStore(state => state.weightLogs);
  const storeAddWeightLog = useStore(state => state.addWeightLog);
  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs);
  const ecoStore = useEcosystemStore();
  const userId = user?.uid;
  const units = userProfile?.units || 'metric';

  const [activeSubTab, setActiveSubTab] = useState('analytics');

  // Weight Logging Form
  const [weightInput, setWeightInput] = useState('');
  
  // Transformation Timeline Uploads
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [timelineNotes, setTimelineNotes] = useState('');

  // Predictions State
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Body Measurements Logging Form
  const [chestInput, setChestInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipsInput, setHipsInput] = useState('');
  const [bicepsInput, setBicepsInput] = useState('');
  const [thighsInput, setThighsInput] = useState('');
  const [neckInput, setNeckInput] = useState('');

  const handleLogMeasurements = async (e) => {
    e.preventDefault();
    if (!chestInput.trim() && !waistInput.trim() && !hipsInput.trim() && !bicepsInput.trim() && !thighsInput.trim() && !neckInput.trim()) {
      return;
    }
    const logEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
      chest: chestInput.trim() ? Number(chestInput) : null,
      waist: waistInput.trim() ? Number(waistInput) : null,
      hips: hipsInput.trim() ? Number(hipsInput) : null,
      biceps: bicepsInput.trim() ? Number(bicepsInput) : null,
      thighs: thighsInput.trim() ? Number(thighsInput) : null,
      neck: neckInput.trim() ? Number(neckInput) : null,
      unit: units === 'imperial' ? 'in' : 'cm'
    };

    ecoStore.addMeasurementLog(logEntry);
    await saveEcosystemState(userId, useEcosystemStore.getState());
    
    // Clear inputs
    setChestInput('');
    setWaistInput('');
    setHipsInput('');
    setBicepsInput('');
    setThighsInput('');
    setNeckInput('');
    
    if (onNotification) onNotification("Logged body measurements! 📏");
  };

  // Compute stats trend
  let trend = null;
  if (weightLogs && weightLogs.length >= 2) {
    const weights = weightLogs.map(x => Number(x.weight));
    trend = (weights[weights.length - 1] - weights[0]).toFixed(1);
  }

  // Calculate Calorie Averages
  const calorieTrend = React.useMemo(() => {
    if (!foodLogs || foodLogs.length === 0) return [];
    const grouped = {};
    foodLogs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      grouped[date] = (grouped[date] || 0) + (Number(log.calories) || 0);
    });
    return Object.entries(grouped).slice(0, 7).reverse();
  }, [foodLogs]);

  // Recalculated user metric strategy for deficit/gains calculation
  const metrics = React.useMemo(() => {
    const wkg = userProfile?.weight || 70;
    const hcm = userProfile?.height || 175;
    const dob = userProfile?.dob || '2001-01-01';
    
    // Compute BMR
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    const age = calculatedAge > 0 ? calculatedAge : 25;
    
    const bmr = userProfile?.gender === 'male'
      ? (10 * wkg) + (6.25 * hcm) - (5 * age) + 5
      : (10 * wkg) + (6.25 * hcm) - (5 * age) - 161;
    
    const tdee = Math.round(bmr * (userProfile?.activity || 1.55));
    let calorieGoal = tdee;
    if (userProfile?.goal === 'lose') calorieGoal = tdee - 500;
    else if (userProfile?.goal === 'gains') calorieGoal = tdee + 350;

    return { bmr, tdee, calorieGoal };
  }, [userProfile]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weightInput.trim() || isNaN(weightInput)) return;
    const val = Number(weightInput);
    const entry = await addWeightLog(userId, val, units);
    storeAddWeightLog(entry);
    setWeightInput('');
    if (onNotification) onNotification(`Logged weight: ${val} ${units === 'imperial' ? 'lbs' : 'kg'}`);
  };

  const handlePhotoUpload = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'before') {
        setBeforeImage(reader.result);
      } else {
        setAfterImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTimelineLog = async () => {
    if (!beforeImage || !afterImage) return;
    const logEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      before: beforeImage,
      after: afterImage,
      notes: timelineNotes || "Progress Transformation"
    };
    ecoStore.addTimelineLog(logEntry);
    await saveEcosystemState(userId, useEcosystemStore.getState());
    setBeforeImage(null);
    setAfterImage(null);
    setTimelineNotes('');
    if (onNotification) onNotification("Added transformation comparison log! 📸");
  };

  const handleGenerateForecast = async () => {
    setLoadingForecast(true);
    try {
      const activeDeficit = metrics.tdee - metrics.calorieGoal;
      const res = await fetchWithRetry('/api/gemini/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          currentWeight: weightLogs[weightLogs.length - 1]?.weight || userProfile?.weight || 70,
          targetCalories: metrics.calorieGoal,
          activeDeficit: activeDeficit > 0 ? activeDeficit : 500
        })
      });
      if (res.ok) {
        const data = await res.json();
        ecoStore.setPredictions(data);
        await saveEcosystemState(userId, useEcosystemStore.getState());
        if (onNotification) onNotification("AI Body Composition Forecast calculated! 📈");
      }
    } catch (e) {
      console.error("Error generating prediction forecast:", e);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleDownloadSocialCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#0e0e11');
    gradient.addColorStop(1, '#18181f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    ctx.strokeStyle = '#b5f23d';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 380);
    
    ctx.fillStyle = '#b5f23d';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('CALYXO AI COACH', 40, 60);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('FITNESS ECOSYSTEM PROFILE STATS', 40, 85);
    
    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ATHLETE NAME', 40, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px sans-serif';
    ctx.fillText(userProfile.nickname || user?.displayName || 'Calyxo Athlete', 40, 165);

    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('FITNESS SCORE', 40, 220);
    ctx.fillStyle = '#b5f23d';
    ctx.font = '900 36px sans-serif';
    ctx.fillText(`${ecoStore.fitnessScore.dailyScore}/100`, 40, 260);

    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ACTIVE LOG STREAKS', 320, 140);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`🔥 Login Streak: ${ecoStore.streaks.loginStreak} days`, 320, 170);
    ctx.fillText(`🏋️ Workout Streak: ${ecoStore.streaks.workoutStreak} days`, 320, 195);
    ctx.fillText(`🍗 Nutrition Streak: ${ecoStore.streaks.nutritionStreak} days`, 320, 220);
    ctx.fillText(`💧 Hydration Streak: ${ecoStore.streaks.waterStreak} days`, 320, 245);

    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PRIMARY FITNESS TARGET', 40, 310);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    const goalText = userProfile.goal === 'lose' ? 'WEIGHT LOSS (CALORIE DEFICIT)' : userProfile.goal === 'gains' ? 'MUSCLE GAINS (CALORIE SURPLUS)' : 'WEIGHT MAINTENANCE';
    ctx.fillText(goalText, 40, 335);

    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('POWERED BY GEMINI 2.5 FLASH', 320, 335);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userProfile.nickname || 'calyxo'}_stats_share.png`;
    a.click();
    if (onNotification) onNotification("Social Card downloaded successfully! 🎨");
  };

  const inputStyle = {
    background: 'var(--input)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: 'var(--foreground)',
    fontSize: '13px',
    outline: 'none',
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

        <div className="bg-surface border border-card-border p-1 rounded-xl flex gap-0.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'analytics', label: 'Analytics' },
            { id: 'measurements', label: 'Body' },
            { id: 'predictions', label: 'Predictions' },
            { id: 'achievements', label: 'Achievements' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex-1 text-center ${
                activeSubTab === tab.id
                  ? 'bg-acid-green text-accent-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
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
          {activeSubTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Charts */}
              <div className="space-y-6">
                {/* Weight Progress Log form and sparkline */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest">Weight Log & Sparkline</h3>
                    {trend !== null && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        Number(trend) <= 0 
                          ? 'bg-[var(--color-acid-green)]/15 text-[var(--color-acid-green)] border-[var(--color-acid-green)]/20' 
                          : 'bg-destructive/15 text-destructive border-destructive/20'
                      }`}>
                        {Number(trend) > 0 ? '+' : ''}{trend} {units === 'imperial' ? 'lbs' : 'kg'}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleLogWeight} className="flex gap-2 mb-4">
                    <input
                      type="number" step="0.1" min="20" max="300"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder={`Log weight in ${units === 'imperial' ? 'lbs' : 'kg'}`}
                      style={{ ...inputStyle, flex: 1 }}
                      required
                    />
                    <button
                      type="submit"
                      className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-none"
                    >
                      Log
                    </button>
                  </form>

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
                      <div className="bg-surface rounded-xl p-3.5 border border-card-border overflow-hidden mt-3 shadow-inner">
                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[60px]">
                          <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {pts.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--accent)" className="shadow-lg" />
                          ))}
                        </svg>
                        <div className="flex justify-between mt-2.5 text-[9px] text-muted font-bold">
                          <span>Start: {weightLogs[0]?.weight} {units === 'imperial' ? 'lbs' : 'kg'}</span>
                          <span>Latest: {weightLogs[weightLogs.length - 1]?.weight} {units === 'imperial' ? 'lbs' : 'kg'}</span>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="bg-surface rounded-xl p-6 border border-card-border text-center text-xs text-muted">
                      Log weight over multiple days to render progress trend.
                    </div>
                  )}
                </div>

                {/* Calorie Trend Bar chart */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-md">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-acid-green" />
                    Daily Calorie Trend
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
                                  className="w-3.5 bg-gradient-to-t from-acid-green to-emerald-400 rounded-t-sm relative group cursor-pointer hover:opacity-80 transition-opacity" 
                                  style={{ height: `${pct}%` }}
                                >
                                  <div className="absolute bottom-[calc(100%+4px)] left-1/2 transform -translate-x-1/2 bg-[var(--card)] text-foreground text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg border border-card-border">
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
                    <div className="text-center py-12 text-xs text-muted font-semibold">
                      No logs recorded yet. Start logging meals in Nutrition tab.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Photos & Watermark download */}
              <div className="space-y-6">
                
                {/* Before / After Photo Timeline */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-lg space-y-5">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-acid-green" />
                    Transformation Logs
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Before Photo */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Before Photo</span>
                      <div className="relative border border-dashed border-card-border rounded-xl h-28 flex flex-col items-center justify-center bg-surface/50 overflow-hidden cursor-pointer">
                        {beforeImage ? (
                          <>
                            <img src={beforeImage} className="object-cover w-full h-full" alt="Before transformation comparison preview" />
                            <button onClick={() => setBeforeImage(null)} className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 text-[8px] font-bold">Clear</button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            <ImageIcon className="w-5 h-5 text-muted mb-1" />
                            <span className="text-[9px] text-muted uppercase font-bold">Choose Image</span>
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* After Photo */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">After Photo</span>
                      <div className="relative border border-dashed border-card-border rounded-xl h-28 flex flex-col items-center justify-center bg-surface/50 overflow-hidden cursor-pointer">
                        {afterImage ? (
                          <>
                            <img src={afterImage} className="object-cover w-full h-full" alt="After transformation comparison preview" />
                            <button onClick={() => setAfterImage(null)} className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 text-[8px] font-bold">Clear</button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            <ImageIcon className="w-5 h-5 text-muted mb-1" />
                            <span className="text-[9px] text-muted uppercase font-bold">Choose Image</span>
                            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {beforeImage && afterImage && (
                    <div className="space-y-3 pt-1">
                      <input 
                        type="text" 
                        value={timelineNotes}
                        onChange={(e) => setTimelineNotes(e.target.value)}
                        placeholder="e.g. Month 3 progress, down 4kg!"
                        className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green"
                      />
                      <button
                        onClick={handleSaveTimelineLog}
                        className="w-full bg-acid-green text-accent-foreground font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-xl cursor-pointer border-none"
                      >
                        Save Timeline Log
                      </button>
                    </div>
                  )}

                  {/* List logged pairs */}
                  {ecoStore.timelineLogs && ecoStore.timelineLogs.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-card-border">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Logged Transformations:</span>
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                        {ecoStore.timelineLogs.map((log) => (
                          <div key={log.id} className="bg-surface/50 border border-card-border p-3 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-muted font-bold">
                              <span>Date: {log.date}</span>
                              <span className="text-acid-green font-bold uppercase">{log.notes}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="relative rounded-lg overflow-hidden border border-card-border bg-black aspect-video flex items-center justify-center max-h-24">
                                <img src={log.before} className="object-contain w-full h-full" alt={`Before photo logged on ${log.date}`} />
                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">BEFORE</div>
                              </div>
                              <div className="relative rounded-lg overflow-hidden border border-card-border bg-black aspect-video flex items-center justify-center max-h-24">
                                <img src={log.after} className="object-contain w-full h-full" alt={`After photo logged on ${log.date}`} />
                                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">AFTER</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Athlete social sharing card watermark generator */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-lg flex flex-col justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-acid-green" />
                      Athlete Social Sharing Card
                    </h3>
                    <p className="text-muted text-[10.5px] font-medium leading-relaxed">Generate a high-resolution, visually stylized sharing card containing your Calyxo Fitness Score, active streaks, and biometric achievements to download and share on social platforms.</p>
                  </div>
                  
                  <button
                    onClick={handleDownloadSocialCard}
                    className="mt-4 bg-acid-green text-accent-foreground font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all cursor-pointer border-none flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Sharing Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'measurements' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Form */}
              <form onSubmit={handleLogMeasurements} className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-4 lg:col-span-1">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest flex items-center gap-2">
                  📏 Log Body Measurements
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Chest ({units === 'imperial' ? 'in' : 'cm'})</label>
                    <input 
                      type="number" step="0.1" min="1" max="300"
                      value={chestInput}
                      onChange={(e) => setChestInput(e.target.value)}
                      placeholder="e.g. 95"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Waist ({units === 'imperial' ? 'in' : 'cm'})</label>
                    <input 
                      type="number" step="0.1" min="1" max="300"
                      value={waistInput}
                      onChange={(e) => setWaistInput(e.target.value)}
                      placeholder="e.g. 80"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Hips ({units === 'imperial' ? 'in' : 'cm'})</label>
                    <input 
                      type="number" step="0.1" min="1" max="300"
                      value={hipsInput}
                      onChange={(e) => setHipsInput(e.target.value)}
                      placeholder="e.g. 98"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Biceps ({units === 'imperial' ? 'in' : 'cm'})</label>
                    <input 
                      type="number" step="0.1" min="1" max="300"
                      value={bicepsInput}
                      onChange={(e) => setBicepsInput(e.target.value)}
                      placeholder="e.g. 35"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Thighs ({units === 'imperial' ? 'in' : 'cm'})</label>
                    <input 
                      type="number" step="0.1" min="1" max="300"
                      value={thighsInput}
                      onChange={(e) => setThighsInput(e.target.value)}
                      placeholder="e.g. 55"
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Neck ({units === 'imperial' ? 'in' : 'cm'})</label>
                    <input 
                      type="number" step="0.1" min="1" max="300"
                      value={neckInput}
                      onChange={(e) => setNeckInput(e.target.value)}
                      placeholder="e.g. 38"
                      style={inputStyle}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full btn-primary py-2.5 rounded-xl cursor-pointer border-none font-bold text-xs uppercase tracking-wider shadow-md mt-2"
                >
                  Log Measurements
                </button>
              </form>
              
              {/* Right Column: Charts & History (Spans 2 columns) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual Sparklines / Multi-chart */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-md">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4">
                    📈 Body Dimension Trends
                  </h3>
                  
                  {ecoStore.measurementLogs && ecoStore.measurementLogs.length >= 2 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['chest', 'waist', 'hips', 'biceps', 'thighs', 'neck'].map((part) => {
                        const logsWithPart = ecoStore.measurementLogs.filter(l => l[part] !== null).reverse();
                        if (logsWithPart.length < 2) {
                          return (
                            <div key={part} className="bg-surface rounded-xl p-4 border border-card-border text-center text-xs text-muted flex flex-col justify-center min-h-[110px]">
                              <span className="text-[10px] text-foreground font-black uppercase tracking-wider mb-1">{part}</span>
                              Need at least 2 logs to show trend.
                            </div>
                          );
                        }
                        const vals = logsWithPart.map(l => Number(l[part]));
                        const min = Math.min(...vals) - 1;
                        const max = Math.max(...vals) + 1;
                        const range = max - min || 5;
                        const W = 200, H = 50;
                        const spacing = W / (logsWithPart.length - 1);
                        const pts = logsWithPart.map((l, i) => ({
                          x: i * spacing,
                          y: H - ((Number(l[part]) - min) / range) * H
                        }));
                        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        const currentVal = vals[vals.length - 1];
                        const diff = (currentVal - vals[0]).toFixed(1);
                        
                        return (
                          <div key={part} className="bg-surface rounded-xl p-4 border border-card-border space-y-2 shadow-inner">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                              <span className="text-foreground">{part}</span>
                              <span className={Number(diff) === 0 ? 'text-muted' : Number(diff) < 0 ? 'text-acid-green' : 'text-orange'}>
                                {currentVal} {logsWithPart[0].unit} ({Number(diff) > 0 ? '+' : ''}{diff})
                              </span>
                            </div>
                            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[50px]">
                              <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              {pts.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--accent)" />
                              ))}
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-surface rounded-xl p-8 border border-card-border text-center text-xs text-muted">
                      Log measurements over multiple days to see dimension trends.
                    </div>
                  )}
                </div>
                
                {/* Measurement Logs List */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-md">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4">
                    📋 Measurement History
                  </h3>
                  
                  {ecoStore.measurementLogs && ecoStore.measurementLogs.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {ecoStore.measurementLogs.map((log) => (
                        <div key={log.id} className="bg-surface/50 border border-card-border p-3.5 rounded-xl text-xs font-semibold space-y-2 shadow-inner">
                          <div className="flex justify-between items-center text-[10px] text-muted font-black uppercase">
                            <span>Date: {log.date}</span>
                            <span className="text-acid-green">Unit: {log.unit}</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-foreground font-black">
                            {['chest', 'waist', 'hips', 'biceps', 'thighs', 'neck'].map((part) => (
                              <div key={part} className="bg-black/20 p-2 rounded-lg border border-card-border/50">
                                <span className="text-[8px] text-muted block uppercase tracking-wider mb-0.5">{part}</span>
                                {log[part] !== null ? `${log[part]}` : '—'}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface rounded-xl p-8 border border-card-border text-center text-xs text-muted">
                      No measurements logged yet. Start recording your body dimensions above!
                    </div>
                  )}
                </div>
                
              </div>
            </div>
          )}

          {activeSubTab === 'predictions' && (
            <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-acid-green" />
                    AI Body Composition Forecast
                  </h3>
                  <p className="text-xs text-muted font-medium mt-0.5">Generates weight loss, fat burn, and muscle gain trends over 180 days</p>
                </div>
                {ecoStore.predictions && (
                  <button
                    onClick={handleGenerateForecast}
                    disabled={loadingForecast}
                    className="text-muted hover:text-acid-green p-1.5 hover:bg-black/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                    title="Recalculate AI Predictions"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingForecast ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {!ecoStore.predictions ? (
                <div className="text-center py-12 space-y-4 max-w-md mx-auto">
                  <Sparkles className="w-10 h-10 text-acid-green/40 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Forecast body composition trajectory</h4>
                    <p className="text-xs text-muted leading-relaxed">Analyze your biometrics to simulate and predict your weight loss, fat burn, and muscle gain over 180 days using Gemini AI.</p>
                  </div>
                  <button
                    onClick={handleGenerateForecast}
                    disabled={loadingForecast}
                    className="bg-acid-green text-accent-foreground font-extrabold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl hover:shadow-lg transition-all cursor-pointer border-none flex items-center gap-1.5 mx-auto"
                  >
                    {loadingForecast ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin"></span>
                        Forecasting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Calculate AI Forecast
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {ecoStore.predictions.predictions?.map((pred, i) => (
                      <div key={i} className="bg-surface border border-card-border p-3.5 rounded-xl shadow-inner">
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Day {pred.day}</span>
                        <span className="text-sm font-black text-foreground block mt-1.5">{pred.weight} <span className="text-[9px] text-muted">{units === 'imperial' ? 'lbs' : 'kg'}</span></span>
                        <span className="text-[8.5px] text-acid-green font-bold block mt-1">-{pred.fatLoss}kg fat</span>
                        <span className="text-[8.5px] text-orange font-bold block mt-0.5">+{pred.muscleGain}g musc</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-surface border border-card-border rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
                      <span>AI Reasoning Model: Gemini 2.5</span>
                      <span className="text-acid-green font-bold">Confidence Index: {ecoStore.predictions.confidence}%</span>
                    </div>
                    <p className="text-xs text-foreground/80 font-medium leading-relaxed italic">{ecoStore.predictions.reasoning}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'achievements' && (
            <div className="space-y-6">
              {/* Streaks Dashboard */}
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-acid-green" />
                  Active Streaks Dashboard
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { title: 'Login Streak', val: ecoStore.streaks?.loginStreak || 0, emoji: '🔥', desc: 'Consecutive active days' },
                    { title: 'Workout Streak', val: ecoStore.streaks?.workoutStreak || 0, emoji: '🏋️', desc: 'Routines logged' },
                    { title: 'Nutrition Streak', val: ecoStore.streaks?.nutritionStreak || 0, emoji: '🍗', desc: 'Healthy meal counts' },
                    { title: 'Water Streak', val: ecoStore.streaks?.waterStreak || 0, emoji: '💧', desc: 'Hydration checks' },
                  ].map((s, idx) => (
                    <div key={idx} className="bg-surface border border-card-border p-4 rounded-xl flex flex-col justify-between h-24 shadow-inner">
                      <div>
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">{s.title}</span>
                        <span className="text-xs text-muted font-medium block mt-0.5">{s.desc}</span>
                      </div>
                      <div className="text-lg font-black text-foreground flex items-center gap-1.5 mt-2">
                        <span>{s.emoji}</span>
                        <span>{s.val} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements Checklist Badges */}
              <div className="glass p-6 rounded-2xl border border-card-border shadow-lg">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-acid-green animate-pulse" />
                  Calyxo Milestones & Achievements
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ecoStore.achievements?.map((ach) => (
                    <div 
                      key={ach.id} 
                      className={`border rounded-xl p-3.5 flex items-center gap-3.5 transition-all ${
                        ach.unlocked 
                          ? 'bg-acid-green/5 border-acid-green/35 shadow-[0_0_10px_rgba(181,242,61,0.15)]' 
                          : 'bg-surface/30 border-card-border opacity-50'
                      }`}
                    >
                      <div className="text-2xl shrink-0">
                        {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-muted" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {ach.name}
                          {ach.unlocked && <span className="w-1.5 h-1.5 rounded-full bg-acid-green shadow-[0_0_6px_#b5f23d]" />}
                        </h4>
                        <p className="text-[10px] text-muted mt-0.5 font-medium leading-tight">{ach.description}</p>
                        {ach.unlocked && ach.unlockedAt && (
                          <span className="text-[8px] text-muted mt-1 block uppercase font-bold tracking-wider">Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
