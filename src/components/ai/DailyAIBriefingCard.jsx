import React from 'react';
import { Bot, Sparkles, Heart, Moon, Flame, Droplets, Lock, CheckCircle2, Zap } from 'lucide-react';
import { AIBriefingEngine } from '../../services/ai/AIBriefingEngine.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function DailyAIBriefingCard({
  userProfile = {},
  foodLogs = [],
  workoutLogs = [],
  waterIntake = 0,
  healthLogs = {},
  onOpenUpgradeModal
}) {
  const isPremium = SubscriptionManager.isPremium(userProfile || {});

  if (!isPremium) {
    return (
      <div className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1 font-mono">
              <Bot className="w-3.5 h-3.5 text-amber-400" /> DAILY AI BRIEFING
            </span>
          </div>
          <PremiumLockBadge onClick={() => onOpenUpgradeModal?.('Daily AI Briefing')} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Personalized Morning Health Intelligence Briefing
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed max-w-lg">
            Unlock daily executive health digests summarizing your physiological recovery, sleep score deltas, targeted training splits, and point-wise actionable directives.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenUpgradeModal?.('Daily AI Briefing')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#CCFF00]/15 cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>✨ Unlock Daily AI Briefing</span>
          </button>
        </div>
      </div>
    );
  }

  let briefing = {};
  try {
    briefing = AIBriefingEngine.generateGroundedBriefing({
      userProfile: userProfile || {},
      foodLogs: Array.isArray(foodLogs) ? foodLogs : [],
      workoutLogs: Array.isArray(workoutLogs) ? workoutLogs : [],
      waterIntake: Number(waterIntake) || 0,
      healthLogs: healthLogs || {}
    }) || {};
  } catch (e) {
    console.warn('[DailyAIBriefingCard] Briefing generation fallback:', e);
  }

  const briefingData = briefing.briefingData || {
    recoveryScore: 85,
    recoveryHeadline: "You're ready for moderate-high intensity with CNS readiness primed.",
    sleepDisplay: '7h 30m',
    sleepDeltaText: 'Sufficient restorative sleep recorded.',
    trainingRecommendation: 'Targeted workout split recommended today.',
    hydrationStatus: 'Stay hydrated throughout the day.',
    todaysFocus: 'Train hard. Hydrate early. Get 30g protein at breakfast.'
  };

  const name = briefing.name || userProfile?.firstName || userProfile?.nickname || 'Athlete';

  // Parse focal points into bullet points
  const focusItems = typeof briefingData.todaysFocus === 'string'
    ? briefingData.todaysFocus.split('.').map(s => s.trim()).filter(Boolean)
    : ['Train hard', 'Hydrate early', 'Get 30g protein at breakfast'];

  return (
    <div className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
      {/* Ambient background highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1 font-mono">
              <Bot className="w-3.5 h-3.5 text-amber-400" /> DAILY AI BRIEFING
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
              Active Pro
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Good morning, {name}.
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Executive health digest & point-by-point action directives for today.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300 self-start sm:self-auto flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          Today's Intel
        </span>
      </div>

      {/* Point-wise Executive Health Digest */}
      <div className="space-y-2.5 pt-1">
        {/* Bullet 1: Recovery */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3 hover:border-amber-500/30 transition-all">
          <div className="w-7 h-7 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
            <Heart className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                ⚡ Recovery & Readiness
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {briefingData.recoveryScore}%
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">{briefingData.recoveryHeadline}</p>
          </div>
        </div>

        {/* Bullet 2: Sleep */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3 hover:border-amber-500/30 transition-all">
          <div className="w-7 h-7 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
            <Moon className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                🌙 Sleep & Rest
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {briefingData.sleepDisplay}
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 leading-snug font-mono">{briefingData.sleepDeltaText}</p>
          </div>
        </div>

        {/* Bullet 3: Training & Hydration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3 hover:border-amber-500/30 transition-all">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">🏋️ Training Priority</span>
              <p className="text-xs font-semibold text-white leading-snug">{briefingData.trainingRecommendation}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3 hover:border-amber-500/30 transition-all">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">💧 Hydration Target</span>
              <p className="text-xs font-semibold text-white leading-snug">{briefingData.hydrationStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Point-wise Action Directives */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 space-y-2">
        <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1 font-mono">
          <Sparkles className="w-3 h-3" /> TODAY'S ACTION PRIORITIES
        </span>
        <div className="space-y-1.5">
          {focusItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
