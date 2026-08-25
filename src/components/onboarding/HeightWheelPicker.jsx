import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Ruler, Minus, Plus } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function HeightWheelPicker({ value = 175, unit = 'metric', onChange, onUnitChange }) {
  const isMetric = unit === 'metric'; // metric: cm, imperial: ft/in

  // Canonical height is in cm (e.g. 175)
  const heightCm = Math.round(Number(value) || 175);

  // Imperial feet & inches calculation
  const totalInches = Math.round(heightCm / 2.54);
  const currentFeet = Math.floor(totalInches / 12);
  const currentInches = totalInches % 12;

  const minCm = 120;
  const maxCm = 235;
  const step = 1;
  const PX_PER_STEP = 12; // 12px per cm for precise touch feel

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startValRef = useRef(heightCm);
  const lastHapticRef = useRef(heightCm);

  const triggerHaptic = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {}
  }, []);

  const updateHeightClamped = useCallback((newCm) => {
    const clamped = Math.min(maxCm, Math.max(minCm, Math.round(newCm)));
    if (onChange) {
      onChange(clamped);
    }

    if (Math.abs(clamped - lastHapticRef.current) >= 1) {
      lastHapticRef.current = clamped;
      triggerHaptic();
    }
  }, [minCm, maxCm, onChange, triggerHaptic]);

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startValRef.current = heightCm;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaVal = -(deltaX / PX_PER_STEP) * step;
    updateHeightClamped(startValRef.current + deltaVal);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch (err) {}
  };

  // Mouse wheel scroll handler
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY || e.deltaX;
    if (Math.abs(delta) < 1) return;
    const deltaStep = (delta > 0 ? 1 : -1);
    updateHeightClamped(heightCm + deltaStep);
  };

  // Render ticks around current height value
  const renderTicks = () => {
    const visibleRange = 10; // Show +/- 10 cm from center
    const startNum = Math.max(minCm, heightCm - visibleRange);
    const endNum = Math.min(maxCm, heightCm + visibleRange);
    
    const ticks = [];
    for (let c = startNum; c <= endNum; c += 1) {
      const isMajor = c % 5 === 0;
      const isTen = c % 10 === 0;
      const offsetPx = (c - heightCm) * (PX_PER_STEP / step);
      
      ticks.push(
        <div
          key={c}
          className="absolute flex flex-col items-center pointer-events-none transform -translate-x-1/2"
          style={{ left: `calc(50% + ${offsetPx}px)` }}
        >
          <div
            className={`transition-colors ${
              isTen
                ? 'w-[2px] h-7 bg-slate-200 dark:bg-slate-300'
                : isMajor
                ? 'w-[1.5px] h-5 bg-slate-400 dark:bg-slate-500'
                : 'w-[1px] h-3 bg-slate-700'
            }`}
          />
          {isMajor && (
            <span className={`text-[10px] font-bold font-mono mt-1.5 select-none ${isTen ? 'text-slate-200' : 'text-slate-500'}`}>
              {c}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="w-full rounded-3xl bg-[#0A0D14] border border-white/[0.08] p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header with Unit Toggle */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#A3E635]/15 text-[#A3E635] flex items-center justify-center">
            <Ruler className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-200">Height</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-[#12121A] border border-white/[0.08] p-0.5">
            <button
              type="button"
              onClick={() => onUnitChange && onUnitChange('metric')}
              className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
                isMetric ? 'bg-[#A3E635] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => onUnitChange && onUnitChange('imperial')}
              className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
                !isMetric ? 'bg-[#A3E635] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ft / in
            </button>
          </div>
        </div>
      </div>

      {/* Numeric Readout Card */}
      <div className="text-center py-2">
        <div className="inline-flex items-baseline gap-2">
          {isMetric ? (
            <>
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {heightCm}
              </span>
              <span className="text-sm sm:text-base font-black text-[#A3E635] uppercase font-mono">
                CM
              </span>
            </>
          ) : (
            <>
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {currentFeet}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-400 font-mono">FT</span>
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight ml-2">
                {currentInches}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-400 font-mono">IN</span>
              <span className="text-xs font-bold text-[#A3E635] font-mono ml-2">
                ({heightCm} cm)
              </span>
            </>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Drag ruler or tap step buttons</p>
      </div>

      {/* Interactive Horizontal Ruler Wheel */}
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateHeightClamped(heightCm - 1)}
          className="w-9 h-9 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Decrease 1cm"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div
          ref={useRef(null)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className="relative flex-1 h-24 overflow-hidden rounded-2xl bg-[#0D111A] border border-white/[0.08] cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center shadow-inner"
        >
          {/* Subtle horizontal track line */}
          <div className="absolute top-10 inset-x-0 h-[1px] bg-white/[0.06] pointer-events-none" />

          {/* Left & Right Edge Gradient Fade */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0D111A] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0D111A] to-transparent pointer-events-none z-10" />

          {/* Dynamic Ruler Ticks */}
          <div className="absolute inset-x-0 top-3 h-14 pointer-events-none">
            {renderTicks()}
          </div>

          {/* Center Indicator Needle */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
            <div className="w-2 h-2 rounded-full bg-[#A3E635] shadow-[0_0_8px_#A3E635]" />
            <div className="w-[2.5px] flex-1 bg-[#A3E635] shadow-[0_0_10px_#A3E635]/80 my-0.5 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-[#A3E635] shadow-[0_0_8px_#A3E635]" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => updateHeightClamped(heightCm + 1)}
          className="w-9 h-9 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Increase 1cm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
        {[155, 160, 165, 170, 175, 180, 185, 190].map((preset) => {
          const isSelected = heightCm === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                if (onChange) onChange(preset);
                triggerHaptic();
              }}
              className={`text-[11px] px-3 py-1.5 rounded-xl border font-bold transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-[#A3E635]/20 border-[#A3E635] text-[#A3E635]'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {isMetric ? `${preset}cm` : `${Math.floor(Math.round(preset / 2.54) / 12)}'${Math.round(preset / 2.54) % 12}"`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
