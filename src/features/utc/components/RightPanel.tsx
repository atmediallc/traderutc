/**
 * RightPanel Component
 *
 * Displays a stack of customizable UTC clocks in a side panel.
 * Professional terminal design.
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Settings2 } from 'lucide-react';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { useUTCStore } from '../stores/utc.store';
import { utcToIANATime } from '../services/time-format.service';

export function RightPanel() {
  const isOpen = useLayoutStore((s) => s.rightPanelOpen);
  const toggle = useLayoutStore((s) => s.toggleRightPanel);
  const formats = useUTCStore((s) => s.formats);
  const utcMs = useUTCStore((s) => s.utcMs);

  // We could eventually allow users to add/remove custom clocks here
  const clocks = [
    { label: 'UTC (ZULU)', time: formats.utc.slice(0, 8), highlight: true },
    { label: 'NEW YORK (EST)', time: utcToIANATime(utcMs, 'America/New_York').slice(0, 8) },
    { label: 'LONDON (GMT)', time: formats.gmt.slice(0, 8) },
    { label: 'TOKYO (JST)', time: utcToIANATime(utcMs, 'Asia/Tokyo').slice(0, 8) },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute right-0 top-10 bottom-0 z-40 w-72 glass-dense border-l border-white/[0.08] shadow-[-10px_0_30px_hsla(0,0%,0%,0.5)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="w-4 h-4" />
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                World Clocks
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-md text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors">
                <Settings2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggle}
                className="p-1 rounded-md text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clocks List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
            {clocks.map((clock, i) => (
              <div 
                key={i}
                className={`
                  p-4 rounded-xl border relative overflow-hidden
                  ${clock.highlight 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-white/[0.02] border-white/[0.06]'}
                `}
              >
                {/* Background glow for highlight */}
                {clock.highlight && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4" />
                )}
                
                <div className="relative z-10">
                  <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1">
                    {clock.label}
                  </div>
                  <div 
                    suppressHydrationWarning
                    className={`text-3xl font-mono font-medium tracking-tight ${clock.highlight ? 'text-emerald-400' : 'text-white/90'}`}
                  >
                    {clock.time}
                  </div>
                </div>
              </div>
            ))}

            {/* Other Technical Formats */}
            <div className="pt-6 mt-6 border-t border-white/[0.08] space-y-4">
              <h3 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Technical Formats</h3>
              <TechTimeBlock label="UNIX TIMESTAMP" value={formats.unixTimestamp.toString()} />
              <TechTimeBlock label="JULIAN DATE" value={formats.julianDate} />
              <TechTimeBlock label="GPS TIME" value={formats.gpsTime} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TechTimeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[9px] font-mono text-white/40 tracking-widest">{label}</div>
      <div suppressHydrationWarning className="text-sm font-mono text-white/70">{value}</div>
    </div>
  );
}
