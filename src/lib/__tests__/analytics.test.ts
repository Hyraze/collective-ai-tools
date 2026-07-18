import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const initMock = vi.fn();
const captureMock = vi.fn();

vi.mock('posthog-js', () => ({
  default: { init: initMock, capture: captureMock },
}));

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    initMock.mockClear();
    captureMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not init or throw when no key is configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const { initAnalytics, captureEvent } = await import('../analytics');

    initAnalytics();
    await expect(captureEvent('tool_click')).resolves.toBeUndefined();

    expect(initMock).not.toHaveBeenCalled();
    expect(captureMock).not.toHaveBeenCalled();
  });

  it('inits cookieless (memory persistence) when a key is present', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
    const { initAnalytics, captureEvent } = await import('../analytics');

    initAnalytics();
    await captureEvent('tool_click', { tool: 'x' });

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({ persistence: 'memory' }),
    );
    expect(captureMock).toHaveBeenCalledWith('tool_click', { tool: 'x' });
  });

  it('captures a SPA pageview with the route path', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
    const { capturePageview } = await import('../analytics');

    await capturePageview('/tools');

    expect(captureMock).toHaveBeenCalledWith(
      '$pageview',
      expect.objectContaining({ path: '/tools' }),
    );
  });

  it('inits only once across multiple calls', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
    const { initAnalytics, captureEvent, capturePageview } = await import('../analytics');

    initAnalytics();
    await captureEvent('a');
    await capturePageview('/b');

    expect(initMock).toHaveBeenCalledTimes(1);
  });
});
