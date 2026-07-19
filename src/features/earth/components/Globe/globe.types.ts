/**
 * Globe Type Definitions
 *
 * Shared types for the ECharts Globe renderer module.
 * Uses local high-quality textures and realistic PBR shading.
 */

export interface CountryFeature {
  type: 'Feature';
  id: string;
  properties: {
    name: string;
    code: string;
    capital: string;
    timezone: string;
    flag: string;
    population: number;
    lat: number;
    lng: number;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][][] | number[][][];
  };
}

export interface CountryCollection {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

export interface GlobeCountryInfo {
  isoCode: string;
  name: string;
  utcOffset: number;
  localTime: string;
  isDst: boolean;
  timezoneId: string;
  capital: string;
  flag: string;
  lat: number;
  lng: number;
}

/**
 * Interface for accessing ECharts internal properties needed for
 * disposal checks, resize handlers, and event management.
 * These members exist at runtime but are not exposed in public types.
 */
export interface EChartsInternal {
  _disposed?: boolean;
  __resizeHandler?: (() => void) | undefined;
}

export interface GlobeTheme {
  /** Deep space background color */
  backgroundColor: string;

  /** Atmosphere glow color */
  atmosphereColor: string;
  /** Atmosphere outer glow intensity */
  atmosphereGlowPower: number;
  /** Atmosphere inner glow offset */
  atmosphereInnerGlow: number;

  /** Ambient light intensity */
  ambientIntensity: number;
  /** Main directional light intensity */
  mainLightIntensity: number;
  /** Main light elevation angle (degrees) */
  mainLightAlpha: number;
  /** Main light azimuth angle (degrees) */
  mainLightBeta: number;
  /** Main light shadow enabled */
  mainLightShadow: boolean;

  /** Globe shading model: 'realistic' | 'lambert' | 'color' */
  shading: 'realistic' | 'lambert' | 'color';

  /** Country border color */
  countryBorderColor: string;
  /** Country border width */
  countryBorderWidth: number;
  /** Country area color (base) */
  countryAreaColor: string;
  /** Country area color on hover */
  countryHoverColor: string;
  /** Country label color */
  countryLabelColor: string;

  /** Whether to show clouds layer */
  cloudsEnabled: boolean;
  /** Cloud layer opacity */
  cloudsOpacity: number;

  /** Height displacement scale (bump map intensity) */
  heightScale: number;

  /** Roughness for PBR shading (0 = mirror, 1 = diffuse) */
  roughness: number;
  /** Metalness for PBR shading */
  metalness: number;
}

export const DEFAULT_GLOBE_THEME: GlobeTheme = {
  backgroundColor: 'transparent',

  atmosphereColor: '#6db3f8',
  atmosphereGlowPower: 8,
  atmosphereInnerGlow: 3,

  ambientIntensity: 0.4,
  mainLightIntensity: 1.3,
  mainLightAlpha: 35,
  mainLightBeta: 160,
  mainLightShadow: false,

  shading: 'realistic',

  countryBorderColor: 'rgba(80, 180, 255, 0.5)',
  countryBorderWidth: 0.6,
  countryAreaColor: 'rgba(255, 255, 255, 0.03)',
  countryHoverColor: 'rgba(60, 160, 240, 0.3)',
  countryLabelColor: '#e0f0ff',

  cloudsEnabled: true,
  cloudsOpacity: 0.25,

  heightScale: 0.6,

  roughness: 0.92,
  metalness: 0.0,
};

export const DEFAULT_CAMERA_DISTANCE = 180;
export const MIN_CAMERA_DISTANCE = 40;
export const MAX_CAMERA_DISTANCE = 400;
