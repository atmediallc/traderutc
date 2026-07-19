/**
 * Earth Engine Type Definitions
 *
 * Refactored for ECharts Globe compatibility — Three.js types removed.
 */

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

/** Camera state for smooth transitions (ECharts-compatible) */
export interface CameraState {
  /** Camera distance from Earth center */
  distance: number;
  /** View alpha angle (latitude tilt) */
  alpha: number;
  /** View beta angle (longitude rotation) */
  beta: number;
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
  direction: [number, number, number];
  /** Sun intensity multiplier */
  intensity: number;
  /** Sun color (RGB, 0-1) */
  color: [number, number, number];
}

/** Performance metrics for monitoring */
export interface EarthPerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  textureMemory: number;
}
