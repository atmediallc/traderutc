/**
 * Starfield Component
 *
 * Renders a procedural starfield using Three.js Points.
 * Creates thousands of randomized star positions on a large sphere.
 */
'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as ThreePoints } from 'three';
import { useEarthStore } from '../stores/earth.store';

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** Generate deterministic positions on layered deep-space shells. */
function generateStarPositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = seededRandom(i + 11) * Math.PI * 2;
    const phi = Math.acos(2 * seededRandom(i + 29) - 1);
    const magnitude = seededRandom(i + 47);
    const r = radius * (0.72 + magnitude * 0.28);

    const idx = i * 3;
    positions[idx] = r * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[idx + 2] = r * Math.cos(phi);
  }

  return positions;
}

interface StarfieldProps {
  /** Number of stars to render */
  count?: number;
  /** Radius of the star sphere */
  radius?: number;
}

export function Starfield({ count = 14000, radius = 70 }: StarfieldProps) {
  const pointsRef = useRef<ThreePoints>(null);
  const dustRef = useRef<ThreePoints>(null);
  const starsVisible = useEarthStore((s) => s.starsVisible);

  const positions = useMemo(() => generateStarPositions(count, radius), [count, radius]);
  const dustPositions = useMemo(() => generateStarPositions(2400, radius * 0.86), [radius]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.00045;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y -= delta * 0.00018;
      dustRef.current.rotation.x += delta * 0.00008;
    }
  });

  if (!starsVisible) return null;

  return (
    <>
      <Points ref={dustRef} positions={dustPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#56719d"
          size={0.045}
          sizeAttenuation
          depthWrite={false}
          opacity={0.08}
        />
      </Points>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#f7fbff"
          size={0.013}
          sizeAttenuation
          depthWrite={false}
          opacity={0.86}
        />
      </Points>
    </>
  );
}
