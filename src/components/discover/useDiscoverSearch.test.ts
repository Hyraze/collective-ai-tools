import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDiscoverSearch } from './useDiscoverSearch';

const fetchMock = vi.mocked(global.fetch);

function ok(json: any) {
  return Promise.resolve({ ok: true, json: async () => json } as Response);
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation((input: any) => {
    const url = String(input);
    if (url.includes('/api/ai-tools')) return ok({ data: [{ _id: 't1', name: 'LangChain', description: 'd', url: 'https://x', tags: [] }] });
    if (url.includes('/api/mcp')) return ok({ data: [{ _id: 'm', id: 'mcp1', name: 'MCP', description: 'd', tags: [] }] });
    if (url.includes('/api/prompts')) return ok({ prompts: [{ _id: 'p1', title: 'P', content: 'c', tags: [] }] });
    if (url.includes('/api/skills')) return ok({ data: [{ id: 's1', name: 'S', description: 'd', repo: 'https://r', tags: [] }] });
    if (url.includes('/api/trending-repos')) return ok({ data: [{ title: 'langchain-repo', link: 'https://g', description: 'd', language: 'Python' }] });
    return ok({});
  });
});

afterEach(() => vi.useRealTimers());

describe('useDiscoverSearch', () => {
  it('does not fetch on empty query', () => {
    const { result } = renderHook(() => useDiscoverSearch(''));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.groups.every(g => g.status === 'idle')).toBe(true);
  });

  it('federates all sources and marks each group success', async () => {
    const { result } = renderHook(() => useDiscoverSearch('langchain'));
    await waitFor(() => expect(result.current.groups.every(g => g.status === 'success')).toBe(true));
    const tool = result.current.groups.find(g => g.type === 'tool')!;
    expect(tool.items[0].title).toBe('LangChain');
  });

  it('isolates a failing source without breaking the others', async () => {
    fetchMock.mockImplementation((input: any) => {
      const url = String(input);
      if (url.includes('/api/mcp')) return Promise.reject(new Error('boom'));
      if (url.includes('/api/ai-tools')) return ok({ data: [{ _id: 't1', name: 'T', description: 'd', url: 'https://x', tags: [] }] });
      return ok({ data: [], prompts: [] });
    });
    const { result } = renderHook(() => useDiscoverSearch('x'));
    await waitFor(() => {
      const mcp = result.current.groups.find(g => g.type === 'mcp')!;
      expect(mcp.status).toBe('error');
    });
    expect(result.current.groups.find(g => g.type === 'tool')!.status).toBe('success');
  });

  it('marks a group empty when it returns no items', async () => {
    fetchMock.mockImplementation(() => ok({ data: [], prompts: [] }));
    const { result } = renderHook(() => useDiscoverSearch('zzz'));
    await waitFor(() => expect(result.current.groups.every(g => g.status === 'empty')).toBe(true));
  });

  it('ignores a stale response from a superseded query (abort race)', async () => {
    vi.useFakeTimers();

    // Alpha's tool fetch is held open deliberately: we control exactly when it resolves.
    let resolveAlpha!: (value: Response) => void;
    const alphaFetch = new Promise<Response>(resolve => { resolveAlpha = resolve; });

    fetchMock.mockImplementation((input: any) => {
      const url = String(input);
      if (url.includes('/api/ai-tools')) {
        if (url.includes(`search=${encodeURIComponent('alpha')}`)) return alphaFetch;
        if (url.includes(`search=${encodeURIComponent('beta')}`)) {
          return ok({ data: [{ _id: 'tB', name: 'Beta Tool', description: 'd', url: 'https://y', tags: [] }] });
        }
      }
      if (url.includes('/api/mcp')) return ok({ data: [] });
      if (url.includes('/api/prompts')) return ok({ prompts: [] });
      if (url.includes('/api/skills')) return ok({ data: [] });
      if (url.includes('/api/trending-repos')) return ok({ data: [] });
      return ok({});
    });

    const { result, rerender } = renderHook(
      ({ query }) => useDiscoverSearch(query),
      { initialProps: { query: 'alpha' } }
    );

    // Let alpha's debounce elapse and its fetch begin — it stays pending, not resolved yet.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    // The query changes before alpha resolves — this aborts alpha's AbortController
    // (cleanup of the effect calls controller.abort()).
    rerender({ query: 'beta' });

    // Let beta's debounce elapse and its fetch resolve normally.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    const toolAfterBeta = result.current.groups.find(g => g.type === 'tool')!;
    expect(toolAfterBeta.status).toBe('success');
    expect(toolAfterBeta.items[0].title).toBe('Beta Tool');

    // Now resolve alpha's stale response late. Since its controller was aborted,
    // the `if (controller.signal.aborted) return;` guard must discard it instead
    // of overwriting beta's groups.
    await act(async () => {
      resolveAlpha({
        ok: true,
        json: async () => ({ data: [{ _id: 'tA', name: 'Alpha Tool', description: 'd', url: 'https://x', tags: [] }] }),
      } as Response);
      await vi.advanceTimersByTimeAsync(0);
    });

    const toolAfterStaleAlpha = result.current.groups.find(g => g.type === 'tool')!;
    expect(toolAfterStaleAlpha.items[0].title).toBe('Beta Tool');
    expect(toolAfterStaleAlpha.status).toBe('success');
  });
});
