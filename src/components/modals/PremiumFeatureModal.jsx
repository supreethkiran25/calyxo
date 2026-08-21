import React from 'react';
import { Crown, Sparkles, CheckCircle2, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PREMIUM_HIGHLIGHTS = [
  {
    title: 'AI Nutrition Intelligence',
    desc: 'Automated macro-matched meal planner with auto-compiled grocery lists.'
  },
  {
    title: 'Advanced Food Intelligence',
    desc: 'Calibrated calorie range estimations, meal quality scoring, and micronutrient gap detection.'
  },
  {
    title: 'AI Workout Coach',
    desc: 'Dynamic progressive overload workouts with 4-week baseline lift tracking.'
  },
  {
    title: 'Multi-Device Health Model',
    desc: 'Unified telemetry fusion across Apple Watch, boAt, Polar BLE HR & BP monitors.'
  },
  {
    title: 'Weekly Calyxo Reports',
    desc: 'Comprehensive 7-day reports diagnosing your biggest improvements and primary bottlenecks.'
  },
  {
    title: 'Daily AI Briefing & Unlimited AI',
    desc: 'Personalized morning briefings with recovery readiness and unlimited AI interactions.'
  }
];

export default function PremiumFeatureModal({ 
  isOpen = false, 
  onClose, 
  featureName = 'Premium Feature' 
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer border-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase">
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span>CALYXO PRO & ULTRA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Unlock {featureName}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Take your training and health intelligence to the highest tier with clinical-grade AI and automated health models.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-3 pt-2">
          {PREMIUM_HIGHLIGHTS.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">{item.title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What Stays Free Transparency */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Core tracking (food, workouts, water, weight, steps & rest timers) always remains free.</span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (onClose) onClose();
              navigate('/user/profile');
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 active:scale-[0.98] border-none"
          >
            <span>Upgrade to Calyxo Pro</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
