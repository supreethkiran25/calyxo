"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Flame, Zap, CheckCircle2, Lock, ChevronRight, Sparkles, Award,
  Download, Search, Filter, Calendar, Clock, Dumbbell, Activity, HeartPulse,
  BarChart3, RefreshCw, Play, Check, X, Star, Sliders, ShieldCheck, FileText,
  Brain, TrendingUp, UserCheck, RotateCcw, Info, ChevronDown, CheckSquare, Layers
} from 'lucide-react';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { addWorkoutLog } from '../../lib/dbService';
import { calculateWorkoutCaloriesBurned } from '../../utils/workoutUtils';
import { getTodayDateString } from '../../utils/dateUtils';

// ── PREDEFINED CHALLENGES DATA WITH 30-DAY TIMELINES ─────────────────────────
const CHALLENGE_DATABASE = [
  {
    id: 'ch_surya_15',
    title: '15-Day Morning Surya Namaskar Flow',
    category: 'Flexibility',
    goalCategory: 'Mobility',
    difficulty: 'Beginner',
    durationDays: 15,
    estimatedDailyMin: 15,
    estBurnPerSession: 140,
    targetMuscles: ['Core', 'Hamstrings', 'Shoulders', 'Spine'],
    equipment: ['Yoga Mat', 'Bodyweight'],
    heroImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    description: 'A traditional Indian full-body mobility flow to boost flexibility, daily energy, and metabolic rate.',
    aiMatchScore: 98,
    aiRecommendationReason: 'Optimal for your morning routine based on your recovery score & mobility goals.',
    dailySchedule: Array.from({ length: 15 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: ${i % 3 === 0 ? 'Deep Sun Salutation Flow' : i % 3 === 1 ? 'Core & Spinal Flexion' : 'Breath & Hamstring Opening'}`,
      exercises: [
        { name: 'Surya Namaskar (Sun Salutations)', sets: 4, reps: '12 rounds', durationMin: 10, restSec: 45 },
        { name: 'Downward Facing Dog Stretch', sets: 3, reps: '45 sec hold', durationMin: 3, restSec: 30 },
        { name: 'Pranayama Deep Breathing', sets: 1, reps: '2 mins', durationMin: 2, restSec: 0 }
      ]
    }))
  },
  {
    id: 'ch_shatapavali_5k',
    title: '5,000 Step Post-Meal Shatapavali Walk',
    category: 'Fat Loss',
    goalCategory: 'Fat Loss',
    difficulty: 'Beginner',
    durationDays: 14,
    estimatedDailyMin: 35,
    estBurnPerSession: 220,
    targetMuscles: ['Quads', 'Calves', 'Cardiovascular'],
    equipment: ['Walking Shoes'],
    heroImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    description: 'Inspired by the ancient Indian practice of taking 100 steps after meals to prevent postprandial glucose spikes.',
    aiMatchScore: 95,
    aiRecommendationReason: 'Helps regulate blood sugar and accelerate daily calorie deficit smoothly.',
    dailySchedule: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Evening 5k Step Walk`,
      exercises: [
        { name: 'Post-Dinner Brisk Shatapavali Walk', sets: 1, reps: '5,000 steps', durationMin: 30, restSec: 0 },
        { name: 'Standing Calf & Ankle Stretch', sets: 2, reps: '45 sec', durationMin: 5, restSec: 30 }
      ]
    }))
  },
  {
    id: 'ch_10k_master',
    title: '10,000 Step Daily Count Master',
    category: 'Endurance',
    goalCategory: 'Fat Loss',
    difficulty: 'Intermediate',
    durationDays: 21,
    estimatedDailyMin: 65,
    estBurnPerSession: 420,
    targetMuscles: ['Lower Body', 'Heart Rate Base', 'Glutes'],
    equipment: ['Fitness Tracker / Phone'],
    heroImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    description: 'Build peak cardiovascular stamina and achieve elite active daily calorie expenditure.',
    aiMatchScore: 92,
    aiRecommendationReason: 'Directly supports your calorie deficit target of -400 kcal net daily.',
    dailySchedule: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: 10,000 Step Milestone`,
      exercises: [
        { name: 'Cumulative Active Walking', sets: 1, reps: '10,000 steps', durationMin: 60, restSec: 0 },
        { name: 'Hamstring & Lower Back Cool-down', sets: 2, reps: '60 sec', durationMin: 5, restSec: 30 }
      ]
    }))
  },
  {
    id: 'ch_desi_gym_builder',
    title: 'Desi Gym Hypertrophy & Muscle Sculpt',
    category: 'Muscle Gain',
    goalCategory: 'Muscle Gain',
    difficulty: 'Intermediate',
    durationDays: 28,
    estimatedDailyMin: 45,
    estBurnPerSession: 360,
    targetMuscles: ['Chest', 'Lats', 'Deltoids', 'Quads', 'Biceps'],
    equipment: ['Gym Equipment', 'Dumbbells', 'Barbell'],
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    description: 'Structured 4-week progressive overload routine for upper & lower body hypertrophy.',
    aiMatchScore: 96,
    aiRecommendationReason: 'Pairs perfectly with your 120g daily protein target for maximum muscle synthesis.',
    dailySchedule: Array.from({ length: 28 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: ${i % 4 === 0 ? 'Push Strength (Chest & Shoulders)' : i % 4 === 1 ? 'Pull Density (Back & Biceps)' : i % 4 === 2 ? 'Leg Power & Calves' : 'Active Core & Recovery'}`,
      exercises: i % 4 === 3 ? [
        { name: 'Plank Hold', sets: 4, reps: '60 sec', durationMin: 10, restSec: 45 },
        { name: 'Light Foam Rolling', sets: 1, reps: '10 mins', durationMin: 10, restSec: 0 }
      ] : [
        { name: 'Incline Bench Press', sets: 4, reps: '8-10 reps', durationMin: 15, restSec: 90 },
        { name: 'Heavy Barbell Row / Lat Pulldown', sets: 4, reps: '10 reps', durationMin: 15, restSec: 90 },
        { name: 'Dumbbell Lateral Raises', sets: 3, reps: '15 reps', durationMin: 10, restSec: 60 }
      ]
    }))
  },
  {
    id: 'ch_home_circuit',
    title: '10-Min Home Bodyweight Shred',
    category: 'Home',
    goalCategory: 'Bodyweight',
    difficulty: 'Beginner',
    durationDays: 14,
    estimatedDailyMin: 12,
    estBurnPerSession: 130,
    targetMuscles: ['Full Body', 'Abs', 'Triceps'],
    equipment: ['Bodyweight Only'],
    heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    description: 'Quick high-intensity home workouts with zero equipment required for busy schedules.',
    aiMatchScore: 90,
    aiRecommendationReason: 'Short duration fits your high-intensity weekday schedule seamlessly.',
    dailySchedule: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Express HIIT Circuit`,
      exercises: [
        { name: 'Jumping Jacks', sets: 3, reps: '45 sec', durationMin: 3, restSec: 15 },
        { name: 'Bodyweight Squats', sets: 3, reps: '20 reps', durationMin: 3, restSec: 15 },
        { name: 'Push-ups / Knee Push-ups', sets: 3, reps: '12 reps', durationMin: 3, restSec: 30 }
      ]
    }))
  },
  {
    id: 'ch_heavy_lifting_100k',
    title: '100,000 KG Heavy Lifters Milestone',
    category: 'Strength',
    goalCategory: 'Strength',
    difficulty: 'Advanced',
    durationDays: 30,
    estimatedDailyMin: 50,
    estBurnPerSession: 520,
    targetMuscles: ['Posterior Chain', 'Quads', 'Chest', 'Core'],
    equipment: ['Gym / Heavy Free Weights'],
    heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    description: 'Accumulate 100 metric tons of total volume lifted across squats, deadlifts, and bench presses.',
    aiMatchScore: 88,
    aiRecommendationReason: 'Challenging advanced overload program designed to push your maximum lifting ceiling.',
    dailySchedule: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Heavy Compound Session`,
      exercises: [
        { name: 'Barbell Back Squats', sets: 5, reps: '5 reps @ 80%', durationMin: 20, restSec: 120 },
        { name: 'Barbell Deadlifts', sets: 4, reps: '5 reps', durationMin: 15, restSec: 120 },
        { name: 'Overhead Press', sets: 4, reps: '8 reps', durationMin: 15, restSec: 90 }
      ]
    }))
  }
];

