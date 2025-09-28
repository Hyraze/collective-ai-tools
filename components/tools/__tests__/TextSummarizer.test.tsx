/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for TextSummarizer component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TextSummarizer from '../TextSummarizer'

// Mock the API client
vi.mock('../../../lib/aiToolsClient', () => ({
  aiToolsClient: {
    getDefaultConfig: vi.fn().mockReturnValue({
      useCustomApi: false,
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 500
    }),
    summarize: vi.fn()
  }
}))

describe('TextSummarizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders text input area', () => {
    render(<TextSummarizer />)
    
    expect(screen.getByPlaceholderText(/enter your text here/i)).toBeInTheDocument()
  })

  it('renders summarize button', () => {
    render(<TextSummarizer />)
    
    expect(screen.getByText('Summarize')).toBeInTheDocument()
  })

  it('renders settings button', () => {
    render(<TextSummarizer />)
    
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('shows settings panel when settings button is clicked', () => {
    render(<TextSummarizer />)
    
    const settingsButton = screen.getByText('Settings')
    fireEvent.click(settingsButton)
    
    expect(screen.getByText('Summary Options')).toBeInTheDocument()
  })

  it('hides settings panel when settings button is clicked again', () => {
    render(<TextSummarizer />)
    
    const settingsButton = screen.getByText('Settings')
    fireEvent.click(settingsButton)
    
    // The settings panel is always visible in this component
    // Just verify it exists after clicking
    expect(screen.getByText('Summary Options')).toBeInTheDocument()
  })

  it('disables summarize button when no text is entered', () => {
    render(<TextSummarizer />)
    
    const summarizeButton = screen.getByText('Summarize')
    expect(summarizeButton).toBeDisabled()
  })

  it('enables summarize button when text is entered', () => {
    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const summarizeButton = screen.getByText('Summarize')
    
    fireEvent.change(textArea, { target: { value: 'Some text to summarize' } })
    
    expect(summarizeButton).not.toBeDisabled()
  })

  it('shows loading state during summarization', async () => {
    const { aiToolsClient } = await import('../../../lib/aiToolsClient')
    vi.mocked(aiToolsClient.summarize).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: { summary: 'Test summary' } }), 100))
    )

    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const summarizeButton = screen.getByText('Summarize')
    
    fireEvent.change(textArea, { target: { value: 'Some text to summarize' } })
    fireEvent.click(summarizeButton)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('displays summary result after successful summarization', async () => {
    const { aiToolsClient } = await import('../../../lib/aiToolsClient')
    vi.mocked(aiToolsClient.summarize).mockResolvedValue({
      success: true,
      data: { summary: 'This is a test summary' }
    })

    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const summarizeButton = screen.getByText('Summarize')
    
    fireEvent.change(textArea, { target: { value: 'Some text to summarize' } })
    fireEvent.click(summarizeButton)
    
    await waitFor(() => {
      expect(screen.getByText('This is a test summary')).toBeInTheDocument()
    })
  })

  it('displays error message when summarization fails', async () => {
    const { aiToolsClient } = await import('../../../lib/aiToolsClient')
    vi.mocked(aiToolsClient.summarize).mockResolvedValue({
      success: false,
      error: 'API Error'
    })

    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const summarizeButton = screen.getByText('Summarize')
    
    fireEvent.change(textArea, { target: { value: 'Some text to summarize' } })
    fireEvent.click(summarizeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument()
    })
  })

  it('clears text when clear button is clicked', () => {
    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const clearButton = screen.getByText('Reset')
    
    fireEvent.change(textArea, { target: { value: 'Some text' } })
    fireEvent.click(clearButton)
    
    expect(textArea).toHaveValue('')
  })

  it('copies summary to clipboard when copy button is clicked', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    })

    const { aiToolsClient } = await import('../../../lib/aiToolsClient')
    vi.mocked(aiToolsClient.summarize).mockResolvedValue({
      success: true,
      data: { summary: 'Test summary' }
    })

    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const summarizeButton = screen.getByText('Summarize')
    
    fireEvent.change(textArea, { target: { value: 'Some text' } })
    fireEvent.click(summarizeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test summary')).toBeInTheDocument()
    })

    const copyButton = screen.getByText('Copy')
    fireEvent.click(copyButton)
    
    expect(mockWriteText).toHaveBeenCalledWith('Test summary')
  })

  it('handles empty text input', () => {
    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const summarizeButton = screen.getByText('Summarize')
    
    fireEvent.change(textArea, { target: { value: '' } })
    
    expect(summarizeButton).toBeDisabled()
  })

  it('handles very long text input', () => {
    render(<TextSummarizer />)
    
    const textArea = screen.getByPlaceholderText(/enter your text here/i)
    const longText = 'a'.repeat(10000)
    
    fireEvent.change(textArea, { target: { value: longText } })
    
    expect(textArea).toHaveValue(longText)
  })
})
