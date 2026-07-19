/**
 * GlobeInteraction
 *
 * Manages country hover and click interactions on the ECharts globe.
 * Integrates with the Earth Zustand store for selected/hovered state.
 * Provides UTC-based color coding for countries.
 */

import type { ECharts } from 'echarts';
import type { CountryFeature, CountryCollection, GlobeCountryInfo, EChartsInternal } from './globe.types';

/**
 * Computes a local offset from a timezone ID string.
 */
function timezoneOffset(timezoneId: string): number {
  const now = Date.now();
  const date = new Date(now);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const localized = new Date(utc).toLocaleString('en-US', { timeZone: timezoneId });
  const localDate = new Date(localized);
  return (localDate.getTime() - utc) / 3600000;
}

/**
 * Computes local time string for a timezone.
 */
function localTimeString(timezoneId: string): string {
  const now = Date.now();
  const utc = now + new Date(now).getTimezoneOffset() * 60000;
  const local = utc + timezoneOffset(timezoneId) * 3600000;
  return new Date(local).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Determines whether the given timezone is currently observing DST.
 */
function isDst(timezoneId: string): boolean {
  const year = new Date().getFullYear();
  const jan = new Date(year, 0, 1);
  const jul = new Date(year, 6, 1);
  const janOffset = timezoneOffset(timezoneId);
  const julOffset = timezoneOffset(timezoneId);
  // Recompute with specific dates
  const janUtc = jan.getTime() + jan.getTimezoneOffset() * 60000;
  const julUtc = jul.getTime() + jul.getTimezoneOffset() * 60000;
  const janLocal = new Date(
    janUtc + janOffset * 3600000
  ).getTimezoneOffset();
  const julLocal = new Date(
    julUtc + julOffset * 3600000
  ).getTimezoneOffset();
  return janLocal !== julLocal;
}

/**
 * Resolves DST for a timezone.
 */
function isDstResolved(timezoneId: string): boolean {
  try {
    return isDst(timezoneId);
  } catch {
    return false;
  }
}

/**
 * Converts a CountryFeature to GlobeCountryInfo.
 */
function featureToInfo(feature: CountryFeature): GlobeCountryInfo {
  const offset = timezoneOffset(feature.properties.timezone);
  return {
    isoCode: feature.id,
    name: feature.properties.name,
    utcOffset: offset,
    localTime: localTimeString(feature.properties.timezone),
    isDst: isDstResolved(feature.properties.timezone),
    timezoneId: feature.properties.timezone,
    capital: feature.properties.capital,
    flag: feature.properties.flag,
    lat: feature.properties.lat,
    lng: feature.properties.lng,
  };
}

/**
 * Maps a UTC offset (-12 to +14) to a color in a cool-to-warm gradient.
 * Negative offsets (Americas) → cool blues/cyans
 * Zero (Europe/Africa)        → neutral teal
 * Positive offsets (Asia)     → warm blues/purples
 */
function utcOffsetToColor(offset: number): string {
  // Normalize offset to [0, 1] range (from -12 to +14)
  const t = (offset + 12) / 26;

  // Color stops: deep blue → cyan → teal → indigo → violet
  const colors = [
    [12, 35, 68],    // UTC-12: deep navy
    [15, 50, 90],    // UTC-6: dark blue
    [18, 65, 105],   // UTC-3: medium blue
    [20, 75, 110],   // UTC 0: teal-blue
    [22, 60, 100],   // UTC+3: blue
    [28, 50, 95],    // UTC+6: indigo blue
    [30, 42, 85],    // UTC+9: deep indigo
    [25, 35, 75],    // UTC+12: dark purple-blue
    [20, 30, 70],    // UTC+14: darkest
  ];

  const idx = t * (colors.length - 1);
  const i = Math.max(0, Math.min(colors.length - 2, Math.floor(idx)));
  const frac = idx - i;

  const r = Math.round(colors[i][0] + (colors[i + 1][0] - colors[i][0]) * frac);
  const g = Math.round(colors[i][1] + (colors[i + 1][1] - colors[i][1]) * frac);
  const b = Math.round(colors[i][2] + (colors[i + 1][2] - colors[i][2]) * frac);

  return `rgb(${r}, ${g}, ${b})`;
}

export interface InteractionCallbacks {
  onCountryClick: (info: GlobeCountryInfo) => void;
  onCountryHover: (info: GlobeCountryInfo | null) => void;
}

/**
 * Wire country click/hover events on an ECharts instance.
 */
export function wireGlobeInteractions(
  chart: ECharts,
  countries: CountryCollection,
  callbacks: InteractionCallbacks
): () => void {
  function handleClick(params: Record<string, unknown>) {
    const data = params?.data as { isoCode?: string } | undefined;
    if (!data?.isoCode) return;
    const feature = countries.features.find(
      (f) => f.id === data.isoCode
    );
    if (!feature) return;
    callbacks.onCountryClick(featureToInfo(feature));
  }

  function handleMouseover(params: Record<string, unknown>) {
    const data = params?.data as { isoCode?: string } | undefined;
    if (data?.isoCode) {
      const feature = countries.features.find(
        (f) => f.id === data.isoCode
      );
      if (feature) {
        callbacks.onCountryHover(featureToInfo(feature));
      }
    }
  }

  function handleMouseout() {
    callbacks.onCountryHover(null);
  }

  chart.on('click', 'series', handleClick);
  chart.on('mouseover', 'series', handleMouseover);
  chart.on('mouseout', 'series', handleMouseout);

  // Return a cleanup function (guards against already-disposed chart)
  return () => {
    try {
      const internal = chart as unknown as EChartsInternal;
      if (!internal._disposed) {
        chart.off('click', handleClick);
        chart.off('mouseover', handleMouseover);
        chart.off('mouseout', handleMouseout);
      }
    } catch {
      // Chart already disposed — safe to ignore
    }
  };
}

/**
 * Converts the countries GeoJSON to ECharts map series data format.
 * Each country gets a unique color based on its UTC offset for
 * a visually rich timezone-coded globe.
 */
export function countriesToMapData(countries: CountryCollection) {
  return countries.features.map((f) => {
    let offset = 0;
    try {
      offset = timezoneOffset(f.properties.timezone);
    } catch {
      // Fallback for unknown timezones
    }

    const areaColor = utcOffsetToColor(offset);

    return {
      name: f.properties.name,
      isoCode: f.id,
      value: 1, // Uniform value for rendering
      itemStyle: {
        areaColor,
        borderColor: 'rgba(90, 170, 255, 0.45)',
        borderWidth: 0.6,
      },
    };
  });
}

/**
 * Generates the ECharts map register data for countries.
 * This is used with echarts.registerMap to register the GeoJSON.
 */
export function getCountriesMapName(): string {
  return 'world_countries';
}
