import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAITools, AITool } from '@/lib/api';
import ToolCard from './tools/ToolCard';
import CompactToolCard from './tools/CompactToolCard';
import ToolFilters from './tools/ToolFilters';
import { Tool, Category, Tag } from '@/types/tools';
import SEO from './SEO';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData, generateAIFriendlyStructuredData } from '@/lib/seoUtils';
import { Button } from './ui/button';
import { Loader2, AlertCircle, Scale, X, ArrowRight, Wrench } from 'lucide-react';
import PageHeader from './PageHeader';

import { useNavigate } from 'react-router-dom';

// Helpers
const FAVORITES_KEY = 'favoriteTools';
const CLICKS_KEY = 'toolClicks';
const COMPARE_LIMIT = 2;

const ExternalTools: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');

  // State
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [showFavorites, setShowFavorites] = useState(false);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    initialCategory ? new Set([initialCategory]) : new Set()
  );

  // Persistent State (Favorites & Clicks)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [comparingTools, setComparingTools] = useState<Tool[]>([]);
  const navigate = useNavigate();

  // Actions
  const toggleCompare = (tool: Tool) => {
    setComparingTools(prev => {
      const isAlreadyComparing = prev.some(t => t.name === tool.name);
      if (isAlreadyComparing) {
        return prev.filter(t => t.name !== tool.name);
      }
      if (prev.length >= COMPARE_LIMIT) {
        return [prev[0], tool];
      }
      return [...prev, tool];
    });
  };

  const startComparison = () => {
    if (comparingTools.length < 2) return;
    const slugA = comparingTools[0].name.toLowerCase().replace(/\s+/g, '-');
    const slugB = comparingTools[1].name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/compare/${slugA}-vs-${slugB}`);
  };

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch all tools to enable client-side filtering/categorization
        // In a real large-scale app, we'd use server-side filtering, 
        // but for < 1000 tools, client-side is faster and smoother UI.
        const response = await fetchAITools({ limit: 1000 });
        
        // Load local storage data
        const savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        const savedClicks = JSON.parse(localStorage.getItem(CLICKS_KEY) || '{}');
        
        setFavorites(new Set(savedFavorites));

        // Map API tools to internal Tool interface and merge analytics
        const mappedTools: Tool[] = response.data.map((t: AITool) => ({
          _id: t._id,
          name: t.name,
          url: t.website || t.url,
          description: t.description,
          tags: t.tags || [],
          category: t.category?.name || 'Uncategorized',
          addedDate: t.addedDate,
          clickCount: savedClicks[t.website || t.url]?.count || 0,
          views: 0 // Placeholder if backend API doesn't return view count yet
        }));

        setTools(mappedTools);
      } catch (err) {
        console.error('Failed to load tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update URL tags when category changes
  useEffect(() => {
    if (initialCategory && !selectedCategory) {
       setSelectedCategory(initialCategory);
       setExpandedCategories(new Set([initialCategory]));
    }
  }, [initialCategory]);


  // Actions
  const toggleFavorite = (tool: Tool) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tool.name)) {
      newFavorites.delete(tool.name);
    } else {
      newFavorites.add(tool.name);
    }
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
  };

  const trackClick = (tool: Tool) => {
    const savedClicks = JSON.parse(localStorage.getItem(CLICKS_KEY) || '{}');
    const url = tool.url;
    
    if (!savedClicks[url]) {
      savedClicks[url] = { count: 0, lastClicked: new Date().toISOString() };
    }
    savedClicks[url].count += 1;
    savedClicks[url].lastClicked = new Date().toISOString();
    
    localStorage.setItem(CLICKS_KEY, JSON.stringify(savedClicks));
    
    // Update local state to reflect click immediately
    setTools(prev => prev.map(t => 
      t.url === url ? { ...t, clickCount: savedClicks[url].count } : t
    ));

    // Optional: Send to GA
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'click', {
        event_category: 'outbound_link',
        event_label: url,
        value: 'tool_click'
      });
    }
  };

  const toggleTag = (tag: string) => {
     setActiveTags(prev => {
       const next = new Set(prev);
       if (next.has(tag)) next.delete(tag);
       else next.add(tag);
       return next;
     });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowFavorites(false);
    setActiveTags(new Set());
    setExpandedCategories(new Set());
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };


  // Derived Data (Memoized)
  const { filteredCategories, allCategories, allTags, trendingTools, recentTools } = useMemo(() => {
    if (tools.length === 0) return { filteredCategories: [], allCategories: [], allTags: [], trendingTools: [], recentTools: [] };

    // 1. Calculate Aggregates (Tags, Categories)
    const categoryMap = new Map<string, Tool[]>();
    const tagCountMap = new Map<string, number>();

    tools.forEach(tool => {
       const cat = tool.category || 'Uncategorized';
       if (!categoryMap.has(cat)) categoryMap.set(cat, []);
       categoryMap.get(cat)?.push(tool);

       tool.tags.forEach(tag => {
          tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
       });
    });

    const categoriesList: Category[] = Array.from(categoryMap.entries()).map(([name, categoryTools]) => ({
       name,
       id: name, // Using name as ID for simplicity
       tools: categoryTools
    })).sort((a, b) => a.name.localeCompare(b.name));

    const tagsList: Tag[] = Array.from(tagCountMap.entries())
       .map(([name, count]) => ({ name, count }))
       .sort((a, b) => b.count - a.count);

    // 2. Filter Tools
    const filteredCats = categoriesList.map(cat => {
      const filteredTools = cat.tools.filter(tool => {
        // Search
        const searchLower = searchTerm.toLowerCase();
        if (searchTerm && !tool.name.toLowerCase().includes(searchLower) && !tool.description.toLowerCase().includes(searchLower)) {
           return false;
        }
        
        // Category
        if (selectedCategory && tool.category !== selectedCategory) return false;

        // Favorites
        if (showFavorites && !favorites.has(tool.name)) return false;

        // Tags
        if (activeTags.size > 0 && !tool.tags.some(t => activeTags.has(t))) return false;

        return true;
      });
      return { ...cat, tools: filteredTools };
    }).filter(cat => cat.tools.length > 0);
    
    // 3. Trending & Recent (Base on ALL tools, not filtered)
    const sortedByClicks = [...tools].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)).slice(0, 10);
    const sortedByDate = [...tools].sort((a, b) => {
       const dateA = new Date(a.addedDate || 0).getTime();
       const dateB = new Date(b.addedDate || 0).getTime();
       return dateB - dateA;
    }).slice(0, 10);

    return {
      filteredCategories: filteredCats,
      allCategories: categoriesList,
      allTags: tagsList,
      trendingTools: sortedByClicks,
      recentTools: sortedByDate
    };
  }, [tools, searchTerm, selectedCategory, showFavorites, activeTags, favorites]);


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load tools</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
             onClick={() => window.location.reload()}
             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Tools - Curated AI Tools | Collective AI Tools"
        description="Discover the best AI tools and resources from around the web."
        url="https://collectiveai.tools/tools"
        type="website"
        structuredData={[
          generateWebsiteStructuredData(), 
          generateBreadcrumbStructuredData(['Tools']), 
          generateAIFriendlyStructuredData()
        ]}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <PageHeader 
             title="Tools Directory"
             description="Discover and explore the most powerful AI tools and agents across the ecosystem."
             icon={Wrench}
          />

          {/* New Filter Component */}
          <ToolFilters
             searchTerm={searchTerm}
             onSearchChange={setSearchTerm}
             selectedCategory={selectedCategory}
             onCategoryChange={setSelectedCategory}
             allCategories={allCategories}
             showFavorites={showFavorites}
             onToggleFavorites={() => setShowFavorites(!showFavorites)}
             activeTags={activeTags}
             onToggleTag={toggleTag}
             allTags={allTags}
             onClearFilters={clearFilters}
          />

          {isLoading ? (
             <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
             </div>
          ) : (
            <>
              {/* Filtered Results */}
              {filteredCategories.length > 0 ? (
                <div className="space-y-16">
                  {filteredCategories.map(category => (
                    <section key={category.id} id={category.id} className="scroll-mt-24">
                      <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {category.name}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {category.tools.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {category.tools.slice(0, expandedCategories.has(category.id) ? undefined : 8).map(tool => (
                          <ToolCard
                             key={tool.name}
                             tool={tool}
                             isFavorite={favorites.has(tool.name)}
                             onToggleFavorite={toggleFavorite}
                             onTrackClick={trackClick}
                             isComparing={comparingTools.some(t => t.name === tool.name)}
                             onCompareToggle={toggleCompare}
                          />
                        ))}
                      </div>

                      {/* Expand/Collapse Button */}
                      {category.tools.length > 8 && (
                        <div className="mt-8 flex justify-center">
                          <button
                            onClick={() => toggleCategoryExpand(category.id)}
                            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            {expandedCategories.has(category.id) ? (
                              <>Show Less <span className="rotate-180 transform transition-transform">▼</span></>
                            ) : (
                              <>View {category.tools.length - 8} more <span className="transition-transform group-hover:translate-y-0.5">▼</span></>
                            )}
                          </button>
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tools found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
              )}

              {/* Trending & Recent Sections (Only show when no active search/filters) */}
              {!searchTerm && !selectedCategory && !showFavorites && activeTags.size === 0 && (
                <div className="mt-24 pt-12 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {/* Recent */}
                   <div>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fresh Arrivals</h3>
                      </div>
                      <div className="space-y-3">
                        {recentTools.slice(0, 5).map(tool => (
                          <CompactToolCard key={tool.name} tool={tool} onTrackClick={trackClick} />
                        ))}
                      </div>
                   </div>

                   {/* Trending */}
                   <div>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Popular Tools</h3>
                      </div>
                      <div className="space-y-3">
                        {trendingTools.slice(0, 5).map((tool, index) => (
                          <CompactToolCard key={tool.name} tool={tool} rank={index + 1} onTrackClick={trackClick} />
                        ))}
                      </div>
                   </div>
                </div>
              )}
            </>
          )}
          
        </div>
      </div>

      {/* Comparison Tray */}
      {comparingTools.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
               <div className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Scale className="w-5 h-5" />
               </div>
               <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {comparingTools.map((tool) => (
                    <div 
                      key={tool.name} 
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-full pl-3 pr-1 py-1 whitespace-nowrap"
                    >
                      <span className="text-sm font-medium">{tool.name}</span>
                      <button 
                         onClick={() => toggleCompare(tool)}
                         className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                         <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                  {comparingTools.length < COMPARE_LIMIT && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic px-2">
                      Select {COMPARE_LIMIT - comparingTools.length} more to compare
                    </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-2">
               {comparingTools.length > 1 ? (
                 <Button 
                    onClick={startComparison}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/20"
                 >
                    Compare Now <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               ) : (
                 <Button 
                    variant="ghost" 
                    onClick={() => setComparingTools([])}
                    className="text-gray-500 hover:text-red-500"
                 >
                    Clear All
                 </Button>
               )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExternalTools;
