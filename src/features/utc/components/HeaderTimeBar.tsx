/**
 * HeaderTimeBar Component — Enterprise-Grade Top Navigation
 *
 * Designed to resemble a luxury financial terminal used by institutional traders.
 * Inspired by Bloomberg Terminal, Apple, TradingView Desktop, Stripe Dashboard, and NASA Mission Control.
 */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { useLayoutStore } from '@/features/layout/stores/layout.store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  Radio,
  ShieldCheck,
} from 'lucide-react';

export function HeaderTimeBar() {
  const formats = useUTCStore((s) => s.formats);
  const isMobile = useLayoutStore((s) => s.isMobile);
  const [techDrawerOpen, setTechDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {/* ── Main Floating Bar Container ── */}
      <div
        className={cn(
          'pointer-events-auto relative w-full rounded-2xl px-6 md:px-8 py-3.5 flex items-center justify-between gap-4 md:gap-6',
          'bg-[#080C12]/85 backdrop-blur-3xl border border-white/12',
          'shadow-[0_16px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)]',
          'transition-all duration-300',
          isMobile && 'h-auto py-4 px-4 flex-col gap-3'
        )}
      >
        {/* ── Bottom Ambient Glow Line ─────────────────── */}
        <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#00E5A8]/40 via-40% via-[#5EE6FF]/40 to-transparent pointer-events-none" />

        {/* ── LEFT SECTION: Logo + Subtitle + System Health ────── */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#00E5A8]/25 via-[#12161E] to-[#5EE6FF]/25 border border-[#00E5A8]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,168,0.25)] group-hover:border-[#00E5A8]/70 group-hover:shadow-[0_0_28px_rgba(0,229,168,0.45)] transition-all duration-300">
                <Globe className="w-5.5 h-5.5 text-[#00E5A8] transition-transform duration-700 group-hover:rotate-180" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-widest text-white">
                  TRADER<span className="text-[#00E5A8]">UTC</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider bg-[#00E5A8]/15 text-[#00E5A8] border border-[#00E5A8]/35 shadow-[0_0_12px_rgba(0,229,168,0.25)]">
                  PRO
                </span>
              </div>
              <span className="text-[11px] tracking-[0.2em] text-[#94A3B8] uppercase font-semibold mt-0.5">
                Terminal
              </span>
            </div>
          </div>

          <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-white/15 to-transparent mx-1" />

          {/* Left System Badge */}
          {!isMobile && (
            <div className="hidden lg:flex items-center gap-2">
              <Badge color="emerald" label="SYSTEM SYNCED" icon={<ShieldCheck className="w-4 h-4 text-[#00E5A8]" />} />
            </div>
          )}
        </div>

        {/* ── CENTER SECTION: Master UTC Hero Clock & Cards ──────── */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0 mx-auto">
          {/* Flanking Left Cards: GMT & Offset (Desktop) */}
          {!isMobile && (
            <div className="hidden xl:flex items-center gap-2.5">
              <HeaderCard label="GMT REFERENCE" value={mounted ? gmt : '00:00:00'} />
              <HeaderCard label="UTC OFFSET" value="+00:00" />
            </div>
          )}

          {/* Master Clock Centerpiece Module */}
          <div className="flex flex-col items-center justify-center px-7 py-2.5 rounded-xl bg-gradient-to-b from-[#121824]/90 via-[#0E131E]/95 to-[#080C12] border border-[#00E5A8]/30 shadow-[0_0_24px_rgba(0,229,168,0.15)] hover:border-[#00E5A8]/50 transition-all duration-300 group">
            {/* Top UTC Label Badge */}
            <span className="text-[8px] font-mono font-semibold text-[#00E5A8] tracking-[0.22em] uppercase select-none px-2 py-0.5 rounded bg-[#00E5A8]/12 border border-[#00E5A8]/25 mb-1">
              COORDINATED UNIVERSAL TIME
            </span>

            {/* Proportional Clock Digits */}
            <motion.span
              key={mounted ? utc : '00:00:00'}
              initial={{ opacity: 0.9, y: -0.5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="text-2xl sm:text-3xl md:text-[32px] font-mono font-bold tracking-widest text-white tabular-nums my-0.5"
              style={{
                textShadow: '0 0 20px rgba(0, 229, 168, 0.35)',
              }}
              suppressHydrationWarning
            >
              {mounted ? utc : '00:00:00'}
            </motion.span>

            {/* Date line */}
            <div
              className="flex items-center gap-2 text-[10px] font-mono text-[#94A3B8] tracking-wider mt-0.5"
              suppressHydrationWarning
            >
              <span className="font-bold text-white/90">{mounted ? day : 'Loading...'}</span>
              <span className="text-[#00E5A8]/40">•</span>
              <span>{mounted ? date : '----'}</span>
            </div>
          </div>

          {/* Flanking Right Cards: Unix & Zone (Desktop) */}
          {!isMobile && (
            <div className="hidden xl:flex items-center gap-2.5">
              <HeaderCard label="TIMEZONE" value="UTC / ZULU" />
              <HeaderCard label="UNIX TIMESTAMP" value={mounted ? unix : '0000000000'} />
            </div>
          )}
        </div>

        {/* ── RIGHT SECTION: Tech Telemetry Toggle ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Tech Spec Drawer Toggle Button */}
          <button
            onClick={() => setTechDrawerOpen(!techDrawerOpen)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg',
              'bg-[#12161E]/90 border border-white/10 text-[#94A3B8]',
              'hover:bg-[#161B26] hover:text-white hover:border-[#00E5A8]/40 hover:shadow-[0_0_15px_rgba(0,229,168,0.2)]',
              'transition-all duration-300 cursor-pointer text-[11px] font-semibold select-none',
              techDrawerOpen && 'border-[#00E5A8]/50 bg-[#00E5A8]/15 text-[#00E5A8] shadow-[0_0_15px_rgba(0,229,168,0.25)]'
            )}
            title="Toggle Technical Telemetry"
          >
            <Cpu className="w-3.5 h-3.5 text-[#00E5A8]" />
            <span className="hidden sm:inline tracking-wider uppercase text-[10px]">Tech Specs</span>
            {techDrawerOpen ? (
              <ChevronUp className="w-3.5 h-3.5 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* ── EXPANDABLE TECH TELEMETRY DRAWER ─────────────────────── */}
      <AnimatePresence>
        {techDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mt-2 w-full bg-[#080C12]/95 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)]"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <TelemetryCard label="DAY OF YEAR" value={mounted ? `DOY ${dayOfYear}` : 'DOY --'} highlight />
              <TelemetryCard label="ISO-8601 STAMP" value={mounted ? iso8601.split('T')[0] : '----'} />
              <TelemetryCard label="LEAP YEAR" value={mounted ? (isLeapYear ? 'YES (366d)' : 'NO (365d)') : '--'} />
              <TelemetryCard label="JULIAN DATE" value={mounted ? julianDate : '----'} />
              <TelemetryCard label="GPS TIME" value={mounted ? gpsTime : '----'} />
              <TelemetryCard label="WEEK NUMBER" value={mounted ? `WW${weekNumber}` : 'WW--'} highlight />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Subcomponents & Reusable Glass Cards                           */
/* ─────────────────────────────────────────────────────────────── */

/** Glass card for center section timezone info */
function HeaderCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col justify-center px-4 py-2 rounded-xl bg-[#12161E]/80 border border-white/10 hover:bg-[#161B26] hover:border-white/20 transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.3)] min-w-[130px] gap-0.5"
      suppressHydrationWarning
    >
      <span className="text-[9px] font-semibold text-[#94A3B8] tracking-[0.14em] uppercase font-sans">
        {label}
      </span>
      <span className="text-xs font-mono font-bold text-white tabular-nums tracking-wide">
        {value}
      </span>
    </div>
  );
}

/** Status badge for left/right sections */
function Badge({
  color,
  label,
  icon,
}: {
  color: 'emerald' | 'cyan' | 'amber';
  label: string;
  icon?: React.ReactNode;
}) {
  const styles = {
    emerald: {
      bg: 'bg-[#00E5A8]/12',
      border: 'border-[#00E5A8]/30',
      text: 'text-[#00E5A8]',
      dot: 'bg-[#00E5A8]',
      shadow: 'shadow-[0_0_10px_rgba(0,229,168,0.5)]',
    },
    cyan: {
      bg: 'bg-[#5EE6FF]/12',
      border: 'border-[#5EE6FF]/30',
      text: 'text-[#5EE6FF]',
      dot: 'bg-[#5EE6FF]',
      shadow: 'shadow-[0_0_10px_rgba(94,230,255,0.5)]',
    },
    amber: {
      bg: 'bg-amber-400/12',
      border: 'border-amber-400/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      shadow: 'shadow-[0_0_10px_rgba(251,191,36,0.5)]',
    },
  }[color];

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-200 shadow-xs select-none',
        styles.bg,
        styles.border,
        styles.text
      )}
    >
      {icon ? (
        icon
      ) : (
        <div className="relative flex items-center justify-center">
          <div className={cn('w-2 h-2 rounded-full', styles.dot, styles.shadow)} />
        </div>
      )}
      <span>{label}</span>
    </div>
  );
}

/** Status pill badge (Right section) */
function StatusBadge({
  label,
  color,
  pulse = false,
}: {
  label: string;
  color: 'emerald' | 'cyan' | 'amber';
  pulse?: boolean;
}) {
  const styles = {
    emerald: {
      dot: 'bg-[#00E5A8]',
      text: 'text-[#00E5A8]',
      glow: 'shadow-[0_0_10px_rgba(0,229,168,0.6)]',
    },
    cyan: {
      dot: 'bg-[#5EE6FF]',
      text: 'text-[#5EE6FF]',
      glow: 'shadow-[0_0_10px_rgba(94,230,255,0.6)]',
    },
    amber: {
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_10px_rgba(251,191,36,0.6)]',
    },
  }[color];

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#12161E]/90 border border-white/10 hover:border-white/20 transition-all duration-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
      <div className="relative flex items-center justify-center">
        <div className={cn('w-2 h-2 rounded-full', styles.dot, styles.glow)} />
        {pulse && (
          <div className={cn('absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75', styles.dot)} />
        )}
      </div>
      <span className={cn('text-xs font-semibold tracking-wide', styles.text)}>
        {label}
      </span>
    </div>
  );
}

/** Detailed telemetry card inside expanded tech drawer */
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
    <div
      className={cn(
        'flex flex-col p-4 rounded-xl bg-[#12161E]/90 border border-white/10 shadow-xs gap-1',
        'hover:border-white/20 transition-all duration-200',
        highlight && 'border-[#00E5A8]/50 bg-[#00E5A8]/10 shadow-[0_0_18px_rgba(0,229,168,0.15)]'
      )}
      suppressHydrationWarning
    >
      <span className="text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase font-sans leading-tight">
        {label}
      </span>
      <span
        className={cn(
          'text-sm font-mono font-bold text-white tabular-nums truncate leading-tight',
          highlight && 'text-[#00E5A8]'
        )}
      >
        {value}
      </span>
    </div>
  );
}
