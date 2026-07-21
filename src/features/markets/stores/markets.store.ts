import { create } from 'zustand';
import { marketEngine, Market, AssetClass } from '@/engines';

export type MarketFilter = 'All' | AssetClass;

interface MarketsState {
  /** Currently selected market ID (for detail card/focus) */
  selectedMarketId: string | null;
  /** Search query string */
  searchQuery: string;
  /** Active asset class filter */
  activeFilter: MarketFilter;
  /** Filtered list of markets based on search and filters */
  filteredMarkets: Market[];
}

interface MarketsActions {
  selectMarket: (marketId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: MarketFilter) => void;
}

export const useMarketsStore = create<MarketsState & MarketsActions>((set, get) => ({
  selectedMarketId: null,
  searchQuery: '',
  activeFilter: 'All',
  filteredMarkets: marketEngine.getMarkets(),

  selectMarket: (marketId) => set({ selectedMarketId: marketId }),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    // Re-filter
    let results = marketEngine.searchMarkets(query);
    const activeFilter = get().activeFilter;
    if (activeFilter !== 'All') {
      results = results.filter((m) => (m.assetClasses || ['Stocks']).includes(activeFilter));
    }
    set({ filteredMarkets: results });
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
    // Re-filter
    const state = get();
    let results = marketEngine.searchMarkets(state.searchQuery);
    if (filter !== 'All') {
      results = results.filter((m) => (m.assetClasses || ['Stocks']).includes(filter));
    }
    set({ filteredMarkets: results });
  },
}));
