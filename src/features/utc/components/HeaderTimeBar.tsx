/**
 * HeaderTimeBar Component
 *
 * Top header bar displaying all time formats:
 * UTC, GMT, ISO8601, Unix, Julian, GPS, Week, DOY, Leap Year, Date
 *
 * Professional Bloomberg-style terminal header with monospace typography
 * and glassmorphism background.
 */
'use client';

import { useUTCStore } from '@/features/utc/stores/utc.store';

export function HeaderTimeBar() {
  const formats = useUTCStore((s) => s.formats);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
      style={{
        background: 'hsla(220, 20%, 4%, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-10 overflow-x-auto">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold tracking-wider text-white/90">
            TraderUTC
          </span>
          <span className="text-[10px] font-medium tracking-widest text-emerald-400/80 uppercase">
            Earth
          </span>
        </div>

        {/* Center: Time formats */}
        <div className="flex items-center gap-1 mx-4 overflow-x-auto scrollbar-hide">
          <TimeChip label="UTC" value={formats.utc} accent />
          <TimeChip label="GMT" value={formats.gmt} />
          <Separator />
          <TimeChip label="DATE" value={formats.currentDate} />
          <TimeChip label="DAY" value={formats.dayName.slice(0, 3).toUpperCase()} />
          <Separator />
          <TimeChip label="ISO" value={formats.iso8601.replace('T', ' ').slice(0, 19)} small />
          <Separator />
          <TimeChip label="UNIX" value={formats.unixTimestamp.toString()} />
          <TimeChip label="JD" value={formats.julianDate} />
          <TimeChip label="GPS" value={formats.gpsTime} />
          <Separator />
          <TimeChip label="WK" value={formats.weekNumber.toString().padStart(2, '0')} />
          <TimeChip label="DOY" value={formats.dayOfYear.toString().padStart(3, '0')} />
          <TimeChip
            label="LEAP"
            value={formats.isLeapYear ? 'YES' : 'NO'}
            variant={formats.isLeapYear ? 'success' : 'muted'}
          />
        </div>

        {/* Right: Status indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-white/40">LIVE</span>
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
    success: 'text-emerald-400/90',
    muted: 'text-white/30',
  }[variant];

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-white/[0.04] transition-colors">
      <span className="text-[9px] font-mono font-medium text-white/30 tracking-wider">
        {label}
      </span>
      <span
        suppressHydrationWarning
        className={`font-mono font-medium tracking-tight ${valueColor} ${
          accent ? 'text-emerald-400/90 text-xs' : small ? 'text-[10px]' : 'text-[11px]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/** Visual separator between chip groups */
function Separator() {
  return <div className="w-px h-3 bg-white/[0.08] mx-1" />;
}
