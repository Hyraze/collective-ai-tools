import React, { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Category, Tag } from '../../types/tools';

interface ToolFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  allCategories: Category[];
  showFavorites: boolean;
  onToggleFavorites: () => void;
  activeTags: Set<string>;
  onToggleTag: (tag: string) => void;
  allTags: Tag[];
  onClearFilters: () => void;
}

const ToolFilters: React.FC<ToolFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  allCategories,
  showFavorites,
  onToggleFavorites,
  activeTags,
  onToggleTag,
  allTags,
  onClearFilters
}) => {
  const [showAllTags, setShowAllTags] = useState(false);

  // Split tags into "Quick" (top 15) and "All" (rest)
  const quickTags = allTags.slice(0, 15);
  const remainingTags = allTags.slice(15);
  const hasRemainingTags = remainingTags.length > 0;

  return (
    <div className="mb-12 space-y-8">
      {/* Search and Main Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="search"
            placeholder="Search for a tool..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex gap-2">
          {/* Category Select */}
          <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {allCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.tools.length})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Favorites Toggle */}
          <button
            onClick={onToggleFavorites}
            className={`
              inline-flex items-center justify-center px-4 py-3 border rounded-xl font-medium transition-all duration-200 whitespace-nowrap
              ${showFavorites 
                ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
            title={showFavorites ? 'Show all tools' : 'Show only favorites'}
          >
            <svg 
              className="w-5 h-5 sm:mr-2" 
              fill={showFavorites ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            <span className="hidden sm:inline">{showFavorites ? 'All' : 'Favorites'}</span>
          </button>

          {/* Clear Button */}
          {(searchTerm || selectedCategory || showFavorites || activeTags.size > 0) && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium hover:bg-gray-50 transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 whitespace-nowrap"
              title="Clear all filters"
            >
              <X className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
          Quick Filters
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          {quickTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onToggleTag(tag.name)}
              className={`
                px-3.5 py-1.5 text-[13px] font-medium rounded-full border transition-all duration-200
                ${activeTags.has(tag.name)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200 hover:-translate-y-px dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }
              `}
            >
              {tag.name}
              {/* <span className="ml-1.5 opacity-60 text-xs">({tag.count})</span> */}
            </button>
          ))}

          {hasRemainingTags && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className={`
                px-3.5 py-1.5 text-[13px] font-medium rounded-full border border-dashed transition-all duration-200
                ${showAllTags
                  ? 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-transparent border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 dark:border-gray-700 dark:hover:bg-gray-800'
                }
              `}
            >
              {showAllTags ? 'Show Less' : `+${remainingTags.length} More`}
            </button>
          )}
        </div>

        {/* Expanded Tags */}
        {showAllTags && hasRemainingTags && (
          <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {remainingTags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => onToggleTag(tag.name)}
                  className={`
                    flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 w-full
                    ${activeTags.has(tag.name)
                      ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <span className="truncate mr-2">{tag.name}</span>
                  <span className="opacity-50 text-[10px]">{tag.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolFilters;
