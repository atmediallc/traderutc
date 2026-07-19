import { IDataEngine } from './data.interface';

export class DataEngine implements IDataEngine {
  async fetchMarketData(): Promise<Record<string, string>> {
    // Basic implementation / skeleton for REST APIs, future WebSocket client
    return { status: 'ok', source: 'offline-cache' };
  }
}

export const dataEngine = new DataEngine();
