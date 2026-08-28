import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Dumbbell, Flame, Activity,
  PieChart, Sparkles, AlertCircle, Info, ShieldCheck, BarChart3, Clock
} from 'lucide-react';
import MuscleMapVisualizer from './MuscleMapVisualizer';
import MuscleDetailModal from './MuscleDetailModal';
import {
  calculateDailyMuscleStimulus,
  calculateWeeklyMuscleAnalytics,
  STIMULUS_LEVELS
} from '../../services/analytics/MuscleStimulusEngine';

export default function WorkoutMuscleAnalyticsView({
  workoutLogs = [],
  userProfile = {},
  onLogWorkoutClick = () => {}
}) {
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeframeTab, setTimeframeTab] = useState('daily'); // 'daily' | 'weekly'

  const userGender = useMemo(() => {
    const raw = String(userProfile?.gender || userProfile?.sex || '').toLowerCase().trim();
    if (raw === 'female' || raw === 'f' || raw.includes('fem') || raw.includes('woman')) {
      return 'female';
    }
    return 'male';
  }, [userProfile]);

  // Daily Stimulus Calculation
  const dailyAnalytics = useMemo(() => {
    return calculateDailyMuscleStimulus(workoutLogs, selectedDateStr);
  }, [workoutLogs, selectedDateStr]);

  // Weekly Stimulus Calculation
  const weeklyAnalytics = useMemo(() => {
    return calculateWeeklyMuscleAnalytics(workoutLogs, selectedDateStr);
  }, [workoutLogs, selectedDateStr]);

  // Date Navigation Handlers
  const handleShiftDate = (days) => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + days);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  const isToday = useMemo(() => {
    return selectedDateStr === new Date().toISOString().split('T')[0];
  }, [selectedDateStr]);

  const handleSelectMuscle = (slug, detail) => {
    setSelectedMuscle(detail);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* ── Top Header & Date Navigation ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wide">
              Anatomical Muscle Analytics
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[9px] font-black uppercase tracking-wider border border-accent/30 font-mono">
              Real-Data V1
            </span>
          </div>
          <p className="text-xs text-muted font-medium mt-0.5">
            Deterministic stimulus representation from your verified training logs
          </p>
        </div>

        {/* Date Navigator & Timeframe Toggle */}
        <div className="flex items-center gap-2">
          {/* Daily / 7-Day Switch */}
          <div className="flex items-center bg-surface p-1 rounded-2xl border border-card-border">
            <button
              type="button"
              onClick={() => setTimeframeTab('daily')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border-none ${
                timeframeTab === 'daily'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setTimeframeTab('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border-none ${
                timeframeTab === 'weekly'
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              7-Day Balance
            </button>
          </div>

          {/* Date Selector Pill */}
          <div className="flex items-center bg-surface p-1 rounded-2xl border border-card-border">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="p-1.5 text-muted hover:text-foreground cursor-pointer border-none transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2.5 text-xs font-mono font-bold text-foreground min-w-[90px] text-center">
              {isToday ? 'Today' : selectedDateStr}
            </span>

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              disabled={isToday}
              className={`p-1.5 cursor-pointer border-none transition-colors ${
                isToday ? 'text-muted/30 cursor-not-allowed' : 'text-muted hover:text-foreground'
              }`}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Analytics Body ───────────────────────────────────────────── */}
      {timeframeTab === 'daily' ? (
        <div className="space-y-6">
          
          {/* Hero Visualizer & Summary Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left/Main Column: Flagship Interactive Anatomical Map */}
            <div className="lg:col-span-7 space-y-4">
              <MuscleMapVisualizer
                gender={userGender}
                slugColorMap={dailyAnalytics.slugColorMap}
                muscleDetails={dailyAnalytics.muscleDetails}
                onSelectMuscle={handleSelectMuscle}
                selectedSlug={selectedMuscle?.muscleKey}
              />
            </div>

            {/* Right Column: Training Stimulus Metrics & Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* 4 Quick Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-surface border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold">Stimulated</span>
                    <Activity className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {dailyAnalytics.activeMuscles.length}
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">Muscles trained</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold">Volume</span>
                    <Dumbbell className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {dailyAnalytics.totalVolumeKg.toLocaleString()} <span className="text-xs text-accent">kg</span>
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">Weight moved</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold">Exercises</span>
                    <BarChart3 className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {dailyAnalytics.totalExercises}
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">Contributing movements</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-muted mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold">Workout Energy</span>
                    <Flame className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {dailyAnalytics.totalCaloriesKcal > 0 ? dailyAnalytics.totalCaloriesKcal : '--'} <span className="text-xs text-orange-400">kcal</span>
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">Active metabolic burn</p>
                </div>
              </div>

              {/* Most Stimulated Muscle Ranking */}
              <div className="p-5 rounded-3xl bg-surface border border-card-border shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-card-border pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-mono">
                    Most Stimulated Muscles
                  </h3>
                  <span className="text-[10px] text-muted font-mono font-bold">
                    {dailyAnalytics.activeMuscles.length} active
                  </span>
                </div>

                {dailyAnalytics.topStimulated.length > 0 ? (
                  <div className="space-y-2">
                    {dailyAnalytics.topStimulated.map((m, idx) => {
                      const level = m.stimulusLevel || STIMULUS_LEVELS.NONE;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectMuscle(m.muscleKey, m)}
                          className="p-3 rounded-2xl bg-surface-elevated hover:bg-surface-interactive border border-card-border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: level.color }}
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate">
                                {m.name}
                              </span>
                              <span className="text-[10px] text-muted font-mono block">
                                {m.contributingExercises.length} exercise(s) · {m.totalVolumeKg} kg
                              </span>
                            </div>
                          </div>

                          <span
                            className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase font-mono tracking-wider shrink-0"
                            style={{
                              backgroundColor: `${level.color}20`,
                              color: level.color,
                              border: `1px solid ${level.color}40`
                            }}
                          >
                            {level.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 px-4 rounded-2xl bg-surface-subtle border border-card-border text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-muted mx-auto" />
                    <p className="text-xs text-muted font-medium">
                      No training stimulus logged for this date.
                    </p>
                    <button
                      type="button"
                      onClick={onLogWorkoutClick}
                      className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-black uppercase font-mono tracking-wider cursor-pointer border-none shadow-xs hover:brightness-110"
                    >
                      Log Workout
                    </button>
                  </div>
                )}
              </div>

              {/* Verified Grounded AI Insight Card */}
              {dailyAnalytics.hasWorkouts && (
                <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase font-mono tracking-wider text-accent block">
                      Grounded AI Training Briefing
                    </span>
                    <p className="text-xs text-muted leading-relaxed">
                      You logged <span className="text-foreground font-bold">{dailyAnalytics.totalExercises} movements</span> targeting{' '}
                      <span className="text-foreground font-bold">{dailyAnalytics.activeMuscles.map(m => m.name.split(' ')[0]).slice(0, 3).join(', ')}</span>.
                      Training volume reached <span className="text-accent font-bold font-mono">{dailyAnalytics.totalVolumeKg} kg</span>.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        /* ── 7-Day Training Exposure & Discipline Balance View ────────────── */
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-surface border border-card-border space-y-2">
              <span className="text-xs font-mono font-bold text-muted uppercase block">Weekly Workouts</span>
              <span className="text-3xl font-black text-foreground font-mono">{weeklyAnalytics.totalWorkouts}</span>
              <p className="text-[11px] text-muted">Completed in past 7 days</p>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-card-border space-y-2">
              <span className="text-xs font-mono font-bold text-muted uppercase block">Weekly Volume</span>
              <span className="text-3xl font-black text-accent font-mono">
                {weeklyAnalytics.totalWeeklyVolumeKg.toLocaleString()} <span className="text-xs">kg</span>
              </span>
              <p className="text-[11px] text-muted">Cumulative tonnage moved</p>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-card-border space-y-2">
              <span className="text-xs font-mono font-bold text-muted uppercase block">Dominant Focus</span>
              <span className="text-2xl font-black text-foreground font-mono capitalize">
                {Object.entries(weeklyAnalytics.balancePercentages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Balanced'}
              </span>
              <p className="text-[11px] text-muted">Highest relative stimulus</p>
            </div>

            <div className="p-5 rounded-3xl bg-surface border border-card-border space-y-2">
              <span className="text-xs font-mono font-bold text-muted uppercase block">Understimulated</span>
              <span className="text-2xl font-black text-amber-400 font-mono capitalize">
                {Object.entries(weeklyAnalytics.balancePercentages).sort((a, b) => a[1] - b[1])[0]?.[0] || 'None'}
              </span>
              <p className="text-[11px] text-muted">Lowest relative exposure</p>
            </div>
          </div>

          {/* Discipline Balance Breakdown */}
          <div className="p-6 rounded-3xl bg-surface border border-card-border space-y-5">
            <div className="flex items-center justify-between border-b border-card-border pb-3">
              <div>
                <h3 className="text-sm font-black uppercase font-mono tracking-wider text-foreground">
                  7-Day Training Discipline Balance
                </h3>
                <p className="text-xs text-muted font-medium mt-0.5">
                  Calculated from actual logged exercise taxonomy
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(weeklyAnalytics.balancePercentages).map(([cat, pct]) => (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold font-mono">
                    <span className="capitalize text-foreground">{cat} Movement</span>
                    <span className="text-accent">{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-subtle overflow-hidden border border-card-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Muscle Detail Bottom Sheet Modal */}
      <MuscleDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        muscle={selectedMuscle}
        date={selectedDateStr}
      />
    </div>
  );
}
