import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscoverBrowse } from './DiscoverBrowse';

vi.mock('./sources', () => ({
  SOURCES: [
    {
      type: 'tool', label: 'Tools', seeAllHref: '/tools',
      searchItems: async () => [],
      browseItems: async (_signal: AbortSignal, sort: string) => [
        { id: 't1', type: 'tool', title: sort === 'newest' ? 'Tool New' : 'Tool One', subtitle: '', tags: [], href: '#', external: true },
      ],
    },
    {
      type: 'repo', label: 'Repos', seeAllHref: '/trending',
      searchItems: async () => [],
      browseItems: async () => [{ id: 'r1', type: 'repo', title: 'Repo One', subtitle: '', tags: [], href: '#', external: true }],
    },
  ],
}));

vi.mock('./DiscoverCard', () => ({ DiscoverCard: ({ item }: any) => <div>card:{item.title}</div> }));
vi.mock('@/lib/analytics', () => ({ captureEvent: vi.fn() }));

describe('DiscoverBrowse', () => {
  it('shows all types in the grid by default', async () => {
    render(<DiscoverBrowse />);
    expect(await screen.findByText('card:Tool One')).toBeInTheDocument();
    expect(screen.getByText('card:Repo One')).toBeInTheDocument();
  });

  it('filters the grid to a single type when a filter is selected', async () => {
    const user = userEvent.setup();
    render(<DiscoverBrowse />);
    await screen.findByText('card:Tool One');

    await user.click(screen.getByRole('button', { name: /^Repos/ }));

    expect(screen.getByText('card:Repo One')).toBeInTheDocument();
    expect(screen.queryByText('card:Tool One')).toBeNull();
  });

  it('re-fetches with the chosen sort when the sort control changes', async () => {
    const user = userEvent.setup();
    render(<DiscoverBrowse />);
    await screen.findByText('card:Tool One');

    await user.click(screen.getByRole('button', { name: 'Newest' }));

    expect(await screen.findByText('card:Tool New')).toBeInTheDocument();
    expect(screen.queryByText('card:Tool One')).toBeNull();
  });
});
