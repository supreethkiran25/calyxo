import React from 'react';
import { Bot, Sparkles, Heart, Moon, Flame, Droplets, ArrowRight, ShieldAlert } from 'lucide-react';
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
  const isPremium = SubscriptionManager.isPremium(userProfile);

  const briefing = AIBriefingEngine.generateGroundedBriefing({
    userProfile,
    foodLogs,
    workoutLogs,
    waterIntake,
    healthLogs
  });

  const { briefingData, name } = briefing;

  return (
    <div className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
      {/* Ambient background highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-amber-400" /> DAILY AI BRIEFING
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal('Daily AI Briefing')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Good morning, {name}.
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Your personalized morning briefing with recovery, sleep delta, and today's focus.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300 self-start sm:self-auto">
          Today's Intel
        </span>
      </div>

      {/* Briefing Key Value Stack */}
      <div className="space-y-3 pt-1">
        {/* Recovery */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
          <Heart className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">
              Recovery — <span className="text-amber-400 font-mono">{briefingData.recoveryScore}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">{briefingData.recoveryHeadline}</p>
          </div>
        </div>

        {/* Sleep */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
          <Moon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">
              Sleep — <span className="text-white font-mono">{briefingData.sleepDisplay}</span>
            </div>
            <p className="text-[11px] text-emerald-400 leading-snug font-mono">{briefingData.sleepDeltaText}</p>
          </div>
        </div>

        {/* Training & Nutrition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Training</span>
              <p className="text-xs font-semibold text-white leading-snug">{briefingData.trainingRecommendation}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Hydration</span>
              <p className="text-xs font-semibold text-white leading-snug">{briefingData.hydrationStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Focus Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 space-y-1">
        <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> TODAY'S FOCUS
        </span>
        <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
          {briefingData.todaysFocus}
        </p>
      </div>
    </div>
  );
}
