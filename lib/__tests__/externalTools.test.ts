/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for externalTools functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initializeExternalTools } from '../externalTools'

// Mock DOM methods
const mockContainer = {
  innerHTML: '',
  appendChild: vi.fn(),
  querySelector: vi.fn(),
  addEventListener: vi.fn()
}

describe('External Tools', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock fetch for README.md
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`
# AI Tools Directory

## Text Generation
- [Tool 1](https://example.com/tool1) - Description 1
- [Tool 2](https://example.com/tool2) - Description 2

## Image Generation  
- [Tool 3](https://example.com/tool3) - Description 3
      `)
    })

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })

    // Mock document methods
    global.document = {
      ...global.document,
      getElementById: vi.fn().mockReturnValue(mockContainer),
      createElement: vi.fn().mockReturnValue(mockContainer),
      addEventListener: vi.fn()
    } as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes external tools successfully', async () => {
    await initializeExternalTools(mockContainer as any)

    expect(mockContainer.innerHTML).not.toBe('')
  })

  it('handles fetch errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await initializeExternalTools(mockContainer as any)

    // Should still render something even if fetch fails
    expect(mockContainer.innerHTML).not.toBe('')
  })

  it('handles empty container', async () => {
    const emptyContainer = null

    // This should throw an error for null container
    await expect(initializeExternalTools(emptyContainer as any)).rejects.toThrow()
  })

  it('handles malformed README content', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('Invalid markdown content')
    })

    await initializeExternalTools(mockContainer as any)

    expect(mockContainer.innerHTML).not.toBe('')
  })

  it('handles network timeout', async () => {
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 100)
      )
    )

    await initializeExternalTools(mockContainer as any)

    expect(mockContainer.innerHTML).not.toBe('')
  })

  it('handles empty README response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('')
    })

    await initializeExternalTools(mockContainer as any)

    expect(mockContainer.innerHTML).not.toBe('')
  })

  it('handles 404 response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not found')
    })

    await initializeExternalTools(mockContainer as any)

    expect(mockContainer.innerHTML).not.toBe('')
  })

  it('handles large README content', async () => {
    const largeContent = '# AI Tools\n' + 
      Array.from({ length: 1000 }, (_, i) => 
        `- [Tool ${i}](https://example.com/tool${i}) - Description ${i}`
      ).join('\n')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(largeContent)
    })

    await initializeExternalTools(mockContainer as any)

    expect(mockContainer.innerHTML).not.toBe('')
  })
})
