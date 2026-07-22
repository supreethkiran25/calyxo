"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getWaterIntake, saveWaterIntake, getUserProfile, getUserConnection, getUserAssignments } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { syncAIHealthTwin } from '../lib/aiEcosystemService';
import { calculateMacroTargets } from '../utils/macroCalculator';
import { Flame, Droplets, Activity, Dumbbell, Utensils, Star, Sparkles, ChevronRight, Award, Zap, Brain, Moon, BookOpen, Bot, TrendingUp, PieChart } from 'lucide-react';
import ThreeHealthCore from './ThreeHealthCore';

// ── Calorie donut ring ──────────────────────────────────────────
function CalorieRing({ consumed, burned, goal }) {
  const remaining = Math.max(goal - consumed + burned, 0);
  const pct = Math.min(consumed / Math.max(goal, 1), 1);
  const burnPct = Math.min(burned / Math.max(goal, 1), 0.3);

  const r = 80;
  const circ = 2 * Math.PI * r;
  const consumedOffset = circ - pct * circ;
  const burnOffset = circ - burnPct * circ;

  return (
    <div className="flex flex-col items-center gap-5 py-4 w-full">
      <div className="flex justify-around w-full max-w-sm mb-2">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-black text-acid-green">{consumed.toLocaleString()}</div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Consumed</div>
          <div className="text-[9px] text-muted mt-0.5 font-medium">kcal</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-black text-orange">{burned.toLocaleString()}</div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Burned</div>
          <div className="text-[9px] text-muted mt-0.5 font-medium">kcal</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-black text-foreground">{remaining.toLocaleString()}</div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Remaining</div>
          <div className="text-[9px] text-muted mt-0.5 font-medium">kcal</div>
        </div>
      </div>

      <div className="relative w-40 h-40">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--card-border)" strokeWidth="12" />
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke="var(--accent)" strokeWidth="12"
            strokeDasharray={circ}
            strokeDashoffset={consumedOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke="var(--orange-theme)" strokeWidth="12"
            strokeDasharray={circ}
            strokeDashoffset={circ - burnPct * circ}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: '100px 100px',
              transform: `rotate(${pct * 360}deg)`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-black text-foreground leading-none">
            {remaining.toLocaleString()}
          </div>
          <div className="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">kcal left</div>
        </div>
      </div>
    </div>
  );
}

// ── Macro progress bar ─────────────────────────────────────────
function MacroBar({ label, current, total, color }) {
  const pct = Math.min(current / Math.max(total, 1), 1) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="font-bold text-foreground">{label}</span>
        <span className="text-muted font-semibold">
          {Math.round(current)} / {total}g
        </span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden border border-card-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h3>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-xs font-bold text-acid-green hover:underline background-none border-none cursor-pointer p-0"
        >
          See All
        </button>
      )}
    </div>
  );
}

