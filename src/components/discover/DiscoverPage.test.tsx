import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DiscoverPage from './DiscoverPage';

vi.mock('./SearchResults', () => ({ SearchResults: ({ query }: { query: string }) => <div>results:{query}</div> }));
vi.mock('./DiscoverBrowse', () => ({ DiscoverBrowse: () => <div>browse</div> }));
vi.mock('@/components/SEO', () => ({ default: () => null }));
vi.mock('@/lib/analytics', () => ({ captureEvent: vi.fn() }));

describe('DiscoverPage', () => {
  it('shows the browse grid when there is no query', () => {
    render(<MemoryRouter initialEntries={['/']}><DiscoverPage /></MemoryRouter>);
    expect(screen.getByText('browse')).toBeInTheDocument();
    expect(screen.queryByText(/^results:/)).toBeNull();
  });

  it('shows search results when q is present', () => {
    render(<MemoryRouter initialEntries={['/?q=langchain']}><DiscoverPage /></MemoryRouter>);
    expect(screen.getByText('results:langchain')).toBeInTheDocument();
    expect(screen.queryByText('browse')).toBeNull();
  });

  it('shows the browse grid when q is whitespace-only', () => {
    render(<MemoryRouter initialEntries={['/?q=%20%20']}><DiscoverPage /></MemoryRouter>);
    expect(screen.getByText('browse')).toBeInTheDocument();
    expect(screen.queryByText(/^results:/)).toBeNull();
  });
});
