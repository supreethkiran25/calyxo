import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Droplets, HeartPulse, Sparkles, Activity, CheckCircle2 } from 'lucide-react';

export default function ProductExplanationSection() {
  const [activeTab, setActiveTab] = useState('nutrition');

  const pillars = [
    {
      id: 'nutrition',
      name: 'Nutrition OS',
      metric: '2,400 kcal Target',
      submetric: '160g P · 240g C · 65g F',
      icon: Flame,
      color: '#F59E0B',
      badge: '8,000+ Regional Foods',
      desc: 'Real-time macro balance tracking with authentic Indian and international databases, automated meal timelines, and grocery budget optimization.',
      points: [
        'Verified macro breakdown per 100g and regional cup portions',
        'Dynamic daily calorie deficit and surplus calculator',
        'AI meal planner with real-world Indian grocery market costing'
      ]
    },
    {
      id: 'movement',
      name: 'Workout Engine',
      metric: 'Push Power Split',
      submetric: '6 Exercises · 18 Sets · 4,800 kg Vol',
      icon: Dumbbell,
      color: '#10B981',
      badge: 'Live Guided Telemetry',
      desc: 'Interactive guided training with precision rest timers, high-definition exercise demonstrations, weekly split blueprints, and CNS volume load recalibration.',
      points: [
        'Live Active ActivityKit telemetry & Dynamic Island rest timers',
        '1,000+ exercise library with muscle targeting and GIF demos',
        'Heavy 5x5 compound, hypertrophy, and calisthenics challenges'
      ]
    },
    {
      id: 'hydration',
      name: 'Hydration OS',
      metric: '3,000 ml Target',
      submetric: '2,250 ml Logged (75% Complete)',
      icon: Droplets,
      color: '#00F0FF',
      badge: '3D Fluid Dynamics',
      desc: 'Dynamic fluid tracking with 3D vessel simulation, intelligent hydration pace recommendations, and automated reminders synced to activity intensity.',
      points: [
        'Realistic interactive 3D water vessel with physics-based fluid level',
        'Quick increments (+250ml, +500ml, +750ml, custom logging)',
        'Automatic hydration target scaling based on active workout energy'
      ]
    },
    {
      id: 'recovery',
      name: 'Recovery & Biometrics',
      metric: '88% Optimal Recovery',
      submetric: '7h 45m Sleep · 62 BPM RHR',
      icon: HeartPulse,
      color: '#EF4444',
      badge: 'Deterministic Model',
      desc: 'Unified health engine coupling Apple HealthKit, Android Health Connect, live Bluetooth BLE heart rate telemetry, and sleep duration into a daily vitality score.',
      points: [
        'Deterministic 0-100% recovery score based on sleep deficit & strain',
        'Live Bluetooth BLE heart rate sensor pulse telemetry',
        'Automatic pedometer step counting and 4-ring health widget sync'
      ]
    }
  ];

  const currentPillar = pillars.find(p => p.id === activeTab) || pillars[0];

  return (
    <section id="overview" className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#050507] overflow-hidden border-t border-white/5">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>01 · The Unified Health Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            What exactly is <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              CALYXO?
            </span>
          </h2>

          <p className="text-base sm:text-xl text-gray-300 font-medium leading-relaxed pt-2">
            Most fitness apps track isolated fragments — a meal log in one app, workouts in a second, sleep notes in a third, and a disconnected chatbot in a fourth. 
            <strong className="text-white"> Calyxo is the unified operating system</strong> that connects your daily nutrition, training intensity, hydration, recovery biometrics, and proactive AI coaching into one cohesive live picture.
          </p>
        </div>

        {/* Interactive 4-Pillar Switcher Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Pillar Selector Buttons (Left Column) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {pillars.map((p) => {
              const isSelected = p.id === activeTab;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 group ${
                    isSelected
                      ? 'bg-white/10 border-white/25 shadow-2xl shadow-black'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${p.color}15`,
                        borderColor: `${p.color}35`,
                        color: p.color
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white tracking-wide truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                        {p.metric}
                      </p>
                    </div>
                  </div>

                  <span 
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 hidden sm:inline-block"
                    style={{
                      backgroundColor: `${p.color}10`,
                      borderColor: `${p.color}30`,
                      color: p.color
                    }}
                  >
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Deep-Dive Active Pillar Display Card (Right Column - Double-Bezel) */}
          <div className="lg:col-span-7">
            <div className="p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl">
              <div className="p-6 sm:p-8 rounded-[1.25rem] bg-[#0c0c10] border border-white/5 space-y-6">
                
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
                      style={{
                        backgroundColor: `${currentPillar.color}20`,
                        borderColor: `${currentPillar.color}50`,
                        color: currentPillar.color
                      }}
                    >
                      <currentPillar.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {currentPillar.name}
                      </h3>
                      <p className="text-xs text-emerald-400 font-mono font-bold">
                        {currentPillar.submetric}
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono font-bold text-white">
                      {currentPillar.metric}
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {currentPillar.desc}
                </p>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-widest block">
                    Built-in Capabilities
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentPillar.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-200 font-medium">
                          {pt}
                        </span>
                      </div>
                    ))}
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
