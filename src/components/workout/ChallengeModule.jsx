"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle2, Flame, Clock, Dumbbell, Trophy, ArrowLeft,
  ChevronDown, ChevronUp, Sparkles, Check, HeartPulse, ShieldCheck,
  CheckSquare, Square, Info
} from 'lucide-react';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { addWorkoutLog } from '../../lib/dbService';

// ── CURATED CHALLENGES DATA (3-5 items for maximum clarity) ──────────────────
const CURATED_CHALLENGES = [
  {
    id: 'ch_shatapavali_5k',
    title: '5,000 Step Post-Meal Shatapavali Walk',
    shortDesc: 'Ancient Indian post-meal walking habit to accelerate fat loss and regulate blood sugar.',
    category: 'Fat Loss',
    difficulty: 'Beginner',
    durationDays: 14,
    estimatedDailyMin: 20,
    estBurnPerSession: 220,
    equipment: 'Walking Shoes',
    heroImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1000&q=80',
    benefits: ['Accelerates daily calorie deficit', 'Improves digestion after heavy meals', 'Regulates blood sugar spikes'],
    tips: ['Walk briskly for 15-20 minutes right after dinner.', 'Maintain a steady, relaxed rhythm.'],
    dailyPlan: [
      { id: 'ex_1', title: 'Post-Meal Shatapavali Walk', reps: '5,000 steps', durationMin: 15 },
      { id: 'ex_2', title: 'Cool-down Ankle & Calf Stretch', reps: '2 sets x 45 sec', durationMin: 5 }
    ]
  },
  {
    id: 'ch_surya_15',
    title: '15-Day Morning Surya Namaskar Flow',
    shortDesc: 'Full-body yoga mobility routine to open hips, strengthen core, and boost morning energy.',
    category: 'Home',
    difficulty: 'Beginner',
    durationDays: 15,
    estimatedDailyMin: 15,
    estBurnPerSession: 140,
    equipment: 'Yoga Mat / Bodyweight',
    heroImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    benefits: ['Increases full-body flexibility', 'Boosts metabolic rate early in the morning', 'Relieves spinal stiffness'],
    tips: ['Sync movement with deep nasal breathing.', 'Perform smoothly without rushing reps.'],
    dailyPlan: [
      { id: 'ex_1', title: 'Surya Namaskar (Sun Salutations)', reps: '12 complete rounds', durationMin: 10 },
      { id: 'ex_2', title: 'Pranayama Deep Breathing', reps: '3 mins hold & flow', durationMin: 5 }
    ]
  },
  {
    id: 'ch_desi_gym_builder',
    title: 'Desi Gym Hypertrophy & Muscle Sculpt',
    shortDesc: 'Structured progressive strength program focused on chest, back, shoulders, and legs.',
    category: 'Muscle Gain',
    difficulty: 'Intermediate',
    durationDays: 28,
    estimatedDailyMin: 35,
    estBurnPerSession: 340,
    equipment: 'Gym / Dumbbells',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
    benefits: ['Builds lean upper and lower body muscle mass', 'Enhances compound lifting power', 'Increases basal metabolic rate'],
    tips: ['Focus on strict form before adding heavier weight.', 'Rest 60-90 seconds between sets.'],
    dailyPlan: [
      { id: 'ex_1', title: 'Dumbbell Incline Bench Press', reps: '4 sets x 10 reps', durationMin: 12 },
      { id: 'ex_2', title: 'Barbell Row / Lat Pulldown', reps: '4 sets x 10 reps', durationMin: 12 },
      { id: 'ex_3', title: 'Lateral Raises & Core Plank', reps: '3 sets x 15 reps', durationMin: 11 }
    ]
  },
  {
    id: 'ch_10k_master',
    title: '10,000 Step Daily Endurance Master',
    shortDesc: 'Achieve elite daily active movement to build cardiovascular stamina and stay lean.',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationDays: 21,
    estimatedDailyMin: 45,
    estBurnPerSession: 420,
    equipment: 'Phone / Fitness Tracker',
    heroImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=80',
    benefits: ['Maximizes daily fat loss', 'Improves cardiovascular endurance', 'Keeps resting heart rate healthy'],
    tips: ['Break steps into morning, afternoon, and post-dinner walks.', 'Stay hydrated throughout the day.'],
    dailyPlan: [
      { id: 'ex_1', title: 'Active Brisk Walking', reps: '10,000 steps', durationMin: 40 },
      { id: 'ex_2', title: 'Lower Body Stretch & Cool-down', reps: '2 sets x 60 sec', durationMin: 5 }
    ]
  }
];

