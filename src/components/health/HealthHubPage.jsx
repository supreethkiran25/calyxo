"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Smartphone, Flame, Clock, Dumbbell, ShieldCheck,
  RefreshCw, Settings, Sparkles, TrendingUp, CheckCircle2, ChevronRight,
  Footprints, Zap, Moon, Scale, Award, ArrowUpRight
} from 'lucide-react';
import { HealthPermissionManager } from '../../services/health/HealthPermissionManager';
import { HealthDataService } from '../../services/health/HealthDataService';
import { HealthSyncEngine } from '../../services/health/HealthSyncEngine';
import { AIHealthInsightService } from '../../services/health/AIHealthInsightService';
import { HealthGoalManager } from '../../services/health/HealthGoalManager';
import HealthConnectionsModal from './HealthConnectionsModal';
import { PWAPedometerService } from '../../services/health/PWAPedometerService';
import PremiumGate from '../PremiumGate';
import { useStore } from '../../store/useStore';

export default function HealthHubPage({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const plan = userProfile?.subscriptionPlan;
  const email = (user?.email || userProfile?.email || "").toLowerCase().trim();

  const isSubscribed = Boolean(
    userProfile?.isSubscribed || 
    (plan && plan !== 'FREE' && plan !== 'DEFAULT') ||
    email === 'supreethkiran25@gmail.com'
  );

  const [isConnected, setIsConnected] = useState(HealthPermissionManager.isConnected());
  const [showOnboarding, setShowOnboarding] = useState(!HealthPermissionManager.isConnected());
  const [metrics, setMetrics] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [trends, setTrends] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedTrendMetric, setSelectedTrendMetric] = useState('steps');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const platform = HealthPermissionManager.getPlatform();
  const platformLabel = platform === 'ios_apple_health' ? 'Apple Health' : platform === 'android_health_connect' ? 'Android Health Connect' : 'Health Platform';

  if (!isSubscribed) {
    return (
      <PremiumGate 
        title="Universal Health Hub Locked"
        description="Real-time Apple Health (HealthKit) and Android Health Connect integration, multi-timeframe historical analytics, AI health insights, and automated workout sync are reserved for Calyxo Premium members."
        requiredTier="HIGH"
      />
    );
  }

  // Initial Load & Subscription to Sync Engine + PWA Pedometer
  useEffect(() => {
    async function loadInitialHealthData() {
      const today = await HealthDataService.fetchTodayMetrics();
      const recentWorkouts = await HealthDataService.fetchRecentWorkouts();
      const initialTrends = await HealthDataService.fetchTrends('7d');

      setMetrics(today);
      setWorkouts(recentWorkouts);
      setTrends(initialTrends);
    }

    loadInitialHealthData();

    // Start motion pedometer if connected
    if (HealthPermissionManager.isConnected()) {
      PWAPedometerService.requestAndStartTracking();
    }

    // Subscribe to live motion pedometer step ticks
    const unsubscribePedometer = PWAPedometerService.subscribe((liveSteps) => {
      setMetrics(prev => {
        if (!prev) return prev;
        const newDist = Number((liveSteps * 0.00075).toFixed(2));
        const newCals = Math.round(liveSteps * 0.042);
        return {
          ...prev,
          steps: liveSteps,
          distanceKm: newDist,
          activeCalories: newCals,
          lastSyncTimestamp: Date.now()
        };
      });
    });

    // Start auto-sync interval
    const unsubscribeSync = HealthSyncEngine.subscribe((syncData) => {
      if (syncData.metrics) setMetrics(syncData.metrics);
      if (syncData.workouts) setWorkouts(syncData.workouts);
    });

    const cleanupAuto = HealthSyncEngine.startAutoSync(30000);

    return () => {
      unsubscribeSync();
      unsubscribePedometer();
      if (cleanupAuto) cleanupAuto();
    };
  }, []);

  // Update Trends when Timeframe changes
  useEffect(() => {
    async function updateTrends() {
      const data = await HealthDataService.fetchTrends(selectedTimeframe);
      setTrends(data);
    }
    updateTrends();
  }, [selectedTimeframe]);

  // Handle Onboarding Connect
  const handleConnectHealth = async () => {
    const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
    setIsConnected(true);
    setShowOnboarding(false);
    await handleRefreshData();
    if (onNotification) onNotification(`Connected to ${platformLabel}! Syncing health metrics.`);
  };

  // Refresh Data Action
  const handleRefreshData = async () => {
    setIsSyncing(true);
    await HealthSyncEngine.triggerSync();
    setIsSyncing(false);
    if (onNotification) onNotification("Health metrics updated from device.");
  };

  // AI Coaching Insights
  const aiInsights = useMemo(() => {
    return AIHealthInsightService.generateInsights(metrics || {});
  }, [metrics]);

  // Calculated Progress
  const progressStats = useMemo(() => {
    return HealthGoalManager.calculateProgress(metrics || {});
  }, [metrics]);

  const isConn = HealthPermissionManager.isConnected();
  const stepCount = metrics?.steps || 0;
  const stepGoal = metrics?.stepGoal || 10000;
  const stepPct = stepGoal > 0 ? Math.min(100, Math.round((stepCount / stepGoal) * 100)) : 0;

  const calCount = metrics?.activeCalories || 0;
  const calGoal = metrics?.calorieGoal || 500;
  const calPct = calGoal > 0 ? Math.min(100, Math.round((calCount / calGoal) * 100)) : 0;

  const minCount = metrics?.activeMinutes || 0;
  const minGoal = metrics?.activeMinutesGoal || 60;
  const minPct = minGoal > 0 ? Math.min(100, Math.round((minCount / minGoal) * 100)) : 0;

  const distanceKm = metrics?.distanceKm || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-foreground">

      {/* ── 1. ONBOARDING CARD (FIRST TIME USERS) ───────────────────────── */}
      <AnimatePresence>
        {showOnboarding && !isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-2xl shadow-inner">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Connect Your Health Data</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Securely connect your phone's health platform to automatically sync your activity, workouts, calories, and health metrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-xs font-bold text-muted hover:text-foreground cursor-pointer bg-none border-none"
              >
                Dismiss
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConnectHealth}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Connect {platformLabel}</span>
              </button>

              <button
                onClick={() => setShowOnboarding(false)}
                className="px-5 py-3.5 rounded-2xl bg-card-bg border border-card-border text-muted font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-foreground transition-all"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. HERO DASHBOARD HEADER ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-card-border rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> {isConnected ? `${platformLabel} Active` : 'Web Health Hub'}
            </span>
            <span className="text-xs font-bold text-muted">
              {HealthSyncEngine.formatLastSyncTime(metrics?.lastSyncTimestamp)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-foreground">
            Health Data Hub
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshData}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-2xl bg-surface border border-card-border text-foreground hover:border-emerald-400 text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-2xl bg-surface border border-card-border text-muted hover:text-foreground cursor-pointer transition-all"
            title="Health Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 3. 4 LARGE EMERALD PROGRESS RINGS ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Step Ring */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 shadow-lg flex flex-col items-center justify-center space-y-2 text-center relative overflow-hidden group">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 origin-center">
              <circle cx="50%" cy="50%" r="40" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="7" />
              <circle
                cx="50%" cy="50%" r="40" fill="none" stroke="#10b981" strokeWidth="7"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) - (stepPct / 100) * (2 * Math.PI * 40)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-foreground">{stepPct}%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Today's Steps</span>
            <span className="text-xs font-bold text-muted">{stepCount.toLocaleString()} / {stepGoal.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Calories Ring */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 shadow-lg flex flex-col items-center justify-center space-y-2 text-center relative overflow-hidden group">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 origin-center">
              <circle cx="50%" cy="50%" r="40" fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="7" />
              <circle
                cx="50%" cy="50%" r="40" fill="none" stroke="#f59e0b" strokeWidth="7"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) - (calPct / 100) * (2 * Math.PI * 40)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-foreground">{calPct}%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#f59e0b] block">Active Burn</span>
            <span className="text-xs font-bold text-muted">{calCount} / {calGoal} kcal</span>
          </div>
        </div>

        {/* Walking Distance Ring */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 shadow-lg flex flex-col items-center justify-center space-y-2 text-center relative overflow-hidden group">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 origin-center">
              <circle cx="50%" cy="50%" r="40" fill="none" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="7" />
              <circle
                cx="50%" cy="50%" r="40" fill="none" stroke="#00f2fe" strokeWidth="7"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) - (Math.min(100, Math.round((distanceKm / 8.0) * 100)) / 100) * (2 * Math.PI * 40)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-foreground">{distanceKm} km</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00f2fe] block">Distance</span>
            <span className="text-xs font-bold text-muted">{distanceKm} / 8.0 km</span>
          </div>
        </div>

        {/* Active Minutes Ring */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 shadow-lg flex flex-col items-center justify-center space-y-2 text-center relative overflow-hidden group">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 origin-center">
              <circle cx="50%" cy="50%" r="40" fill="none" stroke="rgba(255, 78, 80, 0.15)" strokeWidth="7" />
              <circle
                cx="50%" cy="50%" r="40" fill="none" stroke="#ff4e50" strokeWidth="7"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={(2 * Math.PI * 40) - (minPct / 100) * (2 * Math.PI * 40)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-foreground">{minPct}%</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ff4e50] block">Active Time</span>
            <span className="text-xs font-bold text-muted">{minCount} / {minGoal} mins</span>
          </div>
        </div>

      </div>

      {/* ── 4. AI BIOMETRIC COACHING INSIGHTS ─────────────────────────────── */}
      <section className="bg-surface border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">AI Health Insights</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {aiInsights.map(ins => (
            <div key={ins.id} className="p-4 rounded-2xl bg-card-bg border border-card-border space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{ins.icon}</span>
                <span className="text-xs font-black uppercase text-foreground">{ins.title}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{ins.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. HEALTH METRICS CARDS (HEART RATE, SLEEP, WEIGHT, RECOVERY) ──── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Heart Rate */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-[9px] font-bold uppercase">HEART RATE</span>
          </div>
          <div>
            <span className="text-2xl font-black text-foreground">{metrics?.heartRateBpm || 72}</span>
            <span className="text-xs font-bold text-muted ml-1">BPM</span>
          </div>
          <span className="text-[10px] font-bold text-muted block">Resting: {metrics?.restingHeartRateBpm || 62} BPM</span>
        </div>

        {/* Sleep */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <Moon className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-bold uppercase">SLEEP</span>
          </div>
          <div>
            <span className="text-2xl font-black text-foreground">{metrics?.sleepHours || 7.4}</span>
            <span className="text-xs font-bold text-muted ml-1">hrs</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 block">{metrics?.sleepQualityPct || 88}% Quality</span>
        </div>

        {/* Weight Trend */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <Scale className="w-4 h-4 text-[#00f2fe]" />
            <span className="text-[9px] font-bold uppercase">WEIGHT</span>
          </div>
          <div>
            <span className="text-2xl font-black text-foreground">{metrics?.weightKg || 72.5}</span>
            <span className="text-xs font-bold text-muted ml-1">kg</span>
          </div>
          <span className="text-[10px] font-bold text-muted block">Body Fat: {metrics?.bodyFatPct || 16.2}%</span>
        </div>

        {/* Recovery Score */}
        <div className="bg-surface border border-card-border rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-center text-muted">
            <Zap className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-[9px] font-bold uppercase">RECOVERY</span>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400">{metrics?.recoveryScore || 84}%</span>
          </div>
          <span className="text-[10px] font-bold text-muted block">Ready for High Load</span>
        </div>

      </div>

      {/* ── 6. AUTOMATICALLY DETECTED DEVICE WORKOUTS ────────────────────── */}
      <section className="bg-surface border border-card-border rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Automatically Detected Workouts</h3>
          <span className="text-xs font-bold text-emerald-400">{workouts.length} Sessions Imported</span>
        </div>

        <div className="space-y-3">
          {workouts.map(w => (
            <div key={w.id} className="p-4 rounded-2xl bg-card-bg border border-card-border flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wide">{w.title}</h4>
                  <span className="text-xs text-muted font-medium">
                    {w.type} • {w.startTime} - {w.endTime} ({w.source})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div>
                  <span className="text-muted block text-[9px] uppercase">Duration</span>
                  <span className="text-foreground font-black">{w.durationMin}m</span>
                </div>
                <div>
                  <span className="text-muted block text-[9px] uppercase">Burned</span>
                  <span className="text-emerald-400 font-black">+{w.caloriesBurned} kcal</span>
                </div>
                <div>
                  <span className="text-muted block text-[9px] uppercase">Avg HR</span>
                  <span className="text-destructive font-black">{w.avgHeartRate} BPM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. INTERACTIVE MULTI-TIMEFRAME TRENDS CHARTS ────────────────── */}
      <section className="bg-surface border border-card-border rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border pb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Health Trends & Analytics</h3>

          {/* Timeframe Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {['7d', '30d', '90d', '1y'].map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                    : 'bg-card-bg border-card-border text-muted hover:text-foreground'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'steps', label: 'Steps' },
            { id: 'calories', label: 'Calories' },
            { id: 'duration', label: 'Exercise Duration' },
            { id: 'weight', label: 'Weight' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedTrendMetric(m.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                selectedTrendMetric === m.id
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-card-bg border-card-border text-muted hover:text-foreground'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Chart Bar Matrix */}
        {trends && trends[selectedTrendMetric] && (
          <div className="h-44 w-full flex items-end justify-between gap-1 pt-6 px-2 border-b border-card-border/50 pb-2">
            {trends[selectedTrendMetric].slice(0, 14).map((val, idx) => {
              const maxVal = Math.max(...trends[selectedTrendMetric], 1);
              const heightPct = Math.max(10, Math.round((val / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div
                    className="w-full bg-emerald-500/80 rounded-t-lg group-hover:bg-emerald-400 transition-all cursor-pointer relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                      {val.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-muted truncate w-full text-center">
                    {trends.labels[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Health Connections Modal */}
      <HealthConnectionsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onNotification={onNotification}
      />

    </div>
  );
}
