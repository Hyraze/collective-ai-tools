/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface BackToTopProps {
  showAfter?: number;
  className?: string;
}

const BackToTop: React.FC<BackToTopProps> = ({ 
  showAfter = 300, 
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-8 right-8 z-50",
        "h-12 w-12 rounded-full",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "transform hover:scale-110",
        "border border-border/20",
        className
      )}
      aria-label="Back to top"
      title="Back to top"
    >
      <ChevronUpIcon className="h-5 w-5 mx-auto" />
    </button>
  );
};

export default BackToTop;