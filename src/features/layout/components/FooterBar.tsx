/**
 * FooterBar Component
 *
 * Enterprise-grade system footer bar displaying real-time:
 * - System status & sync health
 * - Global market liquidity & trading wave
 * - Performance telemetry (FPS, zoom, quality)
 *
 * Bloomberg-terminal inspired telemetry strip.
 * Fixed to the bottom edge of the viewport.
 */
'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { useEarthStore } from '@/features/earth/stores/earth.store';
import { marketIntelligenceEngine, marketEngine } from '@/engines';
import { cn } from '@/lib/utils';

/** Format milliseconds to a concise human duration */
function formatDuration(ms: number): string {
  if (ms < 60000) return '<1m';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.round((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/* ──────────────────────────────────────────────
 * Live FPS Hook (frame-averaged, low overhead)
 * ────────────────────────────────────────────── */
function useFps(): number {
  const fpsRef = useRef(0);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    let frames = 0;

    const tick = (now: number) => {
      frames++;
      const delta = now - lastTime;
      if (delta >= 500) {
        fpsRef.current = Math.round((frames * 1000) / delta);
        setFps(fpsRef.current);
        frames = 0;
        lastTime = now;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return fps;
}

/* ──────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────── */

/** Animated LED dot */
function LedDot({ active, color = 'emerald' }: { active: boolean; color?: 'emerald' | 'amber' | 'sky' | 'red' }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]',
    amber: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
    sky: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]',
    red: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]',
  };
  return (
    <span
      className={cn(
        'inline-block w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500',
        active ? colors[color] : 'bg-white/10',
        active && 'animate-pulse'
      )}
    />
  );
}

/** Small label + value pair */
function Metric({ label, value, mono = true, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span className="text-[9px] font-medium text-white/35 tracking-widest uppercase">{label}</span>
      <span className={cn('text-[11px] font-semibold text-white/85', mono && 'font-mono tracking-tight')}>
        {value}
      </span>
    </span>
  );
}

/** Visual divider */
function VDiv() {
  return <div className="w-px h-4 bg-gradient-to-b from-white/0 via-white/12 to-white/0 mx-2 shrink-0" />;
}

/** Liquidity / progress bar with label */
function ProgressMeter({
  value,
  label,
  color = 'emerald',
  className,
}: {
  value: number;
  label: string;
  color?: 'emerald' | 'amber' | 'sky';
  className?: string;
}) {
  const barColor = {
    emerald: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]',
    amber: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.35)]',
    sky: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.35)]',
  }[color];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-[9px] font-medium text-white/35 tracking-widest uppercase shrink-0">{label}</span>
      <div className="relative w-16 h-1.5 rounded-full bg-white/6 overflow-hidden">
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="font-mono text-[10px] font-semibold text-white/60 w-8 text-right tabular-nums">
        {Math.round(value)}%
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Main FooterBar
 * ────────────────────────────────────────────── */
export function FooterBar() {
  const utcMs = useUTCStore((s) => s.utcMs);
  const formats = useUTCStore((s) => s.formats);
  const zoomLevel = useEarthStore((s) => s.zoomLevel);
  const quality = useEarthStore((s) => s.quality);

  const fps = useFps();

  // Compute market intelligence metrics on each tick
  const marketIntel = useMemo(() => {
    const wave = marketIntelligenceEngine.getCurrentTradingWave(utcMs);
    const liquidity = marketIntelligenceEngine.getGlobalLiquidity(utcMs);
    const heat = marketIntelligenceEngine.getMarketHeat(utcMs);
    const activeCount = marketIntelligenceEngine.getActiveMarkets(utcMs).length;
    const nextOpening = marketIntelligenceEngine.getNextOpening(utcMs);
    const nextClosing = marketIntelligenceEngine.getNextClosing(utcMs);

    return { wave, liquidity, heat, activeCount, nextOpening, nextClosing };
  }, [utcMs]);

  const waveColor = marketIntel.wave.id === 'asia' ? 'sky' : marketIntel.wave.id === 'europe' ? 'amber' : 'emerald';
  const isWeekend = formats.dayName === 'Saturday' || formats.dayName === 'Sunday';
  const sysStatus = isWeekend ? 'IDLE' : 'OPERATIONAL';
  const statusColor = isWeekend ? 'amber' : 'emerald';
  const qualityLabel = quality === 'high' ? 'HQ' : quality === 'medium' ? 'MQ' : 'LQ';

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-[90] h-[30px] border-t border-white/8 select-none"
      style={{
        background: 'linear-gradient(180deg, rgba(8,10,16,0.88) 0%, rgba(4,5,10,0.96) 100%)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 text-[11px] font-sans">
        {/* ── Left: System Status ── */}
        <div className="flex items-center gap-2 min-w-0">
          <LedDot active={!isWeekend} color={statusColor} />
          <span className="text-[10px] font-mono font-semibold tracking-wider text-white/70 uppercase">
            {sysStatus}
          </span>
          <VDiv />
          <Metric label="SYNC" value={formats.utc || '--:--:--'} />
          <VDiv />
          <ProgressMeter value={marketIntel.liquidity} label="LIQ" color={marketIntel.liquidity > 60 ? 'emerald' : 'amber'} />
        </div>

        {/* ── Center: Market Intelligence ── */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Trading Wave */}
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-white/5 bg-white/[0.03]">
            <LedDot active={marketIntel.wave.active} color={waveColor} />
            <span className="text-[10px] font-mono font-semibold tracking-wide text-white/75 uppercase">
              {marketIntel.wave.name}
            </span>
            <div className="relative w-14 h-1 rounded-full bg-white/6 overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out',
                  waveColor === 'sky' ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)]' :
                  waveColor === 'amber' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]' :
                  'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                )}
                style={{ width: `${Math.min(100, Math.max(0, marketIntel.wave.progress))}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-semibold text-white/50 w-7 text-right tabular-nums">
              {marketIntel.wave.progress}%
            </span>
          </div>

          <VDiv />

          {/* Active Markets & Next Event */}
          <Metric label="ACTIVE" value={`${marketIntel.activeCount} mkts`} />
          <VDiv />
          <Metric label="HEAT" value={`${marketIntel.heat}%`} />
          <VDiv />

          {/* Next event */}
          {marketIntel.nextClosing && (
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="text-[9px] font-medium text-white/30 tracking-wider uppercase">CLOSE</span>
              <span className="font-mono text-[10px] text-amber-400/80 font-semibold tabular-nums">
                {marketIntel.nextClosing.marketId.replace('_', ' ').slice(0, 10)}{' '}
                {formatDuration(marketIntel.nextClosing.timeRemainingMs)}
              </span>
            </span>
          )}
        </div>

        {/* ── Right: Performance Telemetry ── */}
        <div className="flex items-center gap-2 min-w-0">
          <VDiv />
          <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-white/5 bg-white/[0.03]">
            <Metric label="FPS" value={`${fps}`} />
            <span className={cn(
              'inline-block w-1.5 h-1.5 rounded-full shrink-0',
              fps >= 55 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' :
              fps >= 30 ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]' :
              'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]'
            )} />
          </div>
          <VDiv />
          <Metric label="ZOOM" value={`L${zoomLevel}`} />
          <VDiv />
          <Metric label="QUALITY" value={qualityLabel} />
          <VDiv />
          <Metric label="UTC" value={formats.utc} />
        </div>
      </div>
    </footer>
  );
}
