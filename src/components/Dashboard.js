import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import useQuickActionsStore from '../store/useQuickActionsStore';
import { saveWaterIntake } from '../lib/dbService';
import { isToday } from '../utils/dateUtils';
import { liveWorkoutEngine } from '../services/liveWorkout/LiveWorkoutStateMachine';
import {
  Dumbbell, Droplets, Utensils, Sparkles, TrendingUp,
  Play, Plus, ArrowRight, CheckCircle2, ChevronRight, Clock, Flame, ShieldAlert
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatGoal(goal) {
  if (!goal) return 'Build Muscle';
  const clean = String(goal).toLowerCase().replace(/_/g, ' ');
  if (clean.includes('gain') || clean.includes('muscle') || clean.includes('hypertrophy')) return 'Build Muscle';
  if (clean.includes('fat') || clean.includes('lose') || clean.includes('cut')) return 'Fat Loss';
  if (clean.includes('strength') || clean.includes('power')) return 'Strength Focus';
  if (clean.includes('fitness') || clean.includes('endurance')) return 'Cardio & Fitness';
  return 'Health & Longevity';
}

const DEFAULT_SPLITS = [
  { day: 'Monday', name: 'Push — Chest + Shoulders', duration: '45–60 min', movements: 'Incline Bench, DB Press, Lateral Raises, Tricep Dips' },
  { day: 'Tuesday', name: 'Pull — Back + Biceps', duration: '45–55 min', movements: 'Lat Pulldowns, Barbell Rows, Hammer Curls, Face Pulls' },
  { day: 'Wednesday', name: 'Legs — Quads + Calves', duration: '50–60 min', movements: 'Back Squats, Leg Press, Romanian Deadlifts, Calf Raises' },
  { day: 'Thursday', name: 'Active Recovery & Core', duration: '30–40 min', movements: 'Planks, Hanging Knee Raises, Mobility Flow, Zone 2 Walk' },
  { day: 'Friday', name: 'Upper Body Power', duration: '50–60 min', movements: 'Heavy DB Press, Weighted Pull-ups, Overhead Press, Skullcrushers' },
  { day: 'Saturday', name: 'Lower Body & Posterior', duration: '45–55 min', movements: 'Deadlifts, Hamstring Curls, Walking Lunges, Ab Wheel' },
  { day: 'Sunday', name: 'Rest & Regeneration', duration: '25–35 min', movements: 'Full Body Mobility, Stretching, Hydration Protocol' }
];

export default function Dashboard({ onNotification }) {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs || []);
  const workoutLogs = useStore(state => state.workoutLogs || []);
  const waterIntake = useStore(state => state.waterIntake || 0);
  const setWaterIntake = useStore(state => state.setWaterIntake);
  const addWaterIntakeStore = useStore(state => state.addWaterIntake);
  const streaks = useEcosystemStore(state => state.streaks);
  const openWorkflow = useQuickActionsStore(state => state.openWorkflow);

  const userId = user?.uid || user?.id;
  const userName = userProfile?.nickname || userProfile?.firstName || user?.displayName?.split(' ')[0] || 'Athlete';
  const currentGoal = formatGoal(userProfile?.goal);

  // Caloric & Macro Targets
  const targetCalories = Number(userProfile?.dailyCalories || userProfile?.calorieGoal || 2650);
  const targetProtein = Number(userProfile?.proteinTarget || userProfile?.proteinGoal || 150);
  const targetCarbs = Number(userProfile?.carbsTarget || userProfile?.carbsGoal || 300);
  const targetFat = Number(userProfile?.fatTarget || userProfile?.fatGoal || 75);
  const targetWater = Number(userProfile?.waterGoal || userProfile?.waterTarget || 3000);

  // Active workout engine telemetry
  const [engineState, setEngineState] = useState(() => liveWorkoutEngine.getStateSnapshot());
  useEffect(() => {
    const unsub = liveWorkoutEngine.subscribe(snap => setEngineState(snap));
    return () => unsub();
  }, []);

  // Filter today's activity
  const todaysFoodLogs = useMemo(() => foodLogs.filter(x => isToday(x.timestamp)), [foodLogs]);
  const todaysWorkoutLogs = useMemo(() => workoutLogs.filter(x => isToday(x.timestamp)), [workoutLogs]);

  const totalCalories = useMemo(() => todaysFoodLogs.reduce((s, x) => s + (Number(x.calories) || 0), 0), [todaysFoodLogs]);
  const totalProtein = useMemo(() => Math.round(todaysFoodLogs.reduce((s, x) => s + (Number(x.protein) || 0), 0)), [todaysFoodLogs]);
  const totalCarbs = useMemo(() => Math.round(todaysFoodLogs.reduce((s, x) => s + (Number(x.carbs) || 0), 0)), [todaysFoodLogs]);
  const totalFat = useMemo(() => Math.round(todaysFoodLogs.reduce((s, x) => s + (Number(x.fat) || 0), 0)), [todaysFoodLogs]);

  // Scheduled split for current day
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysScheduledWorkout = useMemo(() => {
    const matched = DEFAULT_SPLITS.find(s => s.day.toLowerCase() === dayOfWeek.toLowerCase());
    return matched || DEFAULT_SPLITS[0];
  }, [dayOfWeek]);

  const completedTodayWorkout = todaysWorkoutLogs[0] || null;

  // Haptics helper
  const triggerHaptic = useCallback(async (style = ImpactStyle.Light) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style });
      }
    } catch (e) {}
  }, []);

  const handleAddWater = async (amountMl) => {
    triggerHaptic(ImpactStyle.Medium);
    const prev = waterIntake;
    addWaterIntakeStore(amountMl);
    const next = prev + amountMl;
    try {
      if (userId) await saveWaterIntake(userId, next);
      if (onNotification) onNotification(`+${amountMl}ml logged (${(next / 1000).toFixed(1)}L total)`);
    } catch (err) {
      setWaterIntake(prev);
    }
  };

  const handleStartWorkout = () => {
    triggerHaptic(ImpactStyle.Heavy);
    useQuickActionsStore.getState().setActiveWorkflow('start_live_session');
    navigate('/user/workout');
  };

  // Grounded contextual AI insight
  const aiRecommendation = useMemo(() => {
    if (completedTodayWorkout) {
      const remainingP = Math.max(0, targetProtein - totalProtein);
      if (remainingP > 20) {
        return `Workout logged! Prioritize ${remainingP}g more protein tonight to maximize muscle protein synthesis and recovery.`;
      }
      return `Outstanding effort today. Hydrate with at least ${(Math.max(0, targetWater - waterIntake) / 1000).toFixed(1)}L water and aim for 8 hours of sleep.`;
    }
    const remainingP = Math.max(0, targetProtein - totalProtein);
    if (remainingP > 0) {
      return `Targeting ${todaysScheduledWorkout.name} today. You need ${remainingP}g more protein to hit your anabolic window.`;
    }
    return `Fueling is optimal. You're ready to start ${todaysScheduledWorkout.name}.`;
  }, [completedTodayWorkout, totalProtein, targetProtein, todaysScheduledWorkout, waterIntake, targetWater]);

  const calPercent = Math.min(100, Math.round((totalCalories / Math.max(targetCalories, 1)) * 100));

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* ─── 1. ATHLETE GREETING & CONTEXT HEADER ─── */}
      <header className="flex items-end justify-between border-b border-card-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-accent">
              {currentGoal} · Week 6
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {getGreeting()}, {userName}
          </h1>
        </div>

        {/* Quiet Streak Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-card-border">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-foreground">
            {streaks?.workoutStreak || (workoutLogs.length > 0 ? 1 : 0)}d Streak
          </span>
        </div>
      </header>

      {/* ─── ASYMMETRIC COMMAND GRID (MOBILE STREAM, DESKTOP 2-COLUMN) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PRIMARY EXECUTION COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* ─── PRIMARY DAILY ACTION HERO (THE MOST IMPORTANT THING TODAY) ─── */}
          <section className="rounded-3xl bg-surface border border-card-border p-6 space-y-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-[10px] font-black uppercase tracking-wider font-mono">
                {engineState.isActive ? 'IN PROGRESS' : (completedTodayWorkout ? 'COMPLETED' : 'TODAY’S FOCUS')}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono font-medium">
                <Clock className="w-3.5 h-3.5" />
                {todaysScheduledWorkout.duration}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                {completedTodayWorkout ? (completedTodayWorkout.title || completedTodayWorkout.name) : todaysScheduledWorkout.name}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                {completedTodayWorkout
                  ? `${completedTodayWorkout.duration || 45} min · ${completedTodayWorkout.calories || 320} kcal burned · Logged ✓`
                  : todaysScheduledWorkout.movements}
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              {engineState.isActive ? (
                <button
                  onClick={() => navigate('/user/workout')}
                  className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-foreground font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border-none shadow-md shadow-accent/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Resume Workout ({Math.floor(engineState.elapsedWorkoutSeconds / 60)}m elapsed)
                </button>
              ) : completedTodayWorkout ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/user/workout')}
                    className="flex-1 min-h-[48px] rounded-2xl bg-surface-elevated text-foreground border border-card-border font-bold text-xs uppercase tracking-wider hover:bg-surface-interactive transition-all cursor-pointer"
                  >
                    View Summary
                  </button>
                  <button
                    onClick={handleStartWorkout}
                    className="min-h-[48px] px-5 rounded-2xl bg-surface-subtle border border-card-border text-muted-foreground hover:text-foreground font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Train Again
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartWorkout}
                  className="w-full min-h-[52px] rounded-2xl bg-accent text-accent-foreground font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border-none shadow-md shadow-accent/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Workout
                </button>
              )}
            </div>
          </section>

          {/* ─── DAILY HEALTH STATE (UNIFIED CONTINUOUS SURFACE) ─── */}
          <section className="rounded-3xl bg-surface border border-card-border p-6 space-y-6 shadow-sm">
            
            {/* Top Row: Calories & Macro Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest font-bold text-muted-foreground">
                  Nutrition State
                </span>
                <button
                  onClick={() => openWorkflow('log_meal')}
                  className="text-xs font-bold text-accent hover:text-accent-dim flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food</span>
                </button>
              </div>

              {/* Caloric Intake Readout */}
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground font-mono tracking-tight">
                      {totalCalories.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono">
                      / {targetCalories.toLocaleString()} kcal
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {Math.max(0, targetCalories - totalCalories)} kcal remaining today
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-muted-foreground">
                  {calPercent}%
                </span>
              </div>

              {/* Continuous Macro Meter */}
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-surface-subtle overflow-hidden flex gap-0.5 border border-card-border/50">
                  <div
                    className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalProtein * 4 / Math.max(targetCalories, 1)) * 100)}%` }}
                    title={`Protein: ${totalProtein}g`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalCarbs * 4 / Math.max(targetCalories, 1)) * 100)}%` }}
                    title={`Carbs: ${totalCarbs}g`}
                  />
                  <div
                    className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalFat * 9 / Math.max(targetCalories, 1)) * 100)}%` }}
                    title={`Fat: ${totalFat}g`}
                  />
                </div>

                {/* Macro Detail Columns */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold text-muted-foreground">Protein</span>
                    </div>
                    <div className="text-sm font-black font-mono text-foreground">
                      {totalProtein} <span className="text-xs text-muted-foreground font-normal">/ {targetProtein}g</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-muted-foreground">Carbs</span>
                    </div>
                    <div className="text-sm font-black font-mono text-foreground">
                      {totalCarbs} <span className="text-xs text-muted-foreground font-normal">/ {targetCarbs}g</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-muted-foreground">Fat</span>
                    </div>
                    <div className="text-sm font-black font-mono text-foreground">
                      {totalFat} <span className="text-xs text-muted-foreground font-normal">/ {targetFat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hairline Divider */}
            <div className="border-t border-card-border/60" />

            {/* Bottom Row: Hydration Integration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold text-muted-foreground">
                    Hydration
                  </span>
                </div>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-sm font-black text-foreground">
                    {(waterIntake / 1000).toFixed(1)}L
                  </span>
                  <span className="text-xs text-muted-foreground">
                    / {(targetWater / 1000).toFixed(1)}L
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                {/* 6 Droplet Visual Segments */}
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const isFilled = (waterIntake / targetWater) >= (idx + 1) / 6;
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          isFilled
                            ? 'bg-cyan-400 shadow-xs shadow-cyan-400/50'
                            : 'bg-surface-subtle border border-card-border'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Quick Add Pills */}
                <div className="flex items-center gap-1.5">
                  {[250, 500, 750].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleAddWater(amt)}
                      className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-interactive border border-card-border text-xs font-mono font-bold text-foreground transition-all cursor-pointer active:scale-95"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </section>

        </div>

        {/* RIGHT INTELLIGENCE & CONTEXT COLUMN (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* ─── AI BRIEFING (CONCISE CONTEXTUAL DIRECTIVE) ─── */}
          <div className="rounded-3xl bg-surface border border-card-border p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono uppercase tracking-widest font-bold text-accent">
                  Daily Briefing
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Grounded</span>
            </div>

            <p className="text-sm text-foreground/90 font-medium leading-relaxed">
              &ldquo;{aiRecommendation}&rdquo;
            </p>

            <button
              onClick={() => navigate('/user/ai')}
              className="text-xs font-bold text-accent hover:text-accent-dim flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <span>Consult Calyxo Coach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ─── PROGRESS CONTEXT (ONE MEANINGFUL TREND) ─── */}
          <div
            onClick={() => navigate('/user/progress')}
            className="rounded-3xl bg-surface border border-card-border p-6 space-y-3 hover:border-foreground/30 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-muted-foreground">
                Progress Context
              </span>
              <span className="text-xs font-bold text-accent font-mono px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                +4.2% Strength
              </span>
            </div>

            <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors leading-relaxed">
              Compound pressing and squats are driving this cycle’s progressive overload gains.
            </p>

            <div className="flex items-center justify-between text-xs font-bold text-foreground/80 pt-1">
              <span>View 1RM Progression Curve</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
