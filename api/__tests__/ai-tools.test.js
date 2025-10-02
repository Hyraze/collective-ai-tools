/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Set up environment variable before importing the handler
process.env.GEMINI_API_KEY = 'test-api-key';

import handler from '../ai-tools/index.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('AI Tools API', () => {
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

  const createMockRequest = (body = {}) => ({
    method: 'POST',
    body,
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

  it('should reject non-POST requests', async () => {
    const req = { method: 'GET' };
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should require tool parameter', async () => {
    const req = createMockRequest({});
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Tool parameter is required' });
  });

  it('should require Gemini API key', async () => {
    const originalApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    
    const req = createMockRequest({ tool: 'workflow-builder' });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Gemini API key not configured' });
    
    // Restore the API key for other tests
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  it('should handle workflow-builder tool', async () => {
    const req = createMockRequest({
      tool: 'workflow-builder',
      request: {
        name: 'Test Workflow',
        description: 'A test workflow'
      }
    });
    const res = createMockResponse();

    // Mock Gemini API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                name: 'Test Workflow',
                description: 'A test workflow',
                nodes: [
                  {
                    id: 'node1',
                    type: 'input',
                    name: 'Input Node',
                    description: 'Input node',
                    position: { x: 100, y: 100 },
                    size: { width: 200, height: 100 },
                    config: { inputType: 'text' }
                  }
                ],
                connections: []
              })
            }]
          }
        }]
      })
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        workflow: expect.objectContaining({
          name: expect.any(String),
          nodes: expect.any(Array),
          connections: expect.any(Array)
        })
      })
    );
  });

  it('should handle ai-agent-creator tool', async () => {
    const req = createMockRequest({
      tool: 'ai-agent-creator',
      request: {
        name: 'Test Agent',
        description: 'A test AI agent'
      }
    });
    const res = createMockResponse();

    // Mock Gemini API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                name: 'Test Agent',
                description: 'A test AI agent',
                capabilities: ['Natural language processing'],
                personality: { tone: 'professional' },
                tools: [],
                knowledge: { domains: ['AI'] }
              })
            }]
          }
        }]
      })
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        agent: expect.objectContaining({
          name: expect.any(String),
          capabilities: expect.any(Array),
          personality: expect.any(Object)
        })
      })
    );
  });

  it('should handle code-analyzer tool', async () => {
    const req = createMockRequest({
      tool: 'code-analyzer',
      request: {
        code: 'function test() { return "hello"; }'
      }
    });
    const res = createMockResponse();

    // Mock Gemini API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: 'Code analysis: The function is well-structured and returns a string.'
            }]
          }
        }]
      })
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        results: expect.objectContaining({
          quality: expect.any(Object),
          performance: expect.any(Object),
          security: expect.any(Object)
        })
      })
    );
  });

  it('should handle workflow-analyzer tool', async () => {
    const req = createMockRequest({
      tool: 'workflow-analyzer',
      request: {
        workflow: {
          nodes: [{ id: 'node1', type: 'input' }],
          connections: []
        }
      }
    });
    const res = createMockResponse();

    // Mock Gemini API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                workflow_analysis: {
                  complexity: 'simple',
                  efficiency_score: 90
                }
              })
            }]
          }
        }]
      })
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis: expect.objectContaining({
          workflow_analysis: expect.any(Object)
        })
      })
    );
  });

  it('should handle data-fusion tool', async () => {
    const req = createMockRequest({
      tool: 'data-fusion',
      request: {
        sources: [
          { name: 'source1', data: [1, 2, 3] },
          { name: 'source2', data: [4, 5, 6] }
        ]
      }
    });
    const res = createMockResponse();

    // Mock Gemini API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                insights: [
                  {
                    id: 'insight-1',
                    title: 'Data Correlation',
                    description: 'Strong correlation found',
                    confidence: 0.95
                  }
                ]
              })
            }]
          }
        }]
      })
    });

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        analysis: expect.objectContaining({
          insights: expect.any(Array)
        })
      })
    );
  });

  it('should handle unknown tool', async () => {
    const req = createMockRequest({
      tool: 'unknown-tool',
      request: {}
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unknown tool' });
  });

  it('should handle Gemini API errors', async () => {
    const req = createMockRequest({
      tool: 'workflow-builder',
      request: { name: 'Test' }
    });
    const res = createMockResponse();

    // Mock Gemini API error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error'
      })
    );
  });

  it('should handle malformed Gemini API response', async () => {
    const req = createMockRequest({
      tool: 'workflow-builder',
      request: { name: 'Test' }
    });
    const res = createMockResponse();

    // Mock malformed response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: 'Invalid JSON response'
            }]
          }
        }]
      })
    });

    await handler(req, res);

    // Should fall back to default workflow structure
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        workflow: expect.objectContaining({
          name: expect.any(String),
          nodes: expect.any(Array)
        })
      })
    );
  });

  it('should set CORS headers', async () => {
    const req = createMockRequest({
      tool: 'workflow-builder',
      request: { name: 'Test' }
    });
    const res = createMockResponse();

    // Mock Gemini API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                name: 'Test Workflow',
                nodes: [],
                connections: []
              })
            }]
          }
        }]
      })
    });

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
  });

  it('should include error details in development mode', async () => {
    process.env.NODE_ENV = 'development';
    
    const req = createMockRequest({
      tool: 'workflow-builder',
      request: { name: 'Test' }
    });
    const res = createMockResponse();

    // Mock Gemini API error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        details: 'Network error'
      })
    );
  });

  it('should not include error details in production mode', async () => {
    process.env.NODE_ENV = 'production';
    
    const req = createMockRequest({
      tool: 'workflow-builder',
      request: { name: 'Test' }
    });
    const res = createMockResponse();

    // Mock Gemini API error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error'
      })
    );
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.any(String)
      })
    );
  });
});
