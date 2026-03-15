/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Shared API client for all built-in AI tools
 */

import { browserApiService, type APIConfig } from './browserApiService';
import { LLMService, type LLMConfig } from './llmService';
import { TOOL_PROMPTS } from './toolPrompts';

// Tool-specific option interfaces
export interface SummarizerOptions {
  length?: 'short' | 'medium' | 'long';
  format?: 'paragraph' | 'bullet-points' | 'executive-summary';
  [key: string]: unknown;
}

export interface CodeReviewerOptions {
  focus?: 'security' | 'performance' | 'style' | 'all';
  includeRefactor?: boolean;
  [key: string]: unknown;
}

export type AIRequestData = 
  | string 
  | { text: string; options?: unknown } 
  | { code: string; options?: unknown }
  | { request: unknown }
  | Record<string, unknown>;

export interface AIRequest {
  tool: keyof typeof TOOL_PROMPTS;
  data: AIRequestData;
  config: APIConfig;
}

export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class AIToolsClient {
  private static instance: AIToolsClient;

  private constructor() {}

  public static getInstance(): AIToolsClient {
    if (!AIToolsClient.instance) {
      AIToolsClient.instance = new AIToolsClient();
    }
    return AIToolsClient.instance;
  }

  public async makeRequest<T = unknown>(request: AIRequest): Promise<AIResponse<T>> {
    try {
      // Validate configuration
      const validation = browserApiService.validateConfig(request.config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const { tool, data, config } = request;
      const promptConfig = TOOL_PROMPTS[tool];

      if (!promptConfig) {
          return { success: false, error: `No prompt configuration found for tool: ${tool}` };
      }

      let userMessage = "";
      if (typeof data === 'string') {
          userMessage = data;
      } else if ('text' in data && typeof data.text === 'string') {
          userMessage = data.text;
      } else if ('code' in data && typeof data.code === 'string') {
          userMessage = data.code;
      } else if ('request' in data) {
          userMessage = typeof data.request === 'string' ? data.request : JSON.stringify(data.request, null, 2);
      } else {
          userMessage = JSON.stringify(data, null, 2);
      }

      if (typeof data !== 'string' && 'options' in data && data.options) {
          userMessage += `\n\nAdditional Instructions:\n${JSON.stringify(data.options, null, 2)}`;
      }

      const provider = browserApiService.getAPITypeFromModel(config.model);
      
      let finalApiKey = config.apiKey || '';
      let globalKeys: Record<string, string> = config.keys || {};

      try {
          const globalConfig = LLMService.getConfig();
          
          if ((!config.useCustomApi || !finalApiKey) && globalConfig.apiKey) {
              finalApiKey = globalConfig.apiKey;
          }

          globalKeys = {
              ...(globalConfig.keys || {}),
              ...globalKeys
          };
      } catch (e) {
        // Ignore storage errors
      }

      const llmConfig: LLMConfig = {
          provider,
          apiKey: finalApiKey,
          model: config.model,
          baseUrl: undefined,
          keys: globalKeys
      };

      if (!finalApiKey) {
          return {
              success: false,
              error: 'No API Key found. Please configure a Global Key in Settings or provide a Custom API Key.'
          };
      }

      let fullResponse = "";
      
      await LLMService.streamCompletion(
          promptConfig.system,
          userMessage,
          (chunk) => {
              fullResponse += chunk;
          },
          llmConfig
      );

      let finalData: unknown = fullResponse;
      const jsonTools = ['agent-builder', 'n8n-builder', 'multi-model-orchestrator', 'ai-ethics-bias-lab', 'visual-workflow-builder'];
            if (jsonTools.includes(tool)) {
          try {
             finalData = this.parseResponse(fullResponse);
          } catch (e) {
              console.error("[JSON PARSE FAIL] Raw Response:", fullResponse);
              console.warn("Expected JSON response but could not parse.", e);
              
              if (tool === 'ai-ethics-bias-lab') {
                  return {
                      success: true,
                      data: { 
                          rawOutput: fullResponse, // Pass raw text for UI to render
                          biasResult: null // Signal that structured data failed
                      } as unknown as T
                  };
              }

              if (tool === 'agent-builder') {
                  finalData = { agent: null, explanation: fullResponse }; 
              } else {
                  return { 
                      success: false, 
                      error: `Failed to parse AI response. The model returned invalid JSON: "${fullResponse.substring(0, 100)}..."` 
                  };
              }
          }
      }

      browserApiService.logUsage(request.tool, request.config, true);

      return {
        success: true,
        data: finalData as T
      };

    } catch (error) {
      browserApiService.logUsage(request.tool, request.config, false, error instanceof Error ? error.message : String(error));
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private parseResponse(text: string): unknown {
    const safeParse = (str: string) => {
        try {
            return JSON.parse(str);
        } catch (e) {
            try {
                const cleaned = str.replace(/[\r\n]+/g, ' ');
                return JSON.parse(cleaned);
            } catch (e2) {
                return null;
            }
        }
    };

    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        const parsed = safeParse(codeBlockMatch[1]);
        if (parsed) return parsed;
    }

    const runParse = (input: string) => {
        const start = input.indexOf('{');
        if (start === -1) return null;
        
        let stack = 0;
        let inString = false;
        let escape = false;
        
        for (let i = start; i < input.length; i++) {
            const char = input[i];
            
            if (!inString) {
                if (char === '{') stack++;
                else if (char === '}') stack--;
            }
            
            if (char === '"' && !escape) inString = !inString;
            escape = (char === '\\' && !escape);
            
            if (stack === 0) {
                const candidate = input.substring(start, i + 1);  
                const parsed = safeParse(candidate);
                if (parsed) return parsed;
                return null;
            }
        }
        return null; // text ends without stack=0
    };

    const extracted = runParse(text);
    if (extracted) return extracted;

    try {
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose > firstOpen) {
            const greedy = text.substring(firstOpen, lastClose + 1);
            const parsed = safeParse(greedy);
            if (parsed) return parsed;
        }
    } catch (e) { /* ignore */ }

    try {
        let loose = text.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        loose = loose.replace(/"\s+"(?=[\w\d])/g, '": "');
        loose = loose.replace(/"\s+(?=["{[])/g, '": ');

        loose = loose.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s+"(?=[\w\d])/g, '$1"$2": "');
        loose = loose.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s+"(?=[\w\d])/g, '$1"$2": "');
        
        loose = loose.replace(/"biasResult"\s*:\s*"biasDetected"/g, '"biasResult": { "biasDetected"');
        
        loose = loose.replace(/(\s)([a-zA-Z0-9_]+)":/g, '$1"$2":');

        loose = loose.replace(/:\s*"([^"]+?)\s+("[\w]+":)/g, ': "$1", $2');
        loose = loose.replace(/:\s*"([^"]+?)\s+("[\w]+":)/g, ': "$1", $2');

        loose = loose.replace(/'/g, '"');
        
        loose = loose.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

        const parsed = safeParse(loose);
        if (parsed) return parsed;
    } catch (e) { /* ignore */ }

    return JSON.parse(text);
  }


  /**
   * Text Summarizer request
   */
  public async summarize(text: string, options: SummarizerOptions, config: APIConfig): Promise<AIResponse<string>> {
    return this.makeRequest<string>({
      tool: 'text-summarizer',
      data: { text, options },
      config
    });
  }

  /**
   * Code Reviewer request
   */
  public async reviewCode(code: string, options: CodeReviewerOptions, config: APIConfig): Promise<AIResponse<string>> {
    return this.makeRequest<string>({
      tool: 'code-reviewer',
      data: { code, options },
      config
    });
  }

  /**
   * n8n Builder request
   */
  public async buildN8nWorkflow(request: unknown, config: APIConfig): Promise<AIResponse> {
    return this.makeRequest({
      tool: 'n8n-builder',
      data: { request },
      config
    });
  }

  /**
   * Agent Builder request
   */
  public async buildMCPAgent(request: unknown, config: APIConfig): Promise<AIResponse> {
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
  public getAPITypeFromModel(model: string): 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'ollama' {
    return browserApiService.getAPITypeFromModel(model);
  }
}

// Export singleton instance
export const aiToolsClient = AIToolsClient.getInstance();

// Export types
export type { APIConfig };
