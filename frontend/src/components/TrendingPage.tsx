import React from 'react';
import TrendingRepos from './TrendingRepos';
import SEO from './SEO';
import { GitBranch } from 'lucide-react';
import PageHeader from './PageHeader';

const TrendingPage: React.FC = () => {
  return (
    <>
      <SEO 
        title="Trending AI Repos | Collective AI Tools"
        description="Discover the hottest AI projects and libraries on GitHub, updated daily."
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          <PageHeader
            title="Trending AI Repositories"
            description="Stay ahead of the curve with daily trending AI libraries and tools."
            icon={GitBranch}
            gradient="from-green-600 to-teal-500"
          />

          <div className="max-w-5xl mx-auto">
              <TrendingRepos />
          </div>

        </div>
      </div>
    </>
  );
};

export default TrendingPage;
