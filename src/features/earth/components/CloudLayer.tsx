/**
 * CloudLayer Component
 *
 * Semi-transparent cloud sphere rendered slightly above the Earth surface.
 * Rotates at a slightly different rate than the Earth to simulate
 * atmospheric wind patterns.
 */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import {
  TextureLoader,
  SphereGeometry,
  MeshPhongMaterial,
  AdditiveBlending,
  FrontSide,
  DoubleSide,
} from 'three';
import type { Mesh } from 'three';
import { EARTH_TEXTURES, DEFAULT_EARTH_CONFIG } from '../constants/earth.constants';
import { useEarthStore } from '../stores/earth.store';
import { earthEngine } from '@/engines';

export function CloudLayer() {
  const meshRef = useRef<Mesh>(null);
  const cloudsVisible = useEarthStore((s) => s.cloudsVisible);
  const cloudOffsetRef = useRef(0);

  const cloudMap = useLoader(TextureLoader, EARTH_TEXTURES.clouds);

  const geometry = useMemo(
    () =>
      new SphereGeometry(
        DEFAULT_EARTH_CONFIG.radius * DEFAULT_EARTH_CONFIG.cloudScale,
        DEFAULT_EARTH_CONFIG.widthSegments,
        DEFAULT_EARTH_CONFIG.heightSegments
      ),
    []
  );

  useFrame((_, delta) => {
    if (meshRef.current) {
      const utcMs = Date.now();
      // Base rotation matches Earth, plus a slow drift
      cloudOffsetRef.current += DEFAULT_EARTH_CONFIG.cloudRotationSpeed * delta * 60;
      meshRef.current.rotation.y = earthEngine.getRotationAngleY(utcMs) + cloudOffsetRef.current;
    }
  });

  if (!cloudsVisible) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhongMaterial
        map={cloudMap}
        transparent
        opacity={0.35}
        depthWrite={false}
        side={DoubleSide}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
