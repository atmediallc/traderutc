/**
 * Layout Store
 *
 * Manages UI layout state: sidebar visibility, panel states,
 * and responsive breakpoint tracking.
 */
import { create } from 'zustand';

interface LayoutState {
  /** Whether left sidebar (filters) is open */
  leftSidebarOpen: boolean;
  /** Whether right panel (UTC clocks) is open */
  rightPanelOpen: boolean;
  /** Whether bottom timeline is expanded */
  bottomBarExpanded: boolean;
  /** Whether market session panel is visible */
  sessionPanelOpen: boolean;
  /** Whether search command palette is open */
  searchOpen: boolean;
  /** Whether economic calendar is open */
  calendarOpen: boolean;
  /** Currently selected market ID (for card display) */
  selectedMarketId: string | null;
}

interface LayoutActions {
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  toggleBottomBar: () => void;
  toggleSessionPanel: () => void;
  toggleSearch: () => void;
  toggleCalendar: () => void;
  selectMarket: (marketId: string | null) => void;
  closeAllPanels: () => void;
}

export const useLayoutStore = create<LayoutState & LayoutActions>((set) => ({
  // State — conservative defaults (minimal UI on first load)
  leftSidebarOpen: false,
  rightPanelOpen: false,
  bottomBarExpanded: true,
  sessionPanelOpen: false,
  searchOpen: false,
  calendarOpen: false,
  selectedMarketId: null,

  // Actions
  toggleLeftSidebar: () =>
    set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightPanel: () =>
    set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleBottomBar: () =>
    set((s) => ({ bottomBarExpanded: !s.bottomBarExpanded })),
  toggleSessionPanel: () =>
    set((s) => ({ sessionPanelOpen: !s.sessionPanelOpen })),
  toggleSearch: () =>
    set((s) => ({ searchOpen: !s.searchOpen })),
  toggleCalendar: () =>
    set((s) => ({ calendarOpen: !s.calendarOpen })),
  selectMarket: (marketId) => set({ selectedMarketId: marketId }),
  closeAllPanels: () =>
    set({
      leftSidebarOpen: false,
      rightPanelOpen: false,
      sessionPanelOpen: false,
      searchOpen: false,
      calendarOpen: false,
      selectedMarketId: null,
    }),
}));
