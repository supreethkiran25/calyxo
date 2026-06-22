"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { saveEcosystemState } from '../lib/dbService';
import { Heart, Activity, Moon, Footprints, RefreshCw, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HealthHub({ onNotification }) {
  const user = useStore(state => state.user);
  const foodLogs = useStore(state => state.foodLogs);
  const workoutLogs = useStore(state => state.workoutLogs);
  const waterIntake = useStore(state => state.waterIntake);
  const userProfile = useStore(state => state.userProfile);
  const ecoStore = useEcosystemStore();
  const userId = user?.uid;

  // Form Fields
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(7);
  const [steps, setSteps] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [activeHR, setActiveHR] = useState('');

  // Hydrate health logs from ecoStore
  const healthLogs = ecoStore.healthLogs || {
    sleep: 7.5,
    sleepQuality: 7,
    steps: 6400,
    restingHR: 62,
    activeHR: 135,
    soreness: 4,
    fatigue: 4
  };

  const handleLogHealthMetrics = async (e) => {
    e.preventDefault();
    const parsedSleep = sleepHours ? Number(sleepHours) : healthLogs.sleep;
    const parsedQuality = sleepQuality ? Number(sleepQuality) : healthLogs.sleepQuality;
    const parsedSteps = steps ? Number(steps) : healthLogs.steps;
    const parsedRestHR = restingHR ? Number(restingHR) : healthLogs.restingHR;
    const parsedActHR = activeHR ? Number(activeHR) : healthLogs.activeHR;

    // Update state inside ecoStore
    const nextHealthLogs = {
      sleep: parsedSleep,
      sleepQuality: parsedQuality,
      steps: parsedSteps,
      restingHR: parsedRestHR,
      activeHR: parsedActHR,
      soreness: healthLogs.soreness || 4,
      fatigue: healthLogs.fatigue || 4
    };

    // Calculate Recovery Score
    const recoveryScore = Math.max(30, Math.min(100, Math.round(100 - ((nextHealthLogs.soreness + nextHealthLogs.fatigue) * 5))));
    nextHealthLogs.recovery = recoveryScore;

    // Calculate Readiness Score
    // Formula: 40% Sleep duration/quality, 40% Heart Rate compliance, 20% Recovery Score
    const hrFactor = Math.max(0, 100 - (parsedRestHR - 55) * 1.8);
    const sleepFactor = (parsedSleep / 8) * 50 + (parsedQuality / 10) * 50;
    const readinessScore = Math.max(35, Math.min(100, Math.round((sleepFactor * 0.4) + (hrFactor * 0.4) + (recoveryScore * 0.2))));
    nextHealthLogs.readiness = readinessScore;

    // Calculate Calyxo Health Score
    // Composite: 25% steps, 25% water compliance, 25% calorie compliance, 25% sleep compliance
    const stepFactor = Math.min(1, parsedSteps / 10000) * 25;
    const waterFactor = Math.min(1, waterIntake / (userProfile?.waterTarget || 2500)) * 25;
    const totalCal = foodLogs.reduce((s, x) => s + x.calories, 0);
    const targetCal = userProfile?.dailyCalories || 2000;
    const calDiff = Math.abs(targetCal - totalCal);
    const calFactor = Math.max(0, 25 - (calDiff / targetCal) * 25);
    const sleepCompFactor = Math.min(1, parsedSleep / 8) * 25;
    const compositeHealthScore = Math.max(40, Math.min(100, Math.round(stepFactor + waterFactor + calFactor + sleepCompFactor)));

    // Sync state
    ecoStore.syncEcosystemState({ 
      healthLogs: nextHealthLogs,
      fitnessScore: {
        dailyScore: compositeHealthScore,
        weeklyScore: Math.round((ecoStore.fitnessScore.weeklyScore * 6 + compositeHealthScore) / 7),
        monthlyScore: ecoStore.fitnessScore.monthlyScore,
        recommendations: [
          parsedSleep < 7 ? "Increase sleep by 1-2 hours for cellular repair." : "Sleep duration is optimal.",
          parsedSteps < 8000 ? "Aim for 2,000 more steps to increase aerobic conditioning." : "Step baseline met successfully.",
          parsedRestHR > 70 ? "Resting HR is elevated. Prioritize deep breathing exercises." : "Resting heart rate in excellent athletic zone."
        ]
      }
    });

    await saveEcosystemState(userId, useEcosystemStore.getState());
    
    // Clear inputs
    setSleepHours('');
    setSteps('');
    setRestingHR('');
    setActiveHR('');

    if (onNotification) onNotification("Logged Health & Biometrics Hub stats! ❤️");
  };

  // Calculations
  const calculatedRecovery = healthLogs.recovery || 78;
  const calculatedReadiness = healthLogs.readiness || 82;
  const calculatedHealth = ecoStore.fitnessScore.dailyScore || 70;

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header section */}
      <div className="flex justify-between items-center border-b border-card-border pb-3">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight">Health Hub</h1>
          <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 hidden sm:block">Automated readiness, cardiovascular tracking, and recovery scoring</p>
        </div>
      </div>

      {/* Main Score rings — horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none md:grid md:grid-cols-3">
        {/* Readiness Score Card */}
        <div className="glass p-6 rounded-2xl border border-card-border shadow-md text-center flex flex-col justify-between items-center h-64 shrink-0 min-w-[200px] md:min-w-0">
          <div className="w-full flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
            <span>Readiness Score</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--card-border)" strokeWidth="7" />
              <circle 
                cx="50" cy="50" r="40" fill="none" 
                stroke="var(--orange-theme)" strokeWidth="7" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 - (calculatedReadiness / 100) * (2 * Math.PI * 40)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground leading-none">{calculatedReadiness}</span>
              <span className="text-[7px] text-muted font-bold uppercase tracking-widest mt-1">Ready</span>
            </div>
          </div>

          <p className="text-[10px] text-muted font-semibold max-w-[200px]">Combines sleep compliance, central fatigue, and resting heart rate metrics.</p>
        </div>

        {/* Recovery Score Card */}
        <div className="glass p-6 rounded-2xl border border-card-border shadow-md text-center flex flex-col justify-between items-center h-64 shrink-0 min-w-[200px] md:min-w-0">
          <div className="w-full flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
            <span>Recovery Score</span>
            <Moon className="w-4 h-4 text-blue-400" />
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--card-border)" strokeWidth="7" />
              <circle 
                cx="50" cy="50" r="40" fill="none" 
                stroke="#29b6f6" strokeWidth="7" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 - (calculatedRecovery / 100) * (2 * Math.PI * 40)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground leading-none">{calculatedRecovery}%</span>
              <span className="text-[7px] text-muted font-bold uppercase tracking-widest mt-1">Recovered</span>
            </div>
          </div>

          <p className="text-[10px] text-muted font-semibold max-w-[200px]">Calculated from daily muscle soreness levels and nervous fatigue parameters.</p>
        </div>

        {/* Composite Health Score */}
        <div className="glass p-6 rounded-2xl border border-card-border shadow-md text-center flex flex-col justify-between items-center h-64 shrink-0 min-w-[200px] md:min-w-0">
          <div className="w-full flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
            <span>Calyxo Health Score</span>
            <Award className="w-4 h-4 text-acid-green animate-pulse" />
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--card-border)" strokeWidth="7" />
              <circle 
                cx="50" cy="50" r="40" fill="none" 
                stroke="var(--accent)" strokeWidth="7" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 - (calculatedHealth / 100) * (2 * Math.PI * 40)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground leading-none">{calculatedHealth}</span>
              <span className="text-[7px] text-muted font-bold uppercase tracking-widest mt-1">Health Index</span>
            </div>
          </div>

          <p className="text-[10px] text-muted font-semibold max-w-[200px]">Composite daily compliance rating covering calories, water, steps, and sleep.</p>
        </div>
      </div>

      {/* Logging form & details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        {/* Metrics Form */}
        <form onSubmit={handleLogHealthMetrics} className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-4 lg:col-span-1">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-acid-green" />
            Log Daily Biometrics
          </h3>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              Sleep Duration (Hours)
            </label>
            <input 
              type="number" step="0.1" min="1" max="24"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder={`Current: ${healthLogs.sleep} hrs`}
              className="bg-[var(--input)] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-muted font-bold uppercase tracking-wider">
              Sleep Quality (1 - 10)
            </label>
            <div className="flex justify-between items-center text-xs text-foreground mt-0.5">
              <span>Fair ({sleepQuality}/10)</span>
              <input 
                type="range" min="1" max="10" 
                value={sleepQuality} 
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-[140px] accent-acid-green cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-acid-green" />
              Daily Step Count
            </label>
            <input 
              type="number" min="0" max="100000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={`Current: ${healthLogs.steps} steps`}
              className="bg-[var(--input)] border border-card-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Resting HR (BPM)</label>
              <input 
                type="number" min="30" max="200"
                value={restingHR}
                onChange={(e) => setRestingHR(e.target.value)}
                placeholder={`${healthLogs.restingHR}`}
                className="bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Active HR (BPM)</label>
              <input 
                type="number" min="60" max="220"
                value={activeHR}
                onChange={(e) => setActiveHR(e.target.value)}
                placeholder={`${healthLogs.activeHR}`}
                className="bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 rounded-xl cursor-pointer border-none font-bold text-xs uppercase tracking-wider shadow-md"
          >
            Update Health Logs
          </button>
        </form>

        {/* Detailed Stats display */}
        <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            📊 Biometrics Analysis & Advice
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface/50 border border-card-border p-4 rounded-xl space-y-1.5 shadow-inner">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Sleep Profile</span>
              <p className="text-xs text-foreground font-black">{healthLogs.sleep} hours logged · quality: {healthLogs.sleepQuality}/10</p>
              <span className="text-[9px] text-acid-green font-bold block">✓ Optimal sleep target: 8.0 hours.</span>
            </div>

            <div className="bg-surface/50 border border-card-border p-4 rounded-xl space-y-1.5 shadow-inner">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Steps Activity</span>
              <p className="text-xs text-foreground font-black">{healthLogs.steps.toLocaleString()} steps logged</p>
              <span className="text-[9px] text-acid-green font-bold block">
                {healthLogs.steps >= 10000 ? "✓ 10,000 steps baseline completed!" : `🚶 ${10000 - healthLogs.steps} steps remaining to hit daily target.`}
              </span>
            </div>

            <div className="bg-surface/50 border border-card-border p-4 rounded-xl space-y-1.5 shadow-inner">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Cardiovascular Heart Rate</span>
              <p className="text-xs text-foreground font-black">Resting: {healthLogs.restingHR} BPM · Peak: {healthLogs.activeHR} BPM</p>
              <span className="text-[9px] text-acid-green font-bold block">✓ Normal healthy resting HR range: 55 - 75 BPM.</span>
            </div>

            <div className="bg-surface/50 border border-card-border p-4 rounded-xl space-y-1.5 shadow-inner">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Training Soreness & Fatigue</span>
              <p className="text-xs text-foreground font-black">Soreness index: {healthLogs.soreness}/10 · Fatigue index: {healthLogs.fatigue}/10</p>
              <span className="text-[9px] text-acid-green font-bold block">✓ Current recovery zone: {calculatedRecovery >= 75 ? "Optimal Training readiness" : "Rest & repair recommended"}.</span>
            </div>
          </div>

          <div className="bg-surface/30 border border-card-border p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-black text-acid-green uppercase tracking-wider block">Calyxo AI Health Suggestions</span>
            <div className="space-y-1.5">
              {ecoStore.fitnessScore.recommendations?.map((rec, i) => (
                <div key={i} className="flex gap-2 items-start text-xs font-semibold text-foreground/80 leading-relaxed">
                  <span className="text-acid-green font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
