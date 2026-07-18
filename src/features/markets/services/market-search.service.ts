/**
 * Market Search Service
 *
 * Provides fuzzy search capabilities across market data.
 */
import { MARKETS } from '../constants/market-data';
import type { Market } from '../types/market.types';

export function searchMarkets(query: string): Market[] {
  if (!query) return MARKETS;

  const normalizedQuery = query.toLowerCase().trim();

  return MARKETS.filter((market) => {
    return (
      market.city.toLowerCase().includes(normalizedQuery) ||
      market.country.toLowerCase().includes(normalizedQuery) ||
      market.id.toLowerCase().includes(normalizedQuery) ||
      market.exchanges.some(ex => ex.toLowerCase().includes(normalizedQuery)) ||
      market.majorIndexes.some(idx => idx.toLowerCase().includes(normalizedQuery))
    );
  });
}
