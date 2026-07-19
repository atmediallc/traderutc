export interface IDataEngine {
  fetchMarketData(): Promise<Record<string, string>>;
}
