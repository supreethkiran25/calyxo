import React, { useState, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getWaterIntake, saveWaterIntake, getUserProfile, saveUserProfile } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import useQuickActionsStore from '../store/useQuickActionsStore';
import { syncAIHealthTwin } from '../lib/aiEcosystemService';
import { calculateMacroTargets, formatNutritionValue } from '../utils/macroCalculator';
import { isToday } from '../utils/dateUtils';
import { calculateWorkoutCaloriesBurned } from '../utils/workoutUtils';
import { HealthCache } from '../services/health/HealthCache';

import { 
  Flame, Droplets, Activity, Dumbbell, Utensils, Sparkles, 
  ChevronRight, Zap, Brain, Moon, BookOpen, Bot, TrendingUp, 
  PieChart, Watch, Plus, ArrowUpRight, RefreshCw, Lightbulb, SlidersHorizontal 
} from 'lucide-react';
import RealisticWaterVessel from './common/RealisticWaterVessel';
import DailyAIBriefingCard from './ai/DailyAIBriefingCard';
import PremiumFeatureModal from './modals/PremiumFeatureModal';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function CalorieRing({ consumed, burned, goal }) {
  const remaining = Math.max(goal - consumed + burned, 0);
  const pct = Math.min(consumed / Math.max(goal, 1), 1);
  const burnPct = Math.min(burned / Math.max(goal, 1), 0.3);

  const r = 80;
  const circ = 2 * Math.PI * r;
  const consumedOffset = circ - pct * circ;
  const burnOffset = circ - burnPct * circ;

  return (
    <div className="flex flex-col items-center gap-6 py-3 w-full">
      {/* 3 Metric Readouts */}
      <div className="grid grid-cols-3 w-full max-w-sm text-center">
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-black text-accent font-mono leading-none">
            {consumed.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5">
            Consumed
          </span>
          <span className="text-[9px] text-muted-foreground/80 font-medium">kcal</span>
        </div>

        <div className="flex flex-col items-center border-x border-card-border/60">
          <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono leading-none">
            {burned.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5">
            Burned
          </span>
          <span className="text-[9px] text-muted-foreground/80 font-medium">kcal</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-black text-foreground font-mono leading-none">
            {remaining.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5">
            Remaining
          </span>
          <span className="text-[9px] text-muted-foreground/80 font-medium">kcal</span>
        </div>
      </div>

      {/* Center Donut SVG */}
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="14" />
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke="var(--accent)" strokeWidth="14"
            strokeDasharray={circ}
            strokeDashoffset={consumedOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          {burned > 0 && (
            <circle
              cx="100" cy="100" r={r} fill="none"
              stroke="#FB923C" strokeWidth="14"
              strokeDasharray={circ}
              strokeDashoffset={burnOffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                transformOrigin: '100px 100px',
                transform: `rotate(${pct * 360}deg)`
              }}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-foreground font-mono leading-none">
            {remaining.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            kcal left
          </span>
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, current, total, color }) {
  const pct = Math.min(current / Math.max(total, 1), 1) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-foreground">{label}</span>
        <span className="text-muted-foreground font-mono font-bold">
          {formatNutritionValue(current)} / {total}g
        </span>
      </div>

      <div className="h-2 bg-surface-elevated rounded-full overflow-hidden border border-card-border/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
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

  const userId = user?.uid || user?.id;
  const ecoStore = useEcosystemStore();

  const [units, setUnits] = useState('metric');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');
  const [showAllBiometrics, setShowAllBiometrics] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('Daily AI Briefing');
  const [isRecalculating, setIsRecalculating] = useState(false);

  const metrics = useMemo(() => {
    const computed = calculateMacroTargets({
      weight: Number(userProfile?.weight || weight || 70),
      height: Number(userProfile?.height || height || 175),
      age: Number(userProfile?.age || age || 25),
      gender: userProfile?.gender || gender || 'male',
      activity: Number(userProfile?.activity || activity || 1.55),
      goal: userProfile?.goal || goal || 'lose',
      units: userProfile?.units || units || 'metric'
    });
    return {
      bmi: computed.bmi,
      bmr: computed.bmr,
      tdee: computed.tdee,
      calorieGoal: userProfile?.dailyCalories || userProfile?.calorieGoal || computed.calorieGoal,
      bodyType: computed.bodyType,
      bmiStatus: computed.bmiStatus,
      macros: userProfile?.targetMacros || computed.targetMacros || { protein: 140, carbs: 210, fat: 57 }
    };
  }, [gender, age, weight, height, activity, goal, units, userProfile]);

  const handleAutoRecalculateTargets = async () => {
    setIsRecalculating(true);
    try {
      const currentWeight = Number(userProfile?.weight || weight || 70);
      const currentHeight = Number(userProfile?.height || height || 175);
      const currentAge = Number(userProfile?.age || age || 25);
      const currentGender = userProfile?.gender || gender || 'male';
      const currentActivity = Number(userProfile?.activity || activity || 1.55);
      const currentGoal = userProfile?.goal || goal || 'lose';
      const currentUnits = userProfile?.units || units || 'metric';

      const computed = calculateMacroTargets({
        weight: currentWeight,
        height: currentHeight,
        age: currentAge,
        gender: currentGender,
        activity: currentActivity,
        goal: currentGoal,
        units: currentUnits
      });

      const updatedProfile = {
        ...userProfile,
        dailyCalories: computed.calorieGoal,
        calorieGoal: computed.calorieGoal,
        proteinTarget: computed.targetMacros.protein,
        protein: computed.targetMacros.protein,
        carbs: computed.targetMacros.carbs,
        fat: computed.targetMacros.fat,
        targetMacros: computed.targetMacros,
        bmr: computed.bmr,
        tdee: computed.tdee,
        waterTarget: userProfile?.waterTarget || userProfile?.waterGoal || 3000
      };

      setUserProfile(updatedProfile);
      if (typeof window !== 'undefined') {
        localStorage.setItem('calyxo_user_profile', JSON.stringify(updatedProfile));
        window.dispatchEvent(new CustomEvent('calyxo_data_sync', { detail: { profile: updatedProfile } }));
      }
      const validUid = user?.uid || user?.id || userId;
      if (validUid) {
        await saveUserProfile(validUid, updatedProfile).catch(e => console.warn('Save recalculated profile error:', e));
      }

      if (onNotification) {
        onNotification(`⚡ Auto-Recalculated: Daily target set to ${computed.calorieGoal} kcal & ${computed.targetMacros.protein}g protein!`);
      }
    } catch (err) {
      console.warn('Auto recalculate targets error:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      useStore.getState().checkDailyReset();
      if (!userId) return;
      try {
        const storeProfile = useStore.getState().userProfile;
        const hasStoreProfile = Boolean(storeProfile?.onboarded || storeProfile?.firstName || storeProfile?.height !== 175 || storeProfile?.weight !== 70);

        let profile = hasStoreProfile ? storeProfile : null;
        if (!profile) {
          profile = await getUserProfile(userId);
          if (profile) setUserProfile(profile);
        }

        if (profile) {
          setGender(profile.gender || 'male');
          setAge(profile.age || 25);
          setActivity(profile.activity || 1.55);
          setGoal(profile.goal || 'lose');
          setUnits(profile.units || 'metric');
          setWeight(profile.weight || 70);
          setHeight(profile.height || 175);
        }

        const storeWater = useStore.getState().waterIntake;
        const waterLogDate = useStore.getState().waterLogDate;
        const todayStr = new Date().toDateString();
        if (waterLogDate === todayStr && storeWater > 0) {
          // Keep fresh
        } else {
          const savedWater = await getWaterIntake(userId);
          setWaterIntake(savedWater || 0);
        }

        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => syncAIHealthTwin());
        } else {
          setTimeout(() => syncAIHealthTwin(), 300);
        }
      } catch (err) {
        console.error("Dashboard profile/water loading error", err);
      }
    };
    load();
  }, [userId, setUserProfile, setWaterIntake]);

  const handleAddWater = async (amount) => {
    const prevWater = useStore.getState().waterIntake;
    addWaterIntakeStore(amount);
    const next = useStore.getState().waterIntake;
    try {
      await saveWaterIntake(userId, next);
      if (onNotification) onNotification(`+${amount}ml water logged`);
    } catch (err) {
      console.error("Add water database write failure", err);
      setWaterIntake(prevWater);
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
      setWaterIntake(prevWater);
    }
  };

  const todaysFoodLogs = useMemo(() => foodLogs.filter(x => isToday(x.timestamp)), [foodLogs]);
  const todaysWorkoutLogs = useMemo(() => workoutLogs.filter(x => isToday(x.timestamp)), [workoutLogs]);

  const totalCal = useMemo(() => todaysFoodLogs.reduce((s, x) => s + x.calories, 0), [todaysFoodLogs]);
  const totalProt = useMemo(() => todaysFoodLogs.reduce((s, x) => s + (x.protein || 0), 0), [todaysFoodLogs]);
  const totalCarb = useMemo(() => todaysFoodLogs.reduce((s, x) => s + (x.carbs || 0), 0), [todaysFoodLogs]);
  const totalFat = useMemo(() => todaysFoodLogs.reduce((s, x) => s + (x.fat || 0), 0), [todaysFoodLogs]);

  const cachedHealthMetrics = HealthCache.getMetrics() || {};
  const healthActiveBurn = Number(cachedHealthMetrics.activeCalories) || 0;
  const workoutBurn = useMemo(() => todaysWorkoutLogs.reduce((s, x) => s + (Number(x.caloriesBurned) || calculateWorkoutCaloriesBurned(x)), 0), [todaysWorkoutLogs]);
  const totalBurned = Math.max(workoutBurn, healthActiveBurn);
  const totalSteps = Number(cachedHealthMetrics.steps) || 0;

  const recentMeals = useMemo(() => [...todaysFoodLogs].reverse().slice(0, 4), [todaysFoodLogs]);
  const recentWorkouts = useMemo(() => [...todaysWorkoutLogs].reverse().slice(0, 3), [todaysWorkoutLogs]);

  const dynamicHealthTwin = useMemo(() => {
    const rawAge = Number(userProfile?.age);
    const hasProfileAge = Boolean(rawAge && rawAge > 10 && rawAge < 110);
    const userAge = hasProfileAge ? rawAge : (Number(age) || 24);
    const targetCal = Math.max(1, (userProfile?.dailyCalories || userProfile?.calorieGoal || metrics.calorieGoal || 2000));
    const targetProt = Math.max(1, (userProfile?.proteinGoal || metrics.macros?.protein || 130));
    const targetWater = 3000;

    let calScore = Math.max(0, 100 - (Math.abs(targetCal - totalCal) / targetCal) * 100);
    let protScore = Math.min(100, (totalProt / targetProt) * 100);
    let waterScore = Math.min(100, (waterIntake / targetWater) * 100);
    let workoutScore = todaysWorkoutLogs.length > 0 ? 100 : 40;

    const score = Math.round((calScore * 0.3) + (protScore * 0.3) + (waterScore * 0.2) + (workoutScore * 0.2));
    const fitnessAge = Math.max(18, Math.round(userAge - ((score - 50) / 10)));
    const fitnessAgeDelta = userAge - fitnessAge;

    return {
      dailyHealthScore: ecoStore.healthTwin?.dailyHealthScore || score,
      fitnessAge: hasProfileAge ? fitnessAge : `${fitnessAge} (Est.)`,
      fitnessAgeDelta,
      userAge,
      recoveryScore: Math.min(98, Math.max(65, Math.round(score * 0.95))),
      sleepDebt: 0.5
    };
  }, [totalCal, totalProt, waterIntake, todaysWorkoutLogs, userProfile, age, metrics, ecoStore.healthTwin]);

  const setupChecklist = useMemo(() => {
    const prof = userProfile || {};
    return [
      { key: 'display_name', label: 'Name', done: !!(prof.firstName || prof.nickname || user?.displayName) },
      { key: 'height_weight', label: 'Body Metrics', done: !!(prof.weight && prof.height) },
      { key: 'target_weight', label: 'Target Weight', done: !!(prof.goalWeight || prof.weightGoal) },
      { key: 'calorie_target', label: 'Calorie Goal', done: !!(prof.dailyCalories || prof.calorieGoal) }
    ];
  }, [userProfile, user]);

  const completedCount = setupChecklist.filter(x => x.done).length;
  const profileCompleteness = Math.round((completedCount / setupChecklist.length) * 100);

  const targetCalorieBudget = Number(userProfile?.dailyCalories || userProfile?.calorieGoal || metrics?.calorieGoal || 2000);
  const targetStepGoal = Number(userProfile?.stepGoal || userProfile?.dailySteps || 10000);
  const targetWaterMl = Number(userProfile?.waterGoal || userProfile?.waterTarget || 3000);
  const targetProteinG = Number(metrics?.macros?.protein || userProfile?.proteinTarget || 124);

  // Authentically computed fractions (0.0 to 1.0) with ZERO fake fallback data
  const calFraction = targetCalorieBudget > 0 ? Math.min(totalCal / targetCalorieBudget, 1) : 0;
  const calPercent = Math.round(calFraction * 100);

  const stepFraction = targetStepGoal > 0 ? Math.min(totalSteps / targetStepGoal, 1) : 0;
  const stepPercent = Math.round(stepFraction * 100);

  const waterFraction = targetWaterMl > 0 ? Math.min(waterIntake / targetWaterMl, 1) : 0;
  const waterPercent = Math.round(waterFraction * 100);

  const protFraction = targetProteinG > 0 ? Math.min(totalProt / targetProteinG, 1) : 0;
  const protPercent = Math.round(protFraction * 100);

  return (
    <div className="space-y-5 w-full pb-24 select-text">
      {/* Greeting & Header */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
            {getGreeting()}, {userProfile?.nickname || userProfile?.firstName || user?.displayName?.split(' ')[0] || 'Athlete'}
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Small steps, big results.
          </p>
        </div>

        {/* Profile Avatar halo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/user/profile')}
            aria-label="Open Profile"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1.5px] cursor-pointer border-none shadow-sm hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-sm font-bold text-accent overflow-hidden">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (userProfile?.nickname?.[0] || userProfile?.firstName?.[0] || user?.displayName?.[0] || 'A').toUpperCase()
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Setup Prompt Banner (Dismisses once complete) */}
      {profileCompleteness < 100 && (
        <div className="p-4 rounded-2xl bg-surface border border-card-border flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-foreground">
                Complete profile setup ({profileCompleteness}%)
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Unlock exact calorie deficits and adaptive workout splits.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/profile')}
            className="px-3.5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all border-none cursor-pointer shrink-0"
          >
            <span>Finish</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Today's Progress Card (4 Color-Synced Circular Progress Rings In One Row) ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-card-border shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-foreground tracking-tight">
            Today&apos;s Progress
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
            Synced
          </span>
        </div>

        {/* All 4 rings placed in ONE single line */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 py-1 text-center items-start">
          {/* Ring 1: Calories (Rose Coral) */}
          <div className="flex flex-col items-center min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="9" />
                <motion.circle
                  cx="50" cy="50" r="38" fill="none" stroke="#F43F5E" strokeWidth="9"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - calFraction)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - calFraction) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] sm:text-xs font-black text-foreground font-mono">
                  {calPercent}%
                </span>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-foreground mt-1.5 truncate max-w-full">
              Calories
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono block leading-tight mt-0.5 truncate max-w-full">
              {totalCal.toLocaleString()} kcal
            </span>
          </div>

          {/* Ring 2: Steps (Emerald / Mint) */}
          <div className="flex flex-col items-center min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="9" />
                <motion.circle
                  cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="9"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - stepFraction)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - stepFraction) }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] sm:text-xs font-black text-foreground font-mono">
                  {stepPercent}%
                </span>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-foreground mt-1.5 truncate max-w-full">
              Steps
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono block leading-tight mt-0.5 truncate max-w-full">
              {totalSteps.toLocaleString()} / {Math.round(targetStepGoal / 1000)}k
            </span>
          </div>

          {/* Ring 3: Hydration (Cyan) */}
          <div className="flex flex-col items-center min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="9" />
                <motion.circle
                  cx="50" cy="50" r="38" fill="none" stroke="#06B6D4" strokeWidth="9"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - waterFraction)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - waterFraction) }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] sm:text-xs font-black text-foreground font-mono">
                  {waterPercent}%
                </span>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-foreground mt-1.5 truncate max-w-full">
              Hydration
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono block leading-tight mt-0.5 truncate max-w-full">
              {(waterIntake / 1000).toFixed(1)} / {(targetWaterMl / 1000).toFixed(1)} L
            </span>
          </div>

          {/* Ring 4: Protein (Amber) */}
          <div className="flex flex-col items-center min-w-0">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="9" />
                <motion.circle
                  cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="9"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - protFraction)}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - protFraction) }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] sm:text-xs font-black text-foreground font-mono">
                  {protPercent}%
                </span>
              </div>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-foreground mt-1.5 truncate max-w-full">
              Protein
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-mono block leading-tight mt-0.5 truncate max-w-full">
              {Math.round(totalProt)} / {Math.round(targetProteinG)} g
            </span>
          </div>
        </div>
      </div>

      {/* ── AI Coach Banner ── */}
      <div 
        onClick={() => navigate('/user/ai')}
        className="p-4 rounded-2xl bg-surface border border-emerald-500/20 hover:border-emerald-500/40 flex items-center justify-between gap-3 shadow-sm cursor-pointer transition-all active:scale-[0.99] group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
              AI Coach
            </div>
            <p className="text-xs text-foreground font-medium truncate sm:whitespace-normal mt-0.5">
              {totalCal === 0 && waterIntake === 0
                ? "Ready to conquer today? Start by logging your breakfast or a glass of water!"
                : totalProt < targetProteinG * 0.5
                ? `Logged ${Math.round(totalProt)}g protein so far. Aim for your ${Math.round(targetProteinG)}g target!`
                : "Great momentum! You're on track with your nutritional split and daily movement."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/user/ai');
          }}
          className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shrink-0 cursor-pointer border-none"
        >
          Chat with AI
        </button>
      </div>

      {/* ── Quick Actions ── */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          <button
            onClick={() => useQuickActionsStore.getState().setActiveWorkflow('log_meal')}
            className="p-3 rounded-2xl bg-surface hover:bg-surface-elevated border border-card-border flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm active:scale-95 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-[10.5px] font-bold text-foreground truncate max-w-full">Log Meal</span>
          </button>

          <button
            onClick={() => useQuickActionsStore.getState().setActiveWorkflow('log_workout')}
            className="p-3 rounded-2xl bg-surface hover:bg-surface-elevated border border-card-border flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm active:scale-95 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-[10.5px] font-bold text-foreground truncate max-w-full">Log Workout</span>
          </button>

          <button
            onClick={() => handleAddWater(250)}
            className="p-3 rounded-2xl bg-surface hover:bg-surface-elevated border border-card-border flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm active:scale-95 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[10.5px] font-bold text-foreground truncate max-w-full">Water</span>
          </button>

          <button
            onClick={() => navigate('/user/challenges')}
            className="p-3 rounded-2xl bg-surface hover:bg-surface-elevated border border-card-border flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm active:scale-95 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-surface-elevated text-muted-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[10.5px] font-bold text-foreground truncate max-w-full">More</span>
          </button>
        </div>
      </div>

      {/* Core Grid: Nutrition + Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Nutrition Energy Summary Card (2 Cols on lg) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-surface border border-card-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                  Today&apos;s Nutrition
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Budget: {targetCalorieBudget.toLocaleString()} kcal
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/user/nutrition')}
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer"
            >
              <span>Food Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <CalorieRing
            consumed={totalCal || 0}
            burned={totalBurned || 0}
            goal={targetCalorieBudget}
          />

          {/* Vitals Sync Pill */}
          {(totalSteps > 0 || totalBurned > 0) && (
            <div className="flex items-center justify-center gap-4 py-2.5 px-4 my-3 rounded-2xl bg-surface-elevated border border-card-border/60 text-xs font-bold">
              {totalSteps > 0 && (
                <span className="flex items-center gap-1.5 text-accent">
                  <Activity className="w-3.5 h-3.5" />
                  {totalSteps.toLocaleString()} steps
                </span>
              )}
              {totalBurned > 0 && (
                <span className="flex items-center gap-1.5 text-orange-400">
                  <Flame className="w-3.5 h-3.5" />
                  {totalBurned.toLocaleString()} kcal burned
                </span>
              )}
            </div>
          )}

          {/* 3 Macro Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-card-border/60">
            <MacroBar label="Protein" current={totalProt} total={targetProteinG} color="var(--accent)" />
            <MacroBar label="Carbs" current={totalCarb} total={metrics?.macros?.carbs || 210} color="#FB923C" />
            <MacroBar label="Fats" current={totalFat} total={metrics?.macros?.fat || 57} color="#F87171" />
          </div>
        </div>

        {/* Daily Hydration Card */}
        <div id="hydration-card" className="p-6 sm:p-7 rounded-3xl bg-surface border border-card-border shadow-sm flex flex-col justify-between h-full">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-foreground">
                  Hydration
                </h3>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Daily Goal: {targetWaterMl.toLocaleString()} ml
                </span>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-cyan-400">
              {Math.round((waterIntake / targetWaterMl) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-5 my-3">
            <RealisticWaterVessel
              currentAmount={waterIntake}
              targetAmount={targetWaterMl}
              width={72}
              height={144}
              onAddWater={handleAddWater}
              className="shrink-0"
            />

            <div className="flex-1 space-y-4">
              <div>
                <div className="text-3xl font-black text-cyan-400 font-mono leading-none">
                  {waterIntake.toLocaleString()}
                  <span className="text-xs text-muted-foreground font-bold ml-1.5 font-sans">ml</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5">
                  Remaining: {Math.max(0, targetWaterMl - waterIntake).toLocaleString()} ml
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[250, 500].map(ml => (
                  <button
                    key={ml}
                    onClick={() => handleAddWater(ml)}
                    className="py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-card-border text-xs font-bold text-foreground cursor-pointer active:scale-95 transition-all"
                  >
                    +{ml}ml
                  </button>
                ))}
                <button
                  onClick={handleResetWater}
                  className="py-2 rounded-xl text-[10px] font-bold text-muted-foreground hover:text-red-400 bg-transparent border border-card-border/40 cursor-pointer col-span-2 active:scale-95 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity: Meals & Workouts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Meals */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface border border-card-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Recent Meals
            </h3>
            <button
              onClick={() => navigate('/user/nutrition')}
              className="text-[11px] font-bold text-accent hover:underline bg-transparent border-none cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="space-y-2">
            {recentMeals.length === 0 ? (
              <div className="py-5 text-center text-muted-foreground space-y-1">
                <Utensils className="w-5 h-5 mx-auto opacity-40" />
                <p className="text-[11px] font-medium">No meals logged today yet.</p>
              </div>
            ) : (
              recentMeals.slice(0, 3).map((meal, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-surface-elevated border border-card-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground truncate">{meal.name}</div>
                      <span className="text-[9px] text-muted-foreground font-mono truncate block">
                        {(Number(meal.protein) || 0).toFixed(0)}g P · {(Number(meal.carbs) || 0).toFixed(0)}g C
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground ml-2 shrink-0">
                    {meal.calories} kcal
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface border border-card-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Recent Workouts
            </h3>
            <button
              onClick={() => navigate('/user/workout')}
              className="text-[11px] font-bold text-accent hover:underline bg-transparent border-none cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="space-y-2">
            {recentWorkouts.length === 0 ? (
              <div className="py-5 text-center text-muted-foreground space-y-1">
                <Dumbbell className="w-5 h-5 mx-auto opacity-40" />
                <p className="text-[11px] font-medium">No workouts logged today yet.</p>
              </div>
            ) : (
              recentWorkouts.slice(0, 3).map((w, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-surface-elevated border border-card-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-foreground truncate">{w.name || 'Workout'}</div>
                      <span className="text-[9px] text-muted-foreground truncate block">
                        {w.category === 'Cardio' ? `${w.duration} mins` : `${w.sets || 3} sets`}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-accent ml-2 shrink-0">
                    {w.caloriesBurned ? `${w.caloriesBurned} kcal` : 'Done'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Compact Daily Energy & Metabolic Profile */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-surface border border-card-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-card-border/60 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-accent" />
            <h3 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
              Daily Energy & Metabolic Profile
            </h3>
          </div>
          <button
            onClick={() => navigate('/user/profile')}
            className="text-[11px] font-bold text-accent hover:underline bg-transparent border-none cursor-pointer"
          >
            Adjust
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-surface-elevated border border-card-border/50">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">BMI</span>
            <div className="text-base sm:text-lg font-black text-foreground font-mono mt-0.5">{metrics.bmi}</div>
            <span className="text-[9px] text-muted-foreground block truncate">{metrics.bmiStatus}</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-elevated border border-card-border/50">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">BMR (Rest)</span>
            <div className="text-base sm:text-lg font-black text-foreground font-mono mt-0.5">
              {metrics.bmr.toLocaleString()} <span className="text-[10px] font-sans text-muted-foreground font-normal">kcal</span>
            </div>
            <span className="text-[9px] text-muted-foreground block">Basal rate</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-elevated border border-card-border/50">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">TDEE</span>
            <div className="text-base sm:text-lg font-black text-foreground font-mono mt-0.5">
              {metrics.tdee.toLocaleString()} <span className="text-[10px] font-sans text-muted-foreground font-normal">kcal</span>
            </div>
            <span className="text-[9px] text-muted-foreground block">Maintenance</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-elevated border border-card-border/50">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Target</span>
            <div className="text-base sm:text-lg font-black text-accent font-mono mt-0.5">
              {metrics.calorieGoal.toLocaleString()} <span className="text-[10px] font-sans text-accent/80 font-normal">kcal</span>
            </div>
            <span className="text-[9px] text-muted-foreground block">Active plan</span>
          </div>
        </div>
      </div>

      {/* Daily Morning AI Briefing Card (Positioned at bottom) */}
      <DailyAIBriefingCard
        userProfile={userProfile}
        foodLogs={todaysFoodLogs}
        workoutLogs={todaysWorkoutLogs}
        waterIntake={waterIntake}
        healthLogs={{
          sleep: Number(cachedHealthMetrics.sleepHours || ecoStore?.healthLogs?.sleep || 0),
          restingHeartRate: Number(cachedHealthMetrics.restingHeartRateBpm || ecoStore?.healthLogs?.restingHeartRate || 0),
          soreness: Number(ecoStore?.healthLogs?.soreness || 1),
          fatigue: Number(ecoStore?.healthLogs?.fatigue || 1)
        }}
        onOpenUpgradeModal={(feature) => {
          setPremiumFeatureName(feature);
          setPremiumModalOpen(true);
        }}
      />

      <PremiumFeatureModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        featureName={premiumFeatureName}
      />
    </div>
  );
}
