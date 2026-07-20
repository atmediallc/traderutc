/**
 * EarthCanvas Component
 *
 * ECharts Globe-based Earth visualization. Replaces the previous
 * Three.js / React Three Fiber implementation with a high-quality
 * ECharts-GL globe renderer.
 *
 * Must be dynamically imported with ssr: false because ECharts
 * requires browser APIs.
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useEarthStore } from '../stores/earth.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import type { CountryCollection, GlobeCountryInfo } from './Globe/globe.types';

// Dynamic import with SSR disabled (ECharts requires browser APIs)
const Globe = dynamic(
  () => import('./Globe/Globe'),
  { ssr: false }
);

export function EarthCanvas() {
  const [countriesData, setCountriesData] = useState<CountryCollection>();

  const setSelectedCountry = useEarthStore((s) => s.setSelectedCountry);
  const setHoveredCountry = useEarthStore((s) => s.setHoveredCountry);
  const autoRotate = useEarthStore((s) => s.autoRotate);
  const addClock = useUTCStore((s) => s.addClock);

  // Load countries GeoJSON data
  useEffect(() => {
    fetch('/data/countries.json')
      .then((res) => res.json())
      .then((data) => setCountriesData(data))
      .catch((err) =>
        console.error('Failed to load countries.json:', err)
      );
  }, []);

  const handleCountryClick = useCallback(
    (info: GlobeCountryInfo) => {
      setSelectedCountry(info);

      // Add a UTC clock for the selected country's timezone
      addClock({
        id: info.isoCode,
        label: `${info.flag} ${info.name}`,
        ianaZone: info.timezoneId,
        offset: info.utcOffset,
        isDst: info.isDst,
      });
    },
    [setSelectedCountry, addClock]
  );

  const handleCountryHover = useCallback(
    (info: GlobeCountryInfo | null) => {
      setHoveredCountry(info);
    },
    [setHoveredCountry]
  );

  // Ensure chart resizes on window resize (fallback for soft keyboard / mobile rotation)
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      window.dispatchEvent(new Event('resize'));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
    <Globe
      countries={countriesData}
      autoRotate={autoRotate}
      onCountryClick={handleCountryClick}
      onCountryHover={handleCountryHover}
      onReady={() => {
        // Globe chart is ready
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
    </div>
  );
}
