import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiToolsClient } from '../aiToolsClient';
import { LLMService } from '../llmService';
import { browserApiService } from '../browserApiService';

// Mock LLMService
vi.mock('../llmService', () => ({
  LLMService: {
    getConfig: vi.fn().mockReturnValue({}),
    streamCompletion: vi.fn()
  }
}));

// Spy on browserApiService logging
vi.spyOn(browserApiService, 'logUsage').mockImplementation(() => {});

describe('AIToolsClient', () => {
    const mockConfig = {
        useCustomApi: false,
        model: 'gemini-pro',
        apiKey: 'test-key'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should validate configuration failure', async () => {
        const invalidConfig = { ...mockConfig, model: '' };
        const result = await aiToolsClient.makeRequest({
            tool: 'text-summarizer',
            data: 'test',
            config: invalidConfig
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Model is required');
    });

    it('should handle successful string response', async () => {
        const mockResponse = 'Summarized text';
        vi.mocked(LLMService.streamCompletion).mockImplementation(async (_sys, _user, callback) => {
            callback(mockResponse);
        });

        const result = await aiToolsClient.summarize('Original text', {}, mockConfig);

        expect(result.success).toBe(true);
        expect(result.data).toBe(mockResponse);
        expect(LLMService.streamCompletion).toHaveBeenCalled();
    });

    it('should parse JSON response for builder tools', async () => {
        const mockJson = { workflow: 'test-workflow' };
        const mockResponseStr = JSON.stringify(mockJson);
        
        vi.mocked(LLMService.streamCompletion).mockImplementation(async (_sys, _user, callback) => {
            callback(mockResponseStr);
        });

        const result = await aiToolsClient.buildN8nWorkflow('request', mockConfig);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockJson);
    });

    it('should handle JSON parsing errors gracefully', async () => {
        const invalidJson = 'Not JSON';
        
        vi.mocked(LLMService.streamCompletion).mockImplementation(async (_sys, _user, callback) => {
            callback(invalidJson);
        });

        const result = await aiToolsClient.buildN8nWorkflow('request', mockConfig);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to parse AI response');
    });

    it('should use global key if config key is missing', async () => {
        vi.mocked(LLMService.getConfig).mockReturnValue({ 
            apiKey: 'global-key',
            provider: 'openai',
            model: 'test-model'
        });
        
        vi.mocked(LLMService.streamCompletion).mockImplementation(async (_sys, _user, callback, config) => {
            expect(config?.apiKey).toBe('global-key');
            callback('response');
        });

        await aiToolsClient.summarize('text', {}, { ...mockConfig, apiKey: '' });
    });
});
