import { describe, it, expect, vi, beforeEach } from 'vitest';
import { browserApiService, type APIConfig } from '../browserApiService';

describe('BrowserAPIService', () => {
  const mockConfig: APIConfig = {
    useCustomApi: false,
    model: 'test-model',
    apiKey: 'test-key'
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateConfig', () => {
    it('should return valid for correct config', () => {
      expect(browserApiService.validateConfig(mockConfig)).toEqual({ valid: true });
    });

    it('should require apiKey if useCustomApi is true', () => {
        const invalidConfig = { ...mockConfig, useCustomApi: true, apiKey: '' };
        expect(browserApiService.validateConfig(invalidConfig)).toEqual({
            valid: false,
            error: 'Custom API key is required when using custom API'
        });
    });

    it('should require model', () => {
        const invalidConfig = { ...mockConfig, model: '' };
        expect(browserApiService.validateConfig(invalidConfig)).toEqual({
            valid: false,
            error: 'Model is required'
        });
    });
  });

  describe('getAPITypeFromModel', () => {
      it('should return correct type for known models', () => {
          expect(browserApiService.getAPITypeFromModel('gpt-4')).toBe('openai');
          expect(browserApiService.getAPITypeFromModel('claude-3')).toBe('anthropic');
          expect(browserApiService.getAPITypeFromModel('gemini-pro')).toBe('gemini');
          expect(browserApiService.getAPITypeFromModel('deepseek-coder')).toBe('deepseek');
          expect(browserApiService.getAPITypeFromModel('llama-3')).toBe('ollama');
      });
      
      it('should default to openai for unknown', () => {
          expect(browserApiService.getAPITypeFromModel('unknown-model')).toBe('openai');
      });
  });

  describe('makeAPICall', () => {
      it('should return success data on successful fetch', async () => {
          const mockResponse = { result: 'success' };
          global.fetch = vi.fn().mockResolvedValue({
              ok: true,
              json: async () => mockResponse
          });

          const response = await browserApiService.makeAPICall('/api/test', { data: 'test' }, mockConfig);
          
          expect(response).toEqual({
              success: true,
              data: mockResponse
          });
          expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
              method: 'POST',
              body: JSON.stringify({ data: 'test', settings: mockConfig })
          }));
      });

      it('should return error on failed fetch', async () => {
          global.fetch = vi.fn().mockResolvedValue({
              ok: false,
              status: 400,
              json: async () => ({ error: 'Bad Request' })
          });

          const response = await browserApiService.makeAPICall('/api/test', {}, mockConfig);

          expect(response).toEqual({
              success: false,
              error: 'Bad Request'
          });
      });

      it('should handle network errors', async () => {
          global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

          const response = await browserApiService.makeAPICall('/api/test', {}, mockConfig);

          expect(response).toEqual({
              success: false,
              error: 'Network Error'
          });
      });
  });
});
