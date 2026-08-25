import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Database, Sparkles, Zap, Shield, 
  Smartphone, Code, Gauge, CheckCircle2 
} from 'lucide-react';

export default function TechCraftSection() {
  const techPillars = [
    {
      icon: Database,
      color: '#10B981',
      title: 'Local-First Architecture',
      subtitle: 'Zero-Latency Offline Reliability',
      desc: 'All meal logs, workout sets, and health biometrics are saved instantly to local device storage via Zustand and Capacitor Preferences. Background Supabase sync happens seamlessly without blocking the UI.',
      stats: '< 16ms interaction response'
    },
    {
      icon: Cpu,
      color: '#00F0FF',
      title: 'WebGL & 3D Spatial Graphics',
      subtitle: 'GPU-Accelerated Visual Physics',
      desc: 'Interactive 3D biometric models and fluid vessels rendered using Three.js and React Three Fiber. Smooth 60fps animations with automated frame budgeting and fallback for low-power mobile devices.',
      stats: 'Hardware-accelerated 60fps'
    },
    {
      icon: Smartphone,
      color: '#F59E0B',
      title: 'Native iOS & Android Bridge',
      subtitle: 'Capacitor 8 + Swift ActivityKit',
      desc: 'Native iOS 16.0+ Live Activities, Dynamic Island rest timers, watchOS companion communication, and Android Health Connect permissions connected directly to web technologies.',
      stats: 'Native OS integration'
    },
    {
      icon: Sparkles,
      color: '#8B5CF6',
      title: 'Proactive Multimodal AI',
      subtitle: 'Gemini Engine & Deterministic Models',
      desc: 'Combines Gemini AI with deterministic metabolic formulas for TDEE, macro distribution, and CNS fatigue load calculation. Delivers personalized guidance while keeping health data secure.',
      stats: 'Coupled deterministic AI'
    }
  ];

  return (
    <section id="architecture" className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#030305] overflow-hidden border-t border-white/5">
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-[10px] font-mono uppercase tracking-widest">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>06 · Engineering Craft</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            Built for <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Uncompromising Speed.
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Calyxo is engineered with a modern local-first foundation, low-latency native bridges, and spatial WebGL graphics.
          </p>
        </div>

        {/* 4-Card Technology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {techPillars.map((tp, idx) => {
            const Icon = tp.icon;
            return (
              <div
                key={idx}
                className="p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300"
              >
                <div className="p-6 sm:p-8 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 flex-1 flex flex-col justify-between space-y-6">
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg group-hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${tp.color}15`,
                          borderColor: `${tp.color}35`,
                          color: tp.color
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider block">
                          {tp.subtitle}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white">
                          {tp.title}
                        </h3>
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 hidden sm:inline-block"
                      style={{
                        backgroundColor: `${tp.color}10`,
                        borderColor: `${tp.color}30`,
                        color: tp.color
                      }}
                    >
                      {tp.stats}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 leading-relaxed">
                    {tp.desc}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Production verified in Calyxo v1.0.0</span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
