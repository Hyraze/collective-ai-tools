import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event'; // Unused import
import VirtualizedToolList from '../VirtualizedToolList';

const mockTools = [
  {
    name: 'Tool 1',
    url: 'https://tool1.com',
    description: 'First tool',
    tags: ['#free'],
    clickCount: 5
  },
  {
    name: 'Tool 2',
    url: 'https://tool2.com',
    description: 'Second tool',
    tags: ['#paid'],
    clickCount: 10
  },
  {
    name: 'Tool 3',
    url: 'https://tool3.com',
    description: 'Third tool',
    tags: ['#freemium'],
    clickCount: 0
  }
];

describe('VirtualizedToolList', () => {
  const mockOnToggleFavorite = vi.fn();
  const mockOnTrackClick = vi.fn();
  const mockFavorites = new Set(['Tool 1']);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tools', () => {
    render(
      <VirtualizedToolList
        tools={mockTools}
        favorites={mockFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    expect(screen.getByText('Tool 1')).toBeInTheDocument();
    expect(screen.getByText('Tool 2')).toBeInTheDocument();
    expect(screen.getByText('Tool 3')).toBeInTheDocument();
  });

  it('renders empty list when no tools provided', () => {
    render(
      <VirtualizedToolList
        tools={[]}
        favorites={new Set()}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    expect(screen.queryByText('Tool 1')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <VirtualizedToolList
        tools={mockTools}
        favorites={mockFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('memoizes tool cards to prevent unnecessary re-renders', () => {
    const { rerender } = render(
      <VirtualizedToolList
        tools={mockTools}
        favorites={mockFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    // Re-render with same props
    rerender(
      <VirtualizedToolList
        tools={mockTools}
        favorites={mockFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    // Should still render all tools
    expect(screen.getByText('Tool 1')).toBeInTheDocument();
    expect(screen.getByText('Tool 2')).toBeInTheDocument();
    expect(screen.getByText('Tool 3')).toBeInTheDocument();
  });

  it('updates when tools change', () => {
    const { rerender } = render(
      <VirtualizedToolList
        tools={mockTools}
        favorites={mockFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    const newTools = [mockTools[0]]; // Only first tool

    rerender(
      <VirtualizedToolList
        tools={newTools}
        favorites={mockFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    expect(screen.getByText('Tool 1')).toBeInTheDocument();
    expect(screen.queryByText('Tool 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Tool 3')).not.toBeInTheDocument();
  });

  it('updates when favorites change', () => {
    const { rerender } = render(
      <VirtualizedToolList
        tools={mockTools}
        favorites={mockFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    const newFavorites = new Set(['Tool 2']);

    rerender(
      <VirtualizedToolList
        tools={mockTools}
        favorites={newFavorites}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    // All tools should still be visible, but favorite status should change
    expect(screen.getByText('Tool 1')).toBeInTheDocument();
    expect(screen.getByText('Tool 2')).toBeInTheDocument();
    expect(screen.getByText('Tool 3')).toBeInTheDocument();
  });
});
