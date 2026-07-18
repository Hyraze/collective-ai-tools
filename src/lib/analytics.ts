/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import type { PostHog } from 'posthog-js';

/**
 * Privacy-first, cookieless analytics wrapper around PostHog.
 *
 * - Loads `posthog-js` lazily via dynamic import so it stays out of the initial
 *   bundle and off the critical render path (LCP).
 * - Uses in-memory persistence: no cookies and no localStorage, so no cookie
 *   consent banner is required.
 * - No-ops silently when `VITE_POSTHOG_KEY` is not configured, so the site runs
 *   identically with analytics disabled.
 */

const DEFAULT_HOST = 'https://us.i.posthog.com';

let clientPromise: Promise<PostHog | null> | null = null;

async function loadClient(): Promise<PostHog | null> {
  if (typeof window === 'undefined') return null;

  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return null;

  const host = import.meta.env.VITE_POSTHOG_HOST || DEFAULT_HOST;

  const { default: posthog } = await import('posthog-js');
  posthog.init(key, {
    api_host: host,
    persistence: 'memory', // cookieless — no consent banner needed
    capture_pageview: false, // SPA: pageviews are driven manually per route
    autocapture: true,
    disable_session_recording: true,
    person_profiles: 'identified_only',
  });

  return posthog;
}

function getClient(): Promise<PostHog | null> {
  if (!clientPromise) clientPromise = loadClient();
  return clientPromise;
}

/**
 * Kick off the lazy load + init once. Safe to call repeatedly.
 */
export function initAnalytics(): void {
  if (clientPromise) return;
  clientPromise = loadClient();
}

/**
 * Record a single-page-app route change as a pageview.
 */
export async function capturePageview(path: string): Promise<void> {
  const client = await getClient();
  client?.capture('$pageview', {
    path,
    $current_url: typeof window !== 'undefined' ? window.location.href : path,
  });
}

/**
 * Record a custom product event (tool click, search, outbound link, ...).
 * This is the signal that powers curation decisions.
 */
export async function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const client = await getClient();
  client?.capture(event, properties);
}
