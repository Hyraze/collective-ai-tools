import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DiscoverCard } from './DiscoverCard';
import type { Source } from './sources';
import type { DiscoverItem } from './types';

type RowState = 'loading' | 'ready' | 'hidden';

export function DiscoverRow({ source }: { source: Source }) {
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [state, setState] = useState<RowState>('loading');

  useEffect(() => {
    const controller = new AbortController();
    source.browseItems(controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        if (result.length === 0) { setState('hidden'); return; }
        setItems(result);
        setState('ready');
      })
      .catch(() => { if (!controller.signal.aborted) setState('hidden'); });
    return () => controller.abort();
  }, [source]);

  if (state === 'hidden') return null;

  return (
    <section aria-labelledby={`row-${source.type}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 id={`row-${source.type}`} className="text-lg font-bold text-gray-900 dark:text-white">{source.label}</h2>
        <Link to={source.seeAllHref} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {state === 'loading' ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 w-64 shrink-0 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {items.map(item => <div key={`${item.type}-${item.id}`} className="w-64 shrink-0 snap-start"><DiscoverCard item={item} /></div>)}
        </div>
      )}
    </section>
  );
}
