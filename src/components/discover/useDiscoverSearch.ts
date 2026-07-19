import { useEffect, useState } from 'react';
import { SOURCES } from './sources';
import type { DiscoverGroup, GroupStatus } from './types';

const DEBOUNCE_MS = 250;

function makeGroups(status: GroupStatus): DiscoverGroup[] {
  return SOURCES.map(s => ({ type: s.type, label: s.label, seeAllHref: s.seeAllHref, items: [], status }));
}

export function useDiscoverSearch(query: string): { groups: DiscoverGroup[]; isLoading: boolean } {
  const [groups, setGroups] = useState<DiscoverGroup[]>(() => makeGroups('idle'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // Sync search state to an empty query — legitimate external-sync effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGroups(makeGroups('idle'));
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setGroups(makeGroups('loading'));
      const results = await Promise.allSettled(SOURCES.map(s => s.searchItems(q, controller.signal)));
      if (controller.signal.aborted) return;
      setGroups(SOURCES.map((s, i) => {
        const r = results[i];
        const base = { type: s.type, label: s.label, seeAllHref: s.seeAllHref };
        if (r.status === 'fulfilled') {
          return { ...base, items: r.value, status: r.value.length ? 'success' : 'empty' };
        }
        return { ...base, items: [], status: 'error' };
      }));
      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { groups, isLoading };
}
