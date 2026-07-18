import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const AUTH_HINT_KEY = 'ct-auth-hint';

// test/setup.ts replaces localStorage/fetch with spy mocks (no real persistence),
// so we drive return values explicitly and assert on the spy calls.
const getItem = vi.mocked(localStorage.getItem);
const removeItem = vi.mocked(localStorage.removeItem);
const fetchMock = vi.mocked(global.fetch);

function Probe() {
  const { loading, user } = useAuth();
  return <div>{loading ? 'loading' : user ? `user:${user.email}` : 'anonymous'}</div>;
}

describe('AuthContext session gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    getItem.mockReturnValue(null); // no session hint by default
  });

  it('does NOT call /api/auth/me when there is no session hint', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls /api/auth/me when a session hint is present', async () => {
    getItem.mockReturnValue('1');
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ user: { id: '1', email: 'a@b.co' } }),
    } as unknown as Response);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('user:a@b.co')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me');
  });

  it('clears a stale hint when /api/auth/me returns 401', async () => {
    getItem.mockReturnValue('1');
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as unknown as Response);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
    expect(removeItem).toHaveBeenCalledWith(AUTH_HINT_KEY);
  });
});
