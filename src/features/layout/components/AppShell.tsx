/**
 * AppShell Component
 *
 * The main layout container that positions the Earth canvas as the
 * full-screen background and overlays all UI panels on top with
 * glassmorphism styling.
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
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none">
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

      {/* Floating Control Bar (bottom-center dock, above FooterBar) */}
      <div
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[95] flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 hover:border-white/25 max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-hide"
        style={{
          background: 'linear-gradient(180deg, rgba(14,18,26,0.9) 0%, rgba(6,8,14,0.98) 100%)',
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
        }}
      >
        {/* Group 1: Panels */}
        <div className="flex items-center gap-1.5">
          <ControlButton
            icon={<PanelLeft className="w-4 h-4" />}
            label="Markets"
            onClick={toggleLeftSidebar}
            active={leftSidebarOpen}
            variant="cyan"
          />
          <ControlButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="Sessions"
            onClick={toggleSessionPanel}
            active={sessionPanelOpen}
            variant="cyan"
          />
          <ControlButton
            icon={<Clock className="w-4 h-4" />}
            label="Clocks"
            onClick={toggleRightPanel}
            active={rightPanelOpen}
            variant="cyan"
          />
        </div>

        {/* Divider 1 */}
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0" />

        {/* Group 2: Utilities */}
        <div className="flex items-center gap-1.5">
          <ControlButton
            icon={<Search className="w-4 h-4" />}
            label="Search"
            onClick={toggleSearch}
            active={searchOpen}
            variant="cyan"
          />
          <ControlButton
            icon={<Calendar className="w-4 h-4" />}
            label="Calendar"
            onClick={toggleCalendar}
            active={calendarOpen}
            variant="cyan"
          />
        </div>

        {/* Divider 2 */}
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0" />

        {/* Group 3: Globe Controls */}
        <div className="flex items-center gap-1.5">
          <ControlButton
            icon={<RotateCcw className="w-4 h-4" />}
            label={autoRotate ? 'Stop' : 'Rotate'}
            onClick={() => {
              if (autoRotate) {
                setAutoRotate(false);
              } else {
                setAutoRotate(true);
              }
            }}
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
  variant = 'cyan',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: 'cyan' | 'emerald' | 'neutral';
}) {
  const activeClass = {
    cyan: 'bg-[#5EE6FF]/15 text-[#5EE6FF] border-[#5EE6FF]/40 shadow-[0_0_14px_rgba(94,230,255,0.3)]',
    emerald: 'bg-[#00E5A8]/15 text-[#00E5A8] border-[#00E5A8]/40 shadow-[0_0_14px_rgba(0,229,168,0.3)]',
    neutral: 'bg-white/12 text-white border-white/25',
  }[variant];

  const indicatorColor = {
    cyan: 'bg-[#5EE6FF] shadow-[0_0_8px_rgba(94,230,255,0.8)]',
    emerald: 'bg-[#00E5A8] shadow-[0_0_8px_rgba(0,229,168,0.8)]',
    neutral: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]',
  }[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 border border-transparent select-none",
        active
          ? activeClass
          : "text-white/50 hover:text-white hover:bg-white/8 hover:border-white/15"
      )}
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>

      {/* Active indicator underline */}
      {active && (
        <motion.span
          layoutId={`active-bar-${variant}`}
          className={cn("absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full", indicatorColor)}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        />
      )}
    </button>
  );
}
