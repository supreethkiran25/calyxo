import React, { useState, useEffect, useRef } from 'react';
import { Scale } from 'lucide-react';

const ITEM_HEIGHT = 44;

export default function WeightWheelPicker({ value = 70, unit = 'metric', onChange, onUnitChange }) {
  const isMetric = unit === 'metric'; // metric: kg, imperial: lbs
  const listRef = useRef(null);
  const isScrollingRef = useRef(false);
  const timerRef = useRef(null);

  // Generate numbers based on active unit
  // kg: 35.0 to 180.0 in 0.5kg steps
  // lbs: 75 to 400 in 1lb steps
  const items = React.useMemo(() => {
    if (isMetric) {
      const arr = [];
      for (let w = 35; w <= 180; w += 0.5) {
        arr.push(Number(w.toFixed(1)));
      }
      return arr;
    } else {
      const arr = [];
      for (let w = 75; w <= 400; w += 1) {
        arr.push(w);
      }
      return arr;
    }
  }, [isMetric]);

  // Display value in current unit
  const currentDisplayValue = isMetric 
    ? Number(Number(value || 70).toFixed(1))
    : Math.round((value || 70) * 2.20462);

  const selectedIndex = React.useMemo(() => {
    const idx = items.indexOf(currentDisplayValue);
    if (idx >= 0) return idx;
    // Find closest
    let closestIdx = 0;
    let minDiff = Infinity;
    items.forEach((item, i) => {
      const diff = Math.abs(item - currentDisplayValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    return closestIdx;
  }, [items, currentDisplayValue]);

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
      const chosenVal = items[idx];
      // Convert to canonical kg for persistence
      const canonicalKg = isMetric ? chosenVal : Number((chosenVal / 2.20462).toFixed(1));
      if (onChange) {
        onChange(canonicalKg);
      }
      isScrollingRef.current = false;
    }, 60);
  };

  const handleSelect = (idx) => {
    const chosenVal = items[idx];
    const canonicalKg = isMetric ? chosenVal : Number((chosenVal / 2.20462).toFixed(1));
    if (onChange) {
      onChange(canonicalKg);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-[#0A0D14] border border-white/[0.08] p-4 shadow-xl space-y-3">
      {/* Header with Unit Toggle */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#A3E635]" />
          <span className="text-xs font-bold text-slate-200">Current Weight</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#A3E635] bg-[#A3E635]/15 px-3 py-1 rounded-full border border-[#A3E635]/30">
            {currentDisplayValue} {isMetric ? 'kg' : 'lbs'}
          </span>
          <div className="inline-flex rounded-full bg-[#12121A] border border-white/[0.08] p-0.5">
            <button
              type="button"
              onClick={() => onUnitChange && onUnitChange('metric')}
              className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                isMetric ? 'bg-[#A3E635] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => onUnitChange && onUnitChange('imperial')}
              className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                !isMetric ? 'bg-[#A3E635] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
      </div>

      {/* Wheel Roller */}
      <div className="relative w-full h-[132px] overflow-hidden rounded-2xl bg-[#0D111A] border border-white/[0.08] shadow-inner">
        {/* Gradients */}
        <div className="absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-[#0D111A] via-[#0D111A]/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-11 bg-gradient-to-t from-[#0D111A] via-[#0D111A]/80 to-transparent pointer-events-none z-20" />

        {/* Center lens */}
        <div className="absolute inset-x-4 top-[44px] h-[44px] rounded-xl bg-[#A3E635]/10 border border-[#A3E635]/30 pointer-events-none z-10 flex items-center justify-end pr-8">
          <span className="text-xs font-bold text-[#A3E635] uppercase">{isMetric ? 'kg' : 'lbs'}</span>
        </div>

        {/* Scroll list */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth py-[44px] no-scrollbar touch-pan-y"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                style={{ height: `${ITEM_HEIGHT}px` }}
                className={`snap-center flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-150 select-none ${
                  isSelected 
                    ? 'text-[#A3E635] font-bold text-lg scale-105' 
                    : 'text-slate-500 hover:text-slate-300 scale-95'
                }`}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
        {(isMetric ? [55, 65, 70, 75, 80, 85, 95] : [120, 140, 155, 170, 185, 200, 220]).map((preset) => {
          const isSelected = isMetric ? (value === preset) : (currentDisplayValue === preset);
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const canonicalKg = isMetric ? preset : Number((preset / 2.20462).toFixed(1));
                if (onChange) onChange(canonicalKg);
              }}
              className={`text-[11px] px-3 py-1 rounded-full border font-bold transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#A3E635]/20 border-[#A3E635] text-[#A3E635]'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {preset}{isMetric ? 'kg' : 'lbs'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
