import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Flame, Sparkles, Filter, X } from 'lucide-react';
import CalendarDatePicker from '../common/CalendarDatePicker.jsx';

export default function MacroAnalyticsBar({
  selectedDate,
  setSelectedDate,
  formatDisplayDate,
  handlePrevDate,
  handleNextDate,
  handleTodayDate,
  totalCals,
  targetCals,
  totalProt,
  targetProt,
  totalCarbs,
  targetCarbs,
  totalFat,
  targetFat,
  activeMacroAudit,
  setActiveMacroAudit
}) {
  const remainingCals = targetCals - totalCals;
  const isSurplus = remainingCals < 0;
  const calPercent = Math.min(100, Math.round((totalCals / (targetCals || 1)) * 100));

  const protPercent = Math.min(100, Math.round((totalProt / (targetProt || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / (targetCarbs || 1)) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / (targetFat || 1)) * 100));

  const macroMetrics = [
    {
      id: 'protein',
      name: 'Protein',
      consumed: Math.round(totalProt * 10) / 10,
      target: targetProt,
      percent: protPercent,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      activeRing: 'ring-2 ring-cyan-400/80 bg-cyan-500/10',
      unit: 'g'
    },
    {
      id: 'carbs',
      name: 'Carbs',
      consumed: Math.round(totalCarbs * 10) / 10,
      target: targetCarbs,
      percent: carbsPercent,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      activeRing: 'ring-2 ring-amber-400/80 bg-amber-500/10',
      unit: 'g'
    },
    {
      id: 'fat',
      name: 'Fats',
      consumed: Math.round(totalFat * 10) / 10,
      target: targetFat,
      percent: fatPercent,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      activeRing: 'ring-2 ring-rose-400/80 bg-rose-500/10',
      unit: 'g'
    }
  ];

  return (
    <div className="glass border border-card-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6 relative overflow-hidden">
      {/* Top Header Row with Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-card-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-acid-green/15 border border-acid-green/30 flex items-center justify-center text-acid-green shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <span>Macro Intelligence OS</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-muted">
                Daily Log
              </span>
            </h2>
            <p className="text-[11px] font-mono text-muted">
              {formatDisplayDate(selectedDate)}
            </p>
          </div>
        </div>

        {/* Date Selector Segment */}
        <CalendarDatePicker
          selectedDate={selectedDate}
          onSelectDate={(newDate) => setSelectedDate(newDate)}
        />
      </div>

      {/* Main Calories & Macro Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Calorie Progress Card */}
        <div className="md:col-span-5 p-4 rounded-xl sm:rounded-2xl bg-[var(--input)] border border-card-border flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Energy Balance</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isSurplus ? 'bg-amber-500/15 text-amber-400' : 'bg-acid-green/15 text-acid-green'
              }`}
            >
              {isSurplus ? `${Math.abs(remainingCals)} kcal over` : `${remainingCals} kcal left`}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {totalCals.toLocaleString()}
              </span>
              <span className="text-xs text-muted font-medium">/ {targetCals.toLocaleString()} kcal</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden mt-2.5 border border-card-border/40">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isSurplus ? 'bg-amber-500' : 'bg-acid-green'
                }`}
                style={{ width: `${Math.min(100, calPercent)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted font-medium pt-1 border-t border-card-border/40">
            <span>Goal: <strong className="text-foreground">{targetCals} kcal</strong></span>
            <span className="font-bold text-foreground">{calPercent}%</span>
          </div>
        </div>

        {/* 3 Macro Cards (Protein, Carbs, Fat) */}
        <div className="md:col-span-7 grid grid-cols-3 gap-2 sm:gap-3">
          {macroMetrics.map((macro) => {
            const isAuditing = activeMacroAudit === macro.id;

            return (
              <button
                key={macro.id}
                type="button"
                onClick={() => setActiveMacroAudit(isAuditing ? null : macro.id)}
                className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isAuditing
                    ? `${macro.activeRing} border-transparent shadow-sm`
                    : 'border-card-border bg-[var(--input)] hover:border-card-border/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 w-full">
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${macro.textColor}`}>
                    {macro.name}
                  </span>
                  <span className="text-[9px] font-mono text-muted">{macro.percent}%</span>
                </div>

                <div className="space-y-1.5 my-1 w-full">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {macro.consumed}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      /{macro.target}{macro.unit}
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-card-border/30">
                    <div
                      className={`h-full ${macro.color} rounded-full transition-all duration-500`}
                      style={{ width: `${macro.percent}%` }}
                    />
                  </div>
                </div>

                <div className="text-[9px] text-muted font-medium pt-1 border-t border-card-border/30 w-full flex items-center justify-between">
                  <span>{isAuditing ? 'Active' : 'Filter'}</span>
                  {isAuditing && <span className="w-1.5 h-1.5 rounded-full bg-acid-green animate-pulse" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Macro Filter Banner */}
      {activeMacroAudit && (
        <div className="flex items-center justify-between bg-acid-green/10 border border-acid-green/20 px-3.5 py-2 rounded-xl text-xs">
          <span className="font-medium text-foreground flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-acid-green" />
            Showing foods high in <strong className="uppercase text-acid-green">{activeMacroAudit}</strong>
          </span>
          <button
            type="button"
            onClick={() => setActiveMacroAudit(null)}
            className="text-[11px] font-bold uppercase text-acid-green hover:underline cursor-pointer border-none bg-transparent flex items-center gap-1"
          >
            Clear <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
