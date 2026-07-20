/**
 * AppShell Component
 *
 * The main layout container that positions the Earth canvas as the
 * full-screen background and overlays all UI panels on top with
 * glassmorphism styling.
 *
 * Layout structure:
 * ┌─────────────────────────────────┐
 * │           Header Bar            │
 * ├────┬───────────────────┬────────┤
 * │    │                   │  UTC   │
 * │ L  │    3D Earth       │  Panel │
 * │    │    (Canvas)       │        │
 * │    │                   │        │
 * ├────┴───────────────────┴────────┤
 * │         Footer Bar              │
 * │   (System / Market Telemetry)   │
 * └─────────────────────────────────┘
 */
'use client';

import { HeaderTimeBar } from '@/features/utc/components/HeaderTimeBar';
import { useLayoutStore } from '../stores/layout.store';
import {
  PanelLeft,
  Clock,
  BarChart3,
  Search,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { useEarthStore } from '@/features/earth/stores/earth.store';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { MarketCard } from '@/features/markets/components/MarketCard';
import { MarketSessionPanel } from '@/features/markets/components/MarketSessionPanel';
import { LeftSidebar } from '@/features/markets/components/LeftSidebar';
import { CommandPalette } from '@/features/markets/components/CommandPalette';
import { RightPanel } from '@/features/utc/components/RightPanel';
import { CoordinateTelemetryCard } from '@/features/earth';
import { FooterBar } from './FooterBar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const toggleLeftSidebar = useLayoutStore((s) => s.toggleLeftSidebar);
  const toggleRightPanel = useLayoutStore((s) => s.toggleRightPanel);
  const toggleSessionPanel = useLayoutStore((s) => s.toggleSessionPanel);
  const toggleSearch = useLayoutStore((s) => s.toggleSearch);
  const toggleCalendar = useLayoutStore((s) => s.toggleCalendar);

  const leftSidebarOpen = useLayoutStore((s) => s.leftSidebarOpen);
  const rightPanelOpen = useLayoutStore((s) => s.rightPanelOpen);
  const sessionPanelOpen = useLayoutStore((s) => s.sessionPanelOpen);
  const searchOpen = useLayoutStore((s) => s.searchOpen);
  const calendarOpen = useLayoutStore((s) => s.calendarOpen);

  const autoRotate = useEarthStore((s) => s.autoRotate);
  const setAutoRotate = useEarthStore((s) => s.setAutoRotate);
  const resetCamera = useEarthStore((s) => s.resetCamera);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {/* Header */}
      <HeaderTimeBar />

      {/* 3D Earth Canvas (full screen background) */}
      <div className="absolute inset-0">
        {children}
      </div>

      {/* Side Panels */}
      <LeftSidebar />
      <RightPanel />

      {/* Floating Overlays */}
      <MarketCard />
      <MarketSessionPanel />
      <CommandPalette />
      <CoordinateTelemetryCard />

      {/* Floating Control Bar (bottom-center, above FooterBar) */}
      <div
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-95 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-white/8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-white/12 hover:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.9)]"
        style={{
          background: 'linear-gradient(180deg, rgba(20,25,35,0.82) 0%, rgba(10,12,18,0.92) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Group 1: Panels */}
        <div className="flex items-center gap-1">
          <ControlButton
            icon={<PanelLeft className="w-4 h-4" />}
            label="Markets"
            onClick={toggleLeftSidebar}
            active={leftSidebarOpen}
            variant="blue"
          />
          <ControlButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="Sessions"
            onClick={toggleSessionPanel}
            active={sessionPanelOpen}
            variant="blue"
          />
          <ControlButton
            icon={<Clock className="w-4 h-4" />}
            label="Clocks"
            onClick={toggleRightPanel}
            active={rightPanelOpen}
            variant="blue"
          />
        </div>

        {/* Divider 1 */}
        <div className="w-px h-6 bg-gradient-to-b from-white/0 via-white/15 to-white/0 mx-1 shrink-0" />

        {/* Group 2: Utilities */}
        <div className="flex items-center gap-1">
          <ControlButton
            icon={<Search className="w-4 h-4" />}
            label="Search"
            onClick={toggleSearch}
            active={searchOpen}
            variant="blue"
          />
          <ControlButton
            icon={<Calendar className="w-4 h-4" />}
            label="Calendar"
            onClick={toggleCalendar}
            active={calendarOpen}
            variant="blue"
          />
        </div>

        {/* Divider 2 */}
        <div className="w-px h-6 bg-gradient-to-b from-white/0 via-white/15 to-white/0 mx-1 shrink-0" />

        {/* Group 3: Globe Controls */}
        <div className="flex items-center gap-1">
          <ControlButton
            icon={<RotateCcw className="w-4 h-4" />}
            label={autoRotate ? 'Stop' : 'Rotate'}
            onClick={() => setAutoRotate(!autoRotate)}
            active={autoRotate}
            variant="emerald"
          />
          <ControlButton
            icon={<RotateCcw className="w-4 h-4" />}
            label="Reset"
            onClick={resetCamera}
            variant="neutral"
          />
        </div>
      </div>

      {/* Footer Bar — System Telemetry & Market Intelligence */}
      <FooterBar />
    </div>
  );
}

function ControlButton({
  icon,
  label,
  onClick,
  active,
  variant = 'blue',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: 'blue' | 'emerald' | 'neutral';
}) {
  const activeClass = {
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    neutral: 'bg-white/10 text-white border-white/20',
  }[variant];

  const indicatorColor = {
    blue: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]',
    emerald: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
    neutral: 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]',
  }[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono font-medium tracking-wide uppercase transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 border border-transparent select-none",
        active
          ? activeClass
          : "text-white/40 hover:text-white/75 hover:bg-white/5"
      )}
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>

      {/* Active indicator underline */}
      {active && (
        <motion.span
          layoutId={`active-bar-${variant}`}
          className={cn("absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full", indicatorColor)}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      )}
    </button>
  );
}
