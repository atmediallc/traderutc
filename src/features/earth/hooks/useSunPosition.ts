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

/**
 * Returns a ref to a Vector3 representing the Sun's direction,
 * updated every frame.
 */
export function useSunPosition(): React.RefObject<Vector3> {
  const sunDirRef = useRef<Vector3>(new Vector3(...astronomicalEngine.getSolarPosition(Date.now()).direction));

  useFrame(() => {
    const dir = astronomicalEngine.getSolarPosition(Date.now()).direction;
    sunDirRef.current.set(dir[0], dir[1], dir[2]);
  });

  return sunDirRef;
}

/**
 * Returns the Sun's direction as a tuple, updated every frame.
 */
export function useSunDirectionTuple(): React.RefObject<[number, number, number]> {
  const dirRef = useRef<[number, number, number]>(astronomicalEngine.getSolarPosition(Date.now()).direction);

  useFrame(() => {
    dirRef.current = astronomicalEngine.getSolarPosition(Date.now()).direction;
  });

  return dirRef;
}
