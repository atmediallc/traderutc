/**
 * GlobeAtmosphere
 *
 * Configures the ECharts globe atmospheric scattering effect.
 * Provides a bright, dramatic blue atmospheric glow around the Earth
 * with a visible inner glow for depth.
 */

import type { GlobeTheme } from './globe.types';

export interface AtmosphereConfig {
  show: boolean;
  offset?: number;
  glowPower?: number;
  innerGlowPower?: number;
  color?: string;
}

/**
 * Creates the atmosphere option for the ECharts globe component.
 *
 * The atmosphere creates a vivid blue scattering glow around the
 * terminator line, giving the Earth a dramatic atmospheric halo
 * visible even at distance.
 */
export function createAtmosphereOptions(theme: GlobeTheme): AtmosphereConfig {
  return {
    show: false,
    offset: 5,
    glowPower: theme.atmosphereGlowPower,
    innerGlowPower: theme.atmosphereInnerGlow,
    color: theme.atmosphereColor,
  };
}
