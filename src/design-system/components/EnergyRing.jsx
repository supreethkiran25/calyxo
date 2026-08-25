import React from 'react';
import { motion } from 'framer-motion';

export default function EnergyRing({
  consumed = 0,
  target = 2000,
  size = 180,
  strokeWidth = 14,
  label = "Calories Consumed",
  unit = "kcal",
  onOpenTargetModal = null
}) {
  const safeTarget = Math.max(target, 500);
  const percent = Math.min(Math.round((consumed / safeTarget) * 100), 100);
  const remaining = Math.max(0, target - consumed);
  const isOver = consumed > target;

  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="energyRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--success)" />
          </linearGradient>
          <linearGradient id="overTargetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--warning)" />
            <stop offset="100%" stopColor="var(--destructive)" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="opacity-40"
        />

        {/* Animated Progress Arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isOver ? "url(#overTargetGradient)" : "url(#energyRingGradient)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Metrics Readout */}
      <div 
        onClick={onOpenTargetModal} 
        className={`absolute inset-0 flex flex-col items-center justify-center text-center p-2 rounded-full ${onOpenTargetModal ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''}`}
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-secondary">
          {percent}% of Daily
        </span>
        <div className="flex items-baseline justify-center gap-1 my-0.5">
          <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {consumed.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-accent font-mono uppercase">
            {unit}
          </span>
        </div>
        <span className="text-[11px] font-medium text-secondary">
          {isOver ? (
            <span className="text-amber-500 dark:text-amber-400 font-bold">+{consumed - target} over target</span>
          ) : (
            <span><strong className="text-foreground">{remaining.toLocaleString()}</strong> {unit} left</span>
          )}
        </span>
      </div>
    </div>
  );
}
