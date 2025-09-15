import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, ExternalLink, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface Tool {
  name: string;
  url: string;
  description: string;
  tags: string[];
  addedDate?: string;
  clickCount?: number;
  lastClicked?: string;
}

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (toolName: string) => void;
  onTrackClick: (url: string) => void;
}

const ToolCard = memo<ToolCardProps>(({ tool, isFavorite, onToggleFavorite, onTrackClick }) => {
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(tool.name);
  }, [tool.name, onToggleFavorite]);

  const handleCardClick = useCallback(() => {
    onTrackClick(tool.url);
  }, [tool.url, onTrackClick]);

  const addTrackingParams = (url: string) => {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('utm_source', 'collectiveai.tools');
      urlObj.searchParams.set('utm_medium', 'referral');
      urlObj.searchParams.set('utm_campaign', 'ai_tools_directory');
      return urlObj.toString();
    } catch {
      return url;
    }
  };

  return (
    <Card className="group relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <a
        href={addTrackingParams(tool.url)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleCardClick}
        className="block h-full"
        aria-label={`Visit ${tool.name}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors pr-8">
              {tool.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star 
                className={cn(
                  "h-4 w-4",
                  isFavorite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"
                )} 
              />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="line-clamp-3 mb-4">
            {tool.description}
          </CardDescription>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              <span>Visit Tool</span>
            </div>
            {tool.clickCount && (
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                <Eye className="h-3 w-3" />
                <span>{tool.clickCount}</span>
              </div>
            )}
          </div>
        </CardContent>
      </a>
    </Card>
  );
});

ToolCard.displayName = 'ToolCard';

export default ToolCard;
