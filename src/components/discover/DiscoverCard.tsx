import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { captureEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { TYPE_ACCENT } from './theme';
import type { DiscoverItem } from './types';

function monogram(title: string): string {
  const words = title.replace(/^[^a-z0-9]+/i, '').split(/[\s/_-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || '?';
}

export function DiscoverCard({ item }: { item: DiscoverItem }) {
  const accent = TYPE_ACCENT[item.type];
  const onClick = () =>
    captureEvent('discover_click', { type: item.type, id: item.id, title: item.title });

  const body = (
    <div
      className={cn(
        'group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-4',
        'border border-black/[0.06] dark:border-white/10',
        'bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl',
        'shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        accent.ring,
        accent.glow,
      )}
    >
      <span className={cn('absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-80', accent.bar)} />
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold tracking-tight text-white shadow-sm transition-transform duration-300 group-hover:scale-105',
            accent.bar,
          )}
        >
          {monogram(item.title)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider', accent.text)}>{item.type}</span>
            {item.meta && (
              <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
                {item.meta}
              </span>
            )}
          </div>
          <h3 className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold text-gray-900 dark:text-white">
            <span className="truncate">{item.title}</span>
            {item.verified && (
              <span className={cn('inline-flex shrink-0 items-center', accent.text)} title="Verified">
                <BadgeCheck aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Verified</span>
              </span>
            )}
          </h3>
        </div>
      </div>
      <p className="line-clamp-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400">
        {item.subtitle}
      </p>
      {item.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-white/[0.06] dark:text-gray-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const wrapper = 'block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={wrapper}>
        {body}
      </a>
    );
  }
  return (
    <Link to={item.href} onClick={onClick} className={wrapper}>
      {body}
    </Link>
  );
}
