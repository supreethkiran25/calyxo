"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';

// ── Fallback 2D UI Component ──
function Fallback2DHealthCore({ metrics, hasProAccess }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative p-6 bg-surface/30 border border-card-border rounded-3xl overflow-hidden">
      
      {/* Gated 3D Indicator Badge for FREE / PRO_LITE */}
      {!hasProAccess && (
        <div className="absolute top-4 right-4 bg-acid-green/10 border border-acid-green/20 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider text-acid-green flex items-center gap-1 z-30">
          🔒 3D Core requires Pro
        </div>
      )}
      
      {/* Animated Glowing Center Circle */}
      <div className="absolute w-44 h-44 rounded-full border border-acid-green/35 bg-acid-green/5 shadow-[0_0_40px_var(--accent-glow)] flex items-center justify-center animate-pulse z-10">
        <div className="text-center space-y-1">
          <span className="text-[10px] text-muted font-bold uppercase tracking-widest block">Health Core</span>
          <span className="text-xl font-black text-foreground block">CALYXO</span>
          <span className="text-[8px] text-acid-green font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-acid-green/10 border border-acid-green/20">Active</span>
        </div>
      </div>

      {/* Metric Orbit Nodes (2D) */}
      <div className="w-full h-full absolute inset-0 z-20 pointer-events-none">
        {metrics.map((m, idx) => {
          const angle = (idx / metrics.length) * 360;
          return (
            <div 
              key={m.label}
              className="absolute top-1/2 left-1/2 w-fit transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`
              }}
            >
              <div 
                className="w-4 h-4 rounded-full shadow-md flex items-center justify-center text-[8px] border"
                style={{ backgroundColor: m.color + '20', borderColor: m.color }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
              </div>
              <div className="bg-black/90 border border-card-border px-2.5 py-1.5 rounded-xl text-[8.5px] font-black tracking-wider uppercase text-foreground shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-bold">{m.label}:</span>
                <span style={{ color: m.color }}>{m.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Star Field Effect in Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-1 h-1 bg-white rounded-full absolute top-[10%] left-[20%]"></div>
        <div className="w-1.5 h-1.5 bg-acid-green rounded-full absolute top-[25%] left-[75%] animate-ping"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute top-[60%] left-[15%]"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute top-[80%] left-[70%]"></div>
        <div className="w-1 h-1.5 bg-emerald-400 rounded-full absolute top-[40%] left-[85%]"></div>
      </div>
    </div>
  );
}

// ── Main Wrapper ──
export default function ThreeHealthCore() {
  const [mounted, setMounted] = useState(false);
  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs);
  const workoutLogs = useStore(state => state.workoutLogs);
  const waterIntake = useStore(state => state.waterIntake);
  const ecoStore = useEcosystemStore();

  const plan = userProfile?.subscriptionPlan || 'FREE';
  const hasProAccess = plan === 'PRO' || plan === 'PRO_PLUS';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Compute metric values
  const totalCal = foodLogs.reduce((s, x) => s + x.calories, 0);
  const totalProt = foodLogs.reduce((s, x) => s + (x.protein || 0), 0);
  
  // Calculate average sleep / recovery from health hub (to be populated in Phase 7)
  const sleepHours = ecoStore.healthLogs?.sleep || 7.5;
  const recoveryScore = ecoStore.healthLogs?.recovery || 85;
  const totalSteps = ecoStore.healthLogs?.steps || 6400;

  const metrics = [
    { label: "Calories", value: `${totalCal} kcal`, color: "#b5f23d" },
    { label: "Protein", value: `${Math.round(totalProt)}g`, color: "#ff8c00" },
    { label: "Sleep", value: `${sleepHours} hrs`, color: "#4fc3f7" },
    { label: "Recovery", value: `${recoveryScore}%`, color: "#ef5350" },
    { label: "Steps", value: `${totalSteps}`, color: "#e040fb" },
    { label: "Hydration", value: `${waterIntake} ml`, color: "#29b6f6" }
  ];

  if (!mounted) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-surface/20 border border-card-border rounded-3xl animate-pulse">
        <span className="text-xs text-muted uppercase font-bold tracking-widest">Initializing Core...</span>
      </div>
    );
  }

  // Fallback 2D UI
  return (
    <div className="w-full h-[400px]">
      <Fallback2DHealthCore metrics={metrics} hasProAccess={hasProAccess} />
    </div>
  );
}
