import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── 1. Floating Concentric Biometric Rings ──
function BiometricRings({ mousePosition }) {
  const groupRef = useRef();
  const ring1Ref = useRef(); // Nutrition (Amber)
  const ring2Ref = useRef(); // Movement (Acid Green)
  const ring3Ref = useRef(); // Hydration (Cyan)
  const ring4Ref = useRef(); // Recovery (Crimson)
  const coreRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth subtle parallax rotation driven by cursor
    const targetRotX = (mousePosition.y * 0.3) + (state.clock.elapsedTime * 0.05);
    const targetRotY = (mousePosition.x * 0.4) + (state.clock.elapsedTime * 0.08);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);

    // Dynamic counter-rotations for rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.4;
      ring1Ref.current.rotation.x += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.35;
      ring2Ref.current.rotation.y += delta * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.3;
      ring3Ref.current.rotation.z += delta * 0.15;
    }
    if (ring4Ref.current) {
      ring4Ref.current.rotation.y -= delta * 0.28;
      ring4Ref.current.rotation.z -= delta * 0.22;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.06;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Neural AI Core */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.75, 48, 48]} />
          <MeshDistortMaterial
            color="#10B981"
            emissive="#059669"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.85}
            distort={0.35}
            speed={2}
          />
        </mesh>
      </Float>

      {/* Ring 1: Nutrition (Amber Glow) */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.35, 0.035, 24, 100]} />
        <meshStandardMaterial
          color="#F59E0B"
          emissive="#D97706"
          emissiveIntensity={0.9}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Ring 2: Movement (Acid Green Glow) */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.75, 0.04, 24, 100]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#059669"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Ring 3: Hydration (Cyan Telemetry Glow) */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <torusGeometry args={[2.15, 0.035, 24, 100]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00B4D8"
          emissiveIntensity={1.0}
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      {/* Ring 4: Recovery (Crimson Vitality Glow) */}
      <mesh ref={ring4Ref} rotation={[-Math.PI / 5, -Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[2.55, 0.03, 24, 100]} />
        <meshStandardMaterial
          color="#EF4444"
          emissive="#DC2626"
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

// ── 2. Floating Biometric Particle Cloud ──
function ParticleCloud({ count = 280 }) {
  const points = useMemo(() => {
    const coords = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#10B981'), // Green
      new THREE.Color('#00F0FF'), // Cyan
      new THREE.Color('#F59E0B'), // Amber
      new THREE.Color('#38BDF8')  // Sky
    ];

    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 3.8;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      coords[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      coords[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      coords[i * 3 + 2] = radius * Math.cos(theta);

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { coords, colors };
  }, [count]);

  const pointsRef = useRef();

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x -= delta * 0.015;
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
        size={0.045}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── 3. Main 3D Canvas Coordinator with Graceful Fallback ──
export default function Hero3DCanvas() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!hasWebGL) {
    // Elegant 2D Fallback if WebGL is disabled or unavailable
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-amber-500/20 blur-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#10B981" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#00F0FF" />
        <pointLight position={[0, 8, -5]} intensity={1} color="#F59E0B" />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />

        <BiometricRings mousePosition={mousePosition} />
        <ParticleCloud count={220} />
      </Canvas>
    </div>
  );
}
