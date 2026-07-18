/**
 * Markets Store
 *
 * Manages the state of market UI elements, filtering, and selected market data.
 */
import { create } from 'zustand';
import { MARKETS } from '../constants/market-data';
import type { Market } from '../types/market.types';
import { searchMarkets } from '../services/market-search.service';

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
  filteredMarkets: MARKETS,

  selectMarket: (marketId) => set({ selectedMarketId: marketId }),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    // Re-filter
    const state = get();
    const results = searchMarkets(query);
    // TODO: Apply activeFilter logic here if we add asset classes to Market data
    set({ filteredMarkets: results });
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
    // Re-filter
    const state = get();
    const results = searchMarkets(state.searchQuery);
    // TODO: Apply activeFilter logic here
    set({ filteredMarkets: results });
  },
}));
