/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Shared API client for all built-in AI tools
 */

import { browserApiService, type APIConfig } from './browserApiService';

export interface AIRequest {
  tool: 'text-summarizer' | 'code-reviewer' | 'n8n-builder' | 'agent-builder' | 'multi-model-orchestrator' | 'visual-workflow-builder' | 'realtime-data-fusion';
  data: any;
  config: APIConfig;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Unified AI Tools Client
 * Handles all API calls to built-in tools through a single interface
 */
export class AIToolsClient {
  private static instance: AIToolsClient;

  private constructor() {}

  public static getInstance(): AIToolsClient {
    if (!AIToolsClient.instance) {
      AIToolsClient.instance = new AIToolsClient();
    }
    return AIToolsClient.instance;
  }

  /**
   * Makes a request to any built-in AI tool
   */
  public async makeRequest(request: AIRequest): Promise<AIResponse> {
    try {
      // Validate configuration
      const validation = browserApiService.validateConfig(request.config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Make API call
      const response = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `API request failed: ${response.status}`
        };
      }

      const result = await response.json();
      
      // Log usage
      browserApiService.logUsage(request.tool, request.config, true);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      // Log error
      browserApiService.logUsage(request.tool, request.config, false, error instanceof Error ? error.message : String(error));
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }


  /**
   * Text Summarizer request
   */
  public async summarize(text: string, options: any, config: APIConfig): Promise<AIResponse> {
    return this.makeRequest({
      tool: 'text-summarizer',
      data: { text, options },
      config
    });
  }

  /**
   * Code Reviewer request
   */
  public async reviewCode(code: string, options: any, config: APIConfig): Promise<AIResponse> {
    return this.makeRequest({
      tool: 'code-reviewer',
      data: { code, options },
      config
    });
  }

  /**
   * n8n Builder request
   */
  public async buildN8nWorkflow(request: any, config: APIConfig): Promise<AIResponse> {
    return this.makeRequest({
      tool: 'n8n-builder',
      data: { request },
      config
    });
  }

  /**
   * Agent Builder request
   */
  public async buildMCPAgent(request: any, config: APIConfig): Promise<AIResponse> {
    return this.makeRequest({
      tool: 'agent-builder',
      data: { request },
      config
    });
  }

  /**
   * Gets default configuration for a tool
   */
  public getDefaultConfig(toolName: string): APIConfig {
    return browserApiService.getDefaultConfig(toolName);
  }

  /**
   * Gets available models for a given API type
   */
  public getAvailableModels(apiType: 'gemini' | 'openai' | 'anthropic'): string[] {
    return browserApiService.getAvailableModels(apiType);
  }

  /**
   * Determines API type from model name
   */
  public getAPITypeFromModel(model: string): 'gemini' | 'openai' | 'anthropic' {
    return browserApiService.getAPITypeFromModel(model);
  }
}

// Export singleton instance
export const aiToolsClient = AIToolsClient.getInstance();

// Export types
export type { APIConfig };
