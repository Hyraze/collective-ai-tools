import React from 'react';
import { Tool } from '../../types/tools';
import { Heart, ExternalLink, Scale } from 'lucide-react';


interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (tool: Tool) => void;
  onTrackClick: (tool: Tool) => void;
  isComparing?: boolean;
  onCompareToggle?: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  tool, 
  isFavorite, 
  onToggleFavorite, 
  onTrackClick,
  isComparing = false,
  onCompareToggle
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(tool);
  };

  const handleCardClick = () => {
    onTrackClick(tool);
  };

  const formattedUrl = new URL(tool.url);
  formattedUrl.searchParams.set('utm_source', 'collectiveai.tools');
  formattedUrl.searchParams.set('utm_medium', 'referral');

  return (
    <a
      href={formattedUrl.toString()}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
      onClick={handleCardClick}
    >
      <div className="bg-white dark:bg-[#020817] border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-full flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 break-words">
            {tool.name}
          </h3>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompareToggle?.(tool);
                }}
                className={`
                  p-1.5 rounded-lg border transition-all duration-200 z-10
                  ${isComparing 
                    ? 'bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600' 
                    : 'bg-white/90 border-gray-200 dark:bg-gray-800/90 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                title={isComparing ? "Remove from comparison" : "Add to comparison"}
              >
                <Scale 
                  className={`w-4 h-4 ${isComparing ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`} 
                />
              </button>
              <button
                onClick={handleFavoriteClick}
                className={`
                  p-1.5 rounded-lg border transition-all duration-200 z-10
                  ${isFavorite 
                    ? 'bg-yellow-100 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600' 
                    : 'bg-white/90 border-gray-200 dark:bg-gray-800/90 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`} 
                />
              </button>
            </div>
          </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
          {tool.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tool.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-md">
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium px-2 py-1 rounded-md">
              +{tool.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {/* View count removed */}
          </div>
          
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            Visit Tool
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </a>
  );
};

export default ToolCard;
