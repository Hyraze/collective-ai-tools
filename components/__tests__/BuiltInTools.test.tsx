/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for BuiltInTools component
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
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

vi.mock('../tools/MultiModelOrchestrator', () => ({
  default: () => <div data-testid="multi-model-orchestrator">Multi-Model Orchestrator</div>
}))

vi.mock('../tools/VisualWorkflowBuilder', () => ({
  default: () => <div data-testid="visual-workflow-builder">Visual Workflow Builder</div>
}))

vi.mock('../tools/RealtimeDataFusion', () => ({
  default: () => <div data-testid="realtime-data-fusion">Real-time Data Fusion</div>
}))

const renderWithRouter = (component: React.ReactElement, initialRoute = '/') => {
  if (initialRoute === '/') {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    )
  }
  
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/built-in-tools" element={component} />
        <Route path="/built-in-tools/:toolId" element={component} />
      </Routes>
    </MemoryRouter>
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
    expect(screen.getByText('Multi-Model AI Orchestrator')).toBeInTheDocument()
    expect(screen.getByText('Visual AI Workflow Builder')).toBeInTheDocument()
    expect(screen.getByText('Real-time Data Fusion Engine')).toBeInTheDocument()
    expect(screen.getByText('n8n Workflow Builder')).toBeInTheDocument()
    expect(screen.getByText('Agent Builder MCP')).toBeInTheDocument()
  })

  it('shows back button when a tool is selected', () => {
    renderWithRouter(<BuiltInTools />, '/built-in-tools/n8n-builder')
    
    expect(screen.getByText('← Back to AI Workspace')).toBeInTheDocument()
  })

  it('renders selected tool component', () => {
    renderWithRouter(<BuiltInTools />, '/built-in-tools/n8n-builder')
    
    expect(screen.getByTestId('n8n-builder')).toBeInTheDocument()
  })

  it('goes back to tool list when back button is clicked', () => {
    renderWithRouter(<BuiltInTools />, '/built-in-tools/n8n-builder')
    
    // Click back button
    const backButton = screen.getByText('← Back to AI Workspace')
    fireEvent.click(backButton)
    
    // After clicking back, we should see the tool list again
    expect(screen.getByText('n8n Workflow Builder')).toBeInTheDocument()
    expect(screen.queryByTestId('n8n-builder')).not.toBeInTheDocument()
  })


  it('displays tool descriptions', () => {
    renderWithRouter(<BuiltInTools />)
    
    expect(screen.getByText(/Intelligently route queries to the best AI models/)).toBeInTheDocument()
    expect(screen.getByText(/Create complex AI workflows with drag-and-drop/)).toBeInTheDocument()
    expect(screen.getByText(/Combine multiple data sources with AI-powered/)).toBeInTheDocument()
    expect(screen.getByText(/Generate advanced n8n workflows/)).toBeInTheDocument()
    expect(screen.getByText(/Create sophisticated AI agents/)).toBeInTheDocument()
  })

  it('renders multi-model-orchestrator component when selected', () => {
    renderWithRouter(<BuiltInTools />, '/built-in-tools/multi-model-orchestrator')
    
    expect(screen.getByTestId('multi-model-orchestrator')).toBeInTheDocument()
  })

  it('renders visual-workflow-builder component when selected', () => {
    renderWithRouter(<BuiltInTools />, '/built-in-tools/visual-workflow-builder')
    
    expect(screen.getByTestId('visual-workflow-builder')).toBeInTheDocument()
  })

  it('renders realtime-data-fusion component when selected', () => {
    renderWithRouter(<BuiltInTools />, '/built-in-tools/realtime-data-fusion')
    
    expect(screen.getByTestId('realtime-data-fusion')).toBeInTheDocument()
  })
})
