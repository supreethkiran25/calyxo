import React from 'react';

/**
 * Minimal Apple-level iOS Loading Bar Indicator
 *
 * Dimensions: Width: 168px | Height: 3px | Track: #30343A | Fill: #F4F5F6 | Radius: 999px
 */
export default function SplashLoader({ progress = 0, className = '' }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      role="progressbar"
      aria-label="Calyxo initialization progress"
      aria-valuenow={Math.round(clampedProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative w-[168px] max-w-[50vw] h-[3px] bg-[#30343A] rounded-full overflow-hidden select-none pointer-events-none ${className}`}
    >
      <div
        className="h-full bg-[#F4F5F6] rounded-full transition-[width] duration-75 ease-out will-change-[width]"
        style={{
          width: `${clampedProgress}%`
        }}
      />
    </div>
  );
}

export { SplashLoader };
