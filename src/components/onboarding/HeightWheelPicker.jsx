import React, { useState, useEffect, useRef } from 'react';
import { Ruler } from 'lucide-react';

const ITEM_HEIGHT = 44;

function DrumColumn({ items, selectedIndex, onSelect, label, width = 'w-full' }) {
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
    }, 60);
  };

  return (
    <div className={`flex-1 flex flex-col items-center ${width}`}>
      {label && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</span>}
      <div className="relative w-full h-[132px] overflow-hidden rounded-2xl bg-[#0D111A] border border-white/[0.08] shadow-inner">
        {/* Gradients */}
        <div className="absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-[#0D111A] via-[#0D111A]/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-11 bg-gradient-to-t from-[#0D111A] via-[#0D111A]/80 to-transparent pointer-events-none z-20" />

        {/* Center lens */}
        <div className="absolute inset-x-1.5 top-[44px] h-[44px] rounded-xl bg-[#A3E635]/10 border border-[#A3E635]/30 pointer-events-none z-10" />

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
                onClick={() => onSelect(idx)}
                style={{ height: `${ITEM_HEIGHT}px` }}
                className={`snap-center flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-150 select-none ${
                  isSelected 
                    ? 'text-[#A3E635] font-bold text-base scale-105' 
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

export default function HeightWheelPicker({ value = 175, unit = 'metric', onChange, onUnitChange }) {
  const isMetric = unit === 'metric'; // metric: cm, imperial: ft/in

  // Metric cm range: 120cm to 230cm
  const cmItems = React.useMemo(() => {
    const arr = [];
    for (let c = 120; c <= 230; c++) arr.push(c);
    return arr;
  }, []);

  // Imperial feet: 4ft to 7ft, inches: 0 to 11
  const feetItems = [4, 5, 6, 7];
  const inchItems = Array.from({ length: 12 }, (_, i) => i);

  // Convert current canonical cm to imperial ft & in
  const totalInches = Math.round((value || 175) / 2.54);
  const currentFeet = Math.floor(totalInches / 12);
  const currentInches = totalInches % 12;

  const selectedCmIdx = Math.max(0, cmItems.indexOf(value || 175));
  const selectedFeetIdx = Math.max(0, feetItems.indexOf(Math.min(7, Math.max(4, currentFeet))));
  const selectedInchIdx = Math.max(0, Math.min(11, currentInches));

  const displayString = isMetric 
    ? `${value || 175} cm`
    : `${currentFeet} ft ${currentInches} in`;

  return (
    <div className="w-full rounded-3xl bg-[#0A0D14] border border-white/[0.08] p-4 shadow-xl space-y-3">
      {/* Header with Unit Toggle */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-[#A3E635]" />
          <span className="text-xs font-bold text-slate-200">Height</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#A3E635] bg-[#A3E635]/15 px-3 py-1 rounded-full border border-[#A3E635]/30">
            {displayString}
          </span>
          <div className="inline-flex rounded-full bg-[#12121A] border border-white/[0.08] p-0.5">
            <button
              type="button"
              onClick={() => onUnitChange && onUnitChange('metric')}
              className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                isMetric ? 'bg-[#A3E635] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => onUnitChange && onUnitChange('imperial')}
              className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold transition-all ${
                !isMetric ? 'bg-[#A3E635] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              ft/in
            </button>
          </div>
        </div>
      </div>

      {/* Wheel Columns */}
      {isMetric ? (
        <div className="flex items-center gap-2">
          <DrumColumn
            items={cmItems.map(c => `${c} cm`)}
            selectedIndex={selectedCmIdx}
            onSelect={(idx) => {
              const cmVal = cmItems[idx];
              if (onChange) onChange(cmVal);
            }}
            label="Centimeters"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <DrumColumn
            items={feetItems.map(f => `${f} ft`)}
            selectedIndex={selectedFeetIdx}
            onSelect={(idx) => {
              const ft = feetItems[idx];
              const canonicalCm = Math.round((ft * 12 + currentInches) * 2.54);
              if (onChange) onChange(canonicalCm);
            }}
            label="Feet"
          />
          <DrumColumn
            items={inchItems.map(i => `${i} in`)}
            selectedIndex={selectedInchIdx}
            onSelect={(idx) => {
              const inVal = inchItems[idx];
              const canonicalCm = Math.round((currentFeet * 12 + inVal) * 2.54);
              if (onChange) onChange(canonicalCm);
            }}
            label="Inches"
          />
        </div>
      )}

      {/* Quick Presets */}
      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
        {(isMetric ? [160, 168, 172, 175, 180, 185, 190] : [
          { label: "5'4\"", cm: 163 },
          { label: "5'7\"", cm: 170 },
          { label: "5'9\"", cm: 175 },
          { label: "5'11\"", cm: 180 },
          { label: "6'1\"", cm: 185 }
        ]).map((preset) => {
          const cmVal = typeof preset === 'number' ? preset : preset.cm;
          const label = typeof preset === 'number' ? `${preset}cm` : preset.label;
          const isSelected = value === cmVal;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (onChange) onChange(cmVal);
              }}
              className={`text-[11px] px-3 py-1 rounded-full border font-bold transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#A3E635]/20 border-[#A3E635] text-[#A3E635]'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
