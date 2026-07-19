import { DateTime } from 'luxon';
import { marketEngine } from '../market/market.engine';
import { ComputedMarketStatus, TradingWave, MarketOverlap, MarketStatus } from '../shared/engine.types';
import { IMarketIntelligenceEngine } from './market-intelligence.interface';

export class MarketIntelligenceEngine implements IMarketIntelligenceEngine {
  computeMarketStatus(marketId: string, utcMs: number): ComputedMarketStatus {
    const market = marketEngine.getMarketById(marketId);
    if (!market) {
      throw new Error(`Market not found: ${marketId}`);
    }

    const currentZoned = DateTime.fromMillis(utcMs, { zone: market.timezone });
    const localTime = currentZoned.toFormat('HH:mm:ss');
    const utcOffset = currentZoned.offset / 60;
    const isDst = currentZoned.isInDST;

    let status: MarketStatus = 'CLOSED';
    let nextChangeText: string | null = null;
    let msUntilNextChange: number | null = null;

    if (marketEngine.isWeekend(marketId, utcMs)) {
      status = 'CLOSED';
      nextChangeText = 'Opens Monday';
    } else {
      const openTime = marketEngine.getLocalTimeOnCurrentDay(market.openLocal, marketId, utcMs);
      const closeTime = marketEngine.getLocalTimeOnCurrentDay(market.closeLocal, marketId, utcMs);

      let preOpenTime: DateTime | null = null;
      if (market.preMarketOpenLocal) {
        preOpenTime = marketEngine.getLocalTimeOnCurrentDay(market.preMarketOpenLocal, marketId, utcMs);
      }

      let afterCloseTime: DateTime | null = null;
      if (market.afterHoursCloseLocal) {
        afterCloseTime = marketEngine.getLocalTimeOnCurrentDay(market.afterHoursCloseLocal, marketId, utcMs);
      }

      if (market.hasLunchBreak && market.lunchStartLocal && market.lunchEndLocal) {
        const lunchStart = marketEngine.getLocalTimeOnCurrentDay(market.lunchStartLocal, marketId, utcMs);
        const lunchEnd = marketEngine.getLocalTimeOnCurrentDay(market.lunchEndLocal, marketId, utcMs);

        if (currentZoned >= lunchStart && currentZoned < lunchEnd) {
          status = 'CLOSED'; // Lunch break
          msUntilNextChange = lunchEnd.toMillis() - currentZoned.toMillis();
          nextChangeText = `Lunch break ends in ${this.formatDuration(msUntilNextChange)}`;
        }
      }

      if (status !== 'CLOSED' || !market.hasLunchBreak) {
        if (currentZoned >= openTime && currentZoned < closeTime) {
          status = 'OPEN';
          msUntilNextChange = closeTime.toMillis() - currentZoned.toMillis();
          nextChangeText = `Closes in ${this.formatDuration(msUntilNextChange)}`;
        } else if (preOpenTime && currentZoned >= preOpenTime && currentZoned < openTime) {
          status = 'PRE_MARKET';
          msUntilNextChange = openTime.toMillis() - currentZoned.toMillis();
          nextChangeText = `Opens in ${this.formatDuration(msUntilNextChange)}`;
        } else if (afterCloseTime && currentZoned >= closeTime && currentZoned < afterCloseTime) {
          status = 'AFTER_HOURS';
          msUntilNextChange = afterCloseTime.toMillis() - currentZoned.toMillis();
          nextChangeText = `After hours close in ${this.formatDuration(msUntilNextChange)}`;
        } else if (currentZoned < openTime) {
          status = 'CLOSED';
          msUntilNextChange = (preOpenTime || openTime).toMillis() - currentZoned.toMillis();
          nextChangeText = `Opens in ${this.formatDuration(msUntilNextChange)}`;
        } else {
          status = 'CLOSED';
          const nextDayOpen = (preOpenTime || openTime).plus({ days: 1 });
          msUntilNextChange = nextDayOpen.toMillis() - currentZoned.toMillis();
          nextChangeText = `Opens tomorrow in ${this.formatDuration(msUntilNextChange)}`;
        }
      }
    }

    return {
      marketId,
      status,
      localTime,
      utcOffset,
      isDst,
      msUntilNextChange,
      nextChangeText,
    };
  }

  getActiveMarkets(utcMs: number): ComputedMarketStatus[] {
    return marketEngine.getMarkets()
      .map((m) => this.computeMarketStatus(m.id, utcMs))
      .filter((status) => status.status === 'OPEN' || status.status === 'PRE_MARKET' || status.status === 'AFTER_HOURS');
  }

  getUpcomingMarkets(utcMs: number): ComputedMarketStatus[] {
    return marketEngine.getMarkets()
      .map((m) => this.computeMarketStatus(m.id, utcMs))
      .filter((status) => status.status === 'CLOSED')
      .sort((a, b) => (a.msUntilNextChange || 0) - (b.msUntilNextChange || 0));
  }

