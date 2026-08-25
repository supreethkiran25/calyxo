import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, X, Sparkles, Layers, ShieldCheck, 
  HelpCircle, ArrowRight, Zap 
} from 'lucide-react';

export default function WhyCalyxoComparison({ onOpenAuth }) {
  const [selectedPillars, setSelectedPillars] = useState(['nutrition', 'workout', 'recovery', 'ai', 'hydration']);

  const pillarOptions = [
    { id: 'nutrition', label: 'Nutrition & Macro OS', replaces: 'MyFitnessPal ($20/mo)' },
    { id: 'workout', label: 'Workout & Rest Timers', replaces: 'Strong / Hevy ($10/mo)' },
    { id: 'hydration', label: '3D Hydration OS', replaces: 'WaterMinder ($5/mo)' },
    { id: 'recovery', label: 'Recovery & Vitality Score', replaces: 'Whoop / Oura ($30/mo)' },
    { id: 'ai', label: 'Proactive AI Coach', replaces: 'ChatGPT Plus ($20/mo)' }
  ];

  const comparisonRows = [
    {
      feature: 'Unified Cross-Pillar Intelligence',
      calyxo: 'Connected (Workouts & Sleep directly adjust nutrition & recovery)',
      others: 'Fragmented (Each app lives in a silo with zero data sharing)',
      status: true
    },
    {
      feature: '8,000+ Regional & Indian Food Database',
      calyxo: 'Verified Indian regional recipes + ₹ market budget optimization',
      others: 'Generic Western databases with inaccurate crowd-sourced entries',
      status: true
    },
    {
      feature: 'Live Dynamic Island & Apple Watch Rest Timers',
      calyxo: 'Real-time background timers & exercise names on lock screen',
      others: 'Manual app switching or unsupported on lock screen',
      status: true
    },
    {
      feature: '3D Fluid Dynamics Hydration Vessel',
      calyxo: 'Real-time 3D physics vessel with activity-aware pacing',
      others: 'Basic 2D counter with static reminders',
      status: true
    },
    {
      feature: 'Deterministic 0–100% Recovery Model',
      calyxo: 'Couples sleep duration, active energy, and workout volume strain',
      others: 'Requires expensive proprietary hardware ($300+)',
      status: true
    },
    {
      feature: 'Proactive Morning AI Briefing',
      calyxo: 'Synthesizes yesterday’s metrics into a morning gameplan',
      others: 'Passive chatbot waiting for manual user prompts',
      status: true
    },
    {
      feature: 'Total Monthly App Burden',
      calyxo: 'One Unified OS (Zero tool switching)',
      others: '$55 – $85 / month across 5 separate subscriptions',
      status: true
    }
  ];

  const togglePillar = (id) => {
    if (selectedPillars.includes(id)) {
      if (selectedPillars.length > 1) {
        setSelectedPillars(selectedPillars.filter(p => p !== id));
      }
    } else {
      setSelectedPillars([...selectedPillars, id]);
    }
  };

  return (
    <section id="compare" className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#050507] overflow-hidden border-t border-white/5">
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>05 · The Connected Advantage</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
            CALYXO vs <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Fragmented Apps.
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Traditional health tracking forces you to switch between 5 different single-purpose apps. Calyxo brings everything together in one unified operating system.
          </p>
        </div>

        {/* Interactive App Consolidator Calculator */}
        <div className="p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl">
          <div className="p-6 sm:p-10 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 space-y-8">
            
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-3">
                Select the tools you currently use:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {pillarOptions.map((opt) => {
                  const isSelected = selectedPillars.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => togglePillar(opt.id)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected ? 'bg-emerald-400 text-black' : 'border border-gray-500'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{opt.label}</span>
                      <span className="text-[10px] text-gray-500 hidden sm:inline">({opt.replaces})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Consolidation Result Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-black/60 border border-white/5 font-mono text-center sm:text-left">
              <div>
                <span className="text-[9px] text-gray-400 uppercase block">Traditional Setup</span>
                <span className="text-lg font-black text-red-400">{selectedPillars.length} Fragmented Apps</span>
                <span className="text-[10px] text-gray-500 block">Requires constant manual cross-checking</span>
              </div>

              <div>
                <span className="text-[9px] text-gray-400 uppercase block">Estimated Industry Cost</span>
                <span className="text-lg font-black text-amber-400">~${selectedPillars.length * 15}/month</span>
                <span className="text-[10px] text-gray-500 block">Subscription fatigue across multiple stores</span>
              </div>

              <div className="sm:text-right">
                <span className="text-[9px] text-emerald-400 uppercase block font-bold">Calyxo Solution</span>
                <span className="text-lg font-black text-emerald-400">1 Unified Health OS</span>
                <span className="text-[10px] text-emerald-300/80 block">All biometrics in sync 24/7</span>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Comparison Matrix Table */}
        <div className="p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl overflow-hidden">
          <div className="rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-gray-400 bg-white/[0.02]">
                  <th className="p-4 sm:p-5 w-1/3">Capability</th>
                  <th className="p-4 sm:p-5 w-1/3 text-emerald-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-current" /> CALYXO HEALTH OS
                    </div>
                  </th>
                  <th className="p-4 sm:p-5 w-1/3 text-gray-400">Fragmented Alternatives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white">
                      {row.feature}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-200 font-medium">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.calyxo}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-400">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-400/80 shrink-0 mt-0.5" />
                        <span>{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
