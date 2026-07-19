/**
 * Dashboard Component
 *
 * The main orchestrator that composes all features into the
 * complete TraderUTC Earth experience. This is a client component
 * that dynamically imports the 3D canvas to avoid SSR issues.
 */
'use client';

import dynamic from 'next/dynamic';
import { AppShell } from '@/features/layout/components/AppShell';

// Dynamic import with SSR disabled (ECharts requires browser APIs)
const EarthCanvas = dynamic(
  () =>
    import('@/features/earth/components/EarthCanvas').then(
      (mod) => mod.EarthCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-[#000308]">
        <div className="flex flex-col items-center gap-4">
          {/* Animated loading spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-white/6" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400/60 animate-spin" />
            <div className="absolute inset-2 rounded-full border border-transparent border-t-emerald-400/30 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-mono font-medium text-white/60 tracking-wider">
              INITIALIZING
            </span>
            <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
              Loading Earth Textures
            </span>
          </div>
        </div>
      </div>
    ),
  }
);

export function Dashboard() {
  return (
    <AppShell>
      <EarthCanvas />
    </AppShell>
  );
}
