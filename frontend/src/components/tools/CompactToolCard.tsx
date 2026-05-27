import React from 'react';
import { Tool } from '../../types/tools';
import { ExternalLink } from 'lucide-react';

interface CompactToolCardProps {
  tool: Tool;
  rank?: number;
  onTrackClick: (tool: Tool) => void;
}

const CompactToolCard: React.FC<CompactToolCardProps> = ({ tool, rank, onTrackClick }) => {
  const handleCardClick = () => {
    onTrackClick(tool);
  };

  // Safe date handling
  const daysAgo = tool.addedDate && !isNaN(new Date(tool.addedDate).getTime())
    ? Math.floor((Date.now() - new Date(tool.addedDate).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  const timeDisplay = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;

  const formatViews = (n?: number) => {
    if (!n) return '';
    if (n >= 1000) return `${(n / 1000).toFixed(1)  }k`;
    return n.toString();
  };

  const formattedUrl = new URL(tool.url);
  formattedUrl.searchParams.set('utm_source', 'collectiveai.tools');
  formattedUrl.searchParams.set('utm_medium', 'referral');

  return (
    <a
      href={formattedUrl.toString()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleCardClick}
      className="group relative flex items-center gap-4 p-4 pr-12 rounded-2xl bg-white/40 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg min-h-[5.5rem] no-underline"
    >
      <div className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-sm">
        {rank ? `#${rank}` : <ExternalLink className="h-5 w-5" />}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {tool.name}
        </h4>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
          {tool.description}
        </p>

        <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 dark:text-gray-500">
           {tool.tags[0] && (
             <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
               {tool.tags[0]}
             </span>
           )}
           <span>•</span>
           <span>{timeDisplay}</span>
           {tool.views !== undefined && (
             <>
               <span>•</span>
               <span>{formatViews(tool.views)} views</span>
             </>
           )}
        </div>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-300" />
      </div>
    </a>
  );
};

export default CompactToolCard;
