'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { financialDataService } from '@/lib/api/financial-data';

// Custom hook for stock quotes
export function useStockQuote(symbol: string, refreshInterval = 30000) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `stock-quote-${symbol}` : null,
    () => financialDataService.getStockQuote(symbol),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Prevent duplicate requests within 10 seconds
    }
  );

  return {
    quote: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Custom hook for multiple stock quotes
export function useMultipleQuotes(symbols: string[], refreshInterval = 30000) {
  const { data, error, isLoading, mutate } = useSWR(
    symbols.length > 0 ? `multiple-quotes-${symbols.join(',')}` : null,
    () => financialDataService.getMultipleQuotes(symbols),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    quotes: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Custom hook for historical data
export function useHistoricalData(symbol: string, period = '1M', refreshInterval = 300000) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `historical-${symbol}-${period}` : null,
    () => financialDataService.getHistoricalData(symbol, period),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute deduping for historical data
    }
  );

  return {
    data: data || [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Custom hook for market data
export function useMarketData(refreshInterval = 60000) {
  const { data, error, isLoading, mutate } = useSWR(
    'market-data',
    () => financialDataService.getMarketData(),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    marketData: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Custom hook for widget data with automatic refresh
export function useWidgetData(widgetType: string, config: any) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: any = null;

      switch (widgetType) {
        case 'watchlist':
        case 'stock-table':
          if (config.symbols && config.symbols.length > 0) {
            result = await financialDataService.getMultipleQuotes(config.symbols);
          }
          break;

        case 'market-gainers':
          const marketData = await financialDataService.getMarketData();
          result = marketData.gainers.slice(0, config.count || 5);
          break;

        case 'market-losers':
          const marketDataLosers = await financialDataService.getMarketData();
          result = marketDataLosers.losers.slice(0, config.count || 5);
          break;

        case 'price-chart':
        case 'candlestick-chart':
          if (config.symbol) {
            result = await financialDataService.getHistoricalData(config.symbol, config.timeframe);
          }
          break;

        case 'market-overview':
          const indices = await financialDataService.getMultipleQuotes(
            config.indices || ['SPY', 'QQQ', 'DIA', 'IWM']
          );
          result = indices;
          break;

        default:
          result = null;
      }

      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching widget data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [widgetType, config]);

  useEffect(() => {
    fetchData();

    // Set up automatic refresh based on config
    const refreshInterval = config.refreshInterval || 60000; // Default 1 minute
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, config.refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
  };
}

// Hook for real-time price updates
export function useRealTimePrice(symbol: string, enabled = true) {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);
  const [changePercent, setChangePercent] = useState<number>(0);

  useEffect(() => {
    if (!enabled || !symbol) return;

    const updatePrice = async () => {
      try {
        const quote = await financialDataService.getStockQuote(symbol);
        setPrice(quote.price);
        setChange(quote.change);
        setChangePercent(quote.changePercent);
      } catch (error) {
        console.error('Error updating real-time price:', error);
      }
    };

    // Initial fetch
    updatePrice();

    // Set up real-time updates (every 5 seconds for demo)
    const interval = setInterval(updatePrice, 5000);

    return () => clearInterval(interval);
  }, [symbol, enabled]);

  return {
    price,
    change,
    changePercent,
    isPositive: change >= 0,
  };
}
