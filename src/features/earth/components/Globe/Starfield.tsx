import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Seeded PRNG (Mulberry32) — deterministic, no side-effects         */
/* ------------------------------------------------------------------ */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface StarfieldProps {
  count?: number;
  radius?: number;
  opacity?: number;
  twinkle?: boolean;
}

/** Build all star attributes in a single deterministic pass. */
function buildStarBuffer(count: number, radius: number) {
  const rand = mulberry32(42);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    /* position — uniform on sphere */
    const u = rand();
    const v = rand();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radius * (0.95 + rand() * 0.1);
    const i3 = i * 3;

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    /* colour — white-dominant with blue / yellow / orange hues */
    const cv = rand() * 0.2;
    const ct = rand();
    let cr = 1;
    let cg = 1;
    let cb = 1;

    if (ct < 0.7) {
      cg = 1 - cv * 0.2;
      cb = 1 - cv * 0.2;
    } else if (ct < 0.85) {
      cr = 0.8 + cv * 0.2;
      cg = 0.8 + cv * 0.2;
      cb = 1;
    } else if (ct < 0.95) {
      cg = 0.9 + cv * 0.1;
      cb = 0.7 + cv * 0.2;
    } else {
      cg = 0.7 + cv * 0.2;
      cb = 0.4 + cv * 0.2;
    }

    colors[i3] = cr;
    colors[i3 + 1] = cg;
    colors[i3 + 2] = cb;
  }

  return { positions, colors };
}

const Starfield: React.FC<StarfieldProps> = ({
  count = 10000,
  radius = 100,
  opacity = 0.8,
  twinkle = true,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(
    () => buildStarBuffer(count, radius),
    [count, radius],
  );

  /* Frozen copy for twinkle animation baseline. */
  const originalPositions = useMemo(() => new Float32Array(positions), [positions]);

  /* Per-star twinkle phase & speed (seeded). */
  const { phases, speeds } = useMemo(() => {
    const rand = mulberry32(123);
    const p = new Float32Array(count);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i] = rand() * Math.PI * 2;
      s[i] = 0.15 + rand() * 0.35; // very slow
    }
    return { phases: p, speeds: s };
  }, [count]);

  /* Gentle position drift for twinkle / parallax feel. */
  useFrame(({ clock }) => {
    if (!pointsRef.current || !twinkle) return;

    const t = clock.getElapsedTime();
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const drift = Math.sin(t * speeds[i] + phases[i]) * 0.02;
      posArray[i3] = originalPositions[i3] + drift;
      posArray[i3 + 1] = originalPositions[i3 + 1] + drift * 0.5;
      posArray[i3 + 2] = originalPositions[i3 + 2];
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <PointMaterial
          transparent
          vertexColors
          size={0.8}
          sizeAttenuation
          depthWrite={false}
          opacity={opacity}
          toneMapped={false}
        />
      </Points>
    </group>
  );
};

export default Starfield;