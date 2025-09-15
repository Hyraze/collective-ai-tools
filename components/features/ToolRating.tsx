import { memo, useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { isFeatureEnabled } from '../../lib/featureFlags';

interface ToolRatingProps {
  toolId: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const ToolRating = memo<ToolRatingProps>(({ 
  toolId, 
  initialRating = 0, 
  onRatingChange,
  className 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Check if rating feature is enabled
  if (!isFeatureEnabled('TOOL_RATINGS')) {
    return null;
  }

  const handleRatingClick = useCallback((newRating: number) => {
    setRating(newRating);
    onRatingChange?.(newRating);
    
    // Track rating event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'tool_rating', {
        tool_id: toolId,
        rating: newRating
      });
    }
  }, [toolId, onRatingChange]);

  const handleMouseEnter = useCallback((newRating: number) => {
    setHoveredRating(newRating);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredRating(0);
  }, []);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((starRating) => (
        <button
          key={starRating}
          type="button"
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          onClick={() => handleRatingClick(starRating)}
          onMouseEnter={() => handleMouseEnter(starRating)}
          onMouseLeave={handleMouseLeave}
          aria-label={`Rate ${starRating} star${starRating > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'w-4 h-4 transition-colors',
              starRating <= (hoveredRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-200'
            )}
          />
        </button>
      ))}
      <span className="text-sm text-gray-500 ml-2">
        {rating > 0 ? `${rating}/5` : 'Rate this tool'}
      </span>
    </div>
  );
});

ToolRating.displayName = 'ToolRating';

export default ToolRating;
