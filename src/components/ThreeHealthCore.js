"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';

// Dynamic import helpers to avoid SSR errors
let Canvas = null;
let useFrame = null;
let OrbitControls = null;
let Sphere = null;
let Html = null;

try {
  const r3f = require('@react-three/fiber');
  const drei = require('@react-three/drei');
  Canvas = r3f.Canvas;
  useFrame = r3f.useFrame;
  OrbitControls = drei.OrbitControls;
  Sphere = drei.Sphere;
  Html = drei.Html;
} catch (e) {
  console.warn("WebGL React Three Fiber not available. Using premium 2D fallback.", e);
}

// ── 3D Scene Component ──
function HealthCoreScene({ metrics }) {
  const orbRef = useRef();
  
  // Custom frame animation hook
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (orbRef.current) {
      orbRef.current.rotation.y = elapsed * 0.4;
      orbRef.current.rotation.x = Math.sin(elapsed * 0.25) * 0.2;
      const scale = 1.0 + Math.sin(elapsed * 2.0) * 0.04;
      orbRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#b5f23d" />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#059669" />

      {/* Futuristic Center Health Core Orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color="#b5f23d" 
          roughness={0.1} 
          metalness={0.9} 
          wireframe={true}
          emissive="#4c7a00"
          emissiveIntensity={0.6}
        />
        
        {/* Inner solid glowing sphere */}
        <mesh scale={[0.85, 0.85, 0.85]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial 
            color="#059669" 
            roughness={0.2} 
            metalness={0.5} 
            transparent={true} 
            opacity={0.7} 
          />
        </mesh>
      </mesh>

      {/* Orbiting Metrics */}
      {metrics.map((m, idx) => {
        const angle = (idx / metrics.length) * Math.PI * 2;
        const radius = 3.6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <OrbitingNode 
            key={m.label} 
            initialPos={[x, Math.sin(angle * 2) * 0.8, z]} 
            metric={m} 
            angleOffset={angle}
          />
        );
      })}

      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </>
  );
}

function OrbitingNode({ initialPos, metric, angleOffset }) {
  const nodeRef = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (nodeRef.current) {
      // Gentle orbit variation
      const angle = elapsed * 0.15 + angleOffset;
      const radius = 3.6;
      nodeRef.current.position.x = Math.cos(angle) * radius;
      nodeRef.current.position.z = Math.sin(angle) * radius;
      nodeRef.current.position.y = Math.sin(elapsed * 1.5 + angleOffset) * 0.4;
    }
  });

  return (
    <group ref={nodeRef} position={initialPos}>
      {/* Node Sphere */}
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={metric.color} roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* HTML Label */}
      <Html distanceFactor={8} position={[0, 0.4, 0]} center>
        <div className="bg-black/85 border border-card-border px-2.5 py-1.5 rounded-xl text-[9px] font-black tracking-wider uppercase text-foreground whitespace-nowrap shadow-md flex items-center gap-1.5">
          <span style={{ color: metric.color }}>●</span>
          <span>{metric.label}: {metric.value}</span>
        </div>
      </Html>
    </group>
  );
}

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
  const enable3D = userProfile?.appearance?.enable3DExperience !== false && hasProAccess;

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

  // If 3D is active and required libraries loaded successfully, render the R3F Canvas
  if (enable3D && Canvas && useFrame && OrbitControls && Sphere && Html) {
    return (
      <div className="w-full h-[400px] relative bg-surface/10 border border-card-border rounded-3xl overflow-hidden shadow-lg">
        {/* Canvas container */}
        <Canvas camera={{ position: [0, 0, 8.5], fov: 60 }}>
          <HealthCoreScene metrics={metrics} />
        </Canvas>

        {/* 3D Active Indicator Badge */}
        <div className="absolute bottom-4 left-4 bg-black/60 border border-card-border px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider text-acid-green z-10">
          3D GRAPHICS ACTIVE
        </div>
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
