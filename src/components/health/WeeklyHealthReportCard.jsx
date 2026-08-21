import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, Moon, Heart, Flame, Droplets } from 'lucide-react';
import { PersonalHealthReportEngine } from '../../services/health/PersonalHealthReportEngine.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function WeeklyHealthReportCard({
  userProfile = {},
  onOpenUpgradeModal
}) {
  const isPremium = SubscriptionManager.isPremium(userProfile);

  const report = PersonalHealthReportEngine.generateWeeklyReport({
    userProfile,
    weeklyRecoveryScores: [74, 76, 78, 80, 82, 79, 78],
    previousWeekRecoveryAvg: 73.5,
    workoutSessionsCount: 4,
    targetWorkoutSessions: 4,
    avgProteinGrams: 122,
    targetProteinGrams: 135,
    avgHydrationMl: 2250,
    targetHydrationMl: 2700,
    avgSleepHours: 7.3,
    previousWeekSleepHours: 6.6,
    lowProteinDaysCount: 3
  });

  const { weekSummary } = report;

  return (
    <div className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-72 h-36 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> WEEKLY CALYXO REPORT
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal('Weekly Health Reports')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Your Week in Review
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Autonomic recovery velocity, sleep architecture, and nutritional bottlenecks.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300 self-start sm:self-auto">
          Past 7 Days
        </span>
      </div>

      {/* Metric Capsule Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase">Recovery</span>
            <Heart className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            {weekSummary.recovery.display}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase">Training</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            {weekSummary.training.display}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase">Protein</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            {weekSummary.protein.display}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase">Hydration</span>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            {weekSummary.hydration.display}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase">Sleep</span>
            <Moon className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            {weekSummary.sleep.display}
          </div>
        </div>
      </div>

      {/* Editorial Diagnostic Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Biggest Improvement */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Biggest Improvement</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {report.biggestImprovement}
          </p>
        </div>

        {/* Biggest Problem */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Biggest Problem</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {report.biggestProblem}
          </p>
        </div>

        {/* Next Week Priority */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Next Week Priority</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {report.nextWeekPriority}
          </p>
        </div>
      </div>
    </div>
  );
}
