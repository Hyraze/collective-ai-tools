/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useEffect, useRef } from 'react';
import ExternalToolsErrorBoundary from './ExternalToolsErrorBoundary';
import SEO from './SEO';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData, generateAIFriendlyStructuredData } from '../lib/seoUtils';

const ExternalTools: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Loads the existing external tools functionality
   */
  const loadExternalTools = async () => {
    try {
      // Import and initialize the existing external tools logic
      const { initializeExternalTools } = await import('../lib/externalTools');
      if (containerRef.current) {
        await initializeExternalTools(containerRef.current);
      }
    } catch (error) {
      console.error('Failed to load external tools:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">⚠️</div>
              <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Failed to load external tools</h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">Something went wrong while loading the external tools directory.</p>
              <button onclick="location.reload()" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                Try Again
              </button>
            </div>
          </div>
        `;
      }
    }
  };

  useEffect(() => {
    loadExternalTools();
  }, []);

  return (
    <>
      <SEO
        title="Tools - Curated AI Tools | Collective AI Tools"
        description="Discover the best AI tools and resources from around the web. A comprehensive, searchable directory of AI applications for productivity, creativity, and development."
        keywords="AI tools, artificial intelligence, productivity, automation, machine learning, tools, AI directory"
        url="https://collectiveai.tools/"
        type="website"
        structuredData={[generateWebsiteStructuredData(), generateBreadcrumbStructuredData(['Tools']), generateAIFriendlyStructuredData()]}
        aiFriendly={true}
        tags={['AI Tools', 'Productivity', 'Automation', 'Machine Learning', 'Development', 'Artificial Intelligence', 'Workflow Automation', 'AI Agents', 'Data Fusion', 'Visual Programming', 'AI Ethics']}
        section="Technology"
        publishedTime="2024-01-01T00:00:00Z"
        modifiedTime={new Date().toISOString()}
      />
      <ExternalToolsErrorBoundary onRetry={() => {
        // Retry loading external tools
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          loadExternalTools();
        }
      }}>
        <div ref={containerRef} id="external-tools-root" className="w-full external-tools-content pt-18" />
      </ExternalToolsErrorBoundary>
    </>
  );
};

export default ExternalTools;

