import { ApiResponse, ApiError, ApiTestResult } from '@/types';

export class AlphaVantageClient {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string): Promise<ApiResponse> {
    const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
    return this.makeRequest(url);
  }

  async getTimeSeriesDaily(symbol: string): Promise<ApiResponse> {
    const url = `${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.apiKey}`;
    return this.makeRequest(url);
  }

  async getTimeSeriesIntraday(symbol: string, interval: string = '5min'): Promise<ApiResponse> {
    const url = `${this.baseUrl}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`;
    return this.makeRequest(url);
  }

  async getMarketStatus(): Promise<ApiResponse> {
    const url = `${this.baseUrl}?function=MARKET_STATUS&apikey=${this.apiKey}`;
    return this.makeRequest(url);
  }

  async testConnection(): Promise<ApiTestResult> {
    try {
      const response = await this.getMarketStatus();
      return {
        success: true,
        data: response.data,
        fields: this.extractFields(response.data),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async makeRequest(url: string): Promise<ApiResponse> {
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      if (data['Note']) {
        throw new Error('API call frequency limit reached. Please try again later.');
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  private extractFields(data: any, prefix = ''): Array<{ path: string; label: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; sampleValue: any; isSelected: boolean }> {
    const fields: Array<{ path: string; label: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array'; sampleValue: any; isSelected: boolean }> = [];

    const extract = (obj: any, currentPath: string) => {
      if (obj === null || obj === undefined) return;

      if (Array.isArray(obj)) {
        fields.push({
          path: currentPath,
          label: this.formatFieldLabel(currentPath),
          type: 'array',
          sampleValue: obj.slice(0, 2),
          isSelected: false,
        });
        if (obj.length > 0) {
          extract(obj[0], `${currentPath}[0]`);
        }
      } else if (typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          extract(obj[key], newPath);
        });
      } else {
        fields.push({
          path: currentPath,
          label: this.formatFieldLabel(currentPath),
          type: typeof obj as 'string' | 'number' | 'boolean' | 'object' | 'array',
          sampleValue: obj,
          isSelected: false,
        });
      }
    };

    extract(data, prefix);
    return fields;
  }

  private formatFieldLabel(path: string): string {
    return path
      .split('.')
      .map(part => {
        if (part.includes('[')) {
          part = part.substring(0, part.indexOf('['));
        }
        return part
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
      })
      .join(' → ');
  }
}
