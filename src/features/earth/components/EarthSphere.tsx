/**
 * EarthSphere Component
 *
 * The core 3D Earth mesh with custom GLSL shaders for:
 * - Day/night texture blending
 * - Soft terminator with golden hour
 * - City lights emission
 * - Specular ocean reflections
 * - Bump-mapped terrain
 *
 * Rotation is driven by the IAU Earth Rotation Angle formula.
 */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import {
  TextureLoader,
  ShaderMaterial,
  SphereGeometry,
  FrontSide,
  SRGBColorSpace,
  LinearFilter,
  LinearMipmapLinearFilter,
} from 'three';
import type { Mesh } from 'three';
import { EARTH_TEXTURES, DEFAULT_EARTH_CONFIG } from '../constants/earth.constants';
import { earthVertexShader, earthFragmentShader } from '../shaders/earth.shaders';
import { earthEngine, astronomicalEngine } from '@/engines';

export function EarthSphere() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Load all Earth textures
  const [dayMap, nightMap, specularMap, bumpMap] = useLoader(TextureLoader, [
    EARTH_TEXTURES.day,
    EARTH_TEXTURES.night,
    EARTH_TEXTURES.specular,
    EARTH_TEXTURES.bump,
  ]);

  // Configure texture color spaces and filtering
  useMemo(() => {
    if (dayMap) {
      dayMap.colorSpace = SRGBColorSpace;
      dayMap.minFilter = LinearMipmapLinearFilter;
      dayMap.magFilter = LinearFilter;
      dayMap.anisotropy = 16;
    }
    if (nightMap) {
      nightMap.colorSpace = SRGBColorSpace;
      nightMap.minFilter = LinearMipmapLinearFilter;
      nightMap.magFilter = LinearFilter;
    }
  }, [dayMap, nightMap]);

  // Create shader uniforms
  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      specularTexture: { value: specularMap },
      bumpTexture: { value: bumpMap },
      sunDirection: { value: [0, 0, 1] as [number, number, number] },
      ambientIntensity: { value: 0.06 },
      bumpStrength: { value: 0.8 },
      specularStrength: { value: 0.6 },
      nightIntensity: { value: 1.8 },
      terminatorWidth: { value: 0.15 },
      goldenHourIntensity: { value: 0.4 },
    }),
    [dayMap, nightMap, specularMap, bumpMap]
  );

  // Geometry (memoized)
  const geometry = useMemo(
    () =>
      new SphereGeometry(
        DEFAULT_EARTH_CONFIG.radius,
        DEFAULT_EARTH_CONFIG.widthSegments,
        DEFAULT_EARTH_CONFIG.heightSegments
      ),
    []
  );

  // Update rotation and sun direction every frame
  useFrame(() => {
    const utcMs = Date.now();

    // Astronomical rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = earthEngine.getRotationAngleY(utcMs);
    }

    // Sun direction for shader
    if (materialRef.current) {
      const sunDir = astronomicalEngine.getSolarPosition(utcMs).direction;
      materialRef.current.uniforms.sunDirection.value = sunDir;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms}
        side={FrontSide}
      />
    </mesh>
  );
}
