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
  DoubleSide,
  ShaderMaterial,
} from 'three';
import type { Mesh } from 'three';
import { EARTH_TEXTURES, DEFAULT_EARTH_CONFIG } from '../constants/earth.constants';
import { useEarthStore } from '../stores/earth.store';
import { astronomicalEngine, earthEngine } from '@/engines';

const cloudVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cloudFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D cloudTexture;
  uniform vec3 sunDirection;
  uniform float time;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec2 driftUv = vUv + vec2(time * 0.0012, 0.0);
    float coverage = texture2D(cloudTexture, driftUv).r;
    float softCoverage = smoothstep(0.35, 0.85, coverage);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float sunlight = smoothstep(-0.15, 0.6, dot(normalize(sunDirection), normalize(vWorldNormal)));
    vec3 litCloud = mix(vec3(0.7, 0.75, 0.85), vec3(0.95, 0.95, 1.0), sunlight);
    vec3 color = litCloud * mix(0.75, 1.0, coverage);
    float alpha = softCoverage * mix(0.12, 0.3, sunlight);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function CloudLayer() {
  const meshRef = useRef<Mesh>(null);
  const cloudsVisible = useEarthStore((s) => s.cloudsVisible);
  const cloudOffsetRef = useRef(0);

  const cloudMap = useLoader(TextureLoader, EARTH_TEXTURES.clouds);

  const uniforms = useMemo(
    () => ({
      cloudTexture: { value: cloudMap },
      sunDirection: { value: [0, 0, 1] as [number, number, number] },
      time: { value: 0 },
    }),
    [cloudMap]
  );

  const materialRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(
    () =>
      new SphereGeometry(
        DEFAULT_EARTH_CONFIG.radius * DEFAULT_EARTH_CONFIG.cloudScale,
        DEFAULT_EARTH_CONFIG.widthSegments,
        DEFAULT_EARTH_CONFIG.heightSegments
      ),
    []
  );

  useFrame((state, delta) => {
    const utcMs = Date.now();

    if (meshRef.current) {
      // Base rotation matches Earth, plus a slow drift
      cloudOffsetRef.current += DEFAULT_EARTH_CONFIG.cloudRotationSpeed * delta * 60;
      meshRef.current.rotation.y = earthEngine.getRotationAngleY(utcMs) + cloudOffsetRef.current;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.sunDirection.value = astronomicalEngine.getSolarPosition(utcMs).direction;
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  if (!cloudsVisible) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={cloudVertexShader}
        fragmentShader={cloudFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}
