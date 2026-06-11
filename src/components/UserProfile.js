"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getUserProfile, saveUserProfile, saveEcosystemState } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { User, Activity, Flame, ShieldAlert, Award, RefreshCw, LogOut, CheckCircle, Scale, Trophy, Camera, Sparkles, Share2, Download, Image as ImageIcon, Lock } from 'lucide-react';
import { signOutUser } from '../lib/dbService';

export default function UserProfile({ onNotification }) {
  const { user, userProfile, setUserProfile, resetStore } = useStore();
  const userId = user?.uid;

  const ecoStore = useEcosystemStore();
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [timelineNotes, setTimelineNotes] = useState("");
  
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
    setTimelineNotes("");
    if (onNotification) onNotification("Added transformation comparison log! 📸");
  };

  const handleDownloadSocialCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Background gradient matching Calyxo Neon/Dark theme
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#0e0e11');
    gradient.addColorStop(1, '#18181f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    // Border accent
    ctx.strokeStyle = '#b5f23d';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 380);
    
    // Title
    ctx.fillStyle = '#b5f23d';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('CALYXO AI COACH', 40, 60);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('FITNESS ECOSYSTEM PROFILE STATS', 40, 85);
    
    // Athlete details
    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ATHLETE NAME', 40, 140);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px sans-serif';
    ctx.fillText(user?.displayName || 'Calyxo Athlete', 40, 165);

    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('FITNESS SCORE', 40, 220);
    ctx.fillStyle = '#b5f23d';
    ctx.font = '900 36px sans-serif';
    ctx.fillText(`${ecoStore.fitnessScore.dailyScore}/100`, 40, 260);

    // Right side stats
    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ACTIVE LOG STREAKS', 320, 140);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`🔥 Login Streak: ${ecoStore.streaks.loginStreak} days`, 320, 170);
    ctx.fillText(`🏋️ Workout Streak: ${ecoStore.streaks.workoutStreak} days`, 320, 195);
    ctx.fillText(`🍗 Nutrition Streak: ${ecoStore.streaks.nutritionStreak} days`, 320, 220);
    ctx.fillText(`💧 Hydration Streak: ${ecoStore.streaks.waterStreak} days`, 320, 245);

    // Goal Strategy
    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('PRIMARY FITNESS TARGET', 40, 310);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    const goalText = goal === 'lose' ? 'WEIGHT LOSS (CALORIE DEFICIT)' : goal === 'gains' ? 'MUSCLE GAINS (CALORIE SURPLUS)' : 'WEIGHT MAINTENANCE';
    ctx.fillText(goalText, 40, 335);

    // Branding logo watermark
    ctx.fillStyle = '#8e8e93';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('POWERED BY GEMINI 2.5 FLASH', 320, 335);

    // Trigger download
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user?.displayName || 'calyxo'}_stats_share.png`;
    a.click();
    if (onNotification) onNotification("Social Card downloaded successfully! 🎨");
  };

  const [units, setUnits] = useState('metric');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');
  const [saving, setSaving] = useState(false);

  const [metrics, setMetrics] = useState({
    bmi: 22.8, bmr: 1653, tdee: 2562, calorieGoal: 2062,
    bodyType: 'Mesomorph', bmiStatus: 'Normal Weight',
    macros: { protein: 140, carbs: 210, fat: 57 }
  });

  useEffect(() => {
    if (userProfile) {
      setGender(userProfile.gender || 'male');
      setAge(userProfile.age || 25);
      setActivity(userProfile.activity || 1.55);
      setGoal(userProfile.goal || 'lose');
      setUnits(userProfile.units || 'metric');
      const isImp = userProfile.units === 'imperial';
      setWeight(isImp ? Number((userProfile.weight * 2.20462).toFixed(1)) : userProfile.weight);
      setHeight(isImp ? Number((userProfile.height / 2.54).toFixed(1)) : userProfile.height);
    }
  }, [userProfile]);

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
    let bmiColor = "text-acid-green";
    if (bmi < 18.5) {
      bmiStatus = "Underweight";
      bmiColor = "text-blue-400";
    } else if (bmi >= 25 && bmi < 30) {
      bmiStatus = "Overweight";
      bmiColor = "text-orange";
    } else if (bmi >= 30) {
      bmiStatus = "Obese";
      bmiColor = "text-red-500";
    }

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
      bmiColor,
      macros: { protein, carbs, fat }
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const isImp = units === 'imperial';
    const rawW = Number(weight) || 70;
    const rawH = Number(height) || 175;
    const wkg = isImp ? rawW / 2.20462 : rawW;
    const hcm = isImp ? rawH * 2.54 : rawH;
    const profile = {
      gender,
      age: Number(age),
      weight: parseFloat(wkg.toFixed(1)),
      height: parseFloat(hcm.toFixed(1)),
      activity: Number(activity),
      goal,
      units
    };
    await saveUserProfile(userId, profile);
    setUserProfile(profile);
    setSaving(false);
    if (onNotification) onNotification("Profile updated successfully! ⚡");
  };

  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo?")) {
      await signOutUser();
      resetStore();
      if (onNotification) onNotification("Signed out successfully.");
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--foreground)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Form Panel */}
        <div className="w-full md:w-5/12 glass p-6 rounded-2xl border border-card-border shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-acid-green/10 border border-acid-green/20">
              <User className="w-5 h-5 text-acid-green" />
            </div>
            <div>
              <h2 className="text-md font-bold text-foreground uppercase tracking-wider">Profile Settings</h2>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Biometrics & Goals</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {/* Unit System */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">Unit System</label>
              <div className="flex gap-2">
                {['metric', 'imperial'].map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      // Convert units on the fly to avoid confusion
                      const isToImperial = u === 'imperial';
                      if (isToImperial && units === 'metric') {
                        setWeight(Number((weight * 2.20462).toFixed(1)));
                        setHeight(Number((height / 2.54).toFixed(1)));
                      } else if (!isToImperial && units === 'imperial') {
                        setWeight(Number((weight / 2.20462).toFixed(1)));
                        setHeight(Number((height * 2.54).toFixed(1)));
                      }
                      setUnits(u);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      units === u 
                        ? 'bg-acid-green text-black border-acid-green shadow-md shadow-acid-green/10' 
                        : 'bg-surface text-muted border-card-border hover:border-acid-green/40'
                    }`}
                  >
                    {u.charAt(0).toUpperCase() + u.slice(1)} ({u === 'metric' ? 'kg, cm' : 'lbs, in'})
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle} className="cursor-pointer">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Age (years)</label>
                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} min="10" max="100" style={inputStyle} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} style={inputStyle} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Height ({units === 'imperial' ? 'in' : 'cm'})</label>
                <input type="number" step="0.1" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} style={inputStyle} />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Activity Level</label>
              <select value={activity} onChange={(e) => setActivity(Number(e.target.value))} style={inputStyle} className="cursor-pointer">
                <option value="1.2">Sedentary (Little/no exercise)</option>
                <option value="1.375">Lightly Active (Exercise 1-3×/week)</option>
                <option value="1.55">Moderately Active (Exercise 3-5×/week)</option>
                <option value="1.725">Very Active (Exercise 6-7×/week)</option>
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Primary Fitness Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} style={inputStyle} className="cursor-pointer">
                <option value="lose">Weight Loss (Calorie Deficit)</option>
                <option value="maintain">Weight Maintenance</option>
                <option value="gains">Muscle Gains (Calorie Surplus)</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Saving Changes..." : "Save Biometrics"}
            </button>
          </form>

          {/* Account Details & Sign Out */}
          <div className="mt-8 pt-6 border-t border-card-border">
            <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Logged In As</h4>
            <div className="bg-surface p-3.5 rounded-xl border border-card-border flex items-center justify-between mb-4">
              <div className="overflow-hidden mr-2">
                <p className="text-xs font-bold text-foreground truncate">{user?.displayName || "Calyxo Athlete"}</p>
                <p className="text-[10px] text-muted truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="w-2.5 h-2.5 bg-acid-green rounded-full shadow-[0_0_8px_#b5f23d]" />
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out from Device
            </button>
          </div>
        </div>

        {/* Right Health Report Panel */}
        <div className="w-full md:w-7/12 space-y-6">
          
          {/* Main Target Card */}
          <div className="glass p-6 rounded-2xl border border-card-border shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-acid-green/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Recommended Intake</span>
                <h3 className="text-2xl font-black text-foreground mt-1 uppercase tracking-wider">Target Calories</h3>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-acid-green/10 border border-acid-green/20 text-acid-green text-xs font-extrabold uppercase tracking-wide">
                Active Setup
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
              {/* Radial Target */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#b5f23d" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * 0.75) }} // Fill 75% for decoration
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-foreground">{metrics.calorieGoal.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-muted uppercase tracking-widest mt-0.5">kcal / day</span>
                </div>
              </div>

              {/* Targets Summary */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface p-3 rounded-xl border border-card-border">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">BMR</span>
                    <span className="text-sm font-bold text-foreground block mt-1">{metrics.bmr.toLocaleString()} kcal</span>
                    <span className="text-[8px] text-muted block mt-0.5">Basal metabolic energy</span>
                  </div>
                  <div className="bg-surface p-3 rounded-xl border border-card-border">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">TDEE</span>
                    <span className="text-sm font-bold text-foreground block mt-1">{metrics.tdee.toLocaleString()} kcal</span>
                    <span className="text-[8px] text-muted block mt-0.5">Total daily usage</span>
                  </div>
                </div>

                <div className="bg-acid-green/10 border border-acid-green/20 rounded-xl p-3.5 flex items-start gap-3">
                  <Award className="w-5 h-5 text-acid-green shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-black text-acid-green uppercase tracking-wider block">Goal Strategy</span>
                    <p className="text-xs text-foreground/80 mt-1 font-medium">
                      {goal === 'lose' 
                        ? `Set to a moderate deficit of 500 kcal below TDEE to foster fat loss while preserving lean skeletal muscle.` 
                        : goal === 'gains'
                          ? `Set to a lean gains surplus of 350 kcal above TDEE to fuel training output and cellular muscle hypertrophy.`
                          : `Set to maintenance. Keep calorie levels close to BMR + active output to preserve current body structure.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Macro Targets Distribution */}
          <div className="glass p-6 rounded-2xl border border-card-border shadow-lg">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange" />
              Calculated Macro Distribution Targets
            </h3>
            
            <div className="space-y-4">
              {/* Protein */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-foreground">🍖 Protein (Muscle Synthesis)</span>
                  <span className="text-acid-green">{metrics.macros.protein}g / {metrics.macros.protein * 4} kcal</span>
                </div>
                <div className="h-2.5 bg-surface border border-card-border rounded-full overflow-hidden">
                  <div className="h-full bg-acid-green rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-foreground">⚡ Carbohydrates (Athletic Energy)</span>
                  <span className="text-orange">{metrics.macros.carbs}g / {metrics.macros.carbs * 4} kcal</span>
                </div>
                <div className="h-2.5 bg-surface border border-card-border rounded-full overflow-hidden">
                  <div className="h-full bg-orange rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              {/* Fats */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-foreground">🥑 Fats (Hormone Health)</span>
                  <span className="text-red-400">{metrics.macros.fat}g / {metrics.macros.fat * 9} kcal</span>
                </div>
                <div className="h-2.5 bg-surface border border-card-border rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Body Profile Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BMI Card */}
            <div className="glass p-5 rounded-2xl border border-card-border shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface border border-card-border flex items-center justify-center">
                <Scale className="w-6 h-6 text-muted" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Body Mass Index (BMI)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-black text-foreground">{metrics.bmi}</span>
                  <span className={`text-xs font-extrabold ${metrics.bmiColor}`}>{metrics.bmiStatus}</span>
                </div>
              </div>
            </div>

            {/* Somatotype Card */}
            <div className="glass p-5 rounded-2xl border border-card-border shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface border border-card-border flex items-center justify-center">
                <Activity className="w-6 h-6 text-muted" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Estimated Somatotype</span>
                <span className="text-lg font-black text-foreground block mt-1">{metrics.bodyType}</span>
              </div>
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
                  className={`border rounded-xl p-3 flex items-center gap-3 transition-all ${
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

          {/* Before/After Transformation Timeline */}
          <div className="glass p-6 rounded-2xl border border-card-border shadow-lg space-y-5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-acid-green" />
              Before/After Transformation Timeline
            </h3>

            {/* Photo upload inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Before Uploader */}
              <div className="relative border border-dashed border-card-border rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-acid-green/40 bg-surface/20 min-h-[140px]">
                {beforeImage ? (
                  <div className="relative w-full h-full min-h-[120px] rounded-lg overflow-hidden flex items-center justify-center bg-black">
                    <img src={beforeImage} className="object-contain w-full h-full max-h-28" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setBeforeImage(null); }}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:text-red-500 transition-colors border-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Camera className="w-5 h-5 text-muted mb-2" />
                    <span className="text-[10px] font-bold text-foreground">Before Photo</span>
                    <span className="text-[8px] text-muted mt-0.5 uppercase tracking-wider font-extrabold">Upload image</span>
                  </>
                )}
              </div>

              {/* After Uploader */}
              <div className="relative border border-dashed border-card-border rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-acid-green/40 bg-surface/20 min-h-[140px]">
                {afterImage ? (
                  <div className="relative w-full h-full min-h-[120px] rounded-lg overflow-hidden flex items-center justify-center bg-black">
                    <img src={afterImage} className="object-contain w-full h-full max-h-28" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAfterImage(null); }}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:text-red-500 transition-colors border-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Camera className="w-5 h-5 text-muted mb-2" />
                    <span className="text-[10px] font-bold text-foreground">After Photo</span>
                    <span className="text-[8px] text-muted mt-0.5 uppercase tracking-wider font-extrabold">Upload image</span>
                  </>
                )}
              </div>
            </div>

            {beforeImage && afterImage && (
              <div className="space-y-3 pt-1">
                <input 
                  type="text" 
                  value={timelineNotes}
                  onChange={(e) => setTimelineNotes(e.target.value)}
                  placeholder="e.g. Month 3 progress, down 4kg!"
                  className="w-full bg-[var(--input-bg)] border border-card-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green"
                />
                <button
                  onClick={handleSaveTimelineLog}
                  className="w-full bg-acid-green text-black font-extrabold text-[10px] uppercase tracking-wider py-2.5 rounded-xl hover:shadow-[0_0_12px_rgba(204,255,0,0.5)] cursor-pointer border-none"
                >
                  Save Timeline Log
                </button>
              </div>
            )}

            {/* List logged pairs */}
            {ecoStore.timelineLogs && ecoStore.timelineLogs.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-card-border">
                <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Logged Transformations:</span>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {ecoStore.timelineLogs.map((log) => (
                    <div key={log.id} className="bg-surface/50 border border-card-border p-3 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-muted font-bold">
                        <span>Date: {log.date}</span>
                        <span className="text-acid-green">{log.notes}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative rounded-lg overflow-hidden border border-card-border bg-black aspect-video flex items-center justify-center max-h-24">
                          <img src={log.before} className="object-contain w-full h-full" />
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">BEFORE</div>
                        </div>
                        <div className="relative rounded-lg overflow-hidden border border-card-border bg-black aspect-video flex items-center justify-center max-h-24">
                          <img src={log.after} className="object-contain w-full h-full" />
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">AFTER</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Share Card Canvas Downloader */}
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
              className="mt-4 bg-acid-green text-black font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-xl hover:shadow-[0_0_12px_rgba(181,242,61,0.5)] transition-all cursor-pointer border-none flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sharing Card
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
