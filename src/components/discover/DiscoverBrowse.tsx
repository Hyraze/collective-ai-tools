import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { DiscoverCard } from './DiscoverCard';
import { SOURCES, type SortKey } from './sources';
import { TYPE_ACCENT } from './theme';
import type { DiscoverItem, DiscoverType } from './types';

type Filter = 'all' | DiscoverType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tool', label: 'Tools' },
  { key: 'mcp', label: 'MCP' },
  { key: 'prompt', label: 'Prompts' },
  { key: 'skill', label: 'Skills' },
  { key: 'repo', label: 'Repos' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'newest', label: 'Newest' },
];

function interleave(lists: DiscoverItem[][]): DiscoverItem[] {
  const out: DiscoverItem[] = [];
  const longest = lists.reduce((n, l) => Math.max(n, l.length), 0);
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (list[i]) out.push(list[i]);
  }
  return out;
}

export function DiscoverBrowse() {
  const [groups, setGroups] = useState<Partial<Record<DiscoverType, DiscoverItem[]>>>({});
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('popular');

  useEffect(() => {
    const controller = new AbortController();
    // Loading flag for a data-fetch effect — the canonical setState-in-effect
    // case; not derivable from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('loading');
    Promise.allSettled(SOURCES.map((s) => s.browseItems(controller.signal, sort))).then((results) => {
      if (controller.signal.aborted) return;
      const next: Partial<Record<DiscoverType, DiscoverItem[]>> = {};
      SOURCES.forEach((s, i) => {
        const r = results[i];
        next[s.type] = r.status === 'fulfilled' ? r.value : [];
      });
      setGroups(next);
      setStatus('ready');
    });
    return () => controller.abort();
  }, [sort]);

  const total = useMemo(
    () => SOURCES.reduce((n, s) => n + (groups[s.type] ?? []).length, 0),
    [groups],
  );

  const items =
    filter === 'all'
      ? interleave(SOURCES.map((s) => groups[s.type] ?? []))
      : groups[filter] ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count = f.key === 'all' ? total : (groups[f.key] ?? []).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 hover:bg-black/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.06]',
                )}
              >
                {f.key !== 'all' && <span className={cn('h-1.5 w-1.5 rounded-full', TYPE_ACCENT[f.key].dot)} />}
                {f.label}
                {status === 'ready' && (
                  <span className={cn('text-xs tabular-nums', active ? 'opacity-70' : 'text-gray-400 dark:text-gray-500')}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Sort"
          className="inline-flex items-center rounded-full border border-black/10 p-0.5 dark:border-white/10"
        >
          {SORTS.map((s) => {
            const active = sort === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                aria-pressed={active}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
          Nothing to show right now. Try a search above.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <DiscoverCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
