import React, { useState } from 'react';
import { Sparkles, Dumbbell, TrendingUp, ShieldAlert, CheckCircle2, Play, RefreshCw, Lock, ArrowRight } from 'lucide-react';
import { AdaptiveWorkoutCoachEngine } from '../../services/ai/AdaptiveWorkoutCoachEngine.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function AIWorkoutCoachCard({
  userProfile = {},
  historicalWorkoutLogs = [],
  recoveryScore = 82,
  onStartSession,
  onOpenUpgradeModal
}) {
  const isPremium = SubscriptionManager.isPremium(userProfile);
  const [selectedSplit, setSelectedSplit] = useState('chest_triceps');
  const [equipment, setEquipment] = useState('gym');
  const [injuryFilter, setInjuryFilter] = useState('');

  const [workout, setWorkout] = useState(() =>
    AdaptiveWorkoutCoachEngine.generateAdaptiveWorkout({
      goal: 'hypertrophy',
      muscleGroup: 'chest_triceps',
      equipment: 'gym',
      recoveryScore: recoveryScore || 82
    })
  );

  const baselineComparison = AdaptiveWorkoutCoachEngine.compute4WeekBaselineComparison({
    currentWorkout: workout,
    historicalLogs: historicalWorkoutLogs
  });

  const handleRegenerate = (split = selectedSplit, eq = equipment, injury = injuryFilter) => {
    const w = AdaptiveWorkoutCoachEngine.generateAdaptiveWorkout({
      goal: 'hypertrophy',
      muscleGroup: split,
      equipment: eq,
      injuryRestrictions: injury ? [injury] : [],
      recoveryScore: recoveryScore || 82
    });
    setWorkout(w);
  };

  return (
    <div className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 w-80 h-40 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> AI WORKOUT COACH & PROGRESSION
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal('AI Workout Coach')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            {workout.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Autoregulated by CNS recovery ({workout.recoveryScore}%) with progressive overload targets.
          </p>
        </div>

        {/* Start Workout Button */}
        <button
          onClick={() => {
            if (!isPremium) {
              onOpenUpgradeModal('AI Adaptive Workout');
              return;
            }
            if (onStartSession) onStartSession(workout);
          }}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 border-none shrink-0 self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Launch AI Routine</span>
        </button>
      </div>

      {/* 4-Week Baseline Progress Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300">
              {baselineComparison.headline}
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {baselineComparison.fourWeekSummary}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-bold text-white">
            Peak: {baselineComparison.currentMaxLiftKg} kg
          </span>
          <p className="text-[10px] text-gray-500">4-Wk Base: {baselineComparison.baselineMaxLiftKg} kg</p>
        </div>
      </div>

      {/* Routine Customization Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Split:</span>
          {[
            { id: 'chest_triceps', label: 'Chest + Tri' },
            { id: 'back_biceps', label: 'Back + Bi' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSplit(s.id);
                handleRegenerate(s.id, equipment, injuryFilter);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedSplit === s.id
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}

          <span className="text-xs text-gray-400 font-medium ml-2">Equipment:</span>
          {['gym', 'dumbbells_only'].map(eq => (
            <button
              key={eq}
              onClick={() => {
                setEquipment(eq);
                handleRegenerate(selectedSplit, eq, injuryFilter);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                equipment === eq
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {eq.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleRegenerate(selectedSplit, equipment, injuryFilter)}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer border-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Adapt Volume</span>
        </button>
      </div>

      {/* Generated Exercise Flow */}
      <div className="space-y-3">
        {workout.exercises.map((ex, idx) => (
          <div
            key={ex.id || idx}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{ex.notes}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                  <span>Tempo: <strong className="text-gray-300">{ex.tempo}</strong></span>
                  <span>·</span>
                  <span className="text-amber-400/90 font-semibold">{ex.rpe}</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
              <span className="text-xs font-mono font-bold text-white">
                {ex.targetSets} Sets × {ex.targetReps} Reps
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {ex.suggestedWeightKg > 0 ? `${ex.suggestedWeightKg} kg Target` : 'Bodyweight'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
