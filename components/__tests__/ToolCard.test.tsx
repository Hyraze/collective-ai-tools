import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToolCard from '../ToolCard';

const mockTool = {
  name: 'Test AI Tool',
  url: 'https://example.com',
  description: 'A test AI tool for testing purposes',
  tags: ['#free', '#productivity'],
  clickCount: 5,
  addedDate: '2024-01-01T00:00:00Z'
};

describe('ToolCard', () => {
  const mockOnToggleFavorite = vi.fn();
  const mockOnTrackClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tool information correctly', () => {
    render(
      <ToolCard
        tool={mockTool}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    expect(screen.getByText('Test AI Tool')).toBeInTheDocument();
    expect(screen.getByText('A test AI tool for testing purposes')).toBeInTheDocument();
    expect(screen.getByText('#free')).toBeInTheDocument();
    expect(screen.getByText('#productivity')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows favorite star when tool is favorited', () => {
    render(
      <ToolCard
        tool={mockTool}
        isFavorite={true}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    const starButton = screen.getByLabelText('Remove from favorites');
    expect(starButton).toBeInTheDocument();
  });

  it('calls onToggleFavorite when star is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ToolCard
        tool={mockTool}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    const starButton = screen.getByLabelText('Add to favorites');
    await user.click(starButton);

    expect(mockOnToggleFavorite).toHaveBeenCalledWith('Test AI Tool');
  });

  it('calls onTrackClick when card is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ToolCard
        tool={mockTool}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    const cardLink = screen.getByLabelText('Visit Test AI Tool');
    await user.click(cardLink);

    expect(mockOnTrackClick).toHaveBeenCalledWith('https://example.com');
  });

  it('prevents card navigation when star is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ToolCard
        tool={mockTool}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    const starButton = screen.getByLabelText('Add to favorites');
    await user.click(starButton);

    // onTrackClick should not be called when star is clicked
    expect(mockOnTrackClick).not.toHaveBeenCalled();
  });

  it('adds tracking parameters to URL', () => {
    render(
      <ToolCard
        tool={mockTool}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    const cardLink = screen.getByLabelText('Visit Test AI Tool');
    expect(cardLink).toHaveAttribute('href', expect.stringContaining('utm_source=collectiveai.tools'));
  });

  it('handles tools without click count', () => {
    const toolWithoutClicks = { ...mockTool, clickCount: undefined };
    
    render(
      <ToolCard
        tool={toolWithoutClicks}
        isFavorite={false}
        onToggleFavorite={mockOnToggleFavorite}
        onTrackClick={mockOnTrackClick}
      />
    );

    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });
});
