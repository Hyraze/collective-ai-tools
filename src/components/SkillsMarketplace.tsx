import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  Check,
  GitFork,
  Code,
  Shield,
  Palette,
  Cog,
  Briefcase,
  Cloud,
  Zap,
  Terminal,
  Puzzle,
  Filter,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { API_BASE_URL } from '../lib/api';
import PageHeader from './PageHeader';

interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  repo: string;
  stars: number;
  sourceLang: string;
  installCommand: string;
  compatibleAgents: string[];
  category: string;
  isOfficial: boolean;
  tags: string[];
}

interface SkillCategory {
  id: string;
  name: string;
  description: string;
}

interface SkillsResponse {
  data: Skill[];
  total: number;
  categories: SkillCategory[];
  agentPlatforms: string[];
}

const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  coding: Code,
  security: Shield,
  design: Palette,
  automation: Cog,
  productivity: Briefcase,
  infrastructure: Cloud,
  performance: Zap,
};

const categoryColors: Record<string, string> = {
  coding: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  security: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  automation: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  productivity: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  infrastructure: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  performance: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
};

const agentColors: Record<string, string> = {
  'Claude Code': 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  OpenCode: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  Cursor: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  Copilot: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
  GPT: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
};

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const SkillsMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('q', search);

    const qs = params.toString();
    const url = qs ? `${API_BASE_URL}/skills?${qs}` : `${API_BASE_URL}/skills`;

    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch skills');
        return res.json();
      })
      .then((json: SkillsResponse) => {
        if (!cancelled) {
          setSkills(json.data);
          setCategories(json.categories);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSkills([]);
          setCategories([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [search, activeCategory]);

  const handleCopy = useCallback((id: string, command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const clearFilters = () => {
    setSearch('');
    setActiveCategory(null);
  };

  const hasFilters = search || activeCategory;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Skills Marketplace"
          description="Discover and install agent skills to supercharge your AI coding workflow."
          icon={Puzzle}
          gradient="from-violet-600 to-indigo-500"
        />

        {/* Search + Filters */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills, authors, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !activeCategory
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
              }`}
            >
              All Skills
            </button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.id] || Filter;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat.id ? null : cat.id)
                  }
                  title={cat.description}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full w-16" />
                    <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full w-20" />
                  </div>
                  <div className="h-9 bg-gray-100 dark:bg-gray-700 rounded-lg w-full" />
                </div>
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-16">
              <Puzzle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No skills found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {hasFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Check back soon for new skills.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {skills.length} skill{skills.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => {
                  const CategoryIcon = categoryIcons[skill.category] || Code;
                  return (
                    <div
                      key={skill.id}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-lg transition-all duration-300 p-6"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0 p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10">
                            <CategoryIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                              {skill.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              by {skill.author}
                              {skill.isOfficial && (
                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-medium">
                                  Official
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                            {formatStars(skill.stars)}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                        {skill.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[skill.category] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {categories.find((c) => c.id === skill.category)?.name || skill.category}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-medium">
                          {skill.sourceLang}
                        </span>
                        {skill.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-500 text-[10px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Compatible Agents */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {skill.compatibleAgents.slice(0, 4).map((agent) => (
                          <span
                            key={agent}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${agentColors[agent] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}
                          >
                            {agent}
                          </span>
                        ))}
                        {skill.compatibleAgents.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-gray-400">
                            +{skill.compatibleAgents.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleCopy(skill.id, skill.installCommand)
                          }
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                          {copiedId === skill.id ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Terminal className="h-3.5 w-3.5" />
                              {skill.installCommand.length > 45
                                ? `${skill.installCommand.slice(0, 42)}...`
                                : skill.installCommand}
                            </>
                          )}
                        </button>
                        <a
                          href={skill.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <GitFork className="h-3.5 w-3.5" />
                          Repo
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-gradient-to-br from-violet-50/80 to-indigo-50/80 dark:from-violet-500/5 dark:to-indigo-500/5 p-8 text-center">
            <Terminal className="h-10 w-10 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Have a skill to share?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              Submit your agent skills to the marketplace. The community can
              discover, install, and build on your work.
            </p>
            <button
              onClick={() => navigate('/skills/submit')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-base hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/25"
            >
              Submit a Skill
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsMarketplace;
