"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { Flame, Droplets, Dumbbell } from 'lucide-react';
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

  // Daily totals
  const todaysFoodLogs = foodLogs.filter(x => isToday(x.timestamp));
  const totalCal = todaysFoodLogs.reduce((s, x) => s + (x.calories || 0), 0);
  const totalProt = todaysFoodLogs.reduce((s, x) => s + (x.protein || 0), 0);

  const calTarget = userProfile?.calTarget || userProfile?.dailyCalories || 2000;
  const protTarget = userProfile?.protTarget || userProfile?.proteinTarget || 120;
  const waterTarget = 3000;

  const calPct = Math.min(100, Math.round((totalCal / calTarget) * 100));
  const waterPct = Math.min(100, Math.round((waterIntake / waterTarget) * 100));
  const protPct = Math.min(100, Math.round((totalProt / protTarget) * 100));

  // 3 distinct side-by-side rings with 3 unique vibrant colors
  const rings = [
    {
      id: 'calories',
      label: 'CALORIES',
      rawVal: totalCal,
      targetVal: calTarget,
      unit: 'kcal',
      percentage: calPct,
      displayCenter: `${calPct}%`,
      color: '#f59e0b', // Vibrant Flame Amber / Orange
      trackColor: 'rgba(245, 158, 11, 0.15)',
      icon: <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
    },
    {
      id: 'hydration',
      label: 'HYDRATION',
      rawVal: waterIntake,
      targetVal: waterTarget,
      unit: 'ml',
      percentage: waterPct,
      displayCenter: `${waterPct}%`,
      color: '#00f2fe', // Electric Cyan Blue
      trackColor: 'rgba(0, 242, 254, 0.15)',
      icon: <Droplets className="w-3.5 h-3.5 text-[#00f2fe]" />
    },
    {
      id: 'protein',
      label: 'PROTEIN',
      rawVal: Math.round(totalProt),
      targetVal: protTarget,
      unit: 'g',
      percentage: protPct,
      displayCenter: `${protPct}%`,
      color: '#ff4e50', // Vibrant Coral Red
      trackColor: 'rgba(255, 78, 80, 0.15)',
      icon: <Dumbbell className="w-3.5 h-3.5 text-[#ff4e50]" />
    }
  ];

  if (!mounted) {
    return (
      <div className="w-full h-[180px] bg-surface/30 border border-card-border rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-muted font-black uppercase">Loading Rings...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface/30 border border-card-border rounded-3xl p-5 shadow-xl space-y-4">
      
      {/* 3 Distinct Side-by-Side Circular Progress Rings with Unique Colors */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center justify-items-center">
        {rings.map((ring, idx) => {
          const radius = 42;
          const strokeWidth = 8;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (ring.percentage / 100) * circumference;

          return (
            <div
              key={ring.id}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex flex-col items-center space-y-2 cursor-pointer transition-all duration-300 group"
            >
              {/* Circular SVG Ring */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 origin-center">
                  {/* Background Track */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke={ring.trackColor}
                    strokeWidth={strokeWidth}
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 4px ${ring.color})`
                    }}
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base sm:text-xl font-black tracking-tight text-foreground group-hover:scale-105 transition-transform">
                    {ring.displayCenter}
                  </span>
                </div>
              </div>

              {/* Label & Raw Stat in Unique Accent Color */}
              <div className="text-center space-y-0.5">
                <span className="text-[10px] font-black tracking-wider block uppercase" style={{ color: ring.color }}>
                  {ring.label}
                </span>
                <span className="text-[10px] text-muted font-bold block">
                  {ring.rawVal.toLocaleString()} / {ring.targetVal.toLocaleString()} {ring.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
