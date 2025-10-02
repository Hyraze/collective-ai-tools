/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import JobBoard from '../JobBoard';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock jobs data
const mockJobs = [
  {
    id: '1',
    title: 'Senior AI Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    type: 'remote',
    description: 'Join our team to build the next generation of AI systems.',
    url: 'https://openai.com/careers',
    publishedDate: '2025-01-15',
    source: 'AI Jobs',
    salary: '$180,000 - $250,000',
    experience: '5+ years',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Deep Learning']
  },
  {
    id: '2',
    title: 'Machine Learning Engineer',
    company: 'Anthropic',
    location: 'New York, NY',
    type: 'hybrid',
    description: 'Develop and deploy machine learning models for AI safety research.',
    url: 'https://anthropic.com/careers',
    publishedDate: '2025-01-14',
    source: 'Wellfound',
    salary: '$160,000 - $220,000',
    experience: '3+ years',
    tags: ['Python', 'Machine Learning', 'AI Safety', 'Research']
  }
];

const mockApiResponse = {
  jobs: mockJobs,
  total: mockJobs.length,
  lastUpdated: new Date().toISOString(),
  sources: ['AI Jobs', 'Wellfound'],
  dataSource: 'Live APIs',
  activeFeeds: [
    { name: 'We Work Remotely - Programming', type: 'weworkremotely', priority: 1, isAPI: false }
  ]
};

describe('JobBoard Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders job board with loading state initially', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    expect(screen.getByText('AI Jobs Board')).toBeInTheDocument();
    expect(screen.getByText('Loading job listings...')).toBeInTheDocument();
  });

  it('displays jobs after successful API call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning Engineer')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('displays job details correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    // Check job details
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('$180,000 - $250,000')).toBeInTheDocument();
    expect(screen.getByText('5+ years')).toBeInTheDocument();
    expect(screen.getAllByText('Python')).toHaveLength(2); // Python appears in both jobs
  });

  it('displays apply button with external link', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const applyButtons = screen.getAllByText('Apply Now');
    expect(applyButtons).toHaveLength(2);

    // Check the first apply button (OpenAI)
    const openAIButton = applyButtons[0];
    expect(openAIButton.closest('a')).toHaveAttribute('href', 'https://openai.com/careers');
    expect(openAIButton.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('handles search functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search jobs, companies, or skills...');
    fireEvent.change(searchInput, { target: { value: 'OpenAI' } });

    // Wait for debounced search
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + search
    }, { timeout: 1000 });
  });

  it('handles job type filtering', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const typeFilter = screen.getByRole('button', { name: /all types/i });
    fireEvent.click(typeFilter);
    
    const remoteButton = screen.getByRole('button', { name: /remote/i });
    fireEvent.click(remoteButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + filter
    });
  });

  it('handles source filtering', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const sourceFilter = screen.getByDisplayValue('📰 All Sources');
    fireEvent.change(sourceFilter, { target: { value: 'AI Jobs' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + filter
    });
  });

  it('displays error message when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch job listings. Please try again later.')).toBeInTheDocument();
    });
  });

  it('displays refresh button and allows manual refresh', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();

    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('displays job count correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('2 Jobs Found')).toBeInTheDocument();
    });
  });

  it('displays last updated timestamp', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('handles empty job results', async () => {
    const emptyResponse = {
      ...mockApiResponse,
      jobs: [],
      total: 0
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(emptyResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No jobs found')).toBeInTheDocument();
    });

    expect(screen.getByText('Try adjusting your search criteria or filters')).toBeInTheDocument();
  });

  it('displays job tags correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    // Check that tags are displayed
    expect(screen.getAllByText('Python')).toHaveLength(2);
    expect(screen.getByText('TensorFlow')).toBeInTheDocument();
    expect(screen.getByText('PyTorch')).toBeInTheDocument();
  });

  it('displays job type badges correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    // Check for job type badges
    expect(screen.getAllByText('remote')).toHaveLength(2);
    expect(screen.getAllByText('hybrid')).toHaveLength(2);
  });

  it('displays source badges correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    // Check for source badges - there are multiple "AI Jobs" elements (option and badge)
    expect(screen.getAllByText('AI Jobs')).toHaveLength(2);
    expect(screen.getByText('Wellfound')).toBeInTheDocument();
  });

  it('handles clear filters functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(
      <BrowserRouter>
        <JobBoard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    // Set some filters first
    const searchInput = screen.getByPlaceholderText('Search jobs, companies, or skills...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Clear filters
    const clearButton = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + search + clear
    });
  });
});