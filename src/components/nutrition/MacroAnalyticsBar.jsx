import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Activity, Check, Filter } from 'lucide-react';

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
      activeBorder: 'border-cyan-400 ring-1 ring-cyan-400',
      calsFraction: Math.round((totalProt * 4 / (totalCals || 1)) * 100)
    },
    {
      id: 'carbs',
      name: 'Net Carbs',
      consumed: Math.round(totalCarbs * 10) / 10,
      target: targetCarbs,
      percent: carbsPercent,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      activeBorder: 'border-amber-400 ring-1 ring-amber-400',
      calsFraction: Math.round((totalCarbs * 4 / (totalCals || 1)) * 100)
    },
    {
      id: 'fat',
      name: 'Total Fats',
      consumed: Math.round(totalFat * 10) / 10,
      target: targetFat,
      percent: fatPercent,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      activeBorder: 'border-rose-400 ring-1 ring-rose-400',
      calsFraction: Math.round((totalFat * 9 / (totalCals || 1)) * 100)
    }
  ];

  return (
    <section className="bg-surface border border-card-border rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
      
      {/* Top Bar: Title & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">Macronutrient Audit</span>
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            Daily Nutrition Summary
          </h2>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-[var(--input)] border border-card-border p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevDate}
            className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-3.5 h-3.5 text-acid-green" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleNextDate}
            className="p-1.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTodayDate}
            className="px-2.5 py-1 bg-acid-green text-accent-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer border-none shadow-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left: Calorie Energy Balance */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-[var(--input)] border border-card-border flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Energy Balance</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
              isSurplus ? 'bg-amber-500/15 text-amber-400' : 'bg-acid-green/15 text-acid-green'
            }`}>
              {isSurplus ? `${Math.abs(remainingCals)} kcal over` : `${remainingCals} kcal left`}
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {totalCals}
              </span>
              <span className="text-xs text-muted font-medium">/ {targetCals} kcal</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden mt-2 border border-card-border/50">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isSurplus ? 'bg-amber-500' : 'bg-acid-green'
                }`}
                style={{ width: `${Math.min(100, calPercent)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted font-medium pt-1 border-t border-card-border/50">
            <span>Target Goal: <strong>{targetCals} kcal</strong></span>
            <span>Completed: <strong>{calPercent}%</strong></span>
          </div>
        </div>

        {/* Right: Three Precision Macro Gauges */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {macroMetrics.map(macro => {
            const isAuditing = activeMacroAudit === macro.id;

            return (
              <div
                key={macro.id}
                onClick={() => setActiveMacroAudit(isAuditing ? null : macro.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isAuditing
                    ? `${macro.activeBorder} bg-surface shadow-md`
                    : 'border-card-border bg-[var(--input)] hover:border-card-border/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${macro.textColor}`}>
                    {macro.name}
                  </span>
                  <span className="text-[9px] font-mono text-muted">
                    {macro.calsFraction}% cals
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-foreground">
                      {macro.consumed}g
                    </span>
                    <span className="text-xs text-muted font-mono">
                      / {macro.target}g
                    </span>
                  </div>

                  {/* Progress gauge */}
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-card-border/40">
                    <div
                      className={`h-full ${macro.color} rounded-full transition-all duration-500`}
                      style={{ width: `${macro.percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted pt-2 mt-2 border-t border-card-border/40">
                  <span>{macro.percent}% of target</span>
                  <span className="font-semibold text-foreground hover:underline">
                    {isAuditing ? 'Auditing' : 'Audit →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Active Audit Helper Banner */}
      {activeMacroAudit && (
        <div className="flex items-center justify-between bg-[var(--input)] border border-card-border px-4 py-2.5 rounded-xl text-xs">
          <span className="font-medium text-muted flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-acid-green" />
            Auditing meals contributing to <strong className="text-foreground uppercase">{activeMacroAudit}</strong>
          </span>
          <button
            type="button"
            onClick={() => setActiveMacroAudit(null)}
            className="text-[10px] font-bold uppercase text-acid-green hover:underline cursor-pointer border-none bg-transparent"
          >
            Clear Audit Filter
          </button>
        </div>
      )}

    </section>
  );
}
