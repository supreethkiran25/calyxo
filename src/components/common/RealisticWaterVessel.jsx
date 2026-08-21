import React, { useRef, useEffect, useCallback } from 'react';

/**
 * RealisticWaterVessel
 * Ultra-realistic liquid physics simulation for Calyxo.
 * Features:
 * - Full 360° device orientation & physical gravity vector tracking
 * - Inertial slosh dynamics with 32-node spring-mass wave propagation
 * - Multilayer volumetric fluid shaders (deep refraction, caustic light rays, luminous meniscus)
 * - Buoyant micro-bubbles with sinusoidal wobble & surface popping ripples
 * - High-end frosted glass cylinder vessel with 3D specular highlights
 */
export default function RealisticWaterVessel({
  currentAmount = 0,
  targetAmount = 3000,
  width = 80,
  height = 160,
  className = '',
  interactive = true,
  onAddWater
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Target fill fraction (0.0 to 1.0)
  const targetPct = targetAmount > 0 ? Math.min(1.0, Math.max(0.0, currentAmount / targetAmount)) : 0.0;

  // Physics and rendering state
  const physicsRef = useRef({
    currentLevel: targetPct,
    tilt: 0, // current smoothed tilt angle in radians
    targetTilt: 0, // gravity target tilt angle
    prevTilt: 0,
    angularVelocity: 0,
    nodes: [], // 32 spring nodes for wave dynamics
    nodeCount: 32,
    springK: 0.038, // spring constant
    damping: 0.040, // dampening factor
    spread: 0.24, // neighbor wave propagation
    bubbles: [],
    causticPhase: 0,
    animId: null,
    lastTime: 0,
    prevAmount: currentAmount,
    hasMotionPermission: false
  });

  // Initialize spring nodes and micro-bubbles
  useEffect(() => {
    const p = physicsRef.current;
    p.nodes = [];
    for (let i = 0; i < p.nodeCount; i++) {
      p.nodes.push({ y: 0, speed: 0 });
    }

    p.bubbles = [];
    for (let i = 0; i < 14; i++) {
      p.bubbles.push({
        x: Math.random() * (width - 16) + 8,
        y: Math.random() * (height * 0.8) + height * 0.18,
        r: Math.random() * 1.6 + 0.8,
        speedY: Math.random() * 0.45 + 0.35,
        wobbleSpeed: Math.random() * 2.5 + 1.2,
        wobbleAmp: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.45 + 0.3,
        seed: Math.random() * 100
      });
    }
  }, [width, height]);

  // Create surface wave disturbance
  const createSplash = useCallback((nodeIndex, force) => {
    const p = physicsRef.current;
    if (nodeIndex >= 0 && nodeIndex < p.nodes.length) {
      p.nodes[nodeIndex].speed += force;
    }
  }, []);

  // Detect water logs and inject fluid impulses + micro-bubbles
  useEffect(() => {
    const p = physicsRef.current;
    if (currentAmount > p.prevAmount) {
      const mid = Math.floor(p.nodeCount / 2);
      createSplash(mid, 22);
      createSplash(mid - 1, 15);
      createSplash(mid + 1, 15);
      createSplash(mid - 2, 8);
      createSplash(mid + 2, 8);

      // Inject fresh stream of bubbles
      for (let i = 0; i < 5; i++) {
        p.bubbles.push({
          x: width / 2 + (Math.random() - 0.5) * 20,
          y: height - 15 - Math.random() * 20,
          r: Math.random() * 1.8 + 1.0,
          speedY: Math.random() * 0.7 + 0.5,
          wobbleSpeed: Math.random() * 3 + 1.5,
          wobbleAmp: Math.random() * 2 + 1,
          opacity: 0.6,
          seed: Math.random() * 100
        });
      }
    }
    p.prevAmount = currentAmount;
  }, [currentAmount, createSplash, width, height]);

  // Physical Gravity & Gyroscope Alignment
  useEffect(() => {
    const handleOrientation = (e) => {
      const p = physicsRef.current;
      // gamma: left-to-right tilt [-90, 90]
      // beta: front-to-back tilt [-180, 180]
      if (typeof e.gamma === 'number' && e.gamma !== null) {
        p.hasMotionPermission = true;

        // Calculate gravity orientation vector in 2D container space
        const gamma = e.gamma; // deg
        const beta = typeof e.beta === 'number' ? e.beta : 45;

        // Effective roll angle in radians with natural gravity alignment
        // Negated to match screen coordinates (where y=0 is top): tilting device right (positive gamma)
        // pools liquid towards the lower right edge so the water surface stays horizontal with gravity.
        const clampedGamma = Math.max(-65, Math.min(65, gamma));
        const gravityAngle = -(clampedGamma * Math.PI) / 180;

        p.targetTilt = gravityAngle * 0.92;
      }
    };

    // iOS 13+ permission flow
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const requestPerm = async () => {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (e) {}
      };
      window.addEventListener('click', requestPerm, { once: true });
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Mouse movement parallax fallback for desktop browser testing
    const handleMouseMove = (e) => {
      const p = physicsRef.current;
      if (!p.hasMotionPermission && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
        p.targetTilt = Math.max(-0.4, Math.min(0.4, -deltaX * 0.45));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Main High-Precision Fluid Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let running = true;

    const render = (time) => {
      if (!running) return;

      const p = physicsRef.current;
      const dt = Math.min(32, time - (p.lastTime || time)) / 1000;
      p.lastTime = time;
      p.causticPhase += dt * 1.5;

      // 1. Smoothly interpolate fill level
      p.currentLevel += (targetPct - p.currentLevel) * 0.07;

      // 2. Compute angular velocity & slosh inertial impulses
      p.prevTilt = p.tilt;
      p.tilt += (p.targetTilt - p.tilt) * 0.14;
      p.angularVelocity = (p.tilt - p.prevTilt) / (dt || 0.016);

      // Inject slosh wave impulse based on angular acceleration
      if (Math.abs(p.angularVelocity) > 0.05) {
        const half = p.nodeCount / 2;
        for (let i = 0; i < p.nodeCount; i++) {
          const distFromCenter = (i - half) / half;
          p.nodes[i].speed += distFromCenter * p.angularVelocity * 0.35;
        }
      }

      // 3. Update Spring-Mass wave nodes (Hooke's Law: F = -k*y - d*v)
      for (let i = 0; i < p.nodeCount; i++) {
        const node = p.nodes[i];
        const force = -p.springK * node.y - p.damping * node.speed;
        node.speed += force;
        node.y += node.speed;
      }

      // Multi-pass wave propagation across neighboring spring nodes
      const leftDeltas = new Array(p.nodeCount).fill(0);
      const rightDeltas = new Array(p.nodeCount).fill(0);

      for (let pass = 0; pass < 4; pass++) {
        for (let i = 0; i < p.nodeCount; i++) {
          if (i > 0) {
            leftDeltas[i] = p.spread * (p.nodes[i].y - p.nodes[i - 1].y);
            p.nodes[i - 1].speed += leftDeltas[i];
          }
          if (i < p.nodeCount - 1) {
            rightDeltas[i] = p.spread * (p.nodes[i].y - p.nodes[i + 1].y);
            p.nodes[i + 1].speed += rightDeltas[i];
          }
        }
        for (let i = 0; i < p.nodeCount; i++) {
          if (i > 0) p.nodes[i - 1].y += leftDeltas[i];
          if (i < p.nodeCount - 1) p.nodes[i + 1].y += rightDeltas[i];
        }
      }

      // 4. Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 5. Draw Glass Cylinder Container Clip & Base Shading
      const cornerRadius = Math.min(width * 0.32, 26);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, cornerRadius);
      ctx.clip();

      // Deep vessel back wall (OLED Dark Glass)
      const vesselGrad = ctx.createLinearGradient(0, 0, width, height);
      vesselGrad.addColorStop(0, '#040711');
      vesselGrad.addColorStop(0.5, '#060B18');
      vesselGrad.addColorStop(1, '#02040A');
      ctx.fillStyle = vesselGrad;
      ctx.fillRect(0, 0, width, height);

      // Inner Ambient Glass Light
      const glassVolGrad = ctx.createRadialGradient(width * 0.5, height * 0.3, 5, width * 0.5, height * 0.5, width * 0.8);
      glassVolGrad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      glassVolGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.04)');
      glassVolGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = glassVolGrad;
      ctx.fillRect(0, 0, width, height);

      // Measurement Ticks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach(t => {
        const tickY = height * (1 - t);
        ctx.beginPath();
        ctx.moveTo(8, tickY);
        ctx.lineTo(16, tickY);
        ctx.moveTo(width - 16, tickY);
        ctx.lineTo(width - 8, tickY);
        ctx.stroke();
      });

      // 6. Draw Volumetric Liquid Body (if water logged)
      if (p.currentLevel > 0.01) {
        const baseWaterY = height * (1 - p.currentLevel);
        const segmentWidth = width / (p.nodeCount - 1);
        const halfWidth = width / 2;

        // Calculate wave vertices with true gravity angle
        const wavePoints = [];
        for (let i = 0; i < p.nodeCount; i++) {
          const x = i * segmentWidth;
          const tiltOffset = (x - halfWidth) * Math.tan(p.tilt);
          const y = Math.max(4, Math.min(height + 2, baseWaterY + p.nodes[i].y + tiltOffset));
          wavePoints.push({ x, y });
        }

        // ── Secondary Background Liquid Layer (Optical Refraction Depth) ──
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, wavePoints[0].y + 6);
        for (let i = 0; i < p.nodeCount - 1; i++) {
          const curr = wavePoints[i];
          const next = wavePoints[i + 1];
          const cx = (curr.x + next.x) / 2;
          const cy = (curr.y + next.y) / 2 + Math.sin(time * 0.0035 + i * 0.4) * 3 + 6;
          ctx.quadraticCurveTo(curr.x, curr.y + 6, cx, cy);
        }
        ctx.lineTo(width, wavePoints[p.nodeCount - 1].y + 6);
        ctx.lineTo(width, height);
        ctx.closePath();

        const deepOceanGrad = ctx.createLinearGradient(0, baseWaterY, 0, height);
        deepOceanGrad.addColorStop(0, '#0369a1'); // ocean blue
        deepOceanGrad.addColorStop(0.6, '#0284c7');
        deepOceanGrad.addColorStop(1, '#075985');
        ctx.fillStyle = deepOceanGrad;
        ctx.fill();
        ctx.restore();

        // ── Primary Translucent Liquid Foreground ──
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, wavePoints[0].y);
        for (let i = 0; i < p.nodeCount - 1; i++) {
          const curr = wavePoints[i];
          const next = wavePoints[i + 1];
          const cx = (curr.x + next.x) / 2;
          const cy = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, cx, cy);
        }
        ctx.lineTo(width, wavePoints[p.nodeCount - 1].y);
        ctx.lineTo(width, height);
        ctx.closePath();

        // Photorealistic Aqua Gradient
        const waterGrad = ctx.createLinearGradient(0, baseWaterY - 10, 0, height);
        waterGrad.addColorStop(0, '#38bdf8'); // sky surface
        waterGrad.addColorStop(0.15, '#06b6d4'); // cyan
        waterGrad.addColorStop(0.55, '#0284c7'); // blue
        waterGrad.addColorStop(0.9, '#1d4ed8'); // royal blue
        waterGrad.addColorStop(1.0, '#1e3a8a'); // deep base
        ctx.fillStyle = waterGrad;
        ctx.fill();

        // ── Caustic Light Rays Dancing Through Fluid ──
        ctx.save();
        ctx.clip(); // clip to liquid
        const causticGrad = ctx.createLinearGradient(
          Math.sin(p.causticPhase) * 20,
          baseWaterY,
          width + Math.cos(p.causticPhase) * 20,
          height
        );
        causticGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        causticGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.05)');
        causticGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.12)');
        causticGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
        ctx.fillStyle = causticGrad;
        ctx.fillRect(0, baseWaterY, width, height - baseWaterY);
        ctx.restore();

        // ── Luminous Meniscus Surface Sheen (3D Surface Highlight) ──
        ctx.beginPath();
        ctx.moveTo(0, wavePoints[0].y);
        for (let i = 0; i < p.nodeCount - 1; i++) {
          const curr = wavePoints[i];
          const next = wavePoints[i + 1];
          const cx = (curr.x + next.x) / 2;
          const cy = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, cx, cy);
        }
        ctx.lineTo(width, wavePoints[p.nodeCount - 1].y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2.8;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // ── Rising Micro-Bubbles with Buoyancy & Surface Popping ──
        ctx.save();
        p.bubbles.forEach((b) => {
          b.y -= b.speedY;

          // Bubble pops at surface
          if (b.y < baseWaterY + 4) {
            // Trigger micro surface ripple
            const nodeIdx = Math.max(0, Math.min(p.nodeCount - 1, Math.floor((b.x / width) * p.nodeCount)));
            p.nodes[nodeIdx].speed -= 1.2;

            // Reset bubble to bottom
            b.y = height - 6 - Math.random() * 12;
            b.x = Math.random() * (width - 16) + 8;
          }

          const wobbleX = b.x + Math.sin(time * 0.004 * b.wobbleSpeed + b.seed) * b.wobbleAmp;

          // Bubble sphere with internal highlight
          ctx.beginPath();
          ctx.arc(wobbleX, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
          ctx.fill();

          // Bubble specular point
          ctx.beginPath();
          ctx.arc(wobbleX - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        });
        ctx.restore();
      }

      // 7. Glass Specular Highlights (Left vertical gleam & right rim)
      const leftGloss = ctx.createLinearGradient(4, 0, 12, 0);
      leftGloss.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      leftGloss.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      leftGloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = leftGloss;
      ctx.fillRect(4, 6, 8, height - 12);

      const rightGloss = ctx.createLinearGradient(width - 10, 0, width - 4, 0);
      rightGloss.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rightGloss.addColorStop(1, 'rgba(255, 255, 255, 0.28)');
      ctx.fillStyle = rightGloss;
      ctx.fillRect(width - 10, 8, 6, height * 0.7);

      ctx.restore(); // Restore from clipping

      // 8. Outer Glass Border & Soft Neon Rim Glow
      ctx.beginPath();
      ctx.roundRect(0.5, 0.5, width - 1, height - 1, cornerRadius);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.35)';
      ctx.shadowBlur = 12;
      ctx.stroke();

      p.animId = requestAnimationFrame(render);
    };

    physicsRef.current.animId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (physicsRef.current.animId) {
          cancelAnimationFrame(physicsRef.current.animId);
          physicsRef.current.animId = null;
        }
      } else if (running && !physicsRef.current.animId) {
        physicsRef.current.lastTime = performance.now();
        physicsRef.current.animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      running = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (physicsRef.current.animId) {
        cancelAnimationFrame(physicsRef.current.animId);
      }
    };
  }, [width, height, targetPct]);

  // Click/Tap Ripple Interaction
  const handleVesselClick = (e) => {
    if (!interactive) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const p = physicsRef.current;
    const nodeIdx = Math.max(0, Math.min(p.nodeCount - 1, Math.floor((clickX / width) * p.nodeCount)));
    createSplash(nodeIdx, 18);
    if (nodeIdx > 0) createSplash(nodeIdx - 1, 10);
    if (nodeIdx < p.nodeCount - 1) createSplash(nodeIdx + 1, 10);

    if (onAddWater) {
      onAddWater(250);
    }
  };

  const displayPct = Math.round(targetPct * 100);

  return (
    <div
      ref={containerRef}
      onClick={handleVesselClick}
      className={`relative select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{ width, height }}
      title={interactive ? "Rotate phone to tilt water • Tap to ripple" : undefined}
    >
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="block rounded-3xl"
      />

      {/* Percentage Center Readout */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-cyan-400/30 text-white font-black text-xs sm:text-sm tracking-tight shadow-lg">
          {displayPct}%
        </div>
      </div>
    </div>
  );
}
