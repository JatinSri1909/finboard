export class ErrorHandler {
  static handleApiError(error: any): string {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('fetch')) {
        return 'Network error: Unable to connect to the API. Please check your internet connection.';
      }
      
      if (error.message.includes('404')) {
        return 'API endpoint not found. Please check the URL.';
      }
      
      if (error.message.includes('401') || error.message.includes('403')) {
        return 'Authentication error: Invalid API key or insufficient permissions.';
      }
      
      if (error.message.includes('429')) {
        return 'Rate limit exceeded. Please try again later.';
      }
      
      if (error.message.includes('500')) {
        return 'Server error: The API is currently unavailable.';
      }
      
      if (error.message.includes('CORS')) {
        return 'CORS error: The API does not allow requests from this domain.';
      }
      
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  static isRetryableError(error: any): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')
      );
    }
    return false;
  }

  static getErrorSeverity(error: any): 'low' | 'medium' | 'high' {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('rate limit') || message.includes('429')) {
        return 'medium';
      }
      
      if (message.includes('401') || message.includes('403')) {
        return 'high';
      }
      
      if (message.includes('network') || message.includes('timeout')) {
        return 'medium';
      }
      
      if (message.includes('500') || message.includes('502') || message.includes('503')) {
        return 'high';
      }
    }
    
    return 'low';
  }

  static logError(error: any, context?: string): void {
    const timestamp = new Date().toISOString();
    const errorMessage = this.handleApiError(error);
    const severity = this.getErrorSeverity(error);
    
    console.error(`[${timestamp}] ${context ? `[${context}] ` : ''}${errorMessage}`, {
      severity,
      originalError: error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
