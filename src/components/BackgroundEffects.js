"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';

export default function BackgroundEffects({ activeTab }) {
  const userProfile = useStore(state => state.userProfile);
  const theme = useStore(state => state.theme);
  
  const appearance = userProfile?.appearance || {
    bgEffectsEnabled: false,
    bgStyle: 'minimal',
    animationIntensity: 'medium',
    performanceMode: 'auto',
    reduceMotion: false
  };

  const { bgEffectsEnabled, bgStyle, animationIntensity, performanceMode, reduceMotion } = appearance;

  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isBatteryLow, setIsBatteryLow] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // 1. Detect environment details (Mobile/Battery/Motion Prefs)
  useEffect(() => {
    // Detect mobile screens
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);

    // Detect system reduced motion preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(motionQuery.matches);
    const motionListener = (e) => setSystemReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionListener);

    // Detect Battery Status (auto battery saver mode)
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      navigator.getBattery().then(battery => {
        const checkBattery = () => {
          // Trigger battery saver if below 20% and discharging
          setIsBatteryLow(battery.level < 0.2 && !battery.charging);
        };
        checkBattery();
        battery.addEventListener('levelchange', checkBattery);
        battery.addEventListener('chargingchange', checkBattery);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('resize', checkViewport);
      motionQuery.removeEventListener('change', motionListener);
    };
  }, []);

  // 2. Track mouse coordinates for interactive particle/mesh effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Determine if animations should run
  const shouldAnimate = 
    bgEffectsEnabled && 
    bgStyle !== 'minimal' && 
    animationIntensity !== 'off' && 
    performanceMode !== 'battery' && 
    !isBatteryLow && 
    !reduceMotion && 
    !systemReducedMotion;

  // Determine particle/animation speed multipliers based on settings
  const getSpeedMultiplier = () => {
    if (!shouldAnimate) return 0;
    switch (animationIntensity) {
      case 'low': return 0.35;
      case 'high': return 1.5;
      case 'medium':
      default: return 0.85;
    }
  };

  // 3. Canvas animation loops for Particles and 3D Mesh
  useEffect(() => {
    if (!bgEffectsEnabled || bgStyle === 'minimal' || bgStyle === 'orbs' || bgStyle === 'aurora' || bgStyle === 'glass') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = (canvas.width = window.innerWidth);
      height = (canvas.height = window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const speedMult = getSpeedMultiplier();

    // Setup style 3: Fitness Particles
    let particles = [];
    const particleCount = isMobile ? 20 : 50;

    if (bgStyle === 'particles') {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.8 * speedMult,
          vy: (Math.random() - 0.5) * 0.8 * speedMult,
          size: Math.random() * 2 + 1,
          color: theme === 'dark' ? 'rgba(163, 230, 53, 0.25)' : 'rgba(101, 163, 13, 0.2)' // neon-green
        });
      }
    }

    // Setup style 4: 3D Fitness Mesh (sine wave wireframe projections)
    let gridCols = isMobile ? 12 : 24;
    let gridRows = isMobile ? 10 : 20;
    let time = 0;

    // Core Canvas Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const activeSpeed = getSpeedMultiplier();

      if (bgStyle === 'particles') {
        // Render drifts & mouse interaction
        particles.forEach(p => {
          if (activeSpeed > 0) {
            p.x += p.vx * (activeSpeed / 0.85);
            p.y += p.vy * (activeSpeed / 0.85);

            // Wrap bounds
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Mouse repulsion
            const m = mouseRef.current;
            const dx = p.x - m.x;
            const dy = p.y - m.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const force = (120 - dist) / 120;
              p.x += (dx / dist) * force * 3;
              p.y += (dy / dist) * force * 3;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });

        // Draw web lines
        ctx.strokeStyle = theme === 'dark' ? 'rgba(163, 230, 53, 0.04)' : 'rgba(101, 163, 13, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      } 
      else if (bgStyle === 'mesh') {
        // 3D Isometric mesh projection
        time += 0.01 * (activeSpeed > 0 ? activeSpeed : 0.2);
        
        ctx.strokeStyle = theme === 'dark' ? 'rgba(163, 230, 53, 0.05)' : 'rgba(101, 163, 13, 0.04)';
        ctx.lineWidth = 1.2;

        const cellW = width / (gridCols - 1);
        const cellH = height / (gridRows - 1);

        // Project 3D points
        const points = [];
        for (let r = 0; r < gridRows; r++) {
          points[r] = [];
          for (let c = 0; c < gridCols; c++) {
            // Base X, Y
            const x = c * cellW;
            const y = r * cellH;

            // Compute Z (wave height)
            const m = mouseRef.current;
            const distToMouse = Math.sqrt((x - m.x) * (x - m.x) + (y - m.y) * (y - m.y));
            const mouseInteraction = distToMouse < 250 ? Math.sin((250 - distToMouse) / 30) * 25 : 0;
            
            const z = Math.sin(c * 0.45 + time) * Math.cos(r * 0.45 + time) * 18 + mouseInteraction;

            // Isometric projection formulas
            const projX = x + z * 0.2;
            const projY = y + z * 0.4;

            points[r][c] = { x: projX, y: projY };
          }
        }

        // Draw horizontal grid lines
        for (let r = 0; r < gridRows; r++) {
          ctx.beginPath();
          for (let c = 0; c < gridCols; c++) {
            if (c === 0) ctx.moveTo(points[r][c].x, points[r][c].y);
            else ctx.lineTo(points[r][c].x, points[r][c].y);
          }
          ctx.stroke();
        }

        // Draw vertical grid lines
        for (let c = 0; c < gridCols; c++) {
          ctx.beginPath();
          for (let r = 0; r < gridRows; r++) {
            if (r === 0) ctx.moveTo(points[r][c].x, points[r][c].y);
            else ctx.lineTo(points[r][c].x, points[r][c].y);
          }
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [bgEffectsEnabled, bgStyle, isMobile, theme, animationIntensity, performanceMode, reduceMotion, systemReducedMotion]);

  // If effects are disabled, completely remove components
  if (!bgEffectsEnabled || bgStyle === 'minimal') {
    return null;
  }

  // Set style animation duration based on intensity
  const getIntensityDuration = (baseSeconds) => {
    switch (animationIntensity) {
      case 'low': return `${baseSeconds * 2.5}s`;
      case 'high': return `${baseSeconds * 0.6}s`;
      case 'medium':
      default: return `${baseSeconds}s`;
    }
  };

  // Build specific CSS animation variables
  const isAnimationOff = animationIntensity === 'off' || reduceMotion || systemReducedMotion;
  const pulseStyle = {
    animationDuration: getIntensityDuration(6),
    animationPlayState: isAnimationOff ? 'paused' : 'running'
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* 1. Floating Gradient Orbs Mode */}
      {bgStyle === 'orbs' && (
        <div className="absolute inset-0 w-full h-full opacity-35 dark:opacity-[0.22] blur-[100px] transition-opacity duration-700">
          <div 
            className="absolute w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full bg-acid-green/20 -top-20 -left-20 animate-float"
            style={{ 
              animationDuration: getIntensityDuration(25),
              animationPlayState: isAnimationOff ? 'paused' : 'running'
            }}
          />
          <div 
            className="absolute w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full bg-violet-600/10 bottom-20 -right-10 animate-float-delayed"
            style={{ 
              animationDuration: getIntensityDuration(30),
              animationPlayState: isAnimationOff ? 'paused' : 'running'
            }}
          />
          <div 
            className="absolute w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] rounded-full bg-sky-500/10 top-1/3 left-1/3 animate-float"
            style={{ 
              animationDuration: getIntensityDuration(28),
              animationPlayState: isAnimationOff ? 'paused' : 'running'
            }}
          />
        </div>
      )}

      {/* 2. Aurora Background Mode */}
      {bgStyle === 'aurora' && (
        <div className="absolute inset-0 w-full h-full opacity-[0.25] dark:opacity-[0.14] transition-opacity duration-700">
          <div 
            className="absolute inset-0 w-full h-full bg-gradient-to-tr from-acid-green/10 via-transparent to-violet-600/10 animate-pulse"
            style={pulseStyle}
          />
          <div 
            className="absolute inset-0 w-full h-full bg-gradient-to-bl from-transparent via-cyan-500/5 to-emerald-500/5 animate-pulse-delayed"
            style={{
              animationDuration: getIntensityDuration(8),
              animationPlayState: isAnimationOff ? 'paused' : 'running'
            }}
          />
        </div>
      )}

      {/* 3. Glass Motion Background Mode */}
      {bgStyle === 'glass' && (
        <div className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20 transition-opacity duration-700">
          <div 
            className="absolute w-40 h-40 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm top-1/4 left-1/12 animate-float"
            style={{ 
              animationDuration: getIntensityDuration(24),
              animationPlayState: isAnimationOff ? 'paused' : 'running'
            }}
          />
          <div 
            className="absolute w-24 h-24 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm bottom-1/4 right-1/10 animate-float-delayed"
            style={{ 
              animationDuration: getIntensityDuration(28),
              animationPlayState: isAnimationOff ? 'paused' : 'running'
            }}
          />
          <div 
            className="absolute w-32 h-32 rotate-45 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm top-2/3 left-2/3 animate-float"
            style={{ 
              animationDuration: getIntensityDuration(32),
              animationPlayState: isAnimationOff ? 'paused' : 'running'
            }}
          />
        </div>
      )}

      {/* 4. Canvas for Particles (dots) and 3D Mesh (wireframe grid) */}
      {(bgStyle === 'particles' || bgStyle === 'mesh') && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full opacity-80 dark:opacity-[0.65] transition-opacity duration-500" 
        />
      )}

      {/* 5. AI Coach Special Overlay Effect (soft ambient green pulse at bottom/center) */}
      {activeTab === 'coach' && (
        <div className="absolute inset-x-0 bottom-0 h-2/3 w-full bg-gradient-to-t from-acid-green/10 dark:from-acid-green/[0.06] to-transparent pointer-events-none z-[1] opacity-75 animate-pulse duration-10000" />
      )}

      {/* Readability & Contrast Shield Overlay */}
      {/* Light mode: extra white tint to wash out backgrounds; Dark mode: extra black tint */}
      <div 
        className="absolute inset-0 w-full h-full transition-colors duration-500 z-[2]"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(to bottom, rgba(13,13,13,0.1) 0%, rgba(13,13,13,0.3) 100%)'
            : 'linear-gradient(to bottom, rgba(250,250,250,0.1) 0%, rgba(250,250,250,0.3) 100%)',
          backdropFilter: 'none',
        }}
      />
    </div>
  );
}
