import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scale, Minus, Plus } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function WeightWheelPicker({ value = 70, unit = 'metric', onChange, onUnitChange }) {
  const isMetric = unit === 'metric'; // metric: kg, imperial: lbs

  // Display value in active unit
  const displayValue = isMetric
    ? Number(Number(value || 70).toFixed(1))
    : Math.round((Number(value || 70) * 2.20462) * 10) / 10;

  const minWeight = isMetric ? 30.0 : 65.0;
  const maxWeight = isMetric ? 220.0 : 485.0;
  const step = 0.1;
  const PX_PER_STEP = 10; // 10px per 0.1 unit

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startValRef = useRef(displayValue);
  const lastHapticRef = useRef(displayValue);

  const triggerHaptic = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {}
  }, []);

  const updateWeightClamped = useCallback((newDisplayVal) => {
    const clamped = Math.min(maxWeight, Math.max(minWeight, Math.round(newDisplayVal * 10) / 10));
    const canonicalKg = isMetric ? clamped : Number((clamped / 2.20462).toFixed(1));
    
    if (onChange) {
      onChange(canonicalKg);
    }

    if (Math.abs(clamped - lastHapticRef.current) >= 0.1) {
      lastHapticRef.current = clamped;
      triggerHaptic();
    }
  }, [minWeight, maxWeight, isMetric, onChange, triggerHaptic]);

  // Pointer Drag Handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startValRef.current = displayValue;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaVal = -(deltaX / PX_PER_STEP) * step;
    updateWeightClamped(startValRef.current + deltaVal);
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
    const deltaStep = (delta > 0 ? 0.1 : -0.1);
    updateWeightClamped(displayValue + deltaStep);
  };

  // Render ticks around current weight value
  const renderTicks = () => {
    const visibleRange = 3.5;
    const startNum = Math.max(minWeight, Math.floor((displayValue - visibleRange) * 10) / 10);
    const endNum = Math.min(maxWeight, Math.ceil((displayValue + visibleRange) * 10) / 10);
    
    const ticks = [];
    for (let w = startNum; w <= endNum; w = Math.round((w + 0.1) * 10) / 10) {
      const isMajor = Math.abs(Math.round(w) - w) < 0.01;
      const isMid = !isMajor && Math.abs(Math.round(w * 2) / 2 - w) < 0.01;
      const offsetPx = (w - displayValue) * (PX_PER_STEP / step);
      
      ticks.push(
        <div
          key={w.toFixed(1)}
          className="absolute flex flex-col items-center pointer-events-none transform -translate-x-1/2"
          style={{ left: `calc(50% + ${offsetPx}px)` }}
        >
          <div
            className={`transition-colors ${
              isMajor
                ? 'w-[2px] h-7 bg-slate-300 dark:bg-slate-400'
                : isMid
                ? 'w-[1.5px] h-5 bg-slate-500/70'
                : 'w-[1px] h-3 bg-slate-700'
            }`}
          />
          {isMajor && (
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 font-mono mt-1.5 select-none">
              {Math.round(w)}
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
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-200">Current Weight</span>
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
              kg
            </button>
            <button
              type="button"
              onClick={() => onUnitChange && onUnitChange('imperial')}
              className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${
                !isMetric ? 'bg-[#A3E635] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
      </div>

      {/* Numeric Readout Card */}
      <div className="text-center py-2">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
            {displayValue.toFixed(1)}
          </span>
          <span className="text-sm sm:text-base font-black text-[#A3E635] uppercase font-mono">
            {isMetric ? 'KG' : 'LBS'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Drag ruler or tap step buttons</p>
      </div>

      {/* Interactive Horizontal Ruler Wheel */}
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateWeightClamped(displayValue - 0.5)}
          className="w-9 h-9 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Decrease 0.5"
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
          onClick={() => updateWeightClamped(displayValue + 0.5)}
          className="w-9 h-9 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Increase 0.5"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
        {(isMetric ? [55, 60, 65, 70, 75, 80, 85, 95] : [120, 135, 150, 165, 180, 195, 210]).map((preset) => {
          const isSelected = Math.abs(displayValue - preset) < 0.25;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const canonicalKg = isMetric ? preset : Number((preset / 2.20462).toFixed(1));
                if (onChange) onChange(canonicalKg);
                triggerHaptic();
              }}
              className={`text-[11px] px-3 py-1.5 rounded-xl border font-bold transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-[#A3E635]/20 border-[#A3E635] text-[#A3E635]'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {preset} {isMetric ? 'kg' : 'lbs'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
