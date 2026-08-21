import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const ITEM_HEIGHT = 40;

function DrumWheelColumn({ items, selectedIndex, onSelect, label }) {
  const listRef = useRef(null);
  const isScrollingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (listRef.current && !isScrollingRef.current) {
      const top = selectedIndex * ITEM_HEIGHT;
      if (Math.abs(listRef.current.scrollTop - top) > 2) {
        listRef.current.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleScroll = () => {
    isScrollingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!listRef.current) return;
      const top = listRef.current.scrollTop;
      const idx = Math.max(0, Math.min(Math.round(top / ITEM_HEIGHT), items.length - 1));
      if (idx !== selectedIndex) {
        onSelect(idx);
      }
      isScrollingRef.current = false;
    }, 80);
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</span>
      <div className="relative w-full h-[120px] overflow-hidden rounded-2xl bg-[#0e121a] border border-white/[0.06]">
        {/* Top & Bottom gradient mask */}
        <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#0e121a] to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0e121a] to-transparent pointer-events-none z-20" />

        {/* Center selection lens bar */}
        <div className="absolute inset-x-1 top-[40px] h-[40px] rounded-xl bg-white/[0.06] border border-white/10 pointer-events-none z-10" />

        {/* Scrollable list */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth py-[40px] no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={idx}
                onClick={() => onSelect(idx)}
                style={{ height: `${ITEM_HEIGHT}px` }}
                className={`snap-center flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-150 select-none ${
                  isSelected 
                    ? 'text-white font-bold text-sm scale-105' 
                    : 'text-slate-500 hover:text-slate-300 scale-95'
                }`}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function IOSWheelDatePicker({ value = '2001-01-01', onChange }) {
  const initialDate = new Date(value || '2001-01-01');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);

  const [selectedYearIdx, setSelectedYearIdx] = useState(() => {
    const y = !isNaN(initialDate.getFullYear()) ? initialDate.getFullYear() : 2001;
    const idx = years.indexOf(y);
    return idx >= 0 ? idx : 25;
  });

  const [selectedMonthIdx, setSelectedMonthIdx] = useState(() => {
    return !isNaN(initialDate.getMonth()) ? initialDate.getMonth() : 0;
  });

  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = !isNaN(initialDate.getDate()) ? initialDate.getDate() : 1;
    return Math.max(0, d - 1);
  });

  const activeYear = years[selectedYearIdx] || 2001;
  const daysInMonth = new Date(activeYear, selectedMonthIdx + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Keep day in range when month/year changes
  useEffect(() => {
    if (selectedDayIdx >= daysInMonth) {
      setSelectedDayIdx(daysInMonth - 1);
    }
  }, [selectedMonthIdx, activeYear, daysInMonth, selectedDayIdx]);

  // Emit updated ISO date string and age
  useEffect(() => {
    const safeDay = Math.min(selectedDayIdx + 1, daysInMonth);
    const mm = String(selectedMonthIdx + 1).padStart(2, '0');
    const dd = String(safeDay).padStart(2, '0');
    const dateStr = `${activeYear}-${mm}-${dd}`;
    const calculatedAge = Math.max(12, Math.min(100, currentYear - activeYear));
    if (onChange) {
      onChange(dateStr, calculatedAge);
    }
  }, [activeYear, selectedMonthIdx, selectedDayIdx, daysInMonth, currentYear]);

  const calculatedAge = Math.max(12, Math.min(100, currentYear - activeYear));

  return (
    <div className="w-full rounded-3xl bg-[#0A0D14] border border-white/[0.08] p-4 shadow-2xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#A3E635]" />
          <span className="text-xs font-semibold text-slate-200">Date of Birth</span>
        </div>
        <span className="text-xs font-bold text-[#A3E635] bg-[#A3E635]/10 px-2.5 py-0.5 rounded-full border border-[#A3E635]/20">
          {calculatedAge} years old
        </span>
      </div>

      {/* 3 iOS Drum Rollers */}
      <div className="flex items-center gap-2">
        <DrumWheelColumn
          items={MONTHS}
          selectedIndex={selectedMonthIdx}
          onSelect={setSelectedMonthIdx}
          label="Month"
        />
        <DrumWheelColumn
          items={days}
          selectedIndex={Math.min(selectedDayIdx, days.length - 1)}
          onSelect={setSelectedDayIdx}
          label="Day"
        />
        <DrumWheelColumn
          items={years}
          selectedIndex={selectedYearIdx}
          onSelect={setSelectedYearIdx}
          label="Year"
        />
      </div>

      {/* Quick Age Presets */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {[18, 21, 25, 30, 35, 40].map((age) => {
          const targetYear = currentYear - age;
          const isSelected = calculatedAge === age;
          return (
            <button
              key={age}
              type="button"
              onClick={() => {
                const idx = years.indexOf(targetYear);
                if (idx >= 0) setSelectedYearIdx(idx);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold transition-all ${
                isSelected
                  ? 'bg-[#A3E635]/15 border-[#A3E635]/60 text-[#A3E635]'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {age}y
            </button>
          );
        })}
      </div>
    </div>
  );
}
