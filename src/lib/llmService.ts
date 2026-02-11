
import { z } from 'zod';

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'ollama' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  keys?: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
  };
}

export const PROVIDER_DEFAULTS: Record<LLMProvider, Partial<LLMConfig>> = {
    openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-5.1' },
    anthropic: { model: 'claude-3-5-sonnet-20240620' },
    gemini: { model: 'gemini-2.5-pro' },
    deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
    ollama: { baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
    custom: { baseUrl: '', model: '' }
};

const STORAGE_KEY = 'FABRIC_LLM_CONFIG';

// Zod Schemas for API Responses
const OpenAIChunkSchema = z.object({
  choices: z.array(z.object({
    delta: z.object({
      content: z.string().optional()
    })
  }))
});

const AnthropicChunkSchema = z.object({
  type: z.string(),
  delta: z.object({
    text: z.string()
  }).optional()
});

const GeminiCandidateSchema = z.object({
  candidates: z.array(z.object({
    content: z.object({
      parts: z.array(z.object({
        text: z.string()
      }))
    })
  })).optional(),
  error: z.object({
    message: z.string().optional()
  }).optional()
});

const GeminiModelSchema = z.object({
  models: z.array(z.object({
    name: z.string(),
    supportedGenerationMethods: z.array(z.string()).optional()
  })).optional()
});

export const LLMService = {
  getConfig(): LLMConfig {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return { provider: 'openai', apiKey: '', model: 'gpt-4o', baseUrl: 'https://api.openai.com/v1' };
  },

  saveConfig(config: LLMConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },

  async streamCompletion(
    systemPrompt: string, 
    userPrompt: string, 
    onChunk: (chunk: string) => void,
    messageConfig?: LLMConfig
  ) {
    const config = messageConfig || this.getConfig();
    
    let effectiveApiKey = config.apiKey;
    if (config.keys) {
        if (config.provider === 'openai' && config.keys.openai) effectiveApiKey = config.keys.openai;
        if (config.provider === 'anthropic' && config.keys.anthropic) effectiveApiKey = config.keys.anthropic;
        if (config.provider === 'gemini' && config.keys.gemini) effectiveApiKey = config.keys.gemini;
    }

    const requestConfig = { ...config, apiKey: effectiveApiKey };
    
    if (requestConfig.provider !== 'ollama' && !effectiveApiKey) throw new Error(`Missing API Key for ${requestConfig.provider}. Please configure it in settings.`);

    switch (requestConfig.provider) {
        case 'anthropic':
            await this.streamAnthropic(requestConfig, systemPrompt, userPrompt, onChunk);
            break;
        case 'gemini':
            await this.streamGemini(requestConfig, systemPrompt, userPrompt, onChunk);
            break;
        default: 
            await this.streamOpenAICompatible(requestConfig, systemPrompt, userPrompt, onChunk);
            break;
    }
  },

  async streamOpenAICompatible(config: LLMConfig, systemPrompt: string, userPrompt: string, onChunk: (c: string) => void) {
    const baseUrl = config.baseUrl || PROVIDER_DEFAULTS[config.provider]?.baseUrl;
    const url = `${baseUrl?.replace(/\/+$/, '')}/chat/completions`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
        response_format: config.model.includes('gpt') ? { type: 'json_object' } : undefined
      })
    });

    if (!res.ok) {
       const err = await res.json().catch(() => ({}));
       throw new Error(err.error?.message || `API Error: ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Failed to read response stream');
    const decoder = new TextDecoder();
    
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const json = JSON.parse(line.slice(6));
            const result = OpenAIChunkSchema.safeParse(json);
            if (result.success) {
                const content = result.data.choices[0]?.delta?.content;
                if (content) onChunk(content);
            }
          } catch {
            // ignore partial json
          }
        }
      }
    }
  },

  async streamAnthropic(config: LLMConfig, systemPrompt: string, userPrompt: string, onChunk: (c: string) => void) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true' 
      },
      body: JSON.stringify({
        model: config.model,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        stream: true,
        max_tokens: 4096
      })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Anthropic Error: ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Failed to read response stream');
    const decoder = new TextDecoder();

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                 try {
                     const json = JSON.parse(line.slice(6));
                     const result = AnthropicChunkSchema.safeParse(json);
                     if (result.success && result.data.type === 'content_block_delta' && result.data.delta?.text) {
                         onChunk(result.data.delta.text);
                     }
                 } catch {
                     // ignore invalid json chunks
                 }
            }
        }
    }
  },

  async streamGemini(config: LLMConfig, systemPrompt: string, userPrompt: string, onChunk: (c: string) => void) {
     const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            system_instruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                response_mime_type: "application/json"
            }
        })
     });

     if (!res2.ok) {
       const err = await res2.json().catch(() => ({}));
       
       if (process.env.NODE_ENV === 'development') {
           // Safe logging for dev only
           // console.error("Gemini Error:", err); 
       }
       
       if (res2.status === 404 && config.apiKey) {
         this.listGeminiModels(config.apiKey).catch(() => {});
       }
       
       throw new Error(err.error?.message || `Gemini API Error: ${res2.statusText}`);
     }
     
     const json = await res2.json();
     const result = GeminiCandidateSchema.safeParse(json);
     
     if (result.success) {
         const text = result.data.candidates?.[0]?.content?.parts?.[0]?.text;
         if (text) onChunk(text);
     }
  },

  async listGeminiModels(apiKey: string) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const json = await res.json();
      const result = GeminiModelSchema.safeParse(json);
      if (result.success && process.env.NODE_ENV === 'development') {
        // Safe logging
        // console.log("Available Gemini Models:", result.data.models?.map(m => m.name));
      }
    }
  }
};
