/**
 * UTC Store
 *
 * Manages the global time state and user-selected UTC clocks.
 * A single 1-second interval drives all time-dependent UI.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UTCClock } from '../types/utc.types';
import { timeEngine, TimeFormats } from '@/engines';

interface UTCState {
  /** Current UTC in milliseconds (updated every second) */
  utcMs: number;
  /** Computed time formats (cached, recalculated each tick) */
  formats: TimeFormats;
  /** User-selected clocks to display */
  selectedClocks: UTCClock[];
}

interface UTCActions {
  /** Update the current time (called by the global timer) */
  tick: () => void;
  /** Add a UTC clock to the display */
  addClock: (clock: UTCClock) => void;
  /** Remove a UTC clock from the display */
  removeClock: (clockId: string) => void;
  /** Clear all selected clocks */
  clearClocks: () => void;
}

const initialMs = Date.now();

export const useUTCStore = create<UTCState & UTCActions>()(
  persist(
    (set) => ({
      // State
      utcMs: initialMs,
      formats: timeEngine.computeTimeFormats(initialMs),
      selectedClocks: [
        {
          id: 'utc',
          label: 'UTC',
          offset: 0,
          ianaZone: 'UTC',
          isDst: false,
        },
      ],

      // Actions
      tick: () => {
        const now = Date.now();
        set({
          utcMs: now,
          formats: timeEngine.computeTimeFormats(now),
        });
      },

      addClock: (clock) =>
        set((state) => {
          // Prevent duplicates
          if (state.selectedClocks.some((c) => c.id === clock.id)) {
            return state;
          }
          return { selectedClocks: [...state.selectedClocks, clock] };
        }),

      removeClock: (clockId) =>
        set((state) => ({
          selectedClocks: state.selectedClocks.filter((c) => c.id !== clockId),
        })),

      clearClocks: () => set({ selectedClocks: [] }),
    }),
    {
      name: 'traderutc-clocks',
      // Only persist selected clocks, not the time itself
      partialize: (state) => ({ selectedClocks: state.selectedClocks }),
    }
  )
);
