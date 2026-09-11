import React, { useState, useEffect } from 'react';
import { 
  Flame, Footprints, Droplets, Dumbbell, Sparkles, Smartphone, 
  LayoutGrid, Check, RefreshCw, Sliders, Eye, Download, 
  Layers, Activity, Zap, Palette, ChevronRight, Info, 
  Lock, CheckCircle2, Plus, ArrowUpRight, Share2, Bell
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useStore } from '../../store/useStore';
import { 
  syncWidgetData, 
  pinWidgetToHomeScreen, 
  getWidgetCustomization, 
  saveWidgetCustomization,
  DEFAULT_WIDGET_CONFIG
} from '../../services/widgetDataService';
import { sendTestNotification } from '../../services/notificationService';
import { HealthCache } from '../../services/health/HealthCache';
import { PWAPedometerService } from '../../services/health/PWAPedometerService';
import { HealthSyncEngine } from '../../services/health/HealthSyncEngine';
import { getTodayDateString, isSameLocalDate, isToday } from '../../utils/dateUtils';

// Theme Palettes for Widget Styling
const WIDGET_THEMES = [
  {
    id: 'emerald',
    name: 'Calyxo Emerald',
    previewBg: 'from-emerald-950/80 via-zinc-950 to-black',
    accent: '#10b981',
    ringColors: { cal: '#f59e0b', steps: '#10b981', water: '#00f2fe', prot: '#ff4e50' },
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    cardBorder: 'border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Stealth',
    previewBg: 'from-zinc-900 via-zinc-950 to-black',
    accent: '#a1a1aa',
    ringColors: { cal: '#fbbf24', steps: '#34d399', water: '#38bdf8', prot: '#f87171' },
    badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    cardBorder: 'border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    previewBg: 'from-fuchsia-950/60 via-purple-950/40 to-black',
    accent: '#06b6d4',
    ringColors: { cal: '#f43f5e', steps: '#a855f7', water: '#06b6d4', prot: '#eab308' },
    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    cardBorder: 'border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
  },
  {
    id: 'solar',
    name: 'Solar Ember',
    previewBg: 'from-amber-950/60 via-orange-950/30 to-black',
    accent: '#f97316',
    ringColors: { cal: '#ea580c', steps: '#fbbf24', water: '#38bdf8', prot: '#ef4444' },
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    cardBorder: 'border-amber-500/30 shadow-[0_0_25px_rgba(249,115,22,0.18)]'
  },
  {
    id: 'frosted',
    name: 'Titanium Glass',
    previewBg: 'from-slate-900/90 via-zinc-900/80 to-zinc-950',
    accent: '#ffffff',
    ringColors: { cal: '#fbbf24', steps: '#6ee7b7', water: '#7dd3fc', prot: '#fda4af' },
    badge: 'bg-white/10 text-white border-white/20',
    cardBorder: 'border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.05)] backdrop-blur-xl'
  }
];

const WIDGET_SIZES = [
  { id: 'small', label: 'Small (2×2)', desc: 'Concentric 4-Ring Pulse' },
  { id: 'medium', label: 'Medium (4×2)', desc: 'Quad Rings & Daily Metrics' },
  { id: 'large', label: 'Large (4×4)', desc: 'Complete Health Dashboard' },
  { id: 'lockscreen', label: 'Lock Screen', desc: 'Minimal iOS AOD & Rings' }
];

const WIDGET_TYPES = [
  { id: 'rings', label: 'Quad Rings', icon: Layers, desc: 'Calories, Steps, Water & Protein in 4 interactive rings' },
  { id: 'steps', label: 'Steps Pulse', icon: Footprints, desc: 'Daily step cadence, km distance, and active burn' },
  { id: 'nutrition', label: 'Nutrition & Macros', icon: Flame, desc: 'Calorie balance with protein, carb and fat split' },
  { id: 'hydration', label: 'Hydration Flow', icon: Droplets, desc: 'Water target progress and daily streak flame' },
  { id: 'workout', label: 'Live Workout', icon: Activity, desc: 'Active workout sets, rest timers and HR zones' }
];

