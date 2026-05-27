import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  titleRef?: React.RefObject<HTMLHeadingElement>;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon,
  gradient = "from-blue-600 to-purple-600",
  titleRef
}) => {
  return (
    <div className="text-center mb-10 sm:mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Icon className="h-8 w-8 text-blue-600 shrink-0" />
        <h1 
          ref={titleRef}
          className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          {title}
        </h1>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
         {description}
      </p>
    </div>
  );
};

export default PageHeader;
