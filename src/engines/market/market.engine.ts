import { DateTime } from 'luxon';
import { Market } from '../shared/engine.types';
import { IMarketEngine } from './market.interface';

export const MARKETS: Market[] = [
  {
    id: 'NEW_YORK',
    city: 'New York',
    exchanges: ['NYSE', 'NASDAQ'],
    timezone: 'America/New_York',
    country: 'United States',
    coordinates: [40.7128, -74.0060],
    openLocal: '09:30',
    closeLocal: '16:00',
    preMarketOpenLocal: '04:00',
    afterHoursCloseLocal: '20:00',
    currency: 'USD',
    majorIndexes: ['S&P 500', 'DJIA', 'Nasdaq Composite'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'CHICAGO',
    city: 'Chicago',
    exchanges: ['CME', 'CBOT'],
    timezone: 'America/Chicago',
    country: 'United States',
    coordinates: [41.8781, -87.6298],
    openLocal: '08:30',
    closeLocal: '15:00',
    currency: 'USD',
    majorIndexes: ['S&P 500 Futures', 'VIX'],
    assetClasses: ['Futures'],
  },
  {
    id: 'TORONTO',
    city: 'Toronto',
    exchanges: ['TSX'],
    timezone: 'America/Toronto',
    country: 'Canada',
    coordinates: [43.6510, -79.3470],
    openLocal: '09:30',
    closeLocal: '16:00',
    preMarketOpenLocal: '07:00',
    afterHoursCloseLocal: '17:00',
    currency: 'CAD',
    majorIndexes: ['S&P/TSX Composite'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'LONDON',
    city: 'London',
    exchanges: ['LSE'],
    timezone: 'Europe/London',
    country: 'United Kingdom',
    coordinates: [51.5074, -0.1278],
    openLocal: '08:00',
    closeLocal: '16:30',
    currency: 'GBP',
    majorIndexes: ['FTSE 100', 'FTSE 250'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'FRANKFURT',
    city: 'Frankfurt',
    exchanges: ['XETRA'],
    timezone: 'Europe/Berlin',
    country: 'Germany',
    coordinates: [50.1109, 8.6821],
    openLocal: '09:00',
    closeLocal: '17:30',
    preMarketOpenLocal: '08:00',
    afterHoursCloseLocal: '22:00',
    currency: 'EUR',
    majorIndexes: ['DAX 40'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'ZURICH',
    city: 'Zurich',
    exchanges: ['SIX'],
    timezone: 'Europe/Zurich',
    country: 'Switzerland',
    coordinates: [47.3769, 8.5417],
    openLocal: '09:00',
    closeLocal: '17:30',
    currency: 'CHF',
    majorIndexes: ['SMI'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'PARIS',
    city: 'Paris',
    exchanges: ['Euronext Paris'],
    timezone: 'Europe/Paris',
    country: 'France',
    coordinates: [48.8566, 2.3522],
    openLocal: '09:00',
    closeLocal: '17:30',
    currency: 'EUR',
    majorIndexes: ['CAC 40'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'AMSTERDAM',
    city: 'Amsterdam',
    exchanges: ['Euronext Amsterdam'],
    timezone: 'Europe/Amsterdam',
    country: 'Netherlands',
    coordinates: [52.3676, 4.9041],
    openLocal: '09:00',
    closeLocal: '17:30',
    currency: 'EUR',
    majorIndexes: ['AEX'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'MADRID',
    city: 'Madrid',
    exchanges: ['BME'],
    timezone: 'Europe/Madrid',
    country: 'Spain',
    coordinates: [40.4168, -3.7038],
    openLocal: '09:00',
    closeLocal: '17:30',
    currency: 'EUR',
    majorIndexes: ['IBEX 35'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'MILAN',
    city: 'Milan',
    exchanges: ['Borsa Italiana'],
    timezone: 'Europe/Rome',
    country: 'Italy',
    coordinates: [45.4642, 9.1900],
    openLocal: '09:00',
    closeLocal: '17:30',
    currency: 'EUR',
    majorIndexes: ['FTSE MIB'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'DUBAI',
    city: 'Dubai',
    exchanges: ['DFM'],
    timezone: 'Asia/Dubai',
    country: 'UAE',
    coordinates: [25.2048, 55.2708],
    openLocal: '10:00',
    closeLocal: '14:00',
    currency: 'AED',
    majorIndexes: ['DFM General Index'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'MUMBAI',
    city: 'Mumbai',
    exchanges: ['BSE', 'NSE'],
    timezone: 'Asia/Kolkata',
    country: 'India',
    coordinates: [19.0760, 72.8777],
    openLocal: '09:15',
    closeLocal: '15:30',
    preMarketOpenLocal: '09:00',
    currency: 'INR',
    majorIndexes: ['NIFTY 50', 'BSE SENSEX'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'SINGAPORE',
    city: 'Singapore',
    exchanges: ['SGX'],
    timezone: 'Asia/Singapore',
    country: 'Singapore',
    coordinates: [1.3521, 103.8198],
    openLocal: '09:00',
    closeLocal: '17:00',
    currency: 'SGD',
    majorIndexes: ['STI'],
    assetClasses: ['Stocks'],
    hasLunchBreak: true,
    lunchStartLocal: '12:00',
    lunchEndLocal: '13:00',
  },
  {
    id: 'HONG_KONG',
    city: 'Hong Kong',
    exchanges: ['HKEX'],
    timezone: 'Asia/Hong_Kong',
    country: 'Hong Kong',
    coordinates: [22.3193, 114.1694],
    openLocal: '09:30',
    closeLocal: '16:00',
    currency: 'HKD',
    majorIndexes: ['Hang Seng'],
    assetClasses: ['Stocks'],
    hasLunchBreak: true,
    lunchStartLocal: '12:00',
    lunchEndLocal: '13:00',
  },
  {
    id: 'SHANGHAI',
    city: 'Shanghai',
    exchanges: ['SSE'],
    timezone: 'Asia/Shanghai',
    country: 'China',
    coordinates: [31.2304, 121.4737],
    openLocal: '09:30',
    closeLocal: '15:00',
    currency: 'CNY',
    majorIndexes: ['SSE Composite'],
    assetClasses: ['Stocks'],
    hasLunchBreak: true,
    lunchStartLocal: '11:30',
    lunchEndLocal: '13:00',
  },
  {
    id: 'TOKYO',
    city: 'Tokyo',
    exchanges: ['TSE'],
    timezone: 'Asia/Tokyo',
    country: 'Japan',
    coordinates: [35.6762, 139.6503],
    openLocal: '09:00',
    closeLocal: '15:00',
    currency: 'JPY',
    majorIndexes: ['Nikkei 225', 'TOPIX'],
    assetClasses: ['Stocks'],
    hasLunchBreak: true,
    lunchStartLocal: '11:30',
    lunchEndLocal: '12:30',
  },
  {
    id: 'SEOUL',
    city: 'Seoul',
    exchanges: ['KRX'],
    timezone: 'Asia/Seoul',
    country: 'South Korea',
    coordinates: [37.5665, 126.9780],
    openLocal: '09:00',
    closeLocal: '15:30',
    currency: 'KRW',
    majorIndexes: ['KOSPI'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'SYDNEY',
    city: 'Sydney',
    exchanges: ['ASX'],
    timezone: 'Australia/Sydney',
    country: 'Australia',
    coordinates: [-33.8688, 151.2093],
    openLocal: '10:00',
    closeLocal: '16:00',
    preMarketOpenLocal: '07:00',
    currency: 'AUD',
    majorIndexes: ['S&P/ASX 200'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'SAO_PAULO',
    city: 'São Paulo',
    exchanges: ['B3'],
    timezone: 'America/Sao_Paulo',
    country: 'Brazil',
    coordinates: [-23.5505, -46.6333],
    openLocal: '10:00',
    closeLocal: '17:00',
    preMarketOpenLocal: '09:45',
    afterHoursCloseLocal: '17:30',
    currency: 'BRL',
    majorIndexes: ['Ibovespa'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'MEXICO_CITY',
    city: 'Mexico City',
    exchanges: ['BMV'],
    timezone: 'America/Mexico_City',
    country: 'Mexico',
    coordinates: [19.4326, -99.1332],
    openLocal: '08:30',
    closeLocal: '15:00',
    currency: 'MXN',
    majorIndexes: ['S&P/BMV IPC'],
    assetClasses: ['Stocks'],
  },
  {
    id: 'JOHANNESBURG',
    city: 'Johannesburg',
    exchanges: ['JSE'],
    timezone: 'Africa/Johannesburg',
    country: 'South Africa',
    coordinates: [-26.2041, 28.0473],
    openLocal: '09:00',
    closeLocal: '17:00',
    currency: 'ZAR',
    majorIndexes: ['FTSE/JSE Top 40'],
    assetClasses: ['Stocks'],
  }
];

export class MarketEngine implements IMarketEngine {
  getMarkets(): Market[] {
    return MARKETS;
  }

  getMarketById(id: string): Market | undefined {
    return MARKETS.find((m) => m.id === id);
  }

  isWeekend(marketId: string, utcMs: number): boolean {
    const market = this.getMarketById(marketId);
    if (!market) return false;

    const currentZoned = DateTime.fromMillis(utcMs, { zone: market.timezone });
    const weekday = currentZoned.weekday; // 1 = Monday, 7 = Sunday

    if (market.id === 'DUBAI') {
      return weekday === 5 || weekday === 6; // Friday or Saturday
    }

    return weekday === 6 || weekday === 7; // Saturday or Sunday
  }

  getLocalTimeOnCurrentDay(timeStr: string, marketId: string, utcMs: number): DateTime {
    const market = this.getMarketById(marketId);
    if (!market) throw new Error(`Market ${marketId} not found`);

    const [hours, minutes] = timeStr.split(':').map(Number);
    const currentZoned = DateTime.fromMillis(utcMs, { zone: market.timezone });

    return currentZoned.set({
      hour: hours,
      minute: minutes,
      second: 0,
      millisecond: 0,
    });
  }

  searchMarkets(query: string): Market[] {
    if (!query) return MARKETS;

    const normalizedQuery = query.toLowerCase().trim();

    return MARKETS.filter((market) => {
      return (
        market.city.toLowerCase().includes(normalizedQuery) ||
        market.country.toLowerCase().includes(normalizedQuery) ||
        market.id.toLowerCase().includes(normalizedQuery) ||
        market.exchanges.some((ex) => ex.toLowerCase().includes(normalizedQuery)) ||
        market.majorIndexes.some((idx) => idx.toLowerCase().includes(normalizedQuery))
      );
    });
  }
}

export const marketEngine = new MarketEngine();
