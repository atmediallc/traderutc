/**
 * Starfield Component
 *
 * Renders a procedural starfield using Three.js Points.
 * Creates thousands of randomized star positions on a large sphere.
 */
'use client';

import { useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import { useEarthStore } from '../stores/earth.store';

/** Generate random positions on a sphere of given radius */
function generateStarPositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Uniform distribution on sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.95 + Math.random() * 0.05);

    const idx = i * 3;
    positions[idx] = r * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[idx + 2] = r * Math.cos(phi);
  }

  return positions;
}

/** Generate random star sizes for visual variety */
function generateStarSizes(count: number): Float32Array {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Most stars small, few stars large (power distribution)
    sizes[i] = Math.pow(Math.random(), 3) * 2.0 + 0.1;
  }
  return sizes;
}

interface StarfieldProps {
  /** Number of stars to render */
  count?: number;
  /** Radius of the star sphere */
  radius?: number;
}

export function Starfield({ count = 8000, radius = 50 }: StarfieldProps) {
  const starsVisible = useEarthStore((s) => s.starsVisible);

  const positions = useMemo(() => generateStarPositions(count, radius), [count, radius]);

  if (!starsVisible) return null;

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
}
