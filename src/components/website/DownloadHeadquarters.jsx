import React from 'react';
import { motion } from 'framer-motion';
import { 
  Apple, Smartphone, Globe, ArrowRight, 
  Sparkles, Shield, CheckCircle2, QrCode, Download 
} from 'lucide-react';
import Logo from '../Logo';

export default function DownloadHeadquarters({ onOpenAuth, onOpenBetaModal, onNavigateDashboard, user }) {
  return (
    <section id="download" className="relative py-28 sm:py-36 px-4 sm:px-6 bg-[#030305] overflow-hidden border-t border-white/5">
      
      {/* Background Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10 text-center">
        
        {/* Brand Icon & Eyebrow */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-black/80 border border-white/15 backdrop-blur-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <Logo className="w-9 h-9 text-[#00F0FF]" glow={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>07 · Digital Headquarters</span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            Take Calyxo <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              With You.
            </span>
          </h2>

          <p className="text-base sm:text-xl text-gray-300 font-medium leading-relaxed max-w-xl mx-auto">
            Your nutrition, workouts, hydration, and recovery biometrics synchronized in one cohesive operating system.
          </p>
        </div>

        {/* Primary Action Hub Cards (Double-Bezel) */}
        <div className="p-2 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl max-w-3xl mx-auto">
          <div className="p-6 sm:p-10 rounded-[1.25rem] bg-[#0a0a0e] border border-white/5 space-y-8">
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {user ? (
                <button
                  onClick={onNavigateDashboard}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/20 active:scale-95 transition-all border-none"
                >
                  <span>Open Your Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/25 active:scale-95 transition-all border-none group"
                  >
                    <span>Launch Web App</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onOpenBetaModal}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download App</span>
                  </button>
                </>
              )}
            </div>

            {/* Platform Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5 text-center text-xs font-mono text-gray-400">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white font-bold block">iOS 16.0+</span>
                <span className="text-[10px]">Live Activities</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white font-bold block">watchOS</span>
                <span className="text-[10px]">Heart Rate Pulse</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white font-bold block">Android 14+</span>
                <span className="text-[10px]">Health Connect</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white font-bold block">Progressive Web</span>
                <span className="text-[10px]">Zero Installation</span>
              </div>
            </div>

          </div>
        </div>

        {/* Security & Privacy Reassurance */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Encrypted local-first storage</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Privacy-first HealthKit integration</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Gemini AI verified models</span>
          </div>
        </div>

      </div>
    </section>
  );
}
