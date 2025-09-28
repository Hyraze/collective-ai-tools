/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for aiToolsClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { aiToolsClient, AIToolsClient } from '../aiToolsClient'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AIToolsClient', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = AIToolsClient.getInstance()
      const instance2 = AIToolsClient.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('getDefaultConfig', () => {
    it('returns default config for text-summarizer', () => {
      const config = aiToolsClient.getDefaultConfig('text-summarizer')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        maxTokens: 500
      })
    })

    it('returns default config for code-reviewer', () => {
      const config = aiToolsClient.getDefaultConfig('code-reviewer')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.1,
        maxTokens: 4000
      })
    })

    it('returns default config for unknown tool', () => {
      const config = aiToolsClient.getDefaultConfig('unknown-tool')
      
      expect(config).toEqual({
        useCustomApi: false,
        model: 'gemini-2.5-flash',
        temperature: 0.5,
        maxTokens: 1000
      })
    })
  })

  describe('getAvailableModels', () => {
    it('returns Gemini models', () => {
      const models = aiToolsClient.getAvailableModels('gemini')
      
      expect(models).toContain('gemini-2.5-flash')
      expect(models).toContain('gemini-2.5-pro')
    })

    it('returns OpenAI models', () => {
      const models = aiToolsClient.getAvailableModels('openai')
      
      expect(models).toContain('gpt-3.5-turbo')
      expect(models).toContain('gpt-4')
    })

    it('returns Anthropic models', () => {
      const models = aiToolsClient.getAvailableModels('anthropic')
      
      expect(models).toContain('claude-3-sonnet')
      expect(models).toContain('claude-3-opus')
    })
  })

  describe('getAPITypeFromModel', () => {
    it('identifies Gemini models', () => {
      expect(aiToolsClient.getAPITypeFromModel('gemini-2.5-flash')).toBe('gemini')
      expect(aiToolsClient.getAPITypeFromModel('gemini-pro')).toBe('gemini')
    })

    it('identifies OpenAI models', () => {
      expect(aiToolsClient.getAPITypeFromModel('gpt-3.5-turbo')).toBe('openai')
      expect(aiToolsClient.getAPITypeFromModel('gpt-4')).toBe('openai')
    })

    it('identifies Anthropic models', () => {
      expect(aiToolsClient.getAPITypeFromModel('claude-3-sonnet')).toBe('anthropic')
      expect(aiToolsClient.getAPITypeFromModel('claude-3-opus')).toBe('anthropic')
    })
  })

  describe('makeRequest', () => {
    it('makes successful API request', async () => {
      const mockResponse = {
        success: true,
        data: { result: 'test' }
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const request = {
        tool: 'text-summarizer' as const,
        data: { text: 'test' },
        config: aiToolsClient.getDefaultConfig('text-summarizer')
      }

      const result = await aiToolsClient.makeRequest(request)
      
      expect(result).toEqual({
        success: true,
        data: mockResponse
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/ai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
    })

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })

      const request = {
        tool: 'text-summarizer' as const,
        data: { text: 'test' },
        config: aiToolsClient.getDefaultConfig('text-summarizer')
      }

      const result = await aiToolsClient.makeRequest(request)
      
      expect(result).toEqual({
        success: false,
        error: 'Server error'
      })
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const request = {
        tool: 'text-summarizer' as const,
        data: { text: 'test' },
        config: aiToolsClient.getDefaultConfig('text-summarizer')
      }

      const result = await aiToolsClient.makeRequest(request)
      
      expect(result).toEqual({
        success: false,
        error: 'Network error'
      })
    })
  })

  describe('summarize', () => {
    it('calls makeRequest with correct parameters', async () => {
      const mockResponse = { success: true, data: { summary: 'test summary' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const config = aiToolsClient.getDefaultConfig('text-summarizer')
      const options = {
        maxLength: 100,
        preserveNumbers: true,
        preserveNames: true,
        style: 'bullet' as const
      }

      await aiToolsClient.summarize('test text', options, config)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/ai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'text-summarizer',
          data: { text: 'test text', options },
          config
        })
      })
    })
  })

  describe('reviewCode', () => {
    it('calls makeRequest with correct parameters', async () => {
      const mockResponse = { success: true, data: { review: 'test review' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const config = aiToolsClient.getDefaultConfig('code-reviewer')
      const options = {
        language: 'javascript',
        reviewType: {
          security: true,
          performance: true,
          bestPractices: true,
          bugDetection: true
        }
      }

      await aiToolsClient.reviewCode('console.log("test")', options, config)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/ai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'code-reviewer',
          data: { code: 'console.log("test")', options },
          config
        })
      })
    })
  })
})
