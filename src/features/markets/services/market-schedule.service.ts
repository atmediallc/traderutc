/**
 * Market Schedule Service
 *
 * Handles parsing and comparing local times in specific IANA timezones.
 * Used to determine if a market is currently open.
 */
import { DateTime } from 'luxon';
import type { Market } from '../types/market.types';

/**
 * Parses a local time string (HH:mm) into a DateTime object
 * in the market's timezone, on the same day as the provided current UTC time.
 */
export function getLocalTimeOnCurrentDay(timeStr: string, market: Market, utcMs: number): DateTime {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const currentZoned = DateTime.fromMillis(utcMs, { zone: market.timezone });
  
  return currentZoned.set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0
  });
}

/**
 * Checks if the current time is a weekend in the market's timezone.
 * Dubai has Friday-Saturday weekends; most others have Saturday-Sunday.
 */
export function isWeekend(market: Market, utcMs: number): boolean {
  const currentZoned = DateTime.fromMillis(utcMs, { zone: market.timezone });
  const weekday = currentZoned.weekday; // 1 = Monday, 7 = Sunday
  
  if (market.id === 'DUBAI') {
    return weekday === 5 || weekday === 6; // Friday or Saturday
  }
  
  return weekday === 6 || weekday === 7; // Saturday or Sunday
}
