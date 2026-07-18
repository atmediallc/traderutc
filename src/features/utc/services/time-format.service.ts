/**
 * Time Format Service
 *
 * Computes all time representations from a UTC millisecond timestamp.
 * Uses Luxon for timezone-aware operations. Never uses native Date
 * for timezone calculations.
 */
import { DateTime } from 'luxon';
import type { TimeFormats } from '../types/utc.types';

/** Julian Date of Unix epoch (1970-01-01T00:00:00 UTC) */
const UNIX_EPOCH_JD = 2440587.5;

/** Milliseconds per day */
const MS_PER_DAY = 86400000;

/** Current GPS-UTC offset in seconds (as of 2025, 18 leap seconds) */
const GPS_UTC_OFFSET_SECONDS = 18;

/**
 * Computes all time format representations from a UTC timestamp.
 *
 * @param utcMs - Milliseconds since Unix epoch
 * @returns All computed time formats
 */
export function computeTimeFormats(utcMs: number): TimeFormats {
  const dt = DateTime.fromMillis(utcMs, { zone: 'utc' });

  // UTC / GMT
  const utc = dt.toFormat('HH:mm:ss');
  const gmt = utc; // Same time, different label

  // ISO 8601
  const iso8601 = dt.toISO() ?? '';

  // Unix timestamp (seconds)
  const unixTimestamp = Math.floor(utcMs / 1000);

  // Julian Date
  const jd = UNIX_EPOCH_JD + utcMs / MS_PER_DAY;
  const julianDate = jd.toFixed(5);

  // GPS Time (GPS epoch: 1980-01-06, no leap seconds in GPS)
  // GPS = UTC + leap_seconds (GPS doesn't have leap seconds, so it's ahead)
  const gpsMs = utcMs + GPS_UTC_OFFSET_SECONDS * 1000;
  const gpsDt = DateTime.fromMillis(gpsMs, { zone: 'utc' });
  const gpsTime = gpsDt.toFormat('HH:mm:ss');

  // Week number (ISO week)
  const weekNumber = dt.weekNumber;

  // Day of year
  const dayOfYear = dt.ordinal;

  // Leap year
  const isLeapYear = dt.isInLeapYear;

  // Formatted date
  const currentDate = dt.toFormat('yyyy-MM-dd');

  // Day name
  const dayName = dt.toFormat('cccc');

  return {
    utc,
    gmt,
    iso8601,
    unixTimestamp,
    julianDate,
    gpsTime,
    weekNumber,
    dayOfYear,
    isLeapYear,
    currentDate,
    dayName,
  };
}

/**
 * Formats a UTC offset as a display string.
 *
 * @param offset - Numeric UTC offset in hours (e.g., 5.5, -4)
 * @returns Formatted string (e.g., "UTC+5:30", "UTC-4", "UTC")
 */
export function formatUTCOffset(offset: number): string {
  if (offset === 0) return 'UTC';

  const sign = offset > 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset);
  const minutes = Math.round((absOffset - hours) * 60);

  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }
  return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts a UTC timestamp to a local time string for a given offset.
 *
 * @param utcMs - UTC milliseconds
 * @param offsetHours - Offset from UTC in hours
 * @returns Formatted local time string (HH:mm:ss)
 */
export function utcToOffsetTime(utcMs: number, offsetHours: number): string {
  const offsetMs = offsetHours * 3600000;
  const localMs = utcMs + offsetMs;
  const dt = DateTime.fromMillis(localMs, { zone: 'utc' });
  return dt.toFormat('HH:mm:ss');
}

/**
 * Gets the current time in a specific IANA timezone.
 *
 * @param utcMs - UTC milliseconds
 * @param ianaZone - IANA timezone identifier (e.g., "America/New_York")
 * @returns Formatted local time string (HH:mm:ss)
 */
export function utcToIANATime(utcMs: number, ianaZone: string): string {
  const dt = DateTime.fromMillis(utcMs, { zone: ianaZone });
  return dt.toFormat('HH:mm:ss');
}

/**
 * Checks if a given IANA timezone is currently observing DST.
 *
 * @param utcMs - UTC milliseconds
 * @param ianaZone - IANA timezone identifier
 * @returns Whether DST is currently active
 */
export function isDSTActive(utcMs: number, ianaZone: string): boolean {
  const dt = DateTime.fromMillis(utcMs, { zone: ianaZone });
  return dt.isInDST;
}

/**
 * Gets the current UTC offset (including DST) for an IANA timezone.
 *
 * @param utcMs - UTC milliseconds
 * @param ianaZone - IANA timezone identifier
 * @returns Current offset in hours (e.g., -4 for EDT)
 */
export function getCurrentOffset(utcMs: number, ianaZone: string): number {
  const dt = DateTime.fromMillis(utcMs, { zone: ianaZone });
  return dt.offset / 60; // Luxon returns offset in minutes
}
