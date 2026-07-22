/**
 * MarketCard Component
 *
 * Floating detail panel displaying comprehensive information about
 * the currently selected market. Appears when a user clicks a pin.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Globe2 } from 'lucide-react';
import { useMarketsStore } from '../stores/markets.store';
import { useMarketStatus, getStatusColor } from '../hooks/useMarketStatus';
import { MARKETS, Market } from '@/engines';

export function MarketCard() {
  const selectedMarketId = useMarketsStore((s) => s.selectedMarketId);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  
  const market = MARKETS.find((m) => m.id === selectedMarketId);

  return (
    <AnimatePresence>
      {market && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute right-6 top-[98px] z-40 w-80 max-w-[min(20rem,calc(100vw-2rem))] max-md:left-3 max-md:right-3 max-md:w-auto rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/10 font-sans"
          style={{
            background: 'linear-gradient(135deg, rgba(15,20,30,0.85) 0%, rgba(5,7,12,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <MarketCardContent 
            market={market} 
            onClose={() => selectMarket(null)} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MarketCardContent({ market, onClose }: { market: Market; onClose: () => void }) {
  const status = useMarketStatus(market);
  const statusColor = getStatusColor(status.status);
  
  const offsetStr = status.utcOffset >= 0 ? `+${status.utcOffset}` : `${status.utcOffset}`;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="relative p-4 pb-3 border-b border-white/8">
        <button 
          onClick={onClose}
          className="absolute right-3 top-3 p-1 rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: statusColor, boxShadow: `0 0 10px ${statusColor}` }}
          />
          <h2 className="text-lg font-semibold tracking-wide text-white/95">
            {market.city}
          </h2>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono uppercase tracking-wider">
          <MapPin className="w-3 h-3" />
          <span>{market.country}</span>
        </div>
      </div>

      {/* Status Banner */}
      <div 
        className="px-4 py-2 flex items-center justify-between font-mono text-xs border-b border-white/8"
        style={{ backgroundColor: `${statusColor}20` }}
      >
        <span style={{ color: statusColor }} className="font-semibold tracking-wider">
          {status.status.replace('_', ' ')}
        </span>
        {status.nextChangeText && (
          <span className="text-white/70">{status.nextChangeText}</span>
        )}
      </div>

      {/* Details Grid */}
      <div className="p-4 space-y-4">
        
        {/* Time Info */}
        <div className="grid grid-cols-2 gap-4">
          <DetailBlock 
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Local Time" 
            value={status.localTime} 
            valueClass="text-lg font-mono text-emerald-400"
          />
          <DetailBlock 
            icon={<Globe2 className="w-3.5 h-3.5" />}
            label="Timezone" 
            value={`UTC${offsetStr} ${status.isDst ? '(DST)' : ''}`} 
            subValue={market.timezone.split('/')[1]?.replace('_', ' ')}
          />
        </div>

        {/* Schedule */}
        <div className="space-y-2 pt-2 border-t border-white/6">
          <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Trading Hours (Local)</h3>
          
          <div className="grid gap-1.5 text-xs font-mono">
            {market.preMarketOpenLocal && (
              <div className="flex justify-between text-white/50">
                <span>Pre-Market</span>
                <span>{market.preMarketOpenLocal} - {market.openLocal}</span>
              </div>
            )}
            <div className="flex justify-between text-white/90 font-medium">
              <span>Core Session</span>
              <span>{market.openLocal} - {market.closeLocal}</span>
            </div>
            {market.hasLunchBreak && market.lunchStartLocal && market.lunchEndLocal && (
              <div className="flex justify-between text-white/50">
                <span>Lunch Break</span>
                <span>{market.lunchStartLocal} - {market.lunchEndLocal}</span>
              </div>
            )}
            {market.afterHoursCloseLocal && (
              <div className="flex justify-between text-white/50">
                <span>After Hours</span>
                <span>{market.closeLocal} - {market.afterHoursCloseLocal}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Info */}
        <div className="space-y-2 pt-2 border-t border-white/6">
          <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Market Data</h3>
          
          <div className="grid gap-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-white/50">Exchanges</span>
              <span className="text-white/80">{market.exchanges.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Currency</span>
              <span className="text-white/80">{market.currency}</span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-white/50 shrink-0">Major Indexes</span>
              <span className="text-white/80 text-right">{market.majorIndexes.join(', ')}</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function DetailBlock({ 
  icon, 
  label, 
  value, 
  subValue,
  valueClass = "text-white/90 font-medium" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
        {icon}
        <span>{label}</span>
      </div>
      <div className={valueClass}>{value}</div>
      {subValue && (
        <div className="text-[10px] text-white/50 font-mono tracking-wide">{subValue}</div>
      )}
    </div>
  );
}
