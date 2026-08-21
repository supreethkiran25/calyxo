import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Calyxo iOS-Style Number Wheel Picker
 *
 * Provides a tactile vertical roller/wheel selection interface for numeric values
 * (sets, reps, weight kg, portions, duration minutes, etc.) with smooth physics,
 * centered highlighted selection bar, and snap-to-item mechanics.
 */
export default function NumberWheelPicker({
  value = 5,
  onChange,
  min = 1,
  max = 100,
  step = 1,
  unit = '',
  label = '',
  itemHeight = 44,
  visibleItems = 5
}) {
  const containerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Generate range of numbers
  const numbers = [];
  for (let i = min; i <= max; i += step) {
    numbers.push(i);
  }

  const selectedIndex = Math.max(0, numbers.indexOf(value));

  // Scroll to selected index on mount or value prop change
  useEffect(() => {
    if (containerRef.current && !isUserScrollingRef.current) {
      const targetScroll = selectedIndex * itemHeight;
      if (Math.abs(containerRef.current.scrollTop - targetScroll) > 2) {
        containerRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [value, selectedIndex, itemHeight]);

  const handleScroll = useCallback(() => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, numbers.length - 1));
      const newValue = numbers[clampedIndex];

      if (newValue !== value && onChange) {
        onChange(newValue);
      }

      // Snap exactly to position
      containerRef.current.scrollTo({
        top: clampedIndex * itemHeight,
        behavior: 'smooth'
      });

      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    }, 80);
  }, [numbers, itemHeight, value, onChange]);

  const selectItem = (val, idx) => {
    if (onChange) onChange(val);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: idx * itemHeight,
        behavior: 'smooth'
      });
    }
  };

  const containerHeight = itemHeight * visibleItems;
  const paddingY = itemHeight * Math.floor(visibleItems / 2);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[280px] mx-auto">
      {label && (
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-1.5">
          {label}
        </span>
      )}

      <div 
        className="relative w-full rounded-3xl bg-[#141419] border border-white/10 overflow-hidden shadow-2xl"
        style={{ height: `${containerHeight}px` }}
      >
        {/* Top Fade Gradient */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#141419] via-[#141419]/80 to-transparent pointer-events-none z-10" />

        {/* Center Selection Pill Highlight Bar (Exact match to iOS capsule design) */}
        <div 
          className="absolute left-2 right-2 rounded-2xl bg-white/[0.08] border border-white/10 pointer-events-none z-0 shadow-inner"
          style={{
            top: `${paddingY}px`,
            height: `${itemHeight}px`
          }}
        />

        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#141419] via-[#141419]/80 to-transparent pointer-events-none z-10" />

        {/* Scrollable Container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll no-scrollbar scroll-smooth relative z-5"
          style={{
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
            scrollSnapType: 'y mandatory'
          }}
        >
          {numbers.map((num, idx) => {
            const isSelected = num === value;
            const distance = Math.abs(idx - selectedIndex);
            
            // Opacity & Scale calculation based on distance from center
            let opacity = 1;
            let scale = 1;
            if (distance === 1) {
              opacity = 0.45;
              scale = 0.88;
            } else if (distance >= 2) {
              opacity = 0.2;
              scale = 0.75;
            }

            return (
              <div
                key={num}
                onClick={() => selectItem(num, idx)}
                style={{
                  height: `${itemHeight}px`,
                  scrollSnapAlign: 'center',
                  transform: `scale(${scale})`,
                  opacity
                }}
                className={`flex items-center justify-center cursor-pointer transition-all duration-150 font-mono font-black ${
                  isSelected ? 'text-white text-2xl tracking-tight' : 'text-gray-400 text-lg'
                }`}
              >
                <span>{num}</span>
                {unit && isSelected && (
                  <span className="text-xs text-[var(--color-acid-green)] ml-1 font-sans uppercase font-bold">
                    {unit}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
