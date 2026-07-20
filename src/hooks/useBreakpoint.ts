/**
 * useBreakpoint Hook
 *
 * Lightweight responsive breakpoint tracking.
 * Uses matchMedia for performant, SSR-safe viewport detection.
 *
 * Breakpoints:
 * - sm: 640px   (large phones)
 * - md: 768px   (tablets)
 * - lg: 1024px  (small desktops / landscape tablets)
 * - xl: 1280px  (desktops)
 * - 2xl: 1536px (wide desktops)
 */
'use client';
import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export interface BreakpointState {
  width: number;
  isPhone: boolean;       // < 640px
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // >= 768px && < 1024px
  isDesktop: boolean;     // >= 1024px
  isWide: boolean;        // >= 1280px
  current: Breakpoint;
  gt: (bp: Breakpoint) => boolean;
  lt: (bp: Breakpoint) => boolean;
  gte: (bp: Breakpoint) => boolean;
  lte: (bp: Breakpoint) => boolean;
}

function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  return 'sm';
}

function getState(width: number): BreakpointState {
  const current = getCurrentBreakpoint(width);
  return {
    width,
    isPhone: width < 640,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isWide: width >= 1280,
    current,
    gt: (bp) => width > BREAKPOINTS[bp],
    lt: (bp) => width < BREAKPOINTS[bp],
    gte: (bp) => width >= BREAKPOINTS[bp],
    lte: (bp) => width <= BREAKPOINTS[bp],
  };
}

/** SSR-safe default — assume desktop during SSR */
export const defaultBreakpoint: BreakpointState = {
  width: 1920,
  isPhone: false,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isWide: true,
  current: '2xl',
  gt: (bp) => 1920 > BREAKPOINTS[bp],
  lt: (bp) => 1920 < BREAKPOINTS[bp],
  gte: (bp) => 1920 >= BREAKPOINTS[bp],
  lte: (bp) => 1920 <= BREAKPOINTS[bp],
};

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    if (typeof window === 'undefined') return defaultBreakpoint;
    return getState(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setState(getState(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
