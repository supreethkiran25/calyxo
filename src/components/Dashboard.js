"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getWaterIntake, saveWaterIntake, getUserProfile } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { Flame, Droplets, Activity, Dumbbell, Utensils, Star, Sparkles, ChevronRight, Award } from 'lucide-react';

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
  const { 
    user, 
    foodLogs, 
    workoutLogs, 
    waterIntake, 
    userProfile, 
    setWaterIntake, 
    setUserProfile,
    setActiveTab 
  } = useStore();
  
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  const [units, setUnits] = useState('metric');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');

  const [metrics, setMetrics] = useState({
    bmi: 22.8, bmr: 1653, tdee: 2562, calorieGoal: 2062,
    bodyType: 'Mesomorph', bmiStatus: 'Normal Weight',
    macros: { protein: 140, carbs: 210, fat: 57 }
  });

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
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
    };
    load();
  }, [userId, setUserProfile, setWaterIntake]);

  useEffect(() => { 
    recalculateMetrics(); 
  }, [units, gender, age, weight, height, activity, goal]);

  const recalculateMetrics = () => {
    const rawW = Number(weight) || 70;
    const rawH = Number(height) || 175;
    const hm = rawH / 100;
    const bmi = hm > 0 ? rawW / (hm * hm) : 22.0;

    let bmiStatus = "Normal Weight";
    if (bmi < 18.5) bmiStatus = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiStatus = "Overweight";
    else if (bmi >= 30) bmiStatus = "Obese";

    const bodyType = bmi < 18.5 ? "Ectomorph" : bmi < 25 ? (bmi < 21 ? "Ectomorph" : "Mesomorph") : "Endomorph";
    let bmr = gender === 'male' ? (10 * rawW) + (6.25 * rawH) - (5 * age) + 5 : (10 * rawW) + (6.25 * rawH) - (5 * age) - 161;
    const tdee = bmr * activity;
    let calGoal = goal === 'lose' ? tdee - 500 : goal === 'gains' ? tdee + 350 : tdee;
    calGoal = Math.max(calGoal, gender === 'male' ? 1500 : 1200);
    const protein = Math.min(Math.max(Math.round(rawW * 2.0), 80), 220);
    const fat = Math.round((calGoal * 0.25) / 9);
    const carbs = Math.round((calGoal - (protein * 4) - (fat * 9)) / 4);

    setMetrics({ 
      bmi: Number(bmi.toFixed(1)), 
      bmr: Math.round(bmr), 
      tdee: Math.round(tdee), 
      calorieGoal: Math.round(calGoal), 
      bodyType, 
      bmiStatus, 
      macros: { protein, carbs, fat } 
    });
  };

  const handleAddWater = async (amount) => {
    const next = Math.min(waterIntake + amount, 5000);
    setWaterIntake(next);
    await saveWaterIntake(userId, next);
    if (onNotification) onNotification(`+${amount}ml water logged 💧`);
  };

  const handleResetWater = async () => {
    setWaterIntake(0);
    await saveWaterIntake(userId, 0);
    if (onNotification) onNotification("Water hydration reset");
  };

  // Consumed aggregates
  const totalCal = foodLogs.reduce((s, x) => s + x.calories, 0);
  const totalProt = foodLogs.reduce((s, x) => s + (x.protein || 0), 0);
  const totalCarb = foodLogs.reduce((s, x) => s + (x.carbs || 0), 0);
  const totalFat = foodLogs.reduce((s, x) => s + (x.fat || 0), 0);

  // Estimated burned from workouts
  const totalBurned = workoutLogs.reduce((s, x) => s + (x.caloriesBurned || 0), 0);

  // Recent meals (last 4)
  const recentMeals = [...foodLogs].reverse().slice(0, 4);

  // Recent workouts (last 3)
  const recentWorkouts = [...workoutLogs].reverse().slice(0, 3);

  // Water hydration percentage
  const waterGoal = 3000;
  const waterPct = Math.min((waterIntake / waterGoal) * 100, 100);

  // Calculate Profile Completeness %
  const calculateCompleteness = () => {
    const fields = [userProfile.firstName, userProfile.lastName, userProfile.nickname, userProfile.dob, userProfile.allergies, userProfile.foodDislikes, userProfile.favoriteFoods];
    const filled = fields.filter(x => x && x.toString().trim().length > 0).length;
    const dietFilled = userProfile.dietPreferences?.length > 0 ? 1 : 0;
    const photoFilled = userProfile.photoURL ? 1 : 0;
    return Math.round(((filled + dietFilled + photoFilled) / 9) * 100);
  };

  const profileCompleteness = calculateCompleteness();

  return (
    <div className="space-y-6 w-full select-text pb-20">
      
      {/* Profile Completeness Alert banner */}
      {profileCompleteness < 100 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-acid-green/10 border border-acid-green/20 rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-acid-green/10 flex items-center justify-center text-acid-green text-sm shrink-0">
              ⚡
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Complete your fitness profile ({profileCompleteness}%)</span>
              <span className="text-[10px] text-muted block mt-0.5">Tell us more about your health and coach preferences to enable tailored insights.</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="text-[9px] font-extrabold text-accent-foreground bg-acid-green hover:shadow-md px-3.5 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer border-none shrink-0"
          >
            Setup
          </button>
        </motion.div>
      )}

      {/* ── Streaks Counters Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          { label: 'Login Streak', value: ecoStore.streaks.loginStreak, icon: <Flame className="w-5 h-5 text-orange" />, color: 'from-orange/20 to-red-500/10' },
          { label: 'Workout Streak', value: ecoStore.streaks.workoutStreak, icon: <Dumbbell className="w-5 h-5 text-acid-green" />, color: 'from-acid-green/20 to-emerald-500/10' },
          { label: 'Nutrition Streak', value: ecoStore.streaks.nutritionStreak, icon: <Utensils className="w-5 h-5 text-yellow-500" />, color: 'from-yellow-500/20 to-amber-500/10' },
          { label: 'Water Streak', value: ecoStore.streaks.waterStreak, icon: <Droplets className="w-5 h-5 text-blue-400" />, color: 'from-blue-400/20 to-sky-500/10' }
        ].map((s, idx) => (
          <div key={idx} className={`glass bg-gradient-to-br ${s.color} border border-card-border rounded-2xl p-4 flex items-center justify-between shadow-xs hover:scale-102 transition-all`}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
        
        {/* Calyxo Score Gauge Widget */}
        <div className="glass p-6 rounded-2xl border border-card-border shadow-md flex flex-col justify-between h-full min-h-[340px]">
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-acid-green animate-pulse" />
              Calyxo Fitness Score
            </h3>
            
            <div className="flex items-center gap-6 py-2">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" 
                    stroke="var(--accent)" strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - (ecoStore.fitnessScore.dailyScore / 100) * (2 * Math.PI * 40)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-foreground">{ecoStore.fitnessScore.dailyScore}</span>
                  <span className="text-[7px] text-muted font-bold uppercase tracking-widest">Score</span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Weekly Average</div>
                <div className="text-sm font-black text-foreground">{ecoStore.fitnessScore.weeklyScore}</div>
                <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Monthly Index</div>
                <div className="text-sm font-black text-foreground">{ecoStore.fitnessScore.monthlyScore}</div>
              </div>
            </div>

            <div className="mt-4 border-t border-card-border pt-3 space-y-2">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">AI Insights:</span>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                {ecoStore.fitnessScore.recommendations?.map((rec, i) => (
                  <div key={i} className="flex gap-2 items-start text-xs font-semibold text-foreground">
                    <span className="text-acid-green font-bold">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Today's Summary Card (Spans 2 columns on desktop) ── */}
        <div className="glass p-6 rounded-2xl border border-[var(--card-border)] md:col-span-2 flex flex-col justify-between h-full shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Today&apos;s Nutrition Summary</h2>
              <button 
                onClick={() => setActiveTab('nutrition')}
                className="p-1.5 rounded-lg bg-surface border border-card-border text-[var(--text-muted)] hover:text-foreground cursor-pointer"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>

          <CalorieRing consumed={totalCal} burned={totalBurned} goal={metrics.calorieGoal} />

          <div className="grid grid-cols-3 gap-4 border-t border-card-border pt-4 mt-2">
            <MacroBar label="Protein" current={totalProt} total={metrics.macros.protein} color="var(--accent)" />
            <MacroBar label="Carbs" current={totalCarb} total={metrics.macros.carbs} color="var(--orange-theme)" />
            <MacroBar label="Fats" current={totalFat} total={metrics.macros.fat} color="var(--destructive)" />
          </div>
        </div>

        {/* Daily Hydration Logger */}
        <div className="glass p-6 rounded-2xl border border-card-border shadow-md flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              Water Intake Log
            </h3>
            
            <div className="flex gap-4 items-center mb-4">
              <div className="relative w-16 h-36 bg-surface border border-card-border rounded-2xl overflow-hidden shadow-inner flex flex-col justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${waterPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="w-full rounded-b-xl animate-water"
                  style={{
                    background: 'linear-gradient(to top, var(--blue-theme), var(--color-blue))',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-center font-black text-xs text-foreground drop-shadow-sm select-none">
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
                    className="w-full py-2 bg-surface border border-card-border rounded-xl text-[10px] uppercase font-bold text-muted hover:border-red-500 hover:bg-red-500/5 transition-all cursor-pointer col-span-2"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Workouts Card ── */}
        <div className="glass p-6 rounded-2xl border border-[var(--card-border)] shadow-md flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <SectionHeader title="Recent Workouts" onSeeAll={() => setActiveTab('workout')} />
            
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
        <div className="glass p-6 rounded-2xl border border-[var(--card-border)] shadow-md flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <SectionHeader title="Recent Meals" onSeeAll={() => setActiveTab('nutrition')} />
            
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
              onClick={() => setActiveTab('profile')}
              className="text-xs font-bold text-[var(--color-acid-green)] hover:underline background-none border-none cursor-pointer p-0"
            >
              Adjust Biometrics
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-card-border">
            {[
              { label: 'Body Mass Index', value: metrics.bmi, sub: metrics.bmiStatus },
              { label: 'Basal Metabolic Rate', value: `${metrics.bmr.toLocaleString()} kcal`, sub: 'BMR (Rest energy)' },
              { label: 'Total Energy Expenditure', value: `${metrics.tdee.toLocaleString()} kcal`, sub: 'TDEE (Active energy)' },
              { label: 'Intake Target', value: `${metrics.calorieGoal.toLocaleString()} kcal`, sub: 'Calculated diet plan', green: true },
            ].map((stat, i) => (
              <div key={i} className="p-5 bg-[var(--card-bg)] flex flex-col justify-between h-28">
                <span className="text-[9px] text-muted font-bold uppercase tracking-wider">{stat.label}</span>
                <span className={`text-md font-black block mt-2 ${stat.green ? 'text-[var(--color-acid-green)]' : 'text-foreground'}`}>
                  {stat.value}
                </span>
                <span className="text-[10px] text-muted block mt-1.5 font-medium">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
