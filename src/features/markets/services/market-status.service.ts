/**
 * Market Status Service
 *
 * Computes the real-time status of any market based on UTC time.
 */
import { DateTime } from 'luxon';
import type { Market, ComputedMarketStatus, MarketStatus } from '../types/market.types';
import { getLocalTimeOnCurrentDay, isWeekend } from './market-schedule.service';

export function computeMarketStatus(market: Market, utcMs: number): ComputedMarketStatus {
  const currentZoned = DateTime.fromMillis(utcMs, { zone: market.timezone });
  
  const localTime = currentZoned.toFormat('HH:mm:ss');
  const utcOffset = currentZoned.offset / 60;
  const isDst = currentZoned.isInDST;

  let status: MarketStatus = 'CLOSED';
  let nextChangeText: string | null = null;
  let msUntilNextChange: number | null = null;

  if (isWeekend(market, utcMs)) {
    status = 'CLOSED';
    nextChangeText = 'Opens Monday'; // Simplified, could check actual open time next week
  } else {
    const openTime = getLocalTimeOnCurrentDay(market.openLocal, market, utcMs);
    const closeTime = getLocalTimeOnCurrentDay(market.closeLocal, market, utcMs);
    
    let preOpenTime: DateTime | null = null;
    if (market.preMarketOpenLocal) {
      preOpenTime = getLocalTimeOnCurrentDay(market.preMarketOpenLocal, market, utcMs);
    }
    
    let afterCloseTime: DateTime | null = null;
    if (market.afterHoursCloseLocal) {
      afterCloseTime = getLocalTimeOnCurrentDay(market.afterHoursCloseLocal, market, utcMs);
    }

    if (market.hasLunchBreak && market.lunchStartLocal && market.lunchEndLocal) {
      const lunchStart = getLocalTimeOnCurrentDay(market.lunchStartLocal, market, utcMs);
      const lunchEnd = getLocalTimeOnCurrentDay(market.lunchEndLocal, market, utcMs);
      
      if (currentZoned >= lunchStart && currentZoned < lunchEnd) {
        status = 'CLOSED'; // Lunch break
        msUntilNextChange = lunchEnd.toMillis() - currentZoned.toMillis();
        nextChangeText = `Lunch break ends in ${formatDuration(msUntilNextChange)}`;
      }
    }

    if (status !== 'CLOSED' || (!market.hasLunchBreak)) { // If not on lunch break
      if (currentZoned >= openTime && currentZoned < closeTime) {
        status = 'OPEN';
        msUntilNextChange = closeTime.toMillis() - currentZoned.toMillis();
        nextChangeText = `Closes in ${formatDuration(msUntilNextChange)}`;
      } else if (preOpenTime && currentZoned >= preOpenTime && currentZoned < openTime) {
        status = 'PRE_MARKET';
        msUntilNextChange = openTime.toMillis() - currentZoned.toMillis();
        nextChangeText = `Opens in ${formatDuration(msUntilNextChange)}`;
      } else if (afterCloseTime && currentZoned >= closeTime && currentZoned < afterCloseTime) {
        status = 'AFTER_HOURS';
        msUntilNextChange = afterCloseTime.toMillis() - currentZoned.toMillis();
        nextChangeText = `After hours close in ${formatDuration(msUntilNextChange)}`;
      } else if (currentZoned < openTime) {
         status = 'CLOSED';
         msUntilNextChange = (preOpenTime || openTime).toMillis() - currentZoned.toMillis();
         nextChangeText = `Opens in ${formatDuration(msUntilNextChange)}`;
      } else {
         status = 'CLOSED';
         // It's after close time, calculate time until NEXT day's open
         const nextDayOpen = (preOpenTime || openTime).plus({ days: 1 });
         msUntilNextChange = nextDayOpen.toMillis() - currentZoned.toMillis();
         nextChangeText = `Opens tomorrow in ${formatDuration(msUntilNextChange)}`;
      }
    }
  }

  // TODO: Check holidays calendar

  return {
    marketId: market.id,
    status,
    localTime,
    utcOffset,
    isDst,
    msUntilNextChange,
    nextChangeText,
  };
}

function formatDuration(ms: number): string {
  const duration = DateTime.fromMillis(ms, { zone: 'utc' });
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
