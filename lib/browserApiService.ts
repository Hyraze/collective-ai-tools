/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Browser-compatible API service for all built-in tools
 */

interface APIConfig {
  useCustomApi: boolean;
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Browser-compatible API service for all built-in tools
 * Handles secure API key management and multi-model support
 */
export class BrowserAPIService {
  private static instance: BrowserAPIService;

  private constructor() {
    // Browser environment - no process.env access
  }

  public static getInstance(): BrowserAPIService {
    if (!BrowserAPIService.instance) {
      BrowserAPIService.instance = new BrowserAPIService();
    }
    return BrowserAPIService.instance;
  }

  /**
   * Makes an API call to the specified endpoint with proper error handling
   */
  public async makeAPICall(endpoint: string, data: any, config: APIConfig): Promise<APIResponse> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          settings: config
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `API request failed: ${response.status}`
        };
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Gets the appropriate API key based on configuration
   */
  public getAPIKey(config: APIConfig): string | null {
    if (config.useCustomApi && config.apiKey) {
      return config.apiKey;
    }
    // In browser, we rely on server-side API key handling
    return null;
  }

  /**
   * Validates API configuration
   */
  public validateConfig(config: APIConfig): { valid: boolean; error?: string } {
    if (config.useCustomApi && !config.apiKey) {
      return { valid: false, error: 'Custom API key is required when using custom API' };
    }

    if (!config.model) {
      return { valid: false, error: 'Model is required' };
    }

    return { valid: true };
  }

  /**
   * Gets available models for a given API type
   */
  public getAvailableModels(apiType: 'gemini' | 'openai' | 'anthropic'): string[] {
    switch (apiType) {
      case 'gemini':
        return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-pro-latest'];
      case 'openai':
        return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
      case 'anthropic':
        return ['claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku'];
      default:
        return ['gemini-2.5-flash'];
    }
  }

  /**
   * Determines API type from model name
   */
  public getAPITypeFromModel(model: string): 'gemini' | 'openai' | 'anthropic' {
    if (model.startsWith('gpt')) {
      return 'openai';
    } else if (model.startsWith('claude')) {
      return 'anthropic';
    } else {
      return 'gemini';
    }
  }

  /**
   * Gets default configuration for a tool
   */
  public getDefaultConfig(toolName: string): APIConfig {
    const defaults: Record<string, APIConfig> = {
      'ai-chat': {
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 1000
      },
      'text-summarizer': {
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 500
      },
      'code-reviewer': {
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.1,
        maxTokens: 4000
      },
      'n8n-builder': {
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 6000
      },
      'agent-builder': {
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 8000
      }
    };

    return defaults[toolName] || {
      useCustomApi: false,
      model: 'gemini-2.5-flash',
      temperature: 0.5,
      maxTokens: 1000
    };
  }

  /**
   * Logs API usage for monitoring
   */
  public logUsage(toolName: string, config: APIConfig, success: boolean, error?: string): void {
    const logData = {
      tool: toolName,
      model: config.model,
      useCustomApi: config.useCustomApi,
      success,
      error,
      timestamp: new Date().toISOString()
    };

    console.log('API Usage:', logData);
  }
}

// Export singleton instance
export const browserApiService = BrowserAPIService.getInstance();

// Export types for use in components
export type { APIConfig, APIResponse };
