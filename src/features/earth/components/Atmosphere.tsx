/**
 * Atmosphere Component
 *
 * Renders a Fresnel-based atmospheric glow around the Earth.
 * Uses a slightly larger sphere with BackSide culling and custom
 * shader for edge-glow effect.
 */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  ShaderMaterial,
  SphereGeometry,
  BackSide,
  AdditiveBlending,
} from 'three';
import {
  DEFAULT_EARTH_CONFIG,
  ATMOSPHERE_CONFIG,
} from '../constants/earth.constants';
import { useEarthStore } from '../stores/earth.store';
import { astronomicalEngine } from '@/engines';
import {
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from '../shaders/earth.shaders';

export function Atmosphere() {
  const materialRef = useRef<ShaderMaterial>(null);
  const atmosphereVisible = useEarthStore((s) => s.atmosphereVisible);

  const geometry = useMemo(
    () =>
      new SphereGeometry(
        DEFAULT_EARTH_CONFIG.radius * DEFAULT_EARTH_CONFIG.atmosphereScale,
        64,
        64
      ),
    []
  );

  const uniforms = useMemo(
    () => ({
      atmosphereColor: { value: ATMOSPHERE_CONFIG.color },
      fresnelPower: { value: ATMOSPHERE_CONFIG.fresnelPower },
      atmosphereOpacity: { value: ATMOSPHERE_CONFIG.opacity },
      atmosphereIntensity: { value: ATMOSPHERE_CONFIG.intensity },
      rayleighStrength: { value: ATMOSPHERE_CONFIG.rayleighStrength },
      mieStrength: { value: ATMOSPHERE_CONFIG.mieStrength },
      horizonGlow: { value: ATMOSPHERE_CONFIG.horizonGlow },
      sunsetStrength: { value: ATMOSPHERE_CONFIG.sunsetStrength },
      sunDirection: { value: [0, 0, 1] as [number, number, number] },
    }),
    []
  );

  useFrame(() => {
    if (materialRef.current) {
      const sunDir = astronomicalEngine.getSolarPosition(Date.now()).direction;
      materialRef.current.uniforms.sunDirection.value = sunDir;
    }
  });

  if (!atmosphereVisible) return null;

  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={BackSide}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
