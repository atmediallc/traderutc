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
  RepeatWrapping,
} from 'three';
import type { Mesh } from 'three';
import {
  EARTH_TEXTURES,
  DEFAULT_EARTH_CONFIG,
  EARTH_PBR_CONFIG,
} from '../constants/earth.constants';
import { earthVertexShader, earthFragmentShader } from '../shaders/earth.shaders';
import { earthEngine, astronomicalEngine } from '@/engines';

export function EarthSphere() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Load all Earth textures
  const [
    dayMap,
    nightMap,
    specularMap,
    bumpMap,
    normalMap,
    roughnessMap,
    ambientOcclusionMap,
    cloudMap,
  ] = useLoader(TextureLoader, [
    EARTH_TEXTURES.day,
    EARTH_TEXTURES.night,
    EARTH_TEXTURES.specular,
    EARTH_TEXTURES.bump,
    EARTH_TEXTURES.normal,
    EARTH_TEXTURES.roughness,
    EARTH_TEXTURES.ambientOcclusion,
    EARTH_TEXTURES.clouds,
  ]);

  // Configure texture color spaces and filtering
  useMemo(() => {
    const colorTextures = [dayMap, nightMap];
    const dataTextures = [
      specularMap,
      bumpMap,
      normalMap,
      roughnessMap,
      ambientOcclusionMap,
      cloudMap,
    ];

    colorTextures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = 16;
    });

    dataTextures.forEach((texture) => {
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      texture.anisotropy = 16;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
    });
  }, [
    dayMap,
    nightMap,
    specularMap,
    bumpMap,
    normalMap,
    roughnessMap,
    ambientOcclusionMap,
    cloudMap,
  ]);

  // Create shader uniforms
  const uniforms = useMemo(
    () => ({
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      specularTexture: { value: specularMap },
      bumpTexture: { value: bumpMap },
      normalTexture: { value: normalMap },
      roughnessTexture: { value: roughnessMap },
      ambientOcclusionTexture: { value: ambientOcclusionMap },
      cloudTexture: { value: cloudMap },
      sunDirection: { value: [0, 0, 1] as [number, number, number] },
      ambientIntensity: { value: 0.055 },
      bumpStrength: { value: EARTH_PBR_CONFIG.reliefStrength },
      specularStrength: { value: EARTH_PBR_CONFIG.oceanSpecularStrength },
      nightIntensity: { value: 1.65 },
      terminatorWidth: { value: 0.13 },
      goldenHourIntensity: { value: 0.34 },
      oceanFresnelPower: { value: EARTH_PBR_CONFIG.oceanFresnelPower },
      oceanSpecularPower: { value: EARTH_PBR_CONFIG.oceanSpecularPower },
      iceReflectance: { value: EARTH_PBR_CONFIG.iceReflectance },
      cityBloomStrength: { value: EARTH_PBR_CONFIG.cityBloomStrength },
      auroraStrength: { value: EARTH_PBR_CONFIG.auroraStrength },
      lightningStrength: { value: EARTH_PBR_CONFIG.lightningStrength },
      cloudShadowStrength: { value: EARTH_PBR_CONFIG.cloudShadowStrength },
      time: { value: 0 },
    }),
    [
      dayMap,
      nightMap,
      specularMap,
      bumpMap,
      normalMap,
      roughnessMap,
      ambientOcclusionMap,
      cloudMap,
    ]
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
  useFrame((state) => {
    const utcMs = state.clock.oldTime;

    // Astronomical rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = earthEngine.getRotationAngleY(utcMs);
    }

    // Sun direction for shader
    if (materialRef.current) {
      const sunDir = astronomicalEngine.getSolarPosition(utcMs).direction;
      materialRef.current.uniforms.sunDirection.value = sunDir;
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
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
