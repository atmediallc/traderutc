/**
 * EarthSphere Component
 *
 * Core 3D Earth mesh with custom GLSL shader.
 *
 * Layer architecture (bottom to top):
 *   1. Albedo + Directional Light      (base)
 *   2. Ocean Specular                   (sun glint on water)
 *   3. Night City Lights                (emissive on dark side)
 *
 * Atmosphere, clouds, and post-processing are independent
 * components outside this mesh.
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
  ClampToEdgeWrapping,
} from 'three';
import type { Mesh } from 'three';
import {
  EARTH_TEXTURES,
  DEFAULT_EARTH_CONFIG,
  EARTH_PBR_CONFIG,
} from '../constants/earth.constants';
import { earthVertexShader, earthFragmentShader } from '../shaders/earth.shaders';
import { earthEngine, astronomicalEngine } from '@/engines';
import { useUTCStore } from '@/features/utc/stores/utc.store';

export function EarthSphere() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Load only the textures the shader actually uses
  const [dayMap, nightMap, specularMap, normalMap, cloudMap] = useLoader(TextureLoader, [
    EARTH_TEXTURES.day,
    EARTH_TEXTURES.night,
    EARTH_TEXTURES.specular,
    EARTH_TEXTURES.normal,
    EARTH_TEXTURES.clouds,
  ]);

  // Configure texture color spaces and filtering
  useMemo(() => {
    [dayMap, nightMap].forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = 16;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
    });

    [specularMap, normalMap, cloudMap].forEach((texture) => {
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = 8;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
    });
  }, [dayMap, nightMap, specularMap, normalMap, cloudMap]);

  // Create shader uniforms — exactly one per shader uniform
  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      specularTexture: { value: specularMap },
      normalTexture: { value: normalMap },
      cloudTexture: { value: cloudMap },
      sunDirection: { value: [0, 0, 1] as [number, number, number] },
      ambientIntensity: { value: 0.02 },
      specularStrength: { value: EARTH_PBR_CONFIG.oceanSpecularStrength },
      nightIntensity: { value: 1.0 },
      terminatorWidth: { value: 0.04 },
      oceanSpecularPower: { value: EARTH_PBR_CONFIG.oceanSpecularPower },
      cityBloomStrength: { value: EARTH_PBR_CONFIG.cityBloomStrength },
      normalScale: { value: EARTH_PBR_CONFIG.normalScale },
      time: { value: 0 },
    }),
    [dayMap, nightMap, specularMap, normalMap, cloudMap]
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

  // Update rotation and sun direction every frame using real UTC time
  useFrame(() => {
    const utcMs = useUTCStore.getState().utcMs;

    // Astronomical rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = earthEngine.getRotationAngleY(utcMs);
    }

    // Sun direction for shader
    if (materialRef.current) {
      const sunDir = astronomicalEngine.getSolarPosition(utcMs).direction;
      materialRef.current.uniforms.sunDirection.value = sunDir;
      materialRef.current.uniforms.time.value = (utcMs % 86400000) / 1000;
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
