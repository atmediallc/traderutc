/**
 * LeftSidebar Component
 *
 * Highly detailed dashboard showing active and inactive trading sessions globally,
 * grouped by regional segments, including GIS telemetry coordinates.
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe2, Compass } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { marketIntelligenceEngine, MARKETS, Market } from '@/engines';

export function LeftSidebar() {
  const isOpen = useLayoutStore((s) => s.leftSidebarOpen);
  const toggle = useLayoutStore((s) => s.toggleLeftSidebar);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  const selectedMarketId = useMarketsStore((s) => s.selectedMarketId);
  const utcMs = useUTCStore((s) => s.utcMs);

  const [regionFilter, setRegionFilter] = useState<'ALL' | 'AMER' | 'EMEA' | 'APAC'>('ALL');

  function getMarketRegion(market: Market): 'AMER' | 'EMEA' | 'APAC' {
    const tz = market.timezone;
    if (tz.startsWith('America/')) return 'AMER';
    if (tz.startsWith('Europe/') || tz.startsWith('Africa/') || tz.startsWith('Atlantic/') || tz.startsWith('Asia/Dubai') || tz.startsWith('Asia/Jerusalem')) return 'EMEA';
    return 'APAC';
  }

  const filteredMarketsByRegion = MARKETS.filter((market) => {
    if (regionFilter === 'ALL') return true;
    return getMarketRegion(market) === regionFilter;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute left-0 top-10 bottom-0 z-40 w-80 border-r border-white/10 shadow-[10px_0_30px_rgba(0,0,0,0.8)] flex flex-col font-sans"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,30,0.8) 0%, rgba(5,7,12,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 select-none">
            <div className="flex items-center gap-2 text-white/95">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold tracking-widest uppercase">
                MONITOR // SESSIONS
              </h2>
            </div>
            <button
              onClick={toggle}
              className="p-1 rounded text-white/40 hover:bg-white/5 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Region Tabs */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-black/20 border-b border-white/5 text-[9px] font-bold select-none">
            {(['ALL', 'AMER', 'EMEA', 'APAC'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRegionFilter(tab)}
                className={`py-1 rounded border transition-all text-center tracking-wider ${
                  regionFilter === tab
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/3'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Markets Monitor List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
            {filteredMarketsByRegion.map((market) => {
              const status = marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
              // Session progress bar
              const statusColor = getStatusColor(status.status);
              const isSelected = selectedMarketId === market.id;
              const region = getMarketRegion(market);

              const [lat, lng] = market.coordinates;
              const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
              const lngStr = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;

              return (
                <button
                  key={market.id}
                  onClick={() => selectMarket(market.id)}
                  className={`
                    w-full text-left p-2.5 rounded border transition-all flex flex-col gap-1.5
                    ${isSelected
                      ? 'bg-white/10 border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.05)]'
                      : 'bg-white/0 border-transparent hover:bg-white/3 hover:border-white/5'}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-bold transition-colors ${isSelected ? 'text-emerald-400' : 'text-white/90'}`}>
                        {market.city.toUpperCase()}
                      </span>
                      <span className="text-[8px] text-white/30 tracking-widest uppercase">
                        {market.exchanges[0]}{' // '}{region}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div suppressHydrationWarning className="text-xs font-bold text-white/80 font-mono tracking-tight">
                        {status.localTime.slice(0, 5)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="text-[8px] font-bold tracking-wider"
                          style={{ color: statusColor }}
                        >
                          {status.status.replace('_', ' ')}
                        </span>
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: statusColor,
                            boxShadow: `0 0 6px ${statusColor}`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  <div className="flex items-center justify-between text-[8px] text-white/30 border-t border-white/5 pt-1.5">
                    <span className="flex items-center gap-0.5">
                      <Compass className="w-2 h-2 text-white/20" />
                      {latStr} / {lngStr}
                    </span>
                    <span>
                      UTC{status.utcOffset >= 0 ? `+${status.utcOffset}` : status.utcOffset}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
