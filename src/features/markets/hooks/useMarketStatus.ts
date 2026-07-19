/**
 * Hook to get real-time market status for a specific market
 */
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { marketIntelligenceEngine, Market, ComputedMarketStatus } from '@/engines';

export function useMarketStatus(market: Market): ComputedMarketStatus {
  // We use the global UTC tick to trigger recalculations
  const utcMs = useUTCStore((s) => s.utcMs);
  
  // Compute status on every tick.
  // Note: For extreme performance, this could be memoized/throttled if needed,
  // but computeMarketStatus is quite fast.
  return marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
}

/**
 * Helper to get status colors
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN':
      return '#22c55e'; // emerald-500
    case 'CLOSED':
      return '#ef4444'; // red-500
    case 'PRE_MARKET':
      return '#f59e0b'; // amber-500
    case 'AFTER_HOURS':
      return '#a855f7'; // purple-500
    case 'CLOSING_SOON':
      return '#3b82f6'; // blue-500
    case 'HOLIDAY':
    default:
      return '#6b7280'; // gray-500
  }
}
