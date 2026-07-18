/**
 * LeftSidebar Component
 *
 * Filter panel for markets. Allows filtering by status,
 * region, or asset class (future).
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Globe2 } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { marketIntelligenceEngine, MARKETS } from '@/engines';

export function LeftSidebar() {
  const isOpen = useLayoutStore((s) => s.leftSidebarOpen);
  const toggle = useLayoutStore((s) => s.toggleLeftSidebar);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  const selectedMarketId = useMarketsStore((s) => s.selectedMarketId);
  const utcMs = useUTCStore((s) => s.utcMs);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute left-0 top-10 bottom-0 z-40 w-72 glass-dense border-r border-white/[0.08] shadow-[10px_0_30px_hsla(0,0%,0%,0.5)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-white/90">
              <Filter className="w-4 h-4" />
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                Markets
              </h2>
            </div>
            <button
              onClick={toggle}
              className="p-1 rounded-md text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
            {MARKETS.map((market) => {
              const status = marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
              const statusColor = getStatusColor(status.status);
              const isSelected = selectedMarketId === market.id;

              return (
                <button
                  key={market.id}
                  onClick={() => selectMarket(market.id)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg transition-all text-left
                    ${isSelected 
                      ? 'bg-white/[0.1] border border-white/[0.15]' 
                      : 'hover:bg-white/[0.04] border border-transparent'}
                  `}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white/90">
                      {market.city}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      {market.country}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="text-[9px] font-mono tracking-wider font-bold"
                        style={{ color: statusColor }}
                      >
                        {status.status.replace('_', ' ')}
                      </span>
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/50">
                      {status.localTime.slice(0, 5)}
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
