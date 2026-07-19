/**
 * GlobeRenderer
 *
 * Core ECharts globe rendering module. Manages chart instance lifecycle,
 * builds the ECharts option configuration, handles resize, and disposal.
 *
 * Uses realistic PBR shading, high-quality local textures, and a
 * dramatic atmosphere for a premium globe visualization.
 */

'use client';

import * as echarts from 'echarts';
import 'echarts-gl';
import type { ECharts } from 'echarts';
import type {
  CountryCollection,
  GlobeTheme,
  EChartsInternal,
} from './globe.types';
import { DEFAULT_GLOBE_THEME } from './globe.types';
import { createGlobeTextureOptions, getGlobeTextures } from './GlobeTextures';
import { createAtmosphereOptions } from './GlobeAtmosphere';
import { createCameraOptions, type CameraViewConfig } from './GlobeCamera';
import {
  countriesToMapData,
  getCountriesMapName,
} from './GlobeInteraction';

export interface GlobeRenderOptions {
  theme?: Partial<GlobeTheme>;
  autoRotate?: boolean;
  countries?: CountryCollection;
  onChartReady?: (chart: ECharts) => void;
}

export interface GlobeLightingConfig {
  main: {
    intensity: number;
    alpha: number;
    beta: number;
    shadow: boolean;
    shadowQuality: string;
    color: string;
  };
  ambient: {
    intensity: number;
    color: string;
  };
  ambientCubemap?: {
    exposure: number;
    diffuseIntensity: number;
    specularIntensity: number;
  };
}

/**
 * Creates the full ECharts option for the globe visualization.
 */
export function buildGlobeOption(
  options: GlobeRenderOptions & { camera?: CameraViewConfig }
): echarts.EChartsOption {
  const theme: GlobeTheme = { ...DEFAULT_GLOBE_THEME, ...options.theme };
  const textures = createGlobeTextureOptions(getGlobeTextures());
  const atmosphere = createAtmosphereOptions(theme);
  const camera = options.camera ?? createCameraOptions(options.autoRotate, theme);

  const lighting: GlobeLightingConfig = {
    ambient: {
      intensity: theme.ambientIntensity,
      color: '#b4c8e0',
    },
    main: {
      intensity: theme.mainLightIntensity,
      alpha: theme.mainLightAlpha,
      beta: theme.mainLightBeta,
      shadow: theme.mainLightShadow,
      shadowQuality: 'high',
      color: '#ffe8d6',
    },
  };

  const series: Record<string, unknown>[] = [];

  // Register and add world countries map series if data is available
  if (options.countries) {
    const mapName = getCountriesMapName();

    series.push({
      type: 'map3D',
      map: mapName,
      coordinateSystem: 'globe',
      shading: 'lambert',
      silent: false,
      instancing: true,
      label: {
        show: false,
      },
      itemStyle: {
        borderColor: theme.countryBorderColor,
        borderWidth: theme.countryBorderWidth,
        areaColor: theme.countryAreaColor,
      },
      emphasis: {
        label: {
          show: true,
          color: theme.countryLabelColor,
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: 'Inter, system-ui, sans-serif',
          textBorderColor: 'rgba(0, 0, 0, 0.8)',
          textBorderWidth: 2,
        },
        itemStyle: {
          areaColor: theme.countryHoverColor,
          borderColor: 'rgba(120, 200, 255, 0.9)',
          borderWidth: 1.2,
        },
      },
      data: countriesToMapData(options.countries),
    });
  }

  return {
    backgroundColor: theme.backgroundColor,
    globe: {
      ...textures,
      atmosphere,
      light: lighting,
      viewControl: camera,
      globeRadius: 50,
      globeOuterRadius: 60,
      postEffect: {
        enable: true,
        bloom: {
          enable: true,
          bloomIntensity: 0.12,
        },
        depthOfField: {
          enable: false,
        },
      },
      temporalSuperSampling: {
        enable: true,
      },
    },
    series,
  };
}

/**
 * Creates an ECharts instance bound to the given DOM element
 * and initializes it with the globe configuration.
 */
