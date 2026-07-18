/**
 * Earth Engine Constants
 *
 * Central configuration for the 3D Earth rendering engine.
 * All paths, quality presets, and astronomical constants.
 */
import type { EarthConfig, EarthTexturePaths, EarthQuality } from '../types/earth.types';

/** Texture paths relative to /public */
export const EARTH_TEXTURES: EarthTexturePaths = {
  day: '/textures/earth-day-2k.jpg',
  night: '/textures/earth-night-2k.jpg',
  clouds: '/textures/earth-clouds-2k.jpg',
  specular: '/textures/earth-specular-2k.jpg',
  bump: '/textures/earth-bump-2k.jpg',
  normal: '/textures/earth-normal-2k.jpg',
  roughness: '/textures/earth-specular-2k.jpg',
  ambientOcclusion: '/textures/earth-bump-2k.jpg',
};

/** Starfield / Milky Way background texture */
export const STARFIELD_TEXTURE = '/textures/starfield-8k.jpg';

/** Physically-based rendering controls for Earth material */
export const EARTH_PBR_CONFIG = {
  normalScale: 0.075,
  reliefStrength: 0.018,
  oceanFresnelPower: 5.0,
  oceanSpecularPower: 96.0,
  oceanSpecularStrength: 1.8,
  iceReflectance: 0.32,
  cityBloomStrength: 2.25,
  auroraStrength: 0.22,
  lightningStrength: 0.12,
  cloudShadowStrength: 0.18,
} as const;

/** Quality presets for different device capabilities */
export const QUALITY_PRESETS: Record<EarthQuality, EarthConfig> = {
  low: {
    radius: 1,
    widthSegments: 32,
    heightSegments: 32,
    cloudScale: 1.003,
    atmosphereScale: 1.015,
    cloudRotationSpeed: 0.00002,
    autoRotate: false,
    autoRotateSpeed: 0.0005,
  },
  medium: {
    radius: 1,
    widthSegments: 64,
    heightSegments: 64,
    cloudScale: 1.005,
    atmosphereScale: 1.018,
    cloudRotationSpeed: 0.00003,
    autoRotate: false,
    autoRotateSpeed: 0.0005,
  },
  high: {
    radius: 1,
    widthSegments: 128,
    heightSegments: 128,
    cloudScale: 1.006,
    atmosphereScale: 1.02,
    cloudRotationSpeed: 0.00003,
    autoRotate: false,
    autoRotateSpeed: 0.0005,
  },
  ultra: {
    radius: 1,
    widthSegments: 256,
    heightSegments: 128,
    cloudScale: 1.006,
    atmosphereScale: 1.02,
    cloudRotationSpeed: 0.00003,
    autoRotate: false,
    autoRotateSpeed: 0.0005,
  },
};

/** Default quality level */
export const DEFAULT_QUALITY: EarthQuality = 'high';

/** Default Earth configuration */
export const DEFAULT_EARTH_CONFIG: EarthConfig = QUALITY_PRESETS[DEFAULT_QUALITY];

/**
 * Camera configuration defaults
 */
export const CAMERA_CONFIG = {
  /** Default field of view in degrees */
  defaultFov: 45,
  /** Minimum distance from Earth center */
  minDistance: 1.2,
  /** Maximum distance from Earth center */
  maxDistance: 10,
  /** Camera damping factor for smooth orbiting */
  dampingFactor: 0.08,
  /** Auto-rotate speed (radians per second) */
  autoRotateSpeed: 0.3,
  /** Animation duration for camera transitions (seconds) */
  transitionDuration: 1.5,
  /** Default camera position */
  defaultPosition: [0, 0, 3] as [number, number, number],
  /** Default look-at target */
  defaultTarget: [0, 0, 0] as [number, number, number],
} as const;

/**
 * Post-processing configuration
 */
export const POST_PROCESSING_CONFIG = {
  bloom: {
    luminanceThreshold: 0.72,
    luminanceSmoothing: 0.22,
    intensity: 0.82,
    mipmapBlur: true,
  },
  vignette: {
    offset: 0.38,
    darkness: 0.46,
  },
  exposure: 1.08,
} as const;

/**
 * Atmosphere visual configuration
 */
export const ATMOSPHERE_CONFIG = {
  /** Atmosphere color (subtle blue) */
  color: [0.28, 0.56, 1.0] as [number, number, number],
  /** Fresnel power exponent (higher = thinner rim) */
  fresnelPower: 2.65,
  /** Overall atmosphere opacity */
  opacity: 0.62,
  /** Atmosphere glow intensity */
  intensity: 1.35,
  rayleighStrength: 1.45,
  mieStrength: 0.42,
  horizonGlow: 1.15,
  sunsetStrength: 0.82,
} as const;

/**
 * Sun visual configuration
 */
export const SUN_CONFIG = {
  /** Directional light intensity */
  intensity: 3.0,
  /** Light color (warm white / sunlight) */
  color: '#fdfbd3',
  /** Ambient light intensity (indirect illumination) */
  ambientIntensity: 0.06,
  /** Ambient light color */
  ambientColor: '#1a1a3e',
} as const;
