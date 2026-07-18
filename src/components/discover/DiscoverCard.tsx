import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { captureEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { DiscoverItem, DiscoverType } from './types';

const ACCENT: Record<DiscoverType, string> = {
  tool: 'text-blue-600 dark:text-blue-400',
  mcp: 'text-emerald-600 dark:text-emerald-400',
  prompt: 'text-rose-600 dark:text-rose-400',
  skill: 'text-purple-600 dark:text-purple-400',
  repo: 'text-amber-600 dark:text-amber-400',
};

export function DiscoverCard({ item }: { item: DiscoverItem }) {
  const onClick = () => captureEvent('discover_click', { type: item.type, id: item.id, title: item.title });

  const body = (
    <div className="group h-full rounded-xl border border-gray-100 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wide', ACCENT[item.type])}>{item.type}</Badge>
        {item.meta && <span className="text-xs text-gray-500 dark:text-gray-400">{item.meta}</span>}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">{item.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.subtitle}</p>
      {item.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
        </div>
      )}
    </div>
  );

  if (item.external) {
    return <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="block h-full">{body}</a>;
  }
  return <Link to={item.href} onClick={onClick} className="block h-full">{body}</Link>;
}
