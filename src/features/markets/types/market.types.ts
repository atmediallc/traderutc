/**
 * Market Types
 */

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
  /** Unique identifier (e.g., 'NYSE') */
  id: string;
  /** Display name of the city/center */
  city: string;
  /** Primary exchanges in this city */
  exchanges: string[];
  /** IANA timezone identifier (e.g., 'America/New_York') */
  timezone: string;
  /** Country code or name */
  country: string;
  /** Coordinates [lat, lng] */
  coordinates: [number, number];
  /** Local open time (HH:mm) */
  openLocal: string;
  /** Local close time (HH:mm) */
  closeLocal: string;
  /** Optional pre-market open time (HH:mm) */
  preMarketOpenLocal?: string;
  /** Optional after-hours close time (HH:mm) */
  afterHoursCloseLocal?: string;
  /** Base currency */
  currency: string;
  /** Major indexes */
  majorIndexes: string[];
  /** Flag for Asian markets with lunch break */
  hasLunchBreak?: boolean;
  /** Local lunch start (HH:mm) */
  lunchStartLocal?: string;
  /** Local lunch end (HH:mm) */
  lunchEndLocal?: string;
}

/** Computed real-time status of a market */
export interface ComputedMarketStatus {
  marketId: string;
  status: MarketStatus;
  /** Local time of the market */
  localTime: string;
  /** UTC offset in hours */
  utcOffset: number;
  /** Is Daylight Saving Time active? */
  isDst: boolean;
  /** Milliseconds until next state change (open/close) */
  msUntilNextChange: number | null;
  /** Description of next change (e.g., 'Opens in 2h 30m') */
  nextChangeText: string | null;
}
