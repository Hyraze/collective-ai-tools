/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../jobs/index.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('Jobs API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    vi.clearAllMocks();
  });

  const createMockRequest = (query = {}) => ({
    method: 'GET',
    query,
  });

  const createMockResponse = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
    };
    return res;
  };

  it('should handle OPTIONS request', async () => {
    const req = { method: 'OPTIONS' };
    const res = createMockResponse();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('should reject non-GET requests', async () => {
    const req = { method: 'POST' };
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return jobs with default parameters', async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    // Mock successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: expect.any(Array),
        total: expect.any(Number),
        lastUpdated: expect.any(String),
        sources: expect.any(Array),
        dataSource: expect.any(String),
        activeFeeds: expect.any(Array),
      })
    );
  });

  it('should filter jobs by type', async () => {
    const req = createMockRequest({ type: 'remote' });
    const res = createMockResponse();

    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: expect.any(Array),
        total: expect.any(Number),
      })
    );
  });

  it('should filter jobs by source', async () => {
    const req = createMockRequest({ source: 'AI Jobs' });
    const res = createMockResponse();

    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: expect.any(Array),
        total: expect.any(Number),
      })
    );
  });

  it('should filter jobs by search term', async () => {
    const req = createMockRequest({ search: 'Python' });
    const res = createMockResponse();

    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: expect.any(Array),
        total: expect.any(Number),
      })
    );
  });

  it('should use mock data when useRSS=false', async () => {
    const req = createMockRequest({ useRSS: 'false' });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: expect.any(Array),
        total: expect.any(Number),
        dataSource: 'Mock Data',
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    // Mock API failures
    mockFetch.mockRejectedValue(new Error('Network error'));

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: expect.any(Array),
        total: expect.any(Number),
        dataSource: 'Mock Data',
      })
    );
  });

  it('should handle malformed API responses', async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    // Mock malformed responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('invalid xml'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('invalid xml'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('invalid xml'),
      });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: expect.any(Array),
        total: expect.any(Number),
      })
    );
  });

  it('should set CORS headers', async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      });

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
  });

  it('should include active feeds information', async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      });

    await handler(req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.activeFeeds).toBeDefined();
    expect(Array.isArray(responseData.activeFeeds)).toBe(true);
    expect(responseData.activeFeeds.length).toBeGreaterThan(0);
  });

  it('should include sources information', async () => {
    const req = createMockRequest();
    const res = createMockResponse();

    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<rss><channel></channel></rss>'),
      });

    await handler(req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.sources).toBeDefined();
    expect(Array.isArray(responseData.sources)).toBe(true);
  });
});