const CATEGORY_CHIPS = ['All', 'Fat Loss', 'Muscle Gain', 'Strength', 'Home', 'Gym', 'Beginner'];

export default function ChallengeModule({ onNotification }) {
  const ecoStore = useEcosystemStore();
  const storeUser = useStore(state => state.user);
  const userId = storeUser?.uid || storeUser?.id;
  const addWorkoutLogStore = useStore(state => state.addWorkoutLog);

  // Active Challenge (First Active or Default)
  const activeChallengesList = ecoStore.activeChallenges || [];
  const activeChallengeItem = activeChallengesList.find(c => !c.completed) || null;

  const currentChallenge = useMemo(() => {
    if (!activeChallengeItem) return null;
    const match = CURATED_CHALLENGES.find(c => c.id === activeChallengeItem.id || c.title.toLowerCase().includes(activeChallengeItem.name.toLowerCase().substring(0, 8)));
    return {
      ...CURATED_CHALLENGES[0],
      ...match,
      id: activeChallengeItem.id,
      title: activeChallengeItem.name || CURATED_CHALLENGES[0].title,
      progressDays: activeChallengeItem.progress || 0,
      targetDays: activeChallengeItem.targetVal || 14
    };
  }, [activeChallengeItem]);

  // Views: 'HOME' | 'DETAILS' | 'WORKOUT' | 'COMPLETION'
  const [currentView, setCurrentView] = useState('HOME');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completedWorkoutStats, setCompletedWorkoutStats] = useState(null);
  const [checkedExercises, setCheckedExercises] = useState({});

  // Accordion Toggles for Challenge Details (Progressive Disclosure)
  const [openAccordion, setOpenAccordion] = useState({ plan: true, benefits: false, tips: false });

  // Category Chip Filter matching category, difficulty, or equipment
  const filteredChallenges = useMemo(() => {
    if (selectedCategory === 'All') return CURATED_CHALLENGES;
    const cat = selectedCategory.toLowerCase();
    return CURATED_CHALLENGES.filter(c =>
      c.category.toLowerCase().includes(cat) ||
      c.difficulty.toLowerCase().includes(cat) ||
      c.equipment.toLowerCase().includes(cat)
    );
  }, [selectedCategory]);

  // Start/Enroll in Challenge
  const handleStartChallenge = (ch) => {
    ecoStore.joinChallenge({
      id: ch.id,
      tier: ch.difficulty.toUpperCase(),
      name: ch.title,
      target: ch.shortDesc,
      progress: 0,
      targetVal: ch.durationDays,
      completed: false,
      unit: 'days'
    });
    if (onNotification) onNotification(`Started "${ch.title}"! Today's workout is ready.`);
    setSelectedChallenge(ch);
    setCurrentView('HOME');
  };

  // Open Today's Active Session
  const handleOpenTodayWorkout = () => {
    const targetProgram = currentChallenge || CURATED_CHALLENGES[0];
    const initialChecks = {};
    (targetProgram.dailyPlan || []).forEach(ex => {
      initialChecks[ex.id] = false;
    });
    setCheckedExercises(initialChecks);
    setCurrentView('WORKOUT');
  };

  // Toggle Exercise Checklist item
  const toggleExerciseCheck = (exId) => {
    setCheckedExercises(prev => ({
      ...prev,
      [exId]: !prev[exId]
    }));
  };

  // Complete Today's Workout Session
  const handleFinishTodaySession = async () => {
    const targetProgram = currentChallenge || CURATED_CHALLENGES[0];
    const nextDay = (targetProgram.progressDays || 0) + 1;
    const isFinished = nextDay >= targetProgram.targetDays;
    const burnedKcal = targetProgram.estBurnPerSession || 220;
    const workoutTimeMin = targetProgram.estimatedDailyMin || 20;

    // 1. Update Ecosystem Progress
    ecoStore.updateChallengeProgress(targetProgram.id, nextDay);

    // 2. Auto-log Workout into Store & Database
    const workoutLogItem = {
      id: 'w_ch_' + Date.now(),
      name: `[Challenge] ${targetProgram.title} - Day ${nextDay}`,
      category: 'Cardio',
      sets: 1,
      reps: nextDay,
      weight: 0,
      duration: workoutTimeMin,
      caloriesBurned: burnedKcal,
      timestamp: Date.now()
    };

    try {
      const saved = await addWorkoutLog(userId, workoutLogItem);
      addWorkoutLogStore(saved || workoutLogItem);
    } catch (err) {
      console.warn("DB log failed, updating local store", err);
      addWorkoutLogStore(workoutLogItem);
    } finally {
      ecoStore.addXP(250);
      const currentStreak = (ecoStore.streaks?.workoutStreak || 0) + 1;
      ecoStore.updateStreaks({ workoutStreak: currentStreak });

      setCompletedWorkoutStats({
        dayNumber: nextDay,
        totalDays: targetProgram.targetDays,
        timeMin: workoutTimeMin,
        calories: burnedKcal,
        streak: currentStreak,
        programTitle: targetProgram.title
      });

      setCurrentView('COMPLETION');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 text-foreground">

      <AnimatePresence mode="wait">

        {/* ── VIEW 1: USER-FIRST HOME ───────────────────────────────────────── */}
        {currentView === 'HOME' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >

            {/* 1. CONTINUE CHALLENGE (ALWAYS FIRST AT TOP) */}
            {currentChallenge ? (
              <section className="bg-surface border border-card-border rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    Active Challenge
                  </span>
                  <span className="text-xs font-bold text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> {currentChallenge.estimatedDailyMin} min today
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-wide">
                    {currentChallenge.title}
                  </h2>
                  <p className="text-xs font-medium text-emerald-400 mt-0.5">
                    Day {currentChallenge.progressDays || 1} of {currentChallenge.targetDays} • {currentChallenge.targetDays - (currentChallenge.progressDays || 1)} days remaining
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-black/40 border border-card-border rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, Math.round(((currentChallenge.progressDays || 1) / currentChallenge.targetDays) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* One Dominant CTA Button */}
                <button
                  onClick={handleOpenTodayWorkout}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Continue Today's Workout</span>
                </button>
              </section>
            ) : (
              <section className="bg-surface border border-card-border rounded-3xl p-6 text-center space-y-3 shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                  ⚡
                </div>
                <h2 className="text-lg font-black uppercase text-foreground">No Active Challenge</h2>
                <p className="text-xs text-muted max-w-sm mx-auto">Pick a simple program below to build consistency and reach your daily target.</p>
                <button
                  onClick={() => {
                    const el = document.getElementById('recommended-challenges');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-md hover:brightness-110 transition-all"
                >
                  + Start a Challenge
                </button>
              </section>
            )}

            {/* 2. TODAY'S TASK CARD (IF CHALLENGE ACTIVE) */}
            {currentChallenge && (
              <section className="bg-surface/60 border border-card-border rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted">Today's Goal</h3>
                  <span className="text-xs font-black text-emerald-400">~{currentChallenge.estBurnPerSession} kcal burn</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-card-bg border border-card-border">
                    <span className="text-muted block text-[10px] uppercase font-bold">Duration</span>
                    <span className="text-sm font-black text-foreground">{currentChallenge.estimatedDailyMin} mins</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-card-bg border border-card-border">
                    <span className="text-muted block text-[10px] uppercase font-bold">Daily Streak</span>
                    <span className="text-sm font-black text-emerald-400">🔥 {ecoStore.streaks?.workoutStreak || 1} Days</span>
                  </div>
                </div>
              </section>
            )}

            {/* 3. CATEGORY CHIPS */}
            <section className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-muted px-1">Categories</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORY_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => setSelectedCategory(chip)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all shrink-0 ${
                      selectedCategory === chip
                        ? 'bg-emerald-500 text-black border-emerald-500 shadow-md'
                        : 'bg-surface border-card-border text-muted hover:text-foreground'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </section>

            {/* 4. RECOMMENDED CHALLENGES (ONLY 3-5 CARDS) */}
            <section id="recommended-challenges" className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground px-1">Recommended Challenges</h3>

              <div className="space-y-4">
                {filteredChallenges.slice(0, 4).map(ch => (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setSelectedChallenge(ch);
                      setCurrentView('DETAILS');
                    }}
                    className="bg-surface border border-card-border rounded-3xl overflow-hidden shadow-md cursor-pointer hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row items-stretch group"
                  >
                    <div className="sm:w-36 h-32 sm:h-auto relative overflow-hidden bg-black shrink-0">
                      <img src={ch.heroImage} alt={ch.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                        {ch.difficulty}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted uppercase">
                          <span>{ch.durationDays} Days Program</span>
                          <span>{ch.estimatedDailyMin} min/day</span>
                        </div>
                        <h4 className="text-base font-black text-foreground uppercase tracking-wide group-hover:text-emerald-400 transition-colors mt-0.5">
                          {ch.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-card-border/60">
                        <span className="text-xs font-bold text-emerald-400">~{ch.estBurnPerSession} kcal</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChallenge(ch);
                              setCurrentView('DETAILS');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-surface border border-card-border text-foreground hover:border-emerald-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChallenge(ch);
                            }}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-sm hover:brightness-110"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. MINIMAL PROGRESS CARD */}
            <section className="bg-surface border border-card-border rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">Your Consistency</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-card-bg border border-card-border">
                  <span className="text-lg font-black text-emerald-400">{activeChallengeItem?.progress || 0}</span>
                  <span className="text-[9px] font-bold text-muted uppercase block">Completed</span>
                </div>
                <div className="p-3 rounded-2xl bg-card-bg border border-card-border">
                  <span className="text-lg font-black text-foreground">{(activeChallengeItem?.targetVal || 14) - (activeChallengeItem?.progress || 0)}</span>
                  <span className="text-[9px] font-bold text-muted uppercase block">Remaining</span>
                </div>
                <div className="p-3 rounded-2xl bg-card-bg border border-card-border">
                  <span className="text-lg font-black text-emerald-400">🔥 {ecoStore.streaks?.workoutStreak || 0}</span>
                  <span className="text-[9px] font-bold text-muted uppercase block">Streak</span>
                </div>
              </div>
            </section>

          </motion.div>
        )}

        {/* ── VIEW 2: CHALLENGE DETAILS (PROGRESSIVE DISCLOSURE) ────────────── */}
        {currentView === 'DETAILS' && selectedChallenge && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => setCurrentView('HOME')}
              className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground cursor-pointer bg-none border-none"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Challenges
            </button>

            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-black h-56 w-full shadow-xl">
              <img src={selectedChallenge.heroImage} alt={selectedChallenge.title} className="w-full h-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider">
                  {selectedChallenge.difficulty} • {selectedChallenge.durationDays} Days
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  {selectedChallenge.title}
                </h2>
              </div>
            </div>

            {/* One Sentence Description */}
            <p className="text-xs font-medium text-muted leading-relaxed px-1">
              {selectedChallenge.shortDesc}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface border border-card-border text-center">
                <span className="text-[10px] font-bold text-muted uppercase block">Daily Time</span>
                <span className="text-sm font-black text-foreground">{selectedChallenge.estimatedDailyMin} mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface border border-card-border text-center">
                <span className="text-[10px] font-bold text-muted uppercase block">Daily Burn</span>
                <span className="text-sm font-black text-emerald-400">~{selectedChallenge.estBurnPerSession} kcal</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface border border-card-border text-center">
                <span className="text-[10px] font-bold text-muted uppercase block">Equipment</span>
                <span className="text-sm font-black text-foreground">{selectedChallenge.equipment.split('/')[0]}</span>
              </div>
            </div>

            {/* One Dominant CTA Button */}
            <button
              onClick={() => handleStartChallenge(selectedChallenge)}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Start Challenge Now
            </button>

            {/* Collapsible Sections (Progressive Disclosure) */}
            <div className="space-y-3 pt-2">

              {/* 1. Daily Plan */}
              <div className="bg-surface border border-card-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenAccordion({ ...openAccordion, plan: !openAccordion.plan })}
                  className="w-full p-4 flex items-center justify-between text-xs font-black uppercase text-foreground bg-none border-none cursor-pointer"
                >
                  <span>Daily Plan & Exercises</span>
                  {openAccordion.plan ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>
                {openAccordion.plan && (
                  <div className="p-4 pt-0 space-y-2 border-t border-card-border/50 text-xs">
                    {selectedChallenge.dailyPlan.map((ex, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-card-bg">
                        <span className="font-bold text-foreground">{ex.title}</span>
                        <span className="text-emerald-400 font-bold">{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Key Benefits */}
              <div className="bg-surface border border-card-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenAccordion({ ...openAccordion, benefits: !openAccordion.benefits })}
                  className="w-full p-4 flex items-center justify-between text-xs font-black uppercase text-foreground bg-none border-none cursor-pointer"
                >
                  <span>Program Benefits</span>
                  {openAccordion.benefits ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>
                {openAccordion.benefits && (
                  <div className="p-4 pt-0 space-y-2 border-t border-card-border/50 text-xs">
                    {selectedChallenge.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Coach Tips */}
              <div className="bg-surface border border-card-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenAccordion({ ...openAccordion, tips: !openAccordion.tips })}
                  className="w-full p-4 flex items-center justify-between text-xs font-black uppercase text-foreground bg-none border-none cursor-pointer"
                >
                  <span>Coach Tips & Guidance</span>
                  {openAccordion.tips ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>
                {openAccordion.tips && (
                  <div className="p-4 pt-0 space-y-2 border-t border-card-border/50 text-xs text-muted">
                    {selectedChallenge.tips.map((t, i) => (
                      <p key={i}>• {t}</p>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* ── VIEW 3: TODAY'S ACTIVE WORKOUT SESSION ────────────────────────── */}
        {currentView === 'WORKOUT' && (
          <motion.div
            key="workout"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <button
              onClick={() => setCurrentView('HOME')}
              className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground cursor-pointer bg-none border-none"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            <div className="bg-surface border border-card-border rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  Day {(currentChallenge?.progressDays || 0) + 1} Session
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  ~{currentChallenge?.estBurnPerSession || 220} kcal
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black uppercase text-foreground">
                  {currentChallenge?.title || 'Today Workout'}
                </h2>
                <p className="text-xs text-muted mt-0.5">Check off exercises as you complete them.</p>
              </div>

              {/* Exercises Checklist */}
              <div className="space-y-2.5 pt-2">
                {(currentChallenge?.dailyPlan || CURATED_CHALLENGES[0].dailyPlan).map((ex) => {
                  const isChecked = !!checkedExercises[ex.id];
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleExerciseCheck(ex.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-card-bg border-card-border text-foreground hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-muted shrink-0" />
                        )}
                        <div>
                          <span className={`text-xs font-bold block ${isChecked ? 'line-through opacity-70' : ''}`}>
                            {ex.title}
                          </span>
                          <span className="text-[10px] text-muted font-bold uppercase">{ex.reps}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted">{ex.durationMin}m</span>
                    </div>
                  );
                })}
              </div>

              {/* Complete CTA Button */}
              <button
                onClick={handleFinishTodaySession}
                className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Workout & Log Burned</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── VIEW 4: CLEAN SUCCESS & COMPLETION SCREEN ─────────────────────── */}
        {currentView === 'COMPLETION' && completedWorkoutStats && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl my-4"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-4xl shadow-inner">
              ✅
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                Day {completedWorkoutStats.dayNumber} of {completedWorkoutStats.totalDays} Completed
              </span>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-wide mt-2">
                Great Work Today!
              </h2>
              <p className="text-xs text-muted font-medium">{completedWorkoutStats.programTitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-card-bg border border-card-border">
                <span className="text-[10px] font-bold text-muted uppercase block">Active Time</span>
                <span className="text-base font-black text-foreground">{completedWorkoutStats.timeMin}m</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-card-bg border border-card-border">
                <span className="text-[10px] font-bold text-muted uppercase block">Burned</span>
                <span className="text-base font-black text-emerald-400">+{completedWorkoutStats.calories} kcal</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-card-bg border border-card-border">
                <span className="text-[10px] font-bold text-muted uppercase block">Streak</span>
                <span className="text-base font-black text-emerald-400">🔥 {completedWorkoutStats.streak} Days</span>
              </div>
            </div>

            {/* Encouraging AI Message */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium leading-relaxed">
              🤖 "Fantastic effort! Your body is adapting nicely. Rest up and hydrate—tomorrow's session is locked and loaded."
            </div>

            {/* One Dominant CTA Button */}
            <button
              onClick={() => setCurrentView('HOME')}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-wider cursor-pointer border-none shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Continue Tomorrow
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
