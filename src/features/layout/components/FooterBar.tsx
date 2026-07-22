/**
 * FooterBar — Institutional-grade telemetry & telemetry status strip
 *
 * Bloomberg-inspired bottom telemetry panel with real-time performance indicators:
 * [LED SYNC] | FPS 60 | ZOOM L4 | QUALITY HQ | WAVE 67% | UTC 14:30:45
 */
'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { useEarthStore } from '@/features/earth/stores/earth.store';
import { marketIntelligenceEngine } from '@/engines';
import { cn } from '@/lib/utils';
import { Cpu, Activity, Zap, Radio } from 'lucide-react';

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

function LedDot({ active, color = 'emerald' }: { active: boolean; color?: 'emerald' | 'amber' | 'cyan' | 'red' }) {
  const colors: Record<string, string> = {
    emerald: 'bg-[#00E5A8] shadow-[0_0_8px_rgba(0,229,168,0.7)]',
    amber: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
    cyan: 'bg-[#5EE6FF] shadow-[0_0_8px_rgba(94,230,255,0.7)]',
    red: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]',
  };
  return (
    <span
      className={cn(
        'inline-block w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500',
        active ? colors[color] : 'bg-white/20'
      )}
    />
  );
}

function VDiv() {
  return <div className="w-px h-3 bg-gradient-to-b from-transparent via-white/12 to-transparent mx-2 shrink-0" />;
}

function Metric({ label, value, className, icon }: { label: string; value: string; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={cn('flex items-center gap-1.5 shrink-0 font-mono', className)}>
      {icon}
      <span className="text-[9px] text-[#94A3B8] tracking-widest uppercase font-medium">{label}</span>
      <span suppressHydrationWarning className="text-[10px] font-bold text-white/90 tabular-nums">{value}</span>
    </div>
  );
}

function InlineBar({ value, color }: { value: number; color: 'emerald' | 'amber' | 'cyan' }) {
  const barColor = {
    emerald: 'bg-[#00E5A8]',
    amber: 'bg-amber-400',
    cyan: 'bg-[#5EE6FF]',
  }[color];

  return (
    <div className="flex items-center gap-2 shrink-0 font-mono">
      <span className="text-[9px] text-[#94A3B8] tracking-widest uppercase font-medium">WAVE</span>
      <div className="relative w-14 h-1.5 rounded-full bg-white/8 overflow-hidden p-0.5 border border-white/5">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span suppressHydrationWarning className="text-[10px] font-bold text-white/80 tabular-nums">
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

  const waveColor = marketIntel.wave.id === 'asia' ? 'cyan' : marketIntel.wave.id === 'europe' ? 'amber' : 'emerald';
  const isWeekend = formats.dayName === 'Saturday' || formats.dayName === 'Sunday';
  const statusColor = isWeekend ? 'amber' : 'emerald';
  const qualityLabel = quality === 'high' ? 'HQ 60FPS' : quality === 'medium' ? 'MQ' : 'LQ';

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-[90] h-8 border-t border-white/8 select-none flex items-center justify-between px-4 safe-area-bottom"
      style={{
        background: 'linear-gradient(180deg, rgba(8,12,18,0.95) 0%, rgba(4,6,10,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: System telemetry */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5">
          <LedDot active={!isWeekend} color={statusColor} />
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#00E5A8] uppercase">
            {isWeekend ? 'IDLE' : 'SYNCED'}
          </span>
        </div>

        <VDiv />

        <Metric label="FPS" value={`${fps}`} icon={<Activity className="w-3 h-3 text-[#00E5A8]" />} />
        <span className={cn(
          'inline-block w-1.5 h-1.5 rounded-full shrink-0',
          fps >= 55 ? 'bg-[#00E5A8] shadow-[0_0_6px_rgba(0,229,168,0.6)]' : fps >= 30 ? 'bg-amber-400' : 'bg-red-400'
        )} />

        <VDiv />
        <Metric label="RENDER" value={qualityLabel} icon={<Cpu className="w-3 h-3 text-[#5EE6FF]" />} />
      </div>

      {/* Center: Market intelligence & wave */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        <InlineBar value={marketIntel.wave.progress} color={waveColor} />
        <VDiv />
        <Metric label="LIQUIDITY" value={`${Math.round(marketIntel.liquidity)}%`} />
        <div className="hidden sm:flex items-center gap-3">
          <VDiv />
          <Metric label="ZOOM" value={`L${zoomLevel}`} />
        </div>
      </div>

      {/* Right: Master UTC Clock */}
      <div className="flex items-center gap-2 shrink-0">
        <Radio className="w-3 h-3 text-[#00E5A8] animate-pulse" />
        <Metric label="UTC MASTER" value={formats.utc || '--:--:--'} />
      </div>
    </footer>
  );
}
