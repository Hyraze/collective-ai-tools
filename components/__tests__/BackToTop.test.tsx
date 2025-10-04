/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BackToTop from '../BackToTop';

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

describe('BackToTop', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
    // Reset scroll position
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when page is at top', () => {
    render(<BackToTop />);
    const button = screen.queryByRole('button', { name: /back to top/i });
    expect(button).not.toBeInTheDocument();
  });

  it('should render when scrolled past threshold', () => {
    render(<BackToTop showAfter={300} />);
    
    // Simulate scroll past threshold
    Object.defineProperty(window, 'pageYOffset', {
      value: 400,
      writable: true,
    });
    
    fireEvent.scroll(window);
    
    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toBeInTheDocument();
  });

  it('should scroll to top when clicked', () => {
    render(<BackToTop showAfter={100} />);
    
    // Simulate scroll past threshold
    Object.defineProperty(window, 'pageYOffset', {
      value: 200,
      writable: true,
    });
    
    fireEvent.scroll(window);
    
    const button = screen.getByRole('button', { name: /back to top/i });
    fireEvent.click(button);
    
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should apply custom className', () => {
    render(<BackToTop showAfter={100} className="custom-class" />);
    
    // Simulate scroll past threshold
    Object.defineProperty(window, 'pageYOffset', {
      value: 200,
      writable: true,
    });
    
    fireEvent.scroll(window);
    
    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<BackToTop showAfter={100} />);
    
    // Simulate scroll past threshold
    Object.defineProperty(window, 'pageYOffset', {
      value: 200,
      writable: true,
    });
    
    fireEvent.scroll(window);
    
    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toHaveAttribute('aria-label', 'Back to top');
    expect(button).toHaveAttribute('title', 'Back to top');
  });
});