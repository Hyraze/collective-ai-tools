import { memo, useMemo } from 'react';
import ToolCard from './ToolCard';

interface Tool {
  name: string;
  url: string;
  description: string;
  tags: string[];
  addedDate?: string;
  clickCount?: number;
  lastClicked?: string;
}

interface VirtualizedToolListProps {
  tools: Tool[];
  favorites: Set<string>;
  onToggleFavorite: (toolName: string) => void;
  onTrackClick: (url: string) => void;
  className?: string;
}

const VirtualizedToolList = memo<VirtualizedToolListProps>(({ 
  tools, 
  favorites, 
  onToggleFavorite, 
  onTrackClick,
  className 
}) => {
  // Memoize the tool cards to prevent unnecessary re-renders
  const toolCards = useMemo(() => {
    return tools.map((tool) => (
      <ToolCard
        key={tool.name}
        tool={tool}
        isFavorite={favorites.has(tool.name)}
        onToggleFavorite={onToggleFavorite}
        onTrackClick={onTrackClick}
      />
    ));
  }, [tools, favorites, onToggleFavorite, onTrackClick]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className || ''}`}>
      {toolCards}
    </div>
  );
});

VirtualizedToolList.displayName = 'VirtualizedToolList';

export default VirtualizedToolList;
