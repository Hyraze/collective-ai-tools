/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Search, 
  Filter, 
  Code, 
  Globe, 
  ChevronDown,
  ExternalLink,
  Terminal,
  User,
  ArrowUpDown,
  Database,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import PageHeader from './PageHeader';
import SEO from './SEO';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '@/lib/seoUtils';
import { fetchMCPServers, fetchFilters, MCPServer, FilterOption } from '@/lib/api';

const MCPCatalog: React.FC = () => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // Slug
  const [selectedType, setSelectedType] = useState('all'); // 'server' | 'client' | 'all'
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Data States
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [displayedServers, setDisplayedServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularMCP, setPopularMCP] = useState<MCPServer[]>([]);
  const [trendingMCP, setTrendingMCP] = useState<MCPServer[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Initial Data Load (Filters & Highlights)
  useEffect(() => {
    fetchFilters().then(data => {
        setCategories(data.categories);
    }).catch(console.error);

    const fetchHighlights = async () => {
        try {
            const [popRes, trendRes] = await Promise.all([
                fetch('/api/mcp?limit=3&sort=popular'),
                fetch('/api/mcp?limit=3&sort=trending')
            ]);
            const popData = await popRes.json();
            const trendData = await trendRes.json();
            if (popData.data) setPopularMCP(popData.data);
            if (trendData.data) setTrendingMCP(trendData.data);
        } catch (error) {
            console.error('Failed to fetch highlights:', error);
        }
    };
    fetchHighlights();
  }, []);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchTerm);
        setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Servers on Filter Change
  useEffect(() => {
    setLoading(true);
    
    // Convert 'all' to undefined for API
    const typeParam = selectedType === 'all' ? undefined : (selectedType === 'MCP Client' ? 'client' : 'server');
    const catParam = selectedCategory === 'all' ? undefined : selectedCategory;
    
    fetchMCPServers({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        category: catParam,
        type: typeParam,
        sort: sortBy
    }).then(response => {
        setDisplayedServers(response.data);
        setTotalPages(response.pagination.totalPages);
        setLoading(false);
    }).catch(err => {
        console.error('Failed to fetch servers:', err);
        setLoading(false);
        setDisplayedServers([]);
    });

  }, [debouncedSearch, selectedCategory, selectedType, sortBy, page]);

  // Handlers
  const handlePageChange = (newPage: number) => {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = useNavigate();

  const handleCardClick = (server: MCPServer) => {
      const serverId = server.id || server._id;
      navigate(`/mcp-catalog/${serverId}`);
  };

  const renderHighlightItem = (item: MCPServer, type: 'popular' | 'trending') => (
    <div 
      key={item._id || item.id}
      onClick={() => handleCardClick(item)}
      className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${type === 'popular' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
        {type === 'popular' ? <TrendingUp className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
          {item.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
          {item.description}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-all transform group-hover:translate-x-1" />
    </div>
  );

  const renderCard = (server: MCPServer) => (
    <Card 
        key={server._id || server.id} 
        className="group hover:shadow-lg transition-all duration-300 h-full border hover:border-blue-200 dark:hover:border-blue-800 flex flex-col cursor-pointer"
        onClick={() => handleCardClick(server)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
              {server.type === 'MCP Client' ? <Terminal className="h-5 w-5" /> : <Code className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold truncate" title={server.name}>
                  {server.name}
                </CardTitle>
                {server.isOfficial && (
                  <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    Official
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {server.author}
                </span>
                {(server.stars || 0) > 0 && (
                   <span className="flex items-center gap-1 ml-2 text-yellow-500">
                     ★ {server.stars?.toLocaleString()}
                   </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col pt-0 pb-4">
        <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[2.5em]">
          {server.description}
        </CardDescription>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {server.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 font-normal">
              {tag}
            </Badge>
          ))}
          {(server.tags?.length || 0) > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 border-gray-200 dark:border-gray-700 font-normal">
              +{server.tags!.length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
             <span className="flex items-center gap-1">
                 {server.category?.name && (
                     <Badge variant="secondary" className="text-[10px] px-1.5 h-5 font-normal opacity-70">
                        {server.category.name}
                     </Badge>
                 )}
             </span>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {server.url && (
                <a
                  href={server.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Visit Website"
                >
                  <Globe className="h-4 w-4" />
                </a>
            )}
            <a
              href={server.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="View Source"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEO
        title="MCP Catalog - Clients & Servers | Collective AI Tools"
        description="Discover Model Context Protocol (MCP) clients and servers. A curated list of tools for building AI context-aware applications."
        keywords="MCP servers, MCP clients, Model Context Protocol, AI tools"
        url="https://collectiveai.tools/mcp-catalog"
        type="website"
        structuredData={[generateWebsiteStructuredData(), generateBreadcrumbStructuredData(['MCP Catalog'])]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12 pt-12">
        {/* Header */}
        <PageHeader 
            title="MCP Catalog"
            description="Discover Model Context Protocol (MCP) clients and servers for your AI agents."
            icon={Database}
        />

        {/* Search and Filters */}
        <div className="sticky top-20 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-transparent border-gray-200 dark:border-gray-700"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 px-4 flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            <div className="relative w-48 hidden md:block">
               <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="w-full pl-10 h-10 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md text-sm cursor-pointer appearance-none bg-none dark:bg-gray-900 dark:text-gray-100"
               >
                 <option value="newest">Newest Added</option>
                 <option value="rating">Review Rating</option>
                 <option value="stars">GitHub Stars</option>
                 <option value="name">Name (A-Z)</option>
               </select>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                      setSelectedType(e.target.value);
                      setPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Types</option>
                  <option value="MCP Server">MCP Server</option>
                  <option value="MCP Client">MCP Client</option>
                </select>
              </div>
              
              <div className="space-y-1 md:hidden">
                <label className="text-xs font-medium text-gray-500">Sort By</label>
                <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                 <option value="newest">Newest Added</option>
                 <option value="rating">Review Rating</option>
                 <option value="stars">GitHub Stars</option>
                 <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content Sections */}
        {loading ? (
             <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : displayedServers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
             No results matching your filters.
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {displayedServers.map(renderCard)}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                     <Button 
                       variant="outline" 
                       disabled={page <= 1} 
                       onClick={() => handlePageChange(page - 1)}
                     >
                        Previous
                     </Button>
                     <span className="flex items-center text-sm text-gray-600">
                        Page {page} of {totalPages}
                     </span>
                     <Button 
                       variant="outline" 
                       disabled={page >= totalPages} 
                       onClick={() => handlePageChange(page + 1)}
                     >
                        Next
                     </Button>
                </div>
            )}
            
          </div>
        )}

        {/* Highlights Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 border-t border-gray-100 dark:border-gray-800 pt-12">
            <div>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular Resources</h3>
                </div>
                <div className="space-y-3">
                    {popularMCP.length > 0 ? (
                        popularMCP.map(item => renderHighlightItem(item, 'popular'))
                    ) : (
                        [1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)
                    )}
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending MCP Tools</h3>
                </div>
                <div className="space-y-3">
                    {trendingMCP.length > 0 ? (
                        trendingMCP.map(item => renderHighlightItem(item, 'trending'))
                    ) : (
                        [1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default MCPCatalog;
