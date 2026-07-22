/**
 * MarketSessionPanel Component
 *
 * Professional Bloomberg-inspired market sessions dashboard.
 * Displays all global markets grouped by region with real-time status,
 * local time, schedule, and animated countdown progress bars.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │ 🔴 MARKET SESSIONS            [search] [filter] ✕│
 * │ ● 6 OPEN  ● 4 CLOSED  ● 2 PRE  ● 1 AH         │
 * ├──────────────────────────────────────────────────┤
 * │  AMERICAS (5)                          [▾]       │
 * │  🟢 NYSE · NASDAQ  OPEN  14:32  ████░░░ 3h      │
 * │  ...                                              │
 * │  EUROPE (4)                                       │
 * │  ...                                              │
 * └──────────────────────────────────────────────────┘
 */
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { marketIntelligenceEngine, Market, MARKETS } from '@/engines';
import { cn } from '@/lib/utils';
import type { MarketStatus } from '@/engines/shared/engine.types';

/* ─── Region Definitions ─── */
const REGIONS = [
  {
    id: 'americas',
    label: 'Americas',
    markets: ['NEW_YORK', 'CHICAGO', 'TORONTO', 'SAO_PAULO', 'MEXICO_CITY'],
  },
  {
    id: 'europe',
    label: 'Europe',
    markets: ['LONDON', 'FRANKFURT', 'ZURICH', 'PARIS', 'AMSTERDAM', 'MADRID', 'MILAN'],
  },
  {
    id: 'middle-east',
    label: 'Middle East & Africa',
    markets: ['DUBAI', 'JOHANNESBURG'],
  },
  {
    id: 'asia-pacific',
    label: 'Asia-Pacific',
    markets: ['MUMBAI', 'SINGAPORE', 'HONG_KONG', 'SHANGHAI', 'TOKYO', 'SEOUL', 'SYDNEY'],
  },
];

type FilterStatus = 'all' | 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';

