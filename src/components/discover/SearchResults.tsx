import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiscoverCard } from './DiscoverCard';
import { useDiscoverSearch } from './useDiscoverSearch';
import { TYPE_ACCENT } from './theme';
import type { DiscoverGroup } from './types';

function GroupBody({ group }: { group: DiscoverGroup }) {
  if (group.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }
  if (group.status === 'error') {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Couldn't load {group.label.toLowerCase()}. Try again.
      </p>
    );
  }
  if (group.status === 'empty') {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No {group.label.toLowerCase()} match your search.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {group.items.map((item) => (
        <DiscoverCard key={`${item.type}-${item.id}`} item={item} />
      ))}
    </div>
  );
}

export function SearchResults({ query }: { query: string }) {
  const { groups } = useDiscoverSearch(query);
  const visible = groups.filter((g) => g.status !== 'idle');

  return (
    <div className="flex flex-col gap-12">
      {visible.map((group) => {
        const accent = TYPE_ACCENT[group.type];
        return (
          <section key={group.type} aria-labelledby={`discover-${group.type}`}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={cn('h-2 w-2 rounded-full', accent.dot)} />
                <h2 id={`discover-${group.type}`} className="text-lg font-bold text-gray-900 dark:text-white">
                  {group.label}
                  {group.status === 'success' && (
                    <span className={cn('ml-2 text-sm font-semibold', accent.text)}>{group.items.length}</span>
                  )}
                </h2>
              </div>
              <Link
                to={group.seeAllHref}
                className={cn('group inline-flex items-center gap-1 text-sm font-medium', accent.text)}
              >
                See all
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <GroupBody group={group} />
          </section>
        );
      })}
    </div>
  );
}
