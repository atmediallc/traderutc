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
import { getSunDirectionVector } from '../services/sun-position.service';

/**
 * Returns a ref to a Vector3 representing the Sun's direction,
 * updated every frame.
 */
export function useSunPosition(): React.RefObject<Vector3> {
  const sunDirRef = useRef<Vector3>(new Vector3(...getSunDirectionVector(Date.now())));

  useFrame(() => {
    const dir = getSunDirectionVector(Date.now());
    sunDirRef.current.set(dir[0], dir[1], dir[2]);
  });

  return sunDirRef;
}

/**
 * Returns the Sun's direction as a tuple, updated every frame.
 */
export function useSunDirectionTuple(): React.RefObject<[number, number, number]> {
  const dirRef = useRef<[number, number, number]>(getSunDirectionVector(Date.now()));

  useFrame(() => {
    dirRef.current = getSunDirectionVector(Date.now());
  });

  return dirRef;
}
