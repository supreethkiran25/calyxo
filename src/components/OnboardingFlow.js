import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronRight, ChevronLeft, Heart, Target, Calendar, 
  Shield, Scale, Check, Activity, Dumbbell, Utensils, Moon, 
  Watch, MessageSquare, Edit3, ArrowRight, UserCheck, AlertCircle, 
  Smartphone, Bluetooth, Flame, Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { saveUserProfile, saveEcosystemState } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { 
  UserIntelligenceProfile, 
  DEFAULT_USER_INTELLIGENCE_PROFILE 
} from '../services/onboarding/UserIntelligenceProfile';
import { StoryExtractionEngine } from '../services/ai/StoryExtractionEngine';
import { requestNotificationPermission } from '../services/notificationService';
import { Capacitor } from '@capacitor/core';
import LegalModal from './modals/LegalModal';

const SCREENS = [
  { id: 'welcome', title: "Let's build your Calyxo", category: 'Welcome' },
  { id: 'goals', title: 'What are you working toward?', category: 'Goals' },
  { id: 'body_profile', title: 'Your body baseline', category: 'Body Profile' },
  { id: 'fitness_experience', title: 'Your fitness journey', category: 'Training' },
  { id: 'training_environment', title: 'Training & Equipment', category: 'Environment' },
  { id: 'nutrition', title: 'Nutrition Personalization', category: 'Nutrition' },
  { id: 'lifestyle', title: 'Daily Rhythm & Sleep', category: 'Lifestyle' },
  { id: 'limitations', title: 'Workout Adaptations', category: 'Adaptations' },
  { id: 'devices', title: 'Health Ecosystem', category: 'Devices' },
  { id: 'coaching', title: 'AI Coach Personality', category: 'Coaching' },
  { id: 'story', title: 'Tell Calyxo Your Story', category: 'Your Story' },
  { id: 'summary', title: 'Calyxo Understands You', category: 'Summary' }
];

