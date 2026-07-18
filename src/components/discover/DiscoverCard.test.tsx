import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DiscoverCard } from './DiscoverCard';

vi.mock('@/lib/analytics', () => ({ captureEvent: vi.fn() }));

const base = { id: '1', title: 'LangChain', subtitle: 'LLM framework', tags: ['llm'], meta: 'Developer' };

function renderCard(item: any) {
  return render(<MemoryRouter><DiscoverCard item={item} /></MemoryRouter>);
}

describe('DiscoverCard', () => {
  it('renders an external anchor with safe rel for external items', () => {
    renderCard({ ...base, type: 'tool', href: 'https://langchain.com', external: true });
    const link = screen.getByRole('link', { name: /LangChain/i });
    expect(link).toHaveAttribute('href', 'https://langchain.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders an internal router link for internal items', () => {
    renderCard({ ...base, type: 'mcp', href: '/mcp-catalog/x', external: false });
    expect(screen.getByRole('link', { name: /LangChain/i })).toHaveAttribute('href', '/mcp-catalog/x');
  });

  it('shows the type badge and meta', () => {
    renderCard({ ...base, type: 'tool', href: 'https://x', external: true });
    expect(screen.getByText('tool')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });
});
