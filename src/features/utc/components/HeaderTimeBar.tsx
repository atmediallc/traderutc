/**
 * HeaderTimeBar Component
 *
 * Compact terminal-style header displaying time formats in grouped sections:
 * - System: UTC, GMT
 * - Calendar: DATE, DAY, DOY
 * - Timestamp: ISO_8601, UNIX
 *
 * Responsive: hides secondary chips on mobile (<640px).
 */
'use client';

import { useUTCStore } from '@/features/utc/stores/utc.store';
import { cn } from '@/lib/utils';

export function HeaderTimeBar() {
  const formats = useUTCStore((s) => s.formats);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] border-b border-white/8"
      style={{
        background: 'linear-gradient(180deg, rgba(20,25,35,0.88) 0%, rgba(10,12,18,0.95) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-8 overflow-hidden overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 select-none">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-sm animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-white/95 uppercase font-mono">
              TRADERUTC
            </span>
          </div>
          <span className="text-[8px] font-mono font-medium px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 uppercase tracking-widest leading-none">
            SYS_NORMAL
          </span>
        </div>

        {/* Center: Time formats — grouped by category */}
        <div className="flex items-center gap-1 mx-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 py-0.5 flex-1 justify-center min-w-0">
          {/* Group 1: System Time */}
          <TimeChip label="UTC" value={formats.utc} accent />
          <TimeChip label="GMT" value={formats.gmt} />
          <Separator />

          {/* Group 2: Calendar — secondary hidden on mobile */}
          <TimeChip label="DATE" value={formats.currentDate} />
          <span className="hidden sm:flex items-center gap-1">
            <TimeChip label="DY" value={formats.dayName.slice(0, 3).toUpperCase()} />
            <TimeChip label="DOY" value={formats.dayOfYear.toString().padStart(3, '0')} />
            <TimeChip
              label="LEAP"
              value={formats.isLeapYear ? 'Y' : 'N'}
              variant={formats.isLeapYear ? 'success' : 'muted'}
              small
            />
          </span>
          <Separator />

          {/* Group 3: Timestamps — hidden on mobile */}
          <span className="hidden sm:flex items-center gap-1">
            <TimeChip label="ISO" value={formats.iso8601.replace('T', ' ').slice(0, 19)} small />
            <TimeChip label="UNIX_MS" value={formats.unixTimestamp.toString()} small />
          </span>
        </div>

        {/* Right: Status indicator */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="text-white/20">[</span>
            <span className="text-emerald-500 tracking-wider">SYNC_LOCK</span>
            <span className="text-white/20">]</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="hidden sm:inline text-white/60 tracking-widest text-[9px] uppercase">CLOCK_ACTIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Individual time format display chip */
function TimeChip({
  label,
  value,
  accent,
  small,
  variant = 'default',
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
  variant?: 'default' | 'success' | 'muted';
}) {
  const valueColor = {
    default: 'text-white/80',
    success: 'text-emerald-400 font-bold',
    muted: 'text-white/30',
  }[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-white/3 bg-white/5 hover:border-white/10 hover:bg-white/8 transition-all font-mono',
        small && 'px-1'
      )}
    >
      <span className="text-[8px] font-mono font-medium text-white/40 tracking-wider uppercase shrink-0">
        {label}
      </span>
      <span
        suppressHydrationWarning
        className={cn(
          'font-mono tracking-tight',
          accent ? 'text-emerald-400 font-bold text-[11px]' : small ? 'text-[9px]' : 'text-[10px]',
          valueColor
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Visual separator between chip groups */
function Separator() {
  return <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />;
}
