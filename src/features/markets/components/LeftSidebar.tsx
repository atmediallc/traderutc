/**
 * LeftSidebar Component
 *
 * Professional institutional-grade market monitor panel with session
 * progress visualization, GIS telemetry, and regional grouping.
 * Inspired by Bloomberg Terminal and TradingView layouts.
 */
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe2, Compass, TrendingUp, TrendingDown } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { marketIntelligenceEngine, MARKETS, Market } from '@/engines';
import type { ComputedMarketStatus } from '@/engines/shared/engine.types';

/* ─── Region classification ─── */
const REGION_TABS = ['ALL', 'AMER', 'EMEA', 'APAC'] as const;
type RegionTab = (typeof REGION_TABS)[number];

function getMarketRegion(market: Market): 'AMER' | 'EMEA' | 'APAC' {
  const tz = market.timezone;
  if (tz.startsWith('America/')) return 'AMER';
  if (tz.startsWith('Europe/') || tz.startsWith('Africa/') || tz.startsWith('Atlantic/') || tz.startsWith('Asia/Dubai') || tz.startsWith('Asia/Jerusalem')) return 'EMEA';
  return 'APAC';
}

/* ─── Helpers ─── */
function computeSessionProgress(status: ComputedMarketStatus, market: Market): number {
  if (status.status !== 'OPEN') return 0;
  const [openH, openM] = market.openLocal.split(':').map(Number);
  const [closeH, closeM] = market.closeLocal.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const totalDuration = closeMinutes - openMinutes;
  if (totalDuration <= 0) return 0;
  const [h, m] = status.localTime.split(':').map(Number);
  const nowMinutes = h * 60 + m;
  const elapsed = Math.max(0, Math.min(totalDuration, nowMinutes - openMinutes));
  return (elapsed / totalDuration) * 100;
}

