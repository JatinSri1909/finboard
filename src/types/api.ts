export interface ApiResponse {
  data: any;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiTestResult {
  success: boolean;
  data?: any;
  error?: string;
  fields?: Array<{
    path: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    sampleValue: any;
    isSelected: boolean;
  }>;
}

export interface DataMapperConfig {
  fieldPath: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  format?: 'currency' | 'percentage' | 'number' | 'date';
  transform?: (value: any) => any;
}
