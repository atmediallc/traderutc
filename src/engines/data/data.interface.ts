export interface MarketDataResponse {
  status: string;
  source: string;
}

export interface IDataEngine {
  fetchMarketData(): Promise<MarketDataResponse>;
}
