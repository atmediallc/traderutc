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
  Eye,
  EyeOff,
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
  const postProcessingEnabled = useEarthStore((s) => s.postProcessingEnabled);
  const togglePostProcessing = useEarthStore((s) => s.togglePostProcessing);

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

      {/* Floating Control Bar (bottom-center) */}
      <div
        className="fixed bottom-19 left-1/2 -translate-x-1/2 z-100 flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/15"
        style={{
          background: 'linear-gradient(180deg, rgba(20,25,35,0.75) 0%, rgba(10,12,18,0.90) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
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
            icon={postProcessingEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            label="FX"
            onClick={togglePostProcessing}
            active={postProcessingEnabled}
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
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/35 shadow-[0_0_15px_rgba(56,189,248,0.2)]',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/35 shadow-[0_0_15px_rgba(52,211,153,0.2)]',
    neutral: 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.15)]',
  }[variant];

  const indicatorColor = {
    blue: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    emerald: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    neutral: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]',
  }[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] font-sans font-semibold tracking-wide uppercase transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 border border-transparent select-none",
        active
          ? activeClass
          : "text-white/45 hover:text-white/80 hover:bg-white/[0.06]"
      )}
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      
      {/* Premium indicator underline */}
      {active && (
        <motion.span
          layoutId={`active-bar-${variant}`}
          className={cn("absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full", indicatorColor)}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      )}
    </button>
  );
}
