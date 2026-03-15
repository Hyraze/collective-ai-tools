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
  showAdvanced?: boolean; 
  keys?: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
  };
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
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
  public async makeAPICall<T = unknown>(endpoint: string, data: Record<string, unknown>, config: APIConfig): Promise<APIResponse<T>> {
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
  public getAvailableModels(apiType?: 'gemini' | 'openai' | 'anthropic'): string[] {
    const allModels = {
      gemini: ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      openai: ['gpt-5.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229']
    };

    if (apiType) {
      return allModels[apiType] || [];
    }

    // Return all models flattened
    return [
      ...allModels.gemini,
      ...allModels.openai,
      ...allModels.anthropic
    ];
  }

  /**
   * Determines API type from model name
   */
  public getAPITypeFromModel(model: string): 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'ollama' {
    if (model.includes('gpt')) return 'openai';
    if (model.includes('claude')) return 'anthropic';
    if (model.includes('gemini')) return 'gemini';
    if (model.includes('deepseek')) return 'deepseek';
    if (model.includes('llama') || model.includes('mistral')) return 'ollama';
    return 'openai'; // Default to OpenAI compatible for others
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
      },
      'multi-model-orchestrator': {
        useCustomApi: false,
      model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 4000
      },
      'visual-workflow-builder': {
        useCustomApi: false,
      model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 6000
      },
      'realtime-data-fusion': {
        useCustomApi: false,
      model: 'gemini-2.5-flash',
        temperature: 0.2,
        maxTokens: 3000
      },
      'ai-ethics-bias-lab': {
        useCustomApi: false,
      model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 2500
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
