'use client';

// Financial data API integration with real APIs
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  price?: number;
  sma?: number;
  candleColor?: string;
  candleHeight?: number;
  candleY?: number;
  wickHeight?: number;
  wickY?: number;
}

export interface MarketData {
  gainers: StockQuote[];
  losers: StockQuote[];
  mostActive: StockQuote[];
  indices: StockQuote[];
}

const API_CONFIG = {
  ALPHA_VANTAGE: {
    baseUrl: 'https://www.alphavantage.co/query',
  },
  FINNHUB: {
    baseUrl: 'https://finnhub.io/api/v1',
  },
  INDIAN_API: {
    baseUrl: 'https://api.indianapi.in',
  },
};

export const transformAlphaVantageQuote = (data: any, symbol: string): StockQuote => {
  const quote = data['Global Quote'];
  if (!quote) throw new Error('Invalid Alpha Vantage response');

  return {
    symbol: quote['01. symbol'] || symbol,
    name: `${symbol} Inc.`,
    price: Number.parseFloat(quote['05. price']) || 0,
    change: Number.parseFloat(quote['09. change']) || 0,
    changePercent: Number.parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
    volume: Number.parseInt(quote['06. volume']) || 0,
    high: Number.parseFloat(quote['03. high']) || 0,
    low: Number.parseFloat(quote['04. low']) || 0,
    open: Number.parseFloat(quote['02. open']) || 0,
    previousClose: Number.parseFloat(quote['08. previous close']) || 0,
  };
};

export const transformFinnhubQuote = (data: any, symbol: string): StockQuote => {
  return {
    symbol,
    name: `${symbol} Inc.`,
    price: data.c || 0,
    change: data.d || 0,
    changePercent: data.dp || 0,
    high: data.h || 0,
    low: data.l || 0,
    open: data.o || 0,
    previousClose: data.pc || 0,
  };
};

export const transformIndianAPIQuote = (data: any): StockQuote => {
  return {
    symbol: data.symbol || data.stock_name || '',
    name: data.name || data.company_name || '',
    price: Number.parseFloat(data.price || data.current_price || data.ltp) || 0,
    change: Number.parseFloat(data.change || data.price_change) || 0,
    changePercent: Number.parseFloat(data.change_percent || data.percent_change) || 0,
    volume: Number.parseInt(data.volume || data.traded_volume) || 0,
    high: Number.parseFloat(data.high || data.day_high) || 0,
    low: Number.parseFloat(data.low || data.day_low) || 0,
    open: Number.parseFloat(data.open || data.day_open) || 0,
    previousClose: Number.parseFloat(data.previous_close || data.prev_close) || 0,
  };
};

export const transformAlphaVantageHistorical = (data: any): HistoricalPrice[] => {
  const timeSeries =
    data['Time Series (Daily)'] ||
    data['Time Series (Weekly)'] ||
    data['Time Series (Monthly)'] ||
    data['Time Series (60min)'] ||
    data['Time Series (30min)'] ||
    data['Time Series (15min)'] ||
    data['Time Series (5min)'] ||
    data['Time Series (1min)'] ||
    data['Time Series (Intraday)'] ||
    {};

  console.log('[v0] Transform function - available keys:', Object.keys(data));
  console.log('[v0] Transform function - time series entries:', Object.keys(timeSeries).length);

  if (Object.keys(timeSeries).length === 0) {
    console.log('[v0] No time series data found, returning empty array');
    return [];
  }

  const result = Object.entries(timeSeries)
    .map(([date, values]: [string, any]) => ({
      date,
      open: Number.parseFloat(values['1. open']) || 0,
      high: Number.parseFloat(values['2. high']) || 0,
      low: Number.parseFloat(values['3. low']) || 0,
      close: Number.parseFloat(values['4. close']) || 0,
      volume: Number.parseInt(values['5. volume']) || 0,
      price: Number.parseFloat(values['4. close']) || 0, // For price chart widget
      sma: Number.parseFloat(values['4. close']) || 0, // Simple moving average approximation
      candleColor:
        Number.parseFloat(values['4. close']) >= Number.parseFloat(values['1. open'])
          ? '#10b981'
          : '#ef4444',
      candleHeight: Math.abs(
        Number.parseFloat(values['4. close']) - Number.parseFloat(values['1. open'])
      ),
      candleY: Math.min(
        Number.parseFloat(values['1. open']),
        Number.parseFloat(values['4. close'])
      ),
      wickHeight: Number.parseFloat(values['2. high']) - Number.parseFloat(values['3. low']),
      wickY: Number.parseFloat(values['3. low']),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
};



// API Service Functions
export class FinancialDataService {
  private static instance: FinancialDataService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): FinancialDataService {
    if (!FinancialDataService.instance) {
      FinancialDataService.instance = new FinancialDataService();
    }
    return FinancialDataService.instance;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttlMs = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  async getStockQuote(
    symbol: string,
    provider: 'alphavantage' | 'finnhub' | 'indian' = 'alphavantage'
  ): Promise<StockQuote> {
    const cacheKey = `quote-${symbol}-${provider}`;
    const cached = this.getCachedData<StockQuote>(cacheKey);
    if (cached) return cached;

    try {
      // Make API call to our backend endpoint with provider selection
      const response = await fetch(`/api/stocks/quote?symbol=${symbol}&provider=${provider}`);
      if (!response.ok) throw new Error('Failed to fetch stock quote');

      const data = await response.json();
      this.setCachedData(cacheKey, data, 30000);
      return data;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map((symbol) => this.getStockQuote(symbol));
    return Promise.all(promises);
  }

  async getHistoricalData(
    symbol: string,
    period = '1M',
    provider: 'alphavantage' | 'indian' = 'alphavantage'
  ): Promise<HistoricalPrice[]> {
    const cacheKey = `historical-${symbol}-${period}-${provider}`;
    const cached = this.getCachedData<HistoricalPrice[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `/api/stocks/historical?symbol=${symbol}&period=${period}&provider=${provider}`
      );
      if (!response.ok) throw new Error('Failed to fetch historical data');

      const data = await response.json();
      this.setCachedData(cacheKey, data, 300000);
      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async getMarketData(provider: 'indian' | 'finnhub' = 'indian'): Promise<MarketData> {
    const cacheKey = `market-data-${provider}`;
    const cached = this.getCachedData<MarketData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/stocks/market-data?provider=${provider}`);
      if (!response.ok) throw new Error('Failed to fetch market data');

      const data = await response.json();
      this.setCachedData(cacheKey, data, 60000);
      return data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  async getIndianMarketData(): Promise<{
    trending: StockQuote[];
    nseActive: StockQuote[];
    bseActive: StockQuote[];
    priceShockers: StockQuote[];
  }> {
    const cacheKey = 'indian-market-data';
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch('/api/stocks/indian-market');
      if (!response.ok) throw new Error('Failed to fetch Indian market data');

      const data = await response.json();
      this.setCachedData(cacheKey, data, 60000);
      return data;
    } catch (error) {
      console.error('Error fetching Indian market data:', error);
      return {
        trending: [],
        nseActive: [],
        bseActive: [],
        priceShockers: [],
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const financialDataService = FinancialDataService.getInstance();
