/**
 * Earth Engine Constants
 *
 * Central configuration for the Earth rendering engine.
 * Refactored for ECharts Globe compatibility.
 */
import type { EarthConfig, EarthQuality } from '../types/earth.types';

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
    heightSegments: 192,
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
