import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SearchResults } from './SearchResults';
import type { DiscoverGroup } from './types';

const groups: DiscoverGroup[] = [
  { type: 'tool', label: 'Tools', seeAllHref: '/tools', status: 'success', items: [
    { id: 't1', type: 'tool', title: 'LangChain', subtitle: 'd', tags: [], href: 'https://x', external: true },
  ] },
  { type: 'mcp', label: 'MCP Servers', seeAllHref: '/mcp-catalog', status: 'error', items: [] },
  { type: 'prompt', label: 'Prompts', seeAllHref: '/prompts', status: 'empty', items: [] },
];

vi.mock('./useDiscoverSearch', () => ({ useDiscoverSearch: () => ({ groups, isLoading: false }) }));
vi.mock('@/lib/analytics', () => ({ captureEvent: vi.fn() }));

describe('SearchResults', () => {
  it('renders a success group with count, card, and see-all link', () => {
    render(<MemoryRouter><SearchResults query="lang" /></MemoryRouter>);
    expect(screen.getByText(/Tools/)).toBeInTheDocument();
    expect(screen.getByText('LangChain')).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /see all/i });
    const toolsLink = links.find(l => l.getAttribute('href') === '/tools');
    expect(toolsLink).toHaveAttribute('href', '/tools');
  });

  it('shows an inline error for a failed group', () => {
    render(<MemoryRouter><SearchResults query="lang" /></MemoryRouter>);
    expect(screen.getByText(/couldn't load mcp servers/i)).toBeInTheDocument();
  });

  it('shows quiet empty copy for an empty group', () => {
    render(<MemoryRouter><SearchResults query="lang" /></MemoryRouter>);
    expect(screen.getByText(/no prompts match/i)).toBeInTheDocument();
  });
});