export default function OnboardingFlow({ onComplete, onNotification }) {
  const { user, updateUserProfile, userProfile } = useStore();
  const ecoStore = useEcosystemStore();
  const userId = user?.uid || user?.id;

  // Initialize from saved local draft or default profile
  const [currentScreenIdx, setCurrentScreenIdx] = useState(0);
  const [profile, setProfile] = useState(() => {
    const draft = UserIntelligenceProfile.getLocalDraft();
    if (draft && draft.profile) {
      return UserIntelligenceProfile.sanitize(draft.profile);
    }
    return UserIntelligenceProfile.sanitize(userProfile || DEFAULT_USER_INTELLIGENCE_PROFILE);
  });

  const [units, setUnits] = useState('metric');
  const [legalModalType, setLegalModalType] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [liveStorySignals, setLiveStorySignals] = useState({ extractedContext: {}, confidence: 0, signalsFound: [] });

  // Load saved step index if resuming
  useEffect(() => {
    const draft = UserIntelligenceProfile.getLocalDraft();
    if (draft && typeof draft.screenIdx === 'number' && draft.screenIdx > 0 && draft.screenIdx < SCREENS.length) {
      setCurrentScreenIdx(draft.screenIdx);
    }
  }, []);

  // Save progressive draft on step or profile change
  useEffect(() => {
    UserIntelligenceProfile.saveLocalDraft({
      screenIdx: currentScreenIdx,
      profile
    });
  }, [currentScreenIdx, profile]);

  // Live Story Extractor hook
  useEffect(() => {
    if (profile.story?.rawText) {
      const extracted = StoryExtractionEngine.extractContext(profile.story.rawText);
      setLiveStorySignals(extracted);
    }
  }, [profile.story?.rawText]);

  // State update helpers
  const updateSection = (section, updates) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
  };

  const handleNext = () => {
    if (currentScreenIdx < SCREENS.length - 1) {
      setCurrentScreenIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finalizeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentScreenIdx > 0) {
      setCurrentScreenIdx(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkipToSummary = () => {
    setCurrentScreenIdx(SCREENS.length - 1);
  };

  const finalizeOnboarding = async () => {
    setIsFinalizing(true);
    try {
      // Merge story signals into profile if extracted
      const finalStory = {
        rawText: profile.story?.rawText || '',
        extractedContext: liveStorySignals.extractedContext || {},
        confidence: liveStorySignals.confidence || 1.0
      };

      const finalProfile = UserIntelligenceProfile.sanitize({
        ...profile,
        story: finalStory,
        onboardingCompleted: true,
        onboarded: true,
        role: 'user',
        // Flatten top-level compatibility fields for legacy components
        goal: profile.goals.primaryGoal,
        goalWeight: profile.goals.targetWeight,
        experience: profile.training.experience,
        weight: profile.identity.weight,
        height: profile.identity.height,
        age: profile.identity.age,
        dob: profile.identity.dob,
        gender: profile.identity.sex,
        coachPersonality: profile.coaching.personality,
        responseLength: profile.coaching.verbosity,
        dietPreferences: [profile.nutrition.diet]
      });

      // 1. Update Zustand store
      if (updateUserProfile) {
        updateUserProfile(finalProfile);
      }

      // 2. Persist to Supabase Database
      if (userId) {
        await saveUserProfile(userId, finalProfile);
        await saveEcosystemState(userId, {
          onboardingCompleted: true,
          initialGoal: finalProfile.goals.primaryGoal,
          coachingStyle: finalProfile.coaching.personality
        });
      }

      // 3. Clear local onboarding draft
      UserIntelligenceProfile.clearLocalDraft();

      // 4. Request notifications if user enabled
      if (Capacitor.isNativePlatform()) {
        await requestNotificationPermission().catch(() => {});
      }

      if (onComplete) {
        onComplete(finalProfile);
      }
    } catch (err) {
      console.error('[Onboarding] Finalization error:', err);
    } finally {
      setIsFinalizing(false);
    }
  };

  const currentScreen = SCREENS[currentScreenIdx];
  const progressPercent = Math.round(((currentScreenIdx) / (SCREENS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-amber-500/30">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header & Progress Bar */}
      <header className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">CALYXO</span>
          </div>

          {currentScreenIdx > 0 && currentScreenIdx < SCREENS.length - 1 && (
            <button
              onClick={handleSkipToSummary}
              className="text-xs text-slate-400 hover:text-white transition-colors px-2.5 py-1 rounded-lg bg-slate-800/40 border border-slate-700/40"
            >
              Skip to Review
            </button>
          )}
        </div>

        {/* Dynamic Progress Bar */}
        {currentScreenIdx > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>{currentScreen.category}</span>
              <span>{currentScreenIdx} of {SCREENS.length - 1}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Interactive Screen Viewport */}
      <main className="relative z-10 w-full max-w-2xl mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen.id}
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* SCREEN 01 — WELCOME */}
            {currentScreen.id === 'welcome' && (
              <div className="text-center py-6 space-y-8">
                <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center shadow-2xl shadow-amber-500/10">
                  <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-xl animate-pulse" />
                  <Sparkles className="w-12 h-12 text-amber-400" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    Let's build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Calyxo</span>.
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                    Tell us a little about yourself. We'll use it to make your workouts, nutrition, recovery, and AI guidance deeply personal.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto text-left">
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <Dumbbell className="w-4 h-4 text-amber-400 mb-1.5" />
                    <p className="text-xs font-semibold text-white">AI Coach</p>
                    <p className="text-[10px] text-slate-400">Customized splits</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <Utensils className="w-4 h-4 text-emerald-400 mb-1.5" />
                    <p className="text-xs font-semibold text-white">Smart Nutrition</p>
                    <p className="text-[10px] text-slate-400">Diet & macros</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <Moon className="w-4 h-4 text-indigo-400 mb-1.5" />
                    <p className="text-xs font-semibold text-white">Recovery</p>
                    <p className="text-[10px] text-slate-400">Daily readiness</p>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 02 — GOAL DISCOVERY */}
            {currentScreen.id === 'goals' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">What are you working toward?</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Select your primary goal and key priority.</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: 'lose_body_fat', label: 'Lose body fat', desc: 'Optimize energy deficit & lean tone' },
                    { id: 'build_muscle', label: 'Build muscle', desc: 'Hypertrophy volume & progressive overload' },
                    { id: 'get_stronger', label: 'Get stronger', desc: 'Compound lifts & raw force production' },
                    { id: 'improve_fitness', label: 'Improve fitness', desc: 'Cardiovascular health & mobility' },
                    { id: 'improve_endurance', label: 'Improve endurance', desc: 'Stamina, running & metabolic capacity' },
                    { id: 'improve_overall_health', label: 'Improve overall health', desc: 'Longevity, vitality & clean habits' },
                    { id: 'improve_sleep_recovery', label: 'Improve sleep & recovery', desc: 'Restorative sleep & nervous system rest' },
                    { id: 'maintain_physique', label: 'Maintain my current physique', desc: 'Consistent energy balance & strength' },
                    { id: 'prepare_sport_event', label: 'Prepare for a sport/event', desc: 'Targeted athletic conditioning' },
                    { id: 'not_sure_yet', label: "I'm not sure yet", desc: 'Guided baseline & discovery' }
                  ].map((goalOption) => {
                    const isSelected = profile.goals.primaryGoal === goalOption.id;
                    return (
                      <button
                        key={goalOption.id}
                        type="button"
                        onClick={() => updateSection('goals', { primaryGoal: goalOption.id })}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10' 
                            : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                            {goalOption.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{goalOption.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Primary Priority Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    What's the biggest thing you want to improve?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['body_composition', 'strength', 'energy', 'nutrition', 'sleep', 'recovery', 'consistency', 'performance'].map((p) => {
                      const isSelected = profile.goals.primaryPriority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => updateSection('goals', { primaryPriority: p })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-medium capitalize transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {p.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 03 — BODY PROFILE */}
            {currentScreen.id === 'body_profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Your body baseline</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Your height and weight help Calyxo estimate energy requirements and personalize your recommendations.
                  </p>
                </div>

                <div className="flex justify-end">
                  <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => setUnits('metric')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        units === 'metric' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Metric (kg/cm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnits('imperial')}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        units === 'imperial' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Imperial (lbs/ft)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date of Birth / Age */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Date of Birth</span>
                      <span className="text-amber-400">{profile.identity.age} years old</span>
                    </label>
                    <input
                      type="date"
                      value={profile.identity.dob || '2001-01-01'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const age = Math.max(12, Math.min(100, new Date().getFullYear() - new Date(val).getFullYear()));
                        updateSection('identity', { dob: val, age });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Biological Sex */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Sex (for baseline metabolism)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['male', 'female', 'other'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateSection('identity', { sex: s })}
                          className={`py-2 text-xs rounded-xl border font-medium capitalize transition-all ${
                            profile.identity.sex === s 
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' 
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Height */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Height ({units === 'metric' ? 'cm' : 'inches'})</label>
                    <input
                      type="number"
                      min={100}
                      max={250}
                      value={profile.identity.height || 175}
                      onChange={(e) => updateSection('identity', { height: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  {/* Weight */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Current Weight ({units === 'metric' ? 'kg' : 'lbs'})</label>
                    <input
                      type="number"
                      min={30}
                      max={300}
                      value={profile.identity.weight || 70}
                      onChange={(e) => updateSection('identity', { weight: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>
                </div>

                {/* Optional Target Weight & Body Fat */}
                <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-300">Optional Metrics</p>
                    <span className="text-[10px] text-slate-500">Leave blank if unknown</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Target Weight ({units === 'metric' ? 'kg' : 'lbs'})</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={profile.identity.targetWeight || ''}
                        onChange={(e) => updateSection('identity', { targetWeight: e.target.value ? Number(e.target.value) : null })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Body Fat %</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={profile.identity.bodyFat || ''}
                        onChange={(e) => updateSection('identity', { bodyFat: e.target.value ? Number(e.target.value) : null })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 04 — FITNESS EXPERIENCE */}
            {currentScreen.id === 'fitness_experience' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Where are you in your fitness journey?</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Calyxo calibrates progression to your exact starting baseline.</p>
                </div>

                {/* Experience stage */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'complete_beginner', label: 'Complete beginner' },
                    { id: 'getting_started_again', label: 'Getting started again' },
                    { id: 'beginner', label: 'Beginner (<1 year)' },
                    { id: 'intermediate', label: 'Intermediate (1–3 yrs)' },
                    { id: 'advanced', label: 'Advanced (3+ yrs)' },
                    { id: 'competitive', label: 'Competitive Athlete' }
                  ].map((exp) => {
                    const isSelected = profile.training.experience === exp.id;
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => updateSection('training', { experience: exp.id })}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all ${
                          isSelected 
                            ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {exp.label}
                      </button>
                    );
                  })}
                </div>

                {/* Training Frequency */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">How often do you currently train?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'never', label: 'Never' },
                      { id: '1_2_days', label: '1–2 days/wk' },
                      { id: '3_4_days', label: '3–4 days/wk' },
                      { id: '5_plus_days', label: '5+ days/wk' }
                    ].map((freq) => {
                      const isSelected = profile.training.frequency === freq.id;
                      return (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => updateSection('training', { frequency: freq.id })}
                          className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {freq.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Session Duration */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">How long can you realistically train?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'under_20', label: '< 20 min' },
                      { id: '20_30', label: '20–30 min' },
                      { id: '30_45', label: '30–45 min' },
                      { id: '45_60', label: '45–60 min' },
                      { id: '60_plus', label: '60+ min' }
                    ].map((dur) => {
                      const isSelected = profile.training.duration === dur.id;
                      return (
                        <button
                          key={dur.id}
                          type="button"
                          onClick={() => updateSection('training', { duration: dur.id })}
                          className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {dur.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 05 — TRAINING ENVIRONMENT & EQUIPMENT */}
            {currentScreen.id === 'training_environment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Where do you train?</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Select your primary training environment and equipment.</p>
                </div>

                {/* Environment */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'commercial_gym', label: 'Commercial Gym' },
                    { id: 'home_gym', label: 'Home Gym' },
                    { id: 'home_bodyweight', label: 'Bodyweight / Home' },
                    { id: 'outdoor', label: 'Outdoor' },
                    { id: 'running', label: 'Running / Track' },
                    { id: 'sports', label: 'Sports Field' },
                    { id: 'mixed', label: 'Mixed' }
                  ].map((env) => {
                    const isSelected = profile.training.environment === env.id;
                    return (
                      <button
                        key={env.id}
                        type="button"
                        onClick={() => updateSection('training', { environment: env.id })}
                        className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                          isSelected 
                            ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                            : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {env.label}
                      </button>
                    );
                  })}
                </div>

                {/* Equipment Multi-select */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">What equipment do you have access to?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'dumbbells', 'barbells', 'machines', 'cable_machines', 
                      'kettlebells', 'resistance_bands', 'cardio_machines', 'bodyweight', 'full_gym'
                    ].map((eq) => {
                      const currentEq = profile.training.equipment || [];
                      const isChecked = currentEq.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => {
                            const updated = isChecked 
                              ? currentEq.filter(item => item !== eq)
                              : [...currentEq, eq];
                            updateSection('training', { equipment: updated });
                          }}
                          className={`p-3 rounded-xl border text-left text-xs font-medium capitalize flex items-center justify-between transition-all ${
                            isChecked 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>{eq.replace('_', ' ')}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'border-amber-400 bg-amber-400' : 'border-slate-700'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 06 — NUTRITION PERSONALIZATION */}
            {currentScreen.id === 'nutrition' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Let's understand how you eat</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Calyxo AI Meal Planner builds recipes tailored to your kitchen.</p>
                </div>

                {/* Diet Type */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Dietary Pattern</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'vegetarian', label: 'Vegetarian' },
                      { id: 'vegan', label: 'Vegan' },
                      { id: 'eggetarian', label: 'Eggetarian' },
                      { id: 'non_vegetarian', label: 'Non-Vegetarian' },
                      { id: 'pescatarian', label: 'Pescatarian' },
                      { id: 'other', label: 'Other / Flexitarian' }
                    ].map((d) => {
                      const isSelected = profile.nutrition.diet === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => updateSection('nutrition', { diet: d.id })}
                          className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cuisines */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">Preferred Cuisines</label>
                  <div className="flex flex-wrap gap-2">
                    {['South Indian', 'North Indian', 'Indian', 'Mediterranean', 'Asian', 'Western', 'Mixed'].map((cuisine) => {
                      const currentCuisines = profile.nutrition.cuisines || [];
                      const isSelected = currentCuisines.includes(cuisine);
                      return (
                        <button
                          key={cuisine}
                          type="button"
                          onClick={() => {
                            const updated = isSelected 
                              ? currentCuisines.filter(c => c !== cuisine)
                              : [...currentCuisines, cuisine];
                            updateSection('nutrition', { cuisines: updated });
                          }}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {cuisine}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nutrition Priority */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">Nutrition Priority</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'fat_loss', label: 'Fat Loss' },
                      { id: 'muscle_gain', label: 'Muscle Gain' },
                      { id: 'high_protein', label: 'High Protein' },
                      { id: 'better_energy', label: 'Better Energy' },
                      { id: 'better_food_quality', label: 'Food Quality' },
                      { id: 'better_digestion', label: 'Digestion' },
                      { id: 'balanced', label: 'Balanced' }
                    ].map((np) => {
                      const isSelected = profile.nutrition.nutritionPriority === np.id;
                      return (
                        <button
                          key={np.id}
                          type="button"
                          onClick={() => updateSection('nutrition', { nutritionPriority: np.id })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {np.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 07 — LIFESTYLE & RECOVERY */}
            {currentScreen.id === 'lifestyle' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Your daily rhythm</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Lifestyle factors calibrate recovery and strain targets.</p>
                </div>

                {/* Daily Activity */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">How active is your normal day?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'mostly_sitting', label: 'Mostly sitting' },
                      { id: 'somewhat_active', label: 'Somewhat active' },
                      { id: 'active', label: 'Active' },
                      { id: 'very_active', label: 'Very active' }
                    ].map((act) => {
                      const isSelected = profile.lifestyle.activityLevel === act.id;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => updateSection('lifestyle', { activityLevel: act.id })}
                          className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {act.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sleep Duration */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">How much do you usually sleep?</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {['under_5h', '5_6h', '6_7h', '7_8h', '8h_plus'].map((sl) => {
                      const isSelected = profile.lifestyle.sleepDuration === sl;
                      return (
                        <button
                          key={sl}
                          type="button"
                          onClick={() => updateSection('lifestyle', { sleepDuration: sl })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-indigo-500/15 border-indigo-400 text-indigo-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {sl.replace('_', '–').replace('h', ' hrs')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stress Level */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">Typical Daily Stress Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['low', 'moderate', 'high', 'very_high'].map((st) => {
                      const isSelected = profile.lifestyle.stressLevel === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => updateSection('lifestyle', { stressLevel: st })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-medium capitalize transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 08 — TRAINING LIMITATIONS & PREFERENCES */}
            {currentScreen.id === 'limitations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Workout adaptations</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Tell Calyxo what movements or areas you'd like your workouts to account for.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Protected Areas to Adapt</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['shoulder', 'back', 'knee', 'hip', 'ankle', 'wrist', 'neck', 'elbow'].map((area) => {
                      const currentAreas = profile.limitations.protectedAreas || [];
                      const isSelected = currentAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            const updated = isSelected 
                              ? currentAreas.filter(a => a !== area)
                              : [...currentAreas, area];
                            updateSection('limitations', { protectedAreas: updated });
                          }}
                          className={`p-3 rounded-xl border text-center text-xs font-semibold capitalize transition-all ${
                            isSelected 
                              ? 'bg-red-500/15 border-red-400 text-red-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                  💡 Calyxo uses these preferences to automatically substitute high-load compound movements with safer joint-friendly variations.
                </div>
              </div>
            )}

            {/* SCREEN 09 — DEVICE ECOSYSTEM */}
            {currentScreen.id === 'devices' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Where does your health data live?</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Connect your active wearables or log manually in Calyxo.</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: 'appleWatch', label: 'Apple Watch & Apple Health', platform: 'iOS', available: true },
                    { id: 'boat', label: 'boAt Smartwatch', platform: 'Universal', available: true },
                    { id: 'bleHeartRate', label: 'Bluetooth Heart Rate Monitor (BLE HR)', platform: 'Universal', available: true },
                    { id: 'bleBloodPressure', label: 'Bluetooth Blood Pressure Monitor', platform: 'Universal', available: true },
                    { id: 'healthConnect', label: 'Android Health Connect', platform: 'Android', available: true }
                  ].map((dev) => {
                    const isConnected = profile.devices[dev.id];
                    return (
                      <div
                        key={dev.id}
                        className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Watch className="w-5 h-5 text-amber-400" />
                          <div>
                            <p className="text-sm font-semibold text-white">{dev.label}</p>
                            <p className="text-[11px] text-slate-400">{dev.platform} Integration</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateSection('devices', { [dev.id]: !isConnected });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isConnected 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isConnected ? 'Connected ✓' : 'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 10 — AI COACH PERSONALITY */}
            {currentScreen.id === 'coaching' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">How should Calyxo coach you?</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure your coach's personality and communication style.</p>
                </div>

                {/* Personality */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'supportive', label: 'Supportive', desc: 'Encouraging & positive' },
                    { id: 'direct', label: 'Direct', desc: 'Clear, concise & practical' },
                    { id: 'tough_love', label: 'Tough Love', desc: 'No excuses, high accountability' },
                    { id: 'data_driven', label: 'Data-Driven', desc: 'Focused on metrics & physiology' },
                    { id: 'friendly', label: 'Friendly', desc: 'Conversational partner' },
                    { id: 'minimal', label: 'Minimal', desc: 'Only essential instructions' }
                  ].map((style) => {
                    const isSelected = profile.coaching.personality === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateSection('coaching', { personality: style.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected 
                            ? 'bg-amber-500/15 border-amber-400' 
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <p className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                          {style.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{style.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Reminder Style */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">How should reminders feel?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'gentle', label: 'Gentle' },
                      { id: 'direct', label: 'Direct' },
                      { id: 'motivational', label: 'Motivational' },
                      { id: 'only_important', label: 'Only Important' }
                    ].map((rem) => {
                      const isSelected = profile.coaching.reminderStyle === rem.id;
                      return (
                        <button
                          key={rem.id}
                          type="button"
                          onClick={() => updateSection('coaching', { reminderStyle: rem.id })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 border-amber-400 text-amber-300' 
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {rem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 11 — YOUR STORY */}
            {currentScreen.id === 'story' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Tell Calyxo your story</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Anything you think would help us understand your schedule, obstacles, and routine better.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={profile.story?.rawText || ''}
                    onChange={(e) => updateSection('story', { rawText: e.target.value })}
                    placeholder="e.g. I've been training for two years, stopped for a few months because of college, and now I want to build muscle without spending more than 45 minutes in the gym."
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500 leading-relaxed resize-none"
                  />
                </div>

                {/* Real-time Extracted Signals Feedback */}
                {liveStorySignals.signalsFound.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Extracted Intelligence
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-mono">
                        {Math.round(liveStorySignals.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {liveStorySignals.signalsFound.map((sig, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/30">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* SCREEN 12 — FINAL CONFIRMATION SUMMARY */}
            {currentScreen.id === 'summary' && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Calyxo Understands You</h2>
                  <p className="text-xs text-slate-400">Everything is calibrated from your authentic responses.</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-4 shadow-xl">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 font-medium">PRIMARY GOAL</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.goals.primaryGoal.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">SCHEDULE</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.training.frequency.replace(/_/g, ' ')} · {profile.training.duration.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">NUTRITION</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.nutrition.diet.replace(/_/g, ' ')} · {profile.nutrition.cuisines.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">RECOVERY BASELINE</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.lifestyle.sleepDuration.replace(/_/g, '–').replace('h', 'h')} · {profile.lifestyle.stressLevel} stress
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">COACHING STYLE</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.coaching.personality} · {profile.coaching.reminderStyle}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">BASELINE BODY</p>
                      <p className="font-bold text-white mt-0.5">
                        {profile.identity.weight}kg · {profile.identity.height}cm ({profile.identity.age}y)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-center text-[11px] text-slate-500">
                  <span>By starting, you agree to Calyxo's</span>
                  <button type="button" onClick={() => setLegalModalType('terms')} className="text-amber-400 underline">Terms</button>
                  <span>&</span>
                  <button type="button" onClick={() => setLegalModalType('privacy')} className="text-amber-400 underline">Privacy</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Navigation Actions */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto px-6 py-6 border-t border-slate-800/40">
        <div className="flex items-center justify-between gap-4">
          {currentScreenIdx > 0 && currentScreenIdx < SCREENS.length - 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentScreen.id === 'summary' ? (
            <div className="flex items-center gap-3 w-full justify-end">
              <button
                type="button"
                onClick={() => setCurrentScreenIdx(1)}
                className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors border border-slate-800 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                disabled={isFinalizing}
                onClick={finalizeOnboarding}
                className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isFinalizing ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                    Personalizing Calyxo...
                  </span>
                ) : (
                  <>
                    Start My Journey
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {currentScreen.id === 'welcome' ? "Let's begin" : 'Continue'}
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </footer>

      {/* Legal & Privacy Modal */}
      {legalModalType && (
        <LegalModal
          type={legalModalType}
          isOpen={Boolean(legalModalType)}
          onClose={() => setLegalModalType(null)}
        />
      )}
    </div>
  );
}
