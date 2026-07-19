/**
 * MarketSessionPanel Component
 *
 * A professional, high-density Bloomberg-style table displaying all markets,
 * their current local time, status, schedule, and time countdowns.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Activity } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { marketIntelligenceEngine, Market } from '@/engines';

export function MarketSessionPanel() {
  const isOpen = useLayoutStore((s) => s.sessionPanelOpen);
  const toggle = useLayoutStore((s) => s.toggleSessionPanel);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  const searchQuery = useMarketsStore((s) => s.searchQuery);
  const setSearchQuery = useMarketsStore((s) => s.setSearchQuery);
  const filteredMarkets = useMarketsStore((s) => s.filteredMarkets);
  const utcMs = useUTCStore((s) => s.utcMs);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute left-6 top-16 bottom-24 z-40 w-160 max-w-[calc(100vw-3rem)] glass-dense border border-white/10 rounded-lg overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold tracking-widest text-white/95 uppercase">
                GLOBAL_MARKET_MONITOR // STATUS_GRID
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Filter sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/8 rounded pl-8 pr-3 py-1 text-xs font-mono text-white/80 placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors w-48"
                />
              </div>
              <button
                onClick={toggle}
                className="p-1 rounded text-white/40 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-4 px-4 py-2 border-b border-white/10 bg-black/40 text-[9px] font-bold text-white/40 uppercase tracking-wider">
            <div>Market (Country / Code)</div>
            <div>Local Time</div>
            <div>Status</div>
            <div>Hours</div>
            <div>Time Countdown / Event</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-black/15">
            {filteredMarkets.map((market) => (
              <MarketRow
                key={market.id}
                market={market}
                utcMs={utcMs}
                onClick={() => selectMarket(market.id)}
              />
            ))}
            {filteredMarkets.length === 0 && (
              <div className="p-8 text-center text-xs text-white/30">
                No matching telemetry channels for "{searchQuery}"
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MarketRow({ market, utcMs, onClick }: { market: Market; utcMs: number; onClick: () => void }) {
  const status = marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
  const statusColor = getStatusColor(status.status);

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-4 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group items-center"
    >
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">
          {market.city.toUpperCase()}
        </span>
        <span className="text-[9px] text-white/30 uppercase truncate">
          {market.exchanges.join(', ')} // {market.country}
        </span>
      </div>

      <div suppressHydrationWarning className="text-xs font-bold text-white/80">
        {status.localTime.slice(0, 5)}
      </div>

      <div>
        <span
          className="px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase border"
          style={{
            color: statusColor,
            backgroundColor: `${statusColor}10`,
            borderColor: `${statusColor}25`,
          }}
        >
          {status.status.replace('_', ' ')}
        </span>
      </div>

      <div className="text-[10px] text-white/60">
        {market.openLocal} - {market.closeLocal}
      </div>

      <div className="text-[10px] text-white/70">
        {status.nextChangeText || '-'}
      </div>
    </div>
  );
}
