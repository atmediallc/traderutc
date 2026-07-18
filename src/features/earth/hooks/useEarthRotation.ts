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
import { getEarthRotationY } from '../services/earth-rotation.service';

/**
 * Applies real-time astronomical rotation to a Three.js mesh ref.
 *
 * @param meshRef - React ref to the Earth mesh
 */
export function useEarthRotation(meshRef: React.RefObject<Mesh | null>): void {
  useFrame(() => {
    if (meshRef.current) {
      const utcMs = Date.now();
      meshRef.current.rotation.y = getEarthRotationY(utcMs);
    }
  });
}

/**
 * Returns the current Earth rotation angle in radians.
 * Useful for shader uniforms or other calculations.
 */
export function useEarthRotationAngle(): React.RefObject<number> {
  const angleRef = useRef(getEarthRotationY(Date.now()));

  useFrame(() => {
    angleRef.current = getEarthRotationY(Date.now());
  });

  return angleRef;
}
