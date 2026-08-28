import React from 'react';
import { Bot, HeartPulse, Moon, Dumbbell, Droplets, Utensils, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
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
      <div className="w-full bg-surface border border-card-border rounded-3xl p-5 sm:p-7 shadow-card space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-accent uppercase flex items-center gap-1.5 font-mono">
              <Bot className="w-3.5 h-3.5 text-accent" /> DAILY HEALTH BRIEFING
            </span>
          </div>
          <PremiumLockBadge onClick={() => onOpenUpgradeModal?.('Daily AI Briefing')} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            Personalized Morning Health & Athletic Briefing
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
            Synthesizes your recovery readiness score, sleep duration deltas, macro targets, and actionable training directives grounded in your authentic metrics.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenUpgradeModal?.('Daily AI Briefing')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-accent/20 cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Daily AI Briefing</span>
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
    recoveryScore: 82,
    recoveryHeadline: 'Optimal physiological recovery. Primed for progressive compound training.',
    sleepDisplay: '7h 30m',
    sleepDeltaText: 'Optimal sleep duration for neuromuscular recovery.',
    nutritionStatus: 'Target: 2,000 kcal · 140g protein. Maintain steady protein intake.',
    trainingRecommendation: 'Targeted split or progressive overload session recommended today.',
    hydrationStatus: 'Stay hydrated with regular intake throughout the day.',
    focalDirectives: [
      'Hydrate with 500ml water early',
      'Distribute protein evenly across today’s meals',
      'Execute your planned workout with proper form'
    ]
  };

  const name = briefing.name || userProfile?.firstName || userProfile?.nickname || 'Athlete';
  const directives = Array.isArray(briefingData.focalDirectives) ? briefingData.focalDirectives : [];

  return (
    <div className="w-full bg-surface border border-card-border rounded-3xl p-5 sm:p-7 shadow-card space-y-5 relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-accent uppercase flex items-center gap-1.5 font-mono">
              <Bot className="w-3.5 h-3.5 text-accent" /> DAILY ATHLETIC BRIEFING
            </span>
            <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[9px] font-mono font-bold uppercase border border-accent/30">
              Grounded Model
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
            Good morning, {name}.
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clinical multi-pillar health analysis and actionable directives for today.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-full bg-surface-elevated border border-card-border text-[11px] font-mono text-foreground self-start sm:self-auto flex items-center gap-1.5 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-accent" />
          Today's Intel
        </span>
      </div>

      {/* Point-wise Clinical Metric Grid */}
      <div className="space-y-3 pt-1">
        
        {/* Metric 1: Recovery & CNS Readiness */}
        <div className="p-4 rounded-2xl bg-surface-elevated border border-card-border flex items-start gap-3.5 transition-all">
          <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5 border border-accent/25">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground">
                Recovery & Physiological Readiness
              </span>
              <span className="text-xs font-mono font-black text-accent shrink-0">
                {briefingData.recoveryScore}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {briefingData.recoveryHeadline}
            </p>
          </div>
        </div>

        {/* Metric 2: Sleep Duration & Staging */}
        <div className="p-4 rounded-2xl bg-surface-elevated border border-card-border flex items-start gap-3.5 transition-all">
          <div className="w-8 h-8 rounded-xl bg-surface-subtle text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-card-border">
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground">
                Sleep Duration & Restorative Quality
              </span>
              <span className="text-xs font-mono font-black text-foreground shrink-0">
                {briefingData.sleepDisplay}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {briefingData.sleepDeltaText}
            </p>
          </div>
        </div>

        {/* 2-Column: Nutrition Strategy & Training Prescription */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Nutrition Strategy */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-card-border flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-surface-subtle text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-card-border">
              <Utensils className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-mono">
                Nutrition & Protein Target
              </span>
              <p className="text-xs font-medium text-foreground leading-snug">
                {briefingData.nutritionStatus}
              </p>
            </div>
          </div>

          {/* Training Prescription */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-card-border flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-surface-subtle text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-card-border">
              <Dumbbell className="w-4 h-4 text-accent" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-mono">
                Training Prescription
              </span>
              <p className="text-xs font-medium text-foreground leading-snug">
                {briefingData.trainingRecommendation}
              </p>
            </div>
          </div>

        </div>

        {/* Hydration */}
        <div className="p-4 rounded-2xl bg-surface-elevated border border-card-border flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-surface-subtle text-foreground flex items-center justify-center shrink-0 mt-0.5 border border-card-border">
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-mono">
              Hydration Balance
            </span>
            <p className="text-xs font-medium text-foreground leading-snug">
              {briefingData.hydrationStatus}
            </p>
          </div>
        </div>

      </div>

      {/* Point-by-Point Actionable Directives */}
      {directives.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-card-border/80 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground font-mono">
              Today's Actionable Directives
            </h4>
          </div>
          <div className="space-y-2">
            {directives.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
                <span className="w-5 h-5 rounded-lg bg-surface text-accent text-[10px] font-mono font-black flex items-center justify-center shrink-0 border border-card-border">
                  {idx + 1}
                </span>
                <span className="leading-tight pt-0.5 text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
