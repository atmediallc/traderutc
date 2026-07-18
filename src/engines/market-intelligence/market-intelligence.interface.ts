import { ComputedMarketStatus, TradingWave, MarketOverlap } from '../shared/engine.types';

export interface IMarketIntelligenceEngine {
  computeMarketStatus(marketId: string, utcMs: number): ComputedMarketStatus;
  getActiveMarkets(utcMs: number): ComputedMarketStatus[];
  getUpcomingMarkets(utcMs: number): ComputedMarketStatus[];
  getCurrentTradingWave(utcMs: number): TradingWave;
  getGlobalLiquidity(utcMs: number): number;
  getSessionOverlap(utcMs: number): MarketOverlap[];
  getNextOpening(utcMs: number): { marketId: string; timeRemainingMs: number } | null;
  getNextClosing(utcMs: number): { marketId: string; timeRemainingMs: number } | null;
  getMarketHeat(utcMs: number): number;
}
