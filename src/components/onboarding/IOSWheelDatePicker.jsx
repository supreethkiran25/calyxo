import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Check, ChevronUp, ChevronDown } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function IOSWheelDatePicker({ value = '2001-01-01', onChange }) {
  const initialDate = new Date(value || '2001-01-01');
  const [selectedYear, setSelectedYear] = useState(!isNaN(initialDate.getFullYear()) ? initialDate.getFullYear() : 2001);
  const [selectedMonth, setSelectedMonth] = useState(!isNaN(initialDate.getMonth()) ? initialDate.getMonth() : 0);
  const [selectedDay, setSelectedDay] = useState(!isNaN(initialDate.getDate()) ? initialDate.getDate() : 1);

  // Generate Year Range (from 1920 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);

  // Days in selected Month & Year
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Keep Day in bounds when Month changes
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  // Emit updated ISO date string and age
  useEffect(() => {
    const safeDay = Math.min(selectedDay, daysInMonth);
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const dd = String(safeDay).padStart(2, '0');
    const dateStr = `${selectedYear}-${mm}-${dd}`;
    const calculatedAge = Math.max(12, Math.min(100, currentYear - selectedYear));
    if (onChange) {
      onChange(dateStr, calculatedAge);
    }
  }, [selectedYear, selectedMonth, selectedDay, daysInMonth, currentYear]);

  const calculatedAge = Math.max(12, Math.min(100, currentYear - selectedYear));

  return (
    <div className="w-full rounded-2xl bg-[#0e131e] border border-white/[0.08] p-4 shadow-xl space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">Cupertino Date Selection</span>
        </div>
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          {calculatedAge} years old
        </span>
      </div>

      {/* 3-Column iOS Drum Wheel Selector */}
      <div className="relative py-2 grid grid-cols-3 gap-2">
        {/* Selected Horizontal Lens Indicator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-white/[0.05] border border-white/10 pointer-events-none z-0" />

        {/* 1. Month Wheel Column */}
        <div className="relative z-10 flex flex-col items-center">
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Month</label>
          <div className="relative w-full">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-[#141b2b] text-white text-xs font-semibold rounded-xl px-2.5 py-2.5 text-center border border-white/[0.08] focus:border-amber-400 focus:outline-none appearance-none cursor-pointer hover:bg-[#1a2337] transition-colors"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx} className="bg-[#0e131e] text-white py-1">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Day Wheel Column */}
        <div className="relative z-10 flex flex-col items-center">
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Day</label>
          <div className="relative w-full">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="w-full bg-[#141b2b] text-white text-xs font-semibold rounded-xl px-2.5 py-2.5 text-center border border-white/[0.08] focus:border-amber-400 focus:outline-none appearance-none cursor-pointer hover:bg-[#1a2337] transition-colors"
            >
              {days.map((d) => (
                <option key={d} value={d} className="bg-[#0e131e] text-white py-1">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Year Wheel Column */}
        <div className="relative z-10 flex flex-col items-center">
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Year</label>
          <div className="relative w-full">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-[#141b2b] text-white text-xs font-semibold rounded-xl px-2.5 py-2.5 text-center border border-white/[0.08] focus:border-amber-400 focus:outline-none appearance-none cursor-pointer hover:bg-[#1a2337] transition-colors"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#0e131e] text-white py-1">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Age Presets */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {[18, 21, 25, 30, 35, 40].map((agePreset) => (
          <button
            key={agePreset}
            type="button"
            onClick={() => setSelectedYear(currentYear - agePreset)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
              calculatedAge === agePreset
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 font-bold'
                : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
            }`}
          >
            {agePreset}y
          </button>
        ))}
      </div>
    </div>
  );
}
