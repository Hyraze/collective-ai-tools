/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for browserApiService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { browserApiService, BrowserAPIService } from '../browserApiService'

describe('BrowserAPIService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = BrowserAPIService.getInstance()
      const instance2 = BrowserAPIService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('validateConfig', () => {
    it('validates correct config', () => {
      const config = {
        useCustomApi: false,
        model: 'gemini-2.5-flash'
      }
      
      const result = browserApiService.validateConfig(config)
      
      expect(result).toEqual({ valid: true })
    })

    it('validates config with custom API key', () => {
      const config = {
        useCustomApi: true,
        apiKey: 'test-key',
        model: 'gpt-4'
      }
      
      const result = browserApiService.validateConfig(config)
      
      expect(result).toEqual({ valid: true })
    })

    it('rejects config without custom API key when useCustomApi is true', () => {
      const config = {
        useCustomApi: true,
        model: 'gpt-4'
      }
      
      const result = browserApiService.validateConfig(config)
      
      expect(result).toEqual({
        valid: false,
        error: 'Custom API key is required when using custom API'
      })
    })

    it('rejects config without model', () => {
      const config = {
        useCustomApi: false
      }
      
      const result = browserApiService.validateConfig(config)
      
      expect(result).toEqual({
        valid: false,
        error: 'Model is required'
      })
    })
  })

  describe('getAvailableModels', () => {
    it('returns Gemini models', () => {
      const models = browserApiService.getAvailableModels('gemini')
      
      expect(models).toContain('gemini-2.5-flash')
      expect(models).toContain('gemini-2.5-pro')
      expect(models).toContain('gemini-2.0-flash')
      expect(models).toContain('gemini-pro-latest')
    })

    it('returns OpenAI models', () => {
      const models = browserApiService.getAvailableModels('openai')
      
      expect(models).toContain('gpt-3.5-turbo')
      expect(models).toContain('gpt-4')
      expect(models).toContain('gpt-4-turbo')
    })

    it('returns Anthropic models', () => {
      const models = browserApiService.getAvailableModels('anthropic')
      
      expect(models).toContain('claude-3-sonnet')
      expect(models).toContain('claude-3-opus')
      expect(models).toContain('claude-3-haiku')
    })

    it('returns default models for unknown API type', () => {
      const models = browserApiService.getAvailableModels('unknown' as any)
      
      expect(models).toEqual(['gemini-2.5-flash'])
    })
  })

  describe('getAPITypeFromModel', () => {
    it('identifies Gemini models', () => {
      expect(browserApiService.getAPITypeFromModel('gemini-2.5-flash')).toBe('gemini')
      expect(browserApiService.getAPITypeFromModel('gemini-pro')).toBe('gemini')
      expect(browserApiService.getAPITypeFromModel('gemini-2.0-flash')).toBe('gemini')
    })

    it('identifies OpenAI models', () => {
      expect(browserApiService.getAPITypeFromModel('gpt-3.5-turbo')).toBe('openai')
      expect(browserApiService.getAPITypeFromModel('gpt-4')).toBe('openai')
      expect(browserApiService.getAPITypeFromModel('gpt-4-turbo')).toBe('openai')
    })

    it('identifies Anthropic models', () => {
      expect(browserApiService.getAPITypeFromModel('claude-3-sonnet')).toBe('anthropic')
      expect(browserApiService.getAPITypeFromModel('claude-3-opus')).toBe('anthropic')
      expect(browserApiService.getAPITypeFromModel('claude-3-haiku')).toBe('anthropic')
    })

    it('defaults to Gemini for unknown models', () => {
      expect(browserApiService.getAPITypeFromModel('unknown-model')).toBe('gemini')
    })
  })

  describe('getDefaultConfig', () => {
    it('returns default config for text-summarizer', () => {
      const config = browserApiService.getDefaultConfig('text-summarizer')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 500
      })
    })

    it('returns default config for code-reviewer', () => {
      const config = browserApiService.getDefaultConfig('code-reviewer')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.1,
        maxTokens: 4000
      })
    })

    it('returns default config for n8n-builder', () => {
      const config = browserApiService.getDefaultConfig('n8n-builder')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 6000
      })
    })

    it('returns default config for agent-builder', () => {
      const config = browserApiService.getDefaultConfig('agent-builder')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        maxTokens: 8000
      })
    })

    it('returns fallback config for unknown tool', () => {
      const config = browserApiService.getDefaultConfig('unknown-tool')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.5,
        maxTokens: 1000
      })
    })
  })

  describe('logUsage', () => {
    it('logs usage data to console', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const config = {
        useCustomApi: false,
        model: 'gemini-2.5-flash'
      }
      
      browserApiService.logUsage('test-tool', config, true)
      
      expect(consoleSpy).toHaveBeenCalledWith('API Usage:', {
        tool: 'test-tool',
        model: 'gemini-2.5-flash',
        useCustomApi: false,
        success: true,
        error: undefined,
        timestamp: expect.any(String)
      })
      
      consoleSpy.mockRestore()
    })

    it('logs error when provided', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const config = {
        useCustomApi: true,
        apiKey: 'test-key',
        model: 'gpt-4'
      }
      
      browserApiService.logUsage('test-tool', config, false, 'API Error')
      
      expect(consoleSpy).toHaveBeenCalledWith('API Usage:', {
        tool: 'test-tool',
        model: 'gpt-4',
        useCustomApi: true,
        success: false,
        error: 'API Error',
        timestamp: expect.any(String)
      })
      
      consoleSpy.mockRestore()
    })
  })
})
