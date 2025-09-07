import { AlphaVantageClient, FinnhubClient, IndianAPIClient } from './api-client';
import { ApiProvider, WidgetConfig } from '@/types';
import { ApiResponse, ApiTestResult } from '@/types/api';

class ApiService {
  private alphaVantageClient: AlphaVantageClient | null = null;
  private finnhubClient: FinnhubClient | null = null;
  private indianAPIClient: IndianAPIClient | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize Alpha Vantage client
    const alphaVantageKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (alphaVantageKey) {
      this.alphaVantageClient = new AlphaVantageClient(alphaVantageKey);
    }

    // Initialize Finnhub client
    const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (finnhubKey) {
      this.finnhubClient = new FinnhubClient(finnhubKey);
    }

    // Initialize Indian API client (no key required)
    this.indianAPIClient = new IndianAPIClient();
  }

  async fetchWidgetData(config: WidgetConfig): Promise<ApiResponse> {
    const { apiProvider, apiEndpoint, symbol } = config;

    switch (apiProvider) {
      case 'alpha-vantage':
        if (!this.alphaVantageClient) {
          throw new Error('Alpha Vantage API key not configured');
        }
        return await this.callAlphaVantageEndpoint(apiEndpoint, symbol);

      case 'finnhub':
        if (!this.finnhubClient) {
          throw new Error('Finnhub API key not configured');
        }
        return await this.callFinnhubEndpoint(apiEndpoint, symbol);

      case 'indian-api':
        if (!this.indianAPIClient) {
          throw new Error('Indian API client not initialized');
        }
        return await this.callIndianAPIEndpoint(apiEndpoint, symbol);

      default:
        throw new Error(`Unsupported API provider: ${apiProvider}`);
    }
  }

  private async callAlphaVantageEndpoint(endpoint: string, symbol?: string): Promise<ApiResponse> {
    if (!this.alphaVantageClient) throw new Error('Alpha Vantage client not initialized');

    switch (endpoint) {
      case 'quote':
        if (!symbol) throw new Error('Symbol required for quote endpoint');
        return await this.alphaVantageClient.getQuote(symbol);
      
      case 'daily':
        if (!symbol) throw new Error('Symbol required for daily endpoint');
        return await this.alphaVantageClient.getTimeSeriesDaily(symbol);
      
      case 'intraday':
        if (!symbol) throw new Error('Symbol required for intraday endpoint');
        return await this.alphaVantageClient.getTimeSeriesIntraday(symbol);
      
      case 'market-status':
        return await this.alphaVantageClient.getMarketStatus();
      
      default:
        throw new Error(`Unsupported Alpha Vantage endpoint: ${endpoint}`);
    }
  }

  private async callFinnhubEndpoint(endpoint: string, symbol?: string): Promise<ApiResponse> {
    if (!this.finnhubClient) throw new Error('Finnhub client not initialized');

    switch (endpoint) {
      case 'quote':
        if (!symbol) throw new Error('Symbol required for quote endpoint');
        return await this.finnhubClient.getQuote(symbol);
      
      case 'profile':
        if (!symbol) throw new Error('Symbol required for profile endpoint');
        return await this.finnhubClient.getCompanyProfile(symbol);
      
      case 'candles':
        if (!symbol) throw new Error('Symbol required for candles endpoint');
        return await this.finnhubClient.getCandles(symbol);
      
      case 'market-status':
        return await this.finnhubClient.getMarketStatus();
      
      default:
        throw new Error(`Unsupported Finnhub endpoint: ${endpoint}`);
    }
  }

  private async callIndianAPIEndpoint(endpoint: string, symbol?: string): Promise<ApiResponse> {
    if (!this.indianAPIClient) throw new Error('Indian API client not initialized');

    switch (endpoint) {
      case 'quote':
        if (!symbol) throw new Error('Symbol required for quote endpoint');
        return await this.indianAPIClient.getStockQuote(symbol);
      
      case 'market-status':
        return await this.indianAPIClient.getMarketStatus();
      
      case 'top-gainers':
        return await this.indianAPIClient.getTopGainers();
      
      case 'top-losers':
        return await this.indianAPIClient.getTopLosers();
      
      default:
        throw new Error(`Unsupported Indian API endpoint: ${endpoint}`);
    }
  }

  async testConnection(provider: ApiProvider, endpoint: string = 'market-status'): Promise<ApiTestResult> {
    try {
      switch (provider) {
        case 'alpha-vantage':
          if (!this.alphaVantageClient) {
            return { success: false, error: 'Alpha Vantage API key not configured' };
          }
          return await this.alphaVantageClient.testConnection();

        case 'finnhub':
          if (!this.finnhubClient) {
            return { success: false, error: 'Finnhub API key not configured' };
          }
          return await this.finnhubClient.testConnection();

        case 'indian-api':
          if (!this.indianAPIClient) {
            return { success: false, error: 'Indian API client not initialized' };
          }
          return await this.indianAPIClient.testConnection();

        default:
          return { success: false, error: `Unsupported API provider: ${provider}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  getAvailableEndpoints(provider: ApiProvider): Array<{ value: string; label: string; requiresSymbol: boolean }> {
    switch (provider) {
      case 'alpha-vantage':
        return [
          { value: 'quote', label: 'Real-time Quote', requiresSymbol: true },
          { value: 'daily', label: 'Daily Time Series', requiresSymbol: true },
          { value: 'intraday', label: 'Intraday Data', requiresSymbol: true },
          { value: 'market-status', label: 'Market Status', requiresSymbol: false },
        ];

      case 'finnhub':
        return [
          { value: 'quote', label: 'Real-time Quote', requiresSymbol: true },
          { value: 'profile', label: 'Company Profile', requiresSymbol: true },
          { value: 'candles', label: 'Price Candles', requiresSymbol: true },
          { value: 'market-status', label: 'Market Status', requiresSymbol: false },
        ];

      case 'indian-api':
        return [
          { value: 'quote', label: 'Stock Quote', requiresSymbol: true },
          { value: 'market-status', label: 'Market Status', requiresSymbol: false },
          { value: 'top-gainers', label: 'Top Gainers', requiresSymbol: false },
          { value: 'top-losers', label: 'Top Losers', requiresSymbol: false },
        ];

      default:
        return [];
    }
  }

  isConfigured(provider: ApiProvider): boolean {
    switch (provider) {
      case 'alpha-vantage':
        return !!this.alphaVantageClient;
      case 'finnhub':
        return !!this.finnhubClient;
      case 'indian-api':
        return !!this.indianAPIClient;
      default:
        return false;
    }
  }
}

export const apiService = new ApiService();