/* ─── Main Component ─── */
export function MarketSessionPanel() {
  const { sessionPanelOpen, toggleSessionPanel } = useLayoutStore();
  const utcMs = useUTCStore((s) => s.utcMs);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [collapsedRegions, setCollapsedRegions] = useState<Set<string>>(new Set());

  /* Compute status for all markets */
  const marketStatuses = useMemo(() => {
    return MARKETS.map((m) => ({
      market: m,
      status: marketIntelligenceEngine.computeMarketStatus(m.id, utcMs),
    }));
  }, [utcMs]);

  /* Filter by search + status */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return marketStatuses.filter(({ market, status }) => {
      const matchesSearch =
        !q ||
        market.city.toLowerCase().includes(q) ||
        market.country.toLowerCase().includes(q) ||
        market.exchanges.some((e) => e.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || status.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [marketStatuses, search, statusFilter]);

  /* Summary counts */
  const counts = useMemo(() => {
    const c: Record<string, number> = { OPEN: 0, CLOSED: 0, PRE_MARKET: 0, AFTER_HOURS: 0 };
    marketStatuses.forEach(({ status }) => {
      if (status.status in c) c[status.status]++;
    });
    return c;
  }, [marketStatuses]);

  const toggleRegion = (id: string) => {
    setCollapsedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {sessionPanelOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="absolute top-[124px] left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[64rem] max-h-[74vh] max-md:max-h-[85vh] rounded-2xl border border-white/12 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)] overflow-y-auto flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(10,12,18,0.95) 0%, rgba(6,8,14,0.98) 100%)',
            backdropFilter: 'blur(32px)',
          }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-[#00E5A8]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Market Sessions
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-56 rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#00E5A8]/50 transition-colors"
                />
              </div>

              <button
                onClick={toggleSessionPanel}
                className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Summary Bar ─── */}
          <div className="flex items-center gap-5 px-5 py-2.5 border-b border-white/8 shrink-0">
            <StatusPip label="OPEN" count={counts.OPEN} />
            <StatusPip label="CLOSED" count={counts.CLOSED} />
            <StatusPip label="PRE" count={counts.PRE_MARKET} />
            <StatusPip label="AH" count={counts.AFTER_HOURS} />

            <div className="flex-1" />

            {/* Filter chips */}
            {(['all', 'OPEN', 'CLOSED', 'PRE_MARKET', 'AFTER_HOURS'] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all duration-150 cursor-pointer',
                  statusFilter === f
                    ? 'border-[#00E5A8]/40 bg-[#00E5A8]/15 text-[#00E5A8]'
                    : 'border-white/10 bg-white/5 text-white/40 hover:text-white/80'
                )}
              >
                {f === 'all' ? 'All' : f === 'AFTER_HOURS' ? 'AH' : f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* ─── Column Headers ─── */}
          <div className="grid grid-cols-[1.2fr_100px_80px_110px_1fr_100px] max-md:grid-cols-[1.2fr_100px] gap-2 px-5 py-2.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider border-b border-white/8 shrink-0">
            <div>Market</div>
            <div>Status</div>
            <div className="max-md:hidden">Local</div>
            <div className="max-md:hidden">Schedule</div>
            <div className="max-md:hidden">Countdown</div>
            <div className="max-md:hidden text-right">UTC Offset</div>
          </div>

          {/* ─── Market Groups ─── */}
          <div className="overflow-y-auto flex-1 min-h-0">
            {REGIONS.map((region) => {
              const regionMarkets = filtered.filter((f) =>
                region.markets.includes(f.market.id)
              );
              if (regionMarkets.length === 0) return null;
              const isCollapsed = collapsedRegions.has(region.id);

              return (
                <div key={region.id}>
                  {/* Region Header */}
                  <button
                    onClick={() => toggleRegion(region.id)}
                    className="w-full flex items-center gap-2.5 px-5 py-2 text-xs font-bold text-white/60 uppercase tracking-widest border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                    )}
                    <span>{region.label}</span>
                    <span className="text-white/25">({regionMarkets.length})</span>
                    <div className="flex-1" />
                    {/* Open count in region */}
                    {regionMarkets.filter((r) => r.status.status === 'OPEN').length > 0 && (
                      <span className="text-[#00E5A8] font-bold">
                        {regionMarkets.filter((r) => r.status.status === 'OPEN').length} open
                      </span>
                    )}
                  </button>

                  {/* Market Rows */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {regionMarkets.map(({ market, status }) => (
                          <MarketRow
                            key={market.id}
                            market={market}
                            status={status}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-10 text-xs font-mono text-white/30">
                No markets match filters
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Sub-components ─── */

function StatusPip({ label, count }: { label: string; count: number }) {
  const color = getStatusColor(label === 'PRE' ? 'PRE_MARKET' : label === 'AH' ? 'AFTER_HOURS' : label);
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          count > 0 && 'animate-pulse'
        )}
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono font-bold text-white/50">{count}</span>
    </div>
  );
}

function MarketRow({ market, status }: { market: Market; status: { status: MarketStatus; localTime: string; utcOffset: number; nextChangeText: string | null; msUntilNextChange: number | null } }) {
  const statusColor = getStatusColor(status.status);
  const isOpen = status.status === 'OPEN';
  const progress = computeSessionProgress(market, status);

  return (
    <div className="grid grid-cols-[1.2fr_100px_80px_110px_1fr_100px] max-md:grid-cols-[1.2fr_100px] gap-2 px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center group">
      {/* Market Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        {isOpen && (
          <span className="w-2 h-2 rounded-full bg-[#00E5A8] shrink-0 shadow-[0_0_8px_rgba(0,229,168,0.6)]" />
        )}
        {!isOpen && (
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `${statusColor}50` }} />
        )}
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">
            {market.city}
          </div>
          <div className="text-[9px] text-[#94A3B8] truncate mt-0.5">
            {market.exchanges.join(' · ')}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase border',
            isOpen && 'shadow-[0_0_8px_rgba(0,229,168,0.2)]'
          )}
          style={{
            color: statusColor,
            backgroundColor: `${statusColor}15`,
            borderColor: `${statusColor}35`,
          }}
        >
          {status.status.replace('_', ' ')}
        </span>
      </div>

      {/* Local Time */}
      <div
        suppressHydrationWarning
        className="text-xs font-mono font-bold text-white/90 tabular-nums max-md:hidden"
      >
        {status.localTime.slice(0, 5)}
      </div>

      {/* Schedule */}
      <div className="text-xs text-[#94A3B8] font-mono tabular-nums max-md:hidden">
        {market.openLocal}–{market.closeLocal}
      </div>

      {/* Countdown Bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: statusColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[9px] text-[#94A3B8] font-mono whitespace-nowrap min-w-16 text-right">
          {status.nextChangeText || '—'}
        </span>
      </div>

      {/* UTC Offset */}
      <div className="text-right max-md:hidden">
        <span className="text-xs font-mono text-[#94A3B8] tabular-nums font-semibold">
          UTC{status.utcOffset >= 0 ? '+' : ''}{status.utcOffset}
        </span>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

/**
 * Compute how far through the current trading session we are (0-100%).
 * If market is closed, returns 0.
 */
function computeSessionProgress(
  market: Market,
  status: { status: MarketStatus; msUntilNextChange: number | null }
): number {
  if (status.status !== 'OPEN' && status.status !== 'AFTER_HOURS') return 0;

  // Approximate session duration in ms (rough: open to close)
  // Use msUntilNextChange as remaining time, estimate total session as ~6.5h for regular
  const sessionDurationMs = status.status === 'AFTER_HOURS'
    ? 4 * 3600 * 1000  // ~4h after-hours
    : 6.5 * 3600 * 1000; // ~6.5h regular session

  const remaining = status.msUntilNextChange ?? 0;
  const elapsed = Math.max(0, sessionDurationMs - remaining);

  return Math.min(100, Math.max(0, (elapsed / sessionDurationMs) * 100));
}
