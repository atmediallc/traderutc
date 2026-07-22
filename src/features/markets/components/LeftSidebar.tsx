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
          className="absolute left-6 top-[124px] bottom-12 z-40 w-[24rem] md:w-[26rem] max-md:left-0 max-md:top-[90px] max-md:bottom-0 max-md:w-full max-md:rounded-none rounded-2xl border border-white/12 flex flex-col will-change-transform overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(8,12,20,0.95) 0%, rgba(3,5,10,0.98) 100%)',
            backdropFilter: 'blur(36px) saturate(190%)',
            WebkitBackdropFilter: 'blur(36px) saturate(190%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 select-none shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-white/95">
                  Market Monitor
                </h2>
                <p className="text-[9px] tracking-widest uppercase font-semibold text-[#94A3B8]">
                  Global Trading Sessions
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ─── Region Tabs ─── */}
          <div className="flex gap-1.5 px-4 py-2.5 bg-white/[0.02] border-b border-white/8 select-none shrink-0">
            {REGION_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setRegionFilter(tab)}
                className={`relative flex-1 py-1.5 px-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-150 cursor-pointer ${
                  regionFilter === tab
                    ? 'text-emerald-400 bg-emerald-500/12 border border-emerald-500/30'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab}
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      regionFilter === tab
                        ? 'bg-emerald-500/25 text-emerald-300'
                        : 'bg-white/8 text-white/40'
                    }`}
                  >
                    {regionCounts[tab]}
                  </span>
                </span>
                {regionFilter === tab && (
                  <motion.div
                    layoutId="region-tab-bg"
                    className="absolute inset-0 rounded-lg border border-emerald-500/30"
                    style={{ background: 'linear-gradient(180deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.04) 100%)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ─── Markets List ─── */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-2 px-3 space-y-1.5">
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
                    group w-full text-left rounded-xl transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? 'bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                      : 'border border-white/5 bg-white/[0.015] hover:bg-white/[0.05] hover:border-white/12'}
                  `}
                >
                  <div className="px-3.5 py-3">
                    {/* Top row: city + exchange + time + status */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Status indicator dot */}
                        <div
                          className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                          style={{
                            backgroundColor: statusColor,
                            boxShadow: isSelected ? `0 0 8px ${statusColor}` : `0 0 4px ${statusColor}88`,
                          }}
                        />
                        <div className="min-w-0">
                          <div className={`text-sm font-bold tracking-tight leading-tight transition-colors ${
                            isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                          }`}>
                            {market.city.toUpperCase()}
                          </div>
                          <div className="text-[9px] font-semibold tracking-wider uppercase text-[#94A3B8] leading-tight mt-0.5">
                            {market.exchanges[0]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          suppressHydrationWarning
                          className="text-sm font-bold font-mono text-white/90 tracking-tight"
                        >
                          {status.localTime.slice(0, 5)}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                          <span
                            className="text-[9px] font-bold tracking-wider uppercase"
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
                            <TrendingUp className="w-3 h-3 text-emerald-400/80" />
                          )}
                          {status.status === 'CLOSED' && (
                            <TrendingDown className="w-3 h-3 text-red-400/60" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: progress bar + telemetry */}
                    <div className="flex items-center gap-3.5 mt-2.5">
                      {/* Progress bar */}
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${statusColor}, ${statusColor}cc)`,
                            boxShadow: isSelected ? `0 0 8px ${statusColor}66` : 'none',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>

                      {/* Telemetry */}
                      <div className="flex items-center gap-2 text-[9px] font-medium text-[#94A3B8] tracking-wider">
                        <span className="flex items-center gap-1">
                          <Compass className="w-2.5 h-2.5 text-[#94A3B8]/60" />
                          {Math.abs(lat).toFixed(1)}°{lat >= 0 ? 'N' : 'S'} / {Math.abs(lng).toFixed(1)}°{lng >= 0 ? 'E' : 'W'}
                        </span>
                        <span className="text-white/20">•</span>
                        <span>
                          UTC{status.utcOffset >= 0 ? `+${status.utcOffset}` : status.utcOffset}
                        </span>
                        {status.isDst && (
                          <>
                            <span className="text-white/20">•</span>
                            <span className="text-amber-400 font-semibold">DST</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredMarkets.length === 0 && (
              <div className="flex items-center justify-center h-28 text-xs text-white/30 tracking-wider font-mono">
                NO MARKETS FOUND
              </div>
            )}
          </div>

          {/* ─── Footer Summary ─── */}
          <div className="shrink-0 px-5 py-3 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-[#94A3B8]">
              <span>
                {filteredMarkets.length} / {MARKETS.length} SESSIONS
              </span>
              <span className="flex items-center gap-3">
                {allStatuses.filter((s) => s.status.status === 'OPEN').length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00E5A8] shadow-[0_0_6px_rgba(0,229,168,0.8)]" />
                    <span className="text-[#00E5A8] font-bold">{allStatuses.filter((s) => s.status.status === 'OPEN').length} OPEN</span>
                  </span>
                )}
                {allStatuses.filter((s) => s.status.status === 'CLOSED').length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400/80" />
                    <span className="text-red-400 font-bold">{allStatuses.filter((s) => s.status.status === 'CLOSED').length} CLSD</span>
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
