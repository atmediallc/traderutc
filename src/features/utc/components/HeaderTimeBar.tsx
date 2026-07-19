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
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/8"
      style={{
        background: 'hsla(220, 25%, 2%, 0.9)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-10 overflow-x-auto select-none">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-sm animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-white/95 uppercase font-mono">
              TRADERUTC // TIME_ENGINE
            </span>
          </div>
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 uppercase tracking-widest leading-none">
            SYS_NORMAL
          </span>
        </div>

        {/* Center: Time formats */}
        <div className="flex items-center gap-1 mx-4 overflow-x-auto scrollbar-hide py-1">
          <TimeChip label="UTC" value={formats.utc} accent />
          <TimeChip label="GMT" value={formats.gmt} />
          <Separator />
          <TimeChip label="CALENDAR_DATE" value={formats.currentDate} />
          <TimeChip label="DY" value={formats.dayName.slice(0, 3).toUpperCase()} />
          <Separator />
          <TimeChip label="ISO_8601" value={formats.iso8601.replace('T', ' ').slice(0, 19)} small />
          <Separator />
          <TimeChip label="UNIX_MS" value={formats.unixTimestamp.toString()} />
          <TimeChip label="JULIAN_DATE" value={formats.julianDate} />
          <TimeChip label="GPS_SEC" value={formats.gpsTime} />
          <Separator />
          <TimeChip label="WEEK" value={formats.weekNumber.toString().padStart(2, '0')} />
          <TimeChip label="DOY" value={formats.dayOfYear.toString().padStart(3, '0')} />
          <TimeChip
            label="LEAP_YEAR"
            value={formats.isLeapYear ? 'TRUE' : 'FALSE'}
            variant={formats.isLeapYear ? 'success' : 'muted'}
          />
        </div>

        {/* Right: Status indicator */}
        <div className="flex items-center gap-4 shrink-0 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="text-white/20">[</span>
            <span className="text-emerald-500 tracking-wider">SYNC_LOCK</span>
            <span className="text-white/20">]</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-white/60 tracking-widest text-[9px] uppercase">CLOCK_ACTIVE</span>
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
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/3 bg-white/5 hover:border-white/10 hover:bg-white/10 transition-all font-mono">
      <span className="text-[8px] font-mono font-medium text-white/40 tracking-wider uppercase">
        {label}
      </span>
      <span
        suppressHydrationWarning
        className={`font-mono tracking-tight ${valueColor} ${
          accent ? 'text-emerald-400 font-bold text-xs shadow-custom' : small ? 'text-[10px]' : 'text-[11px]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/** Visual separator between chip groups */
function Separator() {
  return <div className="w-px h-4 bg-white/10 mx-1.5 shrink-0" />;
}
