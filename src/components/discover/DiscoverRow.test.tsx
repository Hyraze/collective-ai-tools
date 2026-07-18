import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DiscoverRow } from './DiscoverRow';
import type { Source } from './sources';

vi.mock('@/lib/analytics', () => ({ captureEvent: vi.fn() }));

function makeSource(over: Partial<Source>): Source {
  return {
    type: 'tool', label: 'Trending Tools', seeAllHref: '/tools',
    searchItems: async () => [],
    browseItems: async () => [{ id: 't1', type: 'tool', title: 'LangChain', subtitle: 'd', tags: [], href: 'https://x', external: true }],
    ...over,
  };
}

describe('DiscoverRow', () => {
  it('renders the row title, see-all link, and cards', async () => {
    render(<MemoryRouter><DiscoverRow source={makeSource({})} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('LangChain')).toBeInTheDocument());
    expect(screen.getByText('Trending Tools')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see all/i })).toHaveAttribute('href', '/tools');
  });

  it('renders nothing when the row fetch fails', async () => {
    const { container } = render(<MemoryRouter><DiscoverRow source={makeSource({ browseItems: async () => { throw new Error('x'); } })} /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector('section')).toBeNull());
  });

  it('renders nothing when the row fetch resolves to an empty array', async () => {
    const { container } = render(<MemoryRouter><DiscoverRow source={makeSource({ browseItems: async () => [] })} /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector('section')).toBeNull());
  });
});
