/**
 * CommandPalette Component
 *
 * Global search overlay. Activated via search icon or CMD/CTRL + K.
 * Allows searching across markets and jumping to them.
 */
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { marketIntelligenceEngine } from '@/engines';

export function CommandPalette() {
  const isOpen = useLayoutStore((s) => s.searchOpen);
  const toggle = useLayoutStore((s) => s.toggleSearch);
  const searchQuery = useMarketsStore((s) => s.searchQuery);
  const setSearchQuery = useMarketsStore((s) => s.setSearchQuery);
  const filteredMarkets = useMarketsStore((s) => s.filteredMarkets);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  const utcMs = useUTCStore((s) => s.utcMs);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery(''); // clear on close
    }
  }, [isOpen, setSearchQuery]);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle]);

  const handleSelect = (marketId: string) => {
    selectMarket(marketId);
    toggle();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl glass-dense rounded-xl overflow-hidden shadow-[0_16px_64px_hsla(0,0%,0%,0.8)] border border-white/[0.15]"
          >
            {/* Input Area */}
            <div className="flex items-center px-4 py-4 border-b border-white/[0.08]">
              <Search className="w-5 h-5 text-white/50 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search markets, cities, indexes... (e.g. 'NYSE', 'Tokyo', 'S&P')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-white/90 placeholder:text-white/30 focus:outline-none text-lg font-medium"
              />
              <button 
                onClick={toggle}
                className="p-1.5 rounded-md text-white/40 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-2">
              {filteredMarkets.length === 0 ? (
                <div className="px-6 py-12 text-center text-white/40 font-mono">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  {filteredMarkets.slice(0, 10).map((market) => {
                    const status = marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
                    const statusColor = getStatusColor(status.status);
                    
                    return (
                      <button
                        key={market.id}
                        onClick={() => handleSelect(market.id)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/[0.06] transition-colors text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: statusColor, boxShadow: `0 0 10px ${statusColor}` }}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white/90 group-hover:text-white">
                              {market.city}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                              <span>{market.exchanges.join(', ')}</span>
                              <span>•</span>
                              <span>{market.majorIndexes[0]}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span 
                            className="text-[10px] font-mono tracking-wider font-bold"
                            style={{ color: statusColor }}
                          >
                            {status.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-mono text-white/60">
                            {status.localTime.slice(0, 5)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-[10px] font-mono text-white/30 uppercase">
              <div className="flex items-center gap-1">
                <span>Navigate:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">↑↓</kbd>
                <span>Select:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">Enter</kbd>
              </div>
              <div className="flex items-center gap-1">
                <span>Close:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">ESC</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