export default function Dashboard({ onNotification }) {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const foodLogs = useStore(state => state.foodLogs);
  const workoutLogs = useStore(state => state.workoutLogs);
  const waterIntake = useStore(state => state.waterIntake);
  const userProfile = useStore(state => state.userProfile);
  const setWaterIntake = useStore(state => state.setWaterIntake);
  const addWaterIntakeStore = useStore(state => state.addWaterIntake);
  const setUserProfile = useStore(state => state.setUserProfile);
  
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  const [units, setUnits] = useState('metric');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');
  const [showAllBiometrics, setShowAllBiometrics] = useState(false);

  const [metrics, setMetrics] = useState({
    bmi: 22.8, bmr: 1653, tdee: 2562, calorieGoal: 2062,
    bodyType: 'Mesomorph', bmiStatus: 'Normal Weight',
    macros: { protein: 140, carbs: 210, fat: 57 }
  });

  const [connection, setConnection] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setUserProfile(profile);
          setGender(profile.gender || 'male');
          setAge(profile.age || 25);
          setActivity(profile.activity || 1.55);
          setGoal(profile.goal || 'lose');
          setUnits(profile.units || 'metric');
          setWeight(profile.weight || 70);
          setHeight(profile.height || 175);
        }
        const savedWater = await getWaterIntake(userId);
        setWaterIntake(savedWater || 0);

        // Fetch AI Health Twin (Background sync)
        syncAIHealthTwin();
      } catch (err) {
        console.error("Dashboard profile/water loading error", err);
        if (onNotification) onNotification("Error loading profile or water intake logs. Please reload.");
      }
    };
    load();
  }, [userId, setUserProfile, setWaterIntake, onNotification]);

  const recalculateMetrics = useCallback(() => {
    const computed = calculateMacroTargets({
      weight,
      height,
      age,
      gender,
      activity,
      goal,
      units
    });

    setMetrics({ 
      bmi: computed.bmi, 
      bmr: computed.bmr, 
      tdee: computed.tdee, 
      calorieGoal: computed.calorieGoal, 
      bodyType: computed.bodyType, 
      bmiStatus: computed.bmiStatus, 
      macros: computed.targetMacros 
    });
  }, [gender, age, weight, height, activity, goal, units]);

  useEffect(() => { 
    setTimeout(() => {
      recalculateMetrics(); 
    }, 0);
  }, [recalculateMetrics]);

  const handleAddWater = async (amount) => {
    const prevWater = useStore.getState().waterIntake;
    addWaterIntakeStore(amount);
    const next = useStore.getState().waterIntake;
    try {
      await saveWaterIntake(userId, next);
      if (onNotification) onNotification(`+${amount}ml water logged 💧`);
    } catch (err) {
      console.error("Add water database write failure", err);
      setWaterIntake(prevWater); // Rollback
      if (onNotification) onNotification("Failed to save water log. Please try again.");
    }
  };

  const handleResetWater = async () => {
    const prevWater = useStore.getState().waterIntake;
    setWaterIntake(0);
    try {
      await saveWaterIntake(userId, 0);
      if (onNotification) onNotification("Water hydration reset");
    } catch (err) {
      console.error("Reset water database write failure", err);
      setWaterIntake(prevWater); // Rollback
      if (onNotification) onNotification("Failed to reset water log. Please try again.");
    }
  };

  // Helper to check if a timestamp is today (12am to 12am)
  const isToday = (timestamp) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const todaysFoodLogs = foodLogs.filter(x => isToday(x.timestamp));
  const todaysWorkoutLogs = workoutLogs.filter(x => isToday(x.timestamp));

  // Consumed aggregates (resets after 24 hours)
  const totalCal = todaysFoodLogs.reduce((s, x) => s + x.calories, 0);
  const totalProt = todaysFoodLogs.reduce((s, x) => s + (x.protein || 0), 0);
  const totalCarb = todaysFoodLogs.reduce((s, x) => s + (x.carbs || 0), 0);
  const totalFat = todaysFoodLogs.reduce((s, x) => s + (x.fat || 0), 0);

  // Estimated burned from workouts
  const totalBurned = todaysWorkoutLogs.reduce((s, x) => s + (x.caloriesBurned || 0), 0);

  // Recent meals (last 4 today)
  const recentMeals = [...todaysFoodLogs].reverse().slice(0, 4);

  // Recent workouts (last 3 today)
  const recentWorkouts = [...todaysWorkoutLogs].reverse().slice(0, 3);

  // Water hydration percentage
  const waterGoal = 3000;
  const waterPct = Math.min((waterIntake / waterGoal) * 100, 100);

  const getSetupChecklist = () => {
    return [
      { key: 'name', label: 'Display Name', done: !!(userProfile.firstName || userProfile.nickname || user?.displayName) },
      { key: 'biometrics', label: 'Height & Weight', done: !!(userProfile.weight && userProfile.height) },
      { key: 'targetWeight', label: 'Target Weight', done: !!(userProfile.goalWeight || userProfile.weightGoal) },
      { key: 'calories', label: 'Calorie Target', done: !!(userProfile.dailyCalories || userProfile.calorieGoal) },
      { key: 'diet', label: 'Diet Preferences', done: !!(userProfile.dietPreferences && userProfile.dietPreferences.length > 0) },
      { key: 'photo', label: 'Profile Photo', done: !!userProfile.photoURL }
    ];
  };

  const setupChecklist = getSetupChecklist();
  const completedCount = setupChecklist.filter(x => x.done).length;
  const profileCompleteness = Math.round((completedCount / setupChecklist.length) * 100);
  const pendingItems = setupChecklist.filter(x => !x.done).map(x => x.label);

  const QUICK_ACCESS = [
    { label: 'Workout', icon: <Dumbbell className="w-5 h-5 text-foreground" />, action: () => navigate('/user/workout') },
    { label: 'Nutrition', icon: <BookOpen className="w-5 h-5 text-foreground" />, action: () => navigate('/user/nutrition') },
    { label: 'AI Coach', icon: <Bot className="w-5 h-5 text-[var(--color-acid-green)]" />, action: () => navigate('/user/ai'), isPrimary: true },
    { label: 'Progress', icon: <TrendingUp className="w-5 h-5 text-foreground" />, action: () => navigate('/user/progress') },
    { label: 'Water', icon: <Droplets className="w-5 h-5 text-blue-400" />, action: () => document.getElementById('water-logger-section')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Analytics', icon: <PieChart className="w-5 h-5 text-foreground" />, action: () => navigate('/user/progress') }
  ];

  return (
    <div className="space-y-6 w-full select-text pb-20">
      
      {/* Welcome Greeting Header with Level & XP */}
      <div className="flex flex-col gap-3 border-b border-card-border pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight">
              Welcome back, {userProfile.nickname || user?.displayName || 'Athlete'}!
            </h1>
            <p className="text-xs text-muted font-medium mt-0.5 hidden sm:block">Your personalized health operating system is running optimally.</p>
          </div>
          {/* Compact XP badge */}
          <div className="shrink-0 flex items-center gap-1.5 bg-acid-green/10 border border-acid-green/20 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-black text-acid-green uppercase tracking-wider">LVL {ecoStore.level || 1}</span>
            <span className="text-[10px] text-muted font-bold">· {ecoStore.xp || 0} XP</span>
          </div>
        </div>
        {/* XP bar — full width below on mobile */}
        <div className="w-full">
          <div className="flex justify-between text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
            <span>XP Progress</span>
            <span>{(ecoStore.xp || 0)} / {((ecoStore.level || 1) * 1000)} XP</span>
          </div>
          <div className="h-1.5 bg-card-border rounded-full overflow-hidden">
            <div
              className="h-full bg-acid-green rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((ecoStore.xp || 0) / ((ecoStore.level || 1) * 1000)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
      {/* Profile Completeness Alert banner */}
      {profileCompleteness < 100 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-acid-green/10 border border-acid-green/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-acid-green/20 flex items-center justify-center text-acid-green text-lg shrink-0 mt-0.5">
              ⚡
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">
                  Complete Profile Setup ({profileCompleteness}%)
                </span>
                <span className="text-[9px] font-extrabold uppercase bg-acid-green/20 text-acid-green px-2 py-0.5 rounded-full border border-acid-green/30">
                  {completedCount}/{setupChecklist.length} Setup
                </span>
              </div>
              
              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-foreground">Required to unlock personalized AI targets:</strong> {pendingItems.length > 0 ? pendingItems.join(', ') : 'All fields ready!'}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {setupChecklist.map((item, idx) => (
                  <span
                    key={idx}
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                      item.done
                        ? 'bg-acid-green/10 border-acid-green/30 text-acid-green'
                        : 'bg-surface border-card-border text-muted-foreground'
                    }`}
                  >
                    {item.done ? '✓' : '+'} {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/user/profile')}
            className="w-full sm:w-auto text-xs font-black text-accent-foreground bg-acid-green hover:shadow-lg hover:shadow-acid-green/20 px-5 py-2.5 rounded-xl uppercase tracking-widest cursor-pointer border-none shrink-0 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Finish Setup</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ── Streaks Counters Row — horizontal scroll on mobile ── */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Login Streak', value: ecoStore.streaks.loginStreak, icon: <Flame className="w-5 h-5 text-orange" />, color: 'from-orange/20 to-red-500/10' },
          { label: 'Workout Streak', value: ecoStore.streaks.workoutStreak, icon: <Dumbbell className="w-5 h-5 text-acid-green" />, color: 'from-acid-green/20 to-emerald-500/10' },
          { label: 'Nutrition Streak', value: ecoStore.streaks.nutritionStreak, icon: <Utensils className="w-5 h-5 text-yellow-500" />, color: 'from-yellow-500/20 to-amber-500/10' },
          { label: 'Water Streak', value: ecoStore.streaks.waterStreak, icon: <Droplets className="w-5 h-5 text-blue-400" />, color: 'from-blue-400/20 to-sky-500/10' }
        ].map((s, idx) => (
          <div key={idx} className={`glass bg-gradient-to-br ${s.color} border border-card-border rounded-2xl p-4 flex items-center justify-between shadow-xs shrink-0 w-40 sm:w-auto`}>
            <div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{s.label}</span>
              <span className="text-xl font-black text-foreground mt-1 block">{s.value} <span className="text-xs text-muted font-bold">days</span></span>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/25 flex items-center justify-center border border-card-border shadow-inner">
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Access Cards Grid (Mobile Priority) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
        {QUICK_ACCESS.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer outline-none ${
              item.isPrimary 
                ? 'bg-[var(--color-acid-green)]/10 border-[var(--color-acid-green)]/30 hover:bg-[var(--color-acid-green)]/20' 
                : 'bg-surface border-card-border hover:bg-[var(--card-border)]/50 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${item.isPrimary ? 'bg-[var(--color-acid-green)]/20 shadow-inner' : 'bg-black/20'}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
      
      {/* Immersive Health Core Ring */}
      <ThreeHealthCore />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
        
        {/* AI Health Twin Widget */}
        <div className="glass p-4 sm:p-6 rounded-2xl border border-card-border shadow-md flex flex-col justify-between h-full min-h-[340px]">
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-acid-green animate-pulse" />
              AI Health Twin
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 py-2">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" 
                    stroke="var(--accent)" strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - ((ecoStore.healthTwin?.dailyHealthScore || ecoStore.fitnessScore.dailyScore) / 100) * (2 * Math.PI * 40)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-foreground">{ecoStore.healthTwin?.dailyHealthScore || ecoStore.fitnessScore.dailyScore}</span>
                  <span className="text-[7px] text-muted font-bold uppercase tracking-widest">Health Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 flex-1 w-full text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-[9px] text-muted font-bold uppercase tracking-wider"><Activity className="w-3 h-3 text-acid-green"/> Fitness Age</div>
                  <div className="text-sm font-black text-foreground">{ecoStore.healthTwin?.fitnessAge || userProfile?.age || 25} yrs</div>
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-[9px] text-muted font-bold uppercase tracking-wider"><Zap className="w-3 h-3 text-orange"/> Recovery</div>
                  <div className="text-sm font-black text-foreground">{ecoStore.healthTwin?.recoveryScore || 85}%</div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-[9px] text-muted font-bold uppercase tracking-wider"><Moon className="w-3 h-3 text-blue-400"/> Sleep Debt</div>
                  <div className="text-sm font-black text-foreground">{ecoStore.healthTwin?.sleepDebt || 0} hrs</div>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-card-border pt-3 space-y-2">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">AI Insights & Forecast:</span>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                <div className="flex gap-2 items-start text-xs font-semibold text-foreground">
                  <span className="text-acid-green font-bold"><Brain className="w-3 h-3 mt-0.5" /></span>
                  <span className="text-muted">{ecoStore.healthTwin?.weeklyHealthForecast || "Gathering data for your weekly forecast..."}</span>
                </div>
                {(ecoStore.healthTwin?.personalizedRecommendations || ecoStore.fitnessScore.recommendations)?.map((rec, i) => (
                  <div key={i} className="flex gap-2 items-start text-xs font-semibold text-foreground">
                    <span className="text-acid-green font-bold">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Daily Intelligence Card */}
        <div className="glass p-4 sm:p-6 rounded-2xl border border-[var(--card-border)] shadow-md flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <SectionHeader title="AI Daily Intelligence" />
            <div className="space-y-3 mt-4">
              <div className="p-3.5 bg-surface/80 rounded-xl border border-card-border flex items-start gap-3">
                <div className="p-2 bg-acid-green/10 text-acid-green rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground">Metabolic Target</div>
                  <p className="text-[11px] text-muted font-medium mt-0.5 leading-snug">
                    Your daily calorie deficit target is set for optimal fat oxidation. Hydrate consistently today.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-surface/80 rounded-xl border border-card-border flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground">Recovery & Readiness</div>
                  <p className="text-[11px] text-muted font-medium mt-0.5 leading-snug">
                    Muscle recovery score is 92%. Excellent condition for upper body power or HIIT training.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/user/ai')}
            className="w-full py-2.5 mt-4 bg-acid-green/10 hover:bg-acid-green/20 text-acid-green border border-acid-green/30 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Open AI Workspace →
          </button>
        </div>

        {/* ── Today's Summary Card (Spans 2 columns on desktop) ── */}
        <div className="glass p-4 sm:p-6 rounded-2xl border border-[var(--card-border)] md:col-span-2 flex flex-col justify-between h-full shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Today&apos;s Nutrition Summary</h2>
              <button 
                onClick={() => navigate('/user/nutrition')}
                className="p-1.5 rounded-lg bg-surface border border-card-border text-[var(--text-muted)] hover:text-foreground cursor-pointer"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>

          <CalorieRing consumed={totalCal} burned={totalBurned} goal={metrics.calorieGoal} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-card-border pt-4 mt-2">
            <MacroBar label="Protein" current={totalProt} total={metrics.macros.protein} color="var(--accent)" />
            <MacroBar label="Carbs" current={totalCarb} total={metrics.macros.carbs} color="var(--orange-theme)" />
            <MacroBar label="Fats" current={totalFat} total={metrics.macros.fat} color="var(--destructive)" />
          </div>
        </div>

        {/* Daily Hydration Logger */}
        <div id="water-logger-section" className="glass p-4 sm:p-6 rounded-2xl border border-card-border shadow-md flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              Water Intake Log
            </h3>
            
            <div className="flex gap-4 items-center mb-4">
              <div className="relative w-16 h-36 border-2 border-cyan-400/40 bg-black/40 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)] flex flex-col justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${waterPct}%` }}
                  transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-full relative bg-gradient-to-t from-blue-700 via-cyan-500 to-cyan-400"
                >
                  <div className="absolute -top-2 left-0 w-[200%] h-4 bg-cyan-300/50 rounded-[40%] animate-liquid-wave-1 pointer-events-none" />
                  <div className="absolute bottom-1 left-3 w-1.5 h-1.5 rounded-full bg-white/60 animate-bubble-1" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center text-center font-black text-xs text-white drop-shadow-md select-none z-10">
                  {Math.round(waterPct)}%
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-2xl font-black text-[var(--blue-theme)] leading-none">
                    {waterIntake.toLocaleString()}
                    <span className="text-xs text-muted font-bold ml-1.5">ml</span>
                  </div>
                  <div className="text-[9px] text-muted font-bold uppercase tracking-wider mt-1.5">Target: 3,000 ml</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[250, 500].map(ml => (
                    <button
                      key={ml}
                      onClick={() => handleAddWater(ml)}
                      className="w-full py-2 bg-surface border border-card-border rounded-xl text-xs font-bold text-foreground hover:border-[var(--blue-theme)] hover:bg-[var(--blue-theme)]/5 transition-all cursor-pointer"
                    >
                      +{ml}ml
                    </button>
                  ))}
                  <button 
                    onClick={handleResetWater}
                    className="w-full py-2 bg-surface border border-card-border rounded-xl text-[10px] uppercase font-bold text-muted hover:border-destructive hover:bg-destructive/5 transition-all cursor-pointer col-span-2"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Workouts Card ── */}
        <div className="glass p-4 sm:p-6 rounded-2xl border border-[var(--card-border)] shadow-md flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <SectionHeader title="Recent Workouts" onSeeAll={() => navigate('/user/workout')} />
            
            <div className="space-y-3">
              {recentWorkouts.length === 0 ? (
                <div className="text-center py-10">
                  <Dumbbell className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted font-semibold">No workouts logged today</p>
                </div>
              ) : recentWorkouts.map((w, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-card-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-acid-green)]/10 border border-[var(--color-acid-green)]/20 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-[var(--color-acid-green)]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground truncate max-w-[120px]">{w.name || 'Workout'}</div>
                      <div className="text-[10px] text-muted font-medium mt-0.5">
                        {w.category === 'Cardio' ? `${w.duration} mins` : `${w.sets} sets × ${w.reps} reps`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Meals Card ── */}
        <div className="glass p-4 sm:p-6 rounded-2xl border border-[var(--card-border)] shadow-md flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <SectionHeader title="Recent Meals" onSeeAll={() => navigate('/user/nutrition')} />
            
            <div className="space-y-3">
              {recentMeals.length === 0 ? (
                <div className="text-center py-10">
                  <Utensils className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted font-semibold">No meals logged today</p>
                </div>
              ) : recentMeals.map((m, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-card-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center text-lg">
                      🍽️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground truncate max-w-[110px]">{m.name}</div>
                      <div className="text-[10px] text-muted font-medium mt-0.5">
                        {m.protein?.toFixed(0)}g P · {m.carbs?.toFixed(0)}g C
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground">{m.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Biometrics Quick Stats Card ── */}
        <div className="glass rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-md md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center px-6 py-4 border-b border-card-border">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--color-acid-green)] animate-pulse" />
              Biometric Summary Indices
            </h3>
            <button
              onClick={() => navigate('/user/profile')}
              className="text-xs font-bold text-[var(--color-acid-green)] hover:underline background-none border-none cursor-pointer p-0"
            >
              Adjust Biometrics
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-card-border">
            {[
              { label: 'Body Mass Index', value: metrics.bmi, sub: metrics.bmiStatus, key: 0 },
              { label: 'Basal Metabolic Rate', value: `${metrics.bmr.toLocaleString()} kcal`, sub: 'BMR (Rest energy)', key: 1 },
              { label: 'Total Energy Expenditure', value: `${metrics.tdee.toLocaleString()} kcal`, sub: 'TDEE (Active energy)', key: 2 },
              { label: 'Intake Target', value: `${metrics.calorieGoal.toLocaleString()} kcal`, sub: 'Calculated diet plan', green: true, key: 3 },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`p-4 bg-[var(--card-bg)] flex flex-col justify-between min-h-[100px] ${
                  (stat.key === 1 || stat.key === 2) && !showAllBiometrics ? 'hidden md:flex' : 'flex'
                }`}
              >
                <span className="text-[9px] text-muted font-bold uppercase tracking-wider leading-tight">{stat.label}</span>
                <span className={`text-base font-black block mt-2 ${stat.green ? 'text-[var(--color-acid-green)]' : 'text-foreground'}`}>
                  {stat.value}
                </span>
                <span className="text-[10px] text-muted block mt-1 font-medium">{stat.sub}</span>
              </div>
            ))}
          </div>
          
          <div className="md:hidden flex justify-center border-t border-card-border p-2 bg-surface">
            <button
              onClick={() => setShowAllBiometrics(!showAllBiometrics)}
              className="text-[10px] font-black text-acid-green uppercase tracking-wider bg-transparent border-none cursor-pointer p-1"
            >
              {showAllBiometrics ? 'View Less ▲' : 'View More ▼'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