  getCurrentTradingWave(utcMs: number): TradingWave {
    const active = this.getActiveMarkets(utcMs);
    const hour = DateTime.fromMillis(utcMs, { zone: 'utc' }).hour;

    // Asian wave: typically 00:00 to 09:00 UTC
    // European wave: typically 07:00 to 16:00 UTC
    // American wave: typically 13:00 to 22:00 UTC
    let name = 'Global Consolidation';
    let id = 'consolidation';
    let exchanges: string[] = [];
    let progress = 50;

    if (hour >= 22 || hour < 7) {
      id = 'asia';
      name = 'Asian Trading Session';
      exchanges = ['TSE', 'HKEX', 'ASX', 'SGX'];
      progress = hour >= 22 ? ((hour - 22) / 9) * 100 : ((hour + 2) / 9) * 100;
    } else if (hour >= 7 && hour < 13) {
      id = 'europe';
      name = 'European Trading Session';
      exchanges = ['LSE', 'XETRA', 'SIX', 'Euronext'];
      progress = ((hour - 7) / 6) * 100;
    } else if (hour >= 13 && hour < 22) {
      id = 'america';
      name = 'American Trading Session';
      exchanges = ['NYSE', 'NASDAQ', 'CME', 'TSX'];
      progress = ((hour - 13) / 9) * 100;
    }

    return {
      id,
      name,
      active: active.length > 0,
      progress: Math.min(100, Math.max(0, Math.round(progress))),
      exchanges,
    };
  }

  getGlobalLiquidity(utcMs: number): number {
    const active = this.getActiveMarkets(utcMs);
    let totalLiquidity = 0;

    // Assign weight to exchanges
    // NYSE / NASDAQ: 40
    // LSE: 20
    // TSE / HKEX: 15
    // Others: 5-10
    active.forEach((status) => {
      const market = marketEngine.getMarketById(status.marketId);
      if (!market) return;

      let weight = 5;
      if (market.exchanges.includes('NYSE') || market.exchanges.includes('NASDAQ')) weight = 40;
      else if (market.exchanges.includes('LSE')) weight = 20;
      else if (market.exchanges.includes('TSE') || market.exchanges.includes('HKEX')) weight = 15;
      else if (market.exchanges.includes('CME')) weight = 15;

      if (status.status === 'PRE_MARKET' || status.status === 'AFTER_HOURS') {
        weight *= 0.25; // 25% liquidity during pre/post market
      }

      totalLiquidity += weight;
    });

    return Math.min(100, totalLiquidity);
  }

  getSessionOverlap(utcMs: number): MarketOverlap[] {
    const overlaps: MarketOverlap[] = [];
    const active = this.getActiveMarkets(utcMs).map(m => m.marketId);

    // Tokyo - London Overlap
    const tokyoActive = active.includes('TOKYO');
    const londonActive = active.includes('LONDON');
    overlaps.push({
      id: 'tokyo-london',
      name: 'Asia-Europe Overlap (Tokyo / London)',
      active: tokyoActive && londonActive,
      startLocal: '08:00 BST',
      endLocal: '15:00 JST',
    });

    // London - New York Overlap
    const nyActive = active.includes('NEW_YORK');
    overlaps.push({
      id: 'london-newyork',
      name: 'Europe-US Overlap (London / New York)',
      active: londonActive && nyActive,
      startLocal: '13:30 BST',
      endLocal: '16:30 BST',
    });

    return overlaps;
  }

  getNextOpening(utcMs: number): { marketId: string; timeRemainingMs: number } | null {
    const upcoming = this.getUpcomingMarkets(utcMs);
    const next = upcoming[0];
    if (next && next.msUntilNextChange !== null) {
      return {
        marketId: next.marketId,
        timeRemainingMs: next.msUntilNextChange,
      };
    }
    return null;
  }

  getNextClosing(utcMs: number): { marketId: string; timeRemainingMs: number } | null {
    const active = this.getActiveMarkets(utcMs);
    const closingSoon = active
      .filter((s) => s.status === 'OPEN' && s.msUntilNextChange !== null)
      .sort((a, b) => (a.msUntilNextChange || 0) - (b.msUntilNextChange || 0));
    
    const next = closingSoon[0];
    if (next && next.msUntilNextChange !== null) {
      return {
        marketId: next.marketId,
        timeRemainingMs: next.msUntilNextChange,
      };
    }
    return null;
  }

  getMarketHeat(utcMs: number): number {
    // Computed based on overall market overlaps and liquidity
    const liquidity = this.getGlobalLiquidity(utcMs);
    const overlaps = this.getSessionOverlap(utcMs).filter((o) => o.active).length;
    
    const heat = liquidity + overlaps * 25;
    return Math.min(100, Math.round(heat));
  }

  private formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

export const marketIntelligenceEngine = new MarketIntelligenceEngine();
