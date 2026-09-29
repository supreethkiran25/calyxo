import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronRight, ChevronLeft, Heart, Target, Calendar, 
  Shield, Scale, Check, Activity, Dumbbell, Utensils, Moon, 
  Watch, MessageSquare, Edit3, ArrowRight, UserCheck, AlertCircle, 
  Smartphone, Bluetooth, Flame, Zap, CheckCircle2, ShieldCheck,
  Ruler, Clock, Coffee, Sunrise, Sunset, ExternalLink
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
import { HealthDataService } from '../services/health/HealthDataService';
import { requestNotificationPermission } from '../services/notificationService';
import { Capacitor } from '@capacitor/core';
import AgeWheelPicker from './onboarding/AgeWheelPicker';
import WeightWheelPicker from './onboarding/WeightWheelPicker';
import HeightWheelPicker from './onboarding/HeightWheelPicker';
import LegalModal from './modals/LegalModal';
import WearablePairingModal from './modals/WearablePairingModal';
import Logo from './Logo';

const SCREENS = [
  { id: 'welcome', title: "Let's build your Calyxo", category: 'Welcome' },
  { id: 'goals', title: 'What are you working toward?', category: 'Goals' },
  { id: 'body_profile', title: 'Your body baseline', category: 'Body Profile' },
  { id: 'fitness_experience', title: 'Your fitness journey', category: 'Training' },
  { id: 'training_environment', title: 'Training & Equipment', category: 'Environment' },
  { id: 'nutrition', title: 'Nutrition Personalization', category: 'Nutrition' },
  { id: 'daily_routine', title: 'Daily Routine & Timings', category: 'Daily Routine' },
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
    let initial = draft && draft.profile
      ? UserIntelligenceProfile.sanitize(draft.profile)
      : UserIntelligenceProfile.sanitize(userProfile || DEFAULT_USER_INTELLIGENCE_PROFILE);

    // Auto-populate name from auth user or store if empty
    const existingName = initial.identity?.fullName || user?.displayName || userProfile?.name || userProfile?.fullName || '';
    if (existingName && !initial.identity?.fullName) {
      const first = existingName.trim().split(' ')[0] || '';
      initial.identity.fullName = existingName;
      initial.identity.firstName = initial.identity.firstName || first;
      initial.identity.nickname = initial.identity.nickname || first;
    }
    return initial;
  });

  const [units, setUnits] = useState('metric'); // 'metric' | 'imperial'
  const [legalModalType, setLegalModalType] = useState(null);
  const [wearablePairingModalOpen, setWearablePairingModalOpen] = useState(false);
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

  // Sync active health connections with native HealthKit state on mount and on focus
  useEffect(() => {
    const syncStatus = async () => {
      if (typeof window !== 'undefined') {
        const authState = await HealthPermissionManager.getAuthorizationState();
        const platform = HealthPermissionManager.getPlatform();
        if (authState.status === 'AUTHORIZED') {
          if (platform === 'ios_apple_health') {
            updateSection('devices', { appleHealth: true, appleWatch: true });
          } else if (platform === 'android_health_connect') {
            updateSection('devices', { healthConnect: true });
          }
        } else {
          if (platform === 'ios_apple_health') {
            updateSection('devices', { appleHealth: false, appleWatch: false });
          } else if (platform === 'android_health_connect') {
            updateSection('devices', { healthConnect: false });
          }
        }
      }
    };
    syncStatus();

    window.addEventListener('focus', syncStatus);
    document.addEventListener('visibilitychange', syncStatus);
    return () => {
      window.removeEventListener('focus', syncStatus);
      document.removeEventListener('visibilitychange', syncStatus);
    };
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

  // Real backend device connection handler (with genuine modal authorization)
  const handleConnectDevice = async (deviceId) => {
    const isCurrentlyConnected = profile.devices?.[deviceId];

    if (isCurrentlyConnected) {
      if (deviceId === 'appleHealth' || deviceId === 'appleWatch') {
        updateSection('devices', { appleHealth: false, appleWatch: false });
        HealthPermissionManager.disconnect();
        if (userId) {
          await saveEcosystemState(userId, { 
            appleHealthConnected: false, 
            appleWatchConnected: false,
            healthSource: null 
          });
        }
        if (onNotification) onNotification('Disconnected from Apple Health');
      } else if (deviceId === 'healthConnect') {
        updateSection('devices', { healthConnect: false });
        HealthPermissionManager.disconnect();
        if (userId) {
          await saveEcosystemState(userId, {
            healthConnectConnected: false,
            healthSource: null
          });
        }
        if (onNotification) onNotification('Disconnected from Health Connect');
      } else if (deviceId === 'bluetoothWatch') {
        updateSection('devices', { bluetoothWatch: false, bleHeartRate: false, garmin: false, deviceName: null });
        if (onNotification) onNotification('Disconnected Bluetooth wearable');
      }
      return;
    }

    if (deviceId === 'appleHealth' || deviceId === 'appleWatch') {
      setConnectingDevice(deviceId);
      try {
        const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
        const authState = await HealthPermissionManager.getAuthorizationState();
        if (authState.status === 'AUTHORIZED' || (res && res.status === 'AUTHORIZED')) {
          updateSection('devices', { appleHealth: true, appleWatch: true });
          if (userId) {
            await saveEcosystemState(userId, { 
              appleHealthConnected: true, 
              appleWatchConnected: true,
              healthSource: 'apple_health'
            });
          }
          if (onNotification) onNotification('Apple Health connected! ⌚');
        } else {
          updateSection('devices', { appleHealth: false, appleWatch: false });
          if (authState.status === 'DENIED') {
            if (onNotification) onNotification('Apple Health access denied. Enable permissions in iOS Settings.');
          } else if (authState.status === 'NOT_AVAILABLE') {
            if (onNotification) onNotification('Apple HealthKit is unavailable on this device.');
          } else {
            if (onNotification) onNotification('Health access not granted. You can connect anytime in Settings.');
          }
        }
      } catch (err) {
        console.warn('Apple Health connection note:', err);
        updateSection('devices', { appleHealth: false, appleWatch: false });
      } finally {
        setConnectingDevice(null);
      }
      return;
    }

    if (deviceId === 'healthConnect') {
      setConnectingDevice(deviceId);
      try {
        const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
        const isConn = HealthPermissionManager.isConnected();
        if (isConn) {
          updateSection('devices', { healthConnect: true });
          if (userId) {
            await saveEcosystemState(userId, { 
              healthConnectConnected: true,
              healthSource: 'health_connect'
            });
          }
          if (onNotification) onNotification('Android Health Connect authorized & connected! ⚡');
        } else {
          updateSection('devices', { healthConnect: false });
          if (onNotification) onNotification('Health Connect permissions not granted.');
        }
      } catch (err) {
        console.warn('Health Connect note:', err);
      } finally {
        setConnectingDevice(null);
      }
      return;
    }

    if (deviceId === 'bluetoothWatch') {
      setWearablePairingModalOpen(true);
      return;
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

      const rawFullName = profile.identity?.fullName || user?.displayName || userProfile?.name || 'Athlete';
      const rawFirstName = profile.identity?.firstName || (rawFullName ? rawFullName.trim().split(' ')[0] : '') || user?.displayName?.split(' ')[0] || 'Athlete';
      const rawNickname = profile.identity?.nickname || rawFirstName || 'Athlete';

      const finalProfile = UserIntelligenceProfile.sanitize({
        ...profile,
        story: finalStory,
        onboardingCompleted: true,
        onboarded: true,
        role: 'user',
        // Top-level canonical compatibility fields
        name: rawFullName,
        fullName: rawFullName,
        firstName: rawFirstName,
        nickname: rawNickname,
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
        dietPreference: profile.nutrition.diet,
        diet: profile.nutrition.diet,
        dietPreferences: [profile.nutrition.diet],
        cuisines: profile.nutrition.cuisines || [],
        allergies: profile.nutrition.allergies || ['none'],
        nutritionPriority: profile.nutrition.nutritionPriority || 'high_protein'
      });

      // 1. Mark persistent localStorage keys to guarantee this specific athlete is not re-prompted
      if (typeof window !== 'undefined' && userId) {
        localStorage.setItem(`calyxo_onboarded_${userId}`, 'true');
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
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col justify-between selection:bg-accent/20 font-sans pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1rem)]">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-lime-500/8 rounded-full blur-[120px]" />
      </div>

      {/* Top Safe Navigation Header */}
      <header className="relative z-10 w-full max-w-xl mx-auto px-5 pt-2 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Logo showText={true} className="w-8 h-8 text-accent" />

          {currentScreenIdx > 0 && currentScreenIdx < SCREENS.length - 1 && (
            <button
              onClick={handleSkipToSummary}
              className="text-xs font-bold text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-full bg-surface border border-card-border shadow-sm cursor-pointer"
            >
              Skip to Review
            </button>
          )}
        </div>

        {/* Dynamic iOS Progress Indicator per Section 18 */}
        {currentScreenIdx > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-muted">
              <span className="uppercase tracking-widest text-[10px] text-accent font-bold">{currentScreen.category}</span>
              <span className="text-foreground tracking-wider font-mono text-xs">
                {String(currentScreenIdx).padStart(2, '0')} / {String(SCREENS.length - 1).padStart(2, '0')}
              </span>
            </div>
            <div className="w-full h-1 bg-surface-subtle border border-card-border/60 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent rounded-full"
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
            {/* SCREEN 01 — WELCOME & ATHLETE IDENTITY */}
            {currentScreen.id === 'welcome' && (
              <div className="text-center py-2 space-y-5">
                <div className="relative mx-auto w-16 h-16 rounded-3xl bg-surface border border-card-border flex items-center justify-center shadow-xl">
                  <Logo className="w-8 h-8 text-accent" />
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                    Let's build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-emerald-500">Calyxo</span>.
                  </h1>
                  <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                    Personalized fitness architecture calibrated to your body, goals, and daily rhythm.
                  </p>
                </div>

                {/* Athlete Name & Identity Card */}
                <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-card-border text-left space-y-3.5 shadow-xl max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                      <span>What is your name?</span>
                      <span className="text-[10px] text-accent font-mono uppercase tracking-wider">Required</span>
                    </label>
                    <input
                      type="text"
                      value={profile.identity?.fullName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const first = val.trim().split(' ')[0] || '';
                        updateSection('identity', { 
                          fullName: val,
                          firstName: first,
                          nickname: profile.identity?.nickname || first
                        });
                      }}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-card-bg border border-card-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                      <span>What should AI Coach call you?</span>
                      <span className="text-[10px] text-muted font-mono">Nickname</span>
                    </label>
                    <input
                      type="text"
                      value={profile.identity?.nickname || ''}
                      onChange={(e) => updateSection('identity', { nickname: e.target.value })}
                      placeholder="e.g. Alex"
                      className="w-full bg-card-bg border border-card-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-accent placeholder:text-muted focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-left">
                  <div className="p-3 rounded-2xl bg-surface border border-card-border">
                    <Dumbbell className="w-4 h-4 text-accent mb-1" />
                    <p className="text-xs font-bold text-foreground">AI Coach</p>
                    <p className="text-[10px] text-muted">Custom routines</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-card-border">
                    <Utensils className="w-4 h-4 text-emerald-500 mb-1" />
                    <p className="text-xs font-bold text-foreground">Smart Meals</p>
                    <p className="text-[10px] text-muted">Diet & macros</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-card-border">
                    <Moon className="w-4 h-4 text-cyan-500 mb-1" />
                    <p className="text-xs font-bold text-foreground">Recovery</p>
                    <p className="text-[10px] text-muted">Daily readiness</p>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 02 — GOAL DISCOVERY (Section 18 Redesign) */}
            {currentScreen.id === 'goals' && (
              <div className="space-y-6 max-w-lg mx-auto py-2">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">Goal Architecture</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight uppercase">
                    What are you training for?
                  </h2>
                  <p className="text-xs text-muted leading-relaxed">
                    Select your primary objective. Calyxo calibrates sets, weight targets, and nutritional macros to this core focus.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'build_muscle', label: 'Build muscle', desc: 'Hypertrophy volume, progressive overload & mechanical tension', icon: Dumbbell },
                    { id: 'lose_body_fat', label: 'Lose fat', desc: 'Calibrated deficit, high metabolic output & muscle preservation', icon: Flame },
                    { id: 'get_stronger', label: 'Get stronger', desc: 'Heavy compound lifts & neuromuscular force production', icon: Zap },
                    { id: 'improve_fitness', label: 'Improve fitness', desc: 'Cardiovascular engine, athletic conditioning & mobility', icon: Activity },
                    { id: 'maintain_physique', label: 'Maintain health', desc: 'Sustainable athletic performance, longevity & vital health', icon: Heart }
                  ].map((goalOption) => {
                    const isSelected = profile.goals.primaryGoal === goalOption.id;
                    const Icon = goalOption.icon;
                    return (
                      <button
                        key={goalOption.id}
                        type="button"
                        onClick={() => updateSection('goals', { primaryGoal: goalOption.id })}
                        className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'bg-accent/15 border-accent shadow-sm scale-[1.01]' 
                            : 'bg-surface/80 border-card-border/80 hover:border-card-border hover:bg-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-accent text-black font-black' : 'bg-surface-subtle text-muted border border-card-border'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-base font-black ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                              {goalOption.label}
                            </p>
                            <p className="text-xs text-muted mt-0.5 leading-snug">{goalOption.desc}</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isSelected ? 'border-accent bg-accent text-black' : 'border-card-border/60'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 03 — BODY BASELINE (Real Wheel Pickers for Age, Height, Weight, and Sex) */}
            {currentScreen.id === 'body_profile' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Your body baseline</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Select your age, height, and weight to calculate metabolic requirements.
                  </p>
                </div>

                {/* 1. Age Wheel Picker */}
                <AgeWheelPicker
                  value={profile.identity.dob || '2001-01-01'}
                  onChange={(dateStr, age) => updateSection('identity', { dob: dateStr, age })}
                />

                {/* 2. Biological Sex (Metabolism) */}
                <div className="p-3.5 rounded-3xl bg-surface border border-card-border space-y-2">
                  <label className="text-[11px] font-bold text-foreground">Biological Sex (for metabolic rate calculations)</label>
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
                        className={`py-2 text-xs rounded-xl border font-bold capitalize transition-all cursor-pointer ${
                          profile.identity.sex === s.id 
                            ? 'bg-accent/20 border-accent text-accent' 
                            : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
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
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Your fitness journey</h2>
                  <p className="text-xs text-muted mt-1">Calyxo calibrates progression to your exact starting baseline.</p>
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
                        className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-accent/15 border-accent text-accent' 
                            : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
                        }`}
                      >
                        {exp.label}
                      </button>
                    );
                  })}
                </div>

                {/* Training Frequency */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground">How often do you currently train?</label>
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
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-accent/15 border-accent text-accent' 
                              : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
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
                  <label className="block text-xs font-bold text-foreground">How long can you realistically train?</label>
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
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-accent/15 border-accent text-accent' 
                              : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
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
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Training & Equipment</h2>
                  <p className="text-xs text-muted mt-1">Select your training location and available gear.</p>
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
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-accent/15 border-accent text-accent' 
                            : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
                        }`}
                      >
                        {env.label}
                      </button>
                    );
                  })}
                </div>

                {/* Equipment Multi-select */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground">Equipment Access</label>
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
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold capitalize flex items-center justify-between transition-all cursor-pointer ${
                            isChecked 
                              ? 'bg-accent/15 border-accent text-accent' 
                              : 'bg-surface border-card-border text-muted hover:bg-surface-interactive'
                          }`}
                        >
                          <span>{eq.replace('_', ' ')}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'border-accent bg-accent' : 'border-card-border'
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
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
              <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Nutrition Personalization</h2>
                  <p className="text-xs text-muted mt-1">Calyxo AI Meal Planner builds recipes tailored to your dietary lifestyle.</p>
                </div>

                {/* 1. Diet Pattern */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">Dietary Pattern</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'vegetarian', label: 'Vegetarian' },
                      { id: 'eggetarian', label: 'Eggetarian' },
                      { id: 'non_vegetarian', label: 'Non-Vegetarian' },
                      { id: 'vegan', label: 'Vegan' },
                      { id: 'jain', label: 'Jain / Sattvic' },
                      { id: 'pescatarian', label: 'Pescatarian' },
                      { id: 'keto', label: 'Keto / Low-Carb' },
                      { id: 'other', label: 'Flexitarian' }
                    ].map((d) => {
                      const isSelected = profile.nutrition.diet === d.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => updateSection('nutrition', { diet: d.id })}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-accent/15 border-accent text-accent' 
                              : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Nutrition Priority */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground">Primary Nutrition Focus</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'high_protein', label: 'High Protein (Gains)' },
                      { id: 'fat_loss', label: 'Fat Loss (Deficit)' },
                      { id: 'muscle_gain', label: 'Muscle Gain (Surplus)' },
                      { id: 'clean_eating', label: 'Clean Wholesome Food' },
                      { id: 'gut_health', label: 'Gut Health & Digestion' },
                      { id: 'balanced', label: 'Balanced Everyday' }
                    ].map((p) => {
                      const isSelected = (profile.nutrition.nutritionPriority || 'high_protein') === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => updateSection('nutrition', { nutritionPriority: p.id })}
                          className={`p-2 rounded-xl border text-center text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                              : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Cooking / Meal Habit */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground">Meal & Cooking Routine</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'mostly_home', label: 'Home Cooked' },
                      { id: 'mix_of_both', label: 'Home & Outside' },
                      { id: 'meal_prep', label: 'Meal Prep / Tiffin' },
                      { id: 'mostly_outside', label: 'Eating Out / Swiggy' }
                    ].map((h) => {
                      const isSelected = (profile.nutrition.mealBehavior || 'mix_of_both') === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => updateSection('nutrition', { mealBehavior: h.id })}
                          className={`p-2 rounded-xl border text-center text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-cyan-500/15 border-cyan-500 text-cyan-500' 
                              : 'bg-surface border-card-border text-muted hover:bg-surface-interactive'
                          }`}
                        >
                          {h.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Cuisines & Staples */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground">Preferred Cuisines & Staples</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['South Indian', 'North Indian', 'Pan-Indian', 'Mediterranean', 'Asian', 'Continental', 'High-Protein Desi'].map((cuisine) => {
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
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                              : 'bg-surface border-card-border text-muted hover:bg-surface-interactive'
                          }`}
                        >
                          {cuisine}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Food Allergies & Exclusions */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground">Food Allergies / Exclusions</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'none', label: 'No Allergies' },
                      { id: 'dairy', label: 'Lactose / Dairy' },
                      { id: 'gluten', label: 'Gluten' },
                      { id: 'nuts', label: 'Peanuts / Nuts' },
                      { id: 'soy', label: 'Soy' },
                      { id: 'seafood', label: 'Seafood' }
                    ].map((all) => {
                      const currentAllergies = profile.nutrition.allergies || ['none'];
                      const isSelected = currentAllergies.includes(all.id);
                      return (
                        <button
                          key={all.id}
                          type="button"
                          onClick={() => {
                            let updated;
                            if (all.id === 'none') {
                              updated = ['none'];
                            } else {
                              const withoutNone = currentAllergies.filter(a => a !== 'none');
                              updated = isSelected 
                                ? withoutNone.filter(a => a !== all.id)
                                : [...withoutNone, all.id];
                              if (updated.length === 0) updated = ['none'];
                            }
                            updateSection('nutrition', { allergies: updated });
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-accent/20 border-accent text-accent' 
                              : 'bg-surface border-card-border text-muted hover:bg-surface-interactive'
                          }`}
                        >
                          {all.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 07 — DAILY ROUTINE & TIMINGS (ALL-IN-ONE SCREEN) */}
            {currentScreen.id === 'daily_routine' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Your Daily Routine</h2>
                  <p className="text-xs text-muted mt-1">
                    Set your meal, workout, and sleep times so Calyxo sends reminders at your exact schedule.
                  </p>
                </div>

                <div className="space-y-3">
                  
                  {/* 1. WORKOUT / GYM TIMING */}
                  <div className="p-3.5 rounded-2xl bg-surface border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground uppercase tracking-wide">Workout / Gym Time</span>
                          <span className="text-[10px] text-muted block">When do you usually train?</span>
                        </div>
                      </div>
                      <input
                        type="time"
                        value={profile.schedule?.workoutTime || '18:30'}
                        onChange={(e) => updateSection('schedule', { workoutTime: e.target.value })}
                        className="bg-card-bg border border-card-border rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-emerald-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[
                        { label: '🌅 6:30 AM', time: '06:30' },
                        { label: '☀️ 7:30 AM', time: '07:30' },
                        { label: '⚡ 12:30 PM', time: '12:30' },
                        { label: '🏋️ 5:30 PM', time: '17:30' },
                        { label: '🔥 6:30 PM', time: '18:30' },
                        { label: '🌙 8:00 PM', time: '20:00' }
                      ].map((item) => (
                        <button
                          key={item.time}
                          type="button"
                          onClick={() => updateSection('schedule', { workoutTime: item.time })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            (profile.schedule?.workoutTime || '18:30') === item.time
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                              : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. BREAKFAST & LUNCH */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* Breakfast */}
                    <div className="p-3 rounded-2xl bg-surface border border-card-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🍳</span>
                          <span className="text-xs font-bold text-foreground">Breakfast</span>
                        </div>
                        <input
                          type="time"
                          value={profile.schedule?.breakfastTime || '08:30'}
                          onChange={(e) => updateSection('schedule', { breakfastTime: e.target.value })}
                          className="bg-card-bg border border-card-border rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-amber-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex gap-1">
                        {['07:30', '08:30', '09:30'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateSection('schedule', { breakfastTime: t })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (profile.schedule?.breakfastTime || '08:30') === t
                                ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                                : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="p-3 rounded-2xl bg-surface border border-card-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🥗</span>
                          <span className="text-xs font-bold text-foreground">Lunch</span>
                        </div>
                        <input
                          type="time"
                          value={profile.schedule?.lunchTime || '13:00'}
                          onChange={(e) => updateSection('schedule', { lunchTime: e.target.value })}
                          className="bg-card-bg border border-card-border rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-emerald-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex gap-1">
                        {['12:30', '13:00', '13:30', '14:00'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateSection('schedule', { lunchTime: t })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (profile.schedule?.lunchTime || '13:00') === t
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                                : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* 3. SNACK & DINNER */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* Evening Snack */}
                    <div className="p-3 rounded-2xl bg-surface border border-card-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">☕</span>
                          <span className="text-xs font-bold text-foreground">Evening Snack</span>
                        </div>
                        <input
                          type="time"
                          value={profile.schedule?.snackTime || '17:00'}
                          onChange={(e) => updateSection('schedule', { snackTime: e.target.value })}
                          className="bg-card-bg border border-card-border rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-cyan-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="flex gap-1">
                        {['16:30', '17:00', '17:30', '18:00'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateSection('schedule', { snackTime: t })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (profile.schedule?.snackTime || '17:00') === t
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500'
                                : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dinner */}
                    <div className="p-3 rounded-2xl bg-surface border border-card-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🍽️</span>
                          <span className="text-xs font-bold text-foreground">Dinner</span>
                        </div>
                        <input
                          type="time"
                          value={profile.schedule?.dinnerTime || '20:30'}
                          onChange={(e) => updateSection('schedule', { dinnerTime: e.target.value })}
                          className="bg-card-bg border border-card-border rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-rose-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div className="flex gap-1">
                        {['19:30', '20:30', '21:00', '21:30'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateSection('schedule', { dinnerTime: t })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (profile.schedule?.dinnerTime || '20:30') === t
                                ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                                : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* 4. SLEEP & WAKE-UP */}
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* Wake Up */}
                    <div className="p-3 rounded-2xl bg-surface border border-card-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Sunrise className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-foreground">Wake Up</span>
                        </div>
                        <input
                          type="time"
                          value={profile.schedule?.wakeTime || '06:30'}
                          onChange={(e) => updateSection('schedule', { wakeTime: e.target.value })}
                          className="bg-card-bg border border-card-border rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="flex gap-1">
                        {['05:30', '06:30', '07:30'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateSection('schedule', { wakeTime: t })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (profile.schedule?.wakeTime || '06:30') === t
                                ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sleep Time */}
                    <div className="p-3 rounded-2xl bg-surface border border-card-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-foreground">Bedtime</span>
                        </div>
                        <input
                          type="time"
                          value={profile.schedule?.sleepTime || '23:00'}
                          onChange={(e) => updateSection('schedule', { sleepTime: e.target.value })}
                          className="bg-card-bg border border-card-border rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-indigo-400 focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div className="flex gap-1">
                        {['22:00', '23:00', '23:30'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateSection('schedule', { sleepTime: t })}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              (profile.schedule?.sleepTime || '23:00') === t
                                ? 'bg-indigo-400/20 border-indigo-400 text-indigo-400'
                                : 'bg-surface-subtle border-card-border text-muted hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* SCREEN 08 — LIFESTYLE & RECOVERY */}
            {currentScreen.id === 'lifestyle' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Daily Rhythm & Sleep</h2>
                  <p className="text-xs text-muted mt-1">Lifestyle factors calibrate recovery and strain targets.</p>
                </div>

                {/* Daily Activity */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">How active is your normal day?</label>
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
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-accent/15 border-accent text-accent' 
                              : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
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
                  <label className="block text-xs font-bold text-foreground">How much do you usually sleep?</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['under_5h', '5_6h', '6_7h', '7_8h', '8h_plus'].map((sl) => {
                      const isSelected = profile.lifestyle.sleepDuration === sl;
                      return (
                        <button
                          key={sl}
                          type="button"
                          onClick={() => updateSection('lifestyle', { sleepDuration: sl })}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-500' 
                              : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
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
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Workout Adaptations</h2>
                  <p className="text-xs text-muted mt-1">
                    Tell Calyxo what movements or areas you'd like your workouts to account for.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">Protected Areas to Account For</label>
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
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold capitalize transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-rose-500/20 border-rose-400 text-rose-500' 
                              : 'bg-surface border-card-border text-foreground hover:bg-surface-interactive'
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface border border-card-border text-muted text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Calyxo automatically substitutes joint-heavy movements with safe biomechanical alternatives.</span>
                </div>
              </div>
            )}

            {/* SCREEN 09 — DEVICE ECOSYSTEM */}
            {currentScreen.id === 'devices' && (() => {
              const platform = HealthPermissionManager.getPlatform();
              const isApple = platform === 'ios_apple_health';
              const isAndroid = platform === 'android_health_connect';

              let deviceList = [];
              if (isApple) {
                deviceList = [
                  {
                    id: 'appleHealth',
                    label: 'Apple Watch & Apple Health',
                    platform: 'iOS HealthKit',
                    desc: 'Automatic sync for steps, active calories, sleep & workouts',
                    icon: Watch
                  },
                  {
                    id: 'bluetoothWatch',
                    label: 'Bluetooth Fitness Wearable',
                    platform: 'BLE Smartwatch',
                    desc: 'Direct live heart rate & activity telemetry',
                    icon: Bluetooth
                  }
                ];
              } else if (isAndroid) {
                deviceList = [
                  {
                    id: 'healthConnect',
                    label: 'Android Health Connect & Wear OS',
                    platform: 'Google Health Connect',
                    desc: 'Automatic sync for steps, active calories, sleep & workouts',
                    icon: Activity
                  },
                  {
                    id: 'bluetoothWatch',
                    label: 'Bluetooth Fitness Wearable',
                    platform: 'BLE Smartwatch',
                    desc: 'Direct live heart rate & activity telemetry',
                    icon: Bluetooth
                  }
                ];
              } else {
                const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
                const isMacOrIos = /Mac|iPad|iPhone|iPod/.test(ua);
                deviceList = [
                  {
                    id: isMacOrIos ? 'appleHealth' : 'healthConnect',
                    label: isMacOrIos ? 'Apple Watch & Apple Health' : 'Android Health Connect & Wear OS',
                    platform: isMacOrIos ? 'iOS HealthKit' : 'Google Health Connect',
                    desc: 'Automatic step, calorie, and workout synchronization',
                    icon: isMacOrIos ? Watch : Activity
                  },
                  {
                    id: 'bluetoothWatch',
                    label: 'Bluetooth Fitness Wearable',
                    platform: 'BLE Smartwatch',
                    desc: 'Direct live heart rate & activity telemetry',
                    icon: Bluetooth
                  }
                ];
              }

              return (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Where does your health data live?</h2>
                    <p className="text-xs text-muted mt-1">Connect your active wearables or log manually in Calyxo.</p>
                  </div>

                  <div className="space-y-2.5">
                    {deviceList.map((dev) => {
                      const isConnected = dev.id === 'appleHealth'
                        ? Boolean(profile.devices?.appleHealth || profile.devices?.appleWatch)
                        : Boolean(profile.devices?.[dev.id]);
                      const isConnecting = connectingDevice === dev.id;
                      const IconComp = dev.icon || Watch;

                      return (
                        <div
                          key={dev.id}
                          onClick={() => !isConnecting && handleConnectDevice(dev.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] flex items-center justify-between ${
                            isConnected 
                              ? 'bg-emerald-500/10 border-emerald-500/30' 
                              : 'bg-surface border-card-border hover:bg-surface-interactive'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isConnected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-surface-subtle text-accent'
                            }`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {dev.id === 'bluetoothWatch' && profile.devices?.deviceName
                                  ? profile.devices.deviceName
                                  : dev.label}
                              </p>
                              <p className="text-[10px] text-muted">{dev.desc}</p>
                            </div>
                          </div>
                          {dev.id === 'bluetoothWatch' ? (
                            <button
                              type="button"
                              disabled={isConnecting}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isConnected 
                                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' 
                                  : 'bg-surface text-foreground hover:bg-surface-interactive border border-card-border shadow-sm'
                              }`}
                            >
                              {isConnecting ? (
                                <span className="animate-spin text-xs">⚡</span>
                              ) : isConnected ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  Connected
                                </>
                              ) : (
                                'Connect'
                              )}
                            </button>
                          ) : (
                            /* Native iOS-style Toggle Switch */
                            <div
                              className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center shrink-0 ${
                                isConnected ? 'bg-[#34C759] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                              }`}
                            >
                              <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                              >
                                {isConnecting && <span className="animate-spin text-[8px] text-black">⚡</span>}
                              </motion.div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-card-border text-muted text-xs flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Calyxo processes biometrics securely on-device. All stats can also be logged manually.</span>
                  </div>
                </div>
              );
            })()}

            {/* SCREEN 10 — AI COACH PERSONALITY */}
            {currentScreen.id === 'coaching' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">How should Calyxo coach you?</h2>
                  <p className="text-xs text-muted mt-1">Configure your coach's personality and communication style.</p>
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
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-accent/15 border-accent text-accent shadow-sm' 
                            : 'bg-surface border-card-border hover:bg-surface-interactive'
                        }`}
                      >
                        <p className={`text-xs font-bold ${isSelected ? 'text-accent' : 'text-foreground'}`}>
                          {style.label}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5">{style.desc}</p>
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
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Tell Calyxo your story</h2>
                  <p className="text-xs text-muted mt-1">
                    Anything you think would help us understand your schedule, obstacles, and routine better.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={profile.story?.rawText || ''}
                    onChange={(e) => updateSection('story', { rawText: e.target.value })}
                    placeholder="e.g. I've been training for two years, stopped for a few months because of college, and now I want to build muscle without spending more than 45 minutes in the gym."
                    className="w-full bg-card-bg border border-card-border rounded-2xl p-4 text-xs text-foreground focus:outline-none focus:border-accent placeholder:text-muted leading-relaxed resize-none"
                  />
                </div>

                {liveStorySignals.signalsFound.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-2xl bg-accent/10 border border-accent/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-accent">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        Extracted Signals
                      </span>
                      <span className="text-[10px] text-accent/80 font-mono">
                        {Math.round(liveStorySignals.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {liveStorySignals.signalsFound.map((sig, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-accent/20 text-accent border border-accent/30">
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
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto mb-1.5">
                    <UserCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Calyxo Understands You</h2>
                  <p className="text-xs text-muted">Everything is calibrated from your authentic responses.</p>
                </div>

                <div className="p-4 rounded-3xl bg-surface border border-card-border space-y-3 shadow-xl">
                  {/* Athlete Name Banner */}
                  <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-accent font-mono uppercase font-bold tracking-wider">ATHLETE PROFILE</span>
                      <p className="text-sm font-black text-foreground">{profile.identity?.fullName || profile.identity?.firstName || 'Athlete'}</p>
                    </div>
                    {profile.identity?.nickname && (
                      <span className="px-2.5 py-1 rounded-full bg-accent/20 text-accent text-[11px] font-bold">
                        Coach: "{profile.identity.nickname}"
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted font-bold text-[10px]">PRIMARY GOAL</p>
                      <p className="font-bold text-foreground capitalize mt-0.5">
                        {profile.goals.primaryGoal.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted font-bold text-[10px]">SCHEDULE</p>
                      <p className="font-bold text-foreground capitalize mt-0.5">
                        {profile.training.frequency.replace(/_/g, ' ')} · {profile.training.duration.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted font-bold text-[10px]">NUTRITION</p>
                      <p className="font-bold text-foreground capitalize mt-0.5">
                        {profile.nutrition.diet.replace(/_/g, ' ')} · {profile.nutrition.cuisines.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted font-bold text-[10px]">RECOVERY</p>
                      <p className="font-bold text-foreground capitalize mt-0.5">
                        {profile.lifestyle.sleepDuration.replace(/_/g, '–').replace('h', 'h')} · {profile.lifestyle.stressLevel} stress
                      </p>
                    </div>
                    <div>
                      <p className="text-muted font-bold text-[10px]">COACHING</p>
                      <p className="font-bold text-foreground capitalize mt-0.5">
                        {profile.coaching.personality} · {profile.coaching.reminderStyle}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted font-bold text-[10px]">BASELINE BODY</p>
                      <p className="font-bold text-foreground mt-0.5">
                        {profile.identity.weight}kg · {profile.identity.height}cm ({profile.identity.age}y)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-center text-[11px] text-muted">
                  <span>By starting, you agree to Calyxo's</span>
                  <button type="button" onClick={() => setLegalModalType('terms')} className="text-accent underline cursor-pointer">Terms</button>
                  <span>&</span>
                  <button type="button" onClick={() => setLegalModalType('privacy')} className="text-accent underline cursor-pointer">Privacy</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Sticky Action Footer */}
      <footer className="relative z-10 w-full max-w-xl mx-auto px-5 py-3 border-t border-card-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {currentScreenIdx > 0 && currentScreenIdx < SCREENS.length - 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-full bg-surface hover:bg-surface-interactive text-foreground font-bold text-xs transition-colors flex items-center gap-1 border border-card-border shadow-sm cursor-pointer"
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
                className="px-4 py-3 rounded-full bg-surface hover:bg-surface-interactive text-foreground font-bold text-xs transition-colors border border-card-border flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                disabled={isFinalizing}
                onClick={finalizeOnboarding}
                className="flex-1 sm:flex-initial px-8 py-3 rounded-full bg-accent hover:brightness-110 text-accent-foreground font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isFinalizing ? (
                  <span className="flex items-center gap-2 text-accent-foreground">
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
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-accent hover:brightness-110 text-accent-foreground font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
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

      {/* Wearable & Bluetooth Device Pairing Modal */}
      <WearablePairingModal
        isOpen={wearablePairingModalOpen}
        onClose={() => setWearablePairingModalOpen(false)}
        onPaired={({ deviceName, brandId }) => {
          updateSection('devices', { 
            bluetoothWatch: true, 
            bleHeartRate: true, 
            garmin: brandId === 'garmin',
            deviceName 
          });
          if (userId) {
            saveEcosystemState(userId, {
              bluetoothWatchConnected: true,
              bluetoothDeviceName: deviceName,
              garminConnected: brandId === 'garmin'
            });
          }
        }}
        onNotification={onNotification}
      />
    </div>
  );
}
