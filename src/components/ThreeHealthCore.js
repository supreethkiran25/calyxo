"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';

function RadialHealthCore({ metrics, hasProAccess }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const R = 120;
  const C = 2 * Math.PI * R;
  const ARC_DEG = 50;
  const ARC_LEN = C * (ARC_DEG / 360);
  
  const overallProgress = metrics.reduce((acc, m) => acc + m.progress, 0) / (metrics.length || 1);

  return (
    <div className="w-full h-full flex items-center justify-center relative p-6 bg-surface/30 border border-card-border rounded-3xl overflow-hidden">
      {!hasProAccess && (
        <div className="absolute top-4 right-4 bg-acid-green/10 border border-acid-green/20 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider text-acid-green flex items-center gap-1 z-30 pointer-events-none">
          🔒 3D Core requires Pro
        </div>
      )}

      {/* SVG Radial Ring */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
        <svg 
          viewBox="0 0 320 320" 
          className="w-full h-full max-w-[320px] max-h-[320px] origin-center"
          style={{ 
            filter: `drop-shadow(0 0 ${10 + overallProgress * 20}px var(--accent-glow))`,
            animation: 'spin 40s linear infinite'
          }}
        >
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes pulse-node { 
              0%, 100% { opacity: 0.8; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.3); }
            }
          `}</style>
          
          {metrics.map((m, i) => {
            const rot = i * 60 - 90; // Start at 12 o'clock
            const fillLen = ARC_LEN * m.progress;
            
            // Node position at the end of the filled arc
            const nodeAngle = m.progress * ARC_DEG;
            const nodeRad = nodeAngle * (Math.PI / 180);
            const nx = 160 + R * Math.cos(nodeRad);
            const ny = 160 + R * Math.sin(nodeRad);

            const isHovered = hoveredIdx === i;

            return (
              <g 
                key={m.label} 
                transform={`rotate(${rot}, 160, 160)`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(isHovered ? null : i)}
                className="cursor-pointer transition-opacity duration-300"
                style={{ opacity: hoveredIdx === null || isHovered ? 1 : 0.4 }}
              >
                {/* Background Arc */}
                <circle 
                  cx="160" cy="160" r={R}
                  fill="none"
                  stroke={m.color}
                  strokeWidth="8"
                  strokeOpacity="0.15"
                  strokeLinecap="round"
                  strokeDasharray={`${ARC_LEN} ${C}`}
                />
                
                {/* Filled Arc */}
                <circle 
                  cx="160" cy="160" r={R}
                  fill="none"
                  stroke={m.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${fillLen} ${C}`}
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Glowing Node */}
                {m.progress > 0 && (
                  <circle 
                    cx={nx} cy={ny} r="4"
                    fill="#fff"
                    style={{
                      filter: `drop-shadow(0 0 6px ${m.color})`,
                      animation: 'pulse-node 2s infinite ease-in-out',
                      transformOrigin: `${nx}px ${ny}px`
                    }}
                  />
                )}
                
                {/* Invisible Hitbox */}
                <circle 
                  cx="160" cy="160" r={R}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="32"
                  strokeDasharray={`${ARC_LEN} ${C}`}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Center Label / Tooltip */}
      <div className="absolute w-44 h-44 rounded-full border border-card-border/50 bg-surface/80 backdrop-blur-md shadow-2xl flex items-center justify-center z-20 transition-all duration-300">
        <div className="text-center space-y-1 relative w-full h-full flex flex-col items-center justify-center">
          {hoveredIdx !== null ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[10px] uppercase font-black tracking-widest block" style={{ color: metrics[hoveredIdx].color }}>
                {metrics[hoveredIdx].label}
              </span>
              <span className="text-2xl font-black text-foreground block mt-1">
                {metrics[hoveredIdx].value}
              </span>
              <span className="text-[9px] text-muted font-bold tracking-wider uppercase mt-1">
                {Math.round(metrics[hoveredIdx].progress * 100)}% of Goal
              </span>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest block">Health Core</span>
              <span className="text-xl font-black text-foreground block my-1">CALYXO</span>
              <span className="text-[8px] text-acid-green font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-acid-green/10 border border-acid-green/20">Active</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Star Field Effect in Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
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
  const ecoStore = useEcosystemStore();
  const waterIntake = useStore(state => state.waterIntake);

  const plan = userProfile?.subscriptionPlan || 'FREE';
  const hasProAccess = plan === 'PRO' || plan === 'PRO_PLUS';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Compute metric values
  const totalCal = foodLogs.reduce((s, x) => s + x.calories, 0);
  const totalProt = foodLogs.reduce((s, x) => s + (x.protein || 0), 0);
  
  const sleepHours = ecoStore.healthLogs?.sleep || 7.5;
  const recoveryScore = ecoStore.healthLogs?.recovery || 85;
  const totalSteps = ecoStore.healthLogs?.steps || 6400;

  const calTarget = userProfile?.calTarget || 2000;
  const protTarget = userProfile?.protTarget || 120;
  const sleepTarget = 8;
  const recoveryTarget = 100;
  const stepsTarget = 10000;
  const waterTarget = 3000;

  const metrics = [
    { label: "Calories", value: `${totalCal} kcal`, progress: Math.min(1, Math.max(0, totalCal / calTarget)), color: "#b5f23d" },
    { label: "Protein", value: `${Math.round(totalProt)}g`, progress: Math.min(1, Math.max(0, totalProt / protTarget)), color: "#ff8c00" },
    { label: "Sleep", value: `${sleepHours} hrs`, progress: Math.min(1, Math.max(0, sleepHours / sleepTarget)), color: "#4fc3f7" },
    { label: "Recovery", value: `${recoveryScore}%`, progress: Math.min(1, Math.max(0, recoveryScore / recoveryTarget)), color: "#ef5350" },
    { label: "Steps", value: `${totalSteps}`, progress: Math.min(1, Math.max(0, totalSteps / stepsTarget)), color: "#e040fb" },
    { label: "Hydration", value: `${waterIntake} ml`, progress: Math.min(1, Math.max(0, waterIntake / waterTarget)), color: "#29b6f6" }
  ];

  if (!mounted) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-surface/20 border border-card-border rounded-3xl animate-pulse">
        <span className="text-xs text-muted uppercase font-bold tracking-widest">Initializing Core...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <RadialHealthCore metrics={metrics} hasProAccess={hasProAccess} />
    </div>
  );
}
