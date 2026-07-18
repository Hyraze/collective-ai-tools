/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project API key. Safe to expose in the client bundle. */
  readonly VITE_POSTHOG_KEY?: string;
  /** PostHog host. Defaults to https://us.i.posthog.com when unset. */
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
