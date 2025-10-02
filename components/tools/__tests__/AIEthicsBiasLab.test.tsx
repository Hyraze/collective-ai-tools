/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 * 
 * Tests for AIEthicsBiasLab component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AIEthicsBiasLab from '../AIEthicsBiasLab'

// Mock the aiToolsClient
vi.mock('../../../lib/aiToolsClient', () => ({
  aiToolsClient: {
    makeRequest: vi.fn(),
    getDefaultConfig: vi.fn(() => ({
      useCustomApi: false,
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 2500
    }))
  }
}))

// Mock ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>
}))

describe('AIEthicsBiasLab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component with initial state', () => {
    render(<AIEthicsBiasLab />)
    
    expect(screen.getByText('AI Ethics & Bias Detection Lab')).toBeInTheDocument()
    expect(screen.getByText('Test, analyze, and mitigate bias in AI systems with comprehensive ethical frameworks')).toBeInTheDocument()
  })

  it('displays bias testing tools section', () => {
    render(<AIEthicsBiasLab />)
    
    expect(screen.getByText('Bias Testing Tools')).toBeInTheDocument()
    expect(screen.getByText('Test your AI systems for various types of bias')).toBeInTheDocument()
  })

  it('shows ethical frameworks section', () => {
    render(<AIEthicsBiasLab />)
    
    expect(screen.getByText('Ethical Frameworks')).toBeInTheDocument()
    expect(screen.getByText('Learn about AI ethics principles and guidelines')).toBeInTheDocument()
  })

  it('displays available bias tests', () => {
    render(<AIEthicsBiasLab />)
    
    expect(screen.getByText('Demographic Bias Detection')).toBeInTheDocument()
    expect(screen.getByText('Linguistic Bias Detection')).toBeInTheDocument()
    expect(screen.getByText('Cultural Bias Detection')).toBeInTheDocument()
    expect(screen.getByText('Cognitive Bias Detection')).toBeInTheDocument()
  })

  it('allows selecting a bias test', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    // Should show selected state
    expect(demographicTest.closest('button')).toHaveClass('border-emerald-500')
  })

  it('shows test input area when test is selected', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    expect(screen.getByText('Test Input')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter text to test for bias...')).toBeInTheDocument()
  })

  it('displays expected behavior for selected test', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    expect(screen.getByText('Expected Behavior')).toBeInTheDocument()
    expect(screen.getByText('Responses should be neutral and not assume demographic characteristics')).toBeInTheDocument()
  })

  it('shows example inputs for selected test', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    expect(screen.getByText('Example inputs:')).toBeInTheDocument()
    expect(screen.getByText('Describe a successful CEO, What makes a good nurse?, Who would be a better engineer?')).toBeInTheDocument()
  })

  it('allows entering test input', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    const testInput = screen.getByPlaceholderText('Enter text to test for bias...')
    fireEvent.change(testInput, { target: { value: 'Describe a successful CEO' } })
    
    expect(testInput).toHaveValue('Describe a successful CEO')
  })

  it('shows run bias test button', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    const testInput = screen.getByPlaceholderText('Enter text to test for bias...')
    fireEvent.change(testInput, { target: { value: 'Test input' } })
    
    expect(screen.getByText('Run Bias Test')).toBeInTheDocument()
  })

  it('displays ethical frameworks', () => {
    render(<AIEthicsBiasLab />)
    
    expect(screen.getByText('Fairness & Non-discrimination')).toBeInTheDocument()
    expect(screen.getByText('Transparency & Explainability')).toBeInTheDocument()
    expect(screen.getByText('Privacy & Data Protection')).toBeInTheDocument()
    expect(screen.getByText('Accountability & Responsibility')).toBeInTheDocument()
  })

  it('allows selecting ethical frameworks', () => {
    render(<AIEthicsBiasLab />)
    
    const fairnessFramework = screen.getByText('Fairness & Non-discrimination')
    fireEvent.click(fairnessFramework)
    
    // Should show selected state - find the parent div with the border class
    const frameworkContainer = fairnessFramework.closest('div[class*="border"]')
    expect(frameworkContainer).toHaveClass('border-emerald-500')
  })

  it('shows bias scenarios', () => {
    render(<AIEthicsBiasLab />)
    
    expect(screen.getByText('Bias Scenarios')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Resume Screening')).toBeInTheDocument()
    expect(screen.getByText('Medical Diagnosis AI')).toBeInTheDocument()
  })

  it('allows selecting bias scenarios', () => {
    render(<AIEthicsBiasLab />)
    
    const resumeScenario = screen.getByText('AI-Powered Resume Screening')
    fireEvent.click(resumeScenario)
    
    // Should show selected state
    expect(resumeScenario.closest('button')).toHaveClass('border-emerald-500')
  })

  it('shows settings panel when settings button is clicked', () => {
    render(<AIEthicsBiasLab />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)
    
    expect(screen.getByText('AI Configuration')).toBeInTheDocument()
    expect(screen.getByText('Use Default API Key')).toBeInTheDocument()
    expect(screen.getByText('Use Custom API Key')).toBeInTheDocument()
  })

  it('allows switching between default and custom API', () => {
    render(<AIEthicsBiasLab />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)
    
    const customApiRadio = screen.getByLabelText('Use Custom API Key')
    fireEvent.click(customApiRadio)
    
    expect(screen.getByPlaceholderText('Enter your API key...')).toBeInTheDocument()
  })

  it('displays test results when test is run', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    const testInput = screen.getByPlaceholderText('Enter text to test for bias...')
    fireEvent.change(testInput, { target: { value: 'Test input' } })
    
    const runTestButton = screen.getByText('Run Bias Test')
    fireEvent.click(runTestButton)
    
    // Should show test results
    waitFor(() => {
      expect(screen.getByText('Test Results')).toBeInTheDocument()
    })
  })

  it('shows bias metrics in test results', () => {
    render(<AIEthicsBiasLab />)
    
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    const testInput = screen.getByPlaceholderText('Enter text to test for bias...')
    fireEvent.change(testInput, { target: { value: 'Test input' } })
    
    const runTestButton = screen.getByText('Run Bias Test')
    fireEvent.click(runTestButton)
    
    waitFor(() => {
      expect(screen.getByText('Bias Metrics:')).toBeInTheDocument()
      expect(screen.getByText('Fairness:')).toBeInTheDocument()
      expect(screen.getByText('Toxicity:')).toBeInTheDocument()
      expect(screen.getByText('Stereotype:')).toBeInTheDocument()
      expect(screen.getByText('Neutrality:')).toBeInTheDocument()
    })
  })

  it('displays ethics report when tests are completed', () => {
    render(<AIEthicsBiasLab />)
    
    // Run a test to generate results
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    const testInput = screen.getByPlaceholderText('Enter text to test for bias...')
    fireEvent.change(testInput, { target: { value: 'Test input' } })
    
    const runTestButton = screen.getByText('Run Bias Test')
    fireEvent.click(runTestButton)
    
    waitFor(() => {
      expect(screen.getByText('AI Ethics Report')).toBeInTheDocument()
      expect(screen.getByText('Overall Score')).toBeInTheDocument()
      expect(screen.getByText('Framework Compliance')).toBeInTheDocument()
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument()
    })
  })

  it('shows detailed framework information when selected', () => {
    render(<AIEthicsBiasLab />)
    
    const fairnessFramework = screen.getByText('Fairness & Non-discrimination')
    fireEvent.click(fairnessFramework)
    
    // Should show detailed framework view
    expect(screen.getByText('Core Principles')).toBeInTheDocument()
    expect(screen.getByText('Implementation Guidelines')).toBeInTheDocument()
    expect(screen.getByText('Common Applications')).toBeInTheDocument()
  })

  it('shows detailed scenario information when selected', () => {
    render(<AIEthicsBiasLab />)
    
    const resumeScenario = screen.getByText('AI-Powered Resume Screening')
    fireEvent.click(resumeScenario)
    
    // Should show detailed scenario view
    expect(screen.getByText('Context')).toBeInTheDocument()
    expect(screen.getByText('Ethical Issues')).toBeInTheDocument()
    expect(screen.getByText('Potential Harm')).toBeInTheDocument()
    expect(screen.getByText('Mitigation Strategies')).toBeInTheDocument()
    expect(screen.getByText('Stakeholders')).toBeInTheDocument()
  })

  it('allows closing detailed views', () => {
    render(<AIEthicsBiasLab />)
    
    const fairnessFramework = screen.getByText('Fairness & Non-discrimination')
    fireEvent.click(fairnessFramework)
    
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    // Should return to main view
    expect(screen.getByText('Ethical Frameworks')).toBeInTheDocument()
  })

  it('shows download report button in ethics report', () => {
    render(<AIEthicsBiasLab />)
    
    // Run a test to generate report
    const demographicTest = screen.getByText('Demographic Bias Detection')
    fireEvent.click(demographicTest)
    
    const testInput = screen.getByPlaceholderText('Enter text to test for bias...')
    fireEvent.change(testInput, { target: { value: 'Test input' } })
    
    const runTestButton = screen.getByText('Run Bias Test')
    fireEvent.click(runTestButton)
    
    waitFor(() => {
      expect(screen.getByText('Download Report')).toBeInTheDocument()
    })
  })

  it('displays test severity levels correctly', () => {
    render(<AIEthicsBiasLab />)
    
    // Check severity indicators
    expect(screen.getAllByText('high severity')).toHaveLength(2)
    expect(screen.getAllByText('medium severity')).toHaveLength(2)
  })

  it('shows test categories correctly', () => {
    render(<AIEthicsBiasLab />)
    
    // Check category indicators
    expect(screen.getByText('demographic')).toBeInTheDocument()
    expect(screen.getByText('linguistic')).toBeInTheDocument()
    expect(screen.getByText('cultural')).toBeInTheDocument()
    expect(screen.getByText('cognitive')).toBeInTheDocument()
  })
})
