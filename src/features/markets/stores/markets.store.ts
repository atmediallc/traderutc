import { create } from 'zustand';
import { marketEngine, Market } from '@/engines';

type AssetClass = 'All' | 'Stocks' | 'Futures' | 'Crypto' | 'Forex';

interface MarketsState {
  /** Currently selected market ID (for detail card/focus) */
  selectedMarketId: string | null;
  /** Search query string */
  searchQuery: string;
  /** Active asset class filter */
  activeFilter: AssetClass;
  /** Filtered list of markets based on search and filters */
  filteredMarkets: Market[];
}

interface MarketsActions {
  selectMarket: (marketId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: AssetClass) => void;
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
    const results = marketEngine.searchMarkets(query);
    // TODO: Apply activeFilter logic here if we add asset classes to Market data
    set({ filteredMarkets: results });
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
    // Re-filter
    const state = get();
    const results = marketEngine.searchMarkets(state.searchQuery);
    // TODO: Apply activeFilter logic here
    set({ filteredMarkets: results });
  },
}));
