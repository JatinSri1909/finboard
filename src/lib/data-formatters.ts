import { ApiProvider } from '@/types';

export class DataFormatters {
  /**
   * Format Alpha Vantage time series data for charts
   */
  static formatAlphaVantageTimeSeries(data: any): any[] {
    const timeSeries = data['Time Series (Daily)'] || data['Time Series (5min)'] || data['Time Series (1min)'];
    
    if (!timeSeries) return [];

    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        timestamp: new Date(date).getTime(),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume']),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-100); // Last 100 data points
  }

  /**
   * Format Alpha Vantage quote data for cards
   */
  static formatAlphaVantageQuote(data: any): any {
    const quote = data['Global Quote'];
    if (!quote) return data;

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      volume: parseFloat(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      lastUpdated: quote['07. latest trading day'],
    };
  }

  /**
   * Format Finnhub candle data for charts
   */
  static formatFinnhubCandles(data: any): any[] {
    if (!data.c || !data.o || !data.h || !data.l || !data.t) return [];

    return data.c.map((close: number, index: number) => ({
      timestamp: data.t[index] * 1000, // Convert to milliseconds
      date: new Date(data.t[index] * 1000).toISOString(),
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: close,
      volume: data.v ? data.v[index] : 0,
    })).sort((a: any, b: any) => a.timestamp - b.timestamp);
  }

  /**
   * Format Finnhub quote data for cards
   */
  static formatFinnhubQuote(data: any): any {
    return {
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t,
      lastUpdated: new Date(data.t * 1000).toISOString(),
    };
  }

  /**
   * Format Indian API data for tables and cards
   */
  static formatIndianAPIData(data: any, endpoint: string): any {
    if (endpoint === 'top-gainers' || endpoint === 'top-losers') {
      // Ensure data is an array for table display
      return Array.isArray(data) ? data : data.data || [data];
    }
    
    if (endpoint === 'market-status') {
      return {
        status: data.marketStatus || data.status,
        message: data.message,
        lastUpdated: new Date().toISOString(),
      };
    }

    return data;
  }

  /**
   * Auto-format data based on API provider and endpoint
   */
  static formatApiResponse(data: any, provider: ApiProvider, endpoint: string): any {
    switch (provider) {
      case 'alpha-vantage':
        if (endpoint === 'daily' || endpoint === 'intraday') {
          return this.formatAlphaVantageTimeSeries(data);
        }
        if (endpoint === 'quote') {
          return this.formatAlphaVantageQuote(data);
        }
        break;

      case 'finnhub':
        if (endpoint === 'candles') {
          return this.formatFinnhubCandles(data);
        }
        if (endpoint === 'quote') {
          return this.formatFinnhubQuote(data);
        }
        break;

      case 'indian-api':
        return this.formatIndianAPIData(data, endpoint);

      default:
        return data;
    }

    return data;
  }

  /**
   * Format currency values
   */
  static formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Format percentage values
   */
  static formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  /**
   * Format large numbers with suffixes (K, M, B)
   */
  static formatLargeNumber(value: number): string {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`;
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`;
    }
    return value.toFixed(0);
  }

  /**
   * Detect and format value based on its characteristics
   */
  static smartFormat(value: any): string {
    if (typeof value === 'number') {
      // If it looks like a percentage (between -100 and 100 with decimals)
      if (value >= -100 && value <= 100 && value % 1 !== 0) {
        return this.formatPercentage(value);
      }
      
      // If it's a large number (likely volume or market cap)
      if (value >= 1000) {
        return this.formatLargeNumber(value);
      }
      
      // If it looks like a price (positive with decimals)
      if (value > 0 && value % 1 !== 0) {
        return this.formatCurrency(value);
      }
      
      return value.toFixed(2);
    }
    
    if (typeof value === 'string') {
      // Try to parse as number for formatting
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return this.smartFormat(numValue);
      }
      
      // Check if it's a percentage string
      if (value.includes('%')) {
        return value;
      }
    }
    
    return String(value);
  }
}
