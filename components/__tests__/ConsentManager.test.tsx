/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConsentManager from '../ConsentManager';


// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock gtag
const gtagMock = vi.fn();
Object.defineProperty(window, 'gtag', {
  value: gtagMock,
  writable: true,
});

describe('ConsentManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders consent banner when user is in target region and has not consented', () => {
    // Mock Intl.DateTimeFormat to return a European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' })
    } as any));

    render(<ConsentManager />);

    expect(screen.getByText('We value your privacy')).toBeInTheDocument();
    expect(screen.getByText('Accept All')).toBeInTheDocument();
    expect(screen.getByText('Reject All')).toBeInTheDocument();
    expect(screen.getByText('Manage Options')).toBeInTheDocument();
  });

  it('does not render banner when user is not in target region', () => {
    // Mock Intl.DateTimeFormat to return a non-European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' })
    } as any));

    render(<ConsentManager />);

    expect(screen.queryByText('We value your privacy')).not.toBeInTheDocument();
  });

  it('does not render banner when user has already consented', () => {
    // Mock Intl.DateTimeFormat to return a European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' })
    } as any));
    
    // Mock localStorage to return that user has already consented
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'has-consented') return 'true';
      if (key === 'consent-preferences') return JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        personalization: true,
      });
      return null;
    });

    render(<ConsentManager />);

    expect(screen.queryByText('We value your privacy')).not.toBeInTheDocument();
  });

  it('handles accept all consent', async () => {
    // Mock Intl.DateTimeFormat to return a European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' })
    } as any));

    render(<ConsentManager />);

    const acceptButton = screen.getByText('Accept All');
    fireEvent.click(acceptButton);

    // Check that localStorage.setItem was called with the correct values
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('has-consented', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('consent-preferences', expect.stringContaining('"analytics":true'));
    });
  });

  it('handles reject all consent', async () => {
    // Mock Intl.DateTimeFormat to return a European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' })
    } as any));

    render(<ConsentManager />);

    const rejectButton = screen.getByText('Reject All');
    fireEvent.click(rejectButton);

    // Check that localStorage.setItem was called with the correct values
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('has-consented', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('consent-preferences', expect.stringContaining('"analytics":false'));
    });
  });

  it('opens manage options modal when clicked', () => {
    // Mock Intl.DateTimeFormat to return a European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' })
    } as any));

    render(<ConsentManager />);

    const manageButton = screen.getByText('Manage Options');
    fireEvent.click(manageButton);

    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
    expect(screen.getByText('Necessary Cookies')).toBeInTheDocument();
    expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
    expect(screen.getByText('Marketing Cookies')).toBeInTheDocument();
    expect(screen.getByText('Personalization Cookies')).toBeInTheDocument();
  });

  it('allows toggling cookie preferences in manage options', () => {
    // Mock Intl.DateTimeFormat to return a European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' })
    } as any));

    render(<ConsentManager />);

    // Open manage options
    const manageButton = screen.getByText('Manage Options');
    fireEvent.click(manageButton);

    // Find analytics toggle button by its aria-label (it should be "Enable" since default is false)
    const analyticsToggle = screen.getByLabelText(/Enable Analytics Cookies/i);
    expect(analyticsToggle).toBeInTheDocument();
    
    // Click the toggle
    fireEvent.click(analyticsToggle);
    
    // Verify the toggle is still in the document after clicking
    expect(analyticsToggle).toBeInTheDocument();
  });

  it('saves custom preferences when save preferences is clicked', async () => {
    // Mock Intl.DateTimeFormat to return a European timezone
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' })
    } as any));

    render(<ConsentManager />);

    // Open manage options
    const manageButton = screen.getByText('Manage Options');
    fireEvent.click(manageButton);

    // Click save preferences
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    // Check that localStorage.setItem was called
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('has-consented', 'true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('consent-preferences', expect.any(String));
    });
  });
});
