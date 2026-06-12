"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Activity, Sparkles, ChevronRight, ChevronLeft, Heart, Target, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { saveUserProfile, saveEcosystemState } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';

const STEPS = [
  { id: 'identity', title: 'Who are you?', icon: User, desc: 'Let\'s get to know you better.' },
  { id: 'demographics', title: 'A bit about you', icon: Calendar, desc: 'We need your birth date and gender for accuracy.' },
  { id: 'biometrics', title: 'Your measurements', icon: Activity, desc: 'Specify your current size and goal.' },
  { id: 'fitness', title: 'Activity & Experience', icon: Target, desc: 'How active are you on a weekly basis?' },
  { id: 'nutrition', title: 'Dietary Preferences', icon: Heart, desc: 'Customize Calyxo to fit your kitchen.' },
  { id: 'generating', title: 'Creating Profile', icon: Sparkles, desc: 'Architecting your personalized AI program...' }
];

export default function OnboardingFlow({ onComplete }) {
  const { user, updateUserProfile, userProfile } = useStore();
  const ecoStore = useEcosystemStore();
  const userId = user?.uid;

  const [stepIdx, setStepIdx] = useState(0);
  
  // Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('2001-01-01');
  const [units, setUnits] = useState('metric');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [goalWeight, setGoalWeight] = useState(70);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');
  const [experience, setExperience] = useState('beginner');

  // Nutrition Preferences
  const [dietPreferences, setDietPreferences] = useState([]);
  const [allergies, setAllergies] = useState('');
  const [medicalRestrictions, setMedicalRestrictions] = useState('');
  const [foodDislikes, setFoodDislikes] = useState('');
  const [favoriteFoods, setFavoriteFoods] = useState('');

  // Loading/Generating State
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const currentStep = STEPS[stepIdx];

  const handleNext = () => {
    if (stepIdx === STEPS.length - 2) {
      triggerOnboardingComplete();
    } else {
      setStepIdx(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) {
      setStepIdx(prev => prev - 1);
    }
  };

  const toggleDietPreference = (pref) => {
    setDietPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 25;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const triggerOnboardingComplete = async () => {
    setStepIdx(STEPS.length - 1);
    setGenerating(true);

    // Simulated AI Program Architect Progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finalizeProfile();
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const finalizeProfile = async () => {
    const isImp = units === 'imperial';
    // Normalize to metric for storage database
    const wkg = isImp ? Number((weight / 2.20462).toFixed(1)) : Number(weight);
    const hcm = isImp ? Number((height * 2.54).toFixed(1)) : Number(height);
    const gwkg = isImp ? Number((goalWeight / 2.20462).toFixed(1)) : Number(goalWeight);
    const calculatedAge = calculateAge(dob);

    // Compute biometrics
    const hm = hcm / 100;
    const bmi = hm > 0 ? Number((wkg / (hm * hm)).toFixed(1)) : 22.0;
    
    // BMR (Mifflin-St Jeor)
    const bmr = gender === 'male'
      ? (10 * wkg) + (6.25 * hcm) - (5 * calculatedAge) + 5
      : (10 * wkg) + (6.25 * hcm) - (5 * calculatedAge) - 161;
    
    const tdee = Math.round(bmr * activity);
    let calorieGoal = tdee;
    if (goal === 'lose') calorieGoal = tdee - 500;
    else if (goal === 'gains') calorieGoal = tdee + 350;

    const protein = Math.round(wkg * 2.0); // 2g per kg
    const fat = Math.round((calorieGoal * 0.25) / 9); // 25% fat calories
    const carbs = Math.round((calorieGoal - (protein * 4) - (fat * 9)) / 4);

    const profileData = {
      onboarded: true,
      firstName: firstName || 'Calyxo',
      lastName: lastName || 'Athlete',
      nickname: nickname || firstName || 'Athlete',
      gender,
      dob,
      age: calculatedAge,
      weight: wkg,
      height: hcm,
      goalWeight: gwkg,
      activity,
      goal,
      units,
      experience,
      // Dietary
      dietPreferences,
      allergies,
      medicalRestrictions,
      foodDislikes,
      favoriteFoods,
      // Coach Settings
      coachPersonality: 'motivational',
      responseLength: 'short',
      coachingStyle: 'supportive',
      motivationLevel: 'gentle',
      reminderFrequency: 'daily',
      // Notifications
      notifications: { workout: true, meal: true, hydration: true, checkins: true, challenges: true, achievements: true },
      analyticsTracking: true,
      photoURL: user?.photoURL || ''
    };

    // Store in Zustand State
    updateUserProfile(profileData);
    
    // Unlocks first logged milestone badge
    ecoStore.unlockAchievement('first_workout');
    ecoStore.updateFitnessScore({ dailyScore: 75, weeklyScore: 75 });

    // Save profile to Firestore / Local cache
    await saveUserProfile(userId, profileData);
    await saveEcosystemState(userId, ecoStore);

    // Call API helper to compile initial suggested program if available
    try {
      const response = await fetch('/api/gemini/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          profile: profileData,
          personality: 'motivational'
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.program) {
          ecoStore.setCoachingPlan(data.program);
          await saveEcosystemState(userId, ecoStore);
        }
      }
    } catch (err) {
      console.warn("Could not retrieve personalized AI coach program during onboarding", err);
    }

    if (onComplete) onComplete();
  };

  const isNextDisabled = () => {
    if (stepIdx === 0 && (!firstName.trim() || !nickname.trim())) return true;
    if (stepIdx === 1 && !dob) return true;
    if (stepIdx === 2 && (weight <= 0 || height <= 0 || goalWeight <= 0)) return true;
    return false;
  };

  const IconComponent = currentStep.icon;

  const containerStyle = {
    maxWidth: '520px',
    margin: 'auto',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    boxShadow: 'var(--card-shadow)',
  };

  const inputStyle = "w-full bg-[var(--input)] text-foreground border border-card-border px-4 py-3 rounded-xl focus:outline-none focus:border-acid-green text-sm";

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 md:p-6 text-[var(--foreground)]">
      <div style={containerStyle} className="w-full p-6 md:p-8 relative overflow-hidden">
        
        {/* Onboarding Header */}
        {stepIdx < STEPS.length - 1 && (
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-acid-green">Onboarding</span>
              <span className="w-1.5 h-1.5 rounded-full bg-acid-green" />
              <span className="text-[10px] font-bold text-muted">Step {stepIdx + 1} of {STEPS.length - 1}</span>
            </div>
            
            {/* Progress dots bar */}
            <div className="flex gap-1.5">
              {STEPS.slice(0, -1).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === stepIdx 
                      ? 'w-6 bg-acid-green' 
                      : idx < stepIdx 
                        ? 'w-2 bg-acid-green/40' 
                        : 'w-2 bg-surface border border-card-border'
                  }`} 
                />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Steps Info block */}
            {stepIdx < STEPS.length - 1 ? (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-acid-green">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-foreground">{currentStep.title}</h2>
                <p className="text-xs text-muted font-medium">{currentStep.desc}</p>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 rounded-full bg-acid-green/10 border border-acid-green/30 flex items-center justify-center text-acid-green mx-auto animate-pulse">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-foreground">Creating your customized dashboard</h2>
                  <p className="text-xs text-muted font-medium">Calculating energy profiles, somatotypes, and parsing recommended coaching guidelines.</p>
                </div>

                <div className="space-y-2 max-w-[280px] mx-auto">
                  <div className="w-full bg-surface border border-card-border h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-acid-green h-full rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted font-bold">
                    <span>ARCHITECTING</span>
                    <span>{generationProgress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Steps Forms */}
            {stepIdx === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] text-muted font-bold uppercase tracking-wider">First Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Suppy"
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Kiran"
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className={inputStyle}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Athlete Nickname</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Suppy23"
                    value={nickname} 
                    onChange={(e) => setNickname(e.target.value)} 
                    className={inputStyle}
                  />
                  <p className="text-[9px] text-muted font-medium">This is how Coach Calyxo will address you in conversations.</p>
                </div>
              </div>
            )}

            {stepIdx === 1 && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Date of Birth</label>
                  <input 
                    type="date" 
                    value={dob} 
                    onChange={(e) => setDob(e.target.value)} 
                    className={inputStyle}
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Biological Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['male', 'female'].map(g => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        type="button"
                        className={`py-3.5 border font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                          gender === g 
                            ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                            : 'bg-surface border-card-border text-muted hover:text-foreground'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stepIdx === 2 && (
              <div className="space-y-4">
                {/* Unit Switcher */}
                <div className="flex justify-between items-center bg-surface border border-card-border p-1 rounded-xl">
                  {['metric', 'imperial'].map(u => (
                    <button
                      key={u}
                      onClick={() => setUnits(u)}
                      type="button"
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                        units === u ? 'bg-[var(--card)] text-foreground border border-card-border shadow' : 'text-muted'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider text-center">Weight ({units === 'metric' ? 'kg' : 'lbs'})</label>
                    <input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(Number(e.target.value))} 
                      className="bg-[var(--input)] text-center text-foreground border border-card-border px-2 py-3 rounded-xl focus:outline-none focus:border-acid-green text-sm"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider text-center">Height ({units === 'metric' ? 'cm' : 'in'})</label>
                    <input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(Number(e.target.value))} 
                      className="bg-[var(--input)] text-center text-foreground border border-card-border px-2 py-3 rounded-xl focus:outline-none focus:border-acid-green text-sm"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider text-center">Target ({units === 'metric' ? 'kg' : 'lbs'})</label>
                    <input 
                      type="number" 
                      value={goalWeight} 
                      onChange={(e) => setGoalWeight(Number(e.target.value))} 
                      className="bg-[var(--input)] text-center text-foreground border border-card-border px-2 py-3 rounded-xl focus:outline-none focus:border-acid-green text-sm"
                    />
                  </div>
                </div>

                {/* Objective */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Primary Target</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'lose', label: 'Fat Loss' },
                      { val: 'maintain', label: 'Maintain' },
                      { val: 'gains', label: 'Muscle Gain' }
                    ].map(item => (
                      <button
                        key={item.val}
                        onClick={() => setGoal(item.val)}
                        type="button"
                        className={`py-3.5 border font-bold text-[10px] uppercase tracking-wide rounded-xl transition-colors cursor-pointer ${
                          goal === item.val
                            ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                            : 'bg-surface border-card-border text-muted hover:text-foreground'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stepIdx === 3 && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Weekly Activity Output</label>
                  <div className="space-y-2">
                    {[
                      { val: 1.2, title: 'Sedentary', desc: 'Little to no physical workouts.' },
                      { val: 1.375, title: 'Lightly Active', desc: 'Active routines 1-3 times a week.' },
                      { val: 1.55, title: 'Moderately Active', desc: 'Fitness routines 3-5 times a week.' },
                      { val: 1.725, title: 'Very Active', desc: 'Heavy sports or workouts 6-7 times a week.' }
                    ].map(item => (
                      <div 
                        key={item.val}
                        onClick={() => setActivity(item.val)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-colors ${
                          activity === item.val
                            ? 'bg-acid-green/5 border-acid-green text-foreground'
                            : 'bg-surface border-card-border text-muted hover:text-foreground'
                        }`}
                      >
                        <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                        <p className="text-[10px] text-muted font-medium mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Weightlifting Experience</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(exp => (
                      <button
                        key={exp}
                        onClick={() => setExperience(exp)}
                        type="button"
                        className={`py-3 border font-bold text-[10px] uppercase tracking-wide rounded-xl transition-colors cursor-pointer ${
                          experience === exp
                            ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                            : 'bg-surface border-card-border text-muted hover:text-foreground'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stepIdx === 4 && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] text-muted font-bold uppercase tracking-wider">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {['Vegetarian', 'Vegan', 'Keto', 'High Protein', 'Low Carb'].map(pref => {
                      const active = dietPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => toggleDietPreference(pref)}
                          type="button"
                          className={`px-3 py-2 border font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                            active 
                              ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                              : 'bg-surface border-card-border text-muted hover:text-foreground'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Allergies</label>
                    <input 
                      type="text" 
                      placeholder="e.g. peanuts, dairy"
                      value={allergies} 
                      onChange={(e) => setAllergies(e.target.value)} 
                      className={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Restrictions</label>
                    <input 
                      type="text" 
                      placeholder="e.g. low sodium"
                      value={medicalRestrictions} 
                      onChange={(e) => setMedicalRestrictions(e.target.value)} 
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Food Dislikes</label>
                    <input 
                      type="text" 
                      placeholder="e.g. olives, mushrooms"
                      value={foodDislikes} 
                      onChange={(e) => setFoodDislikes(e.target.value)} 
                      className={inputStyle}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Favorite Foods</label>
                    <input 
                      type="text" 
                      placeholder="e.g. chicken breast, oats"
                      value={favoriteFoods} 
                      onChange={(e) => setFavoriteFoods(e.target.value)} 
                      className={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Buttons Controls */}
        {stepIdx < STEPS.length - 1 && (
          <div className="flex justify-between items-center border-t border-card-border pt-6 mt-8">
            <button
              onClick={handleBack}
              disabled={stepIdx === 0}
              className="py-3 px-5 rounded-xl border border-card-border text-xs font-bold text-muted hover:text-foreground disabled:opacity-30 cursor-pointer flex items-center gap-1 bg-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="py-3 px-6 rounded-xl bg-acid-green text-accent-foreground text-xs font-bold uppercase tracking-wider cursor-pointer hover:shadow-lg disabled:opacity-50 border-none flex items-center gap-1.5"
            >
              {stepIdx === STEPS.length - 2 ? 'Finalize Program' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