const CATEGORY_TAGS = [
  'All', 'Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'Mobility',
  'Flexibility', 'Home', 'Gym', 'Bodyweight', 'Beginner', 'Advanced', 'Recovery'
];

export default function ChallengeModule({ onNotification }) {
  const ecoStore = useEcosystemStore();
  const storeUser = useStore(state => state.user);
  const userId = storeUser?.uid || storeUser?.id;
  const addWorkoutLogStore = useStore(state => state.addWorkoutLog);

  // States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyTab, setHistoryTab] = useState('Active'); // Active, Completed, Paused, Archived
  const [selectedChallenge, setSelectedChallenge] = useState(null); // Detail modal
  const [checkInChallenge, setCheckInChallenge] = useState(null); // Daily check-in modal
  const [showCertificateModal, setShowCertificateModal] = useState(null);

  // Check-in Form States
  const [energyRating, setEnergyRating] = useState(4);
  const [rpeRating, setRpeRating] = useState(7);
  const [sorenessRating, setSorenessRating] = useState(3);
  const [selectedMood, setSelectedMood] = useState('Motivated');
  const [checkInNotes, setCheckInNotes] = useState('');

  // Premium Adaptive AI Toggle
  const [adaptiveAiEnabled, setAdaptiveAiEnabled] = useState(true);

  // Sync active challenges with database & ecosystem store
  const userActiveChallenges = useMemo(() => {
    return ecoStore.activeChallenges || [];
  }, [ecoStore.activeChallenges]);

  // Featured Challenge (Hero)
  const featuredChallenge = useMemo(() => {
    const active = userActiveChallenges.find(c => !c.completed);
    if (active) {
      const matchDb = CHALLENGE_DATABASE.find(x => x.id === active.id || x.title.toLowerCase().includes(active.name.toLowerCase().substring(0, 7)));
      return {
        ...CHALLENGE_DATABASE[0],
        ...matchDb,
        id: active.id,
        title: active.name,
        progressDays: active.progress || 0,
        targetDays: active.targetVal || 15,
        completed: active.completed || false
      };
    }
    return CHALLENGE_DATABASE[0];
  }, [userActiveChallenges]);

  // AI Recommended Challenges
  const aiRecommended = useMemo(() => {
    const recovery = ecoStore.healthTwin?.recoveryScore || 85;
    return CHALLENGE_DATABASE.filter(c => {
      if (recovery < 70) return c.category === 'Flexibility' || c.category === 'Home' || c.difficulty === 'Beginner';
      return c.aiMatchScore >= 90;
    }).slice(0, 3);
  }, [ecoStore.healthTwin]);

  // Filtered Challenge Library Grid
  const filteredLibrary = useMemo(() => {
    return CHALLENGE_DATABASE.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.targetMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' ||
                         c.category.toLowerCase() === selectedCategory.toLowerCase() ||
                         c.goalCategory.toLowerCase() === selectedCategory.toLowerCase() ||
                         c.difficulty.toLowerCase() === selectedCategory.toLowerCase() ||
                         c.equipment.some(eq => eq.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  // Handle Enrollment / Join Challenge
  const handleEnrollChallenge = (ch) => {
    ecoStore.joinChallenge({
      id: ch.id,
      tier: ch.difficulty.toUpperCase(),
      name: ch.title,
      target: ch.description,
      progress: 0,
      targetVal: ch.durationDays,
      completed: false,
      unit: 'days'
    });
    if (onNotification) {
      onNotification(`🎉 Enrolled in "${ch.title}"! Your AI guided program is ready.`);
    }
    setSelectedChallenge(null);
  };

  // Complete Daily Session & Trigger Check-in
  const handleOpenDailyCheckIn = (ch) => {
    setCheckInChallenge(ch);
    setEnergyRating(4);
    setRpeRating(7);
    setSorenessRating(3);
    setSelectedMood('Motivated');
    setCheckInNotes('');
  };

  // Submit Daily Check-in & Auto Log Calories Burned
  const handleSubmitCheckIn = async () => {
    if (!checkInChallenge) return;

    const currentProgress = checkInChallenge.progress || checkInChallenge.progressDays || 0;
    const nextProgress = currentProgress + 1;
    const isNowCompleted = nextProgress >= (checkInChallenge.targetVal || checkInChallenge.durationDays || 15);
    const estKcal = checkInChallenge.estBurnPerSession || 220;

    // 1. Update Ecosystem Progress
    ecoStore.updateChallengeProgress(checkInChallenge.id, nextProgress);

    // 2. Create Workout Log Entry
    const workoutItem = {
      id: 'w_ch_' + Date.now(),
      name: `[Challenge] ${checkInChallenge.title || checkInChallenge.name} - Day ${nextProgress}`,
      category: 'Cardio',
      sets: 1,
      reps: nextProgress,
      weight: 0,
      duration: checkInChallenge.estimatedDailyMin || 30,
      caloriesBurned: estKcal,
      timestamp: Date.now(),
      checkIn: {
        energy: energyRating,
        rpe: rpeRating,
        soreness: sorenessRating,
        mood: selectedMood,
        notes: checkInNotes
      }
    };

    try {
      const saved = await addWorkoutLog(userId, workoutItem);
      addWorkoutLogStore(saved || workoutItem);
    } catch (err) {
      console.warn("DB log failed, updating local store", err);
      addWorkoutLogStore(workoutItem);
    } finally {
      ecoStore.addXP(250);
      ecoStore.updateStreaks({ workoutStreak: (ecoStore.streaks?.workoutStreak || 0) + 1 });
      setCheckInChallenge(null);

      if (onNotification) {
        onNotification(`✅ Day ${nextProgress} Check-in Complete! Logged +${estKcal} kcal burned (-${estKcal} net calories) & +250 XP!`);
      }
      if (isNowCompleted) {
        setShowCertificateModal(checkInChallenge);
      }
    }
  };

  // Certificate PDF/Canvas Download Mock
  const handleDownloadCertificate = (ch) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 1200, 800);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CALYXO AI FITNESS CERTIFICATE', 600, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 600, 240);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText((storeUser?.email || 'Calyxo Member').toUpperCase(), 600, 330);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '20px sans-serif';
    ctx.fillText(`For successfully completing the AI-Guided Program:`, 600, 420);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(ch.title || ch.name, 600, 480);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Issued on ${new Date().toLocaleDateString()} | Calyxo Adaptive Coach V2.4`, 600, 600);

    const link = document.createElement('a');
    link.download = `${(ch.title || 'Challenge').replace(/\s+/g, '_')}_Certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    if (onNotification) onNotification("📜 Certificate of Completion downloaded!");
  };

  return (
    <div className="space-y-8 pb-32">

      {/* ── MODULE 1: FEATURED CHALLENGE HERO ────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden glass border border-card-border shadow-2xl bg-gradient-to-br from-surface via-card-bg to-emerald-950/20">
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: `url(${featuredChallenge.heroImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> AI Recommended ({featuredChallenge.aiMatchScore}% Match)
              </span>
              <span className="px-3 py-1 rounded-full bg-surface border border-card-border text-muted text-[10px] font-black uppercase tracking-wider">
                {featuredChallenge.difficulty} • {featuredChallenge.estimatedDailyMin} min/day
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-foreground uppercase tracking-wide leading-tight">
              {featuredChallenge.title}
            </h2>
            <p className="text-sm text-muted leading-relaxed font-medium">
              {featuredChallenge.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Flame className="w-4 h-4" /> ~{featuredChallenge.estBurnPerSession} kcal/day
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted">
                <Clock className="w-4 h-4" /> {featuredChallenge.durationDays} Days Duration
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted">
                <Dumbbell className="w-4 h-4" /> {featuredChallenge.targetMuscles.join(', ')}
              </div>
            </div>
          </div>

          {/* Progress Ring & Action */}
          <div className="flex flex-col items-center sm:items-end justify-center gap-4 w-full sm:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-card-border/60 pt-6 lg:pt-0 lg:pl-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" className="text-surface" fill="transparent" />
                <circle
                  cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10"
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - Math.min(1, (featuredChallenge.progressDays || 0) / (featuredChallenge.targetDays || 15)))}
                  strokeLinecap="round" fill="transparent"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-2xl font-black text-foreground">
                  {Math.round(((featuredChallenge.progressDays || 0) / (featuredChallenge.targetDays || 15)) * 100)}%
                </span>
                <span className="text-[9px] font-bold text-muted uppercase">Day {featuredChallenge.progressDays || 0}/{featuredChallenge.targetDays || 15}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenDailyCheckIn(featuredChallenge)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{(featuredChallenge.progressDays || 0) > 0 ? "Log Today's Session" : "Start Program"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── MODULE 8: ADAPTIVE AI ENGINE STATUS CARD (PREMIUM) ──────────────── */}
      <section className="glass p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase text-foreground">Adaptive AI Coach Enabled</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">Active V2.4</span>
            </div>
            <p className="text-[11px] text-muted leading-tight mt-0.5">
              Continuously adjusts rest periods, progressive load, and deload days based on your recovery score ({ecoStore.healthTwin?.recoveryScore || 85}%).
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdaptiveAiEnabled(!adaptiveAiEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
            adaptiveAiEnabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-surface border-card-border text-muted'
          }`}
        >
          {adaptiveAiEnabled ? 'Adaptive Mode ON' : 'Standard Mode'}
        </button>
      </section>

      {/* ── MODULE 2: AI RECOMMENDED PROGRAMS ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">AI Recommended Programs</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Personalized for your bio-metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiRecommended.map(ch => (
            <motion.div
              key={ch.id}
              whileHover={{ y: -4 }}
              className="glass p-5 rounded-2xl border border-card-border hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 shadow-md group relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                    {ch.aiMatchScore}% AI MATCH
                  </span>
                  <span className="text-[10px] font-bold text-muted uppercase">{ch.durationDays} Days</span>
                </div>

                <h4 className="text-sm font-black text-foreground uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
                  {ch.title}
                </h4>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{ch.description}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-card-border/60">
                <div className="p-2.5 rounded-xl bg-surface/80 border border-card-border/50 text-[10px] font-medium text-emerald-300 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{ch.aiRecommendationReason}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted uppercase">~{ch.estBurnPerSession} kcal/day</span>
                  <button
                    onClick={() => setSelectedChallenge(ch)}
                    className="px-3.5 py-1.5 rounded-xl bg-surface border border-card-border hover:border-emerald-400 text-emerald-400 text-xs font-black uppercase tracking-wider cursor-pointer transition-all hover:bg-emerald-500/10"
                  >
                    View Plan
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MODULE 3 & 4: CATEGORY FILTERS & CHALLENGE LIBRARY GRID ──────────── */}
      <section className="space-y-5 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Challenge Program Library</h3>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by muscle, goal, equipment..."
              className="w-full bg-[var(--input)] border border-card-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TAGS.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black border-emerald-500 shadow-md'
                  : 'bg-surface border-card-border text-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Challenge Library Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLibrary.map(ch => (
            <motion.div
              key={ch.id}
              whileHover={{ y: -3 }}
              className="glass rounded-2xl border border-card-border overflow-hidden shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all"
            >
              <div className="relative h-36 w-full overflow-hidden bg-black">
                <img src={ch.heroImage} alt={ch.title} className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 text-[9px] font-black text-emerald-400 uppercase tracking-wider backdrop-blur-sm">
                  {ch.difficulty}
                </span>
              </div>

              <div className="p-5 space-y-3 pt-0">
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider leading-snug">
                  {ch.title}
                </h4>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{ch.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ch.targetMuscles.map(m => (
                    <span key={m} className="px-2 py-0.5 rounded bg-surface border border-card-border text-[8px] font-black uppercase text-muted">
                      {m}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-card-border/60 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-muted uppercase">
                    {ch.durationDays} Days • ~{ch.estBurnPerSession} kcal
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedChallenge(ch)}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-card-border hover:border-emerald-400 text-foreground text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEnrollChallenge(ch)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-sm hover:brightness-110"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MODULE 9 & 13: MILESTONES & ANALYTICS DASHBOARD ──────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">

        {/* Milestones Card */}
        <div className="glass p-6 rounded-2xl border border-card-border space-y-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Program Milestones</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Earn Badges & XP</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { pct: '25%', label: 'Quarter Crusher', badge: '🥉', unlocked: true },
              { pct: '50%', label: 'Halfway Hero', badge: '🥈', unlocked: (featuredChallenge.progressDays || 0) >= 7 },
              { pct: '75%', label: 'Iron Consistent', badge: '🥇', unlocked: (featuredChallenge.progressDays || 0) >= 11 },
              { pct: '100%', label: 'Mastery Conqueror', badge: '👑', unlocked: (featuredChallenge.progressDays || 0) >= 15 }
            ].map((m, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-1.5 ${
                m.unlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-surface/50 border-card-border text-muted opacity-50'
              }`}>
                <span className="text-2xl">{m.badge}</span>
                <span className="text-xs font-black uppercase text-foreground">{m.pct} Milestone</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Challenge Analytics Visualizer */}
        <div className="glass p-6 rounded-2xl border border-card-border space-y-5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Program Adherence Analytics</h3>
            </div>
            <span className="text-[10px] font-bold text-muted uppercase">Last 30 Days</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted">Consistency Rate</span>
                <span className="text-emerald-400 font-black">92% Target Adherence</span>
              </div>
              <div className="w-full h-3 bg-black/40 border border-card-border rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[92%]" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-surface border border-card-border text-center">
                <span className="text-lg font-black text-emerald-400">14</span>
                <span className="text-[9px] font-bold text-muted uppercase block mt-0.5">Sessions Logged</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-card-border text-center">
                <span className="text-lg font-black text-emerald-400">3,420</span>
                <span className="text-[9px] font-bold text-muted uppercase block mt-0.5">Kcal Burned</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-card-border text-center">
                <span className="text-lg font-black text-emerald-400">420m</span>
                <span className="text-[9px] font-bold text-muted uppercase block mt-0.5">Active Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULE 11: CHALLENGE HISTORY & STATUS TABS ───────────────────────── */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-card-border pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Program History & Management</h3>

          <div className="flex items-center gap-1 bg-surface border border-card-border p-1 rounded-xl">
            {['Active', 'Completed', 'Paused', 'Archived'].map(tab => (
              <button
                key={tab}
                onClick={() => setHistoryTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer border-none transition-all ${
                  historyTab === tab
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userActiveChallenges.map(ch => (
            <div key={ch.id} className="glass p-5 rounded-2xl border border-card-border flex items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground uppercase">{ch.name}</h4>
                <p className="text-xs text-muted">{ch.target}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Progress: {ch.progress}/{ch.targetVal} {ch.unit}</span>
                  {ch.completed && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>

              {ch.completed ? (
                <button
                  onClick={() => handleDownloadCertificate(ch)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 hover:bg-emerald-500/30 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Certificate
                </button>
              ) : (
                <button
                  onClick={() => handleOpenDailyCheckIn(ch)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider cursor-pointer border-none hover:brightness-110 shrink-0"
                >
                  Check In
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── MODULE 5 & 6: CHALLENGE DETAIL MODAL & DAILY TIMELINE ────────────── */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedChallenge(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface border border-card-border rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-card-border pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                    {selectedChallenge.difficulty} • {selectedChallenge.durationDays} Days
                  </span>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-wide mt-1">
                    {selectedChallenge.title}
                  </h3>
                </div>
                <button onClick={() => setSelectedChallenge(null)} className="p-1.5 text-muted hover:text-foreground cursor-pointer bg-none border-none">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overview & Equipment */}
              <div className="space-y-4">
                <p className="text-xs text-muted leading-relaxed font-medium">{selectedChallenge.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-card-bg/40 border border-card-border text-xs font-bold text-muted">
                    Est. Daily: <span className="text-foreground">{selectedChallenge.estimatedDailyMin} mins</span>
                  </div>
                  <div className="p-3 rounded-xl bg-card-bg/40 border border-card-border text-xs font-bold text-muted">
                    Est. Calorie Burn: <span className="text-emerald-400">~{selectedChallenge.estBurnPerSession} kcal</span>
                  </div>
                  <div className="p-3 rounded-xl bg-card-bg/40 border border-card-border text-xs font-bold text-muted">
                    Equipment: <span className="text-foreground">{selectedChallenge.equipment.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Daily Schedule Interactive Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Interactive Daily Schedule Timeline</h4>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {selectedChallenge.dailySchedule.map(d => (
                    <div key={d.day} className="p-3 rounded-xl bg-surface/60 border border-card-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px]">
                          {d.day}
                        </span>
                        <div>
                          <span className="font-bold text-foreground block">{d.title}</span>
                          <span className="text-[10px] text-muted">{d.exercises.length} Exercises included</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Ready</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enroll Action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                <button onClick={() => setSelectedChallenge(null)} className="px-5 py-2.5 rounded-xl bg-surface border border-card-border text-xs font-bold text-muted cursor-pointer">
                  Close
                </button>
                <button onClick={() => handleEnrollChallenge(selectedChallenge)} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-lg hover:brightness-110">
                  Enroll Program Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODULE 7: DAILY CHECK-IN MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {checkInChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCheckInChallenge(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface border border-card-border rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-5 z-10">
              
              <div className="flex justify-between items-center border-b border-card-border pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase text-foreground">Daily Session Check-in</h3>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">{checkInChallenge.title || checkInChallenge.name}</span>
                </div>
                <button onClick={() => setCheckInChallenge(null)} className="p-1 text-muted hover:text-foreground cursor-pointer bg-none border-none"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase block mb-1.5">Energy Level (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEnergyRating(val)}
                        className={`flex-1 py-2 rounded-xl font-black transition-all border ${
                          energyRating === val ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-surface border-card-border text-muted'
                        }`}
                      >
                        ⚡ {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase block mb-1.5">Exertion (RPE 1-10): {rpeRating}</label>
                  <input
                    type="range" min="1" max="10" value={rpeRating}
                    onChange={(e) => setRpeRating(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase block mb-1.5">Post-Workout Mood</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Motivated', 'Energized', 'Tired', 'Calm'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMood(m)}
                        className={`py-2 rounded-xl font-bold transition-all border ${
                          selectedMood === m ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-surface border-card-border text-muted'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted uppercase block mb-1">Session Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    placeholder="Felt great on set 3, kept heart rate high..."
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                <button onClick={() => setCheckInChallenge(null)} className="px-4 py-2 bg-surface border border-card-border rounded-xl text-xs font-bold text-muted cursor-pointer">Cancel</button>
                <button onClick={handleSubmitCheckIn} className="px-5 py-2.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-md hover:brightness-110">
                  Complete & Log Burned
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODULE 10: CERTIFICATE MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showCertificateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCertificateModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface border border-emerald-500/40 rounded-3xl p-8 w-full max-w-md shadow-2xl text-center space-y-5 z-10">
              
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto text-3xl">
                🏆
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground uppercase tracking-wide">Program Completed!</h3>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{showCertificateModal.title || showCertificateModal.name}</p>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                You completed 100% of this program! Your AI certificate of fitness achievement is ready.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleDownloadCertificate(showCertificateModal)}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer border-none shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Official Certificate
                </button>
                <button
                  onClick={() => setShowCertificateModal(null)}
                  className="w-full py-2.5 rounded-xl bg-surface border border-card-border text-muted font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
