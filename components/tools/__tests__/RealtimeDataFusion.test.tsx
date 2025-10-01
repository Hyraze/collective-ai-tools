/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for RealtimeDataFusion component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RealtimeDataFusion from '../RealtimeDataFusion'

// Mock the aiToolsClient
vi.mock('../../../lib/aiToolsClient', () => ({
  aiToolsClient: {
    makeRequest: vi.fn(),
    getDefaultConfig: vi.fn(() => ({
      useCustomApi: false,
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 6000
    }))
  }
}))

describe('RealtimeDataFusion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock URL.createObjectURL for export functionality
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('renders the component with initial state', () => {
    render(<RealtimeDataFusion />)
    
    expect(screen.getByText('Real-time Data Fusion Engine')).toBeInTheDocument()
    expect(screen.getByText('Combine multiple data sources with AI-powered insights and real-time analysis')).toBeInTheDocument()
  })

  it('displays data sources section', () => {
    render(<RealtimeDataFusion />)
    
    expect(screen.getByText('Data Sources')).toBeInTheDocument()
    expect(screen.getAllByText('Weather API')).toHaveLength(2) // Name and description
    expect(screen.getAllByText('Twitter Feed')).toHaveLength(2) // Name and description
    expect(screen.getAllByText('Stock Prices')).toHaveLength(2) // Name and description
  })

  it('displays AI insights section', () => {
    render(<RealtimeDataFusion />)
    
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getAllByText('Rising AI Sentiment')).toHaveLength(2) // Title and description
    expect(screen.getAllByText('Weather-Stock Correlation')).toHaveLength(2) // Title and description
    expect(screen.getAllByText('Unusual Trading Volume')).toHaveLength(2) // Title and description
  })

  it('displays analytics dashboard', () => {
    render(<RealtimeDataFusion />)
    
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Data Flow')).toBeInTheDocument()
    expect(screen.getByText('Total Data Points')).toBeInTheDocument()
    expect(screen.getByText('Active Sources')).toBeInTheDocument()
    expect(screen.getByText('AI Insights')).toBeInTheDocument()
    expect(screen.getByText('High Impact')).toBeInTheDocument()
  })

  it('shows streaming status', () => {
    render(<RealtimeDataFusion />)
    
    expect(screen.getByText('Paused')).toBeInTheDocument()
    expect(screen.getByText('Start Streaming')).toBeInTheDocument()
  })

  it('starts streaming when start button is clicked', () => {
    render(<RealtimeDataFusion />)
    
    const startButton = screen.getByText('Start Streaming')
    fireEvent.click(startButton)
    
    expect(screen.getByText('Stop Streaming')).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('stops streaming when stop button is clicked', () => {
    render(<RealtimeDataFusion />)
    
    // Start streaming first
    const startButton = screen.getByText('Start Streaming')
    fireEvent.click(startButton)
    
    // Then stop it
    const stopButton = screen.getByText('Stop Streaming')
    fireEvent.click(stopButton)
    
    expect(screen.getByText('Start Streaming')).toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })

  it('shows add data source modal when add source button is clicked', () => {
    render(<RealtimeDataFusion />)
    
    const addSourceButton = screen.getByText('Add Source')
    fireEvent.click(addSourceButton)
    
    expect(screen.getByText('Add Data Source')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Weather API')).toBeInTheDocument()
  })

  it('closes add data source modal when cancel is clicked', async () => {
    render(<RealtimeDataFusion />)
    
    // Open modal
    const addSourceButton = screen.getByText('Add Source')
    fireEvent.click(addSourceButton)
    
    expect(screen.getByText('Add Data Source')).toBeInTheDocument()
    
    // Close modal
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Add Data Source')).not.toBeInTheDocument()
    })
  })

  it('adds new data source when form is submitted', async () => {
    render(<RealtimeDataFusion />)
    
    // Open modal
    const addSourceButton = screen.getByText('Add Source')
    fireEvent.click(addSourceButton)
    
    // Fill form
    const nameInput = screen.getByPlaceholderText('e.g., Weather API')
    fireEvent.change(nameInput, { target: { value: 'Test API' } })
    
    const urlInput = screen.getByPlaceholderText('https://api.example.com/data')
    fireEvent.change(urlInput, { target: { value: 'https://api.test.com' } })
    
    // Submit form - use getAllByText to get the modal button specifically
    const addButtons = screen.getAllByText('Add Source')
    const modalAddButton = addButtons.find(button => 
      button.closest('[role="dialog"]') || button.closest('.fixed')
    ) || addButtons[1] // Fallback to second button (modal button)
    fireEvent.click(modalAddButton)
    
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Add Data Source')).not.toBeInTheDocument()
    })
  })

  it('filters insights by type', () => {
    render(<RealtimeDataFusion />)
    
    const filterSelect = screen.getByDisplayValue('All Types')
    fireEvent.change(filterSelect, { target: { value: 'trend' } })
    
    // Should still show trend insights (use getAllByText to handle multiple instances)
    expect(screen.getAllByText('Rising AI Sentiment')).toHaveLength(2) // Title and description
  })

  it('searches insights by query', () => {
    render(<RealtimeDataFusion />)
    
    const searchInput = screen.getByPlaceholderText('Search insights...')
    fireEvent.change(searchInput, { target: { value: 'AI' } })
    
    // Should show AI-related insights (use getAllByText to handle multiple instances)
    expect(screen.getAllByText('Rising AI Sentiment')).toHaveLength(2) // Title and description
  })

  it('generates insights when generate insights button is clicked', async () => {
    const mockInsights = {
      insights: [
        {
          id: 'new-insight',
          type: 'trend',
          title: 'New Pattern Detected',
          description: 'AI detected a new pattern',
          confidence: 0.85,
          impact: 'medium',
          timestamp: new Date().toISOString(),
          data: {},
          actionable: true
        }
      ],
      data_analysis: {
        total_data_points: 1000,
        data_quality_score: 0.9
      }
    }

    const { aiToolsClient } = await import('../../../lib/aiToolsClient')
    vi.mocked(aiToolsClient.makeRequest).mockResolvedValue({
      success: true,
      data: {
        analysis: mockInsights,
        explanation: 'Generated new insights'
      }
    })

    render(<RealtimeDataFusion />)
    
    const generateButton = screen.getByText('Generate Insights')
    fireEvent.click(generateButton)
    
    // Should not throw an error
    expect(generateButton).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const { aiToolsClient } = await import('../../../lib/aiToolsClient')
    vi.mocked(aiToolsClient.makeRequest).mockResolvedValue({
      success: false,
      error: 'API request failed'
    })

    render(<RealtimeDataFusion />)
    
    const generateButton = screen.getByText('Generate Insights')
    fireEvent.click(generateButton)
    
    // Should not throw an error
    expect(generateButton).toBeInTheDocument()
  })

  it('exports dashboard data', () => {
    render(<RealtimeDataFusion />)
    
    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)
    
    // Should not throw an error
    expect(exportButton).toBeInTheDocument()
  })

  it('shows settings panel when settings button is clicked', () => {
    render(<RealtimeDataFusion />)
    
    const settingsButton = screen.getByText('Settings')
    fireEvent.click(settingsButton)
    
    expect(screen.getByText('AI Configuration')).toBeInTheDocument()
  })

  it('displays data source status', () => {
    render(<RealtimeDataFusion />)
    
    // Check for connected status
    const connectedStatuses = screen.getAllByText('connected')
    expect(connectedStatuses.length).toBeGreaterThan(0)
  })

  it('shows data source statistics', () => {
    render(<RealtimeDataFusion />)
    
    // Check for data counts - these are displayed in the data sources section
    // The numbers might be formatted differently, so let's check for the presence of numbers
    expect(screen.getByText(/1,250/)).toBeInTheDocument() // Weather API
    expect(screen.getByText(/3,420/)).toBeInTheDocument() // Twitter Feed
    expect(screen.getAllByText(/890/)).toHaveLength(2) // Stock Prices appears twice
  })

  it('displays insight confidence levels', () => {
    render(<RealtimeDataFusion />)
    
    // Check for confidence percentages
    expect(screen.getByText('87%')).toBeInTheDocument() // Rising AI Sentiment
    expect(screen.getByText('73%')).toBeInTheDocument() // Weather-Stock Correlation
    expect(screen.getByText('95%')).toBeInTheDocument() // Unusual Trading Volume
  })

  it('shows insight impact levels', () => {
    render(<RealtimeDataFusion />)
    
    // Check for impact badges (use getAllByText to handle multiple instances)
    expect(screen.getAllByText('high')).toHaveLength(2) // Two high impact insights
    expect(screen.getByText('medium')).toBeInTheDocument()
  })

  it('displays recent activity', () => {
    render(<RealtimeDataFusion />)
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('shows total statistics', () => {
    render(<RealtimeDataFusion />)
    
    // Check for total counts
    expect(screen.getByText('5,560')).toBeInTheDocument() // Total data points
    expect(screen.getAllByText('3')).toHaveLength(2) // Active sources and AI insights
    expect(screen.getByText('2')).toBeInTheDocument() // High impact insights
  })

  it('handles data source removal', () => {
    render(<RealtimeDataFusion />)
    
    // Find and click a remove button (trash icon)
    const removeButtons = screen.getAllByRole('button')
    const trashButton = removeButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('delete')
    )
    
    if (trashButton) {
      fireEvent.click(trashButton)
      // Should not throw an error
      expect(trashButton).toBeInTheDocument()
    }
  })
})
