/**
 * Core Engine Shared Type Definitions
 */

/** Asset Class types */
export type AssetClass = 'Stocks' | 'Futures' | 'Crypto' | 'Forex';

/** Possible trading states for a market */
export type MarketStatus = 
  | 'OPEN'
  | 'CLOSED'
  | 'PRE_MARKET'
  | 'AFTER_HOURS'
  | 'HOLIDAY'
  | 'EARLY_CLOSE'
  | 'HALTED';

/** A financial center / market definition */
export interface Market {
  id: string;
  city: string;
  exchanges: string[];
  assetClasses?: AssetClass[];
  timezone: string;
  country: string;
  coordinates: [number, number];
  openLocal: string;
  closeLocal: string;
  preMarketOpenLocal?: string;
  afterHoursCloseLocal?: string;
  currency: string;
  majorIndexes: string[];
  hasLunchBreak?: boolean;
  lunchStartLocal?: string;
  lunchEndLocal?: string;
}

/** Computed real-time status of a market */
export interface ComputedMarketStatus {
  marketId: string;
  status: MarketStatus;
  localTime: string;
  utcOffset: number;
  isDst: boolean;
  msUntilNextChange: number | null;
  nextChangeText: string | null;
}

/** Represents a user-selected clock */
export interface UTCClock {
  id: string;
  label: string;
  offset: number;
  ianaZone: string | null;
  isDst: boolean;
}

/** All time format outputs for the time and rendering layers */
export interface TimeFormats {
  utc: string;
  gmt: string;
  iso8601: string;
  unixTimestamp: number;
  julianDate: string;
  gpsTime: string;
  weekNumber: number;
  dayOfYear: number;
  isLeapYear: boolean;
  currentDate: string;
  dayName: string;
}

/** Sun position outputs from astronomical calculations */
export interface SunPosition {
  declination: number;
  rightAscension: number;
  greenwichHourAngle: number;
  subSolarLatitude: number;
  subSolarLongitude: number;
  direction: [number, number, number];
}

/** Moon position and phase outputs */
export interface MoonPosition {
  rightAscension: number;
  declination: number;
  distance: number; // in Earth radii
  phase: number; // 0 to 1 (new moon to new moon)
  illumination: number; // fraction 0 to 1
}

/** Represents a global trading session wave */
export interface TradingWave {
  id: string;
  name: string;
  active: boolean;
  progress: number; // 0 to 100
  exchanges: string[];
}

/** Represents a market overlap event */
export interface MarketOverlap {
  id: string;
  name: string;
  active: boolean;
  startLocal: string;
  endLocal: string;
}
