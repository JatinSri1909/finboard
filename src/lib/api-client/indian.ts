import { ApiResponse, ApiTestResult } from '@/types';

export class IndianAPIClient {
  private baseUrl = 'https://stock.indianapi.in';

  async getStockQuote(symbol: string): Promise<ApiResponse> {
    const url = `${this.baseUrl}/StockReachGraph/w?scripcode=${symbol}&flag=0&fromdate=&todate=&seriesid=`;
    return this.makeRequest(url);
  }

  async getMarketStatus(): Promise<ApiResponse> {
    const url = `${this.baseUrl}/MarketStatus/w`;
    return this.makeRequest(url);
  }

  async getTopGainers(): Promise<ApiResponse> {
    const url = `${this.baseUrl}/TopGainers/w`;
    return this.makeRequest(url);
  }

  async getTopLosers(): Promise<ApiResponse> {
    const url = `${this.baseUrl}/TopLosers/w`;
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
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
