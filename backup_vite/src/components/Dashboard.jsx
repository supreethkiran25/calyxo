import React, { useState, useEffect } from 'react';
import { 
  getWaterIntake, 
  saveWaterIntake, 
  getWeightLogs, 
  addWeightLog, 
  getUserProfile, 
  saveUserProfile 
} from '../dbService';

function Dashboard({ userId, foodLogs, onNotification }) {
  // Biometrics & Onboarding
  const [units, setUnits] = useState('metric');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70); // raw value from input (kg or lbs depending on units)
  const [height, setHeight] = useState(175); // raw value from input (cm or inches depending on units)
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');

  // Calculated Metrics
  const [metrics, setMetrics] = useState({
    bmi: 22.8,
    bmr: 1653,
    tdee: 2562,
    calorieGoal: 2062,
    bodyType: 'Mesomorph',
    macros: { protein: 140, carbs: 210, fat: 57 }
  });

  // Water Hydration state
  const [water, setWater] = useState(0);

  // Weight Sparkline state
  const [weightInput, setWeightInput] = useState('');
  const [weightLogs, setWeightLogs] = useState([]);

  // Load Initial State
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return;
      const profile = await getUserProfile(userId);
      if (profile) {
        setGender(profile.gender || 'male');
        setAge(profile.age || 25);
        setActivity(profile.activity || 1.55);
        setGoal(profile.goal || 'lose');
        setUnits(profile.units || 'metric');
        
        const isImperial = profile.units === 'imperial';
        setWeight(isImperial ? Number((profile.weight * 2.20462).toFixed(1)) : profile.weight);
        setHeight(isImperial ? Number((profile.height / 2.54).toFixed(1)) : profile.height);
      }
      
      const savedWater = await getWaterIntake(userId);
      setWater(savedWater || 0);

      const savedWeights = await getWeightLogs(userId);
      setWeightLogs(savedWeights || []);
    };

    loadDashboardData();
  }, [userId]);

  // Recalculate parameters when inputs change
  useEffect(() => {
    recalculateMetrics();
  }, [units, gender, age, weight, height, activity, goal]);

  const recalculateMetrics = () => {
    const rawW = Number(weight) || 70;
    const rawH = Number(height) || 175;
    const isImperial = units === 'imperial';

    let weightKg = rawW;
    let heightCm = rawH;

    if (isImperial) {
      weightKg = rawW / 2.20462;
      heightCm = rawH * 2.54;
    }

    // BMI
    const heightMeters = heightCm / 100;
    const bmi = weightKg / (heightMeters * heightMeters);

    let bmiStatus = "Normal Weight";
    let bodyType = "Mesomorph";

    if (bmi < 18.5) {
      bmiStatus = "Underweight";
      bodyType = "Ectomorph";
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiStatus = "Normal Weight";
      bodyType = bmi < 21 ? "Ectomorph" : "Mesomorph";
    } else if (bmi >= 25 && bmi < 30) {
      bmiStatus = "Overweight";
      bodyType = "Endomorph";
    } else {
      bmiStatus = "Obese";
      bodyType = "Endomorph";
    }

    // BMR (Mifflin-St Jeor)
    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }

    // TDEE
    const tdee = bmr * activity;
    let calorieGoal = tdee;

    if (goal === 'lose') {
      calorieGoal = tdee - 500;
    } else if (goal === 'gains') {
      calorieGoal = tdee + 350;
    }

    calorieGoal = Math.max(calorieGoal, gender === 'male' ? 1500 : 1200);

    // Macros
    let proteinTarget = Math.round(weightKg * 2.0);
    proteinTarget = Math.min(Math.max(proteinTarget, 80), 220);

    let fatTarget = Math.round((calorieGoal * 0.25) / 9);
    let carbsTarget = Math.round((calorieGoal - (proteinTarget * 4) - (fatTarget * 9)) / 4);

    setMetrics({
      bmi: Number(bmi.toFixed(1)),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieGoal: Math.round(calorieGoal),
      bodyType,
      bmiStatus,
      macros: { protein: proteinTarget, carbs: carbsTarget, fat: fatTarget }
    });
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    const isImperial = units === 'imperial';
    const weightKg = isImperial ? weight / 2.20462 : weight;
    const heightCm = isImperial ? height * 2.54 : height;

    const profile = {
      gender,
      age: Number(age),
      weight: parseFloat(weightKg.toFixed(1)),
      height: parseFloat(heightCm.toFixed(1)),
      activity: Number(activity),
      goal,
      units
    };

    await saveUserProfile(userId, profile);
    onNotification("Biometrics saved, targets updated.");
  };

  // Water Tracker
  const handleAddWater = async (amount) => {
    const nextWater = Math.min(water + amount, 10000);
    setWater(nextWater);
    await saveWaterIntake(userId, nextWater);
    onNotification(`Logged: +${amount}ml Water`);
  };

  const handleResetWater = async () => {
    if (window.confirm("Reset daily water intake?")) {
      setWater(0);
      await saveWaterIntake(userId, 0);
      onNotification("Daily water intake reset.");
    }
  };

  // Weight Sparkline Logging
  const handleLogWeight = async (e) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;

    const loggedVal = val;
    const isImperial = units === 'imperial';
    const weightKg = isImperial ? val / 2.20462 : val;

    const newLog = await addWeightLog(userId, loggedVal, units);
    setWeightLogs([...weightLogs, newLog]);
    setWeightInput('');
    setWeight(loggedVal);

    // Save profile update too
    const profile = {
      gender,
      age: Number(age),
      weight: parseFloat(weightKg.toFixed(1)),
      height: isImperial ? height * 2.54 : height,
      activity: Number(activity),
      goal,
      units
    };
    await saveUserProfile(userId, profile);

    onNotification(`Today's weight logged: ${loggedVal} ${isImperial ? 'lbs' : 'kg'}`);
  };

  // Daily consumed nutrition aggregates
  const totalCal = foodLogs.reduce((sum, x) => sum + x.calories, 0);
  const totalProt = foodLogs.reduce((sum, x) => sum + x.protein, 0);
  const totalCarb = foodLogs.reduce((sum, x) => sum + x.carbs, 0);
  const totalFat = foodLogs.reduce((sum, x) => sum + x.fat, 0);

  const calPct = metrics.calorieGoal > 0 ? (totalCal / metrics.calorieGoal) : 0;
  const protPct = metrics.macros.protein > 0 ? (totalProt / metrics.macros.protein) : 0;
  const carbPct = metrics.macros.carbs > 0 ? (totalCarb / metrics.macros.carbs) : 0;
  const fatPct = metrics.macros.fat > 0 ? (totalFat / metrics.macros.fat) : 0;

  // Render SVG Ring helper
  const renderProgressRing = (radius, stroke, pct, colorClass, bgStroke = "rgba(255, 255, 255, 0.02)") => {
    const circum = 2 * Math.PI * radius;
    const offset = circum - (Math.min(Math.max(pct, 0), 0.999) * circum);
    return (
      <>
        <circle cx="50" cy="50" r={radius} fill="none" stroke={bgStroke} strokeWidth={stroke} />
        <circle 
          cx="50" 
          cy="50" 
          r={radius} 
          fill="none" 
          className={`transition-all duration-700 ease-out origin-center -rotate-90 ${colorClass}`}
          strokeWidth={stroke} 
          strokeDasharray={circum} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
        />
      </>
    );
  };

  // Render weight sparkline chart path
  const getWeightChartPath = () => {
    if (weightLogs.length < 2) return "";
    const isImperial = units === 'imperial';
    
    // Extract weights
    const weights = weightLogs.map(x => Number(x.weight));
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW === 0 ? 10 : maxW - minW;

    const spacing = 280 / (weightLogs.length - 1);
    const points = weightLogs.map((log, idx) => {
      const val = Number(log.weight);
      const x = 10 + (idx * spacing);
      const y = 70 - ((val - minW) / range) * 55; // scale to range 15-70
      return { x, y };
    });

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Onboarding Metrics Section */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">1. Your Profile Metrics</h2>
        
        <form onSubmit={handleOnboardingSubmit} className="space-y-4">
          <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit System</span>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setUnits('metric')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${units === 'metric' ? 'bg-neon-green text-black' : 'bg-white/5 text-gray-400'}`}
              >
                Metric
              </button>
              <button 
                type="button" 
                onClick={() => setUnits('imperial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${units === 'imperial' ? 'bg-neon-green text-black' : 'bg-white/5 text-gray-400'}`}
              >
                Imperial
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Biological Gender</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Age (Years)</label>
              <input 
                type="number" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                min="12" 
                max="100"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
              <input 
                type="number" 
                step="0.1"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Height ({units === 'imperial' ? 'inches' : 'cm'})</label>
              <input 
                type="number" 
                step="0.1"
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1 col-span-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Physical Activity Level</label>
              <select 
                value={activity} 
                onChange={(e) => setActivity(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green"
              >
                <option value="1.2">Sedentary (No Exercise)</option>
                <option value="1.375">Lightly Active (1-3 Days/Wk)</option>
                <option value="1.55">Active (3-5 Days/Wk)</option>
                <option value="1.725">Highly Active (6-7 Days/Wk)</option>
              </select>
            </div>
            
            <div className="flex flex-col space-y-1 col-span-2">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Dietary Target</label>
              <select 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon-green"
              >
                <option value="lose">Caloric Deficit (Weight Loss)</option>
                <option value="maintain">Maintenance (Manage Weight)</option>
                <option value="gains">Lean Gains (Build Muscle)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl cursor-pointer hover:bg-neon-green active:scale-98 transition-all"
          >
            Save Biometric Profiles
          </button>
        </form>
      </section>

      {/* 2. Biological Dashboard Panel */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">2. Biological Dashboard</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Calculated BMI</span>
            <div className="text-2xl font-black text-white">{metrics.bmi}</div>
            <span className="text-[10px] font-semibold text-neon-green px-1.5 py-0.5 rounded bg-neon-green/10 mt-1.5 inline-block">
              {metrics.bmiStatus}
            </span>
          </div>

          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Estimated Body Type</span>
            <div className="text-2xl font-black text-neon-green">{metrics.bodyType}</div>
          </div>

          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Estimated BMR</span>
            <div className="text-xl font-black text-white">{metrics.bmr.toLocaleString()} <span className="text-xs text-gray-400 font-medium">kcal</span></div>
          </div>

          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Maintenance TDEE</span>
            <div className="text-xl font-black text-white">{metrics.tdee.toLocaleString()} <span className="text-xs text-gray-400 font-medium">kcal</span></div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Daily Nutrient Target Allocations</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white/3 border border-white/5 rounded-lg py-2">
              <div className="text-[9px] text-gray-400 font-semibold uppercase">Calories</div>
              <div className="text-xs font-bold text-white">{metrics.calorieGoal} kcal</div>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-lg py-2">
              <div className="text-[9px] text-accent-blue font-semibold uppercase">Protein</div>
              <div className="text-xs font-bold text-white">{metrics.macros.protein}g</div>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-lg py-2">
              <div className="text-[9px] text-accent-yellow font-semibold uppercase">Carbs</div>
              <div className="text-xs font-bold text-white">{metrics.macros.carbs}g</div>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-lg py-2">
              <div className="text-[9px] text-accent-pink font-semibold uppercase">Fats</div>
              <div className="text-xs font-bold text-white">{metrics.macros.fat}g</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Daily Intake Progress Rings */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">3. Daily Intake Status</h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          <svg className="overflow-visible" viewBox="0 0 100 100" width="180" height="180">
            {renderProgressRing(40, 5, calPct, 'stroke-neon-green')}
            {renderProgressRing(32, 5, protPct, 'stroke-accent-blue')}
            {renderProgressRing(24, 5, carbPct, 'stroke-accent-yellow')}
            {renderProgressRing(16, 5, fatPct, 'stroke-accent-pink')}
          </svg>

          <div className="space-y-3 w-full max-w-[240px]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-neon-green rounded-full shadow-[0_0_6px_#39ff14]"></span>
                <span className="font-semibold text-gray-400">Calories</span>
              </div>
              <span className="font-bold text-white">{totalCal} / {metrics.calorieGoal} kcal</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-accent-blue rounded-full"></span>
                <span className="font-semibold text-gray-400">Protein</span>
              </div>
              <span className="font-bold text-white">{totalProt.toFixed(1)}g / {metrics.macros.protein}g</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-accent-yellow rounded-full"></span>
                <span className="font-semibold text-gray-400">Carbs</span>
              </div>
              <span className="font-bold text-white">{totalCarb.toFixed(1)}g / {metrics.macros.carbs}g</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-accent-pink rounded-full"></span>
                <span className="font-semibold text-gray-400">Fats</span>
              </div>
              <span className="font-bold text-white">{totalFat.toFixed(1)}g / {metrics.macros.fat}g</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Water Hydration Tracker */}
      <section className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">4. Water Hydration Tracker</h2>
          <button 
            type="button" 
            onClick={handleResetWater}
            className="text-xs text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            Reset Water
          </button>
        </div>

        <div className="flex items-center justify-around gap-6 mt-4">
          <div className="relative w-20 h-24 border-3 border-neon-green rounded-b-2xl overflow-hidden border-t-none bg-white/1 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center">
            <div 
              style={{ height: `${Math.min((water / 3000) * 100, 100)}%` }}
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-neon-green/30 to-neon-green/90 animate-water shadow-[0_0_15px_rgba(57,255,20,0.4)]"
            ></div>
            <div className="text-md font-black text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
              {Math.min(Math.round((water / 3000) * 100), 100)}%
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 max-w-[200px]">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Hydration Intake</span>
            <div className="text-2xl font-black text-neon-green">{water.toLocaleString()} <span className="text-xs text-gray-400 font-medium">/ 3,000 ml</span></div>
            <div className="flex gap-2 mt-2">
              <button 
                type="button"
                onClick={() => handleAddWater(250)}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
              >
                + 250ml
              </button>
              <button 
                type="button"
                onClick={() => handleAddWater(500)}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
              >
                + 500ml
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Weight History Sparkline Log */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">5. Weight Progress Log</h2>
        
        <div className="space-y-4">
          <form onSubmit={handleLogWeight} className="flex gap-3 items-end">
            <div className="flex flex-col space-y-1 flex-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Log Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
              <input 
                type="number" 
                step="0.1"
                min="20"
                max="300"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={units === 'imperial' ? "e.g. 154" : "e.g. 70"}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
                required
              />
            </div>
            <button 
              type="submit"
              className="bg-neon-green text-black font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all h-[38px] flex items-center justify-center"
            >
              Log Weight
            </button>
          </form>

          {/* SVG Sparkline container */}
          <div className="bg-black/30 border border-white/5 rounded-xl h-24 w-full relative flex items-center justify-center overflow-hidden">
            {weightLogs.length >= 2 ? (
              <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full">
                {/* Horizontal Guide lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                
                {/* Neon graph line */}
                <path d={getWeightChartPath()} fill="none" stroke="#39ff14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_4px_rgba(57,255,20,0.5)]" />
                
                {/* SVG Points */}
                {(() => {
                  const weights = weightLogs.map(x => Number(x.weight));
                  const minW = Math.min(...weights) - 1;
                  const maxW = Math.max(...weights) + 1;
                  const range = maxW - minW === 0 ? 10 : maxW - minW;
                  const spacing = 280 / (weightLogs.length - 1);
                  return weightLogs.map((log, idx) => {
                    const val = Number(log.weight);
                    const x = 10 + (idx * spacing);
                    const y = 70 - ((val - minW) / range) * 55;
                    const logDisplayVal = units === 'imperial' ? val * 2.20462 : val;
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="3.5" className="weight-sparkline-point" />
                        <text x={x} y={y - 8} className="weight-sparkline-label" textAnchor="middle">
                          {logDisplayVal.toFixed(0)}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            ) : (
              <span className="text-gray-400 text-xs text-center z-10 pointer-events-none">
                Log today's weight to draw tracking sparkline.
              </span>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
