/**
 * FooterBar — Compact single-row telemetry strip
 *
 * Bloomberg-inspired bottom status bar with inline metrics:
 * [LED SYNC] | FPS 59 | ZOOM L4 | HQ | ▰▰▰▱▱ 67% | UTC 14:30:45
 */
'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { useEarthStore } from '@/features/earth/stores/earth.store';
import { marketIntelligenceEngine } from '@/engines';
import { cn } from '@/lib/utils';

/* ─── FPS Hook ─── */
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

/* ─── Sub-components ─── */

function LedDot({ active, color = 'emerald' }: { active: boolean; color?: 'emerald' | 'amber' | 'sky' | 'red' }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
    amber: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
    sky: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]',
    red: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]',
  };
  return (
    <span
      className={cn(
        'inline-block w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500',
        active ? colors[color] : 'bg-white/15'
      )}
    />
  );
}

function VDiv() {
  return <div className="w-px h-2.5 bg-white/8 mx-1.5 shrink-0" />;
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5 shrink-0', className)}>
      <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">{label}</span>
      <span suppressHydrationWarning className="text-[10px] font-mono font-semibold text-white/70 tabular-nums">{value}</span>
    </div>
  );
}

function InlineBar({ value, color }: { value: number; color: 'emerald' | 'amber' | 'sky' }) {
  const barColor = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    sky: 'bg-sky-400',
  }[color];

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">WAVE</span>
      <div className="relative w-12 h-1 rounded-full bg-white/6 overflow-hidden">
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-[10px] font-mono font-semibold text-white/60 tabular-nums">
        {Math.round(value)}%
      </span>
    </div>
  );
}

/* ─── Main FooterBar ─── */
export function FooterBar() {
  const utcMs = useUTCStore((s) => s.utcMs);
  const formats = useUTCStore((s) => s.formats);
  const zoomLevel = useEarthStore((s) => s.zoomLevel);
  const quality = useEarthStore((s) => s.quality);

  const fps = useFps();

  const marketIntel = useMemo(() => {
    const wave = marketIntelligenceEngine.getCurrentTradingWave(utcMs);
    const liquidity = marketIntelligenceEngine.getGlobalLiquidity(utcMs);
    return { wave, liquidity };
  }, [utcMs]);

  const waveColor = marketIntel.wave.id === 'asia' ? 'sky' : marketIntel.wave.id === 'europe' ? 'amber' : 'emerald';
  const isWeekend = formats.dayName === 'Saturday' || formats.dayName === 'Sunday';
  const statusColor = isWeekend ? 'amber' : 'emerald';
  const qualityLabel = quality === 'high' ? 'HQ' : quality === 'medium' ? 'MQ' : 'LQ';

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-[90] h-7 border-t border-white/6 select-none flex items-center justify-between px-4"
      style={{
        background: 'linear-gradient(180deg, rgba(8,10,16,0.92) 0%, rgba(4,5,10,0.98) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Left: System status */}
      <div className="flex items-center gap-1.5 min-w-0">
        <LedDot active={!isWeekend} color={statusColor} />
        <span className="text-[10px] font-mono font-semibold tracking-wider text-white/60 uppercase">
          {isWeekend ? 'IDLE' : 'SYNC'}
        </span>
        <VDiv />
        <Metric label="FPS" value={`${fps}`} />
        <span className={cn(
          'inline-block w-1 h-1 rounded-full shrink-0',
          fps >= 55 ? 'bg-emerald-400' : fps >= 30 ? 'bg-amber-400' : 'bg-red-400'
        )} />
      </div>

      {/* Center: Market wave */}
      <div className="flex items-center gap-3">
        <InlineBar value={marketIntel.wave.progress} color={waveColor} />
        <VDiv />
        <Metric label="LIQ" value={`${Math.round(marketIntel.liquidity)}%`} />
        <VDiv />
        <Metric label="ZOOM" value={`L${zoomLevel}`} />
        <VDiv />
        <Metric label="Q" value={qualityLabel} />
      </div>

      {/* Right: UTC time */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Metric label="UTC" value={formats.utc || '--:--:--'} />
      </div>
    </footer>
  );
}
