import React, { useState } from 'react';
import { Sparkles, Dumbbell, TrendingUp, ShieldAlert, CheckCircle2, Play, RefreshCw, Lock, ArrowRight } from 'lucide-react';
import { AdaptiveWorkoutCoachEngine } from '../../services/ai/AdaptiveWorkoutCoachEngine.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function AIWorkoutCoachCard({
  userProfile = {},
  historicalWorkoutLogs = [],
  recoveryScore = null,
  onStartSession = () => {},
  onOpenUpgradeModal = () => {}
}) {
  const isPremium = SubscriptionManager.isPremium(userProfile);
  const [selectedSplit, setSelectedSplit] = useState('chest_triceps');
  const [equipment, setEquipment] = useState('gym');
  const [injuryFilter, setInjuryFilter] = useState('');
  const [variationSeed, setVariationSeed] = useState(0);

  const [workout, setWorkout] = useState(() => {
    try {
      return AdaptiveWorkoutCoachEngine.generateAdaptiveWorkout({
        goal: userProfile?.goal || 'hypertrophy',
        muscleGroup: 'chest_triceps',
        equipment: 'gym',
        recoveryScore: recoveryScore || null,
        variationIndex: 0
      });
    } catch (e) {
      return { title: 'Adaptive Daily Routine', recoveryScore: recoveryScore || null, exercises: [] };
    }
  });

  const baselineComparison = React.useMemo(() => {
    try {
      return AdaptiveWorkoutCoachEngine.compute4WeekBaselineComparison({
        currentWorkout: workout || {},
        historicalLogs: historicalWorkoutLogs || []
      });
    } catch (e) {
      return { headline: 'Baseline Tracking Active', fourWeekSummary: 'Tracking 28-day workload volume', currentMaxLiftKg: 80, baselineMaxLiftKg: 75 };
    }
  }, [workout, historicalWorkoutLogs]);

  const handleRegenerate = (split = selectedSplit, eq = equipment, injury = injuryFilter, bumpSeed = true) => {
    try {
      const nextSeed = bumpSeed ? variationSeed + 1 : variationSeed;
      if (bumpSeed) setVariationSeed(nextSeed);
      const w = AdaptiveWorkoutCoachEngine.generateAdaptiveWorkout({
        goal: userProfile?.goal || 'hypertrophy',
        muscleGroup: split,
        equipment: eq,
        injuryRestrictions: injury ? [injury] : [],
        recoveryScore: recoveryScore || null,
        variationIndex: nextSeed
      });
      setWorkout(w);
    } catch (e) {
      console.warn('Workout regeneration error:', e);
    }
  };

  return (
    <div className="w-full bg-surface border border-card-border rounded-3xl p-5 sm:p-7 shadow-card space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-accent uppercase flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-accent" /> AI WORKOUT COACH & PROGRESSION
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal('AI Workout Coach')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
            {workout?.title || "Today's Adaptive Workout"}
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Autoregulated by CNS recovery ({workout?.recoveryScore ? `${workout.recoveryScore}%` : '--'}) with progressive overload targets.
          </p>
        </div>

        {/* Start Workout Button */}
        {isPremium && (
          <button
            onClick={() => {
              if (onStartSession) onStartSession(workout);
            }}
            className="px-5 py-3 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-accent/20 border-none shrink-0 self-start sm:self-auto hover:brightness-110 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch AI Routine</span>
          </button>
        )}
      </div>

      {!isPremium ? (
        <div className="relative rounded-2xl overflow-hidden border border-lime-500/20 bg-gradient-to-b from-[#12121A] to-[#0A0A10] p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center mx-auto text-lime-400">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-base sm:text-lg font-black text-white">Unlock Adaptive AI Workout Coach</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autoregulate your sets and volume dynamically with CNS readiness ({workout?.recoveryScore ? `${workout.recoveryScore}%` : '--'}), 4-week progressive overload curve tracking, and biomechanical injury substitutions.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenUpgradeModal?.('AI Workout Coach')}
              className="px-6 py-3 rounded-2xl bg-[#CCFF00] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#CCFF00]/15 cursor-pointer border-none"
            >
              ✨ Unlock with Calyxo High
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* 4-Week Baseline Progress Banner */}
      <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              {baselineComparison.headline}
            </h4>
            <p className="text-[11px] text-secondary mt-0.5">
              {baselineComparison.fourWeekSummary}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-bold text-foreground">
            Peak: {baselineComparison.currentMaxLiftKg} kg
          </span>
          <p className="text-[10px] text-muted font-mono">4-Wk Base: {baselineComparison.baselineMaxLiftKg} kg</p>
        </div>
      </div>

      {/* Routine Customization Filters */}
      <div className="flex flex-col gap-3.5 p-4 bg-surface-subtle border border-card-border/60 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-secondary font-medium shrink-0">Equipment:</span>
            {['gym', 'dumbbells_only'].map(eq => (
              <button
                key={eq}
                onClick={() => {
                  setEquipment(eq);
                  handleRegenerate(selectedSplit, eq, injuryFilter);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  equipment === eq
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'text-secondary hover:text-foreground bg-surface border border-card-border'
                }`}
              >
                {eq === 'gym' ? 'Full Gym' : 'Dumbbells Only'}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleRegenerate(selectedSplit, equipment, injuryFilter)}
            className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-interactive text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer border border-card-border shadow-xs active:scale-95 shrink-0"
            title="Recalculate set volume and intensity based on recovery"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent" />
            <span>⚡ Re-calc Volume (CNS {workout?.recoveryScore ? `${workout.recoveryScore}%` : '--'})</span>
          </button>
        </div>

        {/* Split selection chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-card-border/40">
          <span className="text-xs text-secondary font-medium shrink-0 mr-1">Split:</span>
          {[
            { id: 'chest_triceps', label: 'Chest + Tri' },
            { id: 'back_biceps', label: 'Back + Bi' },
            { id: 'shoulders_legs', label: 'Shoulder + Leg' },
            { id: 'shoulders_arms', label: 'Shoulders + Arms' },
            { id: 'legs_glutes', label: 'Legs & Glutes' },
            { id: 'push', label: 'Push' },
            { id: 'pull', label: 'Pull' },
            { id: 'full_body', label: 'Full Body' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSplit(s.id);
                handleRegenerate(s.id, equipment, injuryFilter);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSplit === s.id
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-secondary hover:text-foreground bg-surface border border-card-border'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Exercise Flow */}
      <div className="space-y-3">
        {(workout?.exercises || []).map((ex, idx) => (
          <div
            key={ex.id || idx}
            className="p-4 rounded-2xl bg-surface-subtle border border-card-border hover:border-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-accent/15 text-accent font-black text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">{ex.name}</h4>
                <p className="text-[11px] text-secondary mt-0.5">{ex.notes}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted">
                  <span>Tempo: <strong className="text-secondary">{ex.tempo}</strong></span>
                  <span>·</span>
                  <span className="text-accent font-semibold">{ex.rpe}</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-card-border/60 pt-2 sm:pt-0">
              <span className="text-xs font-mono font-bold text-foreground">
                {ex.targetSets} Sets × {ex.targetReps} Reps
              </span>
              <span className="text-[11px] font-mono text-accent font-bold">
                {ex.suggestedWeightKg > 0 ? `${ex.suggestedWeightKg} kg Target` : 'Bodyweight'}
              </span>
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}
