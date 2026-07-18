/**
 * MarketSessionPanel Component
 *
 * A professional, Bloomberg-style table displaying all markets,
 * their current local time, status, and schedule.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { computeMarketStatus } from '../services/market-status.service';
import { getStatusColor } from '../hooks/useMarketStatus';
import { MARKETS } from '../constants/market-data';
import type { Market } from '../types/market.types';

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
          className="absolute left-6 top-16 bottom-24 z-40 w-[600px] max-w-[calc(100vw-3rem)] glass-dense rounded-xl overflow-hidden shadow-[0_8px_32px_hsla(0,0%,0%,0.6)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
            <h2 className="text-sm font-semibold tracking-wide text-white/95 uppercase">
              Global Market Sessions
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  placeholder="Filter markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-md pl-8 pr-3 py-1 text-xs font-mono text-white/80 placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors w-48"
                />
              </div>
              <button
                onClick={toggle}
                className="p-1 rounded-md text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-4 px-4 py-2 border-b border-white/[0.08] bg-white/[0.02] text-[10px] font-mono text-white/40 uppercase tracking-widest">
            <div>Market</div>
            <div>Local Time</div>
            <div>Status</div>
            <div>Hours</div>
            <div>Time Until</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredMarkets.map((market) => (
              <MarketRow 
                key={market.id} 
                market={market} 
                utcMs={utcMs} 
                onClick={() => selectMarket(market.id)}
              />
            ))}
            {filteredMarkets.length === 0 && (
              <div className="p-8 text-center text-sm font-mono text-white/40">
                No markets found matching "{searchQuery}"
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MarketRow({ market, utcMs, onClick }: { market: Market; utcMs: number; onClick: () => void }) {
  const status = computeMarketStatus(market, utcMs);
  const statusColor = getStatusColor(status.status);

  return (
    <div 
      onClick={onClick}
      className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-4 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer group"
    >
      <div className="flex flex-col justify-center">
        <span className="text-xs font-medium text-white/90 group-hover:text-emerald-400 transition-colors">
          {market.city}
        </span>
        <span className="text-[10px] font-mono text-white/40">
          {market.exchanges.join(', ')}
        </span>
      </div>
      
      <div className="flex items-center text-xs font-mono text-white/80">
        {status.localTime.slice(0, 5)} {/* HH:mm */}
      </div>
      
      <div className="flex items-center">
        <div 
          className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider"
          style={{ 
            color: statusColor, 
            backgroundColor: `${statusColor}15`,
            border: `1px solid ${statusColor}30`
          }}
        >
          {status.status.replace('_', ' ')}
        </div>
      </div>
      
      <div className="flex items-center text-[11px] font-mono text-white/60">
        {market.openLocal} - {market.closeLocal}
      </div>
      
      <div className="flex items-center text-[11px] font-mono text-white/70">
        {status.nextChangeText || '-'}
      </div>
    </div>
  );
}
