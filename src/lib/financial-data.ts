'use client';

import { useDataCacheStore } from './data-cache-store';
import { useAppSettingsStore } from './app-settings-store';
import { StockQuote } from './api/financial-data';

// Enhanced Financial Data Service with integrated caching
export class FinancialDataService {
  private static instance: FinancialDataService;
  private cacheStore = useDataCacheStore.getState();
  private settingsStore = useAppSettingsStore.getState();

  static getInstance(): FinancialDataService {
    if (!FinancialDataService.instance) {
      FinancialDataService.instance = new FinancialDataService();
    }
    return FinancialDataService.instance;
  }

  private getCachedData<T>(key: string): T | null {
    return this.cacheStore.get<T>(key);
  }

  private setCachedData<T>(key: string, data: T, ttlMs = 60000): void {
    this.cacheStore.set(key, data, ttlMs);
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = `quote-${symbol}`;
    const cached = this.getCachedData<StockQuote>(cacheKey);
    if (cached) return cached;

    try {
      // Use settings to determine API provider
      const apiProvider = this.settingsStore.settings.apiProvider;

      // Make API call to our backend endpoint
      const response = await fetch(`/api/stocks/quote?symbol=${symbol}&provider=${apiProvider}`);
      if (!response.ok) throw new Error('Failed to fetch stock quote');

      const data = await response.json();
      this.setCachedData(cacheKey, data, 30000);
      return data;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  }

  // ... rest of existing methods with enhanced caching ...
}
