import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Subtle Atmospheric Micro-Particles ──
function AmbientDustParticles({ count = 80 }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor = new THREE.Color('#44444c');
    const subtleAccent = new THREE.Color('#CCFF00');

    for (let i = 0; i < count; i++) {
      const radius = 3.0 + Math.random() * 5.0;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      coords[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      coords[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      coords[i * 3 + 2] = radius * Math.cos(theta);

      const col = Math.random() > 0.92 ? subtleAccent : baseColor;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { coords, colors };
  }, [count]);

  const pointsRef = useRef();

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008;
      pointsRef.current.rotation.x -= delta * 0.004;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.coords.length / 3}
          array={points.coords}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={points.colors.length / 3}
          array={points.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── Master 3D Viewport (Clean Stage ready for User 3D Model) ──
export default function Cinematic3DCore({ className = "" }) {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) return null;

  return (
    <div className={`w-full h-full absolute inset-0 pointer-events-none ${className}`}>
      {/* Soft Ambient Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-white/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />
        <AmbientDustParticles count={60} />
      </Canvas>
    </div>
  );
}
