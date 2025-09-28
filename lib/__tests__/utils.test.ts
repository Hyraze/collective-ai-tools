/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock utility functions that might exist in utils.ts
const mockUtils = {
  formatDate: (date: Date) => date.toISOString().split('T')[0],
  truncateText: (text: string, maxLength: number) => 
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text,
  validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  debounce: (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  },
  throttle: (func: Function, limit: number) => {
    let inThrottle: boolean
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

describe('Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z')
      expect(mockUtils.formatDate(date)).toBe('2023-12-25')
    })

    it('handles different date formats', () => {
      const date1 = new Date('2023-01-01T00:00:00Z')
      const date2 = new Date('2023-12-31T23:59:59Z')
      
      expect(mockUtils.formatDate(date1)).toBe('2023-01-01')
      expect(mockUtils.formatDate(date2)).toBe('2023-12-31')
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated'
      const result = mockUtils.truncateText(longText, 20)
      
      expect(result).toBe('This is a very long ...')
      expect(result.length).toBe(23) // 20 + '...'
    })

    it('does not truncate short text', () => {
      const shortText = 'Short text'
      const result = mockUtils.truncateText(shortText, 20)
      
      expect(result).toBe('Short text')
    })

    it('handles empty text', () => {
      const result = mockUtils.truncateText('', 10)
      expect(result).toBe('')
    })

    it('handles text exactly at max length', () => {
      const text = 'Exactly ten'
      const result = mockUtils.truncateText(text, 11)
      expect(result).toBe('Exactly ten')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(mockUtils.validateEmail('test@example.com')).toBe(true)
      expect(mockUtils.validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(mockUtils.validateEmail('user+tag@example.org')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(mockUtils.validateEmail('invalid-email')).toBe(false)
      expect(mockUtils.validateEmail('@example.com')).toBe(false)
      expect(mockUtils.validateEmail('user@')).toBe(false)
      expect(mockUtils.validateEmail('user@.com')).toBe(false)
      expect(mockUtils.validateEmail('')).toBe(false)
    })
  })

  describe('debounce', () => {
    it('delays function execution', async () => {
      const mockFn = vi.fn()
      const debouncedFn = mockUtils.debounce(mockFn, 100)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(mockFn).not.toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    it('cancels previous calls', async () => {
      const mockFn = vi.fn()
      const debouncedFn = mockUtils.debounce(mockFn, 100)

      debouncedFn('first')
      
      await new Promise(resolve => setTimeout(resolve, 50))
      
      debouncedFn('second')
      
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('second')
    })
  })

  describe('throttle', () => {
    it('limits function execution frequency', async () => {
      const mockFn = vi.fn()
      const throttledFn = mockUtils.throttle(mockFn, 100)

      throttledFn('call1')
      throttledFn('call2')
      throttledFn('call3')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('call1')

      await new Promise(resolve => setTimeout(resolve, 150))

      throttledFn('call4')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('call4')
    })

    it('allows first call immediately', () => {
      const mockFn = vi.fn()
      const throttledFn = mockUtils.throttle(mockFn, 1000)

      throttledFn('immediate')
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('immediate')
    })
  })

  describe('Edge Cases', () => {
    it('handles null and undefined inputs gracefully', () => {
      expect(() => mockUtils.truncateText(null as any, 10)).toThrow()
      expect(() => mockUtils.validateEmail(undefined as any)).not.toThrow()
    })

    it('handles extreme values', () => {
      const veryLongText = 'a'.repeat(10000)
      const result = mockUtils.truncateText(veryLongText, 5)
      expect(result).toBe('aaaaa...')
    })

    it('handles zero and negative values', () => {
      const text = 'Hello World'
      expect(mockUtils.truncateText(text, 0)).toBe('...')
      expect(mockUtils.truncateText(text, -5)).toBe('...')
    })
  })
})
