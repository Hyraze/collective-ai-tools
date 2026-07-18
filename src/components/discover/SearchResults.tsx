import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DiscoverCard } from './DiscoverCard';
import { useDiscoverSearch } from './useDiscoverSearch';
import type { DiscoverGroup } from './types';

function GroupBody({ group }: { group: DiscoverGroup }) {
  if (group.status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}
      </div>
    );
  }
  if (group.status === 'error') {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Couldn't load {group.label.toLowerCase()}. Try again.</p>;
  }
  if (group.status === 'empty') {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No {group.label.toLowerCase()} match your search.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {group.items.map(item => <DiscoverCard key={`${item.type}-${item.id}`} item={item} />)}
    </div>
  );
}

export function SearchResults({ query }: { query: string }) {
  const { groups } = useDiscoverSearch(query);
  const visible = groups.filter(g => g.status !== 'idle');

  return (
    <div className="flex flex-col gap-10">
      {visible.map(group => (
        <section key={group.type} aria-labelledby={`discover-${group.type}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 id={`discover-${group.type}`} className="text-lg font-bold text-gray-900 dark:text-white">
              {group.label}{group.status === 'success' && <span className="text-gray-400"> · {group.items.length}</span>}
            </h2>
            <Link to={group.seeAllHref} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <GroupBody group={group} />
        </section>
      ))}
    </div>
  );
}
