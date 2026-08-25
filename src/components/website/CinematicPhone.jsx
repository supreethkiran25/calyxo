import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Droplets, HeartPulse, Bot, 
  Sparkles, Check, ArrowRight, Zap, Play, Clock, 
  Activity, Award, ShieldCheck, Plus 
} from 'lucide-react';
import Logo from '../Logo';

export default function CinematicPhone({ currentStep = 0, className = "" }) {
  const screens = [
    // 01: COMMAND CENTER (TODAY)
    {
      id: 'today',
      name: 'Today',
      eyebrow: '01 · COMMAND CENTER',
      accentColor: '#CCFF00',
      content: (
        <div className="space-y-3 pt-1 text-left font-sans">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#CCFF00] uppercase font-bold">TODAY · LIVE SYNC</span>
              <h4 className="text-sm font-bold text-white font-outfit">Alex Morgan</h4>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 font-bold">
              🔥 14-Day Streak
            </span>
          </div>

          {/* Real 4-Pillar Health Core Strip */}
          <div className="grid grid-cols-4 gap-1.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 font-mono text-center shadow-inner">
            <div className="p-1 rounded-xl bg-black/40">
              <span className="text-[8px] text-[#F59E0B] block font-bold">KCAL</span>
              <span className="text-xs font-black text-white">2,140</span>
              <span className="text-[7.5px] text-gray-500 block">/ 2,400</span>
            </div>
            <div className="p-1 rounded-xl bg-black/40">
              <span className="text-[8px] text-[#10B981] block font-bold">STEPS</span>
              <span className="text-xs font-black text-white">9,420</span>
              <span className="text-[7.5px] text-gray-500 block">/ 10,000</span>
            </div>
            <div className="p-1 rounded-xl bg-black/40">
              <span className="text-[8px] text-[#00F0FF] block font-bold">WATER</span>
              <span className="text-xs font-black text-white">2.4L</span>
              <span className="text-[7.5px] text-gray-500 block">/ 3.0L</span>
            </div>
            <div className="p-1 rounded-xl bg-black/40">
              <span className="text-[8px] text-[#CCFF00] block font-bold">RECOVERY</span>
              <span className="text-xs font-black text-[#CCFF00]">92%</span>
              <span className="text-[7.5px] text-[#CCFF00]/80 block">Optimal</span>
            </div>
          </div>

          {/* Active Workout Routine Preview with Real Exercise Thumbnail */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-black overflow-hidden border border-white/15 shrink-0 shadow-md">
              <img 
                src="/exercises/images/0001-2gPfomN.jpg" 
                alt="Barbell Workout" 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate font-outfit">Push Day Split</span>
                <span className="text-[9px] font-mono text-[#CCFF00] font-bold">Ready</span>
              </div>
              <p className="text-[10px] text-[#8E8E93] truncate">Chest, Shoulders & Triceps · 6 Exercises</p>
            </div>
          </div>

          {/* Real Post-Workout Meal Card */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold font-sans">Post-Workout Fuel</span>
              <span className="text-[#CCFF00] font-bold">650 kcal</span>
            </div>
            <p className="text-[10px] text-[#8E8E93] font-sans">Grilled Chicken Breast (200g), Brown Rice, Steamed Greens</p>
            <div className="flex items-center gap-3 text-[9px] text-gray-400 pt-1 border-t border-white/5">
              <span>P: 48g</span>
              <span>•</span>
              <span>C: 64g</span>
              <span>•</span>
              <span>F: 14g</span>
            </div>
          </div>

        </div>
      )
    },

    // 02: NUTRITION OS (MACRO TRACKING & INDIAN FOODS)
    {
      id: 'nutrition',
      name: 'Nutrition OS',
      eyebrow: '02 · MACRO TRACKING',
      accentColor: '#F59E0B',
      content: (
        <div className="space-y-3 pt-1 text-left font-sans">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#F59E0B] uppercase font-bold">NUTRITION OS</span>
              <h4 className="text-sm font-bold text-white font-outfit">8,000+ Regional Foods</h4>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
              Verified DB
            </span>
          </div>

          {/* Live Dynamic Macro Bars */}
          <div className="space-y-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[10px] text-gray-300">
                <span>Protein (152g / 160g)</span>
                <span className="text-[#CCFF00] font-bold">95%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[#CCFF00] rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-300">
                <span>Carbs (210g / 240g)</span>
                <span className="text-white font-bold">88%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-white/70 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-300">
                <span>Fats (58g / 65g)</span>
                <span className="text-white font-bold">89%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-white/40 rounded-full" style={{ width: '89%' }} />
              </div>
            </div>
          </div>

          {/* Authentic Regional Indian Food Entries */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#8E8E93] font-bold">Logged Meals Today</span>
            
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-xs">
                  PB
                </div>
                <div>
                  <span className="text-white font-bold block">Paneer Bhurji (200g)</span>
                  <span className="text-[9px] text-gray-400 font-mono">Lunch · ₹75 cost</span>
                </div>
              </div>
              <span className="text-[#CCFF00] font-mono font-bold">28g P</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-xs">
                  SC
                </div>
                <div>
                  <span className="text-white font-bold block">Soya Chunks Curry (100g)</span>
                  <span className="text-[9px] text-gray-400 font-mono">Dinner · ₹35 cost</span>
                </div>
              </div>
              <span className="text-[#CCFF00] font-mono font-bold">52g P</span>
            </div>
          </div>

        </div>
      )
    },

    // 03: HYDRATION OS (3D VESSEL)
    {
      id: 'hydration',
      name: 'Hydration OS',
      eyebrow: '03 · 3D FLUID VESSEL',
      accentColor: '#00F0FF',
      content: (
        <div className="space-y-3 pt-1 text-left font-sans">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#00F0FF] uppercase font-bold">HYDRATION OS</span>
              <h4 className="text-sm font-bold text-white font-outfit">Dynamic 3D Vessel</h4>
            </div>
            <span className="text-[10px] font-mono text-[#00F0FF] bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
              82% of Goal
            </span>
          </div>

          {/* 3D Water Simulation Container */}
          <div className="p-4 rounded-2xl bg-black/70 border border-cyan-500/30 flex flex-col items-center justify-center space-y-2 relative overflow-hidden shadow-xl">
            <div className="w-20 h-28 rounded-2xl bg-[#09151e] border border-cyan-400/40 relative overflow-hidden flex flex-col justify-end shadow-inner">
              <div className="w-full h-4/5 bg-gradient-to-t from-cyan-500 via-cyan-400/80 to-[#CCFF00]/50 relative">
                <div className="absolute inset-0 bg-white/25 animate-pulse" />
              </div>
            </div>
            <span className="text-2xl font-black text-white font-mono">2,450 <span className="text-xs text-cyan-300 font-normal">ml</span></span>
            <span className="text-[9px] font-mono text-[#8E8E93]">Daily Target: 3,000 ml</span>
          </div>

          {/* Quick Increment Actions */}
          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-white">+250ml</div>
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-white">+500ml</div>
            <div className="p-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-xs font-bold text-[#00F0FF]">+750ml</div>
          </div>

        </div>
      )
    },

    // 04: LIVE WORKOUT (DYNAMIC ISLAND & TELEMETRY)
    {
      id: 'workout',
      name: 'Live Workout',
      eyebrow: '04 · LIVE GUIDED SESSION',
      accentColor: '#10B981',
      content: (
        <div className="space-y-3 pt-1 text-left font-sans">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#10B981] uppercase font-bold">LIVE TELEMETRY</span>
              <h4 className="text-sm font-bold text-white font-outfit">Barbell Back Squat</h4>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              Set 3 of 4
            </span>
          </div>

          {/* Real Exercise Thumbnail & Live Island Rest Countdown */}
          <div className="p-3 rounded-2xl bg-black/70 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
              <img 
                src="/exercises/images/0514-LIlE5Tn.jpg" 
                alt="Barbell Squat" 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[8px] font-mono text-[#8E8E93] uppercase tracking-widest block">Rest Countdown</span>
              <div className="text-2xl font-black text-[#10B981] font-mono tracking-tight">00:45</div>
              <span className="text-[8.5px] font-mono text-cyan-300">Live on Dynamic Island</span>
            </div>
          </div>

          {/* Sets Progression Table */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between p-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#8E8E93]">
              <span>Set 1: 100 kg × 8 reps</span>
              <span className="text-[#10B981]">✓</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#8E8E93]">
              <span>Set 2: 110 kg × 6 reps</span>
              <span className="text-[#10B981]">✓</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/[0.08] border border-[#10B981]/40 text-white font-bold">
              <span>Set 3: 120 kg × 5 reps</span>
              <span className="text-[#10B981]">Active</span>
            </div>
          </div>

        </div>
      )
    },

    // 05: RECOVERY MODEL (VITALITY SCORE)
    {
      id: 'recovery',
      name: 'Recovery Model',
      eyebrow: '05 · VITALITY SCORE',
      accentColor: '#8B5CF6',
      content: (
        <div className="space-y-3 pt-1 text-left font-sans">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase font-bold">RECOVERY ENGINE</span>
              <h4 className="text-sm font-bold text-white font-outfit">Vitality & Readiness</h4>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded font-black">
              92% Score
            </span>
          </div>

          {/* Biometric Vitality Matrix */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/60 border border-purple-500/30 font-mono text-center shadow-lg">
            <div className="p-1.5 rounded-xl bg-white/[0.02]">
              <span className="text-[8px] text-[#8E8E93] block">CNS READY</span>
              <span className="text-xs font-black text-purple-300">Optimal</span>
            </div>
            <div className="p-1.5 rounded-xl bg-white/[0.02]">
              <span className="text-[8px] text-[#8E8E93] block">SLEEP TIME</span>
              <span className="text-xs font-black text-white">7h 45m</span>
            </div>
            <div className="p-1.5 rounded-xl bg-white/[0.02]">
              <span className="text-[8px] text-[#8E8E93] block">RESTING HR</span>
              <span className="text-xs font-black text-white">58 bpm</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider block font-bold">Deterministic Balance</span>
            <p className="text-[#8E8E93] font-light text-[11px] leading-relaxed">
              Sleep deficit and training volume are mathematically balanced against metabolic calorie burn.
            </p>
          </div>

        </div>
      )
    },

    // 06: AI INTELLIGENCE (PROACTIVE COACH)
    {
      id: 'coach',
      name: 'AI Intelligence',
      eyebrow: '06 · PROACTIVE AI',
      accentColor: '#D946EF',
      content: (
        <div className="space-y-3 pt-1 text-left font-sans">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-fuchsia-400 uppercase font-bold">PROACTIVE AI</span>
              <h4 className="text-sm font-bold text-white font-outfit">Morning Briefing</h4>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30">
              Gemini AI
            </span>
          </div>

          {/* Real AI Coach Card */}
          <div className="p-3.5 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/30 space-y-2 shadow-lg">
            <p className="text-xs text-gray-200 leading-relaxed font-light">
              "Your sleep recovery is high at <strong>92%</strong> today. You hit 152g protein yesterday. Today is your scheduled <strong>Push Session</strong>. Target 4 sets on Incline Dumbbell Bench."
            </p>
            <div className="flex justify-between text-[9px] font-mono text-[#8E8E93] pt-1.5 border-t border-white/10">
              <span>CNS Readiness: High</span>
              <span className="text-fuchsia-300 font-bold">Optimal Window</span>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 truncate">
              "Suggest high-protein Indian breakfast under ₹60"
            </div>
          </div>

        </div>
      )
    }
  ];

  const currentScreen = screens[currentStep % screens.length] || screens[0];

  return (
    <div className={`relative w-full max-w-[320px] sm:max-w-[350px] mx-auto ${className}`}>
      
      {/* Outer Titanium Frame Shell */}
      <div className="p-3 rounded-[3.2rem] bg-gradient-to-b from-[#2c2c2e] via-[#1c1c1e] to-[#0c0c0e] border border-white/[0.15] shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
        
        {/* Inner OLED Display */}
        <div className="relative w-full rounded-[2.6rem] bg-[#020203] border border-white/[0.08] overflow-hidden flex flex-col min-h-[530px] sm:min-h-[560px] justify-between p-4 sm:p-5">
          
          {/* Dynamic Island Safe-Area Status Bar */}
          <div className="pt-2 px-3 flex justify-between items-center z-20">
            <span className="text-[10px] font-mono font-bold text-[#8E8E93]">09:41</span>
            <div className="w-20 h-4 rounded-full bg-black border border-white/[0.15] flex items-center justify-center gap-1.5 px-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full opacity-80" style={{ backgroundColor: currentScreen.accentColor }} />
              <span className="text-[7.5px] font-mono font-black text-white">CALYXO</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#8E8E93]">
              <span>5G</span>
            </div>
          </div>

          {/* Screen Content Container with Fluid Spring Crossfades */}
          <div className="flex-1 flex flex-col justify-center my-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen.id}
                initial={{ opacity: 0, scale: 0.94, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.94, y: -16, filter: 'blur(6px)' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentScreen.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Home Indicator */}
          <div className="pb-1 flex justify-center">
            <div className="w-28 h-1 rounded-full bg-white/20" />
          </div>

        </div>

      </div>

    </div>
  );
}
