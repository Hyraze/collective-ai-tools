import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import SEO from '@/components/SEO';
import ErrorBoundary from '@/components/ErrorBoundary';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '@/lib/seoUtils';
import { Input } from '@/components/ui/input';
import { DiscoverHero } from './DiscoverHero';
import { SearchResults } from './SearchResults';
import { DiscoverRow } from './DiscoverRow';
import { SOURCES } from './sources';

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';

  const onChange = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value); else next.delete('q');
    setParams(next, { replace: true });
  };

  return (
    <ErrorBoundary>
      <SEO
        title="Discover AI Tools, MCP Servers, Prompts & Skills | Collective AI Tools"
        description="Search and browse the AI ecosystem — curated tools, MCP servers, prompts, skills, and trending repositories in one place."
        url="https://collectiveai.tools/"
        type="website"
        structuredData={[generateWebsiteStructuredData(), generateBreadcrumbStructuredData(['Discover'])]}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-10">
        <DiscoverHero />
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={query}
            onChange={e => onChange(e.target.value)}
            placeholder="Search everything…"
            aria-label="Search the AI ecosystem"
            className="pl-12 h-14 text-base rounded-2xl"
          />
        </div>
        {query
          ? <SearchResults query={query} />
          : <div className="flex flex-col gap-12">{SOURCES.map(s => <DiscoverRow key={s.type} source={s} />)}</div>}
      </div>
    </ErrorBoundary>
  );
}