export default function WidgetStudioSection({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs || []);
  const waterIntake = useStore(state => state.waterIntake || 0);

  // Local config states
  const [config, setConfig] = useState(DEFAULT_WIDGET_CONFIG);
  const [deviceFrame, setDeviceFrame] = useState('ios'); // 'ios' | 'android' | 'lockscreen'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('LIVE SYNC ACTIVE');
  const [lastSyncText, setLastSyncText] = useState('Just now');
  const [showGuide, setShowGuide] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState('ios');
  const [activeStepTab, setActiveStepTab] = useState(0);

  // Calculate live values
  const todayStr = getTodayDateString();
  const todaysFoodLogs = foodLogs.filter(x => isSameLocalDate(x.timestamp, todayStr) || isToday(x.timestamp));
  const totalCal = todaysFoodLogs.reduce((s, x) => s + (Number(x.calories) || 0), 0);
  const totalProt = todaysFoodLogs.reduce((s, x) => s + (Number(x.protein) || 0), 0);
  const totalCarbs = todaysFoodLogs.reduce((s, x) => s + (Number(x.carbs) || 0), 0);
  const totalFat = todaysFoodLogs.reduce((s, x) => s + (Number(x.fat) || 0), 0);

  const calTarget = Number(userProfile?.calorieGoal || userProfile?.dailyCalories || 2000);
  const protTarget = Number(userProfile?.proteinGoal || 150);
  const rawWaterGoal = Number(userProfile?.waterGoal || userProfile?.waterTarget);
  const waterTarget = (rawWaterGoal > 0 && rawWaterGoal !== 2500) ? rawWaterGoal : 3000;
  const stepTarget = Number(userProfile?.stepGoal || userProfile?.dailySteps || 10000);
  const streak = Number(userProfile?.streak || 3);

  // Real-time live step count resolution (PWA sensor / HealthKit / Android sensor / cache)
  const getInitialSteps = () => {
    try {
      const cached = HealthCache.getMetrics();
      const cachedSteps = (cached && typeof cached.steps === 'number') ? cached.steps : 0;
      let pwa = 0;
      if (typeof PWAPedometerService !== 'undefined' && typeof PWAPedometerService.getTodaySteps === 'function') {
        pwa = PWAPedometerService.getTodaySteps() || 0;
      }
      return Math.max(cachedSteps, pwa);
    } catch (e) {}
    return 0;
  };

  const [liveSteps, setLiveSteps] = useState(getInitialSteps);

  // Subscribe to live step and health engine updates
  useEffect(() => {
    setLiveSteps(prev => Math.max(prev, getInitialSteps()));

    const unsubPedometer = PWAPedometerService.subscribe((steps) => {
      if (typeof steps === 'number') setLiveSteps(prev => Math.max(prev, steps));
    });

    const unsubSync = HealthSyncEngine.subscribe((data) => {
      if (data?.metrics?.steps !== undefined) {
        setLiveSteps(prev => Math.max(prev, data.metrics.steps));
      }
    });

    const handleDataSync = () => {
      setLiveSteps(prev => Math.max(prev, getInitialSteps()));
    };
    window.addEventListener('calyxo_data_sync', handleDataSync);

    return () => {
      unsubPedometer();
      unsubSync();
      window.removeEventListener('calyxo_data_sync', handleDataSync);
    };
  }, [todayStr]);

  // Load user's saved widget custom config
  useEffect(() => {
    async function loadConfig() {
      const saved = await getWidgetCustomization();
      if (saved) setConfig(saved);
    }
    loadConfig();
  }, []);

  const activeTheme = WIDGET_THEMES.find(t => t.id === config.theme) || WIDGET_THEMES[0];

  const calPct = calTarget > 0 ? Math.min(100, Math.round((totalCal / calTarget) * 100)) : 0;
  const stepPct = stepTarget > 0 ? Math.min(100, Math.round((liveSteps / stepTarget) * 100)) : 0;
  const waterPct = waterTarget > 0 ? Math.min(100, Math.round((waterIntake / waterTarget) * 100)) : 0;
  const protPct = protTarget > 0 ? Math.min(100, Math.round((totalProt / protTarget) * 100)) : 0;

  // Quad Ring items for rendering
  const quadRings = [
    {
      id: 'calories',
      label: 'CALORIES',
      short: 'CAL',
      val: totalCal,
      target: calTarget,
      unit: 'kcal',
      pct: calPct,
      color: activeTheme.ringColors.cal,
      icon: Flame
    },
    {
      id: 'steps',
      label: 'STEPS',
      short: 'STEP',
      val: liveSteps,
      target: stepTarget,
      unit: 'steps',
      pct: stepPct,
      color: activeTheme.ringColors.steps,
      icon: Footprints
    },
    {
      id: 'hydration',
      label: 'HYDRATION',
      short: 'H2O',
      val: waterIntake,
      target: waterTarget,
      unit: 'ml',
      pct: waterPct,
      color: activeTheme.ringColors.water,
      icon: Droplets
    },
    {
      id: 'protein',
      label: 'PROTEIN',
      short: 'PROT',
      val: totalProt,
      target: protTarget,
      unit: 'g',
      pct: protPct,
      color: activeTheme.ringColors.prot,
      icon: Dumbbell
    }
  ];

  // Manual Instant Sync Trigger
  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const payload = await syncWidgetData({
        calories: totalCal,
        calorieGoal: calTarget,
        steps: liveSteps,
        stepGoal: stepTarget,
        protein: totalProt,
        proteinGoal: protTarget,
        carbs: totalCarbs,
        fat: totalFat,
        water: waterIntake,
        waterGoal: waterTarget,
        streak: streak,
        activeWorkoutName: ''
      });
      setLastSyncText('Just now');
      setSyncStatus('SYNC COMPLETE');
      if (onNotification) {
        onNotification(`Synced all 4 rings (Steps: ${liveSteps.toLocaleString()}, Calories: ${totalCal}, Water: ${waterIntake}ml) to iOS & Android widgets!`);
      }
    } catch (e) {
      if (onNotification) onNotification('Failed to sync widget data. Please retry.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncStatus('LIVE SYNC ACTIVE');
      }, 1000);
    }
  };

  // Add to home screen trigger
  const handlePinWidget = async () => {
    const res = await pinWidgetToHomeScreen();
    if (res && res.supported) {
      if (onNotification) onNotification('Prompting to add Calyxo Quad Rings Widget to your Home Screen...');
    } else {
      setShowGuide(true);
      if (Capacitor.getPlatform() === 'android') {
        setGuidePlatform('android');
      } else {
        setGuidePlatform('ios');
      }
      if (onNotification) onNotification("Long-press your Home Screen → Tap '+' → Search 'Calyxo' → Choose your aesthetic widget!");
    }
  };

  // Update customization
  const updateCustomization = async (updates) => {
    const next = { ...config, ...updates };
    setConfig(next);
    await saveWidgetCustomization(next);
    // Also trigger instant sync with updated preferences
    await syncWidgetData();
  };

  // Render SVG Circular Progress Ring
  const renderSvgRing = (progressPct, color, radius, strokeWidth, glow = true) => {
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(progressPct / 100, 0), 1);
    const strokeDashoffset = circumference - (progress * circumference);

    return (
      <svg className="transform -rotate-90 origin-center absolute inset-0 w-full h-full">
        {/* Track */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke={color}
          strokeOpacity={0.16}
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: glow && config.showGlow ? `drop-shadow(0 0 4px ${color})` : 'none'
          }}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. STUDIO HEADER & LIVE STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-surface/60 border border-card-border backdrop-blur-xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-foreground">
              Home Screen Widget Studio
            </h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Customize and sync dynamic 4-Ring Activity widgets with live Steps, Calories, Hydration & Protein.
          </p>
        </div>

        {/* Live Sync Status & Instant Sync Action */}
        <div className="flex items-center gap-2 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/40 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              {syncStatus}
            </span>
            <span className="text-[10px] text-muted font-bold hidden sm:inline">
              • {lastSyncText}
            </span>
          </div>

          <button
            onClick={async () => {
              try {
                await sendTestNotification({
                  title: 'Calyxo Quad Rings Synced 🔥',
                  body: `Steps: ${liveSteps.toLocaleString()} / ${stepTarget.toLocaleString()} | Calories: ${totalCal} kcal | Water: ${waterIntake}ml`
                });
                if (onNotification) onNotification('⚡ Test notification sent! Check your notification center or lock screen.');
              } catch (e) {
                if (onNotification) onNotification('Test notification triggered.');
              }
            }}
            className="px-3 py-1.5 rounded-2xl bg-surface hover:bg-surface/80 text-foreground border border-card-border font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Send sample push alert to test device notification integration"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Test Alert</span>
          </button>

          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer disabled:opacity-50"
            title="Force immediate sync to iOS & Android widgets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Now</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN STUDIO WORKBENCH: LIVE SIMULATOR + CUSTOMIZER CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: LIVE PHONE DEVICE SIMULATOR */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
          
          {/* Device Frame Selector Toolbar */}
          <div className="flex items-center justify-center p-1.5 rounded-2xl bg-surface border border-card-border gap-1.5 w-full max-w-sm">
            <button
              onClick={() => setDeviceFrame('ios')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                deviceFrame === 'ios' 
                  ? 'bg-emerald-500 text-black shadow-md' 
                  : 'text-muted hover:text-foreground hover:bg-surface/80'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              iPhone iOS
            </button>
            <button
              onClick={() => setDeviceFrame('android')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                deviceFrame === 'android' 
                  ? 'bg-emerald-500 text-black shadow-md' 
                  : 'text-muted hover:text-foreground hover:bg-surface/80'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android
            </button>
            <button
              onClick={() => {
                setDeviceFrame('lockscreen');
                updateCustomization({ size: 'lockscreen' });
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                deviceFrame === 'lockscreen' 
                  ? 'bg-emerald-500 text-black shadow-md' 
                  : 'text-muted hover:text-foreground hover:bg-surface/80'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Screen
            </button>
          </div>

          {/* REALISTIC PHONE CONTAINER */}
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] h-[520px] sm:h-[580px] rounded-[44px] sm:rounded-[48px] bg-zinc-950 p-3 sm:p-3.5 border-[5px] sm:border-[6px] border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden mx-auto">
            
            {/* Phone Screen Wallpaper Background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.previewBg} transition-colors duration-500 pointer-events-none opacity-90`} />
            
            {/* Subtle Grid / Wallpaper Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

            {/* TOP BAR / DYNAMIC ISLAND */}
            <div className="relative z-20 flex justify-between items-center px-4 pt-2">
              <span className="text-[11px] font-black text-white/90">09:41</span>
              {deviceFrame === 'ios' ? (
                <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2 border border-white/10 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-black border border-white/20" />
              )}
              <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-[10px] font-black">5G</span>
                <div className="w-4 h-2 rounded-sm border border-white/80 p-0.5 flex items-center">
                  <div className="w-2.5 h-full bg-emerald-400 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* SIMULATED WIDGET ON HOMESCREEN */}
            <div className="relative z-10 my-auto px-2 py-4 flex flex-col items-center justify-center">
              
              {/* === WIDGET CARD WRAPPER === */}
              <div className={`w-full transition-all duration-300 rounded-[28px] bg-black/75 backdrop-blur-2xl p-4 border ${activeTheme.cardBorder} relative overflow-hidden group`}>
                
                {/* Ambient Glow Background inside widget */}
                {config.showGlow && (
                  <div 
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-500"
                    style={{ backgroundColor: activeTheme.accent }}
                  />
                )}

                {/* 1. QUAD RINGS WIDGET */}
                {config.type === 'rings' && (
                  <div className="space-y-3">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black tracking-wider uppercase text-white/90 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTheme.accent }} />
                          ⚡ CALYXO RINGS
                        </span>
                      </div>
                      {config.showStreak && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase flex items-center gap-0.5">
                          🔥 {streak}d
                        </span>
                      )}
                    </div>

                    {/* Widget Layout Variants based on Size */}
                    {config.size === 'small' ? (
                      /* Concentric 4 Rings + Stats List */
                      <div className="flex items-center gap-3 py-1">
                        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                          {renderSvgRing(calPct, activeTheme.ringColors.cal, 40, 5)}
                          {renderSvgRing(stepPct, activeTheme.ringColors.steps, 31, 4.5)}
                          {renderSvgRing(waterPct, activeTheme.ringColors.water, 23, 4)}
                          {renderSvgRing(protPct, activeTheme.ringColors.prot, 15, 3.5)}
                        </div>

                        <div className="flex-1 space-y-1 text-left">
                          {quadRings.map(r => (
                            <div key={r.id} className="flex items-center justify-between text-[9px] font-bold">
                              <span className="flex items-center gap-1" style={{ color: r.color }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                                {r.short}
                              </span>
                              <span className="text-white/90">
                                {r.val.toLocaleString()} {r.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : config.size === 'lockscreen' ? (
                      /* Minimal Lockscreen Accessory */
                      <div className="flex items-center justify-around py-2">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          {renderSvgRing(calPct, '#ffffff', 28, 3.5, false)}
                          {renderSvgRing(stepPct, '#ffffff', 21, 3, false)}
                          {renderSvgRing(waterPct, '#ffffff', 14, 2.5, false)}
                          <Footprints className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="space-y-0.5 text-left">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">⚡ CALYXO</span>
                          <span className="text-sm font-black text-white block">{liveSteps.toLocaleString()} steps</span>
                          <span className="text-[9px] text-white/60 font-bold block">{totalCal} / {calTarget} kcal</span>
                        </div>
                      </div>
                    ) : (
                      /* Medium & Large: 4 Side-by-Side Glowing Rings */
                      <div className="grid grid-cols-4 gap-2 pt-1 pb-1">
                        {quadRings.map(ring => {
                          const Icon = ring.icon;
                          return (
                            <div 
                              key={ring.id} 
                              className="flex flex-col items-center space-y-1.5 group/ring cursor-pointer"
                              title={`${ring.label}: ${ring.val} / ${ring.target} ${ring.unit} (${ring.pct}%)`}
                            >
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                {renderSvgRing(ring.pct, ring.color, 22, 4.5)}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                  <span className="text-[10px] sm:text-xs font-black text-white">
                                    {ring.pct}%
                                  </span>
                                </div>
                              </div>

                              <div className="text-center space-y-0.5 w-full">
                                <span className="text-[8px] font-black uppercase tracking-wider block truncate" style={{ color: ring.color }}>
                                  {ring.short}
                                </span>
                                <span className="text-[7.5px] text-zinc-400 font-bold block truncate">
                                  {ring.val.toLocaleString()} {ring.unit}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Large Widget Extra: Quick Status Footer */}
                    {config.size === 'large' && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-zinc-400">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          HealthKit & Sensors Synced
                        </span>
                        <span className="text-white/80">Active Streak: {streak} Days</span>
                      </div>
                    )}

                  </div>
                )}

                {/* 2. STEPS & MOVEMENT PULSE */}
                {config.type === 'steps' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-wider">
                        <Footprints className="w-4 h-4" />
                        👟 CALYXO STEPS
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {stepPct}% GOAL
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-2xl font-black text-white tracking-tight">
                          {liveSteps.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-400 font-bold ml-1">/ {stepTarget.toLocaleString()} steps</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        {(liveSteps * 0.0008).toFixed(1)} km
                      </span>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${Math.min(100, stepPct)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="p-1.5 rounded-xl bg-zinc-900/60 border border-white/5">
                        <span className="text-[8px] text-zinc-400 uppercase font-black block">Calories</span>
                        <span className="text-xs font-black text-amber-400">{Math.round(liveSteps * 0.04)} kcal</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-zinc-900/60 border border-white/5">
                        <span className="text-[8px] text-zinc-400 uppercase font-black block">Active Time</span>
                        <span className="text-xs font-black text-cyan-400">{Math.round(liveSteps / 110)} min</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-zinc-900/60 border border-white/5">
                        <span className="text-[8px] text-zinc-400 uppercase font-black block">Remaining</span>
                        <span className="text-xs font-black text-white">{Math.max(0, stepTarget - liveSteps).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. NUTRITION & MACROS */}
                {config.type === 'nutrition' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                        <Flame className="w-4 h-4" />
                        🔥 CALYXO NUTRITION
                      </span>
                      <span className="text-[9px] font-black text-zinc-400">
                        {Math.max(0, calTarget - totalCal)} kcal left
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{totalCal}</span>
                      <span className="text-xs text-zinc-400 font-bold">/ {calTarget} kcal</span>
                    </div>

                    {/* Macro Split Bar */}
                    <div className="w-full h-2 rounded-full bg-zinc-800 flex overflow-hidden gap-0.5">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, protPct)}%` }} />
                      <div className="h-full bg-yellow-400" style={{ width: '40%' }} />
                      <div className="h-full bg-rose-400" style={{ width: '20%' }} />
                    </div>

                    <div className="flex justify-between text-[9px] font-bold text-zinc-300 pt-1">
                      <span className="text-emerald-400">{totalProt}g / {protTarget}g Protein</span>
                      <span className="text-yellow-400">{totalCarbs}g Carbs</span>
                      <span className="text-rose-400">{totalFat}g Fat</span>
                    </div>
                  </div>
                )}

                {/* 4. HYDRATION FLOW */}
                {config.type === 'hydration' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4" />
                        💧 CALYXO HYDRATION
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                        {waterPct}% GOAL
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{waterIntake}</span>
                      <span className="text-xs text-zinc-400 font-bold">/ {waterTarget} ml</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        style={{ width: `${Math.min(100, waterPct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 pt-1">
                      <span>{Math.max(0, waterTarget - waterIntake)} ml to target</span>
                      <span className="text-amber-400">🔥 Streak Active</span>
                    </div>
                  </div>
                )}

                {/* 5. LIVE WORKOUT */}
                {config.type === 'workout' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-rose-400 flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        🏋️ CALYXO WORKOUT
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black animate-pulse">
                        LIVE
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-white/5 space-y-1">
                      <span className="text-xs font-black text-white block">Hypertrophy Chest & Triceps</span>
                      <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                        <span>Set 3 of 4 • 85 kg</span>
                        <span className="text-emerald-400 font-black">Rest: 00:45</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              {/* === END WIDGET CARD === */}

              <span className="text-[10px] text-white/50 font-bold mt-4 tracking-wide uppercase">
                {deviceFrame === 'ios' ? 'iOS 18 WidgetKit' : deviceFrame === 'android' ? 'Android AppWidget' : 'iOS Lock Screen'} • Real-Time Interactive
              </span>
            </div>

            {/* PHONE DOCK / HOME BAR */}
            <div className="relative z-20 flex justify-center pb-2">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>

          </div>

          {/* PRIMARY CALL TO ACTION: PIN TO HOME SCREEN */}
          <div className="w-full max-w-sm flex gap-2">
            <button
              onClick={handlePinWidget}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              Add Widget to Home Screen
            </button>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-3.5 py-3.5 rounded-2xl bg-surface hover:bg-surface/80 text-muted hover:text-foreground border border-card-border transition-all flex items-center justify-center cursor-pointer"
              title="View step-by-step installation instructions"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* RIGHT: CUSTOMIZATION STUDIO CONTROLS */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 1. WIDGET TYPE PICKER */}
          <div className="p-4 rounded-3xl bg-surface/60 border border-card-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                1. Select Widget Experience
              </span>
              <span className="text-[9px] font-black text-emerald-400 uppercase">
                {WIDGET_TYPES.find(t => t.id === config.type)?.label}
              </span>
            </div>

            <div className="space-y-1.5">
              {WIDGET_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = config.type === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => updateCustomization({ type: type.id })}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-foreground shadow-sm' 
                        : 'bg-surface/40 border-card-border text-muted hover:text-foreground hover:bg-surface/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-emerald-500 text-black' : 'bg-surface text-muted'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block">{type.label}</span>
                        <span className="text-[10px] text-muted block leading-tight">{type.desc}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. WIDGET SIZE PICKER */}
          <div className="p-4 rounded-3xl bg-surface/60 border border-card-border space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
              2. Widget Dimensions & Size
            </span>

            <div className="grid grid-cols-2 gap-2">
              {WIDGET_SIZES.map(size => {
                const isSelected = config.size === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => updateCustomization({ size: size.id })}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-foreground' 
                        : 'bg-surface/40 border-card-border text-muted hover:text-foreground hover:bg-surface/80'
                    }`}
                  >
                    <span className="text-xs font-black block">{size.label}</span>
                    <span className="text-[9.5px] text-muted block truncate">{size.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. THEME & COLOR PALETTE */}
          <div className="p-4 rounded-3xl bg-surface/60 border border-card-border space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              3. Aesthetic Color Grading
            </span>

            <div className="grid grid-cols-3 gap-2">
              {WIDGET_THEMES.map(th => {
                const isSelected = config.theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => updateCustomization({ theme: th.id })}
                    className={`p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center space-y-1.5 ${
                      isSelected 
                        ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm' 
                        : 'bg-surface/40 border-card-border hover:bg-surface/80'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: th.accent }}
                    />
                    <span className="text-[10px] font-black text-foreground truncate w-full">
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. VISUAL TOGGLES */}
          <div className="p-4 rounded-3xl bg-surface/60 border border-card-border space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              4. Display Preferences
            </span>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-surface/50 cursor-pointer">
                <span className="text-xs font-bold text-foreground">Ambient Glow & Lighting</span>
                <input
                  type="checkbox"
                  checked={config.showGlow}
                  onChange={(e) => updateCustomization({ showGlow: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-surface/50 cursor-pointer">
                <span className="text-xs font-bold text-foreground">Daily Streak Badge (🔥)</span>
                <input
                  type="checkbox"
                  checked={config.showStreak}
                  onChange={(e) => updateCustomization({ showStreak: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-surface/50 cursor-pointer">
                <span className="text-xs font-bold text-foreground">Target Metrics & Units</span>
                <input
                  type="checkbox"
                  checked={config.showLabels}
                  onChange={(e) => updateCustomization({ showLabels: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

        </div>

      </div>

      {/* 3. STEP-BY-STEP INTERACTIVE INSTALLATION GUIDE MODAL / EXPANDER */}
      {showGuide && (
        <div className="p-5 rounded-3xl bg-surface border border-emerald-500/30 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex justify-between items-center border-b border-card-border pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                How to Add Calyxo Quad Rings to Your Home Screen
              </h3>
            </div>

            {/* Platform Toggle */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-card-border">
              <button
                onClick={() => setGuidePlatform('ios')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  guidePlatform === 'ios' ? 'bg-emerald-500 text-black' : 'text-muted'
                }`}
              >
                Apple iOS
              </button>
              <button
                onClick={() => setGuidePlatform('android')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  guidePlatform === 'android' ? 'bg-emerald-500 text-black' : 'text-muted'
                }`}
              >
                Android
              </button>
            </div>
          </div>

          {guidePlatform === 'ios' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface/50 border border-card-border space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  1
                </span>
                <h4 className="text-xs font-black text-foreground uppercase">Enter Jiggle Mode</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  Touch and hold any empty area on your iPhone Home Screen until the apps start to jiggle.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/50 border border-card-border space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  2
                </span>
                <h4 className="text-xs font-black text-foreground uppercase">Tap '+' & Search</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  Tap the <strong className="text-foreground">+</strong> button in the top left corner, then search for <strong className="text-emerald-400">Calyxo</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/50 border border-card-border space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  3
                </span>
                <h4 className="text-xs font-black text-foreground uppercase">Choose & Add</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  Swipe to choose <strong className="text-foreground">Daily Rings (4-Ring Quad)</strong> or <strong className="text-foreground">Steps</strong> and tap <strong className="text-emerald-400">Add Widget</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface/50 border border-card-border space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  1
                </span>
                <h4 className="text-xs font-black text-foreground uppercase">Long-Press Home Screen</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  Touch and hold any empty space on your Android Home Screen, then tap <strong className="text-foreground">Widgets</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/50 border border-card-border space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  2
                </span>
                <h4 className="text-xs font-black text-foreground uppercase">Find Calyxo</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  Scroll down the widget list to <strong className="text-emerald-400">Calyxo</strong> and select the 4-Ring Activity widget.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface/50 border border-card-border space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                  3
                </span>
                <h4 className="text-xs font-black text-foreground uppercase">Drag & Place</h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  Drag the widget to your desired spot on your screen and release. You can resize it anytime!
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowGuide(false)}
              className="px-4 py-2 rounded-xl bg-surface border border-card-border text-xs font-bold text-muted hover:text-foreground cursor-pointer"
            >
              Close Guide
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
