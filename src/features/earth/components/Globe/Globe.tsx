/**
 * Globe
 *
 * Main React component wrapping the ECharts globe visualization.
 * Provides a declarative API for country selection, camera control,
 * atmosphere, and theme management.
 */

'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import type { ECharts } from 'echarts';
import {
  createGlobeChart,
  disposeGlobeChart,
  setGlobeAutoRotate,
  rotateGlobeTo,
  setGlobeZoom,
  registerCountriesMap,
  buildGlobeOption,
} from './GlobeRenderer';
import { wireGlobeInteractions } from './GlobeInteraction';
import type {
  CountryCollection,
  GlobeCountryInfo,
  GlobeTheme,
  EChartsInternal,
} from './globe.types';

export interface GlobeHandle {
  /** The underlying ECharts instance */
  getChart: () => ECharts | null;
  /** Rotate globe to a lat/lng coordinate */
  rotateTo: (lat: number, lng: number, distance?: number) => void;
  /** Set zoom level by distance */
  setZoom: (distance: number) => void;
  /** Enable/disable auto rotation */
  setAutoRotate: (enabled: boolean) => void;
  /** Resize the chart to its container */
  resize: () => void;
}

export interface GlobeProps {
  /** Countries GeoJSON data */
  countries?: CountryCollection;
  /** Globe theme overrides */
  theme?: Partial<GlobeTheme>;
  /** Enable auto-rotation */
  autoRotate?: boolean;
  /** Called when a country is clicked */
  onCountryClick?: (country: GlobeCountryInfo) => void;
  /** Called when hovering over a country */
  onCountryHover?: (country: GlobeCountryInfo | null) => void;
  /** Called when the chart is ready */
  onReady?: (chart: ECharts) => void;
  /** Additional CSS class name */
  className?: string;
  /** Container style */
  style?: React.CSSProperties;
  /** If false, chart won't be initiated (useful for SSR) */
  enabled?: boolean;
}

/** Checks if an ECharts instance has been disposed */
function isChartDisposed(chart: ECharts): boolean {
  try {
    // ECharts v6 uses private _disposed flag
    return (chart as unknown as EChartsInternal)._disposed === true;
  } catch {
    return true;
  }
}

/**
 * Renders an interactive 3D globe using ECharts-GL.
 */
const Globe = forwardRef<GlobeHandle, GlobeProps>(function Globe(
  {
    countries,
    theme,
    autoRotate = false,
    onCountryClick,
    onCountryHover,
    onReady,
    className,
    style,
    enabled = true,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const disposedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Expose imperative API
  useImperativeHandle(
    ref,
    () => ({
      getChart: () => chartRef.current,
      rotateTo: (lat, lng, distance) => {
        if (chartRef.current && !disposedRef.current) {
          rotateGlobeTo(chartRef.current, lat, lng, distance);
        }
      },
      setZoom: (distance) => {
        if (chartRef.current && !disposedRef.current) {
          setGlobeZoom(chartRef.current, distance);
        }
      },
      setAutoRotate: (en) => {
        if (chartRef.current && !disposedRef.current) {
          setGlobeAutoRotate(chartRef.current, en);
        }
      },
      resize: () => {
        if (!disposedRef.current) {
          chartRef.current?.resize();
        }
      },
    }),
    []
  );

  // Initialize chart (once)
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    disposedRef.current = false;

    const chart = createGlobeChart(containerRef.current, {
      theme,
      autoRotate,
      onChartReady: (c) => {
        onReady?.(c);
        setIsReady(true);
      },
    });

    chartRef.current = chart;

    return () => {
      disposedRef.current = true;
      disposeGlobeChart(chart);
      chartRef.current = null;
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // When countries data arrives, register the map and update the chart option
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !countries || disposedRef.current || isChartDisposed(chart)) return;

    registerCountriesMap(countries);

    // Rebuild option with countries and apply
    // NOTE: read current autoRotate from live chart option instead of
    // closure to avoid overriding user toggle when countries load late.
    try {
      const currentOpt = chart.getOption() as Record<string, unknown>;
      const globeOpt = currentOpt.globe as Record<string, unknown> | undefined;
      const viewCtrl = globeOpt?.viewControl as Record<string, unknown> | undefined;
      const liveAutoRotate =
        typeof viewCtrl?.autoRotate === 'boolean'
          ? viewCtrl.autoRotate
          : autoRotate;

      const updatedOption = buildGlobeOption({
        theme,
        autoRotate: liveAutoRotate,
        countries,
      });
      chart.setOption(updatedOption, { replaceMerge: ['series'] });
    } catch {
      // Chart may have been disposed between checks
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);

  // Wire country interactions
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !countries || disposedRef.current || isChartDisposed(chart)) return;

    const cleanup = wireGlobeInteractions(chart, countries, {
      onCountryClick: (info) => onCountryClick?.(info),
      onCountryHover: (info) => onCountryHover?.(info),
    });

    return cleanup;
  }, [countries, onCountryClick, onCountryHover]);

  // Update auto-rotate when prop changes
  useEffect(() => {
    const chart = chartRef.current;
    if (chart && !disposedRef.current && !isChartDisposed(chart)) {
      setGlobeAutoRotate(chart, autoRotate);
    }
  }, [autoRotate]);

  // Handle resize on container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (!disposedRef.current) {
        chartRef.current?.resize();
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style,
      }}
      data-globe-ready={isReady}
    />
  );
});

Globe.displayName = 'Globe';

export default Globe;
