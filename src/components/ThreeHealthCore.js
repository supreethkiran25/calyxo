"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplets, Dumbbell, Moon, Activity, Footprints, Sparkles } from 'lucide-react';

import { isToday } from '../utils/dateUtils';

export default function ThreeHealthCore() {
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs);
  const ecoStore = useEcosystemStore();
  const waterIntake = useStore(state => state.waterIntake);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Calculate actual daily metrics (resets every 24 hours for new day)
  const todaysFoodLogs = foodLogs.filter(x => isToday(x.timestamp));
  const totalCal = todaysFoodLogs.reduce((s, x) => s + (x.calories || 0), 0);
  const totalProt = todaysFoodLogs.reduce((s, x) => s + (x.protein || 0), 0);

  const sleepHours = ecoStore.healthLogs?.sleep || 7.5;
  const recoveryScore = ecoStore.healthLogs?.recovery || 85;
  const totalSteps = ecoStore.healthLogs?.steps || 6400;

  const calTarget = userProfile?.calTarget || userProfile?.dailyCalories || 2000;
  const protTarget = userProfile?.protTarget || userProfile?.proteinTarget || 120;
  const sleepTarget = 8;
  const recoveryTarget = 100;
  const stepsTarget = 10000;
  const waterTarget = 3000;

  const metrics = [
    {
      id: 'calories',
      label: "Calories",
      raw: totalCal,
      target: calTarget,
      unit: "kcal",
      icon: <Flame className="w-3.5 h-3.5 text-[#ccff00]" />,
      progress: Math.min(1, Math.max(0, totalCal / calTarget)),
      gradientId: "grad-calories",
      startColor: "#ccff00",
      endColor: "#10b981",
      glow: "#ccff00",
      r: 125,
      strokeWidth: 12
    },
    {
      id: 'hydration',
      label: "Hydration",
      raw: waterIntake,
      target: waterTarget,
      unit: "ml",
      icon: <Droplets className="w-3.5 h-3.5 text-[#00f2fe]" />,
      progress: Math.min(1, Math.max(0, waterIntake / waterTarget)),
      gradientId: "grad-hydration",
      startColor: "#00f2fe",
      endColor: "#4facfe",
      glow: "#00f2fe",
      r: 105,
      strokeWidth: 11
    },
    {
      id: 'protein',
      label: "Protein",
      raw: Math.round(totalProt),
      target: protTarget,
      unit: "g",
      icon: <Dumbbell className="w-3.5 h-3.5 text-[#ff4e50]" />,
      progress: Math.min(1, Math.max(0, totalProt / protTarget)),
      gradientId: "grad-protein",
      startColor: "#ff4e50",
      endColor: "#f9d423",
      glow: "#ff4e50",
      r: 85,
      strokeWidth: 10
    }
  ];

  const goalsMetCount = metrics.filter(m => m.progress >= 1).length;
  const overallPct = Math.round((metrics.reduce((s, m) => s + m.progress, 0) / metrics.length) * 100);

  if (!mounted) {
    return (
      <div className="w-full h-[360px] flex items-center justify-center bg-surface/20 border border-card-border rounded-3xl animate-pulse">
        <span className="text-xs text-muted uppercase font-bold tracking-widest">Loading Health Core...</span>
      </div>
    );
  }

  const activeMetric = hoveredIdx !== null ? metrics[hoveredIdx] : null;

  return (
    <div className="w-full flex flex-col items-center justify-between p-4 sm:p-5 bg-surface/30 border border-card-border rounded-3xl shadow-xl relative overflow-hidden">
      
      {/* Background Neon Ambient Glow */}
      <div 
        className="absolute inset-0 opacity-25 transition-all duration-700 blur-3xl pointer-events-none"
        style={{
          background: activeMetric 
            ? `radial-gradient(circle at center, ${activeMetric.glow} 0%, transparent 70%)` 
            : 'radial-gradient(circle at center, rgba(204,255,0,0.15) 0%, rgba(0,242,254,0.1) 45%, transparent 75%)'
        }}
      />

      {/* TOP / CENTER: RESPONSIVE CONCENTRIC 3D RINGS */}
      <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-square flex items-center justify-center z-10 pointer-events-auto">
        <svg 
          viewBox="0 0 300 300" 
          className="w-full h-full transform -rotate-90 origin-center filter drop-shadow-[0_0_12px_rgba(0,0,0,0.4)]"
        >
          <defs>
            {metrics.map(m => (
              <linearGradient key={m.gradientId} id={m.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={m.startColor} />
                <stop offset="100%" stopColor={m.endColor} />
              </linearGradient>
            ))}
            <filter id="neon-glow-responsive" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {metrics.map((m, i) => {
            const C = 2 * Math.PI * m.r;
            const strokeDashoffset = C * (1 - m.progress);
            const isHovered = hoveredIdx === i;

            const angle = m.progress * 360;
            const rad = (angle * Math.PI) / 180;
            const nx = 150 + m.r * Math.cos(rad);
            const ny = 150 + m.r * Math.sin(rad);

            return (
              <g 
                key={m.id}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(isHovered ? null : i)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  opacity: hoveredIdx === null || isHovered ? 1 : 0.25,
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: '150px 150px'
                }}
              >
                {/* Background Ring Track */}
                <circle
                  cx="150"
                  cy="150"
                  r={m.r}
                  fill="none"
                  stroke={m.startColor}
                  strokeWidth={m.strokeWidth}
                  strokeOpacity="0.1"
                />

                {/* Progress Ring Arc */}
                <circle
                  cx="150"
                  cy="150"
                  r={m.r}
                  fill="none"
                  stroke={`url(#${m.gradientId})`}
                  strokeWidth={m.strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={strokeDashoffset}
                  filter="url(#neon-glow-responsive)"
                  className="transition-all duration-1000 ease-out"
                />

                {/* End Node Glow */}
                {m.progress > 0 && (
                  <circle
                    cx={nx}
                    cy={ny}
                    r={m.strokeWidth / 2}
                    fill="#ffffff"
                    style={{
                      filter: `drop-shadow(0 0 6px ${m.startColor})`,
                      transformOrigin: `${nx}px ${ny}px`
                    }}
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* CENTER GLASS SPHERE */}
        <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-card-border/60 bg-surface/90 backdrop-blur-xl shadow-xl flex items-center justify-center z-20 pointer-events-none p-3 text-center">
          <AnimatePresence mode="wait">
            {activeMetric ? (
              <motion.div 
                key={activeMetric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center space-y-0.5 w-full"
              >
                <div className="p-1 rounded-full bg-surface border border-card-border">
                  {activeMetric.icon}
                </div>
                <span className="text-[8.5px] uppercase font-black tracking-widest" style={{ color: activeMetric.startColor }}>
                  {activeMetric.label}
                </span>
                <div className="text-sm sm:text-base font-black text-foreground leading-tight">
                  {activeMetric.raw.toLocaleString()}
                  <span className="text-[8px] text-muted font-bold ml-1">/ {activeMetric.target.toLocaleString()} {activeMetric.unit}</span>
                </div>
                <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-card-border/50 text-foreground">
                  {Math.round(activeMetric.progress * 100)}% Complete
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center space-y-0.5 w-full"
              >
                <div className="flex items-center gap-1 text-acid-green">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[8px] text-muted font-black uppercase tracking-widest">Health Core</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-foreground tracking-wider leading-tight">CALYXO</h3>
                <span className="text-[8px] text-acid-green font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-acid-green/10 border border-acid-green/20">
                  {overallPct}% Active Core
                </span>
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider mt-0.5 block">
                  {goalsMetCount} of {metrics.length} Goals Met
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* BOTTOM FLOW: CLEAN RESPONSIVE METRIC BUTTONS (NEVER OVERLAPPING) */}
      <div className="w-full pt-3 border-t border-card-border/40 mt-3 flex flex-wrap justify-center gap-1.5 z-20 pointer-events-auto">
        {metrics.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => setHoveredIdx(hoveredIdx === idx ? null : idx)}
            className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
              hoveredIdx === idx
                ? 'bg-surface border-card-border text-foreground shadow-sm scale-105'
                : 'bg-surface/40 border-card-border/40 text-muted hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.startColor }} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
