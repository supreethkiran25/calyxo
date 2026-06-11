"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getWaterIntake, saveWaterIntake, getWeightLogs, addWeightLog, getUserProfile } from '../lib/dbService';
import { Flame, Droplets, TrendingDown, ChevronRight, Activity, Dumbbell, Utensils } from 'lucide-react';

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
      {/* 3 stats row */}
      <div className="flex justify-around w-full max-w-sm mb-2">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-black text-[var(--color-acid-green)]">{consumed.toLocaleString()}</div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Consumed</div>
          <div className="text-[9px] text-muted mt-0.5">kcal</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-black text-orange">{burned.toLocaleString()}</div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Burned</div>
          <div className="text-[9px] text-muted mt-0.5">kcal</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-black text-foreground">{remaining.toLocaleString()}</div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">Remaining</div>
          <div className="text-[9px] text-muted mt-0.5">kcal</div>
        </div>
      </div>

      {/* Ring */}
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {/* Background track */}
          <circle cx="100" cy="100" r={r} fill="none" stroke="var(--card-border)" strokeWidth="12" />
          {/* Consumed (green) */}
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke="#b5f23d" strokeWidth="12"
            strokeDasharray={circ}
            strokeDashoffset={consumedOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          {/* Burned (orange) overlay starting from consumed */}
          <circle
            cx="100" cy="100" r={r} fill="none"
            stroke="#f57c38" strokeWidth="12"
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
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-foreground leading-none">
            {remaining.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1.5">kcal left</div>
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
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h3>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-xs font-bold text-[var(--color-acid-green)] hover:underline background-none border-none cursor-pointer p-0"
        >
          See All
        </button>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard({ onNotification }) {
  const { 
    user, 
    foodLogs, 
    workoutLogs, 
    weightLogs, 
    waterIntake, 
    userProfile, 
    setWaterIntake, 
    setWeightLogs, 
    setUserProfile,
    setActiveTab 
  } = useStore();
  
  const userId = user?.uid;

  const [units, setUnits] = useState('metric');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');
  const [weightInput, setWeightInput] = useState('');

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
        const isImp = profile.units === 'imperial';
        setWeight(isImp ? Number((profile.weight * 2.20462).toFixed(1)) : profile.weight);
        setHeight(isImp ? Number((profile.height / 2.54).toFixed(1)) : profile.height);
      }
      const savedWater = await getWaterIntake(userId);
      setWaterIntake(savedWater || 0);
      const savedWeights = await getWeightLogs(userId);
      setWeightLogs(savedWeights || []);
    };
    load();
  }, [userId, setUserProfile, setWaterIntake, setWeightLogs]);

  useEffect(() => { 
    recalculateMetrics(); 
  }, [units, gender, age, weight, height, activity, goal]);

  const recalculateMetrics = () => {
    const rawW = Number(weight) || 70;
    const rawH = Number(height) || 175;
    const isImp = units === 'imperial';
    const wkg = isImp ? rawW / 2.20462 : rawW;
    const hcm = isImp ? rawH * 2.54 : rawH;
    const hm = hcm / 100;
    const bmi = hm > 0 ? wkg / (hm * hm) : 22.0;

    let bmiStatus = "Normal Weight";
    if (bmi < 18.5) bmiStatus = "Underweight";
    else if (bmi >= 25 && bmi < 30) bmiStatus = "Overweight";
    else if (bmi >= 30) bmiStatus = "Obese";

    const bodyType = bmi < 18.5 ? "Ectomorph" : bmi < 25 ? (bmi < 21 ? "Ectomorph" : "Mesomorph") : "Endomorph";
    let bmr = gender === 'male' ? (10 * wkg) + (6.25 * hcm) - (5 * age) + 5 : (10 * wkg) + (6.25 * hcm) - (5 * age) - 161;
    const tdee = bmr * activity;
    let calGoal = goal === 'lose' ? tdee - 500 : goal === 'gains' ? tdee + 350 : tdee;
    calGoal = Math.max(calGoal, gender === 'male' ? 1500 : 1200);
    const protein = Math.min(Math.max(Math.round(wkg * 2.0), 80), 220);
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

  const handleLogWeight = async (e) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;
    const isImp = units === 'imperial';
    const wkg = isImp ? val / 2.20462 : val;
    const newLog = await addWeightLog(userId, val, units);
    setWeightLogs([...weightLogs, newLog]);
    setWeightInput('');
    setWeight(val);
    if (onNotification) onNotification(`Weight logged: ${val} ${isImp ? 'lbs' : 'kg'} ⚖️`);
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

  // Weight trend
  const getWeightTrend = () => {
    if (weightLogs.length < 2) return null;
    const last = weightLogs[weightLogs.length - 1];
    const prev = weightLogs[weightLogs.length - 2];
    return (Number(last.weight) - Number(prev.weight)).toFixed(1);
  };
  const trend = getWeightTrend();

  // Water hydration percentage
  const waterGoal = 3000;
  const waterPct = Math.min((waterIntake / waterGoal) * 100, 100);

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'var(--input-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">

      {/* ── Today's Summary Card (Spans 2 columns on desktop) ── */}
      <div className="glass p-6 rounded-2xl border border-[var(--card-border)] md:col-span-2 flex flex-col justify-between h-full shadow-lg">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-md font-bold text-foreground uppercase tracking-wider">Today&apos;s Nutrition Summary</h2>
            <button 
              onClick={() => setActiveTab('nutrition')}
              className="p-1.5 rounded-lg bg-surface border border-card-border text-[var(--text-muted)] hover:text-foreground cursor-pointer"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>

        <CalorieRing
          consumed={totalCal}
          burned={totalBurned}
          goal={metrics.calorieGoal}
        />

        {/* Macro bars */}
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] space-y-3.5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Remaining Macros</span>
            <button
              onClick={() => setActiveTab('nutrition')}
              className="text-xs font-bold text-[var(--color-acid-green)] hover:underline background-none border-none cursor-pointer p-0"
            >
              Open Diary
            </button>
          </div>
          <MacroBar label="Protein" current={totalProt} total={metrics.macros.protein} color="#b5f23d" />
          <MacroBar label="Carbs" current={totalCarb} total={metrics.macros.carbs} color="#f57c38" />
          <MacroBar label="Fats" current={totalFat} total={metrics.macros.fat} color="#ef5350" />
        </div>
      </div>

      {/* ── Water Tracker Card ── */}
      <div className="glass p-6 rounded-2xl border border-[var(--card-border)] shadow-md flex flex-col justify-between h-full min-h-[300px]">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Daily Hydration</h3>
            <button
              onClick={handleResetWater}
              className="text-[10px] font-bold text-muted hover:text-foreground hover:underline uppercase tracking-wider bg-none border-none cursor-pointer p-0"
            >
              Reset
            </button>
          </div>

          <div className="flex items-center gap-6 py-2">
            {/* Water bar */}
            <div className="relative w-14 h-32 border-2 border-card-border rounded-2xl overflow-hidden bg-surface shadow-inner shrink-0">
              <motion.div
                animate={{ height: `${waterPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 right-0 rounded-b-xl animate-water"
                style={{
                  background: 'linear-gradient(to top, #0288d1, #4fc3f7)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-center font-black text-xs text-foreground drop-shadow-sm select-none">
                {Math.round(waterPct)}%
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="text-3xl font-black text-[#0288d1] leading-none">
                  {waterIntake.toLocaleString()}
                  <span className="text-xs text-muted font-bold ml-1.5">ml</span>
                </div>
                <div className="text-[10px] text-muted font-semibold mt-1">Goal: {waterGoal}ml / day</div>
              </div>
              
              <div className="flex flex-col gap-2">
                {[250, 500].map((ml) => (
                  <button
                    key={ml}
                    onClick={() => handleAddWater(ml)}
                    className="w-full py-2.5 bg-surface border border-card-border rounded-xl text-xs font-bold text-foreground hover:border-[#4fc3f7] hover:bg-[#4fc3f7]/5 transition-all cursor-pointer"
                  >
                    +{ml}ml
                  </button>
                ))}
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
                    <div className="text-xs font-bold text-foreground truncate max-w-[120px]">{w.exerciseName || 'Workout'}</div>
                    <div className="text-[10px] text-muted font-medium mt-0.5">
                      {w.sets} sets × {w.reps} reps
                    </div>
                  </div>
                </div>
                {w.caloriesBurned > 0 && (
                  <span className="text-xs font-bold text-[var(--color-acid-green)] bg-[var(--color-acid-green)]/10 px-2 py-1 rounded-lg border border-[var(--color-acid-green)]/10">{w.caloriesBurned} kcal</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Meals Card ── */}
      <div className="glass p-6 rounded-2xl border border-[var(--var-card-border)] shadow-md flex flex-col justify-between h-full min-h-[320px]">
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
                    <div className="text-xs font-bold text-foreground truncate max-w-[110px]">{m.foodName}</div>
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

      {/* ── Weight Log Card ── */}
      <div className="glass p-6 rounded-2xl border border-[var(--card-border)] shadow-md flex flex-col justify-between h-full min-h-[320px]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Weight Progress</h3>
            {trend !== null && (
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                Number(trend) <= 0 
                  ? 'bg-[var(--color-acid-green)]/15 text-[var(--color-acid-green)] border-[var(--color-acid-green)]/20' 
                  : 'bg-red-500/15 text-red-500 border-red-500/20'
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
              className="btn-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-transform"
            >
              Log
            </button>
          </form>

          {/* Sparkline */}
          {weightLogs.length >= 2 ? (() => {
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
                  <path d={d} fill="none" stroke="#b5f23d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#b5f23d" className="shadow-lg" />
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
      </div>

      {/* ── Biometrics Quick Stats Card ── */}
      <div className="glass rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-md md:col-span-2 lg:col-span-3">
        <div className="flex justify-between items-center px-6 py-4 border-b border-card-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
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
              <span className={`text-lg font-black block mt-2 ${stat.green ? 'text-[var(--color-acid-green)]' : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-[10px] text-muted block mt-1.5 font-medium">{stat.sub}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
