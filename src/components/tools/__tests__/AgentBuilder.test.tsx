import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AgentBuilder from '../AgentBuilder'; // Default export
import { aiToolsClient } from '@/lib/aiToolsClient';

// Mock aiToolsClient
vi.mock('@/lib/aiToolsClient', () => ({
  aiToolsClient: {
    makeRequest: vi.fn(),
    getDefaultConfig: vi.fn().mockReturnValue({
      useCustomApi: false,
      model: 'gemini-pro',
      temperature: 0.7
    }),
  }
}));

// Mock ReactMarkdown since it might cause issues in jsdom/node env if not configured or just to simplify
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('AgentBuilder', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<AgentBuilder />);
        expect(screen.getByText('Agent Builder MCP')).toBeDefined();
        expect(screen.getByText('Agent Configuration')).toBeDefined();
    });

    it('updates agent name input', () => {
        render(<AgentBuilder />);
        const input = screen.getByPlaceholderText('e.g., Code Review Assistant');
        fireEvent.change(input, { target: { value: 'Test Agent' } });
        expect(input).toHaveProperty('value', 'Test Agent');
    });

    it('disables generate button when form is incomplete', () => {
        render(<AgentBuilder />);
        // By default button should be disabled because fields are empty
        const button = screen.getByText('Generate MCP Agent');
        expect(button).toHaveProperty('disabled', true);
    });

    it('enables generate button when form is filled', () => {
        render(<AgentBuilder />);
        
        const nameInput = screen.getByPlaceholderText('e.g., Code Review Assistant');
        fireEvent.change(nameInput, { target: { value: 'Test Agent' } });

        const descInput = screen.getByPlaceholderText('Describe what this agent does and its main purpose...');
        fireEvent.change(descInput, { target: { value: 'This is a test agent.' } });

        const button = screen.getByText('Generate MCP Agent');
        expect(button).toHaveProperty('disabled', false);
    });

    it('calls API to generate agent', async () => {
        const mockAgent = {
            name: 'Test Agent',
            description: 'Generated Description',
            capabilities: [],
            tools: [],
            reasoning_engine: { type: 'chain_of_thought' },
            memory_system: { type: 'working' }
        };

        vi.mocked(aiToolsClient.makeRequest).mockResolvedValue({
            success: true,
            data: { agent: mockAgent, explanation: 'Success' }
        });

        render(<AgentBuilder />);
        
        // Fill form
        fireEvent.change(screen.getByPlaceholderText('e.g., Code Review Assistant'), { target: { value: 'Test Agent' } });
        fireEvent.change(screen.getByPlaceholderText('Describe what this agent does and its main purpose...'), { target: { value: 'Test Description' } });
        
        const button = screen.getByText('Generate MCP Agent');
        fireEvent.click(button);

        await waitFor(() => {
            expect(aiToolsClient.makeRequest).toHaveBeenCalled();
        });

        await waitFor(() => {
             expect(screen.getByText('Generated MCP Agent')).toBeDefined();
             // Generated content should appear
             expect(screen.getByText('Generated Description')).toBeDefined();
        });
    });

    it('handles API errors', async () => {
        vi.mocked(aiToolsClient.makeRequest).mockResolvedValue({
            success: false,
            error: 'API Error'
        });

        render(<AgentBuilder />);
        
         // Fill form
         fireEvent.change(screen.getByPlaceholderText('e.g., Code Review Assistant'), { target: { value: 'Test Agent' } });
         fireEvent.change(screen.getByPlaceholderText('Describe what this agent does and its main purpose...'), { target: { value: 'Test Description' } });
         
         const button = screen.getByText('Generate MCP Agent');
         fireEvent.click(button);

         await waitFor(() => {
             expect(screen.getByText('Error: API Error')).toBeDefined();
         });
    });
});
