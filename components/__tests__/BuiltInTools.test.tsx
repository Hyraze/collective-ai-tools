/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for BuiltInTools component
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BuiltInTools from '../BuiltInTools'

// Mock the tool components
vi.mock('../tools/TextSummarizer', () => ({
  default: () => <div data-testid="text-summarizer">Text Summarizer</div>
}))

vi.mock('../tools/CodeReviewer', () => ({
  default: () => <div data-testid="code-reviewer">Code Reviewer</div>
}))

vi.mock('../tools/N8nBuilder', () => ({
  default: () => <div data-testid="n8n-builder">N8n Builder</div>
}))

vi.mock('../tools/AgentBuilder', () => ({
  default: () => <div data-testid="agent-builder">Agent Builder</div>
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('BuiltInTools', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks()
  })

  it('renders tool list by default', () => {
    renderWithRouter(<BuiltInTools />)
    
    expect(screen.getByText('AI Workspace')).toBeInTheDocument()
    expect(screen.getByText('n8n Workflow Builder')).toBeInTheDocument()
    expect(screen.getByText('Agent Builder MCP')).toBeInTheDocument()
  })

  it('shows back button when a tool is selected', () => {
    renderWithRouter(<BuiltInTools />)
    
    // Click on a tool
    const n8nBuilderCard = screen.getByText('n8n Workflow Builder')
    fireEvent.click(n8nBuilderCard)
    
    expect(screen.getByText('← Back to AI Workspace')).toBeInTheDocument()
  })

  it('renders selected tool component', () => {
    renderWithRouter(<BuiltInTools />)
    
    // Click on n8n Workflow Builder
    const n8nBuilderCard = screen.getByText('n8n Workflow Builder')
    fireEvent.click(n8nBuilderCard)
    
    expect(screen.getByTestId('n8n-builder')).toBeInTheDocument()
  })

  it('goes back to tool list when back button is clicked', () => {
    renderWithRouter(<BuiltInTools />)
    
    // Click on a tool
    const n8nBuilderCard = screen.getByText('n8n Workflow Builder')
    fireEvent.click(n8nBuilderCard)
    
    // Click back button
    const backButton = screen.getByText('← Back to AI Workspace')
    fireEvent.click(backButton)
    
    // Should show tool list again
    expect(screen.getByText('n8n Workflow Builder')).toBeInTheDocument()
    expect(screen.queryByTestId('n8n-builder')).not.toBeInTheDocument()
  })


  it('displays tool descriptions', () => {
    renderWithRouter(<BuiltInTools />)
    
    expect(screen.getByText(/Generate advanced n8n workflows/)).toBeInTheDocument()
    expect(screen.getByText(/Create sophisticated AI agents/)).toBeInTheDocument()
  })
})
