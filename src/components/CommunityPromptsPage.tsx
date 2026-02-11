import React from 'react';
import CommunityPrompts from './CommunityPrompts';
import PageHeader from './PageHeader';
import { MessageSquare } from 'lucide-react';
import SEO from './SEO';

const CommunityPromptsPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-12 pb-12 bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="Community AI Prompts | Collective AI Tools"
        description="Discover, rate, and share the best AI prompts for coding, writing, and productivity. Curated by the community."
      />
      
      <PageHeader 
        title="Prompts Library"
        description="Discover, rate, and share the best AI prompts for coding, writing, and productivity."
        icon={MessageSquare}
        gradient="from-pink-500 to-rose-500"
      />
      
      <CommunityPrompts showHeader={false} />
    </div>
  );
};

export default CommunityPromptsPage;
