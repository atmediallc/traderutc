/**
 * TimeProvider
 *
 * Global time tick provider. Runs a single 1-second interval that
 * drives all time-dependent UI across the application.
 *
 * This ensures:
 * - Only one setInterval exists (no timer proliferation)
 * - All components see the same UTC snapshot each second
 * - No clock drift between different UI elements
 */
'use client';

import { useEffect } from 'react';
import { useUTCStore } from '@/features/utc/stores/utc.store';

interface TimeProviderProps {
  children: React.ReactNode;
  /** Tick interval in milliseconds (default: 1000) */
  intervalMs?: number;
}

export function TimeProvider({ children, intervalMs = 1000 }: TimeProviderProps) {
  const tick = useUTCStore((s) => s.tick);

  useEffect(() => {
    // Initial tick
    tick();

    // Set up the global timer
    const intervalId = setInterval(tick, intervalMs);

    return () => clearInterval(intervalId);
  }, [tick, intervalMs]);

  return <>{children}</>;
}
