/**
 * HeaderTimeBar Component — Institutional Trading Terminal Header
 *
 * Uses a unified CSS variable design system for all containers.
 * All cards share identical dimensions via .terminal-panel primitives.
 */
'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  ShieldCheck,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────── */
/*  Main Export                                                     */
/* ─────────────────────────────────────────────────────────────── */

export function HeaderTimeBar() {
  const formats = useUTCStore((s) => s.formats);
  const isMobile = useLayoutStore((s) => s.isMobile);
  const [techDrawerOpen, setTechDrawerOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { utc, date, day, gmt, unix, iso8601, dayOfYear, isLeapYear, julianDate, gpsTime, weekNumber } = useMemo(() => ({
    utc: formats.utc,
    date: formats.currentDate,
    day: formats.dayName,
    gmt: formats.gmt,
    unix: String(formats.unixTimestamp),
    iso8601: formats.iso8601,
    dayOfYear: formats.dayOfYear,
    isLeapYear: formats.isLeapYear,
    julianDate: formats.julianDate,
    gpsTime: formats.gpsTime,
    weekNumber: formats.weekNumber,
  }), [formats]);

  return (
    <header className="fixed top-4 left-6 right-6 z-50 select-none pointer-events-none">
      {/* ── Main Bar ── */}
      <div
        className={cn(
          'pointer-events-auto relative w-full flex items-center justify-between',
          'rounded-[14px] border border-[rgba(0,255,210,0.12)]',
          'bg-[rgba(10,16,24,0.82)] backdrop-blur-3xl',
          'shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_8px_20px_rgba(0,0,0,0.45),0_0_12px_rgba(0,255,210,0.05)]',
          'transition-all duration-300',
          isMobile
            ? 'h-auto flex-col gap-(--terminal-gap) px-4 py-3'
            : 'h-(--terminal-height) px-5 gap-(--terminal-gap)'
        )}
      >
        {/* Ambient glow line */}
        <div className="terminal-glow-line" />

        {/* ── LEFT: Logo + System Badge ── */}
        <div className={cn('flex items-center gap-3 shrink-0', isMobile && 'w-full')}>
          {/* Logo */}
          <TerminalPanel className="gap-3 px-3 h-11! min-h-11! w-11! min-w-11! justify-center shrink-0">
            <Globe className="w-5 h-5 text-[#00E5A8]" />
          </TerminalPanel>

          {/* Brand Name */}
          <div className="flex flex-col leading-none gap-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-widest text-white font-sans">
                TRADER<span className="text-[#00E5A8]">UTC</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-[#00E5A8]/15 text-[#00E5A8] border border-[#00E5A8]/35">
                PRO
              </span>
            </div>
            <span className="text-[11px] tracking-[0.2em] text-[#94A3B8] uppercase font-semibold">
              Terminal
            </span>
          </div>

          {!isMobile && (
            <>
              <div className="terminal-separator" />
              <TerminalBadge label="SYSTEM SYNCED" icon={<ShieldCheck className="w-3.5 h-3.5 text-[#00E5A8]" />} />
            </>
          )}
        </div>

        {/* ── CENTER: Info Cards + Clock ── */}
        <div className={cn('flex items-center gap-(--terminal-gap) shrink-0', !isMobile && 'mx-auto')}>
          {/* Left flank: GMT + Offset */}
          {!isMobile && (
            <div className="hidden lg:flex items-center gap-(--terminal-gap)">
              <HeaderInfoCard label="GMT Reference" value={mounted ? gmt : '00:00:00'} />
              <HeaderInfoCard label="UTC Offset" value="+00:00" />
            </div>
          )}

          {/* Clock */}
          <HeaderClockCard utc={utc} day={day} date={date} mounted={mounted} />

          {/* Right flank: Timezone + Unix */}
          {!isMobile && (
            <div className="hidden lg:flex items-center gap-(--terminal-gap)">
              <HeaderInfoCard label="Timezone" value="UTC / ZULU" />
              <HeaderInfoCard label="Unix Timestamp" value={mounted ? unix : '0000000000'} />
            </div>
          )}
        </div>

        {/* ── RIGHT: Tech Specs Toggle ── */}
        <div className={cn('flex items-center gap-3 shrink-0', isMobile && 'w-full')}>
          <button
            onClick={() => setTechDrawerOpen(!techDrawerOpen)}
            className={cn(
              'terminal-panel gap-2 cursor-pointer select-none px-3 h-9!',
              'text-[#94A3B8] hover:text-white',
              'text-[11px] font-semibold tracking-wider uppercase',
              techDrawerOpen && 'border-[rgba(0,255,210,0.40)]! bg-[rgba(0,229,168,0.08)]! text-[#00E5A8]'
            )}
            title="Toggle Technical Telemetry"
          >
            <Cpu className="w-3.5 h-3.5 text-[#00E5A8] shrink-0" />
            <span className="hidden sm:inline">Tech Specs</span>
            {techDrawerOpen
              ? <ChevronUp className="w-3.5 h-3.5 shrink-0" />
              : <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            }
          </button>
        </div>
      </div>

      {/* ── Tech Telemetry Drawer ── */}
      <AnimatePresence>
        {techDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mt-2 w-full rounded-(--terminal-radius) overflow-hidden border border-[rgba(0,255,210,0.08)] bg-[rgba(10,16,24,0.92)] backdrop-blur-3xl shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-7xl mx-auto px-5 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-(--terminal-gap)">
              <TelemetryCard label="Day of Year" value={mounted ? `DOY ${dayOfYear}` : 'DOY --'} highlight />
              <TelemetryCard label="ISO-8601 Stamp" value={mounted ? iso8601.split('T')[0] : '----'} />
              <TelemetryCard label="Leap Year" value={mounted ? (isLeapYear ? 'YES (366d)' : 'NO (365d)') : '--'} />
              <TelemetryCard label="Julian Date" value={mounted ? julianDate : '----'} />
              <TelemetryCard label="GPS Time" value={mounted ? gpsTime : '----'} />
              <TelemetryCard label="Week Number" value={mounted ? `WW${weekNumber}` : 'WW--'} highlight />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Primitives                                                     */
/* ─────────────────────────────────────────────────────────────── */

/**
 * TerminalPanel — base reusable container.
 * All header cards inherit identical height, radius, border, shadow.
 */
function TerminalPanel({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('terminal-panel', className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * HeaderLabel — consistent uppercase label across all cards.
 */
function HeaderLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('terminal-label', className)}>
      {children}
    </span>
  );
}

/**
 * HeaderInfoCard — identical info card (GMT, Offset, Timezone, Unix).
 * Same height, padding, border, radius as every other terminal-panel.
 */
function HeaderInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <TerminalPanel className="flex-col justify-center gap-1.5 px-4 min-w-30">
      <HeaderLabel>{label}</HeaderLabel>
      <span className="terminal-value">{value}</span>
    </TerminalPanel>
  );
}

/**
 * HeaderClockCard — the UTC clock display.
 * Same container dimensions as every other card; visual hierarchy
 * comes purely from typography (larger font, glow, label badge).
 */
function HeaderClockCard({
  utc,
  day,
  date,
  mounted,
}: {
  utc: string;
  day: string;
  date: string;
  mounted: boolean;
}) {
  return (
    <TerminalPanel className="flex-col justify-center gap-1 px-5 min-w-50">
      {/* Top label */}
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00E5A8]/10 border border-[#00E5A8]/20 mb-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] shadow-[0_0_6px_rgba(0,229,168,0.6)] animate-pulse" />
        <span className="text-[8px] font-mono font-semibold text-[#00E5A8] tracking-[0.18em] uppercase select-none">
          Coordinated Universal Time
        </span>
      </span>

      {/* Clock digits */}
      <motion.span
        key={mounted ? utc : '00:00:00'}
        initial={{ opacity: 0.9, y: -1 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="terminal-clock"
        suppressHydrationWarning
      >
        {mounted ? utc : '00:00:00'}
      </motion.span>

      {/* Date line */}
      <div
        className="flex items-center gap-1.5 text-[10px] font-mono text-[#94A3B8] tracking-wide"
        suppressHydrationWarning
      >
        <span className="font-bold text-white/90">{mounted ? day : '...'}</span>
        <span className="text-[#00E5A8]/30">·</span>
        <span>{mounted ? date : '----'}</span>
      </div>
    </TerminalPanel>
  );
}

/**
 * TerminalBadge — small status indicator (SYSTEM SYNCED, etc.).
 */
function TerminalBadge({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E5A8]/10 border border-[#00E5A8]/25 text-[10px] font-semibold tracking-wider text-[#00E5A8] uppercase select-none">
      {icon ?? (
        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A8] shadow-[0_0_6px_rgba(0,229,168,0.5)]" />
      )}
      <span>{label}</span>
    </div>
  );
}

/**
 * TelemetryCard — detail card inside the expanded tech drawer.
 */
function TelemetryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <TerminalPanel
      className={cn(
        'flex-col justify-center gap-1.5 px-4',
        highlight && '!border-[rgba(0,255,210,0.35)] !bg-[rgba(0,229,168,0.06)]'
      )}
    >
      <HeaderLabel>{label}</HeaderLabel>
      <span className={cn('terminal-value text-[13px]', highlight && 'text-[#00E5A8]')}>
        {value}
      </span>
    </TerminalPanel>
  );
}
