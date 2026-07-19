/**
 * useEarthRotation Hook
 *
 * Computes the Earth's Y-axis rotation in radians from the current UTC time.
 * Updates every animation frame for smooth, astronomically-accurate rotation.
 */
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { earthEngine } from '@/engines';
import { useUTCStore } from '@/features/utc/stores/utc.store';

/**
 * Applies real-time astronomical rotation to a Three.js mesh ref.
 *
 * @param meshRef - React ref to the Earth mesh
 */
export function useEarthRotation(meshRef: React.RefObject<Mesh | null>): void {
  useFrame(() => {
    if (meshRef.current) {
      const utcMs = useUTCStore.getState().utcMs;
      meshRef.current.rotation.y = earthEngine.getRotationAngleY(utcMs);
    }
  });
}

/**
 * Returns the current Earth rotation angle in radians.
 * Useful for shader uniforms or other calculations.
 */
export function useEarthRotationAngle(): React.RefObject<number> {
  const angleRef = useRef(earthEngine.getRotationAngleY(useUTCStore.getState().utcMs));

  useFrame(() => {
    angleRef.current = earthEngine.getRotationAngleY(useUTCStore.getState().utcMs);
  });

  return angleRef;
}
