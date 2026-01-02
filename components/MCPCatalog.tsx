/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Search, 
  Filter, 
  Star, 
  Code, 
  Globe, 
  Shield, 
  ChevronDown,
  ExternalLink,
  CheckCircle,
  Users,
  Plus,
  Heart,
  Clock,
  GitBranch,
  Eye,
  MessageSquare
} from 'lucide-react';
import SEO from './SEO';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '../lib/seoUtils';
import { mcpServers, categories, languages } from '../lib/mcpData';


const MCPCatalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedAuth, setSelectedAuth] = useState('All Authentication');
  const [sortBy, setSortBy] = useState<'rating' | 'stars' | 'time'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const filteredServers = useMemo(() => {
    let filtered = mcpServers.filter(server => {
      const matchesSearch = searchTerm === '' || 
        server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        server.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'All Categories' || server.category === selectedCategory;
      const matchesLanguage = selectedLanguage === 'All Languages' || server.language === selectedLanguage;
      const matchesType = selectedType === 'All Types' || server.type === selectedType;
      const matchesLocation = selectedLocation === 'All Locations' || server.location === selectedLocation;
      const matchesAuth = selectedAuth === 'All Authentication' || 
        (selectedAuth === 'Official Certification' && server.isOfficial) ||
        (selectedAuth === 'Unofficial Certification' && !server.isOfficial);

      return matchesSearch && matchesCategory && matchesLanguage && matchesType && matchesLocation && matchesAuth;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'stars':
          return b.stars - a.stars;
        case 'time':
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedLanguage, selectedType, selectedLocation, selectedAuth, sortBy]);

  const totalServers = mcpServers.length;
  const filteredCount = filteredServers.length;

  return (
    <>
      <SEO
        title="MCP Catalog - Discover Top MCP Servers | Collective AI Tools"
        description="Discover and explore the best Model Context Protocol (MCP) servers. Find MCP servers by category, language, and features. Improve your AI workflows with our comprehensive MCP catalog."
        keywords="MCP servers, Model Context Protocol, AI tools, MCP catalog, MCP clients, AI workflows"
        url="https://collectiveai.tools/mcp-catalog"
        type="website"
        structuredData={[generateWebsiteStructuredData(), generateBreadcrumbStructuredData(['MCP Catalog'])]}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MCP Catalog
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
            Discover and integrate Model Context Protocol servers to enhance your AI workflows
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{totalServers.toLocaleString()} Servers</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>Community Driven</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search MCP servers by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Stats and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span> of {totalServers} servers
              </div>
              {(searchTerm || selectedCategory !== 'All Categories' || selectedLanguage !== 'All Languages') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                    setSelectedLanguage('All Languages');
                    setSelectedType('All Types');
                    setSelectedLocation('All Locations');
                    setSelectedAuth('All Authentication');
                  }}
                  className="text-xs"
                >
                  Clear all filters
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'stars' | 'time')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">⭐ By Rating</option>
                <option value="stars">🌟 By Stars</option>
                <option value="time">🕒 By Time</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categories
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Programming Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                >
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="All Types">All Types</option>
                  <option value="MCP Server">MCP Server</option>
                  <option value="MCP Client">MCP Client</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Local">Local</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Authentication Status
                </label>
                <select
                  value={selectedAuth}
                  onChange={(e) => setSelectedAuth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="All Authentication">All Authentication</option>
                  <option value="Official Certification">Official Certification</option>
                  <option value="Unofficial Certification">Unofficial Certification</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Found a total of {filteredCount} results related to MCP servers
          </p>
        </div>

        {/* MCP Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <Card key={server.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                      <Code className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate font-semibold">
                        {server.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {server.isOfficial && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Official
                          </Badge>
                        )}
                        {server.isCertified && (
                          <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs font-medium">
                          {server.language}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(server.githubUrl, '_blank')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="View on GitHub"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {server.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {server.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      {tag}
                    </Badge>
                  ))}
                  {server.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800">
                      +{server.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{server.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{(server.stars / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">
                        {new Date(server.addedDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">{server.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {server.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {server.category}
                    </Badge>
                  </div>
                  <Link to={`/mcp-catalog/${server.id}`}>
                    <Button
                      size="sm"
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">No MCP servers found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              No MCP servers found matching your criteria. Try adjusting your search or filters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Categories');
                  setSelectedLanguage('All Languages');
                  setSelectedType('All Types');
                  setSelectedLocation('All Locations');
                  setSelectedAuth('All Authentication');
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear All Filters
              </Button>
              <Button
                onClick={() => window.open('https://github.com/Hyraze/collective-ai-tools/issues/new?template=add-mcp-server.md', '_blank')}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Suggest a Server
              </Button>
            </div>
          </div>
        )}

        {/* Contributor Section */}
        {filteredServers.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Love the MCP Catalog?</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Help us grow the community! Contribute by adding new MCP servers, improving documentation, or sharing feedback.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => window.open('https://github.com/Hyraze/collective-ai-tools/issues/new?template=add-mcp-server.md', '_blank')}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add MCP Server
                </Button>
                <Button
                  onClick={() => window.open('https://github.com/Hyraze/collective-ai-tools', '_blank')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  Contribute on GitHub
                </Button>
                <Button
                  onClick={() => window.open('https://github.com/Hyraze/collective-ai-tools/discussions', '_blank')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Join Discussion
                </Button>
              </div>
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-500">
                <p>📚 <a href="/MCP_CATALOG_README.md" className="text-blue-600 hover:text-blue-700 underline">Read our contribution guide</a></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MCPCatalog;
