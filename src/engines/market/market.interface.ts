import { DateTime } from 'luxon';
import { Market } from '../shared/engine.types';

export interface IMarketEngine {
  getMarkets(): Market[];
  getMarketById(id: string): Market | undefined;
  isWeekend(marketId: string, utcMs: number): boolean;
  getLocalTimeOnCurrentDay(timeStr: string, marketId: string, utcMs: number): DateTime;
  searchMarkets(query: string): Market[];
}
