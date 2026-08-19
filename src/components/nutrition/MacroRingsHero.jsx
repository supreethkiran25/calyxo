import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Activity, Zap, ChevronLeft, ChevronRight, Calendar, Plus, Sparkles } from 'lucide-react';
import { formatNutritionValue } from '../../utils/macroCalculator';

export default function MacroRingsHero({
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
  activeMacroFilter,
  setActiveMacroFilter,
  onOpenQuickLog
}) {
  const remainingCals = Math.max(0, targetCals - totalCals);
  const calPercent = Math.min(100, Math.round((totalCals / (targetCals || 1)) * 100));
  const protPercent = Math.min(100, Math.round((totalProt / (targetProt || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / (targetCarbs || 1)) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / (targetFat || 1)) * 100));

  // Circular ring geometry parameters
  const centerSize = 140;
  const strokeWidth = 10;
  const radius = (centerSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const calOffset = circumference - (calPercent / 100) * circumference;

  const macroRings = [
    {
      id: 'protein',
      label: 'Protein',
      consumed: totalProt,
      target: targetProt,
      percent: protPercent,
      color: '#38bdf8', // cyan-400
      glowColor: 'rgba(56, 189, 248, 0.4)',
      bgColor: 'rgba(56, 189, 248, 0.12)',
      unit: 'g'
    },
    {
      id: 'carbs',
      label: 'Carbs',
      consumed: totalCarbs,
      target: targetCarbs,
      percent: carbsPercent,
      color: '#fbbf24', // amber-400
      glowColor: 'rgba(251, 191, 36, 0.4)',
      bgColor: 'rgba(251, 191, 36, 0.12)',
      unit: 'g'
    },
    {
      id: 'fat',
      label: 'Fat',
      consumed: totalFat,
      target: targetFat,
      percent: fatPercent,
      color: '#f43f5e', // rose-500
      glowColor: 'rgba(244, 63, 94, 0.4)',
      bgColor: 'rgba(244, 63, 94, 0.12)',
      unit: 'g'
    }
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface/80 border border-card-border/80 backdrop-blur-xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-acid-green/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header & Date Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-acid-green/10 border border-acid-green/30 flex items-center justify-center text-acid-green shadow-inner">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
              Nutrition Fuel Rings
            </h1>
            <p className="text-[11px] text-muted font-bold">
              {formatDisplayDate(selectedDate)} · {totalCals} of {targetCals} kcal consumed
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 bg-[var(--input)] border border-card-border p-1 rounded-2xl">
          <button
            onClick={handlePrevDate}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-all cursor-pointer border-none bg-transparent"
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
              className="bg-transparent text-xs font-black text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDate}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-all cursor-pointer border-none bg-transparent"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleTodayDate}
            className="px-2.5 py-1 rounded-xl bg-acid-green text-accent-foreground text-[10px] font-black uppercase tracking-wider cursor-pointer border-none transition-transform active:scale-95 shadow-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Hero Circular Rings & Macro Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left / Central: Calories Remaining Hero Ring */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-surface/50 border border-card-border/50 rounded-2xl relative shadow-inner">
          <div className="relative flex items-center justify-center" style={{ width: centerSize, height: centerSize }}>
            <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${centerSize} ${centerSize}`}>
              {/* Background track circle */}
              <circle
                cx={centerSize / 2}
                cy={centerSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-[var(--input)]"
                fill="transparent"
              />
              {/* Progress active ring */}
              <circle
                cx={centerSize / 2}
                cy={centerSize / 2}
                r={radius}
                stroke="#4ade80" // green-400 / acid-green
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={calOffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease',
                  filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.4))'
                }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Remaining</span>
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                {remainingCals}
              </span>
              <span className="text-[10px] font-bold text-green-400 uppercase">kcal left</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between w-full text-xs font-bold px-2">
            <span className="text-muted text-[11px]">Eaten: <strong className="text-foreground">{totalCals}</strong></span>
            <span className="text-muted text-[11px]">Goal: <strong className="text-foreground">{targetCals}</strong></span>
            <span className="text-green-400 text-[11px] font-black">{calPercent}%</span>
          </div>
        </div>

        {/* Right: 3 Macro Mini Rings (Protein, Carbs, Fat) */}
        <div className="md:col-span-7 grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {macroRings.map((ring) => {
            const isSelected = activeMacroFilter === ring.id;
            const smallSize = 72;
            const smallWidth = 6.5;
            const smallR = (smallSize - smallWidth) / 2;
            const smallCirc = 2 * Math.PI * smallR;
            const smallOffset = smallCirc - (ring.percent / 100) * smallCirc;

            return (
              <motion.div
                key={ring.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMacroFilter(isSelected ? null : ring.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                  isSelected
                    ? 'border-foreground ring-2 ring-foreground/20 bg-surface shadow-xl'
                    : 'border-card-border bg-surface/50 hover:border-card-border/80'
                }`}
              >
                <div className="relative flex items-center justify-center mb-2" style={{ width: smallSize, height: smallSize }}>
                  <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${smallSize} ${smallSize}`}>
                    <circle
                      cx={smallSize / 2}
                      cy={smallSize / 2}
                      r={smallR}
                      stroke="currentColor"
                      strokeWidth={smallWidth}
                      className="text-[var(--input)]"
                      fill="transparent"
                    />
                    <circle
                      cx={smallSize / 2}
                      cy={smallSize / 2}
                      r={smallR}
                      stroke={ring.color}
                      strokeWidth={smallWidth}
                      strokeDasharray={smallCirc}
                      strokeDashoffset={smallOffset}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{
                        transition: 'stroke-dashoffset 0.8s ease',
                        filter: `drop-shadow(0 0 6px ${ring.glowColor})`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-black text-foreground leading-none">
                      {Math.round(ring.consumed)}
                    </span>
                    <span className="text-[9px] font-bold text-muted mt-0.5">/{ring.target}{ring.unit}</span>
                  </div>
                </div>

                <span className="text-xs font-black uppercase tracking-wider" style={{ color: ring.color }}>
                  {ring.label}
                </span>
                <span className="text-[10px] text-muted font-bold mt-0.5">
                  {ring.percent}% of goal
                </span>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Interactive Helper Banner if Macro Filter is active */}
      {activeMacroFilter && (
        <div className="flex items-center justify-between bg-surface border border-card-border px-3.5 py-2 rounded-xl text-xs">
          <span className="font-bold text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-acid-green" /> Filtering today's logged meals high in <strong className="text-foreground uppercase">{activeMacroFilter}</strong>
          </span>
          <button
            onClick={() => setActiveMacroFilter(null)}
            className="text-[10px] font-black uppercase text-acid-green hover:underline cursor-pointer border-none bg-transparent"
          >
            Clear Filter
          </button>
        </div>
      )}
    </section>
  );
}