export function LeftSidebar() {
  const isOpen = useLayoutStore((s) => s.leftSidebarOpen);
  const toggle = useLayoutStore((s) => s.toggleLeftSidebar);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  const selectedMarketId = useMarketsStore((s) => s.selectedMarketId);
  const utcMs = useUTCStore((s) => s.utcMs);

  const [regionFilter, setRegionFilter] = useState<RegionTab>('ALL');

  /* Compute all market statuses once */
  const allStatuses = useMemo(
    () => MARKETS.map((m) => ({ market: m, status: marketIntelligenceEngine.computeMarketStatus(m.id, utcMs), region: getMarketRegion(m) })),
    [utcMs],
  );

  const filteredMarkets = useMemo(
    () =>
      regionFilter === 'ALL'
        ? allStatuses
        : allStatuses.filter(({ region }) => region === regionFilter),
    [allStatuses, regionFilter],
  );

  /* Counts per region for tab badges */
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: MARKETS.length };
    for (const tab of REGION_TABS) {
      if (tab === 'ALL') continue;
      counts[tab] = MARKETS.filter((m) => getMarketRegion(m) === tab).length;
    }
    return counts;
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: -360 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -360 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 top-[98px] bottom-10 z-40 w-[22rem] max-md:left-0 max-md:top-[84px] max-md:bottom-0 max-md:w-full max-md:max-w-[min(22rem,calc(100vw-1.5rem))] max-md:rounded-none rounded-[16px] border border-white/10 flex flex-col will-change-transform overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(8,12,20,0.92) 0%, rgba(3,5,10,0.98) 100%)',
            backdropFilter: 'blur(32px) saturate(190%)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] select-none shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-[4px] bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Globe2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/90">
                  Market Monitor
                </h2>
                <p className="text-[8px] tracking-[0.2em] uppercase text-white/25">
                  Global Trading Sessions
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 rounded-[4px] text-white/25 hover:bg-white/5 hover:text-white/60 transition-all"
              aria-label="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ─── Region Tabs ─── */}
          <div className="flex gap-[3px] px-3 py-2 bg-white/[0.015] border-b border-[var(--border-subtle)] select-none shrink-0">
            {REGION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setRegionFilter(tab)}
                className={`relative flex-1 py-[5px] max-md:min-h-[44px] max-md:flex max-md:items-center px-1 rounded-[3px] text-[9px] font-bold tracking-[0.1em] transition-all duration-150 ${
                  regionFilter === tab
                    ? 'text-emerald-400 bg-emerald-500/8'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab}
                  <span
                    className={`text-[7px] px-1 py-[1px] rounded-[2px] font-mono ${
                      regionFilter === tab
                        ? 'bg-emerald-500/20 text-emerald-400/80'
                        : 'bg-white/5 text-white/25'
                    }`}
                  >
                    {regionCounts[tab]}
                  </span>
                </span>
                {regionFilter === tab && (
                  <motion.div
                    layoutId="region-tab-bg"
                    className="absolute inset-0 rounded-[3px] border border-emerald-500/20"
                    style={{ background: 'linear-gradient(180deg, rgba(52,211,153,0.08) 0%, rgba(52,211,153,0.03) 100%)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ─── Markets List ─── */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-1.5 px-2 space-y-[2px]">
            {filteredMarkets.map(({ market, status, region }) => {
              const statusColor = getStatusColor(status.status);
              const isSelected = selectedMarketId === market.id;
              const progress = computeSessionProgress(status, market);
              const [lat, lng] = market.coordinates;

              return (
                <button
                  key={market.id}
                  onClick={() => selectMarket(market.id)}
                  className={`
                    group w-full text-left rounded-[4px] transition-all duration-150
                    ${isSelected
                      ? 'bg-gradient-to-r from-white/[0.07] to-transparent border border-white/12'
                      : 'border border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'}
                  `}
                >
                  <div className="px-2.5 py-2">
                    {/* Top row: city + exchange + time + status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Status indicator dot */}
                        <div
                          className="w-[5px] h-[5px] rounded-full shrink-0 transition-all duration-300"
                          style={{
                            backgroundColor: statusColor,
                            boxShadow: isSelected ? `0 0 6px ${statusColor}` : 'none',
                          }}
                        />
                        <div className="min-w-0">
                          <div className={`text-[11px] font-semibold tracking-tight leading-tight transition-colors ${
                            isSelected ? 'text-white' : 'text-white/85 group-hover:text-white/95'
                          }`}>
                            {market.city.toUpperCase()}
                          </div>
                          <div className="text-[7px] font-medium tracking-[0.12em] uppercase text-white/25 leading-tight">
                            {market.exchanges[0]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          suppressHydrationWarning
                          className="text-[11px] font-semibold font-mono text-white/70 tracking-tight"
                        >
                          {status.localTime.slice(0, 5)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[8px] font-bold tracking-[0.08em] uppercase"
                            style={{ color: statusColor }}
                          >
                            {status.status === 'OPEN'
                              ? 'OPEN'
                              : status.status === 'CLOSED'
                                ? 'CLSD'
                                : status.status === 'PRE_MARKET'
                                  ? 'PRE'
                                  : status.status === 'AFTER_HOURS'
                                    ? 'AH'
                                    : status.status.replace('_', ' ')}
                          </span>
                          {status.status === 'OPEN' && (
                            <TrendingUp className="w-2.5 h-2.5 text-emerald-400/60" />
                          )}
                          {status.status === 'CLOSED' && (
                            <TrendingDown className="w-2.5 h-2.5 text-red-400/40" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: progress bar + telemetry */}
                    <div className="flex items-center gap-3 mt-1.5">
                      {/* Progress bar */}
                      <div className="flex-1 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${statusColor}, ${statusColor}88)`,
                            boxShadow: isSelected ? `0 0 6px ${statusColor}44` : 'none',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>

                      {/* Telemetry */}
                      <div className="flex items-center gap-2 text-[7px] font-medium text-white/20 tracking-wider">
                        <span className="flex items-center gap-1">
                          <Compass className="w-2 h-2 text-white/15" />
                          {Math.abs(lat).toFixed(1)}°{lat >= 0 ? 'N' : 'S'} / {Math.abs(lng).toFixed(1)}°{lng >= 0 ? 'E' : 'W'}
                        </span>
                        <span className="text-white/15">|</span>
                        <span>
                          UTC{status.utcOffset >= 0 ? `+${status.utcOffset}` : status.utcOffset}
                        </span>
                        {status.isDst && (
                          <>
                            <span className="text-white/15">|</span>
                            <span className="text-amber-400/50">DST</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredMarkets.length === 0 && (
              <div className="flex items-center justify-center h-24 text-[10px] text-white/20 tracking-wider">
                NO MARKETS FOUND
              </div>
            )}
          </div>

          {/* ─── Footer Summary ─── */}
          <div className="shrink-0 px-4 py-2 border-t border-[var(--border-subtle)] bg-white/[0.015]">
            <div className="flex items-center justify-between text-[8px] font-medium tracking-wider text-white/25">
              <span>
                {filteredMarkets.length} / {MARKETS.length} SESSIONS
              </span>
              <span className="flex items-center gap-2">
                {allStatuses.filter((s) => s.status.status === 'OPEN').length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-open)]" />
                    <span className="text-emerald-400/60">{allStatuses.filter((s) => s.status.status === 'OPEN').length} OPEN</span>
                  </span>
                )}
                {allStatuses.filter((s) => s.status.status === 'CLOSED').length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-closed)]" />
                    <span className="text-red-400/50">{allStatuses.filter((s) => s.status.status === 'CLOSED').length} CLSD</span>
                  </span>
                )}
              </span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
