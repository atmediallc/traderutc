/**
 * Earth Engine Type Definitions
 */
import type { Vector3Tuple } from 'three';

/** Quality levels for texture resolution and rendering detail */
export type EarthQuality = 'low' | 'medium' | 'high' | 'ultra';

/** Earth rendering configuration */
export interface EarthConfig {
  /** Sphere radius in scene units */
  radius: number;
  /** Number of width segments for sphere geometry */
  widthSegments: number;
  /** Number of height segments for sphere geometry */
  heightSegments: number;
  /** Cloud layer scale relative to Earth radius */
  cloudScale: number;
  /** Atmosphere layer scale relative to Earth radius */
  atmosphereScale: number;
  /** Cloud rotation speed multiplier */
  cloudRotationSpeed: number;
  /** Whether auto-rotation is enabled */
  autoRotate: boolean;
  /** Auto-rotation speed in radians per frame */
  autoRotateSpeed: number;
}

/** Camera state for smooth transitions */
export interface CameraState {
  /** Current camera position */
  position: Vector3Tuple;
  /** Current look-at target */
  target: Vector3Tuple;
  /** Current zoom / field of view */
  fov: number;
  /** Whether camera is currently animating */
  isAnimating: boolean;
}

/** Texture set for Earth rendering */
export interface EarthTexturePaths {
  day: string;
  night: string;
  clouds: string;
  specular: string;
  bump: string;
  normal: string;
  roughness: string;
  ambientOcclusion: string;
}

/** Sun uniform data passed to shaders */
export interface SunUniforms {
  /** Normalized direction vector to the Sun */
  direction: Vector3Tuple;
  /** Sun intensity multiplier */
  intensity: number;
  /** Sun color (RGB, 0-1) */
  color: Vector3Tuple;
}

/** Earth shader uniform values */
export interface EarthShaderUniforms {
  /** Day (Blue Marble) texture */
  dayTexture: THREE.Texture | null;
  /** Night (city lights) texture */
  nightTexture: THREE.Texture | null;
  /** Cloud alpha texture */
  cloudTexture: THREE.Texture | null;
  /** Specular map (ocean reflections) */
  specularTexture: THREE.Texture | null;
  /** Bump/height map */
  bumpTexture: THREE.Texture | null;
  /** Sun direction vector (normalized) */
  sunDirection: Vector3Tuple;
  /** Ambient light intensity */
  ambientIntensity: number;
  /** Bump map strength */
  bumpStrength: number;
  /** Specular highlight strength */
  specularStrength: number;
  /** Night lights emission intensity */
  nightIntensity: number;
  /** Terminator transition width (smoothstep range) */
  terminatorWidth: number;
  /** Golden hour tint intensity */
  goldenHourIntensity: number;
}

/** Performance metrics for monitoring */
export interface EarthPerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  textureMemory: number;
}

// Import THREE namespace for texture type
import type * as THREE from 'three';