export function createGlobeChart(
  domElement: HTMLDivElement,
  options: GlobeRenderOptions
): ECharts {
  const chart = echarts.init(domElement, undefined, {
    renderer: 'canvas',
  });

  const camera = createCameraOptions(options.autoRotate, {
    ...DEFAULT_GLOBE_THEME,
    ...options.theme,
  });

  const fullOption = buildGlobeOption({ ...options, camera });
  chart.setOption(fullOption);

  // Handle resize
  const resizeHandler = () => chart.resize();
  window.addEventListener('resize', resizeHandler);

  // Store resize handler for cleanup
  (chart as unknown as EChartsInternal).__resizeHandler = resizeHandler;

  options.onChartReady?.(chart);

  return chart;
}

/**
 * Safely disposes an ECharts instance, cleaning up event listeners.
 * Guards against double-dispose (React Strict Mode calls cleanup twice).
 */
export function disposeGlobeChart(chart: ECharts | null): void {
  if (!chart) return;

  const internal = chart as unknown as EChartsInternal;
  const handler = internal.__resizeHandler;
  if (handler) {
    window.removeEventListener('resize', handler);
  }

  try {
    if (!internal._disposed) {
      chart.dispose();
    }
  } catch {
    // Already disposed — safe to ignore
  }
}

/**
 * Updates the globe's auto-rotation state.
 *
 * Bypasses chart.setOption() entirely because echarts-gl crashes with:
 *   TypeError: Cannot read properties of undefined (reading 'dispose')
 * when any setOption call touches the `globe` key (partial or full merge).
 *
 * Workaround: directly mutate the internal component model's viewControl
 * and refresh the zrender instance.  This avoids echarts-gl's broken
 * prepareView lifecycle path for incremental updates.
 */
export function setGlobeAutoRotate(
  chart: ECharts,
  enabled: boolean
): void {
  try {
    const internal = chart as unknown as EChartsInternal;
    if (!chart || internal._disposed) return;

    // Access the internal ECharts model via private `_model` property.
    // echarts-gl breaks on any setOption that touches `globe`, so we
    // mutate the internal model directly and trigger a zrender refresh.
    const chartAny = chart as unknown as {
      _model?: Record<string, unknown>;
      getZr: () => { refresh: () => void };
    };

    const ecModel = chartAny._model;
    if (!ecModel) return;

    const globeComponent = ecModel.globe as
      | { viewControl?: Record<string, unknown> }
      | undefined;
    if (!globeComponent) return;

    if (globeComponent.viewControl) {
      globeComponent.viewControl.autoRotate = enabled;
    }

    // Force zrender to re-render so the globe reads the updated flag
    chart.getZr().refresh();
  } catch (err) {
    console.error('Failed to setGlobeAutoRotate:', err);
  }
}

/**
 * Rotates the globe to focus on a specific latitude/longitude coordinate.
 */
export function rotateGlobeTo(
  chart: ECharts,
  lat: number,
  lng: number,
  distance?: number
): void {
  try {
    const internal = chart as unknown as EChartsInternal;
    if (chart && !internal._disposed) {
      chart.setOption({
        globe: {
          viewControl: {
            alpha: lat,
            beta: lng,
            ...(distance != null ? { distance } : {}),
            animationDurationUpdate: 1200,
            animationEasingUpdate: 'cubicInOut',
          },
        },
      });
    }
  } catch (err) {
    console.error('Failed to rotateGlobeTo:', err);
  }
}

/**
 * Sets the globe camera zoom distance.
 */
export function setGlobeZoom(chart: ECharts, distance: number): void {
  try {
    const internal = chart as unknown as EChartsInternal;
    if (chart && !internal._disposed) {
      chart.setOption({
        globe: {
          viewControl: {
            distance,
            animationDurationUpdate: 800,
            animationEasingUpdate: 'cubicOut',
          },
        },
      });
    }
  } catch (err) {
    console.error('Failed to setGlobeZoom:', err);
  }
}

/**
 * Registers world countries GeoJSON with ECharts for the map3D series.
 */
export function registerCountriesMap(
  countries: CountryCollection
): void {
  echarts.registerMap(getCountriesMapName(), countries as unknown as Parameters<typeof echarts.registerMap>[1]);
}
