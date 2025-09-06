import { useState, useCallback } from 'react';
import { ApiTestResult, ApiResponse, WidgetField } from '@/types';
import { DataMapper } from '@/lib/data-mapper';

export interface UseApiOptions {
  timeout?: number;
  retries?: number;
}

export function useApi(options: UseApiOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { timeout = 10000, retries = 3 } = options;

  const makeRequest = useCallback(async (url: string): Promise<ApiResponse> => {
    setIsLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for common API error patterns
        if (data.error || data.Error || data.message) {
          throw new Error(data.error || data.Error || data.message);
        }

        setIsLoading(false);
        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    setIsLoading(false);
    setError(lastError?.message || 'Request failed');
    throw lastError;
  }, [timeout, retries]);

  const testApiConnection = useCallback(async (url: string): Promise<ApiTestResult> => {
    try {
      const response = await makeRequest(url);
      const fields = DataMapper.extractFields(response.data);
      
      return {
        success: true,
        data: response.data,
        fields: fields ,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }, [makeRequest]);

  const fetchData = useCallback(async (url: string) => {
    return makeRequest(url);
  }, [makeRequest]);

  return {
    isLoading,
    error,
    makeRequest,
    testApiConnection,
    fetchData,
  };
}
