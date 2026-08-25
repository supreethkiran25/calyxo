import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Droplets, HeartPulse, Bot, 
  TrendingUp, Sparkles, Check, ArrowRight, Play, 
  Clock, Plus, Shield, ChevronRight, Zap
} from 'lucide-react';
import Logo from '../Logo';

export default function InteractiveAppShowcase({ onOpenAuth }) {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const screens = [
    {
      id: 'dashboard',
      label: 'Command Center',
      tag: 'Overview',
      icon: Sparkles,
      color: '#10B981',
      title: 'Your daily health cockpit.',
      desc: 'Synchronized view of active calories, steps, hydration percentage, macro goals, and active recovery readiness in one glance.'
    },
    {
      id: 'nutrition',
      label: 'Nutrition OS',
      tag: 'Macro Tracking',
      icon: Flame,
      color: '#F59E0B',
      title: 'Macro precision with regional food databases.',
      desc: 'Log Indian and international dishes with instant verified macros, automated meal grouping, and grocery budget optimization.'
    },
    {
      id: 'workout',
      label: 'Live Workout',
      tag: 'Active Guided Session',
      icon: Dumbbell,
      color: '#10B981',
      title: 'Guided live sessions & rest timers.',
      desc: 'Live telemetry with exercise GIFs, set-by-set weight tracking, and real-time rest timers synced to the iOS Dynamic Island.'
    },
    {
      id: 'hydration',
      label: 'Hydration OS',
      tag: 'Fluid Dynamics',
      icon: Droplets,
      color: '#00F0FF',
      title: 'Dynamic fluid physics & pace targets.',
      desc: 'Visual 3D water vessel with smart hydration pace alerts calculated from your daily workouts and ambient temperature.'
    },
    {
      id: 'progress',
      label: 'Body Composition',
      tag: 'Visual Analytics',
      icon: TrendingUp,
      color: '#8B5CF6',
      title: 'Visual body metrics & AI forecasts.',
      desc: 'Interactive horizontal ruler wheel pickers, visual silhouette selectors, and 30 to 180-day lean mass forecast curves.'
    },
    {
      id: 'coach',
      label: 'AI Intelligence',
      tag: 'Proactive Coach',
      icon: Bot,
      color: '#EC4899',
      title: 'Proactive AI morning briefing.',
      desc: 'Gemini AI analyzes yesterday’s recovery, sleep, and workouts to provide your personalized training and nutrition gameplan.'
    }
  ];

  const currentScreenData = screens.find(s => s.id === activeScreen) || screens[0];

  return (
    <section id="showcase" className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#050507] overflow-hidden border-t border-white/5">
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>03 · Interactive Product Tour</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            See Calyxo <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              In Action.
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-gray-300 font-medium leading-relaxed">
            Click any module below to test drive the real Calyxo user interface inside our mobile frame.
          </p>
        </div>

        {/* Interactive Experience Grid: Selector Left + 3D Phone Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Interactive Screen Selector Tabs */}
          <div className="lg:col-span-5 space-y-3">
            {screens.map((screen) => {
              const isSelected = screen.id === activeScreen;
              const Icon = screen.icon;
              return (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(screen.id)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 group ${
                    isSelected
                      ? 'bg-white/10 border-white/30 shadow-2xl shadow-black scale-[1.02]'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${screen.color}15`,
                        borderColor: `${screen.color}35`,
                        color: screen.color
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-wide truncate">
                          {screen.label}
                        </h4>
                        <span className="text-[9px] font-mono uppercase text-gray-400 hidden sm:inline">
                          ({screen.tag})
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {screen.desc}
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    isSelected ? 'bg-emerald-400 text-black' : 'bg-white/5 text-gray-400 group-hover:translate-x-0.5'
                  }`}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Realistic Phone Mockup Frame (Double-Bezel Hardware Design) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] p-3 rounded-[3rem] bg-gradient-to-b from-white/15 via-white/5 to-white/10 border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.9)]">
              
              {/* Inner Phone Chassis */}
              <div className="relative w-full rounded-[2.5rem] bg-[#030303] border border-white/10 overflow-hidden shadow-inner flex flex-col min-h-[580px] sm:min-h-[620px]">
                
                {/* Dynamic Island Pill Top Bar */}
                <div className="pt-3 px-6 flex justify-between items-center z-20">
                  <span className="text-[11px] font-mono font-bold text-white">09:41</span>
                  <div className="w-20 h-4 rounded-full bg-black border border-white/20 flex items-center justify-center gap-1.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono text-gray-300 font-bold">CALYXO</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400 font-bold">
                    <span>5G</span>
                    <div className="w-4 h-2 rounded-sm border border-current flex items-center p-0.5">
                      <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Dynamic Screen Content Inside Frame */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 overflow-hidden">
                  
                  <AnimatePresence mode="wait">
                    {/* Screen 1: Dashboard Command Center */}
                    {activeScreen === 'dashboard' && (
                      <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 pt-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">TODAY · LIVE SYNC</span>
                            <h3 className="text-base font-black text-white">Alex Morgan</h3>
                          </div>
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            🔥 14-Day Streak
                          </span>
                        </div>

                        {/* 4 Health Rings Strip */}
                        <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-center">
                          <div>
                            <span className="text-[8px] text-amber-400 block font-bold">KCAL</span>
                            <span className="text-xs font-black text-white">2,140</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-emerald-400 block font-bold">STEPS</span>
                            <span className="text-xs font-black text-white">9,420</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-cyan-400 block font-bold">WATER</span>
                            <span className="text-xs font-black text-white">2.4L</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-red-400 block font-bold">RECOVERY</span>
                            <span className="text-xs font-black text-white">92%</span>
                          </div>
                        </div>

                        {/* Active Routine Card */}
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Push Day Split
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold">Ready</span>
                          </div>
                          <p className="text-[11px] text-gray-400">Chest, Shoulders & Triceps · 6 Exercises</p>
                        </div>

                        {/* Meal Group Preview */}
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Post-Workout Meal</span>
                            <span className="text-amber-400 font-bold">650 kcal</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-sans">Grilled Chicken Breast, Brown Rice, Steamed Veggies</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Screen 2: Nutrition OS */}
                    {activeScreen === 'nutrition' && (
                      <motion.div
                        key="nutrition"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 pt-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">NUTRITION OS</span>
                            <h3 className="text-base font-black text-white">Daily Macro Fuel</h3>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">8,000+ Items</span>
                        </div>

                        {/* Macro Breakdown Visual Bars */}
                        <div className="space-y-2 p-3 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-xs">
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span>Protein (152g / 160g)</span>
                              <span className="text-emerald-400 font-bold">95%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '95%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span>Carbs (210g / 240g)</span>
                              <span className="text-cyan-400 font-bold">88%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: '88%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span>Fats (58g / 65g)</span>
                              <span className="text-amber-400 font-bold">89%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: '89%' }} />
                            </div>
                          </div>
                        </div>

                        {/* Regional Indian Food Logged List */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Recent Meals</span>
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex justify-between items-center text-xs">
                            <span className="text-white font-bold">Paneer Bhurji (200g)</span>
                            <span className="text-emerald-400 font-mono font-bold">28g Protein</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex justify-between items-center text-xs">
                            <span className="text-white font-bold">Soya Chunks Curry (100g)</span>
                            <span className="text-emerald-400 font-mono font-bold">52g Protein</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Screen 3: Live Workout Telemetry */}
                    {activeScreen === 'workout' && (
                      <motion.div
                        key="workout"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 pt-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">LIVE SESSION</span>
                            <h3 className="text-base font-black text-white">Barbell Bench Press</h3>
                          </div>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                            Set 3 / 4
                          </span>
                        </div>

                        {/* Rest Timer Countdown */}
                        <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-center space-y-1">
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">Rest Timer</span>
                          <div className="text-3xl font-black text-emerald-400 font-mono">00:45</div>
                          <span className="text-[10px] font-mono text-cyan-300">Live on Dynamic Island</span>
                        </div>

                        {/* Set Recording Table */}
                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300">
                            <span>Set 1: 90 kg × 10 reps</span>
                            <span className="text-emerald-400">✓ Completed</span>
                          </div>
                          <div className="flex justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300">
                            <span>Set 2: 95 kg × 8 reps</span>
                            <span className="text-emerald-400">✓ Completed</span>
                          </div>
                          <div className="flex justify-between p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-white font-bold">
                            <span>Set 3: 100 kg × 6 reps</span>
                            <span className="text-amber-400">Current</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Screen 4: Hydration OS */}
                    {activeScreen === 'hydration' && (
                      <motion.div
                        key="hydration"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 pt-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">HYDRATION OS</span>
                            <h3 className="text-base font-black text-white">3D Water Vessel</h3>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">82%</span>
                        </div>

                        {/* 3D Vessel Mock Fluid Tube */}
                        <div className="p-6 rounded-2xl bg-black/60 border border-cyan-500/30 flex flex-col items-center justify-center space-y-2">
                          <div className="w-16 h-28 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 relative overflow-hidden flex flex-col justify-end">
                            <div className="w-full h-4/5 bg-gradient-to-t from-cyan-500 to-cyan-400/70 relative">
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                          </div>
                          <span className="text-xl font-black text-cyan-400 font-mono">2,450 ml</span>
                          <span className="text-[9px] font-mono text-gray-400">Daily Target: 3,000 ml</span>
                        </div>

                        {/* Quick Increment Actions */}
                        <div className="grid grid-cols-3 gap-2 font-mono text-center">
                          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white cursor-pointer">+250ml</button>
                          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white cursor-pointer">+500ml</button>
                          <button className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 cursor-pointer">+750ml</button>
                        </div>
                      </motion.div>
                    )}

                    {/* Screen 5: Body Composition & Progress */}
                    {activeScreen === 'progress' && (
                      <motion.div
                        key="progress"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 pt-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">BODY COMPOSITION</span>
                            <h3 className="text-base font-black text-white">Weight & Analytics</h3>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">-3.2 kg</span>
                        </div>

                        {/* Ruler Wheel Display Box */}
                        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center space-y-1">
                          <span className="text-[9px] font-mono text-gray-400 uppercase">Current Log</span>
                          <div className="text-3xl font-black text-white font-mono">74.5 <span className="text-xs text-purple-400">kg</span></div>
                          <span className="text-[10px] font-mono text-emerald-400">Est. Body Fat: 14.2%</span>
                        </div>

                        {/* AI Projection Breakdown */}
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs font-mono">
                          <span className="text-[9px] text-gray-400 uppercase block font-bold">90-Day AI Projection</span>
                          <div className="flex justify-between text-gray-300">
                            <span>Projected Weight</span>
                            <span className="text-emerald-400 font-bold">71.8 kg</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Lean Muscle Target</span>
                            <span className="text-cyan-400 font-bold">+1.8 kg</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Screen 6: AI Intelligence Coach */}
                    {activeScreen === 'coach' && (
                      <motion.div
                        key="coach"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 pt-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">PROACTIVE AI</span>
                            <h3 className="text-base font-black text-white">Daily Briefing</h3>
                          </div>
                          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">Gemini AI</span>
                        </div>

                        {/* Coach Message Card */}
                        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                          <p className="text-xs text-gray-200 leading-relaxed font-sans">
                            "Great work hitting your 160g protein target yesterday. Your recovery readiness is <strong>92%</strong> today. Go for the 5x5 Squat Challenge this evening."
                          </p>
                          <div className="flex justify-between text-[9px] font-mono text-gray-400 pt-1 border-t border-white/10">
                            <span>CNS Readiness: High</span>
                            <span className="text-emerald-400 font-bold">Ready to Train</span>
                          </div>
                        </div>

                        {/* Quick AI Prompt Pills */}
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 truncate">
                            "Suggest a high-protein Indian breakfast under ₹60"
                          </div>
                          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 truncate">
                            "Recalculate volume for Leg Day (low sleep)"
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom Navigation Pill */}
                  <div className="pt-3 border-t border-white/10 flex justify-center">
                    <button
                      onClick={() => onOpenAuth('signup')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                    >
                      <span>Try {currentScreenData.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
