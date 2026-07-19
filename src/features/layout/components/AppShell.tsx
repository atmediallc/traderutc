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
 * │         Timeline Bar            │
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

import { MarketCard } from '@/features/markets/components/MarketCard';
import { MarketSessionPanel } from '@/features/markets/components/MarketSessionPanel';
import { LeftSidebar } from '@/features/markets/components/LeftSidebar';
import { CommandPalette } from '@/features/markets/components/CommandPalette';
import { RightPanel } from '@/features/utc/components/RightPanel';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const toggleLeftSidebar = useLayoutStore((s) => s.toggleLeftSidebar);
  const toggleRightPanel = useLayoutStore((s) => s.toggleRightPanel);
  const toggleSessionPanel = useLayoutStore((s) => s.toggleSessionPanel);
  const toggleSearch = useLayoutStore((s) => s.toggleSearch);
  const autoRotate = useEarthStore((s) => s.autoRotate);
  const setAutoRotate = useEarthStore((s) => s.setAutoRotate);
  const resetCamera = useEarthStore((s) => s.resetCamera);
  const postProcessingEnabled = useEarthStore((s) => s.postProcessingEnabled);
  const togglePostProcessing = useEarthStore((s) => s.togglePostProcessing);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
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

      {/* Floating Control Bar (bottom-left) */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/8"
        style={{
          background: 'hsla(220, 25%, 3%, 0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <ControlButton
          icon={<PanelLeft className="w-4 h-4" />}
          label="Markets"
          onClick={toggleLeftSidebar}
        />
        <ControlButton
          icon={<BarChart3 className="w-4 h-4" />}
          label="Sessions"
          onClick={toggleSessionPanel}
        />
        <ControlButton
          icon={<Clock className="w-4 h-4" />}
          label="Clocks"
          onClick={toggleRightPanel}
        />
        <ControlButton
          icon={<Search className="w-4 h-4" />}
          label="Search"
          onClick={toggleSearch}
        />
        <ControlButton
          icon={<Calendar className="w-4 h-4" />}
          label="Calendar"
          onClick={() => {}}
        />

        <div className="w-px h-5 bg-white/8 mx-1" />

        <ControlButton
          icon={<RotateCcw className="w-4 h-4" />}
          label={autoRotate ? 'Stop' : 'Rotate'}
          onClick={() => setAutoRotate(!autoRotate)}
          active={autoRotate}
        />
        <ControlButton
          icon={postProcessingEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          label="FX"
          onClick={togglePostProcessing}
          active={postProcessingEnabled}
        />
        <ControlButton
          icon={<RotateCcw className="w-4 h-4" />}
          label="Reset"
          onClick={resetCamera}
        />
      </div>
    </div>
  );
}

/** Individual control button in the floating toolbar */
function ControlButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
        text-[10px] font-mono font-medium tracking-wider uppercase
        transition-all duration-200 cursor-pointer
        ${
          active
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
        }
      `}
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
