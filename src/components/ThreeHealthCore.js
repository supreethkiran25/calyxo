"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { Flame, Droplets, Dumbbell } from 'lucide-react';
import { isToday, getTodayDateString, isSameLocalDate } from '../utils/dateUtils';
import { syncWidgetData } from '../services/widgetDataService';

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

  // Filter today's food logs using strict local YYYY-MM-DD date matching
  const todayStr = getTodayDateString();
  const todaysFoodLogs = (foodLogs || []).filter(x => isSameLocalDate(x.timestamp, todayStr) || isToday(x.timestamp));
  const totalCal = todaysFoodLogs.reduce((s, x) => s + (Number(x.calories) || 0), 0);
  const totalProt = todaysFoodLogs.reduce((s, x) => s + (Number(x.protein) || 0), 0);
  const totalCarbs = todaysFoodLogs.reduce((s, x) => s + (Number(x.carbs) || 0), 0);
  const totalFat = todaysFoodLogs.reduce((s, x) => s + (Number(x.fat) || 0), 0);

  // Standardized Target Fallbacks across all devices & profiles
  const calTarget = Number(userProfile?.calorieGoal || userProfile?.dailyCalories || userProfile?.calTarget || 2000);
  const protTarget = Number(userProfile?.proteinGoal || userProfile?.proteinTarget || userProfile?.protein || userProfile?.protTarget || 120);
  const waterTarget = Number(userProfile?.waterGoal || userProfile?.waterTarget || 3000);

  // Sync real rings state to Home Screen widgets
  useEffect(() => {
    syncWidgetData({
      calories: Math.round(totalCal),
      calorieGoal: Math.round(calTarget),
      protein: Math.round(totalProt),
      proteinGoal: Math.round(protTarget),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      water: Math.round(waterIntake),
      waterGoal: Math.round(waterTarget),
      streak: userProfile?.streak || 0
    });
  }, [totalCal, calTarget, totalProt, protTarget, totalCarbs, totalFat, waterIntake, waterTarget, userProfile?.streak]);

  const calPct = calTarget > 0 ? Math.min(100, Math.round((totalCal / calTarget) * 100)) : 0;
  const waterPct = waterTarget > 0 ? Math.min(100, Math.round((waterIntake / waterTarget) * 100)) : 0;
  const protPct = protTarget > 0 ? Math.min(100, Math.round((totalProt / protTarget) * 100)) : 0;

  // 3 distinct side-by-side rings with unique vibrant colors
  const rings = [
    {
      id: 'calories',
      label: 'CALORIES',
      rawVal: Math.round(totalCal),
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
      rawVal: Math.round(waterIntake),
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
      
      {/* 3 Distinct Side-by-Side Circular Progress Rings */}
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
