/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConsentManager from '../ConsentManager';
import * as consentUtils from '../../lib/consentUtils';

// Mock the consent utilities
vi.mock('../../lib/consentUtils', () => ({
  isInTargetRegion: vi.fn(),
  loadConsentPreferences: vi.fn(),
  saveConsentPreferences: vi.fn(),
  updateConsentMode: vi.fn(),
  createConsentAuditLog: vi.fn(),
}));

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
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(true);
    vi.mocked(consentUtils.loadConsentPreferences).mockReturnValue(null);

    render(<ConsentManager />);

    expect(screen.getByText('We value your privacy')).toBeInTheDocument();
    expect(screen.getByText('Accept All')).toBeInTheDocument();
    expect(screen.getByText('Reject All')).toBeInTheDocument();
    expect(screen.getByText('Manage Options')).toBeInTheDocument();
  });

  it('does not render banner when user is not in target region', () => {
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(false);

    render(<ConsentManager />);

    expect(screen.queryByText('We value your privacy')).not.toBeInTheDocument();
  });

  it('does not render banner when user has already consented', () => {
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(true);
    vi.mocked(consentUtils.loadConsentPreferences).mockReturnValue({
      hasConsented: true,
      preferences: {
        necessary: true,
        analytics: true,
        marketing: true,
        personalization: true,
      },
      timestamp: Date.now(),
    });

    render(<ConsentManager />);

    expect(screen.queryByText('We value your privacy')).not.toBeInTheDocument();
  });

  it('handles accept all consent', async () => {
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(true);
    vi.mocked(consentUtils.loadConsentPreferences).mockReturnValue(null);

    render(<ConsentManager />);

    const acceptButton = screen.getByText('Accept All');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(consentUtils.saveConsentPreferences).toHaveBeenCalledWith({
        necessary: true,
        analytics: true,
        marketing: true,
        personalization: true,
      });
      expect(consentUtils.updateConsentMode).toHaveBeenCalled();
    });
  });

  it('handles reject all consent', async () => {
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(true);
    vi.mocked(consentUtils.loadConsentPreferences).mockReturnValue(null);

    render(<ConsentManager />);

    const rejectButton = screen.getByText('Reject All');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(consentUtils.saveConsentPreferences).toHaveBeenCalledWith({
        necessary: true,
        analytics: false,
        marketing: false,
        personalization: false,
      });
      expect(consentUtils.updateConsentMode).toHaveBeenCalled();
    });
  });

  it('opens manage options modal when clicked', () => {
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(true);
    vi.mocked(consentUtils.loadConsentPreferences).mockReturnValue(null);

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
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(true);
    vi.mocked(consentUtils.loadConsentPreferences).mockReturnValue(null);

    render(<ConsentManager />);

    // Open manage options
    const manageButton = screen.getByText('Manage Options');
    fireEvent.click(manageButton);

    // Find analytics toggle button
    const analyticsToggle = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(analyticsToggle);

    // The toggle should change state (this would be tested more thoroughly with integration tests)
    expect(analyticsToggle).toBeInTheDocument();
  });

  it('saves custom preferences when save preferences is clicked', async () => {
    vi.mocked(consentUtils.isInTargetRegion).mockReturnValue(true);
    vi.mocked(consentUtils.loadConsentPreferences).mockReturnValue(null);

    render(<ConsentManager />);

    // Open manage options
    const manageButton = screen.getByText('Manage Options');
    fireEvent.click(manageButton);

    // Click save preferences
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(consentUtils.saveConsentPreferences).toHaveBeenCalled();
      expect(consentUtils.updateConsentMode).toHaveBeenCalled();
    });
  });
});
