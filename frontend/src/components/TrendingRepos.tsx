import React, { useEffect, useState } from 'react';
import { Star, GitBranch, ExternalLink, RefreshCw, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Repo {
  title: string;
  link: string;
  description: string;
  language: string;
  pubDate: string;
}

const TrendingRepos: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trending-repos');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRepos(data.data || []);
    } catch (err) {
      setError('Could not load trending repos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const parseRepoData = (repo: Repo) => {
      // Attempt to extract metadata from description if API dumps it there
      let cleanDesc = repo.description || '';
      let stars = '';
      let forks = '';

      // Regex to find "Stars: 1234" and "Forks: 123"
      const starsMatch = cleanDesc.match(/Stars:\s*(\d+)/i);
      const forksMatch = cleanDesc.match(/Forks:\s*(\d+)/i);

      if (starsMatch) stars = starsMatch[1];
      if (forksMatch) forks = forksMatch[1];

      // Clean the description of these artifacts
      cleanDesc = cleanDesc.replace(/Language:.*$/, '').replace(/Stars:.*$/, '').trim();

      return {
          ...repo,
          cleanDesc,
          stars,
          forks
      };
  };

  if (error) return (
       <div className="text-center p-8 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
           {error}
           <button onClick={fetchRepos} className="block mx-auto mt-2 text-sm underline">Retry</button>
       </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-6">
           <button 
                onClick={fetchRepos} 
                disabled={loading}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-all",
                    loading && "opacity-70"
                )}
            >
                <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                Refresh
            </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
           Array.from({ length: 9 }).map((_, i) => (
             <div key={i} className="h-48 rounded-2xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 animate-pulse" />
           ))
        ) : (
            repos.map((rawRepo, idx) => {
                const repo = parseRepoData(rawRepo);
                return (
                    <a 
                        key={idx} 
                        href={repo.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-900/10 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div>
                            <div className="flex items-start justify-end gap-3 mb-3">
                                <ExternalLink className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                            </div>

                            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 break-words line-clamp-1">
                                 {repo.title.replace(/\s+/g, '')}
                            </h4>
                            
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed h-[4.5rem]">
                                {repo.cleanDesc}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-auto">
                            <span className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                                repo.language === 'Python' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30' :
                                repo.language === 'TypeScript' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-900/30' :
                                repo.language === 'JavaScript' ? 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30' :
                                repo.language === 'Go' ? 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-900/30' :
                                repo.language === 'Rust' ? 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/30' :
                                'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            )}>
                                <Circle className={cn(
                                    "w-1.5 h-1.5 fill-current",
                                    repo.language ? "opacity-100" : "opacity-0"
                                )} />
                                {repo.language || 'Unknown'}
                            </span>

                            <div className="flex items-center gap-3">
                                {repo.stars && (
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs font-semibold">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                        {parseInt(repo.stars).toLocaleString()}
                                    </div>
                                )}
                                {repo.forks && (
                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500 text-xs">
                                        <GitBranch className="w-3.5 h-3.5" />
                                        {parseInt(repo.forks).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </a>
                );
            })
        )}
      </div>
      
    </div>
  );
};

export default TrendingRepos;
