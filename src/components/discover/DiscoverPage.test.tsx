import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DiscoverPage from './DiscoverPage';

vi.mock('./SearchResults', () => ({ SearchResults: ({ query }: { query: string }) => <div>results:{query}</div> }));
vi.mock('./DiscoverRow', () => ({ DiscoverRow: ({ source }: any) => <div>row:{source.type}</div> }));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('@/lib/analytics', () => ({ captureEvent: vi.fn() }));

describe('DiscoverPage', () => {
  it('shows browse rows when there is no query', () => {
    render(<MemoryRouter initialEntries={['/']}><DiscoverPage /></MemoryRouter>);
    expect(screen.getByText('row:tool')).toBeInTheDocument();
    expect(screen.getByText('row:repo')).toBeInTheDocument();
    expect(screen.queryByText(/^results:/)).toBeNull();
  });

  it('shows search results when q is present', () => {
    render(<MemoryRouter initialEntries={['/?q=langchain']}><DiscoverPage /></MemoryRouter>);
    expect(screen.getByText('results:langchain')).toBeInTheDocument();
    expect(screen.queryByText(/^row:/)).toBeNull();
  });
});
