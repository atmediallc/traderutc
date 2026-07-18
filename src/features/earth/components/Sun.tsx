/**
 * Sun Component
 *
 * Positions the directional light to match the real Sun position.
 * Also adds subtle ambient lighting for the dark hemisphere.
 */
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { DirectionalLight } from 'three';
import { astronomicalEngine } from '@/engines';
import { SUN_CONFIG } from '../constants/earth.constants';

export function Sun() {
  const lightRef = useRef<DirectionalLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const sunDir = astronomicalEngine.getSolarPosition(state.clock.oldTime).direction;
      // Position light far away in the sun's direction
      lightRef.current.position.set(
        sunDir[0] * 10,
        sunDir[1] * 10,
        sunDir[2] * 10
      );
    }
  });

  return (
    <>
      {/* Main sunlight */}
      <directionalLight
        ref={lightRef}
        intensity={SUN_CONFIG.intensity}
        color={SUN_CONFIG.color}
        castShadow={false}
      />

      {/* Subtle ambient fill for indirect light / earthshine */}
      <ambientLight
        intensity={SUN_CONFIG.ambientIntensity}
        color={SUN_CONFIG.ambientColor}
      />
    </>
  );
}
