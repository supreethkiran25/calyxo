import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Dumbbell } from 'lucide-react';
import { isSameLocalDate, getTodayDateString } from '../../utils/dateUtils';

export default function WorkoutHeroIntent({
  selectedDate = getTodayDateString(),
  activeRoutineName = "Push Power Split",
  activeMuscleGroups = "Chest · Shoulders · Triceps",
  exerciseCount = 6,
  onStartLiveWorkout = () => {},
  onQuickLogDay = () => {},
  onOpenCustomLog = () => {},
  completedCountToday = 0,
  totalVolumeToday = 0
}) {
  const isToday = isSameLocalDate(selectedDate, getTodayDateString());

  return (
    <div className="relative rounded-3xl bg-surface border border-card-border p-5 sm:p-6 overflow-hidden shadow-card">
      <div className="relative z-10 space-y-4">
        {/* Top Header Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
              {isToday ? "Today's Target Routine" : `Training Plan for ${selectedDate}`}
            </span>
          </div>

          {completedCountToday > 0 && (
            <span className="text-[10px] font-mono font-black text-secondary bg-surface-subtle border border-card-border px-2.5 py-1 rounded-full">
              {completedCountToday} completed ({totalVolumeToday}kg)
            </span>
          )}
        </div>

        {/* Routine Name & Description */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {activeRoutineName}
          </h2>
          <p className="text-xs text-secondary font-medium mt-1">
            {activeMuscleGroups} • <strong className="text-foreground">{exerciseCount} exercises</strong>
          </p>
        </div>

        {/* One primary + one secondary — avoids competing CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onStartLiveWorkout}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-md shadow-accent/20 transition-all cursor-pointer border-none"
          >
            <Zap className="w-4 h-4 fill-current stroke-[2]" />
            <span>Start Live Session</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenCustomLog}
            className="flex-1 sm:flex-none py-3.5 px-4 rounded-2xl bg-surface-subtle hover:bg-surface-interactive text-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-card-border shadow-xs"
          >
            <Dumbbell className="w-4 h-4 text-accent" />
            <span>Log Exercise</span>
          </motion.button>
        </div>

        <button
          type="button"
          onClick={onQuickLogDay}
          className="text-[11px] font-medium text-muted hover:text-accent bg-transparent border-none cursor-pointer flex items-center gap-1.5 pt-1"
          title="Quick-log all exercises for today's split"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Quick-log full split instead</span>
        </button>
      </div>
    </div>
  );
}
