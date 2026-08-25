import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Dumbbell, Droplets, HeartPulse, Bot, 
  Sparkles, CheckCircle2, ArrowRight, Zap, Award, 
  Clock, Shield, Apple, Smartphone, Activity 
} from 'lucide-react';

export default function FeaturePillarsShowcase({ onOpenAuth, onOpenBetaModal }) {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <section id="capabilities" className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#030305] overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-[10px] font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>02 · Core Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Engineered with <br />
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Obsessive Depth.
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Every module in Calyxo is engineered as a standalone masterpiece, then coupled together into a synchronized health operating system.
          </p>
        </div>

        {/* Bento Grid of 5 Core Pillar Deep Dives */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Nutrition OS & 8,000+ Regional Database (Large 8-col) */}
          <div className="md:col-span-12 lg:col-span-8 p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 sm:p-8 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 flex-1 flex flex-col justify-between space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                      NUTRITION ARCHITECTURE
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      8,000+ Regional Foods & Macro OS
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Verified Macros
                </span>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                Track calories, protein, carbs, fat, and fiber with high-precision regional databases — including over 1,400 authentic Indian home-cooked dishes, portion sliders, and automated grocery budget calculation.
              </p>

              {/* Real App UI Preview Mock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/60 border border-white/5 font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-gray-400 block">CALORIES</span>
                  <span className="text-sm sm:text-base font-black text-amber-400">2,140</span>
                  <span className="text-[9px] text-gray-500 block">/ 2,400 kcal</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-gray-400 block">PROTEIN</span>
                  <span className="text-sm sm:text-base font-black text-emerald-400">152g</span>
                  <span className="text-[9px] text-gray-500 block">/ 160g target</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-gray-400 block">CARBS</span>
                  <span className="text-sm sm:text-base font-black text-cyan-400">210g</span>
                  <span className="text-[9px] text-gray-500 block">/ 240g target</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-gray-400 block">BUDGET AI</span>
                  <span className="text-sm sm:text-base font-black text-purple-400">₹350/day</span>
                  <span className="text-[9px] text-gray-500 block">₹2.18 / g Protein</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {['Paneer Tikka', 'Chicken Breast', 'Dal Tadka', 'Soya Chunks', 'Oats Bowl', 'Whey Isolate'].map((food) => (
                  <span key={food} className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {food}
                  </span>
                ))}
              </div>

            </div>
          </div>

          {/* Card 2: Hydration OS (4-col) */}
          <div className="md:col-span-12 lg:col-span-4 p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 sm:p-8 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 flex-1 flex flex-col justify-between space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    HYDRATION OS
                  </span>
                  <h3 className="text-xl font-black text-white">
                    3D Fluid Vessel
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Physics-based 3D liquid simulation calculating your exact cellular hydration targets based on daily training intensity and climate.
              </p>

              {/* Water Metric Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block">DAILY INTAKE</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono">2,450 <span className="text-xs text-gray-400">ml</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">82% OF GOAL</span>
                  <span className="text-xs font-mono text-gray-400">Target: 3,000 ml</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white">+250 ml</div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white">+500 ml</div>
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300">+750 ml</div>
              </div>

            </div>
          </div>

          {/* Card 3: Workout & Live Guided Telemetry (Large 6-col) */}
          <div className="md:col-span-12 lg:col-span-6 p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 sm:p-8 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 flex-1 flex flex-col justify-between space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    FITNESS ENGINE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Live Telemetry & Split Planner
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                Step-by-step guided sets, automated rest timers synced to iOS Dynamic Island, high-definition exercise GIF animations, weekly split blueprints, and CNS volume load recalibration.
              </p>

              {/* Workout Routine Strip */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" /> BARBELL BACK SQUAT
                  </span>
                  <span className="text-gray-400">SET 3 OF 4</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
                  <span className="text-white font-bold">120 kg × 8 reps</span>
                  <span className="text-cyan-400 font-bold">Rest: 00:45</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold">5x5 Heavy</div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold">Hypertrophy</div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold">Calisthenics</div>
              </div>

            </div>
          </div>

          {/* Card 4: Deterministic Recovery & Wearables (Large 6-col) */}
          <div className="md:col-span-12 lg:col-span-6 p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 sm:p-8 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 flex-1 flex flex-col justify-between space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                    VITALITY MODEL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    0–100% Deterministic Recovery
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                Connect Apple Watch, Wear OS, and Bluetooth BLE heart rate monitors. Calyxo computes your daily recovery score based on sleep deficit, resting heart rate, and cumulative workout volume strain.
              </p>

              {/* Recovery Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/60 border border-white/5 font-mono text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-gray-400 block">RECOVERY</span>
                  <span className="text-lg font-black text-emerald-400">92%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-gray-400 block">RESTING HR</span>
                  <span className="text-lg font-black text-white">58 <span className="text-[9px] text-gray-400">bpm</span></span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] text-gray-400 block">SLEEP</span>
                  <span className="text-lg font-black text-cyan-400">8h 12m</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
                <span>Apple HealthKit</span>
                <span>•</span>
                <span>Android Health Connect</span>
                <span>•</span>
                <span>BLE Pulse Sensors</span>
              </div>

            </div>
          </div>

          {/* Card 5: Proactive AI Coach Intelligence Hub (Full 12-col Banner) */}
          <div className="md:col-span-12 p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl">
            <div className="p-6 sm:p-10 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                      PROACTIVE INTELLIGENCE
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      Calyxo Intelligence Hub
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  Powered by Gemini AI, Calyxo doesn't just wait for you to type a prompt. It delivers a personalized <strong className="text-white">Daily Morning Briefing</strong> synthesizing your nutrition gaps, recovery strain, and workout volume targets before your day even starts.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                    ⚡ Morning Briefing Engine
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                    🎯 CNS Volume Re-calculation
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
                    🥗 Multimodal Meal Analysis
                  </span>
                </div>
              </div>

              {/* Sample AI Briefing Card Preview */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-black/80 border border-purple-500/30 shadow-2xl space-y-3 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Daily AI Coach Briefing</span>
                  <span className="text-[10px] font-mono text-gray-400">07:00 AM</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  "Your sleep recovery score is high at <strong>92%</strong> today. You have adequate glycogen stores from yesterday's 240g carbs. Today is your scheduled <strong>Push Day</strong>. We recommend targeting 4 sets on Incline Bench with an extra 2.5 kg overload."
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5">
                  <span>Target: 160g Protein</span>
                  <span className="text-emerald-400 font-bold">Optimal CNS Readiness</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
