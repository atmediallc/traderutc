/**
 * UTC Type Definitions
 */

/** A UTC offset value (e.g., 0, 5.5, -4) */
export type UTCOffset = number;

/** Represents a user-selected clock */
export interface UTCClock {
  /** Unique identifier */
  id: string;
  /** Display label (e.g., "UTC+5:30") */
  label: string;
  /** Numeric offset in hours from UTC */
  offset: UTCOffset;
  /** IANA timezone name if available (e.g., "Asia/Kolkata") */
  ianaZone: string | null;
  /** Whether this timezone currently observes DST */
  isDst: boolean;
}

/** All time format outputs for the header bar */
export interface TimeFormats {
  /** UTC time string (HH:mm:ss) */
  utc: string;
  /** GMT time string (same as UTC but labeled differently) */
  gmt: string;
  /** ISO 8601 format (2024-01-15T14:30:00Z) */
  iso8601: string;
  /** Unix timestamp (seconds since epoch) */
  unixTimestamp: number;
  /** Julian Date (continuous day count from 4713 BC) */
  julianDate: string;
  /** GPS Time (UTC - leap seconds offset) */
  gpsTime: string;
  /** ISO week number (1-53) */
  weekNumber: number;
  /** Day of year (1-366) */
  dayOfYear: number;
  /** Whether current year is a leap year */
  isLeapYear: boolean;
  /** Formatted date string */
  currentDate: string;
  /** Current day name */
  dayName: string;
}

/** Time tick payload from the global timer */
export interface TimeTick {
  /** Current UTC in milliseconds */
  utcMs: number;
  /** Current UTC as ISO string */
  utcIso: string;
  /** All computed time formats */
  formats: TimeFormats;
}
