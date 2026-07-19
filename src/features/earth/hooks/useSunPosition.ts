/**
 * useSunPosition Hook
 *
 * Computes the Sun's direction vector in real-time for lighting
 * and shader uniforms. Updates every animation frame.
 */
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { astronomicalEngine } from '@/engines';
import { useUTCStore } from '@/features/utc/stores/utc.store';

/**
 * Returns a ref to a Vector3 representing the Sun's direction,
 * updated every frame.
 */
export function useSunPosition(): React.RefObject<Vector3> {
  const sunDirRef = useRef<Vector3>(new Vector3(...astronomicalEngine.getSolarPosition(useUTCStore.getState().utcMs).direction));

  useFrame(() => {
    const dir = astronomicalEngine.getSolarPosition(useUTCStore.getState().utcMs).direction;
    sunDirRef.current.set(dir[0], dir[1], dir[2]);
  });

  return sunDirRef;
}

/**
 * Returns the Sun's direction as a tuple, updated every frame.
 */
export function useSunDirectionTuple(): React.RefObject<[number, number, number]> {
  const dirRef = useRef<[number, number, number]>(astronomicalEngine.getSolarPosition(useUTCStore.getState().utcMs).direction);

  useFrame(() => {
    dirRef.current = astronomicalEngine.getSolarPosition(useUTCStore.getState().utcMs).direction;
  });

  return dirRef;
}
