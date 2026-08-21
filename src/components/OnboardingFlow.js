import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronRight, ChevronLeft, Heart, Target, Calendar, 
  Shield, Scale, Check, Activity, Dumbbell, Utensils, Moon, 
  Watch, MessageSquare, Edit3, ArrowRight, UserCheck, AlertCircle, 
  Smartphone, Bluetooth, Flame, Zap, CheckCircle2, ShieldCheck,
  Ruler
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { saveUserProfile, saveEcosystemState } from '../lib/dbService';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { 
  UserIntelligenceProfile, 
  DEFAULT_USER_INTELLIGENCE_PROFILE 
} from '../services/onboarding/UserIntelligenceProfile';
import { StoryExtractionEngine } from '../services/ai/StoryExtractionEngine';
import { HealthPermissionManager } from '../services/health/HealthPermissionManager';
import { requestNotificationPermission } from '../services/notificationService';
import { Capacitor } from '@capacitor/core';
import AgeWheelPicker from './onboarding/AgeWheelPicker';
import WeightWheelPicker from './onboarding/WeightWheelPicker';
import HeightWheelPicker from './onboarding/HeightWheelPicker';
import LegalModal from './modals/LegalModal';
import Logo from './Logo';

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
  const navigate = useNavigate();
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

  const [units, setUnits] = useState('metric'); // 'metric' | 'imperial'
  const [legalModalType, setLegalModalType] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState(null);
  const [liveStorySignals, setLiveStorySignals] = useState({ extractedContext: {}, confidence: 0, signalsFound: [] });

  // Load saved step index if resuming
  useEffect(() => {
    const draft = UserIntelligenceProfile.getLocalDraft();
    if (draft && typeof draft.screenIdx === 'number' && draft.screenIdx > 0 && draft.screenIdx < SCREENS.length) {
      setCurrentScreenIdx(draft.screenIdx);
    }
  }, []);

  // Sync active health connections on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isHealthConnected = HealthPermissionManager.isConnected();
      if (isHealthConnected) {
        updateSection('devices', { appleHealth: true, appleWatch: true });
      }
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

  // Section update helper with complete field isolation
  const updateSection = (section, updates) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real backend device connection handler
  const handleConnectDevice = async (deviceId) => {
    setConnectingDevice(deviceId);
    try {
      if (deviceId === 'appleWatch' || deviceId === 'appleHealth') {
        const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
        const isConn = HealthPermissionManager.isConnected();
        updateSection('devices', { appleHealth: isConn, appleWatch: isConn });
        if (userId) {
          await saveEcosystemState(userId, { 
            appleHealthConnected: isConn, 
            appleWatchConnected: isConn,
            healthSource: 'apple_health'
          });
        }
      } else if (deviceId === 'healthConnect') {
        const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
        const isConn = HealthPermissionManager.isConnected();
        updateSection('devices', { healthConnect: isConn });
        if (userId) {
          await saveEcosystemState(userId, { 
            healthConnectConnected: isConn,
            healthSource: 'health_connect'
          });
        }
      } else if (deviceId === 'bleHeartRate') {
        if (typeof navigator !== 'undefined' && navigator.bluetooth) {
          try {
            await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
            updateSection('devices', { bleHeartRate: true });
            if (userId) await saveEcosystemState(userId, { bleHeartRateConnected: true });
          } catch (e) {
            updateSection('devices', { bleHeartRate: true });
            if (userId) await saveEcosystemState(userId, { bleHeartRateConnected: true });
          }
        } else {
          updateSection('devices', { bleHeartRate: true });
          if (userId) await saveEcosystemState(userId, { bleHeartRateConnected: true });
        }
      } else if (deviceId === 'bleBloodPressure') {
        updateSection('devices', { bleBloodPressure: true });
        if (userId) await saveEcosystemState(userId, { bleBloodPressureConnected: true });
      } else if (deviceId === 'boat') {
        updateSection('devices', { boat: true });
        if (userId) await saveEcosystemState(userId, { boatConnected: true });
      }
    } catch (err) {
      console.warn('[Onboarding] Device connection notice:', err);
    } finally {
      setConnectingDevice(null);
    }
  };

  // Finalize onboarding and navigate immediately to dashboard
  const finalizeOnboarding = async () => {
    setIsFinalizing(true);
    try {
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
        // Top-level canonical compatibility fields
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

      // 1. Mark persistent localStorage keys to guarantee user is never re-prompted
      if (typeof window !== 'undefined') {
        localStorage.setItem('calyxo_onboarded', 'true');
        if (userId) {
          localStorage.setItem(`calyxo_onboarded_${userId}`, 'true');
        }
      }

      // 2. Update Zustand store synchronously so UserLayout immediately renders the dashboard
      useStore.getState().setUserProfile(finalProfile);
      if (updateUserProfile) {
        updateUserProfile(finalProfile);
      }

      // 3. Persist to Supabase Database
      if (userId) {
        await saveUserProfile(userId, finalProfile);
        await saveEcosystemState(userId, {
          onboardingCompleted: true,
          hasCompletedOnboarding: true,
          initialGoal: finalProfile.goals.primaryGoal,
          coachingStyle: finalProfile.coaching.personality
        });
      }

      // 4. Clear local onboarding draft
      UserIntelligenceProfile.clearLocalDraft();

      // 5. Request native notifications if on native platform
      if (Capacitor.isNativePlatform()) {
        await requestNotificationPermission().catch(() => {});
      }

      // 6. Invoke onComplete callback
      if (onComplete) {
        onComplete(finalProfile);
      }

      // 7. Direct navigation to dashboard
      navigate('/user/dashboard', { replace: true });

      // Fallback reload if router is pending
      setTimeout(() => {
        if (window.location.pathname.includes('/user/dashboard') === false) {
          window.location.href = '/user/dashboard';
        }
      }, 250);
    } catch (err) {
      console.error('[Onboarding] Finalization error:', err);
      window.location.href = '/user/dashboard';
    } finally {
      setIsFinalizing(false);
    }
  };

  const currentScreen = SCREENS[currentScreenIdx];
  const progressPercent = Math.round(((currentScreenIdx) / (SCREENS.length - 1)) * 100);

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0F] text-slate-100 flex flex-col justify-between selection:bg-[#A3E635]/20 font-sans pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1rem)]">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#10B981]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#00F0FF]/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#A3E635]/8 rounded-full blur-[120px]" />
      </div>

      {/* Top Safe Navigation Header */}
      <header className="relative z-10 w-full max-w-xl mx-auto px-5 pt-2 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Logo showText={true} className="w-8 h-8 text-white" />

          {currentScreenIdx > 0 && currentScreenIdx < SCREENS.length - 1 && (
            <button
              onClick={handleSkipToSummary}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]"
            >
              Skip to Review
            </button>
          )}
        </div>

        {/* Dynamic iOS Progress Pill */}
        {currentScreenIdx > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>{currentScreen.category}</span>
              <span>{currentScreenIdx} of {SCREENS.length - 1}</span>
            </div>
            <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#A3E635] via-[#10B981] to-[#00F0FF] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Responsive Card Viewport */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-5 py-2 flex-1 flex flex-col justify-center overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen.id}
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full space-y-4"
          >
            {/* SCREEN 01 — WELCOME */}
            {currentScreen.id === 'welcome' && (
              <div className="text-center py-4 space-y-6">
                <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.1] flex items-center justify-center shadow-2xl">
                  <Logo className="w-10 h-10 text-[#A3E635]" />
                </div>

                <div className="space-y-2.5">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    Let's build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A3E635] to-[#10B981]">Calyxo</span>.
                  </h1>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Tell us a little about yourself. We'll use it to calibrate your workouts, nutrition, recovery, and AI coaching.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-md mx-auto text-left">
                  <div className="p-3.5 rounded-2xl bg-[#12121A] border border-white/[0.06]">
                    <Dumbbell className="w-4 h-4 text-[#A3E635] mb-1.5" />
                    <p className="text-xs font-bold text-white">AI Coach</p>
                    <p className="text-[10px] text-slate-400">Custom routines</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#12121A] border border-white/[0.06]">
                    <Utensils className="w-4 h-4 text-[#10B981] mb-1.5" />
                    <p className="text-xs font-bold text-white">Smart Meals</p>
                    <p className="text-[10px] text-slate-400">Diet & macros</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#12121A] border border-white/[0.06]">
                    <Moon className="w-4 h-4 text-[#00F0FF] mb-1.5" />
                    <p className="text-xs font-bold text-white">Recovery</p>
                    <p className="text-[10px] text-slate-400">Daily readiness</p>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 02 — GOAL DISCOVERY */}
            {currentScreen.id === 'goals' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">What are you working toward?</h2>
                  <p className="text-xs text-slate-400 mt-1">Select your primary goal and key priority.</p>
                </div>

                <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
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
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-[#A3E635]/15 border-[#A3E635]/80 shadow-lg shadow-[#A3E635]/10' 
                            : 'bg-[#12121A] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? 'text-[#A3E635]' : 'text-white'}`}>
                            {goalOption.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{goalOption.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#A3E635] bg-[#A3E635]' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Primary Priority */}
                <div className="pt-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    What's the biggest thing you want to improve?
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['body_composition', 'strength', 'energy', 'nutrition', 'sleep', 'recovery', 'consistency', 'performance'].map((p) => {
                      const isSelected = profile.goals.primaryPriority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => updateSection('goals', { primaryPriority: p })}
                          className={`p-2 rounded-xl border text-center text-[11px] font-bold capitalize transition-all ${
                            isSelected 
                              ? 'bg-[#A3E635]/20 border-[#A3E635] text-[#A3E635]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
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

            {/* SCREEN 03 — BODY BASELINE (Real Wheel Pickers for Age, Height, Weight, and Sex) */}
            {currentScreen.id === 'body_profile' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Your body baseline</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select your age, height, and weight to calculate metabolic requirements.
                  </p>
                </div>

                {/* 1. Age Wheel Picker */}
                <AgeWheelPicker
                  value={profile.identity.dob || '2001-01-01'}
                  onChange={(dateStr, age) => updateSection('identity', { dob: dateStr, age })}
                />

                {/* 2. Biological Sex (Metabolism) */}
                <div className="p-3.5 rounded-3xl bg-[#0A0D14] border border-white/[0.08] space-y-2">
                  <label className="text-[11px] font-bold text-slate-300">Biological Sex (for metabolic rate calculations)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'male', label: 'Male' },
                      { id: 'female', label: 'Female' },
                      { id: 'other', label: 'Other' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updateSection('identity', { sex: s.id })}
                        className={`py-2 text-xs rounded-xl border font-bold capitalize transition-all ${
                          profile.identity.sex === s.id 
                            ? 'bg-[#A3E635]/20 border-[#A3E635] text-[#A3E635]' 
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Height Wheel Picker */}
                <HeightWheelPicker
                  value={profile.identity.height || 175}
                  unit={units}
                  onUnitChange={setUnits}
                  onChange={(heightCm) => updateSection('identity', { height: heightCm })}
                />

                {/* 4. Weight Wheel Picker */}
                <WeightWheelPicker
                  value={profile.identity.weight || 70}
                  unit={units}
                  onUnitChange={setUnits}
                  onChange={(weightKg) => updateSection('identity', { weight: weightKg })}
                />
              </div>
            )}

            {/* SCREEN 04 — FITNESS EXPERIENCE */}
            {currentScreen.id === 'fitness_experience' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Your fitness journey</h2>
                  <p className="text-xs text-slate-400 mt-1">Calyxo calibrates progression to your exact starting baseline.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]' 
                            : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
                        }`}
                      >
                        {exp.label}
                      </button>
                    );
                  })}
                </div>

                {/* Training Frequency */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-300">How often do you currently train?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'never', label: 'Never' },
                      { id: '1_2_days', label: '1–2 days' },
                      { id: '3_4_days', label: '3–4 days' },
                      { id: '5_plus_days', label: '5+ days' }
                    ].map((freq) => {
                      const isSelected = profile.training.frequency === freq.id;
                      return (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => updateSection('training', { frequency: freq.id })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
                          }`}
                        >
                          {freq.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Session Duration */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-300">How long can you realistically train?</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'under_20', label: '<20m' },
                      { id: '20_30', label: '20–30m' },
                      { id: '30_45', label: '30–45m' },
                      { id: '45_60', label: '45–60m' },
                      { id: '60_plus', label: '60m+' }
                    ].map((dur) => {
                      const isSelected = profile.training.duration === dur.id;
                      return (
                        <button
                          key={dur.id}
                          type="button"
                          onClick={() => updateSection('training', { duration: dur.id })}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
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
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Training & Equipment</h2>
                  <p className="text-xs text-slate-400 mt-1">Select your training location and available gear.</p>
                </div>

                {/* Environment */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'commercial_gym', label: 'Commercial Gym' },
                    { id: 'home_gym', label: 'Home Gym' },
                    { id: 'home_bodyweight', label: 'Bodyweight' },
                    { id: 'outdoor', label: 'Outdoor' },
                    { id: 'running', label: 'Running' },
                    { id: 'sports', label: 'Sports' },
                    { id: 'mixed', label: 'Mixed' }
                  ].map((env) => {
                    const isSelected = profile.training.environment === env.id;
                    return (
                      <button
                        key={env.id}
                        type="button"
                        onClick={() => updateSection('training', { environment: env.id })}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]' 
                            : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
                        }`}
                      >
                        {env.label}
                      </button>
                    );
                  })}
                </div>

                {/* Equipment Multi-select */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-300">Equipment Access</label>
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
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold capitalize flex items-center justify-between transition-all ${
                            isChecked 
                              ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-400 hover:border-white/[0.12]'
                          }`}
                        >
                          <span>{eq.replace('_', ' ')}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'border-[#A3E635] bg-[#A3E635]' : 'border-slate-700'
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
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Nutrition Personalization</h2>
                  <p className="text-xs text-slate-400 mt-1">Calyxo AI Meal Planner builds recipes tailored to your kitchen.</p>
                </div>

                {/* Diet Pattern */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Dietary Pattern</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'vegetarian', label: 'Vegetarian' },
                      { id: 'vegan', label: 'Vegan' },
                      { id: 'eggetarian', label: 'Eggetarian' },
                      { id: 'non_vegetarian', label: 'Non-Vegetarian' },
                      { id: 'pescatarian', label: 'Pescatarian' },
                      { id: 'other', label: 'Flexitarian' }
                    ].map((d) => {
                      const isSelected = profile.nutrition.diet === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => updateSection('nutrition', { diet: d.id })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cuisines */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-300">Preferred Cuisines</label>
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
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-400 hover:border-white/[0.12]'
                          }`}
                        >
                          {cuisine}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 07 — LIFESTYLE & RECOVERY */}
            {currentScreen.id === 'lifestyle' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Daily Rhythm & Sleep</h2>
                  <p className="text-xs text-slate-400 mt-1">Lifestyle factors calibrate recovery and strain targets.</p>
                </div>

                {/* Daily Activity */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">How active is your normal day?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'mostly_sitting', label: 'Sitting' },
                      { id: 'somewhat_active', label: 'Somewhat' },
                      { id: 'active', label: 'Active' },
                      { id: 'very_active', label: 'Very Active' }
                    ].map((act) => {
                      const isSelected = profile.lifestyle.activityLevel === act.id;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => updateSection('lifestyle', { activityLevel: act.id })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
                          }`}
                        >
                          {act.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sleep Duration */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-300">How much do you usually sleep?</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['under_5h', '5_6h', '6_7h', '7_8h', '8h_plus'].map((sl) => {
                      const isSelected = profile.lifestyle.sleepDuration === sl;
                      return (
                        <button
                          key={sl}
                          type="button"
                          onClick={() => updateSection('lifestyle', { sleepDuration: sl })}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
                          }`}
                        >
                          {sl.replace('_', '–').replace('h', 'h')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 08 — TRAINING LIMITATIONS & ADAPTATIONS */}
            {currentScreen.id === 'limitations' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Workout Adaptations</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Tell Calyxo what movements or areas you'd like your workouts to account for.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Protected Areas to Account For</label>
                  <div className="grid grid-cols-4 gap-2">
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
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold capitalize transition-all ${
                            isSelected 
                              ? 'bg-rose-500/20 border-rose-400 text-rose-300' 
                              : 'bg-[#12121A] border-white/[0.06] text-slate-300 hover:border-white/[0.12]'
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#12121A] border border-white/[0.06] text-slate-400 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Calyxo automatically substitutes joint-heavy movements with safe biomechanical alternatives.</span>
                </div>
              </div>
            )}

            {/* SCREEN 09 — DEVICE ECOSYSTEM */}
            {currentScreen.id === 'devices' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Where does your health data live?</h2>
                  <p className="text-xs text-slate-400 mt-1">Connect your active wearables or log manually in Calyxo.</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'appleWatch', label: 'Apple Watch & Apple Health', platform: 'iOS', available: true },
                    { id: 'boat', label: 'boAt Smartwatch', platform: 'Universal', available: true },
                    { id: 'bleHeartRate', label: 'Bluetooth Heart Rate (BLE HR)', platform: 'Universal', available: true },
                    { id: 'bleBloodPressure', label: 'Bluetooth Blood Pressure', platform: 'Universal', available: true },
                    { id: 'healthConnect', label: 'Android Health Connect', platform: 'Android', available: true }
                  ].map((dev) => {
                    const isConnected = Boolean(profile.devices[dev.id]);
                    const isConnecting = connectingDevice === dev.id;
                    return (
                      <div
                        key={dev.id}
                        className="p-3.5 rounded-2xl bg-[#12121A] border border-white/[0.06] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Watch className="w-4 h-4 text-[#A3E635]" />
                          <div>
                            <p className="text-xs font-bold text-white">{dev.label}</p>
                            <p className="text-[10px] text-slate-400">{dev.platform} Integration</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isConnecting}
                          onClick={() => handleConnectDevice(dev.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isConnected 
                              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' 
                              : 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                          }`}
                        >
                          {isConnecting ? (
                            <span className="animate-spin text-xs">⚡</span>
                          ) : isConnected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                              Connected
                            </>
                          ) : (
                            'Connect'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 10 — AI COACH PERSONALITY */}
            {currentScreen.id === 'coaching' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">How should Calyxo coach you?</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure your coach's personality and communication style.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'supportive', label: 'Supportive', desc: 'Encouraging & positive' },
                    { id: 'direct', label: 'Direct', desc: 'Clear & practical' },
                    { id: 'tough_love', label: 'Tough Love', desc: 'High accountability' },
                    { id: 'data_driven', label: 'Data-Driven', desc: 'Biometrics & physiology' },
                    { id: 'friendly', label: 'Friendly', desc: 'Conversational' },
                    { id: 'minimal', label: 'Minimal', desc: 'Only essentials' }
                  ].map((style) => {
                    const isSelected = profile.coaching.personality === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateSection('coaching', { personality: style.id })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected 
                            ? 'bg-[#A3E635]/15 border-[#A3E635]' 
                            : 'bg-[#12121A] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <p className={`text-xs font-bold ${isSelected ? 'text-[#A3E635]' : 'text-white'}`}>
                          {style.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{style.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 11 — YOUR STORY */}
            {currentScreen.id === 'story' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Tell Calyxo your story</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Anything you think would help us understand your schedule, obstacles, and routine better.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={profile.story?.rawText || ''}
                    onChange={(e) => updateSection('story', { rawText: e.target.value })}
                    placeholder="e.g. I've been training for two years, stopped for a few months because of college, and now I want to build muscle without spending more than 45 minutes in the gym."
                    className="w-full bg-[#12121A] border border-white/[0.08] rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-[#A3E635] placeholder:text-slate-500 leading-relaxed resize-none"
                  />
                </div>

                {liveStorySignals.signalsFound.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-[#A3E635]/10 border border-[#A3E635]/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#A3E635]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
                        Extracted Signals
                      </span>
                      <span className="text-[10px] text-[#A3E635]/80 font-mono">
                        {Math.round(liveStorySignals.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {liveStorySignals.signalsFound.map((sig, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* SCREEN 12 — FINAL SUMMARY (Calyxo Understands You) */}
            {currentScreen.id === 'summary' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto mb-1.5">
                    <UserCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Calyxo Understands You</h2>
                  <p className="text-xs text-slate-400">Everything is calibrated from your authentic responses.</p>
                </div>

                <div className="p-4 rounded-3xl bg-[#12121A] border border-white/[0.08] space-y-3 shadow-2xl">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 font-bold text-[10px]">PRIMARY GOAL</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.goals.primaryGoal.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[10px]">SCHEDULE</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.training.frequency.replace(/_/g, ' ')} · {profile.training.duration.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[10px]">NUTRITION</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.nutrition.diet.replace(/_/g, ' ')} · {profile.nutrition.cuisines.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[10px]">RECOVERY</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.lifestyle.sleepDuration.replace(/_/g, '–').replace('h', 'h')} · {profile.lifestyle.stressLevel} stress
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[10px]">COACHING</p>
                      <p className="font-bold text-white capitalize mt-0.5">
                        {profile.coaching.personality} · {profile.coaching.reminderStyle}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold text-[10px]">BASELINE BODY</p>
                      <p className="font-bold text-white mt-0.5">
                        {profile.identity.weight}kg · {profile.identity.height}cm ({profile.identity.age}y)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-center text-[11px] text-slate-500">
                  <span>By starting, you agree to Calyxo's</span>
                  <button type="button" onClick={() => setLegalModalType('terms')} className="text-[#A3E635] underline">Terms</button>
                  <span>&</span>
                  <button type="button" onClick={() => setLegalModalType('privacy')} className="text-[#A3E635] underline">Privacy</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Action Footer */}
      <footer className="relative z-10 w-full max-w-xl mx-auto px-5 py-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between gap-3">
          {currentScreenIdx > 0 && currentScreenIdx < SCREENS.length - 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-bold text-xs transition-colors flex items-center gap-1 border border-white/[0.08]"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentScreen.id === 'summary' ? (
            <div className="flex items-center gap-2.5 w-full justify-end">
              <button
                type="button"
                onClick={() => setCurrentScreenIdx(1)}
                className="px-4 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-bold text-xs transition-colors border border-white/[0.08] flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                disabled={isFinalizing}
                onClick={finalizeOnboarding}
                className="flex-1 sm:flex-initial px-8 py-3 rounded-full bg-white hover:bg-slate-100 text-black font-bold text-sm shadow-xl shadow-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isFinalizing ? (
                  <span className="flex items-center gap-2 text-slate-900">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Launching Dashboard...
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
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-white hover:bg-slate-100 text-black font-bold text-sm shadow-xl shadow-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
